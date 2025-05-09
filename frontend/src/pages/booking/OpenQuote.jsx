import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQuoteServices } from '../../store/quoteServices';
import { useStoreServices } from '../../store/storeServices';
import { useAuthStore } from '../../store/authStore';
import { useCustomerServices } from '../../store/customerServices';
import { CircleX, Contact2, Search, CircleCheck, CirclePlus } from 'lucide-react';
import languagesList from '../../components/languages.json';
import sourceList from '../../components/sourceList.json';
import dietaryList from '../../components/dietaryList.json';
import { AnimatePresence } from 'framer-motion';
import { useProductServices } from '../../store/productServices';
import { usePartnerServices } from '../../store/partnerServices';
import { useNavigate, useLocation } from "react-router-dom";


export default function OpenQuote() {
    const { getQuoteList, updateQuote } = useQuoteServices();
    const { getStoreById } = useStoreServices();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const storeId = Cookies.get('storeId');
    const [quoteSearch, setQuoteSearch] = useState("");
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [store, setStore]= useState(null);
    

    const location = useLocation();
    const navigate = useNavigate();

    const handleQuoteClick = (quoteId) => {
        navigate(`/new-quote/${quoteId}`);
    };

    useEffect(() => {
        console.log("Entre a useEffect [storeId, location.key]");
        const fetchQuotes = async () => {
            try {
                const response = await getQuoteList(storeId);
                //console.log("Quote Response: ", response);
                setQuotes(response.quoteList);
            } catch (error) {
                console.error('Error fetching quotes:', error);
            } finally {
                setLoading(false);
            }
        };
    
        const fetchStore = async () => {
            try {
                const response = await getStoreById(storeId);
                setStore(response.store);
            } catch (error) {
                console.error('Error fetching store:', error);
            }
        };
    
        if (storeId) {
            fetchQuotes();
            fetchStore();
        }
    }, [storeId, location.key]);

    useEffect(() => {
        if (location.state?.updated) {
            // Limpiar el estado para que no recargue de nuevo en otros montajes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsQuoteModalOpen(false);
            }
        };

        if (isQuoteModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isQuoteModalOpen]);


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
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-1">
                            {quotes.length === 0 ? (
                                <p>No Quotes found for this store.</p>
                            ) : (
                                quotes
                                    .filter(quote =>
                                        quote.customerEmail.toLowerCase().includes(quoteSearch.toLowerCase())
                                    )
                                    .map((quote) => {
                                        return (
                                            <div
                                                key={quote._id}
                                                className={`border rounded-lg p-2 hover:shadow transition relative border-gray-300 bg-blue-100`}
                                                onClick={() => handleQuoteClick(quote._id)}
                                            >
                                                < h3 className="text-lg font-semibold text-gray-800">
                                                    {quote.customerEmail} - From: {new Date(quote.dateIn).toLocaleDateString("en-US", {
                                                        timeZone: store?.timezone,
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                    {' to ' + new Date(quote.dateOut).toLocaleDateString("en-US", {
                                                        timeZone: store?.timezone,
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                    {' - ' + quote.productList.length + ' Products '} -  ${quote.finalPrice}
                                                </h3>
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