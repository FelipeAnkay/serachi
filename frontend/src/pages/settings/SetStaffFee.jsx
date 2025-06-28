import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { usePayRateServices } from "../../store/payrateServices";
import { useStaffServices } from "../../store/staffServices";
import { useProductServices } from "../../store/productServices";
import { useAuthStore } from "../../store/authStore"; // para userEmail y storeId
import timeframes from "../../components/timeframes.json"
import operators from "../../components/operators.json"
import { Plus, SearchCheck, Trash2 } from "lucide-react";
import ProductSelect from '../../components/ProductSelect';

const SetStaffFee = () => {
    const { user } = useAuthStore();
    const { createPayrate, getPayrateList, updatePayrate, removePayrate } = usePayRateServices();
    const { getProductByStoreId } = useProductServices();
    const { getStaffList } = useStaffServices();
    const storeId = Cookies.get('storeId');
    const [payrates, setPayrates] = useState([]);
    const [auxStaffList, setAuxStaffList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [form, setForm] = useState({
        staffEmail: "",
        productId: "",
        feeRules: [],
        startDate: "",
        finishDate: "",
        priority: "",
    });
    const [currency, setCurrency] = useState("USD");
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [staffFilter, setStaffFilter] = useState("");
    const [productFilter, setProductFilter] = useState("");

    /* Variables para duplicación de reglas */
    const [duplicateModal, setDuplicateModal] = useState(false);
    const [originStaff, setOriginStaff] = useState("");
    const [destinationStaff, setDestinationStaff] = useState("");
    const [tempGroupedRules, setTempGroupedRules] = useState({});
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [finishDate, setFinishDate] = useState("");
    const [priority, setPriority] = useState(0);

    const fetchData = async () => {
        const staffRes = await getStaffList(storeId);
        //console.log("Respuesta de getStaffList: ", staffRes)
        const productRes = await getProductByStoreId(storeId);
        //console.log("Respuesta de getProductByStoreId: ", productRes)
        const rateRes = await getPayrateList(storeId);
        //console.log("Respuesta de getPayrateList: ", rateRes)
        setAuxStaffList(staffRes.staffList);
        setProductList(productRes.productList);
        setPayrates(rateRes?.payrateList || []);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const selectedProduct = productList.find(p => p._id === form.productId);
    const price = selectedProduct?.price || 0;
    const percentage = price ? ((form.staffFee / price) * 100).toFixed(2) : "0";

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRuleChange = (index, field, value) => {
        const updatedRules = [...form.feeRules];
        updatedRules[index][field] = value;
        setForm(prev => ({ ...prev, feeRules: updatedRules }));
    };

    const addFeeRule = () => {
        setForm(prev => ({
            ...prev,
            feeRules: [...prev.feeRules, { timeframe: "", operator: "", value: 1, fee: 0 }]
        }));
    };

    const removeFeeRule = (index) => {
        const updatedRules = [...form.feeRules];
        updatedRules.splice(index, 1);
        setForm(prev => ({ ...prev, feeRules: updatedRules }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        //console.log("El form es: ", form)
        if (!form.staffEmail || !form.productId || !form.feeRules || !form.startDate) return alert("Fill all the mandatory fields");

        if (isEditing) {
            //console.log("Payload to createPayRate - actualizando: ", form)
            await updatePayrate(editingId, form)
        } else {
            const newPayrate = {
                ...form,
                currency: "USD",
                userEmail: user.email,
                storeId: storeId,
            };
            //console.log("Payload to createPayRate - creando: ",newPayrate)
            await createPayrate(newPayrate);
        }

        const rateRes = await getPayrateList(storeId);
        setPayrates(rateRes?.payrateList || []);
        setForm({
            staffEmail: "",
            productId: "",
            feeRules: [],
            startDate: "",
            finishDate: "",
            priority: "",
        });
        setIsEditing(false);
        setEditingId("")
        toast.success("Staff Fee added successfully")
    };

    const handleEdit = (payrate) => {
        setForm({
            staffEmail: payrate.staffEmail,
            productId: payrate.productId,
            feeRules: payrate.feeRules || [],
            startDate: payrate.startDate?.split("T")[0],
            finishDate: payrate.finishDate?.split("T")[0] || "",
            priority: payrate.priority || "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsEditing(true);
        setEditingId(payrate._id);
    };

    const updateGroupedRule = (productId, index, key, value) => {
        const updated = { ...tempGroupedRules };
        updated[productId][index][key] = value;
        setTempGroupedRules(updated);
    };

    const removeGroupedRule = (productId, index) => {
        const updated = { ...tempGroupedRules };
        updated[productId].splice(index, 1);
        if (updated[productId].length === 0) delete updated[productId];
        setTempGroupedRules(updated);
    };

    const handleOriginChange = (staffEmail) => {
        setOriginStaff(staffEmail);
        setDestinationStaff("");

        const staffRates = payrates.filter(p => p.staffEmail === staffEmail);
        const grouped = {};

        staffRates.forEach(rate => {
            if (!grouped[rate.productId]) grouped[rate.productId] = [];
            grouped[rate.productId] = [...grouped[rate.productId], ...rate.feeRules];
        });

        setTempGroupedRules(grouped);
    };

    const handleReset = (e) => {
        setForm({
            staffEmail: "",
            productId: "",
            feeRules: [],
            startDate: "",
            finishDate: "",
            priority: "",
        });
        setIsEditing(false);
        setEditingId("")
    };

    const handleDelete = async (id) => {
        console.log("Entre a handleDelete ", id)
        if (confirm("Are you sure you want to delete this fee?")) {
            await removePayrate(id);
            const rateRes = await getPayrateList(storeId);
            setPayrates(rateRes?.payrateList || []);
            toast.success("Staff Fee deleted");
        }
    };



    const filteredPayrates = payrates.filter((rate) => {
        const staffMatch = rate.staffEmail.toLowerCase().includes(staffFilter.toLowerCase());
        const productName = productList.find(p => p._id === rate.productId)?.name || "";
        const productMatch = productName.toLowerCase().includes(productFilter.toLowerCase());
        return staffMatch && productMatch;
    });

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h2 className="text-3xl font-semibold text-[#00C49F] text-center mb-5">Staff Fee Configuration</h2>
                <AnimatePresence>
                    <motion.form
                        onSubmit={handleCreate}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 border border-gray-300 p-4 rounded-xl shadow-md bg-white w-full"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-800">
                            <div className="mt-2">
                                <label className="block text-sm font-medium mb-1">Staff Email:</label>
                                <select
                                    name="staffEmail"
                                    value={form.staffEmail}
                                    onChange={handleChange}
                                    className="w-full border px-2 py-2 rounded text-slate-900 bg-white"
                                >
                                    <option value="" className="text-slate-900">Select</option>
                                    {auxStaffList.map((s) => (
                                        <option key={s.email} value={s.email} className="text-slate-900">{s.email}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-slate-800">
                                <ProductSelect
                                    productList={productList}
                                    customService={form}
                                    setCustomService={(data) => setForm(prev => ({ ...prev, ...data }))}
                                    setNameAutoGenerated={() => { }}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-center gap-2">
                                <label className="text-slate-800 text-lg">Product Price:</label>
                                <span className="text-2xl font-bold text-slate-800">${price}</span>
                            </div>

                            {/* FEE RULES */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-slate-800 text-lg font-semibold">Fee Rules</label>
                                {form.feeRules.map((rule, index) => (
                                    <div key={index} className="flex flex-wrap gap-2 items-end mb-2">
                                        <div className="flex-1 min-w-[120px]">
                                            <label className="text-slate-800">Timeframe</label>
                                            <select
                                                value={rule.timeframe}
                                                onChange={(e) => handleRuleChange(index, "timeframe", e.target.value)}
                                                className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                                            >
                                                <option value="">Select</option>
                                                {timeframes.map(tf => (
                                                    <option key={tf.code} value={tf.code} className="text-slate-800">{tf.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1 min-w-[80px]">
                                            <label className="text-slate-800">Operator</label>
                                            <select
                                                value={rule.operator}
                                                onChange={(e) => handleRuleChange(index, "operator", e.target.value)}
                                                className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                                            >
                                                <option value="">Select</option>
                                                {operators.map(op => (
                                                    <option key={op.name} value={op.name} className="text-slate-800">{op.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1 min-w-[80px]">
                                            <label className="text-slate-800">Value</label>
                                            <input
                                                type="number"
                                                value={rule.value}
                                                onChange={(e) => handleRuleChange(index, "value", Number(e.target.value))}
                                                className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[80px]">
                                            <label className="text-slate-800">
                                                Fee | {(price > 0 ? ((rule.fee / price) * 100).toFixed(1) : 0)}%
                                            </label>
                                            <input
                                                type="number"
                                                value={rule.fee === 0 ? "" : rule.fee}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleRuleChange(index, "fee", value === "" ? 0 : Number(value));
                                                }}
                                                className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFeeRule(index)}
                                            className="text-red-500 px-2 py-1 rounded hover:bg-red-100"
                                        >
                                            <Trash2 />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addFeeRule}
                                    className="text-slate-800 ml-2"
                                >
                                    <Plus className="bg-green-600 p-1 rounded hover:bg-green-700" />
                                </button>
                            </div>

                            <div>
                                <label className="text-slate-800">Initial Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="text-slate-800">End Date</label>
                                <input
                                    type="date"
                                    name="finishDate"
                                    value={form.finishDate}
                                    onChange={handleChange}
                                    className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-800">Priority</label>
                            <input
                                type="number"
                                name="priority"
                                value={form.priority === 0 ? "" : form.priority}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className={`mt-4 ${isEditing ? 'bg-[#3BA0AC] hover:bg-[#6BBCC5] text-slate-800' : 'bg-[#118290] hover:bg-[#0d6c77]'}  text-slate-100 px-4 py-2 rounded w-full sm:w-auto`}
                            >
                                {isEditing ? "Save Fee" : "Create Fee"}
                            </button>
                            {isEditing ? (
                                <button
                                    type="button"
                                    className={`mt-4 bg-red-400 hover:bg-red-600  text-slate-800 px-4 py-2 rounded w-full sm:w-auto ml-2`}
                                    onClick={handleReset}
                                >
                                    Cancel
                                </button>
                            ) : ""}
                            <button
                                type="button"
                                onClick={() => setDuplicateModal(true)}
                                title="Create rules based on existing ones"
                                className="bg-slate-600 hover:bg-slate-700 text-slate-100 px-2 py-2 rounded w-full sm:w-auto ml-2"
                            >
                                Duplicate Rules
                            </button>
                        </div>
                    </motion.form>
                </AnimatePresence>

                <div className="w-full mt-10">
                    <h3 className="text-2xl font-medium mb-2 text-[#00C49F] text-center">Created Staff Fees</h3>
                    <div className="flex flex-col gap-2 mb-4 border rounded-2xl px-4 py-4 bg-white">
                        <span className="text-slate-800 font-semibold text-lg">Search Terms:</span>

                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex flex-col md:flex-row flex-grow gap-2 w-full">
                                <input
                                    type="text"
                                    placeholder="Search by Staff Email"
                                    value={staffFilter}
                                    onChange={(e) => setStaffFilter(e.target.value)}
                                    className="p-2 rounded border border-slate-300 bg-white text-slate-900 flex-1"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by Product Name"
                                    value={productFilter}
                                    onChange={(e) => setProductFilter(e.target.value)}
                                    className="p-2 rounded border border-slate-300 bg-white text-slate-900 flex-1"
                                />
                            </div>
                            <div className="flex justify-center items-center text-slate-800">
                                <SearchCheck className="text-3xl cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                        {filteredPayrates.map((rate) => (
                            <motion.div key={rate._id} layout className="p-4 bg-white border border-slate-300 rounded-xl space-y-2 ">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <p><strong>Staff:</strong> {rate.staffEmail}</p>
                                        <p><strong>Product:</strong> {productList.find(p => p._id === rate.productId)?.name}</p>
                                        <p><strong>Start:</strong> {rate.startDate?.split("T")[0]} <strong>End:</strong> {rate.finishDate?.split("T")[0]}</p>
                                        <p><strong>Priority:</strong> {rate.priority}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(rate)} className="text-blue-400 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(rate._id)} className="text-red-400 hover:underline">Delete</button>
                                    </div>
                                </div>
                                <ul className="mt-2 space-y-1 text-sm">
                                    {rate.feeRules?.map((r, i) => (
                                        <li key={i} className="bg-slate-200 text-slate-900 rounded p-2">{r.timeframe} {r.operator} {r.value} → ${r.fee}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                    {duplicateModal && (

                        <div className="fixed inset-0 bg-black/95 z-50 flex justify-center items-center">
                            <div className="bg-blue-900 p-6 rounded-xl max-w-3xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
                                <h2 className="text-slate-800 text-2xl font-semibold text-center">Duplicate Staff Rules</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-slate-800">Origin Staff</label>
                                        <select
                                            value={originStaff}
                                            onChange={(e) => handleOriginChange(e.target.value)}
                                            className="w-full px-2 py-1 rounded bg-sky-50 text-slate-800"
                                        >
                                            <option value="">Select</option>
                                            {auxStaffList.map(s => (
                                                <option key={s.email} value={s.email}>{s.email}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-slate-800">Destination Staff</label>
                                        <select
                                            value={destinationStaff}
                                            onChange={(e) => setDestinationStaff(e.target.value)}
                                            className="w-full px-2 py-1 rounded bg-sky-50 text-slate-800"
                                        >
                                            <option value="">Select</option>
                                            {auxStaffList
                                                .filter(s => s.email !== originStaff)
                                                .map(s => (
                                                    <option key={s.email} value={s.email}>{s.email}</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-slate-800">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-2 py-1 rounded bg-sky-50 text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-800">Finish Date</label>
                                        <input
                                            type="date"
                                            value={finishDate}
                                            onChange={(e) => setFinishDate(e.target.value)}
                                            className="w-full px-2 py-1 rounded bg-sky-50 text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-800">Priority</label>
                                        <input
                                            type="number"
                                            value={priority}
                                            onChange={(e) => setPriority(parseInt(e.target.value))}
                                            className="w-full px-2 py-1 rounded bg-sky-50 text-slate-800"
                                        />
                                    </div>
                                </div>

                                {Object.entries(tempGroupedRules).map(([productId, rules]) => {
                                    const product = productList.find(p => p._id === productId);
                                    return (
                                        <div key={productId} className="bg-sky-50 p-4 rounded-xl mt-4 space-y-2">
                                            <h3 className="text-slate-800 font-bold">{product?.name || productId}</h3>
                                            {rules.map((rule, idx) => (
                                                <div key={idx} className="flex flex-wrap items-end gap-2">
                                                    <select
                                                        value={rule.timeframe}
                                                        onChange={(e) => updateGroupedRule(productId, idx, "timeframe", e.target.value)}
                                                        className="bg-blue-700 text-slate-800 px-2 py-1 rounded"
                                                    >
                                                        {timeframes.map(tf => (
                                                            <option key={tf.code} value={tf.code}>{tf.name}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={rule.operator}
                                                        onChange={(e) => updateGroupedRule(productId, idx, "operator", e.target.value)}
                                                        className="bg-blue-700 text-slate-800 px-2 py-1 rounded"
                                                    >
                                                        {operators.map(op => (
                                                            <option key={op.name} value={op.name}>{op.name}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        value={rule.value}
                                                        onChange={(e) => updateGroupedRule(productId, idx, "value", Number(e.target.value))}
                                                        className="px-2 py-1 rounded bg-gray-100"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={rule.fee}
                                                        onChange={(e) => updateGroupedRule(productId, idx, "fee", Number(e.target.value))}
                                                        className="px-2 py-1 rounded bg-gray-100"
                                                    />
                                                    <button
                                                        onClick={() => removeGroupedRule(productId, idx)}
                                                        className="bg-red-600 text-slate-800 px-2 py-1 rounded hover:bg-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}

                                <div className="flex justify-between mt-6">
                                    <button
                                        onClick={() => {
                                            setDuplicateModal(false);
                                            setOriginStaff("");
                                            setDestinationStaff("");
                                            setTempGroupedRules({});
                                        }}
                                        className="bg-gray-600 text-slate-800 px-4 py-2 rounded hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!destinationStaff) return;

                                            for (const [productId, feeRules] of Object.entries(tempGroupedRules)) {
                                                if (feeRules.length === 0) continue;

                                                // 1. Eliminar las reglas anteriores de este staff y producto
                                                const existing = payrates.find(
                                                    (p) => p.staffEmail === destinationStaff && p.productId === productId
                                                );
                                                if (existing) {
                                                    handleDelete(existing._id);
                                                }

                                                // 2. Crear nueva regla para este staff y producto
                                                await createPayrate({
                                                    staffEmail: destinationStaff,
                                                    productId,
                                                    feeRules,
                                                    startDate,
                                                    finishDate,
                                                    priority,
                                                    currency: "USD",
                                                    userEmail: user.email,
                                                    storeId: storeId,
                                                });
                                            }

                                            // Reset modal
                                            setDuplicateModal(false);
                                            setOriginStaff("");
                                            setDestinationStaff("");
                                            setTempGroupedRules({});
                                            setStartDate(new Date().toISOString().split("T")[0]);
                                            setFinishDate("");
                                            setPriority(0);
                                            fetchData(); // Refresca la lista principal
                                        }}
                                        className="bg-green-600 text-slate-800 px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        Duplicate
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SetStaffFee;
