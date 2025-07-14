import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQuoteServices } from '../../store/quoteServices';
import { useAuthStore } from '../../store/authStore';
import { useCustomerServices } from '../../store/customerServices';
import { Contact2, Search, CirclePlus, Trash2 } from 'lucide-react';
import sourceList from '../../components/sourceList.json';
import { useProductServices } from '../../store/productServices';
import { usePartnerServices } from '../../store/partnerServices';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CustomerDetails from '../../components/CustomerDetail'
import { useRoomReservationServices } from '../../store/roomReservationServices';
import DateRangePicker from "../../components/DateRangePicker"
import { useStoreServices } from '../../store/storeServices';


export default function NewQuote() {
    const { createQuote, getQuoteById, updateQuote } = useQuoteServices();
    const { getAvailableRooms } = useRoomReservationServices();
    const { quoteId } = useParams();
    const storeId = Cookies.get('storeId');
    const clone = Cookies.get('clone');
    const { user } = useAuthStore();
    const { store } = useStoreServices();
    const { getCustomerEmail, createCustomer, updateCustomer } = useCustomerServices();
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [quote, setQuote] = useState({});
    const [customer, setCustomer] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getProductByStoreId } = useProductServices();
    const [selectedProducts, setSelectedProducts] = useState({});
    const [finalPrice, setFinalPrice] = useState();
    const [productSearch, setProductSearch] = useState("");
    const customerEmailRef = useRef(null);
    const { getPartnerList } = usePartnerServices();
    const [partners, setPartners] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState({});
    const [isRoomVisible, setIsRoomVisible] = useState(false);
    const [isRoomPrivate, setIsRoomPrivate] = useState({});
    const [roomSearch, setRoomSearch] = useState("");
    const [newTag, setNewTag] = useState({ name: '', code: '' });
    const hasFetchedEmail = useRef(false);
    const navigate = useNavigate();
    const [roomNote, setRoomNote] = useState(null);
    const [roomDateRanges, setRoomDateRanges] = useState({});
    const [roomStartDates, setRoomStartDates] = useState({});
    let isSplit = false;
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [isPeopleLock, setIsPeopleLock] = useState(false);
    const hasInteractedWithToggle = useRef(false);
    let roomType = "";

    const roomFill = (roomList) => {
        setSelectedRooms(roomList);
    }

    const quoteFill = (quote) => {
        setQuote({
            ...quote,
            userName: user.name,
            customerName: customer.name + (customer.lastName ? " " + customer.lastName : ""),
        })
    };

    useEffect(() => {
        //console.log("Entre a UE 2");
        if (!quoteId) {
            setQuote({
                userEmail: user.email,
                userName: user.name,
                storeId: storeId,
                isConfirmed: false,
                isReturningCustomer: false,
                sendEmail: true,
            });
        }
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const response = await getProductByStoreId(storeId);
                const roomProducts = response.productList.filter(product => product.type != "ROOM");
                setProducts(roomProducts);

            } catch (error) {
                toast.error('Error fetching products');
            } finally {
                setLoading(false);
            }
        };
        const fetchPartners = async () => {
            try {
                setLoading(true);
                const response = await getPartnerList(storeId);
                //console.log("ProductList Response: ", response);
                setPartners(response.partnerList);

                //console.log("ProductList: ", products);
            } catch (error) {
                toast.error('Error fetching Partner');

            } finally {
                setLoading(false);
            }
        }

        if (storeId) {
            fetchProducts();
            fetchPartners();
        }
    }, [quoteId, storeId, user.email, user.name]);


    useEffect(() => {
        //console.log("F: El cliente actual es:", customer);
        //console.log("Entre a UE 3");
        setQuote((prevQuote) => ({
            ...prevQuote,
            customerName: customer.name,
        }));
    }, [customer]);

    // Cuando cambian las fechas, buscar habitaciones disponibles
    useEffect(() => {
        //console.log("Entre a UE 4 - PLAN", {store});
        const fetchAvailableRooms = async () => {
            setLoading(true)
            if (!quote.dateIn || !quote.dateOut) {
                setIsPeopleLock(false);
                return;
            }
            try {
                const response = await getAvailableRooms({
                    dateIn: quote.dateIn,
                    dateOut: quote.dateOut,
                    bedsRequired: numberOfPeople,
                    storeId,
                });
                const availableRooms = response.availableRooms || [];
                setRooms(availableRooms);

                const range = [];
                let d = new Date(quote.dateIn);
                const end = new Date(quote.dateOut);
                while (d < end) {
                    range.push(d.toISOString().split('T')[0]);
                    d.setDate(d.getDate() + 1);
                }

                const dailySum = {};
                for (const date of range) dailySum[date] = 0;
                const roomRanges = {};
                for (const room of availableRooms) {
                    const days = room.dailyAvailability || {};
                    if (!room.availableEveryNight) {
                        isSplit = true;
                    }
                    for (const date of range) {
                        dailySum[date] += days[date] || 0;
                    }

                    // Agrupar fechas contiguas donde hay al menos 1 cama
                    const activeDates = range.filter(date => (days[date] || 0) > 0);
                    const segments = [];
                    let start = null;
                    for (let i = 0; i < activeDates.length; i++) {
                        if (!start) start = activeDates[i];
                        const curr = new Date(activeDates[i]);
                        const next = new Date(activeDates[i + 1]);
                        const diff = next ? (next - curr) / (1000 * 3600 * 24) : null;
                        if (diff !== 1) {
                            segments.push({ from: start, to: activeDates[i] });
                            start = null;
                        }
                    }
                    if (start) {
                        segments.push({ from: start, to: activeDates[activeDates.length - 1] });
                    }
                    roomRanges[room._id] = segments.length > 0 ? segments : null;
                }

                setRoomDateRanges(roomRanges);
                const uncoveredDays = range.filter(date => dailySum[date] < 1);
                const allDaysCovered = uncoveredDays.length === 0;
                if (!allDaysCovered) {
                    setRoomNote("No room(s) available(s) for the selected dates");
                } else {
                    setRoomNote(
                        isSplit ?
                            "The stay may require a room change during the selected period" :
                            null
                    );
                }
                setIsPeopleLock(true);
                setIsRoomVisible(true);
            } catch (error) {
                toast.error('Error fetching available rooms');
            } finally {
                setLoading(false)
            }
        };
        if (store.plan != "BAS" && store.storeBookings) {
            fetchAvailableRooms();
            const nights = daysCalc(quote.dateIn, quote.dateOut)
            setQuote((prev) => ({
                ...prev,
                numberOfNights: nights
            }));
        }
    }, [quote.dateIn, quote.dateOut, storeId]);

    useEffect(() => {
        if (quoteId && !hasInteractedWithToggle.current) return;
        //console.log("Entre a UE 6");
        updateQuoteFromSelectedRoom(selectedRooms);
    }, [isRoomPrivate]);

    useEffect(() => {
        //console.log("Entre a UE 1");
        const fetchQuote = async () => {
            setLoading(true)
            try {
                const resp = await getQuoteById(quoteId);
                const response = resp.quote;
                if (!hasFetchedEmail.current && response.customerEmail) {
                    handleCustomerEmailSearch(response.customerEmail);
                    hasFetchedEmail.current = true;
                }
                //console.log("OLD Quote Found Response: ", response);
                if (clone) {
                    //console.log("Entré a Clone:", response);
                    const { _id, ...clonedQuote } = response; // elimina _id
                    //console.log("Elimine ID a Clone:", clonedQuote);
                    setQuote({
                        ...clonedQuote,
                        userName: user.name,
                        customerName: customer.name,
                    });
                    Cookies.remove('clone')
                } else {
                    quoteFill(response);
                }
                //console.log("F: Estoy en useEffect-productList:", response.productList)
                if (response.productList && response.productList.length > 0) {
                    const initialSelectedProducts = {};
                    response.productList.forEach((p) => {
                        initialSelectedProducts[p.productId] = p.Qty;
                    });
                    setSelectedProducts(initialSelectedProducts);
                }
                //console.log("F: Estoy en useEffect-roomList:", response.roomList)
                if (response.roomList && response.roomList.length > 0) {
                    const initialSelectedRooms = {};
                    const initialPrivateSelectedRooms = {};
                    response.roomList.forEach((p) => {
                        initialSelectedRooms[p.roomId] = p.roomNights;
                        if (p.isPrivate) {
                            initialPrivateSelectedRooms[p.roomId] = p.roomId
                        }
                    });
                    roomFill(initialSelectedRooms);
                    setIsRoomPrivate(initialPrivateSelectedRooms);
                }
                setFinalPrice(response.finalPrice + response.discount)
            } catch (error) {
                toast.error('Error fetching Quote');
            } finally {
                setLoading(true)
            }
        }

        if (quoteId) {
            // Si hay ID, carga la cotización existente
            fetchQuote();
        }
    }, [quoteId]);

    const incrementProduct = (productId) => {
        setSelectedProducts((prev) => {
            const updated = { ...prev, [productId]: (prev[productId] || 0) + 1 };
            return updateQuoteFromSelectedProduct(updated);
        });
    };

    const decrementProduct = (productId) => {
        setSelectedProducts((prev) => {
            if (!prev[productId]) return prev; // No hay que restar

            const updated = { ...prev };
            if (updated[productId] === 1) {
                delete updated[productId];
            } else {
                updated[productId] -= 1;
            }
            return updateQuoteFromSelectedProduct(updated);
        });
    };

    const updateQuoteFromSelectedProduct = (selected) => {
        //console.log("Entre a updateQuoteFromSelectedProduct", selected);
        const structuredList = Object.entries(selected).map(([id, qty]) => {
            const product = products.find((p) => p._id === id);
            return {
                productId: id,
                productName: product?.name || '',
                Qty: qty,
                productUnitaryPrice: (product?.finalPrice || 0),
                productFinalPrice: ((product?.finalPrice || 0) * qty),
            };
        });

        const productSubtotal = structuredList.reduce((sum, item) => sum + item.productFinalPrice, 0);
        const roomSubtotal = quote.roomList?.reduce((sum, r) => sum + r.roomFinalPrice, 0) || 0;
        const total = productSubtotal + roomSubtotal;

        setFinalPrice(total);
        setQuote((prev) => ({
            ...prev,
            discount: 0,
            finalPrice: total,
            productList: structuredList,
        }));

        return selected;
    };

    const incrementRoom = (roomId) => {
        setSelectedRooms((prev) => {
            const updated = { ...prev, [roomId]: (prev[roomId] || 0) + 1 };
            return updateQuoteFromSelectedRoom(updated);
        });
    };

    const decrementRoom = (roomId) => {
        setSelectedRooms((prev) => {
            if (!prev[roomId]) return prev; // No hay que restar

            const updated = { ...prev };
            if (updated[roomId] === 1) {
                delete updated[roomId];
            } else {
                updated[roomId] -= 1;
            }
            return updateQuoteFromSelectedRoom(updated);
        });
    };

    const handleToggleRoomPrivate = (roomId) => {
        hasInteractedWithToggle.current = true;
        setIsRoomPrivate(prev => {
            const newState = { ...prev, [roomId]: !prev[roomId] };
            return newState;
        });
    };

    const updateQuoteFromSelectedRoom = (selected) => {
        //console.log("Entre a updateQuoteFromSelectedRoom ROOM: ", selected)
        const structuredList = Object.entries(selected).map(([id, qty]) => {
            let auxType = true;
            //console.log("roomType", roomType)
            if (roomType != "PRIVATE") {
                auxType = false;
            }
            //console.log("auxType: ", auxType)
            //console.log("La lista de rooms es: ", rooms)
            const room = rooms.find((p) => p._id === id);
            const startDate = roomStartDates[id] ? new Date(roomStartDates[id]) : new Date(quote.dateIn);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + qty);
            const isPrivate = isRoomPrivate[id];
            //console.log("El isPrivate es: ", isPrivate)
            const adjustedQty = isPrivate ? room.availability : numberOfPeople;
            //console.log("El adjustedQty es: ", adjustedQty)
            //console.log("El startDate es: ", startDate)
            let finalPrice = 0;
            if (auxType) {
                finalPrice = (room?.price || 0) * qty
            } else {
                finalPrice = (room?.price || 0) * qty * adjustedQty
            }
            //console.log("finalPrice: ", finalPrice)
            return {
                roomId: id,
                roomName: room?.name || '',
                Qty: adjustedQty,
                roomUnitaryPrice: (room?.price || 0),
                roomNights: (qty || 0),
                isPrivate: isPrivate,
                roomFinalPrice: finalPrice,
                roomDateIn: isNaN(startDate) ? '' : startDate.toISOString(),
                roomDateOut: isNaN(endDate) ? '' : endDate.toISOString(),
            };
        });
        //console.log("structuredList", structuredList)
        const roomSubtotal = structuredList.reduce((sum, item) => sum + item.roomFinalPrice, 0);

        const productSubtotal = quote.productList?.reduce((sum, p) => sum + p.productFinalPrice, 0) || 0;

        const total = productSubtotal + roomSubtotal;

        setFinalPrice(total);
        setQuote((prev) => ({
            ...prev,
            discount: 0,
            finalPrice: total,
            roomList: structuredList,
        }));

        return selected;
    };

    const handleQuoteChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuote((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCustomerEmailSearch = async (customerEmail) => {
        //console.log("El email en handleCustomerEmailSearch es: ", customerEmail);
        try {
            setLoading(true)
            const response = await getCustomerEmail(customerEmail, storeId);
            const found = response.customerList;
            //console.log("F: el found es:", found);
            if (found) {
                toast.success('Customer Found');
                //console.log("El cliente encontrdo es:", found)
                found.map((cust) => (
                    setCustomer({
                        _id: cust._id,
                        email: cust.email,
                        name: cust.name || '',
                        lastName: cust.lastName || '',
                        phone: cust.phone || '',
                        country: cust.country || '',
                        languages: cust.languages || [],
                        birthdate: cust.birthdate ? cust.birthdate.slice(0, 10) : '',
                        nationalId: cust.nationalId || '',
                        diet: cust.diet || '',
                        emergencyContactName: cust.emergencyContact?.emergencyContactName || '',
                        emergencyContactPhone: cust.emergencyContact?.emergencyContactPhone || '',
                        divingCertificates: cust.divingCertificates || [],
                    }
                    )));
                setQuote((prev) => ({
                    ...prev,
                    customerEmail: found[0].email,
                    customerName: found[0].name + (found[0].lastName ? " " + found[0].lastName : ""),
                }));
                setIsNew(false);
                setIsCustomerModalOpen(false);
            } else {
                toast.success('Customer not found, please create one');
                setCustomer({
                    _id: '',
                    email: customerEmail,
                    name: '',
                    lastName: '',
                    phone: '',
                    country: '',
                    languages: [],
                    birthdate: '',
                    nationalId: '',
                    diet: '',
                    emergencyContactName: '',
                    emergencyContactPhone: '',
                    divingCertificates: [],
                });
                setQuote((prev) => ({ ...prev, customerEmail: customerEmail }));
                setIsNew(true);
                setIsCustomerModalOpen(true);
            }
        } catch (err) {
            toast.success('Customer not found, please create one');
            setCustomer({
                _id: '',
                email: customerEmail,
                name: '',
                phone: '',
                country: '',
                languages: [],
                birthdate: '',
                nationalId: '',
                diet: '',
                emergencyContactName: '',
                emergencyContactPhone: '',
                divingCertificates: [],
            });
            setIsCustomerModalOpen(true);
        } finally {
            setLoading(false)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quote.dateIn || !quote.dateOut || !quote.customerEmail || !quote.storeId || !quote.userEmail) {
            toast.error('Please fill all the mandatory data.');
            return;
        }
        try {
            if (!quote._id) {
                await createQuote(quote);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                toast.success('Quote Created');
            } else {
                await updateQuote(quote._id, quote);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                toast.success('Quote Updated');
                if (quote.isConfirmed) {
                    navigate(`/confirmed-quote/`, { state: {}, replace: true });
                } else {
                    navigate(`/past-quote/`, { state: {}, replace: true });
                }
            }
            handleReset()
        } catch (err) {
            //console.log("Error: ", err)
            toast.error('Error al guardar la cotización');
        }
    };

    const handleReset = (e) => {
        setQuote({
            dateIn: '',
            dateOut: '',
            customerEmail: '',
            customerName: '',
            roomList: [],
            partnerId: '',
            productList: [],
            discount: 0,
            finalPrice: 0,
            currency: 'USD',
            isReturningCustomer: false,
            tag: [],
            userEmail: user.email,
            userName: user.name,
            storeId: storeId,
            isConfirmed: false,
            sendEmail: true,
        });

        setCustomer({
            email: '',
            name: '',
            phone: '',
            country: '',
            languages: [],
            birthdate: '',
            nationalId: '',
            diet: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            professionalCertificates: [],
        });
        setNumberOfPeople("1")
        setIsPeopleLock(false)
        setIsRoomPrivate({})
        setFinalPrice("0");
        setSelectedRooms({})
        setSelectedProducts({});
        setIsNew(true);
    }
    const handleSaveClient = async (e) => {
        try {
            //console.log("F: El cliente es:", customer);
            const customerPayload = {
                _id: customer._id,
                email: customer.email,
                name: customer.name,
                lastName: customer.lastName,
                phone: customer.phone,
                country: customer.country,
                languages: customer.languages,
                birthdate: customer.birthdate,
                nationalId: customer.nationalId,
                diet: customer.diet,
                emergencyContact: {
                    emergencyContactName: customer.emergencyContactName,
                    emergencyContactPhone: customer.emergencyContactPhone,
                },
                divingCertificates: customer.divingCertificates,
                storeId: storeId,
            };
            //console.log("F: El cliente a CREAR o EDITAR es:", customerPayload);
            if (customerPayload._id) {
                // El cliente ya existe: actualizar
                //console.log("F: entré a modificar");
                await updateCustomer(customerPayload.email, customerPayload); // Asegúrate de tener esta función
                toast.success("Customer updated successfully");
            } else {
                // Crear nuevo cliente
                await createCustomer(customerPayload);
                toast.success("Customer created successfully");
            }
            setIsCustomerModalOpen(false);
            setIsNew(false);
        } catch (error) {
            toast.error('Error creating a Customer');
        }

    };
    const handleSetProductQty = (productId, newQty) => {
        setSelectedProducts((prev) => {
            const updated = { ...prev };
            if (newQty <= 0) {
                delete updated[productId];
            } else {
                updated[productId] = newQty;
            }
            return updateQuoteFromSelectedProduct(updated);
        });
    };
    const handleSetRoomtQty = (roomId, newQty) => {
        setSelectedRooms((prev) => {
            const updated = { ...prev };
            if (newQty <= 0) {
                delete updated[roomId];
            } else {
                updated[roomId] = newQty;
            }
            return updateQuoteFromSelectedRoom(updated);
        });
    };

    const daysCalc = (datein, dateout) => {
        const initialDate = new Date(datein);
        const endDate = new Date(dateout);
        const msDiff = endDate.getTime() - initialDate.getTime();
        const dias = Math.floor(msDiff / (1000 * 60 * 60 * 24));
        return dias;
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-10/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden min-h-screen items-center p-4"
            >
                <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-[#00C49F]">New Quote</h1>

                <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-2xl shadow bg-white mx-2 mb-2 w-full">
                    {/* Customer + Dates */}
                    <div className='flex flex-col gap-4 sm:flex-col lg:flex-row'>

                        {/* CUSTOMER */}
                        <fieldset className="border p-4 rounded-2xl w-full">
                            <legend className="font-semibold text-lg">Customer Details</legend>
                            <div className="flex items-center gap-2">
                                <input
                                    ref={customerEmailRef}
                                    type="email"
                                    name="customerEmail"
                                    value={quote.customerEmail}
                                    onChange={(e) =>
                                        setQuote((prev) => ({
                                            ...prev,
                                            customerEmail: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCustomerEmailSearch(customerEmailRef.current.value);
                                        }
                                    }}
                                    onBlur={() => {
                                        handleCustomerEmailSearch(customerEmailRef.current.value);
                                    }}
                                    className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                                    placeholder="Enter customer email"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCustomerEmailSearch(customerEmailRef.current.value)}
                                    className=" text-cyan-50 px-3 py-1 rounded bg-[#118290] hover:bg-[#0d6c77]"
                                >
                                    <Search />
                                </button>

                                {!isNew && (
                                    <button
                                        type="button"
                                        className="bg-slate-500 hover:bg-slate-700 text-cyan-50 px-3 py-1 rounded"
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
                        </fieldset>

                        {/* DATES */}
                        <fieldset className="border rounded-2xl w-full px-6 py-4">
                            <legend className="font-semibold text-lg">{store.storeBookings ? 'Beds Required & Dates' : 'Dates'}</legend>
                            <div className='flex flex-row'>
                                {/* Number of Beds required */}
                                {store.storeBookings && (
                                    <div className='flex flex-col items-center justify-center gap-2 mt-4 mr-2 w-full'>
                                        <div className="flex flex-col sm:flex-col items-center text-center gap-2">
                                            <span className="text-sm font-bold text-slate-800 mb-2">Number of beds</span>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setNumberOfPeople(prev => Math.max(1, prev - 1))}
                                                    className={`${isPeopleLock ? 'bg-gray-500' : 'bg-red-400 hover:bg-red-500'} text-cyan-50 px-2 rounded`}
                                                    disabled={isPeopleLock || numberOfPeople <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-bold text-slate-800">{numberOfPeople}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setNumberOfPeople(prev => prev + 1)}
                                                    className={`${isPeopleLock ? 'bg-gray-500' : 'bg-[#118290] hover:bg-[#0d6c77]'} text-cyan-50 px-2 rounded`}
                                                    disabled={isPeopleLock}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm mt-2">* Remember to confirm/edit this number before dates</p>
                                    </div>
                                )}
                                <div className="relative w-full max-w-md mb-4">
                                    <div className="w-full max-w-md mb-4">
                                        <label className="mb-2 block font-medium text-center">
                                            Check-in/out
                                        </label>
                                        <div className="flex justify-center">
                                            <DateRangePicker
                                                value={{ start: quote.dateIn, end: quote.dateOut }}
                                                onChange={({ start, end }) =>
                                                    setQuote((prev) => ({
                                                        ...prev,
                                                        dateIn: start,
                                                        dateOut: end
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm mt-2">* Rooms will not be visible until you pick dates</p>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    {/* DATOS DE PRODUCTOS Y PRECIOS */}
                    <div className="flex flex-col gap-4 sm:flex-col lg:flex-row">
                        {/* DATOS DE PRODUCTOS y ROOMS*/}
                        <div className='w-full lg:w-3/4'>
                            <fieldset className="flex-grow space-y-4 border rounded-2xl p-4">
                                <legend className="text-2xl font-bold">Product List</legend>
                                <input
                                    type="text"
                                    placeholder="Search product by name..."
                                    className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            // Add logic if we want to do something when enter is pressed
                                        }
                                    }}
                                />
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2">
                                    {products.length === 0 ? (
                                        <p>No products found for this store.</p>
                                    ) : (
                                        products
                                            .filter(product =>
                                                product.name.toLowerCase().includes(productSearch.toLowerCase())
                                            )
                                            .filter(p => p.isActive === true)
                                            .sort((a, b) => a.type.localeCompare(b.type))
                                            .map((product) => {
                                                const qty = selectedProducts[product._id] || 0;

                                                return (
                                                    <div
                                                        key={product._id}
                                                        className={`border rounded-lg p-2 hover:ring-1 transition relative flex flex-col sm:flex-row items-center sm:items-start gap-2 ${qty > 0 ? 'bg-green-100 border-green-200 border-2' : 'border-gray-300 bg-cyan-50'
                                                            }`}
                                                    >
                                                        <div className='w-full sm:w-3/4'>
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                {product.name} - {product.durationDays ? product.durationDays + ' days -' : ''} ${product.finalPrice.toFixed(2)}
                                                            </h3>
                                                        </div>

                                                        <div className='w-full sm:w-1/4 flex justify-center sm:justify-end'>
                                                            {qty > 0 ? (
                                                                <div className="flex gap-2 items-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => decrementProduct(product._id)}
                                                                        className="bg-red-400 hover:bg-red-500 text-cyan-50 px-2 rounded"
                                                                    >
                                                                        -
                                                                    </button>

                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={qty}
                                                                        onChange={(e) => {
                                                                            const newQty = parseInt(e.target.value, 10);
                                                                            if (!isNaN(newQty)) {
                                                                                handleSetProductQty(product._id, newQty);
                                                                            }
                                                                        }}
                                                                        className="w-12 text-center font-bold text-black border rounded"
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => incrementProduct(product._id)}
                                                                        className="bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-2 rounded"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => incrementProduct(product._id)}
                                                                    className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-2 rounded"
                                                                >
                                                                    +
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </fieldset>
                            {/*ROOMS*/}
                            {isRoomVisible && (
                                <fieldset className="flex-grow space-y-4 border rounded-2xl p-4">
                                    <legend className="text-2xl font-bold">Room List - Nights: {quote.numberOfNights || 0}</legend>
                                    <input
                                        type="text"
                                        placeholder="Search room by name..."
                                        className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                        value={roomSearch}
                                        onChange={(e) => setRoomSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                // Add logic if we want to do something when enter is pressed
                                            }
                                        }}
                                    />
                                    {roomNote && (
                                        <div>
                                            <p className='text-yellow-500 font-bold text-sm'>*** {roomNote.toUpperCase()} ***</p>
                                        </div>
                                    )}
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                                        {rooms.length === 0 ? (
                                            <p>No room found for this store.</p>
                                        ) : (
                                            rooms
                                                .filter(room =>
                                                    room.name.toLowerCase().includes(roomSearch.toLowerCase())
                                                )
                                                .sort((a, b) => a.type.localeCompare(b.type))
                                                .map((room) => {
                                                    const Qty = isRoomPrivate[room._id] ? room.availability : numberOfPeople;
                                                    const qty = selectedRooms[room._id] || 0;
                                                    const unitPrice = room.price;
                                                    const dateSegments = roomDateRanges[room._id] || [];
                                                    const maxContiguousDays = Math.max(
                                                        0,
                                                        ...dateSegments.map(seg => {
                                                            const from = new Date(seg.from);
                                                            const to = new Date(seg.to);
                                                            const diffDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
                                                            return diffDays;
                                                        })
                                                    );
                                                    const maxQty = maxContiguousDays;
                                                    let totalPrice = 0

                                                    if (room.type != "PRIVATE") {
                                                        totalPrice = unitPrice * qty * Qty;
                                                    } else {
                                                        totalPrice = unitPrice * qty;
                                                    }

                                                    return (
                                                        <div
                                                            key={room._id}
                                                            className="bg-white border border-slate-300 p-2 rounded shadow text-black flex flex-col sm:flex-row"
                                                        >
                                                            <div className='w-full sm:w-3/4'>
                                                                <h4 className="font-semibold text-lg">{room.name} - ${room.price.toFixed(2)}</h4>
                                                                <p className="text-sm text-slate-700">Tipo: {room.type}</p>
                                                                <p className="text-sm text-slate-700">Capacidad: {room.availability}</p>
                                                                <div className='flex flex-row'>
                                                                    {roomDateRanges[room._id]?.map((range, idx) => (
                                                                        <p key={idx} className="text-xs text-green-500">
                                                                            Available: {range.from} to {range.to}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                                {roomDateRanges[room._id] === null && (
                                                                    <p className="text-xs text-red-400">No availability in this room for selected dates.</p>
                                                                )}
                                                                {roomDateRanges[room._id]?.length > 0 && !room.availableEveryNight && (
                                                                    <div className="mt-2">
                                                                        <label className="block text-sm font-bold">Select start date:</label>
                                                                        <input
                                                                            type="date"
                                                                            className="border rounded px-2 py-1"
                                                                            value={roomStartDates[room._id] || ''}
                                                                            min={roomDateRanges[room._id][0].from}
                                                                            max={roomDateRanges[room._id][roomDateRanges[room._id].length - 1].to}
                                                                            onChange={(e) =>
                                                                                setRoomStartDates((prev) => ({
                                                                                    ...prev,
                                                                                    [room._id]: e.target.value
                                                                                }))
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className='text-center w-full sm:w-1/4 mt-4 sm:mt-0'>
                                                                Nights:
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="bg-red-500 text-cyan-50 px-2 rounded"
                                                                        disabled={qty <= 0}
                                                                        onClick={() => {
                                                                            roomType = room.type,
                                                                                decrementRoom(room._id)
                                                                        }}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={qty}
                                                                        onChange={(e) => {
                                                                            const newQty = parseInt(e.target.value, 10);
                                                                            if (!isNaN(newQty)) {
                                                                                handleSetRoomtQty(room._id, newQty);
                                                                            }
                                                                        }}
                                                                        className="w-12 text-center font-bold text-black border rounded"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className={`px-2 rounded ${roomDateRanges[room._id]?.length > 0 &&
                                                                            !room.availableEveryNight &&
                                                                            !roomStartDates[room._id]
                                                                            ? "bg-gray-400 cursor-not-allowed"
                                                                            : "bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 mr-5"
                                                                            }`}
                                                                        disabled={
                                                                            qty >= maxQty ||
                                                                            (roomDateRanges[room._id]?.length > 0 &&
                                                                                !room.availableEveryNight &&
                                                                                !roomStartDates[room._id])
                                                                        }
                                                                        onClick={() => {
                                                                            if (
                                                                                roomDateRanges[room._id]?.length > 0 &&
                                                                                !room.availableEveryNight &&
                                                                                !roomStartDates[room._id]
                                                                            ) {
                                                                                toast.error(
                                                                                    "Please select a start date for this room before increasing quantity."
                                                                                );
                                                                                return;
                                                                            }
                                                                            roomType = room.type,
                                                                                incrementRoom(room._id);
                                                                        }}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>

                                                                <div className="mt-2 text-sm">
                                                                    <div>
                                                                        Total: ${totalPrice.toFixed(2)}
                                                                    </div>
                                                                    {room.type === "SHARED" && roomDateRanges[room._id]?.length > 0 && (
                                                                        <div className="flex mt-2 text-center justify-center">
                                                                            <label className="text-sm flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={!!isRoomPrivate[room._id]}
                                                                                    onChange={() => handleToggleRoomPrivate(room._id)}
                                                                                />
                                                                                Is Private?
                                                                            </label>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                    );
                                                })
                                        )}
                                    </div>

                                </fieldset>
                            )}
                        </div>
                        {/* Price Column */}
                        <div className='w-full lg:w-1/4'>
                            <fieldset className="h-full space-y-4 rounded-2xl border p-4 flex flex-col">
                                <legend className="text-2xl font-bold">Pricing</legend>
                                {/* Detalle de productos y rooms en la cotización */}
                                <div>
                                    <div className='flex flex-col'>
                                        <h2 className='text-lg font-bold text-center'>Quote Detail</h2>
                                    </div>
                                    {(!quote.productList) ? (
                                        <p className='mt-5'></p>
                                    ) : (
                                        quote.productList
                                            .map((product) => {

                                                return (
                                                    <div
                                                        key={product.productId}
                                                        className='mt-5 mb-5 ml-5 flex flex-row text-sm text-slate-800'
                                                    >
                                                        <div className="w-3/4">
                                                            {product.productName}
                                                        </div>
                                                        <div className="w-1/4 text-right mr-5">
                                                            ${product.productFinalPrice}
                                                        </div>

                                                    </div>
                                                )
                                            }))}

                                    {(!quote.roomList) ? (
                                        <p></p>
                                    ) : (
                                        quote.roomList
                                            .map((room) => {
                                                return (
                                                    <div
                                                        key={room.roomId}
                                                        className='ml-5 flex flex-row text-sm text-slate-800'
                                                    >
                                                        <div className="w-3/4">
                                                            {room.roomName}  ({room.roomNights} Nights)
                                                        </div>
                                                        <div className="w-1/4 text-right mr-5">
                                                            ${room.roomFinalPrice}
                                                        </div>

                                                    </div>
                                                )
                                            }))}

                                </div>

                                <div className="flex ml-4 mr-4 items-center justify-center">
                                    <label className=" text-slate-800 font-bold text-lg">Price: ${Number(finalPrice).toFixed(2)}</label>
                                </div>
                                <div className="ml-4 mr-4">
                                    <div className="flex justify-between w-full">
                                        <label className="block text-sm font-medium text-slate-800">Discount</label>
                                        <label className="block text-sm font-medium text-slate-800">{(finalPrice && quote.discount) ? ((quote.discount / finalPrice) * 100).toFixed(2) : '0.00'}%</label>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full mt-1 p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                        value={quote.discount}
                                        onChange={(e) => {
                                            let raw = e.target.value.replace(',', '.'); // Soporta coma decimal
                                            const parsed = parseFloat(raw);
                                            const discount = isNaN(parsed) ? 0 : parsed;

                                            const updatedFinalPrice = Math.max(0, parseFloat(finalPrice) - discount); // evita negativos

                                            setQuote((prev) => ({
                                                ...prev,
                                                discount,
                                                finalPrice: updatedFinalPrice,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                // Lógica extra opcional
                                            }
                                        }}
                                    />
                                </div>
                                <div className="ml-4 mr-4 flex items-center justify-center">
                                    <label className=" text-slate-800 font-bold text-lg mt-6">Final Price: </label>
                                    <label className=" text-slate-800 font-bold text-2xl mt-6 ml-2">${Number(quote.finalPrice).toFixed(2)}</label>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    {/* Other Details  Fieldset */}
                    <fieldset className="flex flex-col gap-4 border rounded-2xl p-4">
                        <legend className="text-2xl font-bold">Other Details</legend>

                        {/* Source y Tags apilados en mobile */}
                        <div className="flex flex-col lg:flex-row gap-4 w-full">
                            {/* Source */}
                            <div className="flex flex-col gap-4 w-full">
                                <div>
                                    <label className="block text-sm font-medium">Source</label>
                                    <Select
                                        options={sourceList.map(item => ({
                                            value: item.name,
                                            label: item.name,
                                            item,
                                        }))}
                                        value={sourceList
                                            .map(item => ({ value: item.name, label: item.name }))
                                            .find(opt => opt.value === quote.source) || null}
                                        onChange={(selectedOption) => {
                                            const selected = selectedOption?.value || "";
                                            const updatedQuote = {
                                                ...quote,
                                                source: selected,
                                            };
                                            if (selected !== 'Other') updatedQuote.customSource = '';
                                            if (selected !== 'Partner') updatedQuote.partnerId = '';
                                            setQuote(updatedQuote);
                                        }}
                                        placeholder="Select source..."
                                        className="text-slate-900"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#d1d5db', // Tailwind border-gray-300
                                                padding: '2px',
                                                fontSize: '0.875rem', // text-sm
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 50,
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                backgroundColor: state.isFocused ? "#3BA0AC" : "white",
                                                color: "#1e293b", // slate-900
                                            }),
                                        }}
                                    />

                                </div>

                                {quote.source === 'Partner' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-800">Partner</label>
                                        <select
                                            className="w-full mt-1 p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                            value={quote.partnerId || ''}
                                            onChange={(e) =>
                                                setQuote((prev) => ({
                                                    ...prev,
                                                    partnerId: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="" className='text-slate-900'>Select a partner</option>
                                            {partners.map((partner) => (
                                                <option key={partner._id} value={partner._id} className='text-slate-900'>
                                                    {partner.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {quote.source === 'Other' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-800">Specify Source</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                            placeholder="Custom source"
                                            value={quote.customSource || ''}
                                            onChange={(e) =>
                                                setQuote((prev) => ({
                                                    ...prev,
                                                    customSource: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <fieldset className="w-full rounded-2xl border p-4 space-y-4">
                                <legend className="font-bold">Tags</legend>
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full sm:w-1/2 p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                        value={newTag.name}
                                        onChange={(e) => setNewTag((prev) => ({ ...prev, name: e.target.value }))}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Code"
                                        className="w-full sm:w-1/2 p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                        value={newTag.code}
                                        onChange={(e) => setNewTag((prev) => ({ ...prev, code: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newTag.name || newTag.code) {
                                                setQuote((prev) => ({
                                                    ...prev,
                                                    tag: [...(prev.tag || []), newTag],
                                                }));
                                                setNewTag({ name: '', code: '' });
                                            }
                                        }}
                                    >
                                        <CirclePlus className="hover:bg-cyan-800 hover:text-cyan-50 text-slate-800 rounded-4xl" />
                                    </button>
                                </div>

                                <ul className="space-y-1">
                                    {(quote.tag || []).map((tag, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between items-center bg-cyan-50 rounded px-3 py-2"
                                        >
                                            <span>{tag.name} - {tag.code}</span>
                                            <button
                                                type="button"
                                                className="text-red-400 hover:text-red-500"
                                                onClick={() => {
                                                    const updatedTags = quote.tag.filter((_, i) => i !== index);
                                                    setQuote((prev) => ({ ...prev, tag: updatedTags }));
                                                }}
                                            >
                                                <Trash2 />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </fieldset>
                        </div>

                        {/* Toggles */}
                        <div className="flex flex-col md:flex-row gap-4 w-full items-center justify-center mt-4">
                            {[{
                                label: "Is Confirmed?",
                                value: quote.isConfirmed,
                                onChange: (v) => setQuote((prev) => ({ ...prev, isConfirmed: v })),
                                id: "isConfirmed"
                            }, {
                                label: "Is a returning customer?",
                                value: quote.isReturningCustomer,
                                onChange: (v) => setQuote((prev) => ({ ...prev, isReturningCustomer: v })),
                                id: "isReturningCustomer"
                            }, {
                                label: "Send quote email?",
                                value: quote.sendEmail,
                                onChange: (v) => setQuote((prev) => ({ ...prev, sendEmail: v })),
                                id: "sendEmail"
                            }].map(({ label, value, onChange, id }) => (
                                <div key={id} className="flex flex-col items-center border rounded-2xl px-4 py-2 w-full md:w-1/3">
                                    <label className="text-sm font-medium text-slate-800">{label}</label>
                                    <label className="relative inline-flex items-center cursor-pointer mt-2 mb-1">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={value}
                                            onChange={(e) => onChange(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors duration-300"></div>
                                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 pointer-events-none"></div>
                                    </label>
                                    <span className="text-sm">{value ? "Yes" : "No"}</span>
                                </div>
                            ))}
                        </div>

                        {/* Botones */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                            <button type="submit" className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded">
                                Create Quote
                            </button>
                            <button
                                type="button"
                                className="bg-slate-600 hover:bg-slate-700 text-cyan-50 px-4 py-2 rounded"
                                onClick={handleReset}
                            >
                                Reset Quote
                            </button>
                        </div>
                    </fieldset>
                </form >
            </motion.div >
        </div >
    );
}
