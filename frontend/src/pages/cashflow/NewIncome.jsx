// src/pages/NewIncome.jsx
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { useIncomeServices } from "../../store/incomeServices";
import { PlusCircle, Loader2, CirclePlus, Trash2 } from "lucide-react";
import { usePartnerServices } from '../../store/partnerServices';
import { useProductServices } from '../../store/productServices';
import { useQuoteServices } from '../../store/quoteServices';
import { useAuthStore } from '../../store/authStore';
import paymentMethods from '../../components/paymentMethods.json'

export default function NewIncome() {
    const { createIncome, isLoading } = useIncomeServices();
    const storeId = Cookies.get('storeId');
    const { getPartnerList } = usePartnerServices();
    const { getProductByStoreId } = useProductServices();
    const { getQuoteByCustomerEmail } = useQuoteServices();
    const { user } = useAuthStore();
    const [newTag, setNewTag] = useState({ name: '', code: '' });

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        customerEmail: "",
        partnerId: "",
        quoteId: "",
        productList: [],
        currency: "USD",
        amount: 0,
        tag: [],
        userEmail: user.email || "",
        paymentMethod: "",
        storeId: storeId
    });

    const [partners, setPartners] = useState([]);
    const [products, setProducts] = useState([]);
    const [quotes, setQuotes] = useState([]);

    const [showPartnerSelect, setShowPartnerSelect] = useState(false);
    const [showProductSelect, setShowProductSelect] = useState(false);
    const [showQuoteSelect, setShowQuoteSelect] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddPartner = async () => {
        if (!partners.length) {
            const res = await getPartnerList(storeId);
            setPartners(res.partnerList || []);
        }
        setShowPartnerSelect(true);
    };

    const handleAddQuote = async (customerEmail) => {

        //console.log("Entre a handleAddQuote: ", customerEmail);
        if (!customerEmail) return;

        try {
            const res = await getQuoteByCustomerEmail(customerEmail, storeId);
            //console.log("Respuesta de getQuoteByCustomerEmail: ", res);
            setQuotes(res.quote || []);
            setShowQuoteSelect(true);
        } catch (error) {
            alert("Error al buscar cotizaciones para este cliente.");
        }
    };

    const handleAddProduct = async () => {
        if (!products.length) {
            const res = await getProductByStoreId(storeId);
            setProducts(res.productList || []);
        }
        setShowProductSelect(true);
    };

    const handleSelectProduct = (e) => {
        const selectedId = e.target.value;
        const selectedProduct = products.find(p => p._id === selectedId);
        if (selectedProduct) {
            setFormData(prev => ({
                ...prev,
                productList: [
                    ...prev.productList,
                    {
                        productID: selectedProduct._id,
                        productName: selectedProduct.name,
                        Qty: 1,
                        productUnitaryPrice: selectedProduct.price || 0,
                        productFinalPrice: selectedProduct.price || 0
                    }
                ]
            }));
        }
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // meses 0-indexed
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    const handleProductChange = (index, field, value) => {
        const updated = [...formData.productList];
        updated[index][field] = field.includes("Price") ? parseFloat(value) : value;
        if (["Qty", "productUnitaryPrice"].includes(field)) {
            updated[index].productFinalPrice = updated[index].Qty * updated[index].productUnitaryPrice;
        }
        setFormData((prev) => ({ ...prev, productList: updated }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            //console.log("El Payload de Income es", formData)
            await createIncome(formData);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Income Created");
            //Reset
            setFormData({
                date: new Date().toISOString().split("T")[0],
                customerEmail: "",
                partnerId: "",
                quoteId: "",
                productList: [],
                currency: "USD",
                amount: 0,
                tag: [],
                userEmail: user.email || "",
                paymentMethod: "",
                storeId: storeId
            });
            setQuotes([]);
            setPartners([]);
            setShowPartnerSelect(false);
            setShowProductSelect(false);
            setShowQuoteSelect(false);

        } catch (error) {
            toast.error("Error creating income");
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

    const handleRemoveProduct = (index) => {
        const updatedList = [...formData.productList];
        updatedList.splice(index, 1);
        setFormData({ ...formData, productList: updatedList });
    };

    return (
        <AnimatePresence>
            <motion.div
                className="p-6 max-w-4xl mx-auto bg-blue-950"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <h1 className="text-3xl font-bold mb-6 text-center text-white">New Income</h1>
                <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6 shadow-sm bg-blue-900 text-white">
                    <div>
                        <label className="block font-medium mb-1">Customer Email</label>
                        <input
                            type="email"
                            name="customerEmail"
                            value={formData.customerEmail}
                            onChange={handleChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            }}
                            className="w-full border rounded px-3 py-2 bg-gray-200 text-blue-950"
                        />
                    </div>
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

                    {/* Quote */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-medium">Quote</label>
                            <button
                                type="button"
                                onClick={() => handleAddQuote(formData.customerEmail)}
                                disabled={!formData.customerEmail}
                                className={`flex items-center text-sm ${formData.customerEmail ? "text-blue-300" : "text-gray-400 cursor-not-allowed"}`}
                            >
                                <PlusCircle className="w-4 h-4 mr-1" /> Add Quote
                            </button>
                        </div>
                        {showQuoteSelect && (
                            <select
                                value={formData.quoteId}
                                onChange={(e) => setFormData(prev => ({ ...prev, quoteId: e.target.value }))}
                                className="w-full border px-2 py-1 rounded"
                            >
                                <option value="" className="bg-gray-200 text-blue-950">Select a Quote</option>
                                {quotes.map(q => (
                                    <option key={q._id} value={q._id} className="bg-gray-200 text-blue-950">{q.customerEmail || q._id} - IN: {formatDateDisplay(q.dateIn)} - OUT:{formatDateDisplay(q.dateOut)}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Partner */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-medium">Partner</label>
                            <button type="button" onClick={handleAddPartner} className="flex items-center text-sm text-blue-300">
                                <PlusCircle className="w-4 h-4 mr-1" /> Add Partner
                            </button>
                        </div>
                        {showPartnerSelect && (
                            <select
                                value={formData.partnerId}
                                onChange={(e) => setFormData(prev => ({ ...prev, partnerId: e.target.value }))}
                                className="w-full border px-2 py-1 rounded"
                            >
                                <option value="" className="bg-gray-200 text-blue-950">Select a Partner</option>
                                {partners.map(p => (
                                    <option key={p._id} value={p._id} className="bg-gray-200 text-blue-950">{p.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Products */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-medium">Products</label>
                            <button type="button" onClick={handleAddProduct} className="flex items-center text-sm text-blue-300">
                                <PlusCircle className="w-4 h-4 mr-1" /> Add Product
                            </button>
                        </div>
                        {showProductSelect && (
                            <select onChange={handleSelectProduct} className="w-full border px-2 py-1 rounded mb-4">
                                <option value="" className="bg-gray-200 text-blue-950">Select a Product</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id} className="bg-gray-200 text-blue-950">{p.name}</option>
                                ))}
                            </select>
                        )}
                        <div className="space-y-4">
                            {formData.productList.map((product, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-end md:space-x-2 space-y-2 md:space-y-0 mb-4">
                                    <div className="flex-1">
                                        <p>Name: {product.productName}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p>Quantity:</p>
                                        <input
                                            type="number"
                                            step="1"
                                            min="0"
                                            placeholder="Quantity"
                                            value={product.Qty}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || /^\d+$/.test(value)) {
                                                    handleProductChange(index, "Qty", value);
                                                }
                                            }}
                                            className="border px-2 py-1 rounded w-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p>Unitary Price:</p>
                                        <input
                                            type="number"
                                            placeholder="Unitary Price"
                                            value={product.productUnitaryPrice}
                                            onChange={(e) => handleProductChange(index, "productUnitaryPrice", e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className="border px-2 py-1 rounded w-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p>Final Price:</p>
                                        <input
                                            type="number"
                                            placeholder="Final Price"
                                            value={product.productFinalPrice}
                                            disabled
                                            className="bg-blue-950 border px-2 py-1 rounded w-full"
                                        />
                                    </div>
                                    <div className="flex md:items-end">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProduct(index)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Remove Product"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                        <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin w-4 h-4" />
                                    Creating...
                                </span>
                            ) : (
                                "Create Income"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </AnimatePresence>
    );
}
