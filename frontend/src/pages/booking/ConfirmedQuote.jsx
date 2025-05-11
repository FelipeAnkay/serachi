import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useQuoteServices } from '../../store/quoteServices';
import { useNavigate, useLocation } from "react-router-dom";
import { Copy, MapPinCheckInside } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useExperienceServices } from '../../store/experienceServices';
import toast from 'react-hot-toast';
import { useServiceServices } from '../../store/serviceServices';


export default function ConfirmedQuote() {
    const { getConfirmedQuoteList } = useQuoteServices();
    const { createService } = useServiceServices();
    const { createExperience, getExperienceList } = useExperienceServices();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const storeId = Cookies.get('storeId');
    const timezone = Cookies.get('timezone');
    const [quoteSearch, setQuoteSearch] = useState("");
    const { user } = useAuthStore();
    const [existingExperiences, setExistingExperiences] = useState([]);
    const [showOnlyUnprocessed, setShowOnlyUnprocessed] = useState(false);


    const location = useLocation();
    const navigate = useNavigate();

    const handleCloneClick = (quoteId) => {
        Cookies.set('clone', true)
        navigate(`/new-quote/${quoteId}`);
    };

    useEffect(() => {
        //console.log("Entre a useEffect [storeId, location.key]", timezone);
        const fetchQuotes = async () => {
            try {
                const response = await getConfirmedQuoteList(storeId);
                //console.log("Quote Response: ", response);
                setQuotes(response.quoteList);
            } catch (error) {
                console.error('Error fetching quotes:', error);
            } finally {
                setLoading(false);
            }
        };
        const fetchExperiences = async () => {
            try {
                const response = await getExperienceList(storeId);
                //console.log("getExperienceList Response: ", response);
                setExistingExperiences(response.experienceList || []);
            } catch (error) {
                console.error("Error fetching experiences:", error);
            }
        };

        if (storeId) {
            fetchQuotes();
            fetchExperiences();
        }
    }, [storeId, location.key]);

    useEffect(() => {
        if (location.state?.updated) {
            // Limpiar el estado para que no recargue de nuevo en otros montajes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);


    const handleCreateExperience = async (quote) => {
        //console.log("En handleCreateExperience: ", quote);
        try {
            const serviceIds = [];
            const formDateIn = new Date(quote.dateIn).toISOString().split("T")[0]
            const formDateOut = new Date(quote.dateOut).toISOString().split("T")[0]
            for (const product of quote.productList) {
                console.log("El product es:", product);
                const servicePayload = {
                    name: "S: " + quote.customerEmail + " - " + product.productName,
                    productId: product.productID,
                    quoteId: quote._id,
                    customerEmail: quote.customerEmail,
                    storeId: quote.storeId,
                    userEmail: quote.userEmail
                }
                console.log("El servicePayload es:", servicePayload);
                const service = await createService(servicePayload);
                console.log("Respuesta de createService es:", service);
                serviceIds.push(service._id);
            };

            const experiencePayload = {
                name: "E: " + quote.customerEmail + " - " + formDateIn + " TO " + formDateOut,
                serviceList: serviceIds,
                storeId: storeId,
                userEmail: user.email,
                customerEmail: quote.customerEmail,
                dateIn: quote.dateIn,
                dateOut: quote.dateOut,
                quoteId: quote._id,
                source: quote.source
            }
            console.log("El experiencePayload es:", experiencePayload);
            const experience = await createExperience(experiencePayload);
            console.log("Respuesta de createExperience es:", experience);
            toast.success("Experience & Services created");
        } catch (error) {
            console.log("Error en handleCreateExperience:", error);
            toast.error("Error creating experience")
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-8xl mx-auto bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen"
            >
                <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white bg-clip-text">Past Quotes</h1>
                <div>
                    <fieldset className="flex-grow space-y-4 border rounded-2xl p-4 ml-4 mr-4">
                        <legend className="text-2xl font-bold">Quote List</legend>
                        <input
                            type="text"
                            placeholder="Search quote by email..."
                            className="w-full p-2 border border-gray-300 rounded"
                            value={quoteSearch}
                            onChange={(e) => setQuoteSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    // Add logic if we want to do something when enter is pressed
                                }
                            }}
                        />
                        <div className="flex items-center space-x-2 mb-2">
                            <label htmlFor="filterSwitch" className="text-white font-medium">Show only unprocessed quotes</label>
                            <input
                                id="filterSwitch"
                                type="checkbox"
                                checked={showOnlyUnprocessed}
                                onChange={(e) => setShowOnlyUnprocessed(e.target.checked)}
                                className="w-5 h-5 rounded accent-blue-600"
                            />
                        </div>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-1">
                            {quotes.length === 0 ? (
                                <p>No Quotes found for this store.</p>
                            ) : (
                                quotes
                                    .filter(quote =>
                                        quote.customerEmail.toLowerCase().includes(quoteSearch.toLowerCase()) &&
                                        (!showOnlyUnprocessed || !existingExperiences.some(exp => exp.quoteId === quote._id))
                                    )
                                    .map((quote) => {
                                        const alreadyExists = existingExperiences.some(exp => exp.quoteId === quote._id);
                                        //console.log("El valor de existingExperiences:", alreadyExists," - ", existingExperiences, " - ", quote._id);
                                        return (
                                            <div
                                                key={quote._id}
                                                className="border rounded-lg p-2 hover:shadow transition relative border-gray-300 bg-blue-100 flex flex-row justify-between items-center"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {quote.customerEmail} - From: {new Date(quote.dateIn).toLocaleDateString("en-US", {
                                                        timeZone: timezone || "America/Guatemala",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                    {' to ' + new Date(quote.dateOut).toLocaleDateString("en-US", {
                                                        timeZone: timezone || "America/Guatemala",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                    {' - ' + quote.productList.length + ' Products '} -  ${quote.finalPrice}
                                                </h3>

                                                <div className="flex flex-row items-center w-1/3">
                                                    <motion.button
                                                        type='button'
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleCloneClick(quote._id)}
                                                        className='w-full py-3 px-4 mr-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg
                                                         hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                    >
                                                        <div className='flex flex-col justify-center items-center'>
                                                            <Copy className="" />
                                                            <span className="">Clone Quote</span>
                                                        </div>
                                                    </motion.button>
                                                    <motion.button
                                                        type='button'
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleCreateExperience(quote)}
                                                        disabled={alreadyExists}
                                                        className='w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg
                                                         hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                    >
                                                        {alreadyExists ? (
                                                            <div className='flex flex-col justify-center items-center cursor-not-allowed'>
                                                                <MapPinCheckInside className="text-black" />
                                                                <span className="text-black">Experience Created</span>
                                                            </div>
                                                        ) : (
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <MapPinCheckInside className="" />
                                                                <span className="">Create Experience</span>
                                                            </div>
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </fieldset>
                </div>
            </motion.div >
        </div >
    )
}