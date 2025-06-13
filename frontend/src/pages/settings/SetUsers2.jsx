import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleX, Copy, Delete, Handshake, Save, Trash2, UserPlus, UsersRound } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useRoleServices } from '../../store/rolesServices';
import UserDetails from '../../components/UserDetail';
import { useStoreServices } from '../../store/storeServices';



const SetUsers2 = () => {
    const storeId = Cookies.get('storeId');
    const { getUsersByEmail, getUserEmail, updateUser } = useAuthStore();
    const { updateStore, getUsers } = useStoreServices()
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userNew, setUserNew] = useState(false);
    const [userData, setUserData] = useState({});
    const [emailCheckPhase, setEmailCheckPhase] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [emailList, setEmailList] = useState([]);

    const fetchUsers = async () => {
        try {
            //console.log("el StoreID es: ", storeId);
            const response = await getUsers(storeId);
            //console.log("la respuesta de getUsers es:", response);
            const auxEmailList = response.userList.userList
            setEmailList(auxEmailList)
            const auxUserList = await getUsersByEmail(auxEmailList, storeId);
            //console.log("la respuesta de getUsersByEmail es:", auxUserList);
            setUserList(auxUserList.userList);
        } catch (err) {
            setError('Users not found');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (storeId) {
            fetchUsers();
            //console.log("La lista de partner es: ", partnerList)
        }
    }, []);

    useEffect(() => {
        //console.log("El partnerData es: ", partnerData)
    }, [userData]);


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

    const openNewUserModal = () => {
        setUserData({ email: '' });
        setEmailCheckPhase(true);
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditUserModal = (user) => {
        //console.log("El user es: ", user)
        setUserData({
            ...user,
        });
        setIsEditing(true);
        setEmailCheckPhase(false);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDelete(null);
        setUserNew(false);
    };
    const handleEmailCheck = async () => {
        if (!userData.email) return;

        try {
            const res = await getUserEmail(userData.email);
            //console.log("getUserEmail: ", res);
            const userFound = res.user;
            //console.log("handleEmailCheck userFound:", userFound);
            if (userFound) {
                setUserData({
                    ...userFound,
                    storeId: storeId,
                });
                setIsEditing(true);
                setUserNew(false);
                toast.success('User founded');
            } else {
                setUserNew(true);
                closeModal();
                toast.error("User not found, please have them sign up first");
                setIsEditing(false);
            }

            setEmailCheckPhase(false); // Pasar al formulario completo
        } catch (err) {
            console.error("Error checking user by email:", err);
            toast.error("Error user email");
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...userData,
                storeId: storeId,
            };
            //console.log("Is Editing? ", isEditing);
            //console.log("El payload es: ", payload);
            if (userNew) {
                //await updateUser(userData.email, storeId, payload);
                toast.success('User updated successfully');
            } else {
                await updateUser(userData.email, userData);
                //console.log("emailList: ", emailList)
                const auxUsers = emailList.includes(userData.email)
                    ? emailList
                    : [...emailList, userData.email];
                await updateStore(storeId, { userList: auxUsers });
                //console.log("auxUsers: ", auxUsers);
                toast.success('User Assigned to Store successfully');
            }

            closeModal();
            fetchUsers();
            //window.location.reload();
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Error saving user');
        }
    };

    const confirmRemove = async () => {
        try {
            //console.log("confirmRemove: ", confirmDelete.user)
            const emailToRemove = confirmDelete.user;
            const updatedUserList = emailList.filter(email => email !== emailToRemove);
            await updateStore(storeId, { userList: updatedUserList });
            toast.success(`User ${confirmDelete.user} removed from store.`);
            closeModal();
            fetchUsers();
        } catch (error) {
            console.error('Error removing user:', error);
            toast.error('Error removing user');
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading users...</div>;

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
                    User List
                </h2>

                <div className="flex flex-col items-center gap-3 mb-6">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewUserModal}
                    >
                        <p>Add User</p><UsersRound />
                    </button>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* GRID RESPONSIVO */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
                    {userList.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No user found</div>
                    ) : (
                        userList
                            .filter(user => {
                                const term = searchTerm.toLowerCase();
                                return (
                                    user.name?.toLowerCase().includes(term) ||
                                    user.email?.toLowerCase().includes(term)
                                );
                            })
                            .map((user) => (
                                <div
                                    key={user._id}
                                    className="relative text-black rounded-lg shadow p-4 bg-gray-200 hover:bg-blue-100 transition-all w-full"
                                >
                                    {/* Botón Trash */}
                                    <button
                                        onClick={() => setConfirmDelete({ user: user.email })}
                                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                        title="Remove from Store"
                                    >
                                        <Trash2 />
                                    </button>

                                    {/* Info */}
                                    <div className="flex flex-col gap-2" onClick={() => openEditUserModal(user)}>
                                        <p><strong>Name:</strong> {user.name}</p>
                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                            <p className="flex items-center">
                                                <strong>Email:</strong>&nbsp;{user.email}
                                            </p>
                                            <Copy
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(user.email)
                                                        .then(() => toast.success("Email copied!"))
                                                        .catch(() => toast.error("Failed to copy"));
                                                }}
                                                className="text-blue-500 hover:text-blue-900 cursor-pointer"
                                            />
                                        </div>
                                        <p><strong>Phone:</strong> {user.phone || '-'}</p>
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
                                    Do you really want to remove {confirmDelete.user} from the Store?
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
                                    {isEditing ? 'Edit user' : 'New user'}
                                </h3>

                                {emailCheckPhase ? (
                                    <div className="space-y-4">
                                        <label>Email:</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 rounded bg-gray-800 text-white"
                                            value={userData.email || ''}
                                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        />
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mt-4"
                                            onClick={handleEmailCheck}
                                        >
                                            {isEditing ? 'Continue' : 'User Search'}
                                        </button>
                                    </div>
                                ) : (
                                    <UserDetails
                                        isOpen={modalOpen}
                                        onClose={() => setModalOpen(false)}
                                        user={userData}
                                        setUser={setUserData}
                                        onSave={handleSave}
                                    />
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SetUsers2;