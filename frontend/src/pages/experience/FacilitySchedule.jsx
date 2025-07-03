import { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AnimatePresence, motion } from "framer-motion";
import { CircleX } from "lucide-react";
import { useCustomerServices } from "../../store/customerServices";
import Cookies from 'js-cookie';
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useFacilityReservationServices } from "../../store/facilityReservationServices";
import { useFacilityServices } from "../../store/facilityServices";

const localizer = momentLocalizer(moment);

export default function FacilitySchedule() {
    const [events, setEvents] = useState([]);
    const [facilityList, setFacilityList] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { getFacilityReservationsByDate, updateFacilityReservation } = useFacilityReservationServices();
    const { getFacilityList, getFacilityById } = useFacilityServices();
    const { getCustomerEmail } = useCustomerServices();
    const storeId = Cookies.get('storeId');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState(Views.AGENDA);
    const [loading, setLoading] = useState(true);

    const loadReservations = async (startDate, endDate) => {
        try {
            setLoading(true);
            const [reservations, facilities] = await Promise.all([
                getFacilityReservationsByDate(storeId, startDate, endDate),
                getFacilityList(storeId),
            ]);

            setFacilityList(facilities.facilityList || []);

            const eventData = await Promise.all(
                reservations.facilityReservationList.map(async (res) => {
                    const auxFacility = await getFacilityById(res.facilityId);
                    const facility = auxFacility.facility;
                    const auxCustomer = await getCustomerEmail(res.customerEmail, storeId);
                    const customer = auxCustomer.customerList[0];
                    if (!facility || !customer) return null;
                    const localStart = new Date(res.dateIn);
                    const localEnd = new Date(res.dateIn);
                    localEnd.setHours(23, 59, 59, 999);

                    return {
                        id: res._id,
                        title: `${facility.name} - ${customer.name} - ${res.staffEmail}`,
                        start: localStart,
                        end: localEnd,
                        allDay: true,
                        customerEmail: res.customerEmail,
                        facilityId: res.facilityId,
                    };
                })
            );

            setEvents(eventData);
        } catch (error) {
            console.error("Error loading reservations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        loadReservations(firstDay, lastDay);
    }, []);

    const handleSelectSlot = ({ start }) => {
        setSelectedDate(start);
        setView(Views.DAY);
    };

    const handleNavigate = (newDate) => {
        setSelectedDate(newDate);
        const newMonthStart = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        const newMonthEnd = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
        loadReservations(newMonthStart, newMonthEnd);
    };

    useEffect(() => {
        const toolbar = document.querySelector('.rbc-toolbar');
        if (toolbar) {
            toolbar.classList.add(
                'bg-[#18394C]',
                'text-cyan-50',
                'border-b',
                'border-blue-900',
                'rounded-t-md',
                'p-2',
                'flex',
                'flex-wrap',
                'justify-between',
                'items-center'
            );

            const buttons = toolbar.querySelectorAll('button');
            buttons.forEach((btn) => {
                btn.classList.add(
                    'bg-[#3BA0AC]',
                    'hover:bg-[#6BBCC5]',
                    'text-cyan-50',
                    'px-2',
                    'py-1',
                    'rounded',
                    'mx-1'
                );
            });

            const activeBtn = toolbar.querySelector('button.rbc-active');
            if (activeBtn) {
                activeBtn.classList.add('bg-[#118290]', 'hover:bg-[#0d6c77]');
            }
        }
    }, [view]);

    return (
        <>
            {loading && <LoadingSpinner />}
            <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col bg-sky-50 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-[calc(100vh-5rem)] w-full max-w-7xl px-4 py-6 mt-4 mx-auto"
                >
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-3xl font-semibold mb-6 text-[#00C49F] text-center"
                    >
                        Schedule by Facility
                    </motion.h1>

                    {facilityList.map((facility) => {
                        // Solo los eventos válidos Y de este facility
                        const facilityEventsForThis = events
                            .filter(ev =>
                                ev &&
                                ev.title &&
                                ev.start &&
                                ev.end &&
                                ev.facilityId === facility._id // ← muy importante
                            );


                        return (
                            <div key={facility._id} className="mb-10">
                                <h3 className="text-xl font-semibold mb-2 text-center text-[#00C49F]">
                                    {facility.name}
                                </h3>
                                <div className="bg-white p-4 rounded-lg shadow border text-slate-900">
                                    {facilityEventsForThis.length > 0 ? (
                                        <Calendar
                                            localizer={localizer}
                                            events={facilityEventsForThis}
                                            startAccessor="start"
                                            endAccessor="end"
                                            style={{ height: 500 }}
                                            onSelectSlot={handleSelectSlot}
                                            onNavigate={handleNavigate}
                                            onView={setView}
                                            defaultView={Views.AGENDA}
                                            view={view}
                                            views={['agenda']}
                                            date={selectedDate}
                                            className="rounded-md"
                                        />
                                    ) : (
                                        <p className="text-center text-slate-500">No reservations for this facility this month.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

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
                                        <CircleX className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-xl font-semibold mb-4">Reservation Info</h2>
                                    <p className="text-sm text-gray-600">{selectedCustomer.name}</p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </>
    );
}