import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useServiceServices } from '../../store/serviceServices';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { CalendarPlus } from 'lucide-react';
import ServiceDetails from '../../components/ServiceDetails';
import DeleteService from '../../components/DeleteService';
import LoadingSpinner from '../../components/LoadingSpinner';


export default function PendingServices() {
    const { createService, getServicesNoData, updateService } = useServiceServices()
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const storeId = Cookies.get('storeId');
    const timezone = Cookies.get('timezone');
    const [serviceSearch, setServiceSearch] = useState("");
    const { user } = useAuthStore();
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);


    const location = useLocation();
    const navigate = useNavigate();

    const handleQuoteClick = (quoteId) => {
        //navigate(`/new-quote/${quoteId}`);
    };

    const fetchServices = async () => {
        try {
            const response = await getServicesNoData(storeId);
            //console.log("Service Response: ", response);
            setServices(response.service);
        } catch (error) {
            //console.error('Error fetching Services:', error);
            toast.error("Error fetching Services")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        //console.log("Entre a useEffect [storeId, location.key]", timezone)

        if (storeId) {
            fetchServices();
        }
    }, [storeId, location.key]);

    useEffect(() => {
        if (location.state?.updated) {
            // Limpiar el estado para que no recargue de nuevo en otros montajes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    useEffect(() => {
        //console.log("Cambio en Service", selectedService)
    }, [selectedService]);

    const handleEditServices = async (updatedService) => {
        setLoading(true)
        try {
            //console.log("En handleEditServices: ", updatedService);
            //console.log("En handleEditServices el selectedService: ", selectedService);
            await updateService(selectedService._id, selectedService);
            await fetchServices();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Service updated successfully");

        } catch (error) {
            //console.log("Error en handleEditServices");
            toast.error("Error editing services");
        } finally {
            setLoading(false);
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
                    <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white bg-clip-text">Services with missing data</h1>
                    <div className='w-full'>
                        <fieldset className="flex-grow space-y-4 border rounded-2xl p-4 ml-4 mr-4">
                            <legend className="text-2xl font-bold">Service List</legend>
                            <input
                                type="text"
                                placeholder="Search service by Customer email..."
                                className="w-full p-2 border border-gray-300 rounded"
                                value={serviceSearch}
                                onChange={(e) => setServiceSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-1">
                                {services.length === 0 ? (
                                    <p>No Services with missing data.</p>
                                ) : (
                                    services
                                        .filter(service =>
                                            service.name.toLowerCase().includes(serviceSearch.toLowerCase())
                                        )
                                        .map((service) => {
                                            //console.log("El valor de existingExperiences:", alreadyExists," - ", existingExperiences, " - ", quote._id);
                                            return (
                                                <div
                                                    key={service._id}
                                                    className="border rounded-lg p-2 hover:shadow transition relative border-gray-300 bg-blue-100 flex flex-row justify-between items-center"
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {service.name}
                                                    </h3>
                                                    <div className='flex flex-row'>
                                                        <div className="flex flex-col items-center mr-2">
                                                            <motion.button
                                                                type='button'
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => {
                                                                    setSelectedService(service);
                                                                    setIsServiceModalOpen(true);
                                                                }}
                                                                className='w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg
                                                         hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                            >
                                                                <div className='flex flex-col justify-center items-center'>
                                                                    <CalendarPlus className="" />
                                                                    <span className="">Set Data</span>
                                                                </div>
                                                            </motion.button>
                                                        </div>
                                                        <div>
                                                            <DeleteService serviceId={service._id} onDeleted={() => fetchServices()} />
                                                        </div>
                                                    </div>
                                                    {isServiceModalOpen && selectedService?._id === service._id && (
                                                        <ServiceDetails
                                                            isOpen={isServiceModalOpen}
                                                            onClose={() => setIsServiceModalOpen(false)}
                                                            service={selectedService}
                                                            setService={setSelectedService}
                                                            onSave={handleEditServices}
                                                            storeId={storeId}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </fieldset>
                    </div>
                </motion.div >
            </div >
        </>
    )
}