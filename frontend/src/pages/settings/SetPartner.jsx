import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleX, Delete, Handshake, Save, Trash2, UserPlus } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { usePartnerServices } from '../../store/partnerServices';
import languagesList from '../../components/languages.json'
import countries from '../../components/contries.json'


const SetPartner = () => {
    const { getPartnerList, createPartner, updatePartner, getPartnerEmail, removePartner } = usePartnerServices();
    const storeId = Cookies.get('storeId');
    const [partnerList, setPartnerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [partnerData, setPartnerData] = useState({});
    const [emailCheckPhase, setEmailCheckPhase] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const partner = await getPartnerList(storeId);
                setPartnerList(partner.partnerList || []);
            } catch (error) {
                console.error('Error fetching partner list:', error);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchPartners();
            //console.log("La lista de partner es: ", partnerList)
        }
    }, []);

    useEffect(() => {
        //console.log("El partnerData es: ", partnerData)
    }, [partnerData]);


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

    const openNewPartnerModal = () => {
        setPartnerData({ email: '' });
        setEmailCheckPhase(true);
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditPartnerModal = (partner) => {
        //console.log("El partner es: ", partner)
        setPartnerData({
            ...partner,
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
        if (!partnerData.email) return;

        try {
            const res = await getPartnerEmail(partnerData.email, storeId);
            const partnerFound = res.partnerList?.[0];
            console.log("handleEmailCheck partnerFound:", partnerFound);
            if (partnerFound) {
                const alreadyAssigned = partnerFound.storeId?.includes(storeId.toUpperCase());
                const updatedStoreId = alreadyAssigned
                    ? partnerFound.storeId
                    : [...new Set([...partnerFound.storeId, storeId.toUpperCase()])];
                setPartnerData({
                    ...partnerFound,
                    storeId: updatedStoreId,
                });
                setIsEditing(true);
                toast.success('Partner founded');
            } else {
                toast.success("Partner not found, you can assign a new partner");
                setIsEditing(false);
            }

            setEmailCheckPhase(false); // Pasar al formulario completo
        } catch (err) {
            console.error("Error checking partner by email:", err);
            toast.error("Error checking email");
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...partnerData,
                storeId: storeId,
            };
            //console.log("Is Editing? ", isEditing);
            //console.log("El payload es: ", payload);
            if (isEditing) {
                await updatePartner(partnerData.email, storeId, payload);
                toast.success('partner updated successfully');
            } else {
                await createPartner(payload);
                toast.success('partner created successfully');
            }

            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error saving partner:', error);
            toast.error('Error saving partner');
        }
    };

    const confirmRemove = async () => {
        try {
            await removePartner(confirmDelete.partner, storeId);
            toast.success(`partner ${confirmDelete.partner} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error removing partner:', error);
            toast.error('Error removing partner');
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading partner...</div>;

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-white bg-clip-text">
                    Partner List
                </h2>

                <div className="flex flex-col items-center gap-3 mb-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewPartnerModal}
                    >
                        <p>Add Partner</p><Handshake />
                    </button>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>


                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 ml-3 mr-3 mb-3">
                    {partnerList.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No partner found</div>
                    ) : (
                        partnerList
                            .filter(partner => partner.isActive)
                            .filter(partner => {
                                const term = searchTerm.toLowerCase();
                                return (
                                    partner.name?.toLowerCase().includes(term) ||
                                    partner.email?.toLowerCase().includes(term)
                                );
                            })
                            .map((partner) => (
                                <div
                                    key={partner._id}
                                    className="relative text-black rounded-lg shadow p-4 bg-gray-200 hover:bg-blue-100 transition-all"
                                >
                                    <div onClick={() => openEditPartnerModal(partner)}>
                                        <p><strong>Name:</strong> {partner.name}</p>
                                        <p><strong>Email:</strong> {partner.email}</p>
                                        <p><strong>Phone:</strong> {partner.phone || 'N/A'}</p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({ partner: partner.email })}
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
                                    Do you really want to remove {confirmDelete.email} from the Store?
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
                                    {isEditing ? 'Edit Partner' : 'New Partner'}
                                </h3>

                                {emailCheckPhase ? (
                                    <div className="space-y-4">
                                        <label>Email del partner:</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 rounded bg-gray-800 text-white"
                                            value={partnerData.email || ''}
                                            onChange={(e) => setPartnerData({ ...partnerData, email: e.target.value })}
                                        />
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mt-4"
                                            onClick={handleEmailCheck}
                                        >
                                            {isEditing ? 'Continue' : 'Partner Search'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-sm">
                                        <div className="space-y-4">
                                            <label>Email del partner:*</label>
                                            <input
                                                type="email"
                                                className="w-full p-2 rounded bg-gray-800 text-white"
                                                value={partnerData.email || ''}
                                                onChange={(e) => setPartnerData({ ...partnerData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="">Name:*</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                                value={partnerData.name || ''}
                                                onChange={(e) => setPartnerData({ ...partnerData, name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="">Phone (+Country Code-Phone):</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                                value={partnerData.phone || ''}
                                                onChange={(e) => setPartnerData({ ...partnerData, phone: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="capitalize">National Id or Tax Id:</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                                value={partnerData.nationalId || ''}
                                                onChange={(e) => setPartnerData({ ...partnerData, nationalId: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Country: *</label>
                                            <select
                                                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                value={partnerData.country}
                                                onChange={(e) =>
                                                    setPartnerData({
                                                        ...partnerData,
                                                        country: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="" className="text-blue-950">Select Country</option>
                                                {countries.map((c) => (
                                                    <option key={c.code} value={c.name} className='text-blue-950'>{c.name}</option>
                                                ))}
                                            </select>
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
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SetPartner;