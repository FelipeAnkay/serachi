import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, CircleX, Delete, Handshake, Save, Trash2, UserPlus } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import typeCategory from '../../components/typeCategory.json'
import { useTypeServices } from '../../store/typeServices';


const SetTypes = () => {
    const { getTypeList, createType, updateType } = useTypeServices();
    const storeId = Cookies.get('storeId');
    const [typeList, setTypeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [typeData, setTypeData] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        const fetchType = async () => {
            try {
                const types = await getTypeList(storeId);
                console.log("Respuesta de getTypeList: ", types);
                setTypeList(types.typeList || []);
            } catch (error) {
                console.error('Error fetching partner list:', error);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchType();
        }
    }, []);

    useEffect(() => {
        console.log("El typeData es: ", typeData)
    }, [typeData]);


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

    const openNewTypeModal = () => {
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditTypeModal = (type) => {
        //console.log("El type es: ", type)
        setTypeData({
            ...type,
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
            const payload = {
                ...typeData,
                storeId: storeId,
            };
            //console.log("Is Editing? ", isEditing);
            //console.log("El payload es: ", payload);
            if (isEditing) {
                await updateType(typeData._id, payload);
                toast.success('type updated successfully');
            } else {
                await createType(payload);
                toast.success('Type created successfully');
            }

            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error saving Type:', error);
            toast.error('Error saving Type');
        }
    };

    const confirmRemove = async () => {
        try {
            await removeType(confirmDelete.typeId, storeId);
            toast.success(`Type ${confirmDelete.typeId} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error removing type:', error);
            toast.error('Error removing type');
        }
    };
    const filteredTypes = typeList
        .filter(p => !selectedType || p.category === selectedType.name.toUpperCase())
        .filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(p => p.category !== "PERMISSION" && p.category !== "ROOM")
        .sort((a, b) => a.name.localeCompare(b.name));

    if (loading) return <div className="text-white text-center mt-10">Loading Types...</div>;

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-8xl mx-auto bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden"
            >
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                    Type List
                </h2>

                <div className="flex flex-col items-center gap-3 mb-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewTypeModal}
                    >
                        <p>Add Type</p><Box />
                    </button>

                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {typeCategory.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                            <button
                                onClick={() => setSelectedType(null)}
                                className={`px-3 py-1 rounded text-sm ${!selectedType ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                All
                            </button>
                            {typeCategory.map(type => (
                                <button
                                    onClick={() => setSelectedType(type)}
                                    className={`px-3 py-1 rounded text-sm ${selectedType === type ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                                >
                                    {type.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-3 mr-3 mb-3">
                    {filteredTypes.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No type found</div>
                    ) : (
                        filteredTypes.map((type) => {
                            const isCustomer = type.name === "Customer";

                            return (
                                <div
                                    key={type}
                                    className={`relative text-black rounded-lg shadow p-4 transition-all
                ${isCustomer ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-blue-100 cursor-pointer"}`}
                                >
                                    <div
                                        onClick={() => !isCustomer && openEditTypeModal(type)}
                                    >
                                        <p><strong>Name:</strong> {type.name}</p>
                                        <p><strong>Category:</strong> {type.category}</p>
                                    </div>

                                    {!isCustomer && (
                                        <button
                                            onClick={() => setConfirmDelete({ type: type._id })}
                                            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                            title="Remove from Store"
                                        >
                                            <Trash2 />
                                        </button>
                                    )}
                                </div>
                            );
                        })
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
                                    Do you really want to remove {confirmDelete._id} from the Store?
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
                                    {isEditing ? 'Edit Type' : 'New Type'}
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="space-y-4">
                                        <label>Select Type Category:*</label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                            value={typeData.category}
                                            onChange={(e) =>
                                                setTypeData({
                                                    ...typeData,
                                                    category: e.target.value.toUpperCase(),
                                                })
                                            }
                                        >
                                            <option value="" className="text-blue-950">Select Category</option>
                                            {typeCategory.map((c) => (
                                                <option key={c.name} value={c.name.toUpperCase()} className='text-blue-950'>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="">Name of the Type:*</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={typeData.name || ''}
                                            onChange={(e) => setPartnerData({ ...typeData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <p>Fields with * are mandatory</p>
                                    </div>
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

export default SetTypes;