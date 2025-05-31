import { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRoomReservationServices } from "../../store/roomReservationServices";
import { useCustomerServices } from "../../store/customerServices";
import { useRoomServices } from "../../store/roomServices";
import Cookies from 'js-cookie';
import toast from "react-hot-toast";

const localizer = momentLocalizer(moment);

export default function BookingSchedule() {
    const [events, setEvents] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { getReservations, getReservationsByDate, updateRoomReservation } = useRoomReservationServices();
    const { getCustomerEmail } = useCustomerServices();
    const { getRoomById } = useRoomServices();
    const storeId = Cookies.get('storeId');
    const timezone = Cookies.get('timezone');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState(Views.MONTH);
    const [loadedRange, setLoadedRange] = useState({ start: null, end: null });
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [editDateIn, setEditDateIn] = useState('');
    const [editDateOut, setEditDateOut] = useState('');

    const loadReservations = async (startDate, endDate) => {
        try {
            const reservations = await getReservationsByDate(storeId, startDate, endDate);
            //console.log("Respuesta de getReservationsByDate: ", reservations);
            const reservationList = reservations.roomReservationList
            const eventData = await Promise.all(
                reservationList.map(async (res) => {
                    const auxRoom = await getRoomById(res.roomId);
                    const room = auxRoom.room
                    const auxCustomer = await getCustomerEmail(res.customerEmail, storeId)
                    const customer = auxCustomer.customerList[0]
                    //console.log("Respuesta de getRoomById: ", room)
                    return {
                        id: res._id,
                        title: `${room.name} - ${customer.name}  - Beds: ${res.bedsReserved}`,
                        start: new Date(res.dateIn),
                        end: new Date(res.dateOut),
                        customerEmail: res.customerEmail,
                    };
                })
            );
            setEvents(eventData);
        } catch (error) {
            console.error("Error loading reservations:", error);
        }
    }

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), -20);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, +20);
        loadReservations(firstDay, lastDay);
    }, []);

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);

        const weekday = date.toLocaleDateString("en-US", { weekday: "long" }); // Monday
        const month = date.toLocaleDateString("en-US", { month: "long" }); // May
        const day = String(date.getDate()).padStart(2, "0"); // 26
        const year = date.getFullYear(); // 2025

        return `${weekday}, ${month} ${day} ${year}`;
    };

    const handleSelectEvent = async (event) => {
        try {
            const auxCustomer = await getCustomerEmail(event.customerEmail,storeId);
            const customer = auxCustomer.customerList[0];
            setSelectedCustomer(customer);
            setSelectedReservation(event); // guardamos la reserva seleccionada
            setEditDateIn(moment(event.start).format('YYYY-MM-DD'));
            setEditDateOut(moment(event.end).format('YYYY-MM-DD'));
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching customer:", error);
        }
    };

    const handleUpdateReservation = async () => {
        try {
            const updated = {
                dateIn: new Date(editDateIn),
                dateOut: new Date(editDateOut),
            };
            await updateRoomReservation(selectedReservation.id, updated);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Reservation updated")
            setShowModal(false);
            // Refrescar calendario si es necesario
            const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            loadReservations(monthStart, monthEnd);
        } catch (err) {
            console.error("Error updating reservation:", err);
        }
    };

    const calculateAge = (birthdate) => {
        if (!birthdate) return "";
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleSelectSlot = ({ start }) => {
        setSelectedDate(start);
        setView(Views.DAY);
    };

    const handleNavigate = (newDate) => {

        console.log("Entre a handleNavigate: ", newDate)
        setSelectedDate(newDate);

        const newMonthStart = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        const newMonthEnd = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);

        const isSameMonth =
            loadedRange.start &&
            loadedRange.end &&
            loadedRange.start.getFullYear() === newMonthStart.getFullYear() &&
            loadedRange.start.getMonth() === newMonthStart.getMonth();

        console.log("isSameMonth: ", isSameMonth)
        if (!isSameMonth) {
            console.log("newMonthStart: ", newMonthStart)
            console.log("newMonthEnd: ", newMonthEnd)
            loadReservations(newMonthStart, newMonthEnd);
        }
    };

    return (
        <div className="min-h-screen text-foreground w-full px-4 py-6 bg-blue-950 flex flex-col justify-center items-center">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-semibold mb-6 text-white text-center"
            >
                Room Schedule
            </motion.h1>

            <div className="w-full max-w-6xl bg-card p-4 rounded-2xl shadow-md border">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    onNavigate={handleNavigate}
                    defaultView={Views.MONTH}
                    view={view}
                    onView={setView}
                    date={selectedDate}
                    className="rounded-md"
                />
            </div>

            <AnimatePresence>
                {showModal && selectedCustomer && selectedReservation && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="bg-card rounded-2xl shadow-lg p-6 w-full max-w-md relative text-foreground"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
                                onClick={() => setShowModal(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-semibold mb-4">Customer Info</h2>
                            <div className="space-y-2">
                                <p><strong>Name:</strong> {selectedCustomer.name}</p>
                                <p><strong>Birthdate:</strong> {formatDateDisplay(selectedCustomer.birthdate)}</p>
                                <p><strong>Age:</strong> {calculateAge(selectedCustomer.birthdate)} years</p>
                                <p><strong>Country:</strong> {selectedCustomer.country}</p>
                            </div>

                            <div className="mt-6 space-y-2">
                                <h3 className="font-semibold text-lg">Reservation Info</h3>
                                <label className="block text-sm font-medium">Date In:</label>
                                <input
                                    type="date"
                                    defaultValue={new Date(selectedReservation.start).toISOString().split('T')[0]}
                                    className="w-full p-2 rounded-md border bg-background"
                                    onChange={(e) =>
                                        setSelectedReservation({ ...selectedReservation, start: new Date(e.target.value) })
                                    }
                                />
                                <label className="block text-sm font-medium">Date Out:</label>
                                <input
                                    type="date"
                                    defaultValue={new Date(selectedReservation.end).toISOString().split('T')[0]}
                                    className="w-full p-2 rounded-md border bg-background"
                                    onChange={(e) =>
                                        setSelectedReservation({ ...selectedReservation, end: new Date(e.target.value) })
                                    }
                                />
                                <button
                                    onClick={handleUpdateReservation}
                                    className="mt-4 w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/80 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}