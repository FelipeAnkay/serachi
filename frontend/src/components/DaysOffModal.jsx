import { AnimatePresence, motion } from 'framer-motion'
import { CalendarX, CircleX, Send } from 'lucide-react'
import { useEffect, useState } from 'react';
import { useFormServices } from '../store/formServices';
import toast from 'react-hot-toast';
import { useCustomerServices } from '../store/customerServices';
import { useAuthStore } from '../store/authStore';
import { useStoreServices } from '../store/storeServices';
import { useStaffServices } from '../store/staffServices';
import { useStaffDaysOffServices } from '../store/staffDaysOffServices'
import DateRangePicker from './DateRangePicker';
import { formatDateDisplay } from './formatDateDisplay';

export default function DaysOffModal({ isOpen, onClose, staffEmail }) {
    const { getStaffEmail } = useStaffServices();
    const { getDaysOffByEmail, createStaffDaysOff, updateDaysOff, removeDaysOff } = useStaffDaysOffServices();
    const [staff, setStaff] = useState({})
    const [daysOffList, setDaysOffList] = ([])
    const { user } = useAuthStore();
    const { store } = useStoreServices();
    const [selectedDate, setSelectedDate] = useState(new Date());
    let firstLoad = true;

    const [formDaysOffData, setFormDaysOffData] = useState({
        staffEmail: '',
        user: user,
        storeId: store.storeId,
        dateIn: '',
        dateOut: '',
        endDate: '',
    })

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const fetchStaff = async () => {
        try {
            const auxStaff = await getStaffEmail(staffEmail);
            console.log("auxStaff", auxStaff)
            setStaff(auxStaff.staffList)
        } catch (error) {
            toast.error("Error fetching staff")
        }
    }
    const fetchDaysOff = async () => {
        try {
            const auxDaysOff = await getDaysOffByEmail(staffEmail);
            console.log("auxStaff", auxDaysOff)
            setDaysOffList(auxDaysOff.staffDaysOffList)
        } catch (error) {
            toast.error("Error fetching days off")
        }
    }

    useEffect(() => {
        if (firstLoad) {
            fetchStaff();
            fetchDaysOff()
            firstLoad = false
        }
    }, [staffEmail])

    const handleSubmit = async () => {
        try {

            toast.success("Days off requested successfully!");
            onClose();
        } catch (error) {
            console.error("Error sending days off:", error);
            toast.error("Error sending the days off");
        }
    }

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

                    <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Request days off</h2>
                    <div>
                        <div className="mt-2">
                            <p className='text-lg font-semibold text-slate-600'>{staff.name || "No staff"}</p>
                        </div>
                        <div>
                            {daysOffList.length > 0 ? (
                                <>
                                    {daysOffList.map(([date, count]) => (
                                        <div key={date} className="flex items-center gap-2 bg-white rounded p-2 border">
                                            <p>{count}.- From: {formatDateDisplay(date.dateIn)} to {formatDateDisplay(date.dateOut)}</p>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className='text-sm font-light text-slate-600'>No days off requested</p>
                            )}
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium mb-1">Day(s) off to request:</label>
                            <DateRangePicker
                                value={{ start: formDaysOffData.dateIn, end: formDaysOffData.dateOut }}
                                onChange={({ start, end }) =>
                                    setFormDaysOffData((prev) => ({
                                        ...prev,
                                        dateIn: start,
                                        dateOut: end
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <button
                                className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4 flex flex-row justify-center text-center items-center"
                                type="button"
                                onClick={handleSubmit}
                            >
                                Request
                                <CalendarX className='ml-2 text-center items-center' />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}