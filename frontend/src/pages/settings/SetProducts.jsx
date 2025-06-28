import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePlus, CircleX, Copy, Currency, Delete, Save, Trash2, UserPlus } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useProductServices } from '../../store/productServices';
import { useAuthStore } from '../../store/authStore'
import { useTypeServices } from '../../store/typeServices'


const SetProduct = () => {
    const { getProductByStoreId, getProductById, removeProduct, updateProduct, createProduct } = useProductServices();
    const { getTypeByCategory } = useTypeServices();
    const storeId = Cookies.get('storeId');
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [productData, setProductData] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showActive, setShowActive] = useState(true);
    const { user } = useAuthStore();
    const [typeList, setTypeList] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const product = await getProductByStoreId(storeId);
                console.log("F: Respuesta de fetch:", product);
                setProductList(product.productList || []);
            } catch (error) {
                console.error('Error fetching product list:', error);
            } finally {
                setLoading(false);
            }
        };
        const fetchTypes = async () => {
            try {
                const auxTypeList = await getTypeByCategory("PRODUCT", storeId);
                //console.log("F: Respuesta de getTypeByCategory:", auxTypeList);
                setTypeList(auxTypeList.typeList || []);
            } catch (error) {
                console.error('Error fetching product list:');
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchProducts();
            fetchTypes();
        }
    }, []);

    useEffect(() => {
        //console.log("Cambio el TypeList: ", typeList)
    }, [typeList]);

    const openNewProductModal = () => {
        setProductData({ name: '' });
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditProductModal = (product) => {
        setProductData({
            ...product,
        });
        setIsEditing(true);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDelete(null);
    };

    const handleSave = async () => {
        try {
            //console.log("F: Voy a crear el siguiente producto: ", productData)
            const payload = {
                ...productData,
            };

            if (isEditing) {
                await updateProduct(productData._id, payload);
                toast.success('Product updated successfully');
            } else {
                await createProduct(payload, storeId, user._id);
                toast.success('Product created successfully');
            }

            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error saving product:');
            toast.error('Error saving product');
        }
    };

    const confirmRemove = async () => {
        try {
            await removeProduct(confirmDelete.id);
            toast.success(`Product ${confirmDelete.name} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error removing product:');
            toast.error('Error removing product');
        }
    };

    const handleDuplicate = async (originalProduct) => {
        try {
            const duplicatedProduct = {
                ...originalProduct,
                name: `${originalProduct.name} - COPY`,
            };

            // Eliminar campos que no deben duplicarse directamente
            delete duplicatedProduct._id;
            delete duplicatedProduct.createdAt;
            delete duplicatedProduct.updatedAt;

            await createProduct(duplicatedProduct, storeId, user._id);
            toast.success(`Product "${duplicatedProduct.name}" duplicated successfully.`);
            window.location.reload();
        } catch (error) {
            console.error('Error duplicating product:');
            toast.error('Error duplicating product');
        }
    };

    const productTypes = [...new Set(productList.map(p => p.type).filter(Boolean))];
    const filteredProducts = productList
        .filter(p => p.isActive === showActive)
        .filter(p => !selectedType || p.type === selectedType)
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));


    if (loading) return <div className="text-slate-800 text-center mt-10">Loading Products...</div>;

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text">
                    Product List
                </h2>

                <div className="flex justify-center mb-4">
                    <button
                        className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewProductModal}
                    >
                        <p>Add Product</p><UserPlus />
                    </button>
                </div>
                <div className="flex justify-center mb-2">
                    <button
                        onClick={() => setShowActive(!showActive)}
                        className="text-sm text-slate-800 hover:text-slate-400 underline"
                    >
                        {showActive ? 'Show Inactive Products' : 'Show Active Products'}
                    </button>
                </div>
                {productTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        <button
                            onClick={() => setSelectedType(null)}
                            className={`px-3 py-1 rounded text-sm ${!selectedType ? 'bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50' : 'bg-slate-600 hover:bg-slate-700 text-slate-100'}`}
                        >
                            All
                        </button>
                        {productTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-3 py-1 rounded text-sm ${selectedType === type ? 'bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50' : 'bg-slate-600 hover:bg-slate-700 text-slate-100'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex justify-center mb-6">
                    <input
                        type="text"
                        placeholder="Search product by name..."
                        className="w-full max-w-md p-2 rounded bg-white text-slate-900 border border-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 px-2">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No Products found</div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="relative text-slate-800 rounded-lg shadow p-4 bg-white border border-slate-300  hover:bg-blue-100 transition-all"
                            >
                                <div className='flex flex-row'>
                                    <div onClick={() => openEditProductModal(product)} className="flex flex-col w-7/8">
                                        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-700">Price: {product.price}</p>
                                        <p className="text-sm text-gray-700">Tax: {product.tax}</p>
                                        <p className="text-sm text-gray-700">Type: {product.type || 'N/A'}</p>
                                    </div>
                                    {product.isActive ? (
                                        <div className='w-1/8 flex flex-col items-center ml-2'>
                                            <button
                                                onClick={() => setConfirmDelete({ id: product._id, name: product.name })}
                                                className="text-red-600 hover:text-red-800"
                                                title="Remove from Store"
                                            >
                                                <Trash2 />
                                            </button>
                                            <button
                                                onClick={() => handleDuplicate(product)}
                                                className="text-blue-600 hover:text-blue-800 mt-2"
                                                title="Duplicate Product"
                                            >
                                                <Copy />
                                                
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await updateProduct(product._id, { isActive: true });
                                                    toast.success(`${product.name} reactivated.`);
                                                    window.location.reload();
                                                } catch (error) {
                                                    console.error('Error reactivating product:', error);
                                                    toast.error('Error reactivating product');
                                                }
                                            }}
                                            className="absolute top-2 right-2 text-green-600 hover:text-green-800"
                                            title="Add to Store"
                                        >
                                            <CirclePlus />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {(modalOpen || confirmDelete) && (
                    <motion.div
                        className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {confirmDelete ? (
                            <motion.div
                                className="bg-sky-50 text-slate-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-xl font-bold mb-6 text-center text-red-400">
                                    Do you really want to remove {confirmDelete.name} from the Store?
                                </h3>
                                <div className="flex justify-around">
                                    <button
                                        className="bg-red-400 hover:bg-red-500 text-slate-800 px-4 py-2 rounded"
                                        onClick={confirmRemove}
                                    >
                                        Yes, Remove
                                    </button>
                                    <button
                                        className="bg-gray-700 hover:bg-gray-600 text-slate-800 px-4 py-2 rounded"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="bg-sky-50 text-slate-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-slate-800"
                                    onClick={closeModal}
                                >
                                    <CircleX />
                                </button>

                                <h3 className="text-2xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text">
                                    {isEditing ? 'Edit Product' : 'New Product'}
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <label className="capitalize">Name:*</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 mt-1 rounded bg-white text-slate-900 border border-slate-300"
                                            value={productData.name || ''}
                                            onChange={(e) =>
                                                setProductData({ ...productData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    {/* Price */}
                                    <div>
                                        <label className="capitalize">Price: *</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-full p-2 mt-1 rounded bg-white text-slate-900 border border-slate-300"
                                            value={productData.price?.toString().replace('.', ',') || ''}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(',', '.');
                                                const price = parseFloat(raw) || 0;
                                                const taxPercent = productData.taxPercent || 0;
                                                const tax = (price * taxPercent) / 100;
                                                setProductData({
                                                    ...productData,
                                                    price,
                                                    tax,
                                                    finalPrice: price + tax,
                                                });
                                            }}
                                        />
                                    </div>

                                    {/* Tax % (editable) */}
                                    <div>
                                        <label className="capitalize">Tax %:</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-full p-2 mt-1 rounded bg-white text-slate-900 border border-slate-300"
                                            value={productData.taxPercent?.toString().replace('.', ',') || ''}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(',', '.');
                                                const taxPercent = parseFloat(raw) || 0;
                                                const price = productData.price || 0;
                                                const tax = (price * taxPercent) / 100;
                                                setProductData({
                                                    ...productData,
                                                    taxPercent,
                                                    tax,
                                                    finalPrice: price + tax,
                                                });
                                            }}
                                        />
                                    </div>

                                    {/* Tax (editable) */}
                                    <div>
                                        <label className="capitalize">Tax (value):</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-full p-2 mt-1 rounded bg-white text-slate-900 border border-slate-300"
                                            value={productData.tax?.toString().replace('.', ',') || ''}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(',', '.');
                                                const tax = parseFloat(raw) || 0;
                                                const price = productData.price || 0;
                                                const taxPercent = price ? (tax / price) * 100 : 0;
                                                setProductData({
                                                    ...productData,
                                                    tax,
                                                    taxPercent,
                                                    finalPrice: price + tax,
                                                });
                                            }}
                                        />
                                    </div>

                                    {/* Final Price (editable) */}
                                    <div>
                                        <label className="capitalize">Final Price:</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-full p-2 mt-1 rounded bg-white text-slate-900 border border-slate-300"
                                            value={productData.finalPrice?.toString().replace('.', ',') || ''}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(',', '.');
                                                const finalPrice = parseFloat(raw) || 0;
                                                const price = productData.price || 0;
                                                const tax = finalPrice - price;
                                                const taxPercent = price ? (tax / price) * 100 : 0;
                                                setProductData({
                                                    ...productData,
                                                    finalPrice,
                                                    tax,
                                                    taxPercent,
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className='mt-2 flex flex-row ml-2'>
                                        <label className="block text-sm font-medium">Product Type:*</label>
                                        <select
                                            name="type"
                                            className="ml-2 w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2"
                                            value={productData.type || ''}
                                            onChange={(e) => setProductData({ ...productData, type: e.target.value })}
                                        >
                                            <option value="">Select a Type</option>
                                            {typeList.map((t) => (
                                                <option key={t.name} value={t.name}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <p>Fields with * are mandatory</p>
                                    </div>
                                    <div className="flex justify-center mt-6">
                                        <button
                                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded flex items-center gap-2"
                                            onClick={handleSave}
                                        >
                                            <p>Save</p><Save />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SetProduct;