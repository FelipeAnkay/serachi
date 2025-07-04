import Cookies from 'js-cookie';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useServiceServices } from '../../store/serviceServices';
import { useProductServices } from '../../store/productServices';
import ProductSelect from '../../components/ProductSelectv2';
import { useCustomerServices } from '../../store/customerServices';
import CustomerDetails from '../../components/CustomerDetail'
import { CircleHelp, Contact2, Search, Trash2 } from 'lucide-react';
import { useExperienceServices } from '../../store/experienceServices';
import { useRoomReservationServices } from '../../store/roomReservationServices';
import { formatDateDisplay, formatDateShort, formatDateInput } from '../../components/formatDateDisplay'
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AddItemsExperience() {
    const { getProductByStoreId } = useProductServices();
    const { getValidExperienceByEmail, updateExperience } = useExperienceServices();
    const { getReservationsByEmail } = useRoomReservationServices();
    const { getServicesByEmail } = useServiceServices();
    const storeId = Cookies.get('storeId');
    const { user } = useAuthStore();
    const [productList, setProductList] = useState([]);
    const [reservationList, setReservationList] = useState([]);
    const [serviceList, setServiceList] = useState([]);
    const [experienceList, setExperienceList] = useState([]);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [customer, setCustomer] = useState({});
    const { getCustomerEmail, createCustomer, updateCustomer } = useCustomerServices();
    const customerEmailRef = useRef(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [guideOpen, setGuideOpen] = useState(false);

    useEffect(() => {
        if (storeId) fetchProducts();
    }, [storeId]);

    useEffect(() => {
        if (customer?.email) fetchExperiences();
    }, [customer?.email]);

    useEffect(() => {
        if (selectedExperience) fetchAvailableItems();
    }, [selectedExperience]);

    const fetchProducts = async () => {
        setLoading(true)
        try {
            //console.log("Entre a fetchProducts")
            const products = await getProductByStoreId(storeId);
            //console.log("Resp de getProductByStoreId: ", products)
            const filtered = products.productList.filter(p => p.isTangible);
            //console.log("filtered:", filtered)
            setProductList(filtered);
        } catch (error) {
            toast.error("Error Fetching Products")
        } finally {
            setLoading(false);
        }
    };

    const fetchExperiences = async () => {
        try {
            setLoading(true)
            //console.log("Entre a fetchExperiences: ", customer.email)
            const res = await getValidExperienceByEmail(customer.email, storeId);
            //console.log("Resp de getExperienceByEmail: ", res)
            setExperienceList(res.experienceList);
        } catch (error) {
            toast.error("Error Fetching Experiences")
        } finally {
            setLoading(false);
        }

    };

    const fetchAvailableItems = async () => {
        try {
            setLoading(true)
            const services = await getServicesByEmail(storeId, customer.email);
            //console.log("Resp de getServicesByEmail: ", services)
            const bookings = await getReservationsByEmail(storeId, customer.email);
            // console.log("Resp de getReservationsByEmail: ", bookings)

            const current = selectedExperience;
            //console.log("Resp de current: ", current)
            const filteredServices = services.service.filter(s => !current.serviceList.includes(s._id));
            const filteredBookings = bookings.roomReservationList.filter(b => !current.bookList.includes(b._id));
            // console.log("Resp de filteredServices: ", filteredServices)
            // console.log("Resp de filteredBookings: ", filteredBookings)

            setServiceList(filteredServices);
            setReservationList(filteredBookings);
        } catch (error) {
            toast.error("Error Fetching Items")
        } finally {
            setLoading(false);
        }

    };

    const handleCustomerEmailSearch = async (email) => {
        try {
            const res = await getCustomerEmail(email, storeId);
            const found = res.customerList?.[0];
            if (found) {
                setCustomer({
                    ...found,
                    birthdate: found.birthdate?.slice(0, 10),
                    emergencyContactName: found.emergencyContact?.emergencyContactName || '',
                    emergencyContactPhone: found.emergencyContact?.emergencyContactPhone || '',
                });
                setIsNew(false);
            } else {
                setCustomer({ email });
                setIsNew(true);
            }
        } catch {
            toast.error('Error searching customer');
        }
    };

    const handleSaveClient = async () => {
        const payload = {
            ...customer,
            emergencyContact: {
                emergencyContactName: customer.emergencyContactName,
                emergencyContactPhone: customer.emergencyContactPhone,
            },
            storeId
        };
        setLoading(true)
        try {
            if (customer._id) {
                await updateCustomer(customer.email, payload);
                toast.success('Customer updated');
            } else {
                await createCustomer(payload);
                toast.success('Customer created');
            }
            setIsCustomerModalOpen(false);
        } catch {
            toast.error('Error saving customer');
        } finally {
            setLoading(false)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedExperience) return toast.error('Select an experience');
        console.log("Selected Experience: ", selectedExperience)
        console.log("Selected Products: ", selectedProducts)
        
        const updatedExperience = {
            ...selectedExperience,
            productList: [...selectedExperience.productList, ...selectedProducts],
            serviceList: [...selectedExperience.serviceList, ...selectedServices.map(s => s._id)],
            bookList: [...selectedExperience.bookList, ...selectedBookings.map(b => b._id)]
        };
        setLoading(true)
        try {
            console.log("updateExperience Payload: ", updatedExperience)
            await updateExperience(updatedExperience._id, updatedExperience);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Experience updated');
            handleReset();

        } catch (err) {
            toast.error('Error updating experience');
        } finally {
            setLoading(false)
        }
    };

    const handleReset = (e) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Experience Reseted');
        setSelectedExperience(null);
        setSelectedProducts([]);
        setSelectedServices([]);
        setSelectedBookings([]);
        setCustomer({});
        setExperienceList({});
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
                    <h1 className="text-2xl font-bold mb-6 text-center">Assign Products to experience</h1>
                    <form onSubmit={handleSubmit} className='space-y-4 p-4 rounded-2xl shadow bg-sky-50 w-full box-border'>
                        <div className='flex flex-row'>
                            <CircleHelp className='text-slate-800 mr-2 hover:text-cyan-600' onClick={() => setGuideOpen(!guideOpen)} />
                            {guideOpen && (
                                <div className='mb-4 border rounded-2xl w-max flex flex-col text-sm'>
                                    <label className='font-semibold ml-2 mt-2'>Guide:</label>
                                    <p className='ml-10 mr-2'>1.- Enter Customer Email</p>
                                    <p className='ml-10 mr-2'>2.- Select Customer Experience, after this the services, room reservations and products will appear</p>
                                    <p className='ml-10 mr-2'>3.- Enter the services, room reservations or products that you want to add to the customer experience</p>
                                    <p className='ml-10 mr-2 mb-2'>4.- If everything is ok click Save</p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold mb-1">Customer Email:</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="email"
                                        ref={customerEmailRef}
                                        className="px-2 py-1 rounded bg-white text-slate-900 border border-slate-300 w-full"
                                        placeholder="Customer email"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleCustomerEmailSearch(customerEmailRef.current.value);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleCustomerEmailSearch(customerEmailRef.current.value)}
                                        className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 py-1 px-2 rounded"
                                    >
                                        <Search />
                                    </button>

                                    {!isNew && (
                                        <button
                                            type="button"
                                            className="bg-slate-600 hover:bg-slate-700 text-cyan-50 px-2 py-1 rounded"
                                            onClick={() => setIsCustomerModalOpen(true)}
                                        >
                                            <Contact2 />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isCustomerModalOpen && (
                                <CustomerDetails
                                    isOpen={isCustomerModalOpen}
                                    onClose={() => setIsCustomerModalOpen(false)}
                                    customer={customer}
                                    setCustomer={setCustomer}
                                    onSave={handleSaveClient}
                                />
                            )}
                        </div>

                        <div>
                            {experienceList.length > 0 && (
                                <div className="mb-4 flex flex-row items-center">
                                    <label className="mb-1 font-semibold">Select Experience: </label>
                                    <select className="text-slate-800 bg-white border p-2 rounded ml-2" onChange={(e) => {
                                        const exp = experienceList.find(ex => ex._id === e.target.value);
                                        setSelectedExperience(exp);
                                    }}>
                                        <option value="">-- Select --</option>
                                        {experienceList.map(exp => (
                                            <option key={exp._id} value={exp._id}>{exp.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {experienceList.length > 0 && (
                            <fieldset className='border rounded-2xl gap-2 p-2'>
                                <legend className='ml-4 font-semibold'>New Items:</legend>
                                {selectedExperience && (
                                    <div className="flex flex-col lg:flex-row gap-2">
                                        <fieldset className="border rounded-2xl w-full lg:w-1/3 p-2 gap-5 h-full bg-white">
                                            <legend className="block font-semibold mb-1 ml-2">Add Services</legend>
                                            <select multiple className="w-full h-32 text-slate-800 p-2 rounded" onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions).map(opt => serviceList.find(s => s._id === opt.value));
                                                setSelectedServices(selected);
                                            }}>
                                                {serviceList.map(s => (
                                                    <option key={s._id} value={s._id} className='text-slate-800'>{s.name}</option>
                                                ))}
                                            </select>
                                        </fieldset>
                                        <fieldset className="border rounded-2xl w-full lg:w-1/3 ml-2 bg-white">
                                            <legend className="block font-semibold mb-1 ml-2">Add Reservations</legend>
                                            <select multiple className="w-full h-32 text-slate-800 p-2 rounded" onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions).map(opt => reservationList.find(r => r._id === opt.value));
                                                setSelectedBookings(selected);
                                            }}>
                                                {reservationList.map((r, index) => (
                                                    <option key={r._id} value={r._id}>R{index + 1}.- Beds: {r.bedsReserved} - {formatDateDisplay(r.dateIn)} to {formatDateDisplay(r.dateOut)} </option>
                                                ))}
                                            </select>
                                        </fieldset>
                                        <fieldset className="border rounded-2xl w-full lg:w-1/3 bg-white">
                                            <legend className="block font-semibold mb-1 ml-2">Add Products</legend>
                                            <ProductSelect
                                                products={productList}
                                                value={selectedProducts}
                                                onChange={setSelectedProducts}
                                            />
                                        </fieldset>
                                    </div>
                                )}
                            </fieldset>
                            )}
                        </div>
                        <div className="text-center">
                            <button type="submit" className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded  mt-2">
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" onClick={handleReset} className="bg-slate-600 hover:bg-slate-700 text-cyan-50 px-4 py-2 rounded mt-2 ml-2">
                                Reset
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
}