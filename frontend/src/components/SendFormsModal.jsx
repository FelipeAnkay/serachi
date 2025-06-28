import { AnimatePresence, motion } from 'framer-motion'
import { CircleX } from 'lucide-react'
import { useEffect, useState } from 'react';
import { useFormServices } from '../store/formServices';
import toast from 'react-hot-toast';
import { useCustomerServices } from '../store/customerServices';
import { useAuthStore } from '../store/authStore';
import { useStoreServices } from '../store/storeServices';

export default function SendFormModal({ isOpen, onClose, experience }) {
    const { getFormByStoreId, sendFormEmail, generateToken } = useFormServices();
    const { getCustomerEmail } = useCustomerServices();
    const { user } = useAuthStore();
    const { store } = useStoreServices();
    const [formList, setFormList] = useState([]);
    const [customer, setCustomer] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [genToken, setGenToken] = useState(false);
    const [tokenGenerated, setTokenGenerated] = useState('');

    const [formData, setFormData] = useState({
        customer: '',
        user: user,
        store: store,
        formList: '',
        endDate: selectedDate,
        urlToken: ''
    })

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    useEffect(() => {
        const selectedFormObjects = formList.filter(f => selectedForms.includes(f._id));
        setFormData(prev => ({
            ...prev,
            formList: selectedFormObjects,
        }));

    }, [selectedForms])

    const handleSelectDate = async (endDate) => {
        try {
            //console.log("Entre a handleSelectDate")
            //console.log("fetchToken: ", experience.customerEmail)
            if (genToken) {
                const auxToken = await generateToken(experience.customerEmail, endDate, experience.storeId);
                setTokenGenerated(auxToken.token);
                //console.log("generateToken: ", auxToken);
                setFormData(prev => ({
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
        setFormData(prev => ({
            ...prev,
            endDate: auxDay,
        }));
        handleSelectDate(auxDay)
    }, [selectedDate]);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const auxForms = await getFormByStoreId(experience.storeId);
                //console.log("getFormByStoreId: ", auxForms);
                setFormList(auxForms.formList)
            } catch (error) {
                //console.log("Error fetching the forms: ", error)
                toast.error("Error fetching the forms")
            }
        }

        const fetchCustomer = async () => {
            try {
                //console.log("fetchCustomer: ", experience.customerEmail)
                const auxCustomer = await getCustomerEmail(experience.customerEmail, experience.storeId);
                //console.log("getCustomerEmail: ", auxCustomer);
                const auxC = auxCustomer.customerList[0]
                setCustomer(auxC);
                setFormData(prev => ({
                    ...prev,
                    customer: auxC,
                }));
            } catch (error) {
                //console.log("Error fetching the customer: ", error)
                toast.error("Error fetching the customer")
            }
        }

        if (experience) {
            fetchForms();
            fetchCustomer();
        }

    }, [experience])

    const handleSendForms = async () => {
        if(!tokenGenerated){
            toast.error("Please select a date");
            return;
        }

        if (selectedForms.length === 0) {
            toast.error("Please select at least one form");
            return;
        }

        try {
            await sendFormEmail(formData)
            toast.success("Forms sent successfully!");
            onClose();
        } catch (error) {
            console.error("Error sending forms:", error);
            toast.error("Failed to send forms");
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
                        className="absolute top-3 right-3 text-gray-300 hover:text-slate-800"
                        onClick={onClose}
                    >
                        <CircleX />
                    </button>

                    <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Forms</h2>
                    <div className="space-y-4">
                        <div className='flex flex-row items-center'>
                            <div>
                                <label className="block text-sm font-medium">Name: </label>
                            </div>
                            <div>
                                <label className="block font-medium text-lg ml-2">{customer.name || ''} {customer.lastName || ''}</label>
                            </div>
                        </div>
                        <div className='flex flex-row items-center'>
                            <div>
                                <label className="block text-sm font-medium">Email: </label>
                            </div>
                            <div>
                                <label className="block font-medium text-sm ml-2">{customer.email || ''}</label>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Last Day to Sign:</label>
                            <input
                                type="date"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    const selected = new Date(e.target.value);
                                    setSelectedDate(selected);
                                    setGenToken(true);
                                    setFormData(prev => ({
                                        ...prev,
                                        endDate: selected.toISOString().split('T')[0], // formato YYYY-MM-DD
                                    }));
                                }}
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 bg-white text-black"
                            />
                        </div>
                        <div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Forms:</label>
                                <div className="space-y-2">
                                    {formList.map((f) => (
                                        <label key={f._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                value={f._id}
                                                checked={selectedForms.includes(f._id)}
                                                onChange={(e) => {
                                                    const formId = f._id;
                                                    setSelectedForms(prev =>
                                                        e.target.checked
                                                            ? [...prev, formId]
                                                            : prev.filter(id => id !== formId)
                                                    );
                                                }}
                                                className="accent-blue-500"
                                            />
                                            <span>{f.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4"
                                type="button"
                                onClick={handleSendForms}
                            >
                                Send Selected Forms
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}