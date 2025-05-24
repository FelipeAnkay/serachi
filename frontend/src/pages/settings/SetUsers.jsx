import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore';
import Cookies from 'js-cookie';
import Input from '../../components/Input';
import { SquarePlus, Trash, User } from 'lucide-react';

const SetUsers = () => {
    const { userCompany, updateCompany } = useAuthStore();
    const storeId = Cookies.get("storeId");
    const [users, setUsers] = useState([""]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState('');

    useEffect(() => {
        console.log("Entre a useEffect");
        const fetchUsers = async () => {
            try {
                console.log("el StoreID es: ", storeId);
                const response = await userCompany(storeId);
                console.log("la respuesta de userCompany es:", response);
                setUsers(response.userList.userList);
            } catch (err) {
                setError('Users not found');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchUsers();
        }
    },[]);

    const handleDelete = (index) => {
        const updatedUsers = [...users];
        updatedUsers.splice(index, 1);
        setUsers(updatedUsers);
    };

    const handleAddUser = () => {
        if (newUser.trim()) {
            setUsers([...users, newUser.trim()]);
            setNewUser('');
        }
    };

    const handleSave = async () => {
        try {
            await updateCompany(storeId, { userList: users });
            alert("Usuarios actualizados correctamente");
        } catch (err) {
            console.error(err);
            alert("Hubo un error al guardar los usuarios");
        }
    };

    return (
        <div className="flex h-screen w-screen bg-blue-950 text-white" >
            {/* Contenido principal */}
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className='max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800'
            >
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text'>
                    Listado de Usuarios
                </h2>
                {loading && <p className="text-center">Loading usuarios...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
            
                <ul className="space-y-2">
                    {users.map((user, index) => (
                        <li key={user || index} className="flex justify-between items-center bg-white text-black p-2 rounded">
                            <span>{user}</span>
                            <button
                                onClick={() => handleDelete(index)}
                                className="ml-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                            >
                                <Trash/>
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="flex space-x-2 mb-4 pt-2">
                    <input
                        type="text"
                        value={newUser}
                        onChange={(e) => setNewUser(e.target.value)}
                        placeholder="New User"
                        className="flex-grow px-2 py-1 rounded text-black bg-white"
                        icon={User}
                    />
                    <button
                        onClick={handleAddUser}
                        className="bg-green-600 px-4 py-1 rounded hover:bg-green-700"
                    >
                        <SquarePlus/>
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
                >
                    Save
                </button>
            </motion.div>
        </div>
    )
}
export default SetUsers