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
import CustomAgendaCalendar from '../../components/CustomAgendaCalendar';

const localizer = momentLocalizer(moment);

const ViewExperiences = () => {
    const { getServicesForCalendar } = useServiceServices();
    const { getDataToken } = useFormServices();
    const [searchParams] = useSearchParams();
    const { getStaffList } = useStaffServices();
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(Views.AGENDA);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loadedRange, setLoadedRange] = useState({ start: null, end: null });
    const [staffList, setStaffList] = useState([]);
    let loadServices = true;

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
        if (formData.storeId) {
            fetchStaff();
            loadServices = false;
        }
    }, [formData]);

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay2 = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        if (staffList.length > 0) {
            setSelectedDate(firstDay); // ✅ ¡AQUÍ!
            fetchExperiences(firstDay, lastDay2);
        }
    }, [staffList]);

    const fetchStaff = async () => {

        try {
            setLoading(true);
            const staff = await getStaffList(formData.storeId);
            //console.log("getStaffList: ", staff)
            setStaffList(staff.staffList);
        } catch (error) {
            toast.error("Error Fetching Staff")
        } finally {
            setLoading(false)
        }

    }

    const fetchExperiences = async (startDate, endDate) => {
        const allServiceEvents = [];
        const typesSet = new Set();
        //console.log("Entre a fetchExperiences", { startDate, endDate })

        try {
            //setLoading(true);
            const auxStoreId = formData.storeId
            //console.log("La llamada de getServiceById ", { startDate, endDate, auxStoreId});
            const serviceDetail = await getServicesForCalendar(startDate, endDate, auxStoreId);
            //console.log("La respuesta de getServicesForCalendar ", serviceDetail);
            let lastDay = new Date();
            let lastService = {}
            const parseDate = (d) =>
                typeof d === "object" && d.$date?.$numberLong
                    ? new Date(Number(d.$date.$numberLong))
                    : new Date(d);
            if (serviceDetail.serviceList.length > 0) {
                //console.log("Service List", serviceDetail.serviceList)
                //console.log("Staff List", staffList)
                const auxServiceList = serviceDetail.serviceList
                    .map((serv) => {
                        const staff = staffList.find(s => s.email === serv.staffEmail);
                        const name = staff.name || "NO STAFF ASSIGNED"
                        const color = staff.color || "#EF9A9A"
                        return {
                            ...serv,
                            staffName: name,
                            staffColor: color
                        };
                    })
                //console.log("Listado de servicios: ", auxServiceList)
                for (const serviceRef of auxServiceList) {
                    //console.log("serviceRef: ", serviceRef)
                    if (serviceRef && serviceRef.isActive) {
                        const staffEmail = serviceRef.staffEmail;
                        const color = serviceRef.staffColor;
                        const staffName = serviceRef.staffName
                        if (lastDay < parseDate(serviceRef.dateOut)) {
                            lastDay = parseDate(serviceRef.dateOut)
                            lastService = serviceRef
                        }
                        //console.log("El color para la calendar es: ", {staffEmail, color})
                        const serviceType = serviceRef.type || "Unknown";
                        typesSet.add(serviceType);
                        allServiceEvents.push({
                            title: `${serviceRef.name}`,
                            start: parseDate(serviceRef.dateIn),
                            end: parseDate(serviceRef.dateOut),
                            allDay: false,
                            resource: serviceRef,
                            staffColor: color,
                            staffName: staffName,
                            staffEmail: staffEmail,
                            type: serviceRef.type,
                        });
                    }
                }
                //console.log("La ultima fecha y servicio es: ", { lastDay, lastService })
            }
            //console.log("allServiceEvents: ", allServiceEvents)
            setEvents(allServiceEvents);
            setLoadedRange({ start: startDate, end: endDate });
        } catch (error) {
            toast.error("Theres no services for this month")
            //console.log("El error es: ", error)
            setEvents([]);
        } finally {
            //setLoading(false);
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
            <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center"
                >
                    <h2 className='text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text'>
                        Service Schedule
                    </h2>
                    <div className="flex-grow p-4 overflow-hidden w-full">
                        <div className="h-full w-full bg-white text-black rounded-xl shadow-xl">
                            <CustomAgendaCalendar
                                events={events}
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                onMonthChange={(start, end) => fetchExperiences(start, end)}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default ViewExperiences;