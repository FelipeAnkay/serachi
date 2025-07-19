import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleX, Save, Trash2, Truck } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useSupplierServices } from '../../store/supplierServices';
import countries from '../../components/contries.json'


const SetSupplier = () => {
    const { getSupplierList, createSupplier, updateSupplier, removeSupplier, getSupplierEmail } = useSupplierServices();
    const storeId = Cookies.get('storeId');
    const [supplierList, setSupplierList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [supplierData, setSupplierData] = useState({});
    const [emailCheckPhase, setEmailCheckPhase] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                const supplier = await getSupplierList(storeId);
                console.log("getSupplierList: ", supplier)
                const auxSuppList = supplier.supplierList
                setSupplierList(auxSuppList || []);
            } catch (error) {
                console.error('Error fetching supplier list:', error);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchSupplier();
            //console.log("La lista de supplier es: ", supplierList)
        }
    }, []);

    useEffect(() => {
        //console.log("El supplierData es: ", supplierData)
    }, [supplierData]);


    useEffect(() => {
        if (!modalOpen) return; // solo activa listener si el modal está abierto

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closeModal(); // tu función para cerrar el modal
            }
        };
        window.addEventListener('keydown', handleEsc);
        // Cleanup: remover listener cuando modal se cierra o componente desmonta
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [modalOpen]); // se ejecuta cuando cambia modalOpen

    const openNewSupplierModal = () => {
        setSupplierData({ email: '' });
        setEmailCheckPhase(true);
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditSupplierModal = (supplier) => {
        //console.log("El supplier es: ", supplier)
        setsupplierData({
            ...supplier,
        });
        setIsEditing(true);
        setEmailCheckPhase(false);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDelete(null);
    };
    const handleEmailCheck = async () => {
        if (!supplierData.email) return;

        try {
            const res = await getSupplierEmail(supplierData.email, storeId);
            const supplierFound = res.supplierList?.[0];
            console.log("handleEmailCheck supplierFound:", supplierFound);
            if (supplierFound) {
                const alreadyAssigned = supplierFound.storeId?.includes(storeId.toUpperCase());
                const updatedStoreId = alreadyAssigned
                    ? supplierFound.storeId
                    : [...new Set([...supplierFound.storeId, storeId.toUpperCase()])];
                setSupplierData({
                    ...supplierFound,
                    storeId: updatedStoreId,
                });
                setIsEditing(true);
                toast.success('supplier found');
            } else {
                toast.success("supplier not found, you can assign a new supplier");
                setIsEditing(false);
            }

            setEmailCheckPhase(false); // Pasar al formulario completo
        } catch (err) {
            console.error("Error checking supplier by email:", err);
            toast.error("Error checking email");
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...supplierData,
                storeId: storeId,
            };
            console.log("Is Editing? ", isEditing);
            console.log("El payload es: ", payload);
            if (isEditing) {
                await updateSupplier(supplierData.email, storeId, payload);
                toast.success('Supplier updated successfully');
            } else {
                await createSupplier(payload);
                toast.success('Supplier created successfully');
            }

            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error saving supplier:', error);
            toast.error('Error saving supplier');
        }
    };

    const confirmRemove = async () => {
        try {
            await removeSupplier(confirmDelete.supplier, storeId);
            toast.success(`supplier ${confirmDelete.supplier} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error removing supplier:', error);
            toast.error('Error removing supplier');
        }
    };

    if (loading) return <div className="text-slate-800 text-center mt-10">Loading supplier...</div>;

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
                    Supplier List
                </h2>

                <div className="flex flex-col items-center gap-3 mb-4">
                    <button
                        className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewSupplierModal}
                    >
                        <p>Add Supplier</p><Truck />
                    </button>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 rounded bg-white text-slate-900 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>


                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 ml-3 mr-3 mb-3 w-full">
                    {supplierList.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No supplier found</div>
                    ) : (
                        supplierList
                            .filter(supplier => {
                                const term = searchTerm.toLowerCase();
                                return (
                                    supplier.name?.toLowerCase().includes(term) ||
                                    supplier.email?.toLowerCase().includes(term)
                                );
                            })
                            .map((supplier) => (
                                <div
                                    key={supplier._id}
                                    className="relative text-slate-800 rounded-lg shadow p-4 bg-white border border-slate-300 hover:bg-blue-100 transition-all"
                                >
                                    <div onClick={() => openEditPartnerModal(supplier)}>
                                        <p><strong>Name:</strong> {supplier.name}</p>
                                        <p><strong>Email:</strong> {supplier.email}</p>
                                        <p><strong>Phone:</strong> {supplier.phone || 'N/A'}</p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({ supplier: supplier.email })}
                                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                        title="Remove from Store"
                                    >
                                        <Trash2 />
                                    </button>
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
                                    Do you really want to remove {confirmDelete.email} from the Store?
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
                                    {isEditing ? 'Edit supplier' : 'New supplier'}
                                </h3>

                                {emailCheckPhase ? (
                                    <div className="space-y-4">
                                        <label>Supplier Email:</label>
                                        <input
                                            type="email"
                                            className="bg-white text-slate-900 border border-slate-300 rounded w-full p-2"
                                            value={supplierData.email || ''}
                                            onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
                                        />
                                        <button
                                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4"
                                            onClick={handleEmailCheck}
                                        >
                                            {isEditing ? 'Continue' : 'Supplier Search'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-sm">
                                        <div className="space-y-4">
                                            <label>Supplier Email:*</label>
                                            <input
                                                type="email"
                                                className="bg-white text-slate-900 border border-slate-300 rounded w-full p-2"
                                                value={supplierData.email || ''}
                                                onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="">Name:*</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                                value={supplierData.name || ''}
                                                onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="">Phone (+Country Code-Phone):</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                                value={supplierData.phone || ''}
                                                onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="capitalize">National Id or Tax Id:</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                                value={supplierData.nationalId || ''}
                                                onChange={(e) => setSupplierData({ ...supplierData, nationalId: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Country: *</label>
                                            <select
                                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                                value={supplierData.country}
                                                onChange={(e) =>
                                                    setSupplierData({
                                                        ...supplierData,
                                                        country: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="" className="text-slate-900">Select Country</option>
                                                {countries.map((c) => (
                                                    <option key={c.code} value={c.name} className='text-slate-900'>{c.name}</option>
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
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SetSupplier;