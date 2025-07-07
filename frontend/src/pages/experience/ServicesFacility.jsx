import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Copy, FolderCheck, MapPinCheckInside, Pencil, ShipWheel, UserCog } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useServiceServices } from '../../store/serviceServices';
import AssignFacilityModal from '../../components/AssignFacilityModal';



export default function ServicesFacility() {
    const { getServicesFacility } = useServiceServices();
    const { user } = useAuthStore();
    const [serviceList, setServiceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const storeId = Cookies.get('storeId');
    const timezone = Cookies.get('timezone');
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchServices = async (date, withFacility) => {
        try {
            //console.log("llamara a getServicesFacility: ", {date, storeId, withFacility});
            const response = await getServicesFacility(date, storeId, withFacility);
            //console.log("getExperienceByCheckout: ", response);
            setServiceList(response.serviceList);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        //console.log("Entre a useEffect [storeId, location.key]", timezone);
        if (storeId) {
            const today = new Date();
            fetchServices(today, "false");
        }
    }, [storeId, location.key]);

    useEffect(() => {
        if (location.state?.updated) {
            // Limpiar el estado para que no recargue de nuevo en otros montajes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    const handleOpenModal = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    }


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
                    className="
                                flex flex-col
                                bg-sky-50 backdrop-filter backdrop-blur-lg
                                rounded-2xl shadow-2xl border border-gray-800 overflow-hidden
                                min-h-[calc(100vh-5rem)]
                                w-full max-w-7xl
                                px-4 py-6
                                mt-4
                                mx-auto
                            "
                >
                    <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-[#00C49F] bg-clip-text">Services without facility</h1>
                    <div className='w-full'>
                        <fieldset className="flex-grow space-y-2 rounded-2xl p-4">
                            <legend className="text-2xl font-bold">Services</legend>
                            <input
                                type="text"
                                placeholder="Search service by name..."
                                className="w-full p-2 border rounded bg-white text-slate-900  border-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-1">
                                {!serviceList || serviceList.length === 0 ? (
                                    <p>No services whithout facility.</p>
                                ) : (
                                    serviceList
                                        .filter(service =>
                                            service.name.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((service) => {
                                            return (
                                                <div
                                                    key={service._id}
                                                    className="border rounded-lg p-4 hover:shadow transition relative bg-white border-slate-300 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0"

                                                >
                                                    < h3 className="text-lg font-semibold text-gray-800">
                                                        {(service.name ? service.name : service.customerEmail)} - From: {new Date(service.dateIn).toLocaleDateString("en-US", {
                                                            timeZone: timezone || "America/Guatemala",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                        {' to ' + new Date(service.dateOut).toLocaleDateString("en-US", {
                                                            timeZone: timezone || "America/Guatemala",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </h3>
                                                    <div className='justify-between items-center flex flex-col sm:flex-row gap-2 w-full sm:justify-end sm:w-1/2'>
                                                        <motion.button
                                                            type='button'
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title='Send profile to complete'
                                                            onClick={() => {
                                                                handleOpenModal(service);
                                                            }}
                                                            className='w-full py-3 px-4 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg
                                                         focus:ring-offset-1 focus:ring-offset-cyan-900'
                                                        >
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <ShipWheel />
                                                                <span>Set Facility</span>
                                                            </div>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </fieldset>
                        {isModalOpen && (
                            <AssignFacilityModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                service={selectedService}
                            />
                        )}
                    </div>
                </motion.div >
            </div >
        </>
    )
}