import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, CirclePlus, CircleX, Currency, Delete, Save, Trash2, UserPlus } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRoomServices } from '../../store/roomServices';
import { useAuthStore } from '../../store/authStore'
import { useTypeServices } from '../../store/typeServices';


const SetRooms = () => {
    const { createRoom, updateRoom, getRoomList } = useRoomServices();
    const { getTypeByCategory } = useTypeServices();
    const storeId = Cookies.get('storeId');
    const [roomList, setRoomList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [roomData, setRoomData] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showActive, setShowActive] = useState(true);
    const { user } = useAuthStore();
    const [typeList, setTypeList] = useState([]);
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const rooms = await getRoomList(storeId);
                console.log("F: Respuesta de fetch:", rooms);
                setRoomList(rooms.roomList || []);
            } catch (error) {
                console.error('Error fetching room list:', error);
            } finally {
                setLoading(false);
            }
        };
        const fetchTypes = async () => {
            try {
                const auxTypeList = await getTypeByCategory("ROOM", storeId);
                console.log("F: Respuesta de getTypeByCategory:", auxTypeList);
                setTypeList(auxTypeList.typeList || []);
            } catch (error) {
                console.error('Error fetching product list:', error);
            } finally {
                setLoading(false);
            }
        };
        if (storeId) {
            fetchRooms();
            fetchTypes();
        }
    }, []);

    useEffect(() => {
        console.log("Cambio el TypeList: ", typeList)
    }, [typeList]);

    const openNewRoomModal = () => {
        setRoomData({ name: '' });
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditRoomModal = (room) => {
        setRoomData({
            ...room,
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
                ...roomData,
                storeId: storeId?.toUpperCase(),
                userEmail: user.email,
            };
            console.log("Payload a enviar: ", payload)
            if (isEditing) {
                await updateRoom(payload._id, payload);
                toast.success('Room updated successfully');
            } else {
                await createRoom(payload);
                toast.success('Room created successfully');
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
            setConfirmDelete(prev => ({
                ...prev,
                isActive: false,
            }));
            await updateRoom(confirmDelete._id, confirmDelete);
            toast.success(`Room ${confirmDelete.name} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error removing room:', error);
            toast.error('Error removing room');
        }
    };

    const roomTypes = [...new Set(roomList.map(p => p.type).filter(Boolean))];
    const filteredRooms = roomList
        .filter(p => p.isActive === showActive)
        .filter(p => !selectedType || p.type === selectedType);


    if (loading) return <div className="text-white text-center mt-10">Loading Rooms...</div>;

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
                    Room List
                </h2>

                <div className="flex justify-center mb-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewRoomModal}
                    >
                        <p>Add Room</p><BedDouble />
                    </button>
                </div>
                <div className="flex justify-center mb-2">
                    <button
                        onClick={() => setShowActive(!showActive)}
                        className="text-sm text-blue-400 hover:text-blue-200 underline"
                    >
                        {showActive ? 'Show Inactive Rooms' : 'Show Active Rooms'}
                    </button>
                </div>
                {roomTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        <button
                            onClick={() => setSelectedType(null)}
                            className={`px-3 py-1 rounded text-sm ${!selectedType ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            All
                        </button>
                        {roomTypes.map(type => (
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

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 ml-3 mr-3 mb-3 w-full">
                    {filteredRooms.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No Rooms found</div>
                    ) : (
                        filteredRooms.map((room) => (
                            <div
                                key={room._id}
                                className="relative bg-white text-black rounded-lg shadow p-4 hover:bg-blue-100 transition-all"
                            >
                                <div onClick={() => openEditRoomModal(room)}>
                                    <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                                    <p className="text-sm text-gray-700">Availability: {room.availability}</p>
                                    <p className="text-sm text-gray-700">Type: {room.type || 'N/A'}</p>
                                    <p className="text-sm text-gray-700">Price: ${room.price}</p>
                                </div>
                                {room.isActive ? (
                                    <button
                                        onClick={() => setConfirmDelete({ room })}
                                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                        title="Remove from Store"
                                    >
                                        <Trash2 />
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await updateRoom(room._id, { isActive: true });
                                                toast.success(`${room.name} reactivated.`);
                                                window.location.reload();
                                            } catch (error) {
                                                console.error('Error reactivating room:', error);
                                                toast.error('Error reactivating room');
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
                                    {isEditing ? 'Edit Room' : 'New Room'}
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <label className="capitalize">Name:</label>
                                        <input
                                            type='text'
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={roomData.name || ''}
                                            onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="capitalize">Availability:</label>
                                        <input
                                            type='number'
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={roomData.availability || ''}
                                            onChange={(e) => setRoomData({ ...roomData, availability: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="capitalize">Price:</label>
                                        <input
                                            type='number'
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={roomData.price || ''}
                                            onChange={(e) => setRoomData({ ...roomData, price: e.target.value })}
                                        />
                                    </div>
                                    <div className='mt-2 flex flex-row ml-2'>
                                        <label className="block text-sm font-medium">Room Type:</label>
                                        <select
                                            name="type"
                                            className="ml-2 w-full border border-gray-300 bg-white text-blue-950 rounded px-3 py-2"
                                            value={roomData.type || ''}
                                            onChange={(e) => setRoomData({ ...roomData, type: e.target.value })}
                                        >
                                            <option value="">Select a Type</option>
                                            {typeList.map((t) => (
                                                <option key={t.name} value={t.name}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
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

export default SetRooms;