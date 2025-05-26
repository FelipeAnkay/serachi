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
import { Contact2, Search, Trash2 } from 'lucide-react';
import { useExperienceServices } from '../../store/experienceServices';
import { useRoomReservationServices } from '../../store/roomReservationServices';
import { formatDateDisplay, formatDateShort, formatDateInput } from '../../components/formatDateDisplay'

export default function AddItemsExperience() {
    const { getProductByStoreId } = useProductServices();
    const { getExperienceByEmail, updateExperience } = useExperienceServices();
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
        console.log("Entre a fetchProducts")
        const products = await getProductByStoreId(storeId);
        console.log("Resp de getProductByStoreId: ", products)
        const filtered = products.productList.filter(p => ['FOOD', 'HOSPITALITY'].includes(p.type));
        console.log("filtered:", filtered)
        setProductList(filtered);
    };

    const fetchExperiences = async () => {
        //console.log("Entre a fetchExperiences: ", customer.email)
        const res = await getExperienceByEmail(customer.email, storeId);
        //console.log("Resp de getExperienceByEmail: ", res)
        setExperienceList(res.experienceList);
    };

    const fetchAvailableItems = async () => {
        const services = await getServicesByEmail(storeId, customer.email);
        console.log("Resp de getServicesByEmail: ", services)
        const bookings = await getReservationsByEmail(storeId, customer.email);
        console.log("Resp de getReservationsByEmail: ", bookings)

        const current = selectedExperience;
        console.log("Resp de current: ", current)
        const filteredServices = services.service.filter(s => !current.serviceList.includes(s._id));
        const filteredBookings = bookings.roomReservationList.filter(b => !current.bookList.includes(b._id));
        console.log("Resp de filteredServices: ", filteredServices)
        console.log("Resp de filteredBookings: ", filteredBookings)

        setServiceList(filteredServices);
        setReservationList(filteredBookings);
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
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedExperience) return toast.error('Select an experience');

        const updatedExperience = {
            ...selectedExperience,
            productList: [...selectedExperience.productList, ...selectedProducts],
            serviceList: [...selectedExperience.serviceList, ...selectedServices.map(s => s._id)],
            bookList: [...selectedExperience.bookList, ...selectedBookings.map(b => b._id)]
        };

        try {
            console.log("updateExperience Payload: ", updatedExperience)

            await updateExperience(updatedExperience._id, updatedExperience);
            toast.success('Experience updated');
            setSelectedExperience(null);
            setSelectedProducts([]);
            setSelectedServices([]);
            setSelectedBookings([]);
            setCustomer({});
            setExperienceList({});

        } catch (err) {
            toast.error('Error updating experience');
        }
    };

    const handleReset = (e) => {
        toast.success('Experience Reseted');
        setSelectedExperience(null);
        setSelectedProducts([]);
        setSelectedServices([]);
        setSelectedBookings([]);
        setCustomer({});
        setExperienceList({});
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-8xl mx-auto bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-white overflow-hidden min-h-screen"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">Add Items to Experience</h1>
                <form onSubmit={handleSubmit} className='ml-2'>
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <label className='font-semibold'>Customer Email:</label>
                            <input
                                type="email"
                                ref={customerEmailRef}
                                className="px-2 py-1 rounded ml-2 mr-2 bg-blue-700 text-white"
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
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                                <Search />
                            </button>

                            {!isNew && (
                                <button
                                    type="button"
                                    variant="outline"
                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                    onClick={() => setIsCustomerModalOpen(true)}
                                >
                                    <Contact2 />
                                </button>
                            )}
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
                                <select className="text-white bg-blue-700 p-2 rounded ml-2" onChange={(e) => {
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
                        <fieldset className='border rounded-2xl '>
                            <legend className='ml-4 font-semibold'>New Items:</legend>
                            {selectedExperience && (
                                <div className='flex flex-row'>
                                    <fieldset className="mb-4 border rounded-2xl w-1/3 ml-2">
                                        <legend className="block font-semibold mb-1 ml-2">Add Services</legend>
                                        <select multiple className="w-full h-32 text-white p-2 rounded" onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions).map(opt => serviceList.find(s => s._id === opt.value));
                                            setSelectedServices(selected);
                                        }}>
                                            {serviceList.map(s => (
                                                <option key={s._id} value={s._id} className='text-white'>{s.name}</option>
                                            ))}
                                        </select>
                                    </fieldset>
                                    <fieldset className="mb-4 border rounded-2xl w-1/3 ml-2">
                                        <legend className="block font-semibold mb-1 ml-2">Add Reservations</legend>
                                        <select multiple className="w-full h-32 text-white p-2 rounded" onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions).map(opt => reservationList.find(r => r._id === opt.value));
                                            setSelectedBookings(selected);
                                        }}>
                                            {reservationList.map((r, index) => (
                                                <option key={r._id} value={r._id}>R{index + 1}.- Beds: {r.bedsReserved} - {formatDateDisplay(r.dateIn)} to {formatDateDisplay(r.dateOut)} </option>
                                            ))}
                                        </select>
                                    </fieldset>
                                    <fieldset className="mb-4 border rounded-2xl w-1/3 ml-2 mr-2">
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
                    </div>
                    <div className="text-center">
                        <button type="submit" className="bg-green-600 px-4 py-2 rounded text-white mt-2">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={handleReset} className="bg-yellow-600 px-4 py-2 rounded text-white mt-2 ml-2">
                            Reset
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}