import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePlus, CircleX, Copy, Save, Trash2, UserPlus } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRoleServices } from '../../store/rolesServices';
import { useAuthStore } from '../../store/authStore'
import { useTypeServices } from '../../store/typeServices'


const SetRoles = () => {
    const { createRole, updateRole, getRolesByStoreId, removeRole } = useRoleServices();
    const { getTypeByCategory } = useTypeServices();
    const storeId = Cookies.get('storeId');
    const [roleList, setRoleList] = useState([]);
    const [typeList, setTypeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [roleData, setRoleData] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showActive, setShowActive] = useState(true);
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const role = await getRolesByStoreId(storeId);
                //console.log("F: Respuesta de fetch:", role);
                setRoleList(role.roleList || []);
            } catch (error) {
                console.error('Error fetching product list:', error);
            } finally {
                setLoading(false);
            }
        };
        const fetchTypes = async () => {
            try {
                const auxTypeList = await getTypeByCategory("PERMISSION", storeId);
                //console.log("F: Respuesta de getTypeByCategory:", auxTypeList);
                setTypeList(auxTypeList.typeList || []);
            } catch (error) {
                console.error('Error fetching product list');
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchRoles();
            fetchTypes();
        }
    }, []);

    useEffect(() => {
        //console.log("Cambio el TypeList: ", typeList)
    }, [typeList]);

    const openNewRoleModal = () => {
        setRoleData({ name: '' });
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditRoleModal = (role) => {
        setRoleData({
            ...role,
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
            //console.log("F: Voy a crear el siguiente rol: ", roleData)
            const payload = {
                ...roleData,
                storeId: storeId,
                userEmail: user.email
            };

            if (isEditing) {
                await updateRole(roleData._id, payload);
                toast.success('Rol updated successfully');
            } else {
                await createRole(payload);
                toast.success('Rol created successfully');
            }

            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error saving Rol:', error);
            toast.error('Error saving Rol');
        }
    };

    const confirmRemove = async () => {
        try {
            await removeRole(confirmDelete.id);
            toast.success(`Rol ${confirmDelete.name} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error removing rol:');
            toast.error('Error removing rol');
        }
    };

    const roleTypes = [...new Set(roleList.map(p => p.type).filter(Boolean))];
    const filteredRoles = roleList
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));


    if (loading) return <div className="text-white text-center mt-10">Loading Roles...</div>;

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
                    Role List
                </h2>

                <div className="flex justify-center mb-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewRoleModal}
                    >
                        <p>Add Role</p><UserPlus />
                    </button>
                </div>
                <div className="flex justify-center mb-6">
                    <input
                        type="text"
                        placeholder="Search role by name..."
                        className="w-full max-w-md p-2 rounded bg-gray-800 text-white border border-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-3 mr-3 mb-3 w-full">
                    {filteredRoles.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No Roles found</div>
                    ) : (
                        filteredRoles.map((role) => (
                            <div
                                key={role._id}
                                className="relative bg-white text-black rounded-lg shadow p-4 hover:bg-blue-100 transition-all"
                            >
                                <div onClick={() => openEditRoleModal(role)} className='w-3/4'>
                                    <h3 className="font-semibold text-lg mb-1">{role.name}</h3>
                                    <p className="text-sm text-gray-700">Description: {role.description}</p>
                                </div>
                                <div className='flex flex-col absolute top-2 right-2 text-sm w-1/4'>
                                    <button
                                        onClick={() => setConfirmDelete({ id: role._id, name: role.name })}
                                        className="text-red-600 hover:text-red-800 flex flex-col justify-center items-center"
                                        title="Remove from Store"
                                    >
                                        <Trash2 />
                                        Remove
                                    </button>
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
                                    {isEditing ? 'Edit Role' : 'New Role'}
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <label className="capitalize">Name:*</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={roleData.name || ''}
                                            onChange={(e) =>
                                                setRoleData({ ...roleData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="capitalize">Description:*</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={roleData.description || ''}
                                            onChange={(e) =>
                                                setRoleData({ ...roleData, description: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className='mt-2 flex flex-col ml-2'>
                                        <label className="block text-sm font-medium mb-1">Permissions:*</label>
                                        <div className="flex flex-col gap-2">
                                            {typeList.map((t) => (
                                                <label key={t.name} className="inline-flex items-center text-sm text-white">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2"
                                                        checked={roleData.permission?.includes(t.name)}
                                                        onChange={(e) => {
                                                            const newPermissions = e.target.checked
                                                                ? [...(roleData.permission || []), t.name]
                                                                : (roleData.permission || []).filter((p) => p !== t.name);
                                                            setRoleData({ ...roleData, permission: newPermissions });
                                                        }}
                                                    />
                                                    {t.name}
                                                </label>
                                            ))}
                                        </div>
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

export default SetRoles;