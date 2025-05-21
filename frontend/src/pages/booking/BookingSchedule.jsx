import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRoomReservationServices } from "../../store/roomReservationServices";
import { useCustomerServices } from "../../store/customerServices";
import { useRoomServices } from "../../store/roomServices";

const localizer = momentLocalizer(moment);

export default function BookingSchedule() {
    const [events, setEvents] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { getReservations } = useRoomReservationServices();
    const { getCustomerEmail } = useCustomerServices();
    const { getRoomById } = useRoomServices();

    useEffect(() => {
        async function loadReservations() {
            try {
                const reservations = await getReservations();
                console.log("Respuesta de getReservations: ", reservations);
                const eventData = await Promise.all(
                    reservations.map(async (res) => {
                        const room = await getRoomById(res.roomId);
                        console.log("Respuesta de getRoomById: ", room)
                        return {
                            id: res._id,
                            title: `${room.name} - ${res.customerEmail}`,
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

        loadReservations();
    }, []);

    const handleSelectEvent = async (event) => {
        try {
            const customer = await getCustomerEmail(event.customerEmail);
            console.log("Respuesta de getCustomerEmail: ", customer)
            setSelectedCustomer(customer);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching customer:", error);
        }
    };

    return (
        <div className="min-h-screen text-foreground flex flex-col justify-center px-4 py-6 bg-blue-950">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-semibold mb-6"
            >
                Booking Schedule
            </motion.h1>

            <div className="w-full max-w-6xl bg-card p-4 rounded-2xl shadow-md border">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    onSelectEvent={handleSelectEvent}
                    className="rounded-md"
                />
            </div>

            <AnimatePresence>
                {showModal && selectedCustomer && (
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
                                <p>
                                    <strong>Name:</strong> {selectedCustomer.name}
                                </p>
                                <p>
                                    <strong>Birthdate:</strong> {selectedCustomer.birthdate}
                                </p>
                                <p>
                                    <strong>Country:</strong> {selectedCustomer.country}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}