import { AnimatePresence, motion } from 'framer-motion'
import { CircleX } from 'lucide-react'
import dietaryList from './dietaryList.json';
import languagesList from './languages.json';
import countries from './contries.json'
import { useEffect, useState } from 'react';
import { useStaffServices } from '../store/staffServices'

export default function ServiceDetails({ isOpen, onClose, service, setService, onSave, storeId }) {

    const { getStaffList } = useStaffServices();
    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await getStaffList(storeId);
                console.log("Service staffList Response: ", response);
                setStaffList(response.staffList);
            } catch (error) {
                console.error('Error fetching quotes:', error);
            }
        };

        if (storeId) {
            fetchStaff();
        }
    }, [storeId])

    const formatDateInput = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const tzOffset = date.getTimezoneOffset() * 60000; // en milisegundos
        const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
        return localISOTime;
    };

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-blue-900 rounded-2xl p-6 max-w-lg w-[90%] h-[90%] overflow-y-auto relative"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        type="button"
                        className="absolute top-3 right-3 text-gray-300 hover:text-white"
                        onClick={onClose}
                    >
                        <CircleX />
                    </button>

                    <h2 className="text-xl font-bold mb-4 text-center text-white">Service</h2>
                    <div className="space-y-4">
                        {/* Ejemplo de campo: */}
                        <div>
                            <label className="block text-sm font-medium">Service Name:</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 bg-white text-blue-950 rounded px-3 py-2 mt-1"
                                value={service.name || ''}
                                onChange={(e) => setService({ ...service, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Staff Email:</label>
                            <select
                                className="w-full border border-gray-300 bg-white text-blue-950 rounded px-3 py-2 mt-1"
                                value={service.staffEmail || ''}
                                onChange={(e) => setService({ ...service, staffEmail: e.target.value })}
                            >
                                <option value="">Select a staff</option>
                                {(staffList || []).map((staff) => (
                                    <option key={staff.email} value={staff.email}>
                                        {staff.name ? `${staff.name} (${staff.email})` : staff.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-1/2">
                            <label>Check-in</label>
                            <input type="datetime-local"
                                name="dateIn"
                                value={formatDateInput(service.dateIn)}
                                onChange={(e) => setService((prev) => ({
                                    ...prev,
                                    dateIn: e.target.value
                                }))}
                                className="w-full border px-2 py-1 rounded bg-white text-blue-950"
                                min={new Date().toISOString().split('T')[0]}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                        </div>
                        <div className="w-1/2 pl-2 pr-2">
                            <label>Check-out</label>
                            <input type="datetime-local"
                                name="dateOut"
                                value={formatDateInput(service.dateOut)}
                                onChange={(e) => setService({ ...service, dateOut: e.target.value })}
                                className={`w-full border px-2 py-1 rounded text-blue-950 ${!service.dateIn ? 'bg-gray-400' : 'bg-white'}`}
                                min={service.dateIn || new Date().toISOString().split('T')[0]}
                                disabled={!service.dateIn}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full mt-4"
                        type="button"
                        onClick={onSave}
                    >
                        Save Service
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    )
}