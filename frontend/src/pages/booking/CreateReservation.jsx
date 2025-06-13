import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCustomerServices } from '../../store/customerServices';
import { Contact2, Search, CirclePlus } from 'lucide-react';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CustomerDetails from '../../components/CustomerDetail'
import { useRoomReservationServices } from '../../store/roomReservationServices';
import DateRangePicker from "../../components/DateRangePicker"
import LoadingSpinner from '../../components/LoadingSpinner';


export default function CreateReservation() {
    const { getAvailableRooms, createRoomReservation, updateRoomReservation } = useRoomReservationServices();
    const storeId = Cookies.get('storeId');
    const { user } = useAuthStore();
    const { getCustomerEmail, createCustomer, updateCustomer } = useCustomerServices();
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [customer, setCustomer] = useState({});
    const [loading, setLoading] = useState(false);
    const [finalPrice, setFinalPrice] = useState();
    const customerEmailRef = useRef(null);
    const [rooms, setRooms] = useState([]);
    const [reservation, setReservation] = useState({});
    const [selectedRooms, setSelectedRooms] = useState({});
    const [isRoomVisible, setIsRoomVisible] = useState(false);
    const [isRoomPrivate, setIsRoomPrivate] = useState({});
    const [roomSearch, setRoomSearch] = useState("");
    const hasFetchedEmail = useRef(false);
    const navigate = useNavigate();
    const [roomNote, setRoomNote] = useState(null);
    const [roomDateRanges, setRoomDateRanges] = useState({});
    const [roomStartDates, setRoomStartDates] = useState({});
    let isSplit = false;
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [isPeopleLock, setIsPeopleLock] = useState(false);
    const hasInteractedWithToggle = useRef(false);

    const roomFill = (roomList) => {
        setSelectedRooms(roomList);
    }
    const reservationFill = () => {
        setReservation({
            dateIn: '',
            roomList: [],
            dateOut: '',
            customerEmail: '',
            roomFinalPrice: 0,
            roomUnitaryPrice: 0,
            bedsReserved: 0,
            currency: 'USD',
            userEmail: user.email,
            storeId: storeId,
            isPaid: false,
        })
    };

    // Cuando cambian las fechas, buscar habitaciones disponibles
    useEffect(() => {
        //console.log("Entre a UE 4");
        const fetchAvailableRooms = async () => {
            if (!reservation.dateIn || !reservation.dateOut) {
                setIsPeopleLock(false);
                return;
            }
            try {
                setLoading(true);
                const availablePayload = {
                    dateIn: reservation.dateIn,
                    dateOut: reservation.dateOut,
                    bedsRequired: numberOfPeople,
                    storeId,
                }
                console.log("availablePayload: ", availablePayload)
                const response = await getAvailableRooms(availablePayload);
                const availableRooms = response.availableRooms || [];
                console.log("availableRooms: ", availableRooms)
                setRooms(availableRooms);

                const range = [];
                let d = new Date(reservation.dateIn);
                const end = new Date(reservation.dateOut);
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
                console.error('Error fetching available rooms:', error);
            } finally {
                setLoading(false)
            }
        };

        fetchAvailableRooms();
        const nights = daysCalc(reservation.dateIn, reservation.dateOut)

        setReservation((prev) => ({
            ...prev,
            numberOfNights: nights
        }));

    }, [reservation.dateIn, reservation.dateOut, storeId]);

    useEffect(() => {
        //console.log("Entre a UE Create")
        reservationFill();
    }, [])
    /*
        useEffect(() => {
            //console.log("Entre a UE 5");
            //console.log("F: Los datos de reservation son: ", reservation);
            //console.log("F: Los datos de customer son: ", customer);
            //console.log("F: Los datos de Selected Product son: ", selectedProducts);
            //console.log("F: FinalPrice es:", finalPrice)
        }, [reservation]);
    */
    useEffect(() => {
        if (!hasInteractedWithToggle.current) return;
        //console.log("Entre a UE 6");
        updateReservationFromSelectedRoom(selectedRooms);
    }, [isRoomPrivate]);

    const incrementRoom = (roomId) => {
        setSelectedRooms((prev) => {
            const updated = { ...prev, [roomId]: (prev[roomId] || 0) + 1 };
            return updateReservationFromSelectedRoom(updated);
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
            return updateReservationFromSelectedRoom(updated);
        });
    };

    const handleToggleRoomPrivate = (roomId) => {
        hasInteractedWithToggle.current = true;
        setIsRoomPrivate(prev => {
            const newState = { ...prev, [roomId]: !prev[roomId] };
            return newState;
        });
    };

    const updateReservationFromSelectedRoom = (selected) => {
        const structuredList = Object.entries(selected).map(([id, qty]) => {
            const room = rooms.find((p) => p._id === id);
            const startDate = roomStartDates[id] ? new Date(roomStartDates[id]) : new Date(reservation.dateIn);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + qty);
            const isPrivate = isRoomPrivate[id];
            const adjustedQty = isPrivate ? room.availability : numberOfPeople;
            const nights = (endDate - startDate) / (1000 * 60 * 60 * 24);
            return {
                roomId: id,
                roomName: room?.name || '',
                bedsReserved: adjustedQty,
                roomUnitaryPrice: (room?.price || 0),
                roomFinalPrice: ((room?.price || 0) * qty * adjustedQty),
                roomDateIn: isNaN(startDate) ? '' : startDate.toISOString(),
                roomDateOut: isNaN(endDate) ? '' : endDate.toISOString(),
                roomNights: nights
            };
        });

        const roomSubtotal = structuredList.reduce((sum, item) => sum + item.roomFinalPrice, 0);
        const total = roomSubtotal;
        setFinalPrice(total);
        setReservation(prev => ({
            ...prev,
            roomList: structuredList,
            roomFinalPrice: total
        }));
        return selected;
    };

    const handleCustomerEmailSearch = async (customerEmail) => {
        //console.log("El email en handleCustomerEmailSearch es: ", customerEmail);
        setLoading(true)
        try {
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
                setReservation((prev) => ({
                    ...prev,
                    customerEmail: found[0].email,
                }));
                setIsNew(false);
                setIsCustomerModalOpen(false);
            } else {
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
                setReservation((prev) => ({ ...prev, customerEmail: customerEmail }));
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
        if (!reservation.dateIn || !reservation.dateOut || !reservation.customerEmail || !reservation.storeId || !reservation.userEmail) {
            toast.error('Please fill all the mandatory data.');
            return;
        }
        setLoading(true)
        try {
            const reservationPayloadList = reservation.roomList.map(room => ({
                roomId: room.roomId,
                customerEmail: reservation.customerEmail,
                storeId: reservation.storeId,
                dateIn: room.roomDateIn,
                dateOut: room.roomDateOut,
                bedsReserved: room.bedsReserved,
                roomUnitaryPrice: room.roomUnitaryPrice,
                roomFinalPrice: room.roomFinalPrice,
                currency: reservation.currency,
                userEmail: reservation.userEmail,
                isPaid: reservation.isPaid,
            }));
            //console.log("El payload es: ", reservationPayloadList)
            for (const res of reservationPayloadList) {
                await createRoomReservation(res);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Reservation(s) created successfully');

            // Opcional: resetear formulario
            handleReset();

        } catch (err) {
            toast.error('Error saving the reservation');
        } finally {
            setLoading(false)
        }
    };

    const handleReset = (e) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        reservationFill();
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
        setIsNew(true);
    }
    const handleSaveClient = async (e) => {
        setLoading(true)
        try {
            //console.log("F: El cliente es:", customer);
            const customerPayload = {
                _id: customer._id,
                email: customer.email,
                name: customer.name,
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
        } finally {
            setLoading(false)
        }

    };

    const handleSetRoomtQty = (roomId, newQty) => {
        setSelectedRooms((prev) => {
            const updated = { ...prev };
            if (newQty <= 0) {
                delete updated[roomId];
            } else {
                updated[roomId] = newQty;
            }
            return updateReservationFromSelectedRoom(updated);
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
                    className="flex flex-col w-full max-w-9/12 mx-auto bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center"
                >
                    <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white bg-clip-text">New Reservation</h1>
                    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-2xl shadow bg-blue ml-2 mr-2 mb-2 bg-blue-800 w-full">
                        {/* DATOS DE CLIENTE*/}
                        <div className="flex flex-col lg:flex-row gap-1">
                            <fieldset className="border p-4 rounded-2xl w-full">
                                <legend className="font-semibold text-lg">Customer Details</legend>
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={customerEmailRef}
                                        type="email"
                                        name="customerEmail"
                                        value={reservation.customerEmail}
                                        onChange={(e) =>
                                            setReservation((prev) => ({
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
                                        className="w-full border px-2 py-1 rounded bg-white text-blue-950"
                                        placeholder="Enter customer email"
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
                                <div className='flex flex-row justify-center text-center mt-2'>
                                    Number of people:
                                    <div className="top-2 right-2 gap-2 items-center">
                                        <button
                                            type="button"
                                            onClick={() => setNumberOfPeople(prev => Math.max(1, prev - 1))}
                                            className={`${isPeopleLock ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'} text-white px-2 rounded  ml-2`}
                                            disabled={isPeopleLock || numberOfPeople <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="text-sm font-bold text-white ml-2 mr-2">{numberOfPeople}</span>
                                        <button
                                            type="button"
                                            onClick={() => setNumberOfPeople(prev => prev + 1)}
                                            className={`${isPeopleLock ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'} text-white px-2 rounded `}
                                            disabled={isPeopleLock}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </fieldset>
                            {/* DATOS DE COTIZACION*/}
                            <fieldset className="border rounded-2xl w-full px-6 py-4">
                                <legend className="font-semibold text-lg px-2">Dates</legend>

                                <div className="flex flex-col items-center text-center">
                                    <div className="w-full max-w-md mb-4">
                                        <label className="mb-2 block font-medium text-center">
                                            Date Range (Check-in / Check-out)
                                        </label>
                                        <div className="flex justify-center">
                                            <DateRangePicker
                                                value={{ start: reservation.dateIn, end: reservation.dateOut }}
                                                onChange={({ start, end }) =>
                                                    setReservation((prev) => ({
                                                        ...prev,
                                                        dateIn: start,
                                                        dateOut: end,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <p className="text-sm mt-2">* Rooms will not be visible until you pick dates</p>
                                </div>
                            </fieldset>
                        </div>
                        {/* DATOS DE PRODUCTOS Y PRECIOS */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* DATOS DE PRODUCTOS y ROOMS*/}
                            <div className='w-full lg:w-3/4'>
                                {/*ROOMS*/}
                                {isRoomVisible && (
                                    <fieldset className="flex-grow space-y-4 border rounded-2xl p-4">
                                        <legend className="text-2xl font-bold">Room List - Nights: {reservation.numberOfNights || 0}</legend>
                                        <input
                                            type="text"
                                            placeholder="Search room by name..."
                                            className="w-full p-2 border border-gray-300 rounded"
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
                                                        const totalPrice = unitPrice * qty * Qty;

                                                        return (
                                                            <div
                                                                key={room._id}
                                                                className="bg-gray-100 p-2 rounded shadow text-black flex flex-col sm:flex-row"
                                                            >
                                                                <div className='w-full sm:w-3/4'>
                                                                    <h4 className="font-semibold text-lg">{room.name} - ${room.price.toFixed(2)}</h4>
                                                                    <p className="text-sm text-gray-700">Tipo: {room.type}</p>
                                                                    <p className="text-sm text-gray-700">Capacidad: {room.availability}</p>
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
                                                                <div className='text-center w-full sm:w-1/4 mt-4 sm:mt-0 mr-3'>
                                                                    Nights:
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <button
                                                                            type="button"
                                                                            className="bg-red-500 text-white px-2 rounded"
                                                                            disabled={qty <= 0}
                                                                            onClick={() => decrementRoom(room._id)}
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
                                                                                : "bg-green-600 hover:bg-green-700 text-white"
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
                            {isRoomVisible && (
                                <div className='w-full lg:w-1/4'>
                                    <fieldset className="h-full space-y-4 rounded-2xl border p-4 flex flex-col">
                                        <legend className="text-2xl font-bold">Pricing</legend>
                                        {/* Detalle de productos y rooms en la cotización */}
                                        <div>
                                            <div className='flex flex-col'>
                                                <h2 className='text-lg font-bold text-center'>Selected Rooms</h2>
                                            </div>
                                            {(reservation.roomList?.length < 1) ? (
                                                <p>No rooms selected</p>
                                            ) : (
                                                (reservation.roomList ?? [])
                                                    .map((room) => {
                                                        return (
                                                            <div
                                                                key={room.roomId}
                                                                className='ml-5 flex flex-row text-sm text-white'
                                                            >
                                                                <div className="w-3/4">
                                                                    {room.roomName} ({room.roomNights} Nights)
                                                                </div>
                                                                <div className="w-1/4 text-right mr-5">
                                                                    ${room.roomFinalPrice}
                                                                </div>

                                                            </div>
                                                        )
                                                    }))}

                                        </div>

                                        <div className="ml-4 mr-4 flex items-center justify-center">
                                            <label className=" text-white font-bold text-lg mt-6">Final Price: </label>
                                            <label className=" text-white font-bold text-2xl mt-6 ml-2">${Number(reservation.roomFinalPrice).toFixed(2)}</label>
                                        </div>
                                    </fieldset>
                                </div>
                            )}
                        </div>
                        {/* Other Details  Fieldset */}
                        <fieldset className="w-full rounded-2xl border p-4 space-y-4">

                            {/* Botón  y switch centrado */}
                            <div className="flex flex-col items-center pt-4 space-y-4">
                                <div>
                                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                        Create Reservation
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ml-10"
                                        onClick={() => handleReset()}
                                    >
                                        Reset Reservation
                                    </button>
                                </div>

                            </div>
                        </fieldset>
                    </form>
                </motion.div>
            </div>
        </>
    );
}

