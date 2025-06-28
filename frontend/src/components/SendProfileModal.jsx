import { AnimatePresence, motion } from 'framer-motion'
import { CircleX, Send } from 'lucide-react'
import { useEffect, useState } from 'react';
import { useFormServices } from '../store/formServices';
import toast from 'react-hot-toast';
import { useCustomerServices } from '../store/customerServices';
import { useAuthStore } from '../store/authStore';
import { useStoreServices } from '../store/storeServices';

export default function SendProfileModal({ isOpen, onClose, customerEmail }) {
    const { generateToken } = useFormServices();
    const { getCustomerEmail, sendProfileEmail } = useCustomerServices();
    const { user } = useAuthStore();
    const { store } = useStoreServices();
    const [customer, setCustomer] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [genToken, setGenToken] = useState(false);

    const [formProfileData, setFormProfileData] = useState({
        customer: '',
        user: user,
        store: store,
        endDate: '',
        urlToken: ''
    })

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])


    const handleProfileSelectDate = async (endDate) => {
        try {
            //console.log("Entre a handleSelectDate")
            //console.log("fetchToken: ", experience.customerEmail)
            if (genToken) {
                const auxToken = await generateToken(customer.customerEmail, endDate, store.storeId);
                console.log("generateToken: ", auxToken);
                setFormProfileData(prev => ({
                    ...prev,
                    urlToken: auxToken.token,
                }));
                setGenToken(false);
            }

        } catch (error) {
            //console.log("Error fetching the token: ", error)
            toast.error("Error fetching the token")
        }
    }

    useEffect(() => {
        const auxDay = selectedDate.toISOString().split('T')[0]
        setFormProfileData(prev => ({
            ...prev,
            endDate: auxDay,
        }));
        handleProfileSelectDate(auxDay)
    }, [selectedDate]);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                //console.log("fetchCustomer: ", experience.customerEmail)
                const auxCustomer = await getCustomerEmail(customerEmail, store.storeId);
                //console.log("getCustomerEmail: ", auxCustomer);
                const auxC = auxCustomer.customerList[0]
                setCustomer(auxC);
                setFormProfileData(prev => ({
                    ...prev,
                    customer: auxC,
                }));
            } catch (error) {
                //console.log("Error fetching the customer: ", error)
                toast.error("Error fetching the customer")
            }
        }

        if (customerEmail) {
            fetchCustomer();
        }

    }, [customerEmail])

    const handleSendProfile = async () => {
        try {
            await sendProfileEmail(formProfileData)
            toast.success("Profile sent successfully!");
            onClose();
        } catch (error) {
            console.error("Error sending forms:", error);
            toast.error("Error sending the profile");
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

                    <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Send profile to fill out</h2>
                    <div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Last Day to Complete:</label>
                            <input
                                type="date"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    const selected = new Date(e.target.value);
                                    setSelectedDate(selected);
                                    setGenToken(true);
                                    setFormProfileData(prev => ({
                                        ...prev,
                                        endDate: selected.toISOString().split('T')[0], // formato YYYY-MM-DD
                                    }));
                                }}
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 bg-white text-black"
                            />
                        </div>
                        <div>
                            <button
                                className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4 flex flex-row justify-center text-center items-center"
                                type="button"
                                onClick={handleSendProfile}
                            >
                                Send
                                <Send className='ml-2 text-center items-center' />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}