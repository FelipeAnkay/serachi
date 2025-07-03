import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cookies from 'js-cookie';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CircleX, Save, Ban, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStaffServices } from '../../store/staffServices';
import { useServiceServices } from '../../store/serviceServices';
import LoadingSpinner from '../../components/LoadingSpinner';
import CustomCalendarToolbar from '../../components/CustomCalendarToolbar';
import AgendaEventRenderer from '../../components/AgendaEventRenderer';
import SendShareScheduleModal from '../../components/SendShareScheduleModal';

const localizer = momentLocalizer(moment);

const Experiences = () => {
    const { updateService, getServicesForCalendar } = useServiceServices();
    const { getStaffEmail, getStaffList } = useStaffServices();
    const storeId = Cookies.get("storeId");
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(Views.AGENDA);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedService, setSelectedService] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalShareOpen, setModalShareOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [loadedRange, setLoadedRange] = useState({ start: null, end: null });
    const [staffList, setStaffList] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("All");
    const [startDay, setStartDay] = useState(new Date());
    const [lastDay, setLastDay] = useState(new Date());
    let loadServices = true;

    useEffect(() => {
        const now = new Date();
        // Primer día del mes actual
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        // Último día del mes actual
        const lastDay2 = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        //console.log("Fechas: ", firstDay, " TO ", lastDay)
        if (loadServices) {
            setStartDay(firstDay);
            setLastDay(lastDay2)
            fetchStaff();
            fetchExperiences(firstDay, lastDay2);
            loadServices = false;
        }

    }, []);

    useEffect(() => {
        if (selectedType === "All") {
            setEvents(allEvents);
        } else {
            const filtered = allEvents.filter(e => e.type === selectedType);
            setEvents(filtered);
        }
    }, [selectedType]);

    const fetchStaff = async () => {

        try {
            setLoading(true);
            const staff = await getStaffList(storeId);
            //console.log("staff: ", staff)
            setStaffList(staff.staffList);
        } catch (error) {
            toast.error("Error Fetching Staff")
        } finally {
            setLoading(false)
        }

    }

    const fetchExperiences = async (startDate, endDate) => {
        setStartDay(startDate);
        setLastDay(endDate)
        const allServiceEvents = [];
        const staffColorMap = {};
        const typesSet = new Set();
        //console.log("Entre a fetchExperiences", { startDate, endDate })
        const getColorForStaff = async (email) => {
            //console.log("Entre a getColorForStaff ", email);
            //console.log("El staffColorMap es: ", staffColorMap);
            if (!email) return "gray-500";
            if (staffColorMap[email]) return staffColorMap[email];

            try {
                setLoading(true)
                const res = await getStaffEmail(email, storeId);
                //console.log("El res es: ", res)
                const staff = res?.staffList;
                //console.log("El staff es: ", staff)
                const color = staff?.color || "gray-500";
                //console.log("El color es: ", color)
                staffColorMap[email] = color;
                return color;
            } catch {
                return "gray-500";
            } finally {
                setLoading(false)
            }
        };
        try {
            //setLoading(true);
            //console.log("La llamada de getServiceById ", {startDate,endDate});
            const serviceDetail = await getServicesForCalendar(startDate, endDate, storeId);
            //console.log("La respuesta de getServicesByDate ", serviceDetail);
            const parseDate = (d) =>
                typeof d === "object" && d.$date?.$numberLong
                    ? new Date(Number(d.$date.$numberLong))
                    : new Date(d);
            if (serviceDetail.serviceList.length > 0) {
                for (const serviceRef of serviceDetail.serviceList) {
                    //console.log("serviceRef: ", serviceRef)
                    if (serviceRef && serviceRef.isActive) {
                        const staffEmail = serviceRef.staffEmail;
                        const color = await getColorForStaff(staffEmail);
                        const serviceType = serviceRef.type || "Unknown";
                        typesSet.add(serviceType);
                        allServiceEvents.push({
                            title: `${serviceRef.name} - ${serviceRef.staffEmail}`,
                            start: parseDate(serviceRef.dateIn),
                            end: parseDate(serviceRef.dateOut),
                            allDay: false,
                            resource: serviceRef,
                            staffColor: color,
                            type: serviceRef.type,
                        });
                    }
                }
            }
            //console.log("allServiceEvents: ", allServiceEvents)
            setAllEvents(allServiceEvents);
            setEvents(allServiceEvents);
            setServiceTypes(["All", ...Array.from(typesSet)]);
            setLoadedRange({ start: startDate, end: endDate });
            if (view === "agenda" && allServiceEvents.length > 0) {
                const today = new Date();
                const earliest = allServiceEvents.reduce((min, e) =>
                    e.start < min.start ? e : min
                );

                setSelectedDate(earliest.start);

                if (isSameMonth(earliest.start, today)) {
                    const nextClosest = allServiceEvents.find(e => e.start >= today);
                    //console.log("nextClosest es: ", nextClosest)
                    if (nextClosest) {
                        setTimeout(() => {
                            const el = document.querySelector(`[data-id="event-${nextClosest.resource._id}"]`);
                            //console.log("Documento encontrado: ", el)
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 500); // ⏱️ tiempo suficiente para que el calendario renderice
                    }
                }
            }
        } catch (error) {
            toast.error("Theres no services for this month")
            //console.log("El error es: ", error)
            setEvents([]);
        } finally {
            //setLoading(false);
        }
    };

    const isSameMonth = (date1, date2) =>
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth();

    const handleSelectSlot = ({ start }) => {
        setSelectedDate(start);
        setView(Views.DAY);
    };

    const handleSelectEvent = (event) => {
        setSelectedService(event.resource);
        setEditData({
            staffEmail: event.resource.staffEmail || '',
            dateIn: moment(event.resource.dateIn).format('YYYY-MM-DDTHH:mm'),
            dateOut: moment(event.resource.dateOut).format('YYYY-MM-DDTHH:mm')
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedService(null);
        setEditData({});
    };

    const handleUpdate = async () => {
        if (!selectedService) return;
        setLoading(true)
        try {
            const updated = {
                ...selectedService,
                staffEmail: editData.staffEmail,
                dateIn: moment(editData.dateIn).toISOString(),
                dateOut: moment(editData.dateOut).toISOString()
            };

            await updateService(selectedService._id, updated);
            toast.success('Service Updated');

            const newMonthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), -7);
            const newMonthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, +7);

            fetchExperiences(newMonthStart, newMonthEnd);

            closeModal();
        } catch (error) {
            console.error('Error actualizando servicio:', error);
            toast.error('Error - Service was not updated');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelService = async () => {
        if (!selectedService) return;
        if (!confirm('Are you sure that you want to cancel this service?')) return;
        try {
            setLoading(true);
            await updateService(selectedService._id, { isActive: false });
            toast.success('Service Canceled');

            setEvents(prev => prev.filter(ev => ev.resource._id !== selectedService._id));
            closeModal();
        } catch (error) {
            console.error('Error cancelando servicio:', error);
            toast.error('Error - Canceling the service');
        } finally {
            setLoading(false)
        }
    };

    const handleShareSchedule = () => {
        setModalShareOpen(true);
    }

    const handleNavigate = (newDate) => {
        console.log("Entre a handleNavigate: ", newDate)
        setSelectedDate(newDate);
        //const newMonthStart = new Date(newDate.getFullYear(), newDate.getMonth(), -7);
        const newMonthStart = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        const newMonthEnd = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
        //const newMonthEnd = new Date(newDate.getFullYear(), newDate.getMonth() + 1, +7);
        //console.log("Nuevas fechas: ", { newMonthStart, newMonthEnd })
        //console.log("Fechas de loadedRange: ", {loadedRange})
        const auxStartMonth = loadedRange.start.getMonth()
        const auxNewStartMonth = newMonthStart.getMonth()
        //console.log("Meses a comparar: ", {auxStartMonth,auxNewStartMonth})
        const isSameMonth =
            loadedRange.start &&
            loadedRange.end &&
            loadedRange.start.getFullYear() === newMonthStart.getFullYear() &&
            loadedRange.start.getMonth() === newMonthStart.getMonth();

        //console.log("isSameMonth: ", isSameMonth)
        if (!isSameMonth) {
            fetchExperiences(newMonthStart, newMonthEnd);
        }
    };


    return (
        <>
            {
                loading && (
                    <LoadingSpinner />
                )
            }
            <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-5">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="
                                flex flex-col
                                bg-sky-50 backdrop-filter backdrop-blur-lg
                                rounded-2xl shadow-2xl border border-gray-800 overflow-visible
                                min-h-full
                                w-full max-w-7xl
                                px-4 py-15
                                mt-4
                                mx-auto
                            "
                >
                    <h2 className='text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text'>
                        Experiences Calendar
                    </h2>
                    <div className="flex-grow p-4 overflow-visible w-full">
                        <div className='flex flex-row justify-between'>
                            <div className="flex items-center gap-4 px-4">
                                <label className="text-slate-800 font-semibold">Filter Events by Type:</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="bg-white text-slate-900 border border-gray-600 rounded-md px-2 py-1"
                                >
                                    {serviceTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex flex-row text-[#118290] hover:text-cyan-50 hover:bg-[#118290] rounded-2xl px-2 py-1 mb-2' onClick={handleShareSchedule}>
                                <p className=' font-semibold'>Share</p>
                                <Share2/>
                            </div>
                        </div>
                        <div className="h-full w-full bg-white text-black rounded-xl shadow-xl">
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                selectable
                                onSelectSlot={handleSelectSlot}
                                onSelectEvent={handleSelectEvent}
                                onNavigate={handleNavigate}
                                defaultView={Views.AGENDA}
                                view={view}
                                onView={setView}
                                date={selectedDate}
                                style={{ height: '100%', width: '100%' }}
                                min={new Date(0, 0, 0, 5, 0)}   // ⏰ Mostrar desde las 5:00 am
                                max={new Date(0, 0, 0, 22, 0)}  // ⏰ Hasta las 10:00 pm
                                eventPropGetter={(event) => {
                                    const color = event.staffColor || "#6b7280"; // valor por defecto (gray-500)
                                    const id = event.resource?._id || event.title;
                                    return {
                                        'data-id': `event-${id}`,
                                        style: {
                                            backgroundColor: color,
                                            color: "white",
                                            borderRadius: "0.375rem", // equivalente a rounded-md
                                            paddingLeft: "0.5rem",    // equivalente a px-2
                                            paddingRight: "0.5rem",
                                        },
                                    };
                                }}
                                components={{
                                    toolbar: (props) => <CustomCalendarToolbar {...props} startDate={startDay} endDate={lastDay} />,
                                    agenda: {
                                        event: AgendaEventRenderer
                                    }
                                }}
                            />
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {modalOpen && selectedService && (
                        <motion.div
                            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-sky-50 text-slate-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-slate-800"
                                    onClick={closeModal}
                                >
                                    <CircleX />
                                </button>
                                <h3 className="text-2xl font-bold mb-4 text-[#00C49F] bg-clip-text text-center">
                                    {selectedService.name}
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <p><strong>Customer Email:</strong> {selectedService.customerEmail || 'No asignado'}</p>
                                    <div className='mt-2 flex flex-row'>
                                        <label className="block text-sm font-medium">Staff Email:</label>
                                        <select
                                            className="w-full border border-gray-300 bg-gray-800 text-slate-800 rounded px-3 py-2"
                                            value={editData.staffEmail || ''}
                                            onChange={(e) => setEditData({ ...editData, staffEmail: e.target.value })}
                                        >
                                            <option value="">Select a staff</option>
                                            {(staffList || []).map((staff) => (
                                                <option key={staff.email} value={staff.email}>
                                                    {staff.name ? `${staff.name} (${staff.email})` : staff.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Starting Date:</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                            value={editData.dateIn}
                                            onChange={(e) => setEditData({ ...editData, dateIn: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>Finishing Date:</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                            value={editData.dateOut}
                                            onChange={(e) => setEditData({ ...editData, dateOut: e.target.value })}
                                        />
                                    </div>
                                    <p>
                                        <strong>Duración:</strong>{' '}
                                        {moment(editData.dateOut).diff(moment(editData.dateIn), 'minutes')} minutos
                                    </p>
                                    <div className="flex justify-between mt-6">
                                        <button
                                            className="bg-red-400 hover:bg-red-500 text-slate-800 px-4 py-2 rounded flex"
                                            onClick={handleCancelService}
                                        >
                                            <p className='px-4'>Cancel Service</p><Ban />
                                        </button>
                                        <button
                                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded flex"
                                            onClick={handleUpdate}
                                        >
                                            <p className='px-4'>Update</p><Save />
                                        </button>

                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                    {modalShareOpen && (
                        <SendShareScheduleModal
                            isOpen={modalShareOpen}
                            onClose={() => setModalShareOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default Experiences;