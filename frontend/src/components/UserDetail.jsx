import { AnimatePresence, motion } from 'framer-motion'
import { CircleX } from 'lucide-react'
import countries from './contries.json'
import { useEffect, useState } from 'react';
import { useRoleServices } from '../store/rolesServices';
import Cookies from 'js-cookie';

export default function UserDetails({ isOpen, onClose, user, setUser, onSave }) {
    const storeId = Cookies.get('storeId');
    const [roleList, setRoleList] = useState([]);
    const { createRole, updateRole, getRolesByStoreId, removeRole } = useRoleServices();
    const currentStoreRoleId = user.role?.find(r => r.storeId === storeId)?.roleId || '';
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

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
        fetchRoles();
    }, [])


    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black-95 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-sky-50 rounded-2xl p-6 max-w-lg w-[90%] h-[90%] overflow-y-auto relative"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        type="button"
                        className="absolute top-3 right-3 text-gray-300 hover:text-slate-800"
                        onClick={onClose}
                    >
                        <CircleX />
                    </button>

                    <h2 className="text-xl font-bold mb-4 text-center text-slate-800">User</h2>
                    <div className="space-y-4">
                        {/* Ejemplo de campo: */}
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                value={user.name || ''}
                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                value={user.email || ''}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Phone</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                value={user.phone || ''}
                                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select
                                value={currentStoreRoleId}
                                onChange={(e) => {
                                    const newRoleId = e.target.value;
                                    const existingRoles = user.role || [];

                                    const updatedRoles = existingRoles.some(r => r.storeId === storeId)
                                        ? existingRoles.map(r =>
                                            r.storeId === storeId ? { ...r, roleId: newRoleId } : r
                                        )
                                        : [...existingRoles, { storeId, roleId: newRoleId }];

                                    setUser({ ...user, role: updatedRoles });
                                }}
                                className='w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded'
                            >
                                <option value="" className='text-slate-900'>Select Role</option>
                                {roleList.map((r) => (
                                    <option key={r._id} value={r._id} className='text-slate-900'>{r.name} - {r.description}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4"
                            type="button"
                            onClick={onSave}
                        >
                            Assign User
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}