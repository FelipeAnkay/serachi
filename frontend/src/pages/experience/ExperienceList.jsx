import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Copy, FolderCheck, Pencil } from 'lucide-react';
import { useExperienceServices } from '../../store/experienceServices';
import SendFormModal from '../../components/SendFormsModal';
import LoadingSpinner from '../../components/LoadingSpinner';


export default function ExperienceList() {
    const { getExperienceByCheckout } = useExperienceServices();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const storeId = Cookies.get('storeId');
    const timezone = Cookies.get('timezone');
    const [experienceSearch, setExperienceSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState([]);

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
        if (location.state?.updated) {
            // Limpiar el estado para que no recargue de nuevo en otros montajes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    const handleSendFormClick = () => {
        setIsModalOpen(true)
    }

    return (
        <>
            {
                loading && (
                    <LoadingSpinner/>
                )
            }
            <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col w-full max-w-8xl mx-auto bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen"
                >
                    <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white bg-clip-text">Active Experiences</h1>
                    <div>
                        <fieldset className="flex-grow space-y-4 border rounded-2xl p-4 ml-4 mr-4">
                            <legend className="text-2xl font-bold">Experience List</legend>
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
                                                    className={`border rounded-lg p-2 hover:shadow transition relative border-gray-300 bg-blue-100 flex flex-row justify-between items-center`}

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
                                                    <div className='flex flex-row justify-between items-center w-1/4'>
                                                        <motion.button
                                                            type='button'
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                setSelectedExperience(experience),
                                                                    handleSendFormClick(experience)
                                                            }}
                                                            className='w-full py-3 px-4 mr-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg
                                                         hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                        >
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <FolderCheck className="" />
                                                                <span className="">Send Forms</span>
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
                            <SendFormModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                experience={selectedExperience}
                            />
                        )}
                    </div>
                </motion.div >
            </div >
        </>
    )
}