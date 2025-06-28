import { CircleX, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCustomerServices } from '../store/customerServices';
import toast from 'react-hot-toast';
import CustomerDetails from './CustomerDetail';
import { useStoreServices } from '../store/storeServices';
import { motion, AnimatePresence } from 'framer-motion';


export default function UserAddressBookModal({ onClose }) {
    const { customerList, getCustomerList } = useCustomerServices();
    const [query, setQuery] = useState('');
    const [customerData, setCustomerData] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const { store } = useStoreServices();

    useEffect(() => {
        //console.log("customerList: ", customerList)
        const fetchCustomers = async () => {
            try {
                await getCustomerList(store.storeId)
            } catch (error) {
                toast.error("Error filling the address book")
            }
            
        }
        if(!customerList){
            //console.log("Entré a cargar clientes")
            fetchCustomers();
        }
    }, []);

    const openEditCustomerModal = (customer) => {
        //console.log("El customer es: ", customer)
        setCustomerData({
            ...customer,
        });
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...customerData,
                storeId: store.storeId,
            };
            await updateCustomer(customerData.email, store.storeId, payload);
            toast.success('customer updated successfully');
            closeModal();
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.error('Error saving customer');
        }
    };

    const filteredUsers = customerList?.filter(
        (u) =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white text-slate-900 shadow-2xl z-[60] flex flex-col border-l border-gray-300">
            <div className="flex justify-between items-center px-4 py-3 border-b">
                <h2 className="text-lg font-semibold">User Address Book</h2>
                <button onClick={onClose}>
                    <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                </button>
            </div>

            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded"
                />
                <ul className="mt-4 space-y-2">
                    {filteredUsers?.length === 0 && (
                        <li className="text-sm text-gray-500">No customer found</li>
                    )}
                    {filteredUsers?.map((customer, i) => (
                        <li
                            key={i}
                            className="border px-3 py-2 rounded hover:bg-blue-100 cursor-pointer"
                            onClick={() => openEditCustomerModal(customer)}
                        >
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Modal Customer*/}
            <AnimatePresence>

                {(modalOpen) && (
                    <motion.div
                        className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-sky-50 text-slate-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-slate-800"
                                onClick={closeModal}
                            >
                                <CircleX />
                            </button>

                            <CustomerDetails
                                isOpen={modalOpen}
                                onClose={() => setModalOpen(false)}
                                customer={customerData}
                                setCustomer={setCustomerData}
                                onSave={handleSave}
                            />
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}