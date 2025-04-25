import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperienceServices } from '../store/experienceServices';
import Cookies from 'js-cookie';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Experiences = () => {
    const { experienceList } = useExperienceServices();
    const storeId = Cookies.get("storeId");
    const [experiences, setExperiences] = useState([""]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        console.log("Entre a useEffect");
        const fetchExperiences = async () => {
            try {
                console.log("el StoreID es: ", storeId);
                const response = await experienceList(storeId);
                const data = response.experienceList;
                console.log("la respuesta de getExperience es:", response);
                setExperiences(data);

                const formattedEvents = data.flatMap(exp =>
                    exp.workFrame.map(entry => {
                        const productId = entry.find(i => i.productId)?.productId;
                        const date = entry.find(i => i.date)?.date;
                        const timeFrame = entry.find(i => i.timeFrame)?.timeFrame;

                        let startHour = timeFrame === 'AM' ? 9 : 14;
                        let endHour = timeFrame === 'AM' ? 12 : 17;

                        return {
                            title: `${exp.name} - ${productId || ''}`,
                            start: new Date(`${date}T${startHour}:00:00`),
                            end: new Date(`${date}T${endHour}:00:00`),
                            allDay: false,
                            resource: exp
                        };
                    })
                );
                setEvents(formattedEvents);
            } catch (err) {
                setError('Experiences not found');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchExperiences();
        }
    }, []);

    if (loading) return <div className="text-white text-center mt-10">Cargando...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="flex flex-col flex-1 h-screen w-full items-center justify-center bg-blue-950 text-white overflow-hidden" >
            {/* Contenido principal */}
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className='flex flex-col w-[90%] h-[90%] max-h-[90vh] bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800'
            >
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text'>
                    Experiences Calendar
                </h2>
                <div className="flex-grow p-4 overflow-hidden">
                    <div className="h-full w-full bg-white text-black rounded-xl shadow-xl">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
export default Experiences