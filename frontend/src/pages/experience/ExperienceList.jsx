import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Copy, FolderCheck, MapPinCheckInside, Pencil, UserCog } from 'lucide-react';
import { useExperienceServices } from '../../store/experienceServices';
import SendFormModal from '../../components/SendFormsModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useFormRecordServices } from '../../store/formRecordServices';
import toast from 'react-hot-toast';
import ViewSignedForms from '../../components/ViewSignedForm';
import SendProfileModal from '../../components/SendProfileModal';
import ExperienceModal from '../../components/ExperienceModal';
import { useAuthStore } from '../../store/authStore';



export default function ExperienceList() {
    const { getExperienceByCheckout } = useExperienceServices();
    const { user } = useAuthStore();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const storeId = Cookies.get('storeId');
    const timezone = Cookies.get('timezone');
    const [experienceSearch, setExperienceSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState([]);
    const { getFormRecordByEmail } = useFormRecordServices();
    const [records, setRecords] = useState([]);
    const [loadRecords, setLoadRecords] = useState(false);
    const [selectedForms, setSelectedForms] = useState([]);
    const [isModalFormOpen, setIsModalFormOpen] = useState(false);
    const [modalProfileOpen, setModalProfileOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [modalExperienceOpen, setModalExperienceOpen] = useState(false);
    const [experienceCreated, setExperienceCreated] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        //console.log("Entre a useEffect [storeId, location.key]", timezone);
        const fetchExperiences = async () => {
            try {
                //console.log("llamaré a getExperienceByCheckout: ", storeId);
                const response = await getExperienceByCheckout(storeId);
                //console.log("getExperienceByCheckout: ", response);
                setExperiences(response.experienceList);
                setLoadRecords(true);
            } catch (error) {
                console.error('Error fetching experiences:', error);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchExperiences();
        }
    }, [storeId, location.key]);

    useEffect(() => {
        //console.log("Entre a UseEffect de Experience")
        const fetchRecords = async () => {
            setLoading(true)
            let formList = [];
            //console.log("Entré a fetchRecords: ", experiences)
            try {
                const uniqueCustomerEmails = [...new Set(experiences.map(exp => exp.customerEmail))];
                //console.log("Listado de emails: ", uniqueCustomerEmails)
                for (let i = 0; i <= uniqueCustomerEmails.length; i++) {
                    const auxForm = await getFormRecordByEmail(uniqueCustomerEmails[i], storeId);
                    //console.log("Resultado de getFormRecordByEmail: ", auxForm)
                    if (auxForm.formRecordList.length > 0) {
                        auxForm.formRecordList.forEach(record => {
                            formList.push(record);
                        });
                    }

                }
                setRecords(formList);
            } catch (error) {
                toast.error("Error getting forms")
            } finally {
                setLoading(false)
            }
        }
        if (experiences.length > 0) {
            fetchRecords();
        }
    }, [loadRecords]);

    useEffect(() => {
        if (location.state?.updated) {
            // Limpiar el estado para que no recargue de nuevo en otros montajes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                //console.log("llamaré a getExperienceByCheckout: ", storeId);
                const response = await getExperienceByCheckout(storeId);
                //console.log("getExperienceByCheckout: ", response);
                setExperiences(response.experienceList);
                setLoadRecords(true);
            } catch (error) {
                console.error('Error fetching experiences:', error);
            } finally {
                setLoading(false);
            }
        };
        if (experienceCreated) {
            fetchExperiences();
            setExperienceCreated(false);
        }
    }, [experienceCreated]);

    const handleSendFormClick = () => {
        setIsModalOpen(true)
    }

    const openSendProfileModal = () => {
        setModalProfileOpen(true)
    }

    const handleSelectedForms = (email) => {
        const filteredForms = records.filter(form => form.customerEmail === email);
        setSelectedForms(filteredForms);
        setIsModalFormOpen(true);
    };

    const handleNewExperience = () => {
        console.log("Entre a handleNewExperience")
        setModalExperienceOpen(true);
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
                    className="
                                flex flex-col
                                bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg
                                rounded-2xl shadow-2xl border border-gray-800 overflow-hidden
                                min-h-[calc(100vh-5rem)]
                                w-full max-w-7xl
                                px-4 py-6
                                mt-4
                                mx-auto
                            "
                >
                    <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white bg-clip-text">Active Experiences</h1>
                    <div className='w-full'>
                        <fieldset className="flex-grow space-y-4 border rounded-2xl p-4">
                            <legend className="text-2xl font-bold">Experience List</legend>
                            <div className='flex flex-row items-center justify-center'>
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-max flex flex-row gap-2"
                                    type="button"
                                    onClick={handleNewExperience}
                                >
                                   New Experience
                                   <MapPinCheckInside/>
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Search experience by email or name..."
                                className="w-full p-2 border border-gray-300 rounded"
                                value={experienceSearch}
                                onChange={(e) => setExperienceSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-1">
                                {!experiences || experiences.length === 0 ? (
                                    <p>No experiences found for this store.</p>
                                ) : (
                                    experiences
                                        .filter(experience =>
                                            experience.name.toLowerCase().includes(experienceSearch.toLowerCase())
                                        )
                                        .map((experience) => {
                                            return (
                                                <div
                                                    key={experience._id}
                                                    className="border rounded-lg p-4 hover:shadow transition relative border-gray-300 bg-blue-100 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0"

                                                >
                                                    < h3 className="text-lg font-semibold text-gray-800">
                                                        {(experience.name ? experience.name : experience.customerEmail)} - From: {new Date(experience.dateIn).toLocaleDateString("en-US", {
                                                            timeZone: timezone || "America/Guatemala",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                        {' to ' + new Date(experience.dateOut).toLocaleDateString("en-US", {
                                                            timeZone: timezone || "America/Guatemala",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                        {' - ' + experience.serviceList.length + ' Services '}
                                                    </h3>
                                                    <div className='justify-between items-center flex flex-col sm:flex-row gap-2 w-full sm:justify-end sm:w-1/2'>
                                                        <motion.button
                                                            type='button'
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title='Send profile to complete'
                                                            onClick={() => {
                                                                setSelectedCustomer(experience.customerEmail);
                                                                openSendProfileModal(experience.customerEmail);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                            className='py-3 px-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold rounded-lg shadow-lg
                hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                        >
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <UserCog />
                                                                <span>Send Profile</span>
                                                            </div>
                                                        </motion.button>
                                                        {/* Botón SEND FORMS */}
                                                        <motion.button
                                                            type='button'
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                setSelectedExperience(experience);
                                                                handleSendFormClick(experience);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                            className='py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg
                hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                        >
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <FolderCheck />
                                                                <span>Send Forms</span>
                                                            </div>
                                                        </motion.button>

                                                        {/* Botón VIEW FORMS (solo si hay registros) */}
                                                        {
                                                            records.some(r => r.customerEmail === experience.customerEmail) && (
                                                                <motion.button
                                                                    type='button'
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleSelectedForms(experience.customerEmail)}
                                                                    className='py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg
                                                        hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                                >
                                                                    <div className='flex flex-col justify-center items-center'>
                                                                        <Copy />
                                                                        <span>View Forms</span>
                                                                    </div>
                                                                </motion.button>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </fieldset>
                        {isModalOpen && (
                            <SendFormModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                experience={selectedExperience}
                            />
                        )}
                        {isModalFormOpen && (
                            <ViewSignedForms
                                forms={selectedForms}
                                isOpen={isModalFormOpen}
                                onClose={() => setIsModalFormOpen(false)}
                            />
                        )}
                        {modalProfileOpen && (
                            <SendProfileModal
                                isOpen={modalProfileOpen}
                                onClose={() => setModalProfileOpen(false)}
                                customerEmail={selectedCustomer}
                            />
                        )}
                        {modalExperienceOpen && (
                            <ExperienceModal
                                isOpen={modalExperienceOpen}
                                onClose={() => setModalExperienceOpen(false)}
                                experience={''}
                                setExperience={''}
                                onSave={''}
                                storeId={storeId}
                                userEmail={user.email}
                                created={() => setExperienceCreated(true)}
                            />
                        )}
                    </div>
                </motion.div >
            </div >
        </>
    )
}