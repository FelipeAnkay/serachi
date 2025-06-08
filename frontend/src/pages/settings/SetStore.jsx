import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Cookies from 'js-cookie'
import { useStoreServices } from '../../store/storeServices'
import timezones from '../../components/timezones.json'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SetStore() {
    const { getStoreById, updateStore } = useStoreServices();
    const [store, setStore] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customCurrency, setCustomCurrency] = useState('');
    const [currencySelectValue, setCurrencySelectValue] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const storeId = Cookies.get('storeId');

    useEffect(() => {
        const fetchStore = async () => {
            try {
                if (!storeId) throw new Error('Store ID not found in cookies')
                const data = await getStoreById(storeId)
                if (data) {
                    setStore(data.store)
                    setCurrencySelectValue(data.store.currency || '')
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchStore()
    }, [])

    const handleSave = async () => {
        //console.log('Saving store:', store)
        try {
            await updateStore(store._id, store)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Store updated successfully")
        } catch (error) {
            //console.log("Error updating store: ", error)
            toast.error("Error updating the store")
        }
    }
    const handleBalanceChange = (index, field, value) => {
        const updated = [...(store.openningBalance || [])];
        updated[index][field] = field === 'amount' ? parseFloat(value) : value;
        setStore({ ...store, openningBalance: updated });
    };

    const addBalanceEntry = () => {
        const updated = [...(store.openningBalance || []), { year: '', amount: 0 }];
        setStore({ ...store, openningBalance: updated });
    };

    const removeBalanceEntry = (index) => {
        const updated = [...(store.openningBalance || [])];
        updated.splice(index, 1);
        setStore({ ...store, openningBalance: updated });
    };

    const handleAddEmail = () => {
        if (newEmail && !store.userList?.includes(newEmail)) {
            setStore({ ...store, userList: [...(store.userList || []), newEmail] });
            setNewEmail('');
        }
    };

    const handleEditEmail = (index, value) => {
        const updated = [...(store.userList || [])];
        updated[index] = value;
        setStore({ ...store, userList: updated });
    };

    const handleRemoveEmail = (index) => {
        const updated = [...(store.userList || [])];
        updated.splice(index, 1);
        setStore({ ...store, userList: updated });
    };

    if (loading) return <div className="p-4 text-white">Loading store...</div>
    if (error) return <div className="p-4 text-red-400">Error: {error}</div>

    return (
        <div className="min-h-screen w-full bg-blue-950 flex items-center justify-center px-4 py-12">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="bg-blue-900 p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-xl space-y-6"
                >
                    <h2 className="text-2xl font-bold text-white text-center">Store Settings</h2>
                    <div className="space-y-4">
                        <div key="name">
                            <label className="block text-sm font-medium text-white">Name</label>
                            <input
                                type="text"
                                className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2 mt-1"
                                value={store.name || ''}
                                onChange={(e) => setStore({ ...store, name: e.target.value })}
                            />
                        </div>
                        <div key="address">
                            <label className="block text-sm font-medium text-white">Address</label>
                            <input
                                type="text"
                                className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2 mt-1"
                                value={store.address || ''}
                                onChange={(e) => setStore({ ...store, address: e.target.value })}
                            />
                        </div>
                        <div key="storeId">
                            <label className="block text-sm font-medium text-white">Store Identifier</label>
                            <input
                                type="text"
                                className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2 mt-1"
                                value={store.storeId || ''}
                                onChange={(e) => setStore({ ...store, storeId: e.target.value })}
                            />
                        </div>
                        <div key="mainEmail">
                            <label className="block text-sm font-medium text-white">Main Contact (Email)</label>
                            <input
                                type="text"
                                className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2 mt-1"
                                value={store.mainEmail || ''}
                                onChange={(e) => setStore({ ...store, mainEmail: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white">Authorized Emails</label>
                            {(store.userList || []).map((email, index) => (
                                <div key={index} className="flex items-center mt-2 gap-2">
                                    <input
                                        type="email"
                                        className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2"
                                        value={email}
                                        onChange={(e) => handleEditEmail(index, e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleRemoveEmail(index)}
                                        className="text-red-400"
                                    >
                                        <Trash2/>
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="email"
                                    placeholder="Add new email"
                                    className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                                <button
                                    onClick={handleAddEmail}
                                    className="bg-green-500 text-white px-3 py-2 rounded-lg"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                        <div key="taxDefault">
                            <label className="block text-sm font-medium text-white">Default Tax %:</label>
                            <input
                                type="number"
                                className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2 mt-1"
                                value={store.taxDefault || 0}
                                onChange={(e) => setStore({ ...store, taxDefault: e.target.value })}
                            />
                        </div>
                        <div key="timezone">
                            <label className="block text-sm font-medium text-white">Timezone</label>
                            <select
                                className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2 mt-1"
                                value={store.timezone || ''}
                                onChange={(e) => setStore({ ...store, timezone: e.target.value })}
                            >
                                <option value="">Select a timezone</option>
                                {timezones.map((tz) => (
                                    <option key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-white mb-2">Opening Balance by Year</label>
                            <table className="w-full text-white border border-gray-400 rounded">
                                <thead className="bg-blue-700 text-white text-sm text-center">
                                    <tr>
                                        <th className="px-4 py-2">Year</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {store.openningBalance?.map((entry, index) => (
                                        <tr key={index} className="border-t border-gray-400">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Year"
                                                    className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2"
                                                    value={entry.year}
                                                    onChange={(e) => handleBalanceChange(index, 'year', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="w-full bg-white text-blue-950 border border-gray-300 rounded px-3 py-2"
                                                    value={entry.amount}
                                                    onChange={(e) => handleBalanceChange(index, 'amount', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => removeBalanceEntry(index)}
                                                    className="text-red-400 hover:text-red-600 text-lg"
                                                >
                                                    <Trash2/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button
                                onClick={addBalanceEntry}
                                className="mt-2 text-sm text-green-400 hover:text-green-600"
                            >
                                + Add Year
                            </button>
                        </div>
                    </div>
                    <button
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg mt-4 transition duration-200"
                        onClick={handleSave}
                    >
                        Save Store
                    </button>
                </motion.div>
            </AnimatePresence>
        </div >
    )
}