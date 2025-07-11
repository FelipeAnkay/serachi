import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleX, Copy, Send, Signature, Trash2, UsersRound } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useCustomerServices } from '../../store/customerServices';
import CustomerDetails from '../../components/CustomerDetail';
import { useStoreServices } from '../../store/storeServices';
import { useAuthStore } from '../../store/authStore';
import SendProfileModal from '../../components/SendProfileModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useFormRecordServices } from '../../store/formRecordServices';
import ViewSignedForms from '../../components/ViewSignedForm';

const SetCustomer = () => {
    const { getCustomerList, createCustomer, getCustomerEmail, removeCustomer, updateCustomer } = useCustomerServices();

    const storeId = Cookies.get('storeId');
    const { user } = useAuthStore();
    const { store } = useStoreServices();
    const [customerList, setCustomerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [customerData, setCustomerData] = useState({});
    const [emailCheckPhase, setEmailCheckPhase] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalProfileOpen, setModalProfileOpen] = useState(false);
    const [sendProfile, setSendProfile] = useState(false);
    const { getFormRecordByEmail } = useFormRecordServices();
    const [modalFormOpen, setModalFormOpen] = useState(false);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const customer = await getCustomerList(storeId);
                //console.log("Respuesta de getCustomerList", customer);
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

    const fetchRecords = async (customer) => {
        setLoading(true)
        let formList = [];
        //console.log("Entré a fetchRecords: ", experiences)
        try {
            const auxForm = await getFormRecordByEmail(customer.email, storeId);
            //console.log("Resultado de getFormRecordByEmail: ", auxForm)
            if (auxForm.formRecordList.length > 0) {
                auxForm.formRecordList.forEach(record => {
                    formList.push(record);
                });
            }else{
                return false;
            }
            setRecords(formList);
            return true;
        } catch (error) {
            toast.error("Error getting forms")
        } finally {
            setLoading(false)
        }
    }

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

    useEffect(() => {
        if (!modalProfileOpen) return; // solo activa listener si el modal está abierto

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closeProFileModal(); // tu función para cerrar el modal
            }
        };
        window.addEventListener('keydown', handleEsc);
        // Cleanup: remover listener cuando modal se cierra o componente desmonta
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [modalProfileOpen]); // se ejecuta cuando cambia modalOpen

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

    const handleOpenFormModal = async (customer) => {
        //console.log("El customer es: ", customer)
        const auxRecords = await fetchRecords(customer);
        //console.log("Records: ", auxRecords)
        if (auxRecords) {
            setModalFormOpen(true);
        }else{
            toast.error("No forms signed")
        }

    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDelete(null);
    };

    const closeProFileModal = () => {
        setModalProfileOpen(false);
        setConfirmDelete(null);
        setFormData({
            customer: '',
            user: user,
            store: store,
            endDate: '',
            urlToken: ''
        })
    };

    const closeFormModal = () => {
        setRecords([]);
        setModalFormOpen(false);
    }
    const handleEmailCheck = async () => {
        if (!customerData.email) return;

        try {
            const res = await getCustomerEmail(customerData.email, storeId);
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
                toast.success('Customer found');
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

    const openSendProfileModal = (auxCustomer) => {
        setCustomerData({
            ...auxCustomer,
        });
        setModalProfileOpen(true)
    }

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

    return (
        <>
            {
                loading && (
                    <LoadingSpinner />
                )
            }
            <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col w-full max-w-9/12 mx-auto bg-[#EEF9FC] bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
                >
                    <h2 className="text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text">
                        Customer List
                    </h2>

                    <div className="flex flex-col items-center gap-3 mb-4 w-full">
                        <button
                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded flex items-center gap-2"
                            onClick={openNewCustomerModal}
                        >
                            <p>Add Customer</p><UsersRound />
                        </button>

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-md px-4 py-2 rounded bg-white text-slate-900 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 px-2">
                        {customerList.length === 0 ? (
                            <div className="text-center text-slate-900col-span-full">No customer found</div>
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
                                        className="relative text-slate-800 rounded-lg shadow p-4 bg-white border border-slate-300  hover:bg-blue-100 transition-all"
                                    >
                                        <div className='flex flex-col'>
                                            <div className="flex flex-col w-7/8" onClick={() => openEditCustomerModal(customer)}>
                                                <p><strong>Name:</strong> {customer.name}</p>
                                                <p><strong>Last Name:</strong> {customer.lastName || ''}</p>
                                                <p className="flex flex-row">
                                                    <strong>Email:</strong>&nbsp;{customer.email}
                                                </p>
                                                <p><strong>Phone:</strong> {customer.phone || '-'}</p>
                                            </div>
                                            <div className='w-full flex flex-row justify-between mt-2'>
                                                {sendProfile && (
                                                    <button
                                                        onClick={() => openSendProfileModal(customer)}
                                                        className=" text-green-600 hover:text-green-800"
                                                        title="Send Profile"
                                                    >
                                                        <Send />
                                                    </button>
                                                )}
                                                <button className='mt-2' title="Copy Email">
                                                    <Copy
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(customer.email)
                                                                .then(() => toast.success("Email copied!"))
                                                                .catch(() => toast.error("Failed to copy"));
                                                        }}
                                                        className="text-blue-500 hover:text-blue-900"
                                                    />
                                                </button>
                                                <button className='mt-2' title="View Signed Forms">
                                                    <Signature
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenFormModal(customer);
                                                        }}
                                                        className="text-slate-700 hover:text-slate-900"
                                                    />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete({ customer: customer.email })}
                                                    className="text-red-600 hover:text-red-800 mt-2"
                                                    title="Remove from Store"
                                                >
                                                    <Trash2 />
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </motion.div>

                {/* Modal Customer*/}
                <AnimatePresence>

                    {(modalOpen || confirmDelete) && (
                        <motion.div
                            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {confirmDelete ? (
                                <motion.div
                                    className="bg-sky-50 text-slate-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
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
                                            className="bg-red-400 hover:bg-red-500 text-slate-800 px-4 py-2 rounded"
                                            onClick={confirmRemove}
                                        >
                                            Yes, Remove
                                        </button>
                                        <button
                                            className="bg-gray-700 hover:bg-gray-600 text-slate-800 px-4 py-2 rounded"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
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

                                    <h3 className="text-2xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text">
                                        {isEditing ? 'Edit Customer' : 'New Customer'}
                                    </h3>

                                    {emailCheckPhase ? (
                                        <div className="space-y-4">
                                            <label>Email:</label>
                                            <input
                                                type="email"
                                                className="bg-white text-slate-900 border border-slate-300 rounded w-full p-2"
                                                value={customerData.email || ''}
                                                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                            />
                                            <button
                                                className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4"
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

                {/* Modal Profile*/}
                <AnimatePresence>

                    {(modalProfileOpen) && (
                        <SendProfileModal
                            isOpen={modalProfileOpen}
                            onClose={() => setModalProfileOpen(false)}
                            customerEmail={customerData.email}
                        />
                    )}
                    {modalFormOpen && (
                        <ViewSignedForms
                            forms={records}
                            isOpen={modalFormOpen}
                            onClose={() => closeFormModal()}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default SetCustomer;