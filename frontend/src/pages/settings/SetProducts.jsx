import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePlus, CircleX, Currency, Delete, Save, Trash2, UserPlus } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useProductServices } from '../../store/productServices';
import { useAuthStore } from '../../store/authStore'


const SetProduct = () => {
    const { getProductByStoreId, getProductById, removeProduct, updateProduct, createProduct } = useProductServices();
    const storeId = Cookies.get('storeId');
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [productData, setProductData] = useState({});
    const [emailCheckPhase, setEmailCheckPhase] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showActive, setShowActive] = useState(true);
    const { user } = useAuthStore();
    const [selectedType, setSelectedType] = useState(null);

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

        if (storeId) {
            fetchProducts();
        }
    }, []);


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
            console.log("F: Voy a crear el siguiente producto: ", productData)
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
            console.error('Error saving product:', error);
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
            console.error('Error removing product:', error);
            toast.error('Error removing product');
        }
    };

    const productTypes = [...new Set(productList.map(p => p.type).filter(Boolean))];
    const filteredProducts = productList
        .filter(p => p.isActive === showActive)
        .filter(p => !selectedType || p.type === selectedType);


    if (loading) return <div className="text-white text-center mt-10">Loading Products...</div>;

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-6xl mx-auto bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden"
            >
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                    Product List
                </h2>

                <div className="flex justify-center mb-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewProductModal}
                    >
                        <p>Add Product</p><UserPlus />
                    </button>
                </div>
                <div className="flex justify-center mb-2">
                    <button
                        onClick={() => setShowActive(!showActive)}
                        className="text-sm text-blue-400 hover:text-blue-200 underline"
                    >
                        {showActive ? 'Show Inactive Products' : 'Show Active Products'}
                    </button>
                </div>
                {productTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        <button
                            onClick={() => setSelectedType(null)}
                            className={`px-3 py-1 rounded text-sm ${!selectedType ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            All
                        </button>
                        {productTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-3 py-1 rounded text-sm ${selectedType === type ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-3 mr-3 mb-3">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No Products found</div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="relative bg-white text-black rounded-lg shadow p-4 hover:bg-blue-100 transition-all"
                            >
                                <div onClick={() => openEditProductModal(product)}>
                                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                    <p className="text-sm text-gray-700">Price: {product.price}</p>
                                    <p className="text-sm text-gray-700">Type: {product.type || 'N/A'}</p>
                                    <p className="text-sm text-gray-700">Days of Duration: {product.durationDays || 'N/A'}</p>
                                </div>
                                {product.isActive ? (
                                    <button
                                        onClick={() => setConfirmDelete({ id: product._id, name: product.name })}
                                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                        title="Remove from Store"
                                    >
                                        <Trash2 />
                                    </button>
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
                        ))
                    )}
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {(modalOpen || confirmDelete) && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {confirmDelete ? (
                            <motion.div
                                className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
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
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                        onClick={confirmRemove}
                                    >
                                        Yes, Remove
                                    </button>
                                    <button
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                    onClick={closeModal}
                                >
                                    <CircleX />
                                </button>

                                <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                                    {isEditing ? 'Edit Product' : 'New Product'}
                                </h3>
                                <div className="space-y-4 text-sm">
                                    {["name", "price", "type", "durationDays"].map((field) => (
                                        <div key={field}>
                                            <label className="capitalize">{field}:</label>
                                            <input
                                                type={field === 'birthdate' ? 'date' : 'text'}
                                                className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                                value={productData[field] || ''}
                                                onChange={(e) => setProductData({ ...productData, [field]: e.target.value })}
                                            />
                                        </div>
                                    ))}

                                    <div className="flex justify-center mt-6">
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
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