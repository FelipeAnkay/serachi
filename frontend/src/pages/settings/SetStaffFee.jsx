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
import { Plus, Trash2 } from "lucide-react";

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
            console.log("Payload to createPayRate - actualizando: ", form)
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
        setIsEditing(true);
        setEditingId(payrate._id);
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
        <div className="mt-2 mb-2 p-4 space-y-6 max-w-4xl mx-auto bg-blue-950 justify-center border rounded-2xl">
            <h2 className="text-3xl font-semibold text-white justify-center text-center text-bold">Staff Fee Configuration</h2>
            <AnimatePresence>
                <motion.form
                    onSubmit={handleCreate}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 border p-4 rounded-xl shadow-md bg-blue-900"
                >
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-white">Staff Email</label>
                            <select
                                name="staffEmail"
                                value={form.staffEmail}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded text-white"
                            >
                                <option value="" className="text-blue-950">Select</option>
                                {auxStaffList.map((s) => (
                                    <option key={s.email} value={s.email} className="text-blue-950">{s.email}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-white">Product</label>
                            <select
                                name="productId"
                                value={form.productId}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded text-white"
                            >
                                <option value="" className="text-blue-950">Select</option>
                                {productList.map((p) => (
                                    <option key={p._id} value={p._id} className="text-blue-950">{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2 flex flex-row items-center w-full justify-center">
                            <label className="text-white text-lg mr-2">Product Price:</label>
                            <span className="text-2xl font-bold text-white">${price}</span>
                        </div>

                        {/* FEE RULES*/}
                        <div className="col-span-2">
                            <label className="text-white text-lg font-semibold">Fee Rules</label>
                            {form.feeRules.map((rule, index) => (
                                <div key={index} className="flex flex-wrap gap-2 items-end mb-2">
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-white">Timeframe</label>
                                        <select
                                            name="timeframe"
                                            value={rule.timeframe}
                                            onChange={(e) => handleRuleChange(index, "timeframe", e.target.value)}
                                            className="w-full border px-2 py-1 rounded text-white"
                                        >
                                            <option value="">Select</option>
                                            {timeframes.map(tf => (
                                                <option key={tf.code} value={tf.code} className="text-blue-950">{tf.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                        <label className="text-white">Operator</label>
                                        <select
                                            name="operator"
                                            value={rule.operator}
                                            onChange={(e) => handleRuleChange(index, "operator", e.target.value)}
                                            className="w-full border px-2 py-1 rounded text-white"
                                        >
                                            <option value="">Select</option>
                                            {operators.map(op => (
                                                <option key={op.name} value={op.name} className="text-blue-950">{op.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                        <label className="text-white">Value</label>
                                        <input
                                            type="number"
                                            value={rule.value}
                                            onChange={(e) => handleRuleChange(index, "value", Number(e.target.value))}
                                            className="w-full border px-2 py-1 rounded bg-gray-200"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                        <label className="text-white">
                                            Fee | {(price > 0 ? ((rule.fee / price) * 100).toFixed(1) : 0)}%
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            value={rule.fee === 0 ? "" : rule.fee}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const numericValue = value === "" ? 0 : Number(value);
                                                handleRuleChange(index, "fee", numericValue);
                                            }}
                                            className="w-full border px-2 py-1 rounded bg-gray-200"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFeeRule(index)}
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                    >
                                        <Trash2/>
                                    </button>
                                </div>

                            ))}
                            <button
                                type="button"
                                onClick={addFeeRule}
                                className="text-white rounded ml-2"
                            >
                                <Plus className="bg-green-600 rounded  hover:bg-green-700 " />
                            </button>
                        </div>
                        <div>
                            <label className="text-white">Initial Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded text-white"
                            />
                        </div>

                        <div>
                            <label className="text-white">End Date</label>
                            <input
                                type="date"
                                name="finishDate"
                                value={form.finishDate}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded text-white"
                            />
                        </div>
                    </div>
                    <div className="">
                        <label className="text-white">
                            Priority
                        </label>
                        <input
                            type="number"
                            inputMode="numeric"
                            name="priority"
                            value={form.priority === 0 ? "" : form.priority}
                            onChange={handleChange}
                            className="w-full border px-2 py-1 rounded bg-gray-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {isEditing ? "Edit Fee" : "Create Fee"}
                    </button>
                </motion.form>
            </AnimatePresence>

            <div>
                <h3 className="text-lg font-medium mb-2 text-white">Created Staff Fees</h3>
                {/* Buscadores */}
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by Staff Email"
                        value={staffFilter}
                        onChange={(e) => setStaffFilter(e.target.value)}
                        className="p-2 rounded bg-neutral-700 text-white w-full"
                    />
                    <input
                        type="text"
                        placeholder="Search by Product Name"
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        className="p-2 rounded bg-neutral-700 text-white w-full"
                    />
                </div>
                <div className="mt-4 space-y-4">
                    {filteredPayrates.map((rate) => (
                        <motion.div key={rate._id} layout className="p-4 bg-neutral-800 rounded-xl space-y-2 text-white">
                            <div className="flex justify-between items-center">
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
                                    <li key={i} className="bg-neutral-700 rounded p-2">{r.timeframe} {r.operator} {r.value} → ${r.fee}</li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SetStaffFee;
