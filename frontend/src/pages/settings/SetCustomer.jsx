import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleX, Copy, Delete, Handshake, Save, Trash2, UserPlus, UsersRound } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useCustomerServices } from '../../store/customerServices';
import CustomerDetails from '../../components/CustomerDetail';


const SetCustomer = () => {
    const { getCustomerList, createCustomer, getCustomerEmail, removeCustomer, updateCustomer } = useCustomerServices();
    const storeId = Cookies.get('storeId');
    const [customerList, setCustomerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [customerData, setCustomerData] = useState({});
    const [emailCheckPhase, setEmailCheckPhase] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const customer = await getCustomerList(storeId);
                console.log("Respuesta de getCustomerList", customer);
                setCustomerList(customer.customerList || []);
            } catch (error) {
                console.error('Error fetching customer list:', error);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchCustomer();
            //console.log("La lista de partner es: ", partnerList)
        }
    }, []);

    useEffect(() => {
        //console.log("El partnerData es: ", partnerData)
    }, [customerData]);


    useEffect(() => {
        if (!modalOpen) return; // solo activa listener si el modal está abierto

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closeModal(); // tu función para cerrar el modal
            }
        };
        window.addEventListener('keydown', handleEsc);
        // Cleanup: remover listener cuando modal se cierra o componente desmonta
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [modalOpen]); // se ejecuta cuando cambia modalOpen

    const openNewCustomerModal = () => {
        setCustomerData({ email: '' });
        setEmailCheckPhase(true);
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditCustomerModal = (customer) => {
        //console.log("El customer es: ", customer)
        setCustomerData({
            ...customer,
        });
        setIsEditing(true);
        setEmailCheckPhase(false);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDelete(null);
    };
    const handleEmailCheck = async () => {
        if (!customerData.email) return;

        try {
            const res = await getCustomerEmail(customerData.email,storeId);
            const customerFound = res.customerList?.[0];
            console.log("handleEmailCheck customerFound:", customerFound);
            if (customerFound) {
                const alreadyAssigned = customerFound.storeId?.includes(storeId.toUpperCase());
                const updatedStoreId = alreadyAssigned
                    ? customerFound.storeId
                    : [...new Set([...customerFound.storeId, storeId.toUpperCase()])];
                setCustomerData({
                    ...customerFound,
                    storeId: updatedStoreId,
                });
                setIsEditing(true);
                toast.success('Customer founded');
            } else {
                toast.success("Customer not found, you can assign a new one");
                setIsEditing(false);
            }

            setEmailCheckPhase(false); // Pasar al formulario completo
        } catch (err) {
            console.error("Error checking customer by email:", err);
            toast.error("Error checking email");
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...customerData,
                storeId: storeId,
            };
            //console.log("Is Editing? ", isEditing);
            //console.log("El payload es: ", payload);
            if (isEditing) {
                await updateCustomer(customerData.email, storeId, payload);
                toast.success('customer updated successfully');
            } else {
                await createCustomer(payload);
                toast.success('customer created successfully');
            }

            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.error('Error saving customer');
        }
    };

    const confirmRemove = async () => {
        try {
            await removeCustomer(confirmDelete.customer, storeId);
            toast.success(`Customer ${confirmDelete.customer} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error removing customer:', error);
            toast.error('Error removing customer');
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading customer...</div>;

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-8xl mx-auto bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden"
            >
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                    Customer List
                </h2>

                <div className="flex flex-col items-center gap-3 mb-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewCustomerModal}
                    >
                        <p>Add Customer</p><UsersRound />
                    </button>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>


                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-3 mr-3 mb-3">
                    {customerList.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No customer found</div>
                    ) : (
                        customerList
                            .filter(customer => {
                                const term = searchTerm.toLowerCase();
                                return (
                                    customer.name?.toLowerCase().includes(term) ||
                                    customer.email?.toLowerCase().includes(term)
                                );
                            })
                            .map((customer) => (
                                <div
                                    key={customer._id}
                                    className="relative text-black rounded-lg shadow p-4 bg-gray-200 hover:bg-blue-100 transition-all"
                                >
                                    <div className='flex flex-col' onClick={() => openEditCustomerModal(customer)}>
                                        <p><strong>Name:</strong> {customer.name}</p>
                                        <p className='flex flex-row'><strong>Email:</strong> {customer.email}
                                            <Copy
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(customer.email)
                                                        .then(() => toast.success("Email copied!"))
                                                        .catch(() => toast.error("Failed to copy"));
                                                }}
                                                className='text-blue-500 hover:text-blue-900 ml-2'
                                            />
                                        </p>
                                        <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({ customer: customer.email })}
                                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                        title="Remove from Store"
                                    >
                                        <Trash2 />
                                    </button>
                                </div>
                            ))
                    )}
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>

                {(modalOpen || confirmDelete) && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {confirmDelete ? (
                            <motion.div
                                className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-xl font-bold mb-6 text-center text-red-400">
                                    Do you really want to remove {confirmDelete.email} from the Store?
                                </h3>
                                <div className="flex justify-around">
                                    <button
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                        onClick={confirmRemove}
                                    >
                                        Yes, Remove
                                    </button>
                                    <button
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                    onClick={closeModal}
                                >
                                    <CircleX />
                                </button>

                                <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                                    {isEditing ? 'Edit Customer' : 'New Customer'}
                                </h3>

                                {emailCheckPhase ? (
                                    <div className="space-y-4">
                                        <label>Email:</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 rounded bg-gray-800 text-white"
                                            value={customerData.email || ''}
                                            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                        />
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mt-4"
                                            onClick={handleEmailCheck}
                                        >
                                            {isEditing ? 'Continue' : 'Customer Search'}
                                        </button>
                                    </div>
                                ) : (
                                    <CustomerDetails
                                        isOpen={modalOpen}
                                        onClose={() => setModalOpen(false)}
                                        customer={customerData}
                                        setCustomer={setCustomerData}
                                        onSave={handleSave}
                                    />
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SetCustomer;