import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStaffServices } from '../../store/staffServices';
import Cookies from 'js-cookie';
import { CircleX, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useServiceServices } from '../../store/serviceServices';
import { useProductServices } from '../../store/productServices';
import LoadingSpinner from '../../components/LoadingSpinner';

const AssignStaff = () => {
    const { getServiceById, updateService, getServicesNoStaff } = useServiceServices();
    const { getProductById } = useProductServices();
    const { getStaffList } = useStaffServices();
    const storeId = Cookies.get("storeId");
    const [services, setServices] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true)
            try {
                const response = await getServicesNoStaff(storeId);
                let rawServices = response.service || [];

                // Traer nombres de productos:
                const servicesWithProductNames = await Promise.all(
                    rawServices.map(async (service) => {
                        try {
                            const product = await getProductById(service.productId);
                            //console.log("F: El producto encontrado es: ", product);
                            return { ...service, productName: product.product.name || 'Unknown Product' };
                        } catch (error) {
                            console.error("Error fetching product:", error);
                            return { ...service, productName: 'Unknown Product' };
                        }
                    })
                );

                setServices(servicesWithProductNames);
            } catch (err) {
                setError('Services not found');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const fetchStaff = async () => {
            setLoading(true)
            try {
                const staffResponse = await getStaffList(storeId); // Obtener la lista de staff
                console.log("F: La respuesta de getStaffList es: ", staffResponse)
                setStaffList(staffResponse.staffList || []);
            } catch (err) {
                console.error("Error fetching staff:", err);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchServices();
            fetchStaff();
        }
    }, []);

    const openModal = (service) => {
        setSelectedService(service);
        setEditData({
            name: service.name || '',
            finalPrice: service.finalPrice || '',
            currency: service.currency || 'USD',
            productId: service.productId || '',
            facilityId: service.facilityId || '',
            staffEmail: service.staffEmail || '',
            customerEmail: service.customerEmail || '',
            dateIn: service.dateIn ? new Date(service.dateIn).toISOString().slice(0, 16) : '',
            dateOut: service.dateOut ? new Date(service.dateOut).toISOString().slice(0, 16) : '',
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedService(null);
        setEditData({});
    };

    const handleUpdate = async () => {
        if (!selectedService) return;
        setLoading(true)
        try {
            await updateService(selectedService._id, {
                ...editData,
                finalPrice: Number(editData.finalPrice),
                dateIn: editData.dateIn ? new Date(editData.dateIn) : null,
                dateOut: editData.dateOut ? new Date(editData.dateOut) : null,
            });
            toast.success('Service Updated');
            closeModal();
            window.location.reload(); // recarga la lista
        } catch (error) {
            console.error('Error updating service:', error);
            toast.error('Error - Service was not updated');
        } finally {
            setLoading(false)
        }
    };

    return (
        <>
            {
                loading && (
                    <LoadingSpinner />
                )
            }
            <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col w-full max-w-9/12 mx-auto bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center"
                >
                    <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                        Assign Staff to Services
                    </h2>
                    <div className="flex-grow overflow-auto p-4 space-y-4">
                        {services.length === 0 ? (
                            <div className="text-center text-gray-400">No services pending staff assignment</div>
                        ) : (
                            services.map((service) => (
                                <div
                                    key={service._id}
                                    className="bg-white text-black rounded-lg shadow-md p-4 hover:bg-blue-100 cursor-pointer"
                                    onClick={() => openModal(service)}
                                >
                                    <p><strong>Name:</strong> {service.name}</p>
                                    <p><strong>Product:</strong> {service.productName}</p>
                                    <p><strong>Customer:</strong> {service.customerEmail || 'Not assigned'}</p>
                                    <p><strong>Date In:</strong> {service.dateIn ? new Date(service.dateIn).toLocaleString() : 'No date'}</p>
                                    <p><strong>Date Out:</strong> {service.dateOut ? new Date(service.dateOut).toLocaleString() : 'No date'}</p>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Modal para editar */}
                <AnimatePresence>
                    {modalOpen && selectedService && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
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
                                    Edit Service
                                </h3>

                                <div className="space-y-4 text-sm">

                                    {/* Staff Email como dropdown */}
                                    <div>
                                        <label className="capitalize">Staff Email:</label>
                                        <select
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                            value={editData.staffEmail}
                                            onChange={(e) => setEditData({ ...editData, staffEmail: e.target.value })}
                                        >
                                            <option value="">Select Staff</option>
                                            {staffList.map((staff) => (
                                                <option key={staff.email} value={staff.email}>
                                                    {staff.name} ({staff.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <hr className="border-gray-700 my-4" />

                                    <div>
                                        <label className="capitalize">Product Name:</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white opacity-50 cursor-not-allowed"
                                            value={selectedService.productName}
                                            disabled
                                        />
                                    </div>

                                    {Object.keys(editData)
                                        .filter(field => field !== 'finalPrice' && field !== 'currency' && field !== 'staffEmail' && field !== 'productId')
                                        .map((field) => (
                                            <div key={field}>
                                                <label className="capitalize">
                                                    {field === 'name' ? 'Service Name' : field}:
                                                </label>
                                                <input
                                                    type={field.includes('date') ? 'datetime-local' : 'text'}
                                                    className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                                    value={editData[field]}
                                                    onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                                                />
                                            </div>
                                        ))}

                                    {/* Botón Save */}
                                    <div className="flex justify-center mt-6">
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                                            onClick={handleUpdate}
                                        >
                                            <p>Save</p><Save />
                                        </button>
                                    </div>

                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default AssignStaff;