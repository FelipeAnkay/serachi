import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useQuoteServices } from '../../store/quoteServices';
import { useNavigate, useLocation } from "react-router-dom";
import { ArchiveX, CheckCheck, Copy, Pencil } from 'lucide-react';


export default function OpenQuote() {
    const { getQuoteByCheckout, updateQuote } = useQuoteServices();
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
        Cookies.set('clone', true)
        navigate(`/new-quote/${quoteId}`);
    };

    const handleConfirm = async (quote) => {
        //console.log("handleConfirm: ", quote)
        try {
            const auxId = quote._id;
            const quotePayload = {
                id: auxId,
                isConfirmed: true
            }
            await updateQuote(auxId, quotePayload);
            toast.success("Quote confirmed");
            fetchQuotes();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error("Error confirming quote")
        }
    }

    const handleArchive = async (quote) => {
        console.log("handleArchive: ", quote)
        try {
            const auxId = quote._id;
            const auxStatus = "archived"
            const quotePayload = {
                id: auxId,
                status: auxStatus
            }
            await updateQuote(auxId, quotePayload);
            toast.success("Quote Archived");
            fetchQuotes();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error("Error confirming quote")
        }
    }

    const fetchQuotes = async () => {
        try {
            const response = await getQuoteByCheckout(storeId, false);
            //console.log("Quote Response: ", response);
            setQuotes(response.quoteList);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        //console.log("Entre a useEffect [storeId, location.key]", timezone);
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
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-slate-800 bg-clip-text">Created (not confirmed) Quotes</h1>
                <div className='w-full'>
                    <fieldset className="flex-grow space-y-4  rounded-2xl p-4 ml-4 mr-4">
                        <legend className="text-2xl font-bold">Quote List</legend>
                        <input
                            type="text"
                            placeholder="Search quote by email or name..."
                            className="w-full p-2  bg-white text-slate-900 border border-slate-300"
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
                                        quote.customerEmail.toLowerCase().includes(quoteSearch.toLowerCase()) ||
                                        quote.customerName.toLowerCase().includes(quoteSearch.toLowerCase())
                                    )
                                    .map((quote) => {
                                        return (
                                            <div
                                                key={quote._id}
                                                className="bg-white border border-slate-300 rounded-lg p-4 hover:shadow transition relative flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0"

                                            >
                                                < h3 className="text-lg font-semibold text-slate-800">
                                                    {(quote.customerName ? quote.customerName : quote.customerEmail)} - From: {new Date(quote.dateIn).toLocaleDateString("en-US", {
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
                                                <div className='justify-between items-center flex flex-col sm:flex-row gap-2 w-full sm:justify-end sm:w-1/2'>
                                                    <motion.button
                                                        type='button'
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleCloneClick(quote._id)}
                                                        className='w-full py-3 px-4 mr-2 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg
                                                         focus:ring-offset-1 focus:ring-offset-cyan-900'
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
                                                        onClick={() => handleQuoteClick(quote._id)}
                                                        className='w-full py-3 px-4 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg
                                                         focus:ring-offset-1 focus:ring-offset-cyan-900'
                                                    >
                                                        <div className='flex flex-col justify-center items-center'>
                                                            <Pencil className="" />
                                                            <span className="">Edit Quote</span>
                                                        </div>
                                                    </motion.button>
                                                    <motion.button
                                                        type='button'
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleConfirm(quote)}
                                                        className='w-full py-3 px-4 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg
                                                         focus:ring-offset-1 focus:ring-offset-cyan-900'
                                                    >
                                                        <div className='flex flex-col justify-center items-center'>
                                                            <CheckCheck className="" />
                                                            <span className="">Confirm Quote</span>
                                                        </div>
                                                    </motion.button>
                                                    <motion.button
                                                        type='button'
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleArchive(quote)}
                                                        className='w-full py-3 px-4 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg
                                                         focus:ring-offset-1 focus:ring-offset-cyan-900'
                                                    >
                                                        <div className='flex flex-col justify-center items-center'>
                                                            <ArchiveX className="" />
                                                            <span className="">Archive Quote</span>
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