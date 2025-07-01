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

    if (loading) return <div className="p-4 text-slate-800">Loading store...</div>
    if (error) return <div className="p-4 text-red-400">Error: {error}</div>

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h2 className="text-2xl font-bold text-slate-800 text-center">Store Settings</h2>
                <div className='w-full border rounded-2xl px-5 py-2'>
                    <div className="space-y-4">
                        <div key="name">
                            <label className="block text-sm font-medium text-slate-800">Name</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                value={store.name || ''}
                                onChange={(e) => setStore({ ...store, name: e.target.value })}
                            />
                        </div>
                        <div key="address">
                            <label className="block text-sm font-medium text-slate-800">Address</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                value={store.address || ''}
                                onChange={(e) => setStore({ ...store, address: e.target.value })}
                            />
                        </div>
                        <div key="storeId">
                            <label className="block text-sm font-medium text-slate-800">Store Identifier</label>
                            <input
                                type="text"
                                className="w-full bg-gray-500 text-slate-800 border border-slate-300 rounded px-3 py-2 mt-1"
                                value={store.storeId || ''}
                                onChange={(e) => setStore({ ...store, storeId: e.target.value })}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Does your store manage bookings?
                            </label>
                            <input
                                type="checkbox"
                                className="h-5 w-5 text-cyan-600 border-gray-300 rounded"
                                checked={store.storeBookings || false}
                                onChange={(e) => setStore({ ...store, storeBookings: e.target.checked })}
                            />
                        </div>
                        <div key="mainEmail">
                            <label className="block text-sm font-medium text-slate-800">Main Contact (Email)</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                value={store.mainEmail || ''}
                                onChange={(e) => setStore({ ...store, mainEmail: e.target.value })}
                            />
                        </div>
                        {store.plan != "BAS" && (
                            <div key="tcLink">
                                <label className="block text-sm font-medium text-slate-800">Terms and conditions URL (ex: https://yourpage.com/tyc)</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                    value={store.tcLink || ''}
                                    onChange={(e) => setStore({ ...store, tcLink: e.target.value })}
                                />
                            </div>  
                        )}
                        <div key="taxDefault">
                            <label className="block text-sm font-medium text-slate-800">Default Tax %:</label>
                            <input
                                type="number"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                value={store.taxDefault || 0}
                                onChange={(e) => setStore({ ...store, taxDefault: e.target.value })}
                            />
                        </div>
                        <div key="timezone">
                            <label className="block text-sm font-medium text-slate-800">Timezone</label>
                            <select
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
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
                            <label className="block text-sm font-medium text-slate-800 mb-2">Opening Balance by Year</label>
                            <table className="w-full text-slate-800 border border-gray-400 rounded">
                                <thead className="bg-[#3BA0AC] text-cyan-50 text-sm text-center">
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
                                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2"
                                                    value={entry.year}
                                                    onChange={(e) => handleBalanceChange(index, 'year', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2"
                                                    value={entry.amount}
                                                    onChange={(e) => handleBalanceChange(index, 'amount', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => removeBalanceEntry(index)}
                                                    className="text-red-400 hover:text-red-600 text-lg"
                                                >
                                                    <Trash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={addBalanceEntry}
                            className="mt-2 text-sm text-[#3BA0AC] hover:text-[#118290]"
                        >
                            + Add Year
                        </button>
                    </div>
                </div>
                <button
                    className="w-full bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-semibold py-2 px-4 rounded-lg mt-4 transition duration-200"
                    onClick={handleSave}
                >
                    Save Store
                </button>
            </motion.div>

        </div >
    )
}