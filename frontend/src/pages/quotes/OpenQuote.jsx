import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useQuoteServices } from '../../store/quoteServices';
import { useNavigate, useLocation } from "react-router-dom";
import { Copy, Pencil } from 'lucide-react';


export default function OpenQuote() {
    const { getQuoteByCheckout } = useQuoteServices();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const storeId = Cookies.get('storeId');
    const timezone = Cookies.get('timezone');
    const [quoteSearch, setQuoteSearch] = useState("");



    const location = useLocation();
    const navigate = useNavigate();

    const handleQuoteClick = (quoteId) => {
        navigate(`/new-quote/${quoteId}`);
    };
    const handleCloneClick = (quoteId) => {
        Cookies.set('clone',true)
        navigate(`/new-quote/${quoteId}`);
    };

    useEffect(() => {
        //console.log("Entre a useEffect [storeId, location.key]", timezone);
        const fetchQuotes = async () => {
            try {
                const response = await getQuoteByCheckout(storeId,false);
                //console.log("Quote Response: ", response);
                setQuotes(response.quoteList);
            } catch (error) {
                console.error('Error fetching quotes:', error);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchQuotes();
        }
    }, [storeId, location.key]);

    useEffect(() => {
        if (location.state?.updated) {
            // Limpiar el estado para que no recargue de nuevo en otros montajes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    return (
            <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col w-full max-w-9/12 mx-auto bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
                >
                <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white bg-clip-text">Past Quotes</h1>
                <div className='w-full'>
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
                           {!quotes || quotes.length === 0 ? (
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
                                                className={`border rounded-lg p-2 hover:shadow transition relative border-gray-300 bg-blue-100 flex flex-row justify-between items-center`}

                                            >
                                                < h3 className="text-lg font-semibold text-gray-800">
                                                    {(quote.customerName? quote.customerName : quote.customerEmail)} - From: {new Date(quote.dateIn).toLocaleDateString("en-US", {
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
                                                <div className='flex flex-row justify-between items-center w-1/4'>
                                                    <motion.button
                                                        type='button'
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleCloneClick(quote._id)}
                                                        className='w-full py-3 px-4 mr-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg
                                                         hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                    >
                                                        <div className='flex flex-col justify-center items-center'>
                                                            <Copy    className="" />
                                                            <span className="">Clone Quote</span>
                                                        </div>
                                                    </motion.button>
                                                    <motion.button
                                                        type='button'
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleQuoteClick(quote._id)}
                                                        className='w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg
                                                         hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                                    >
                                                        <div className='flex flex-col justify-center items-center'>
                                                            <Pencil className="" />
                                                            <span className="">Edit Quote</span>
                                                        </div>
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