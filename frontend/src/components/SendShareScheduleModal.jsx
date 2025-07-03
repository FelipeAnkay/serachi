import { AnimatePresence, motion } from 'framer-motion'
import { CircleX, Search, Send } from 'lucide-react'
import { useEffect, useState } from 'react';
import { useFormServices } from '../store/formServices';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useStoreServices } from '../store/storeServices';
import { useStaffServices } from '../store/staffServices';

export default function SendShareScheduleModal({ isOpen, onClose }) {
    const { generateToken } = useFormServices();
    const { sendScheduleEmail, getStaffList } = useStaffServices();
    const { user } = useAuthStore();
    const { store } = useStoreServices();
    const [selectedDate, setSelectedDate] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState([])
    const [isDateSelected, setIsDateSelected] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    useEffect(() => {
        if (staffList?.length === 0) {
            fetchStaff();
        }
    }, [staffList]);

    const fetchStaff = async () => {
        try {
            //console.log("fetchCustomer: ", experience.customerEmail)
            const auxStaffList = await getStaffList(store.storeId);
            //console.log("getStaffList: ", auxStaffList);
            const auxC = auxStaffList.staffList
            setStaffList(auxC);
        } catch (error) {
            //console.log("Error fetching the customer: ", error)
            toast.error("Error fetching staff")
        }
    }

    const handleSendSchedule = async () => {
        try {
            for (const auxStaff of selectedStaff) {
                //console.log("El staff es: ", auxStaff)
                const auxToken = await generateToken(auxStaff.email, selectedDate, store.storeId);
                //console.log("generateToken: ", auxToken);
                let payload = {
                    staff: auxStaff,
                    user: user,
                    store: store,
                    endDate: selectedDate,
                    urlToken: auxToken.token
                }
                //console.log("Enviare: ", payload)
                await sendScheduleEmail(payload)
            }
            toast.success("Schedule sent successfully!");
            onClose();
        } catch (error) {
            console.error("Error sending schedule:", error);
            toast.error("Error sending the schedule");
        }
    }

    const handleCheckboxChange = (staff) => {
        setSelectedStaff((prev) => {
            const alreadySelected = prev.find((s) => s.email === staff.email);

            if (alreadySelected) {
                // Quitar si ya está seleccionado
                return prev.filter((s) => s.email !== staff.email);
            } else {
                // Agregar si no está seleccionado
                return [...prev, staff];
            }
        });
    };

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
                        className="absolute top-3 right-3 text-gray-700 hover:text-slate-500"
                        onClick={onClose}
                    >
                        <CircleX />
                    </button>

                    <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Send Schedule</h2>
                    <div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Select who will receive the schedule:</label>
                            {staffList?.length > 0 && (
                                staffList.map((staff) => {
                                    return (
                                        <div key={staff._id} className="flex items-center gap-2 bg-white rounded p-2 border">
                                            <input
                                                type="checkbox"
                                                id={`${staff._id}`}
                                                className="accent-blue-500"
                                                value={staff.email}
                                                onChange={() => handleCheckboxChange(staff)}
                                            />
                                            <label className="text-sm text-slate-900">
                                                {staff.name} ({staff.email})
                                            </label>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                        {selectedStaff?.length > 0 && (
                            <div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-1">Select a link expiration date:</label>
                                    <input
                                        type="date"
                                        value={selectedDate ? selectedDate.toISOString().split('T')[0] : ""}
                                        onChange={(e) => {
                                            const selected = new Date(e.target.value);
                                            setSelectedDate(selected);
                                            setIsDateSelected(true);
                                        }}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    {isDateSelected ? (
                                        <button
                                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4 flex flex-row justify-center items-center"
                                            type="button"
                                            onClick={handleSendSchedule}
                                        >
                                            Send
                                            <Send className="ml-2" />
                                        </button>
                                    ) : (
                                        <p className="text-red-400 mt-4 text-center">Please select a date</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    )
}