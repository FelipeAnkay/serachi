import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import toast from 'react-hot-toast';
import { useStaffServices } from '../../store/staffServices';
import { useServiceServices } from '../../store/serviceServices';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useFormServices } from '../../store/formServices';

const localizer = momentLocalizer(moment);

const ViewExperiences = () => {
    const { getServicesByDate } = useServiceServices();
    const { getDataToken } = useFormServices();
    const [searchParams] = useSearchParams();
    const { getStaffEmail, getStaffList } = useStaffServices();
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(Views.AGENDA);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loadedRange, setLoadedRange] = useState({ start: null, end: null });

    const [formData, setFormData] = useState({
        storeId: '',
        endDate: '',
    })

    useEffect(() => {
        //console.log("Entre a ViewExperiences ")
        const token = searchParams.get('token');
        //console.log("Entre a ViewExperiences TOKEN: ", token)
        if (!token) {
            window.location.href = '/unauthorized';
            return;
        }

        const fetchTokenData = async () => {
            setLoading(true)
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await getDataToken(token);
                const { customerEmail, endDate, storeId } = res.urlData;
                //console.log("storeId es: ", storeId)
                //console.log("endDate es: ", endDate)
                //console.log("today es: ", today)
                if (!customerEmail || !storeId || !(endDate >= today)) {
                    window.location.href = '/unauthorized';
                }
                setFormData(prev => ({
                    ...prev,
                    endDate: endDate,
                    storeId: storeId
                }));

            } catch (error) {
                console.error('Error getting token data:', error);
                window.location.href = '/unauthorized';
            } finally {
                setLoading(false)
            }
        };
        fetchTokenData();
    }, [searchParams]);

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), -7);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, +7);
        if (formData.storeId) {
            fetchExperiences(firstDay, lastDay);
        }
    }, [formData]);

    const fetchExperiences = async (startDate, endDate) => {
        setLoading(true);
        //console.log("formData: ", formData)
        const allServiceEvents = [];
        const staffColorMap = {};
        const typesSet = new Set();

        const getColorForStaff = async (email) => {
            //console.log("Entre a getColorForStaff ", email);
            //console.log("El staffColorMap es: ", staffColorMap);
            if (!email) return "gray-500";
            if (staffColorMap[email]) return staffColorMap[email];

            try {
                const res = await getStaffEmail(email, formData.storeId);
                //console.log("El res es: ", res)
                const staff = res?.staffList;
                //console.log("El staff es: ", staff)
                const color = staff?.color || "gray-500";
                //console.log("El color es: ", color)
                staffColorMap[email] = color;
                return color;
            } catch {
                return "gray-500";
            }
        };
        try {
            const serviceDetail = await getServicesByDate(startDate, endDate, formData.storeId);
            //console.log("La respuesta de getServiceById ", serviceDetail);
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
                            start: new Date(serviceRef.dateIn),
                            end: new Date(serviceRef.dateOut),
                            allDay: false,
                            resource: serviceRef,
                            staffColor: color,
                            type: serviceRef.type,
                        });
                    }
                }
            }
            setAllEvents(allServiceEvents);
            setEvents(allServiceEvents);
            setLoadedRange({ start: startDate, end: endDate });
        } catch (error) {
            toast.error("Theres no services for this month")
            console.log("El error es: ", error)
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSlot = ({ start }) => {
        setSelectedDate(start);
        setView(Views.DAY);
    };


    const handleNavigate = (newDate) => {

        //console.log("Entre a handleNavigate: ", newDate)
        setSelectedDate(newDate);

        const newMonthStart = new Date(newDate.getFullYear(), newDate.getMonth(), -7);
        const newMonthEnd = new Date(newDate.getFullYear(), newDate.getMonth() + 1, +7);

        const isSameMonth =
            loadedRange.start &&
            loadedRange.end &&
            loadedRange.start.getFullYear() === newMonthStart.getFullYear() &&
            loadedRange.start.getMonth() === newMonthStart.getMonth();

        //console.log("isSameMonth: ", isSameMonth)
        if (!isSameMonth) {
            //console.log("newMonthStart: ", newMonthStart)
            //console.log("newMonthEnd: ", newMonthEnd)
            fetchExperiences(newMonthStart, newMonthEnd);
        } else {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), -7);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, +7);
            console.log("Fechas: ", firstDay, " TO ", lastDay)
            fetchExperiences(firstDay, lastDay);
        }
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
                    <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text'>
                        Experiences Calendar
                    </h2>
                    <div className="flex-grow p-4 overflow-hidden w-full">
                        <div className="h-full w-full bg-white text-black rounded-xl shadow-xl">
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                selectable
                                onSelectSlot={handleSelectSlot}
                                onNavigate={handleNavigate}
                                defaultView={Views.AGENDA}
                                view={view}
                                onView={setView}
                                date={selectedDate}
                                style={{ height: '100%', width: '100%' }}
                                eventPropGetter={(event) => {
                                    const color = event.staffColor || "#6b7280"; // valor por defecto (gray-500)
                                    return {
                                        style: {
                                            backgroundColor: color,
                                            color: "white",
                                            borderRadius: "0.375rem", // equivalente a rounded-md
                                            paddingLeft: "0.5rem",    // equivalente a px-2
                                            paddingRight: "0.5rem",
                                        },
                                    };
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default ViewExperiences;