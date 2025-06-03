// src/pages/NewIncome.jsx
import { useEffect, useState, useMemo } from "react";
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CirclePlus, Trash2 } from "lucide-react";
import { useSupplierServices } from '../../store/supplierServices';
import { useAuthStore } from '../../store/authStore';
import paymentMethods from '../../components/paymentMethods.json'
import { useExpenseServices } from "../../store/expenseServices";
import countries from '../../components/contries.json';
import SupplierSelector from '../../components/SupplierSelector';


export default function NewExpense() {
    const { createExpense } = useExpenseServices();
    const storeId = Cookies.get('storeId');
    const { getSupplierList, createSupplier } = useSupplierServices();
    const { user } = useAuthStore();
    const [newTag, setNewTag] = useState({ name: '', code: '' });
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        supplierId: "",
        description: "",
        currency: "USD",
        amount: 0,
        tag: [],
        userEmail: user.email || "",
        paymentMethod: "",
        storeId: storeId
    });

    const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        name: "",
        email: "",
        phone: "",
        country: "",
        nationalId: "",
    });

    const [supplier, setSupplier] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        console.log("Estoy en useEffect")
        const fetchSupplier = async () => {
            try {
                setLoading(true);
                const res = await getSupplierList(storeId);
                setSupplier(res.supplierList || []);
                setLoading(false);
            } catch (error) {
                //console.error('Error fetching products:', error);
                setLoading(false);
            }
        }

        if (storeId) {
            // Si hay ID, carga la cotización existente
            fetchSupplier();
        }
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        console.log("El Payload de Expense es", formData)
        if (!formData.amount || !formData.paymentMethod || !formData.supplierId || !formData.date) {
            toast.error("You must complete the mandatory fields");
            return;
        }
        try {
            await createExpense(formData);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Expense Created");
            //Reset
            setFormData({
                date: new Date().toISOString().split("T")[0],
                supplierId: "",
                description: "",
                currency: "USD",
                amount: 0,
                tag: [],
                userEmail: user.email || "",
                paymentMethod: "",
                storeId: storeId
            });
            setShowNewSupplierForm(false);
        } catch (error) {
            toast.error("Error creating expense", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAmountChange = (e) => {
        let value = e.target.value;

        // Eliminar caracteres no numéricos, excepto "." y ","
        value = value.replace(/[^0-9.,]/g, '');

        // Reemplazar múltiples puntos o comas por uno solo
        const decimalCount = value.split(',').length - 1;
        if (decimalCount > 1) {
            value = value.replace(',', '');
        }

        // Si hay más de un punto, eliminar el siguiente
        if (value.indexOf('.') !== value.lastIndexOf('.')) {
            value = value.slice(0, value.lastIndexOf('.') + 1) + value.slice(value.lastIndexOf('.') + 1).replace('.', '');
        }

        // Asegurarse de que no empiece con "0" si no es un "0" único
        if (value.startsWith('0') && value.length > 1 && value[1] !== '.' && value[1] !== ',') {
            value = value.slice(1);
        }

        setFormData(prev => ({ ...prev, amount: value }));
    };

    return (
        <AnimatePresence>
            <motion.div
                className="p-6 max-w-4xl mx-auto bg-blue-950"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <h1 className="text-3xl font-bold mb-6 text-center text-white">New Expense</h1>
                <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6 shadow-sm bg-blue-900 text-white">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium mb-1">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-200 text-blue-950" />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Amount</label>
                            <input
                                type="text"
                                name="amount"
                                value={formData.amount}
                                onChange={handleAmountChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                className="w-full border rounded px-3 py-2 bg-gray-200 text-blue-950"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-200 text-blue-950" />
                    </div>

                    {/* Supplier Section */}
                    <div>
                        <label className="font-medium block mb-2">Supplier</label>
                        <SupplierSelector
                            value={formData.supplierId}
                            onChange={(id) => setFormData(prev => ({ ...prev, supplierId: id }))}
                            storeId={storeId}
                        />
                    </div>

                    {/* TAGS SECTION */}
                    <fieldset className="w-full space-y-4 rounded-2xl border p-4">
                        <legend className="font-bold">Tags</legend>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Name"
                                className="w-1/2 p-2 border border-gray-300 rounded bg-gray-200 text-blue-950"
                                value={newTag.name}
                                onChange={(e) => setNewTag((prev) => ({ ...prev, name: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newTag.name || newTag.code) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                tag: [...(prev.tag || []), newTag],
                                            }));
                                            setNewTag({ name: '', code: '' });
                                        }
                                    }
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Code"
                                className="w-1/2 p-2 border border-gray-300 rounded bg-gray-200 text-blue-950"
                                value={newTag.code}
                                onChange={(e) => setNewTag((prev) => ({ ...prev, code: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newTag.name || newTag.code) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                tag: [...(prev.tag || []), newTag],
                                            }));
                                            setNewTag({ name: '', code: '' });
                                        }
                                    }
                                }}
                                onBlur={() => {
                                    if (newTag.name || newTag.code) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            tag: [...(prev.tag || []), newTag],
                                        }));
                                        setNewTag({ name: '', code: '' });
                                        console.log("Los datos del form son:", formData);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className=""
                                onClick={() => {
                                    if (newTag.name || newTag.code) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            tag: [...(prev.tag || []), newTag],
                                        }));
                                        setNewTag({ name: '', code: '' });
                                    }
                                }}
                            >
                                <CirclePlus className='hover:bg-green-500 rounded-4xl' />
                            </button>
                        </div>

                        <ul className="space-y-1">
                            {(formData.tag || []).map((tag, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between items-center bg-blue-700 rounded px-3 py-2"
                                >
                                    <span>{tag.name} - {tag.code}</span>
                                    <button
                                        type="button"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => {
                                            const updatedTags = formData.tag.filter((_, i) => i !== index);
                                            setFormData((prev) => ({ ...prev, tag: updatedTags }));
                                        }}
                                    >
                                        <Trash2 />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </fieldset>
                    <div className="mt-6">
                        <label className="block font-medium mb-1">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 bg-gray-200 text-blue-950"
                        >
                            <option value="">Select Payment Method</option>
                            {paymentMethods.map((method, index) => (
                                <option key={index} value={method.name}>{method.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-center">
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin w-4 h-4" />
                                    Creating...
                                </span>
                            ) : (
                                "Create Expense"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </AnimatePresence>
    );
}
