import { useEffect, useState } from 'react';
import { FileSpreadsheet, X, CircleX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerServices } from '../store/customerServices';
import { formatDateShort, } from './formatDateDisplay'

export default function ViewSignedForms({ forms, isOpen, onClose }) {
    const [selectedForm, setSelectedForm] = useState(null);
    const [customer, setCustomer] = useState([]);
    const { getCustomerEmail } = useCustomerServices();

    if (!isOpen) return null;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                //console.log("fetchCustomer: ", experience.customerEmail)
                const auxCustomer = await getCustomerEmail(forms[0].customerEmail, forms[0].storeId);
                //console.log("getCustomerEmail: ", auxCustomer);
                const auxC = auxCustomer.customerList[0]
                setCustomer(auxC);
            } catch (error) {
                //console.log("Error fetching the customer: ", error)
                toast.error("Error fetching the customer")
            }
        }

        if (forms) {
            fetchCustomer();
        }
    }, [forms])

    function formatKeyLabel(key) {
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2') // agrega espacio entre camelCase
            .replace(/^./, str => str.toUpperCase()); // capitaliza la primera letra
    }

    return (
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
                    className="absolute top-3 right-3 text-slate-700 hover:text-slate-800"
                    onClick={onClose}
                >
                    <CircleX />
                </button>
                <h2 className="text-xl font-bold mb-4 text-center text-slate-800">View Forms</h2>
                <div>
                    <div className='flex flex-row items-center'>
                        <div>
                            <label className="block text-sm font-medium">Name: </label>
                        </div>
                        <div>
                            <label className="block font-medium text-lg ml-2 px-2">{customer.name || ''} {customer.lastName || ''}</label>
                        </div>
                    </div>
                    <div className='flex flex-row items-center mt-2'>
                        <div>
                            <label className="block text-sm font-medium">Email: </label>
                        </div>
                        <div>
                            <label className="block font-medium text-sm ml-2 px-2">{customer.email || ''}</label>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className='font-bold text-lg mt-2'>Signed Form List:</h2>
                    {forms.map((form) => (
                        <motion.div
                            key={form._id}
                            whileHover={{ scale: 1.05 }}
                            className="cursor-pointer flex flex-col items-center bg-white text-gray-800 rounded-xl shadow-md p-3 mt-3"
                            onClick={() => setSelectedForm(form)}
                        >
                            <FileSpreadsheet className="w-10 h-10 text-cyan-900" />
                            <span className="text-sm mt-2 font-semibold text-center">{form.formName}</span>
                            <span className="text-sm mt-2 font-semibold text-center">{formatDateShort(form.signedAt)}</span>
                        </motion.div>
                    ))}

                </div>
                <AnimatePresence>
                    {selectedForm && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white text-black rounded-2xl max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh] relative"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                            >
                                <button
                                    onClick={() => setSelectedForm(null)}
                                    className="absolute top-4 right-4 text-gray-700 hover:text-red-600"
                                >
                                    <X size={24} />
                                </button>

                                <h2 className="text-2xl font-bold mb-4">{selectedForm.formName}</h2>

                                <div className="mb-4 whitespace-pre-wrap text-sm border p-4 bg-gray-50 rounded">
                                    {selectedForm.formTxt}
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-2">Form Answers:</h3>
                                    <ul className="list-disc pl-5 text-sm">
                                        {Object.entries(selectedForm.answers || {}).map(([key, value]) => (
                                            <li key={key}>
                                                <strong>{formatKeyLabel(key)}:</strong> {value || ''}
                                            </li>
                                        ))}
                                        <li key="date">
                                            <strong>Signing Date:</strong> {formatDateShort(selectedForm.signedAt)}
                                        </li>
                                    </ul>
                                </div>

                                {selectedForm.signature && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Customer Signature:</h3>
                                        <img
                                            src={selectedForm.signature}
                                            alt="Signature"
                                            className="max-w-xs border p-2 rounded bg-gray-100"
                                        />
                                    </div>
                                )}
                                {selectedForm.signatureGuardian && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Customer Guardian Signature:</h3>
                                        <img
                                            src={selectedForm.signatureGuardian}
                                            alt="Signature"
                                            className="max-w-xs border p-2 rounded bg-gray-100"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}