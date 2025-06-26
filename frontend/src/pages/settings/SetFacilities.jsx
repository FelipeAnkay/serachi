import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePlus, CircleX, Save, Ship, Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore'
import { useFacilityServices } from '../../store/facilityServices';



const SetFacilities = () => {
    const { createFacility, updateFacility, getFacilityList } = useFacilityServices();
    const storeId = Cookies.get('storeId');
    const [facilityList, setFacilityList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [facilityData, setFacilityData] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showActive, setShowActive] = useState(true);
    const { user } = useAuthStore();
    const [firstTime, setFirstTime] = useState(true);

    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const facilities = await getFacilityList(storeId);
                //console.log("F: Respuesta de fetch:", facilities);
                setFacilityList(facilities.facilityList || []);
            } catch (error) {
                //console.error('Error fetching room list:', error);
                toast.error("Error fetching the facilities")
            } finally {
                setLoading(false);
            }
        };

        if (storeId && firstTime) {
            fetchFacility();
            setFirstTime(false);
        }
    }, []);

    const openNewFacilityModal = () => {
        setFacilityData({ name: '' });
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditFacilityModal = (facility) => {
        setFacilityData({
            ...facility,
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
                ...facilityData,
                storeId: storeId?.toUpperCase(),
                userEmail: user.email,
            };
            //console.log("Payload a enviar: ", payload)
            if (isEditing) {
                await updateFacility(payload._id, payload);
                toast.success('Room updated successfully');
            } else {
                await createFacility(payload);
                toast.success('Room created successfully');
            }

            closeModal();
            window.location.reload();
        } catch (error) {
            //console.error('Error saving Facility:', error);
            toast.error('Error saving Facility');
        }
    };

    const confirmRemove = async () => {
        try {
            //console.log("confirmRemove: ", confirmDelete)            
            const auxId = confirmDelete._id
            const auxVars = confirmDelete
            const auxName = confirmDelete.name
            //console.log("confirmRemove: ", {auxId,auxVars})
            await updateFacility(auxId,auxVars);
            toast.success(`Facility ${auxName} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            //console.error('Error removing Facility:', error);
            toast.error('Error removing Facility');
        }
    };

    const filteredFacility = facilityList
        .filter(p => p.isActive === showActive)


    if (loading) return <div className="text-white text-center mt-10">Loading Facilities...</div>;

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
                    Facility List
                </h2>

                <div className="flex justify-center mb-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewFacilityModal}
                    >
                        <p>Add Facility</p><Ship />
                    </button>
                </div>
                <div className="flex justify-center mb-2">
                    <button
                        onClick={() => setShowActive(!showActive)}
                        className="text-sm text-blue-400 hover:text-blue-200 underline"
                    >
                        {showActive ? 'Show Inactive Facilites' : 'Show Active Facilities'}
                    </button>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 ml-3 mr-3 mb-3 w-full">
                    {filteredFacility.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No Facility found</div>
                    ) : (
                        filteredFacility.map((facility) => (
                            <div
                                key={facility._id}
                                className="relative bg-white text-black rounded-lg shadow p-4 hover:bg-blue-100 transition-all"
                            >
                                <div onClick={() => openEditFacilityModal(facility)}>
                                    <h3 className="font-semibold text-lg mb-1">{facility.name}</h3>
                                    <p className="text-sm text-gray-700">Availability: {facility.availability}</p>
                                </div>
                                {facility.isActive ? (
                                    <button
                                        onClick={() => {
                                            setConfirmDelete(prev => ({
                                                ...prev,
                                                _id: facility._id,
                                                name: facility.name,
                                                availability: facility.availability,
                                                isActive: false,
                                            }));
                                        }}
                                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                        title="Remove from Store"
                                    >
                                        <Trash2 />
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await updateFacility(facility._id, { isActive: true });
                                                toast.success(`${facility.name} reactivated.`);
                                                window.location.reload();
                                            } catch (error) {
                                                //console.error('Error reactivating facility:', error);
                                                toast.error('Error reactivating facility');
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
                                    {isEditing ? 'Edit Facility' : 'New Facility'}
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <label className="capitalize">Name:</label>
                                        <input
                                            type='text'
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={facilityData.name || ''}
                                            onChange={(e) => setFacilityData({ ...facilityData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="capitalize">Availability:</label>
                                        <input
                                            type='number'
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={facilityData.availability || ''}
                                            onChange={(e) => setFacilityData({ ...facilityData, availability: e.target.value })}
                                        />
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

export default SetFacilities;