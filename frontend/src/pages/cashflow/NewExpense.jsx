// src/pages/NewIncome.jsx
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CirclePlus, Trash2 } from "lucide-react";
import { useSupplierServices } from '../../store/supplierServices';
import { useAuthStore } from '../../store/authStore';
import paymentMethods from '../../components/paymentMethods.json'
import { useExpenseServices } from "../../store/expenseServices";
import countries from '../../components/contries.json';

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

    const handleCreateSupplier = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = { ...newSupplier, storeId };
            const response = await createSupplier(payload);

            if (!response || !response.service || !response.service._id) {
                throw new Error("Invalid supplier creation response");
            }
            console.log("La respuesta de createSupplier es: ", response)
            const newSupplierId = response.service._id;

            toast.success("Supplier created successfully");

            // Seleccionar automáticamente el nuevo supplier
            setFormData(prev => ({ ...prev, supplierId: newSupplierId }));
            setShowNewSupplierForm(false);
            setNewSupplier({ name: "", email: "", phone: "", country: "", nationalId: "" });
            setSupplier(prev => [...prev, response.service]);

            // Refrescar lista
            const res = await getSupplierList(storeId);
            setSupplier(res.supplierList || []);
        } catch (error) {
            toast.error("Failed to create supplier");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSupplierChange = (e) => {
        const selectedSupplierId = e.target.value;
        //console.log("Supplier selected:", selectedSupplierId);
        setFormData(prev => ({
            ...prev,
            supplierId: String(selectedSupplierId),
        }));

        /* Verificar si el supplier ID existe en la lista
        const selectedSupplier = supplier.find(p => p._id === selectedSupplierId);
        if (selectedSupplier) {
            console.log("Supplier found:", selectedSupplier);
        } else {
            console.log("Supplier not found in the list.");
        }
            */
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
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-medium">Supplier</label>
                            <button
                                type="button"
                                className="text-sm text-blue-300 hover:underline"
                                onClick={() => setShowNewSupplierForm(!showNewSupplierForm)}
                            >
                                {showNewSupplierForm ? "Cancel" : "Create new supplier"}
                            </button>
                        </div>
                        <select
                            value={formData.supplierId}
                            onChange={handleSupplierChange}
                            className="w-full border px-2 py-1 rounded"
                        >
                            <option value="" className="bg-gray-200 text-blue-950">Select a Supplier</option>
                            {supplier.map(p => (
                                <option key={p._id} value={p._id} className="bg-gray-200 text-blue-950">{p.name}</option>
                            ))}
                        </select>

                        <AnimatePresence>
                            {showNewSupplierForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mt-4 space-y-4 border border-blue-700 p-4 rounded-2xl bg-blue-800"
                                >
                                    <h3 className="text-white text-lg font-semibold">New Supplier</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {["name", "email", "phone", "nationalId"].map((field) => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium mb-1">
                                                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                                                </label>
                                                <input
                                                    key={field}
                                                    type="text"
                                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                                    className="p-2 rounded bg-gray-200 text-blue-950"
                                                    value={newSupplier[field]}
                                                    onChange={(e) => setNewSupplier(prev => ({ ...prev, [field]: e.target.value }))}
                                                />
                                            </div>
                                        ))}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-1">Country</label>
                                            <select
                                                value={newSupplier.country}
                                                onChange={(e) => {
                                                    const selected = e.target.value;
                                                    setNewSupplier(prev => ({ ...prev, country: selected }));
                                                }}
                                                className="w-full border rounded px-3 py-2 bg-gray-200 text-blue-950"
                                            >
                                                <option value="">Select a country</option>
                                                {countries.map((c) => (
                                                    <option key={c.code} value={c.name}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            className={`mt-4 px-4 py-2 rounded text-white font-semibold ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
  `}
                                            onClick={handleCreateSupplier}
                                        >
                                            {isSubmitting ? 'Processing...' : 'Save Supplier'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
