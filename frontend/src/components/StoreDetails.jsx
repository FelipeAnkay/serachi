import { AnimatePresence, motion } from 'framer-motion'
import { CircleX } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function StoreDetails({ isOpen, onClose, store, setStore, onSave }) {
    const [customCurrency, setCustomCurrency] = useState('')
    const [currencySelectValue, setCurrencySelectValue] = useState(store.currency || '')

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
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

                    <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Store</h2>
                    <div className="space-y-4 text-slate-800">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1 "
                                value={store.name || ''}
                                onChange={(e) => setStore({ ...store, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1 "
                                value={store.description || ''}
                                onChange={(e) => setStore({ ...store, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Does your store manage bookings?
                            </label>
                            <input
                                type="checkbox"
                                className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                                checked={store.storeBookings || false}
                                onChange={(e) => setStore({ ...store, storeBookings: e.target.checked })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Location</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1 "
                                value={store.location || ''}
                                onChange={(e) => setStore({ ...store, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Currency</label>
                            <select
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1 "
                                value={currencySelectValue}
                                onChange={(e) => {
                                    const selected = e.target.value
                                    setCurrencySelectValue(selected)
                                    if (selected !== 'Other') {
                                        setStore({ ...store, currency: selected })
                                        setCustomCurrency('')
                                    } else {
                                        setStore({ ...store, currency: '' })
                                    }
                                }}
                            >
                                <option value="">Select Currency</option>
                                {['USD', 'EUR', 'CLP', 'MXN', 'PEN', 'BRL', 'COP'].map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                            {currencySelectValue === 'Other' && (
                                <input
                                    type="text"
                                    placeholder="Enter custom currency"
                                    className="w-full mt-2 bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 "
                                    value={customCurrency}
                                    onChange={(e) => {
                                        setCustomCurrency(e.target.value)
                                        setStore({ ...store, currency: e.target.value })
                                    }}
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Opening Balance</label>
                            <input
                                type="number"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1 "
                                value={store.openningBalance || ''}
                                onChange={(e) => setStore({ ...store, openningBalance: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Main Contact</label>
                            <input
                                type="email"
                                placeholder="staff@example.com"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1 "
                                value={store.mainStaffEmail || ''}
                                onChange={(e) => setStore({ ...store, mainStaffEmail: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Is Active</label>
                            <select
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1 "
                                value={store.isActive ? 'true' : 'false'}
                                onChange={(e) => setStore({ ...store, isActive: e.target.value === 'true' })}
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>

                        <button
                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4"
                            type="button"
                            onClick={onSave}
                        >
                            Save Store
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}