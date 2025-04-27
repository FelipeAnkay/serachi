import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExperienceServices } from '../store/experienceServices';
import Cookies from 'js-cookie';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CircleX, Save, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

const localizer = momentLocalizer(moment);

const Experiences = () => {
    const { getExperienceList, getServiceById, updateService } = useExperienceServices();
    const storeId = Cookies.get("storeId");
    const [experiences, setExperiences] = useState([""]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [events, setEvents] = useState([]);
    const [view, setView] = useState(Views.MONTH);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedService, setSelectedService] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const response = await getExperienceList(storeId);
                const data = response.experienceList;
                setExperiences(data);

                const allServiceEvents = [];

                for (const exp of data) {
                    for (const serviceRef of exp.serviceList || []) {
                        const serviceDetail = await getServiceById(serviceRef);
                        if (serviceDetail && serviceDetail.service.isActive) {
                            console.log("El detalle del servicio es:", serviceDetail.service)
                            allServiceEvents.push({
                                title: `${serviceDetail.service.name} - ${serviceDetail.service.staffEmail}`,
                                start: new Date(serviceDetail.service.dateIn),
                                end: new Date(serviceDetail.service.dateOut),
                                allDay: false,
                                resource: serviceDetail.service
                            });
                        }
                    }
                }

                setEvents(allServiceEvents);
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

        try {
            await updateService(selectedService._id, {
                staffEmail: editData.staffEmail,
                dateIn: new Date(editData.dateIn),
                dateOut: new Date(editData.dateOut),
            });

            toast.success('Service Updated');
            closeModal();
            window.location.reload(); // Para actualizar el calendario después de editar
        } catch (error) {
            console.error('Error actualizando servicio:', error);
            toast.error('Error - Service was not updated');
        }
    };

    const handleCancelService = async () => {
        if (!selectedService) return;

        if (!confirm('Are you sure that you want to cancel this service?')) return;

        try {
            await updateService(selectedService._id, { isActive: false });
            toast.success('Service Canceled');
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error cancelando servicio:', error);
            toast.error('Error - Canceling the service');
        }
    };

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
                            selectable
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleSelectEvent}
                            defaultView={Views.MONTH}
                            view={view}
                            onView={setView}
                            date={selectedDate}
                            onNavigate={setSelectedDate}
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>
                </div>
            </motion.div>
            <AnimatePresence>
                {modalOpen && selectedService && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                onClick={closeModal}
                            >
                                <CircleX />
                            </button>
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text text-center">
                                {selectedService.name}
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p><strong>Customer Email:</strong> {selectedService.customerEmail || 'No asignado'}</p>
                                </div>
                                <div>
                                    <label>Assigned Staff:</label>
                                    <input
                                        type="email"
                                        className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                        value={editData.staffEmail}
                                        onChange={(e) => setEditData({ ...editData, staffEmail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Starting Date:</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                        value={editData.dateIn}
                                        onChange={(e) => setEditData({ ...editData, dateIn: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Finishing Date:</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                        value={editData.dateOut}
                                        onChange={(e) => setEditData({ ...editData, dateOut: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-between mt-6">
                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex"
                                        onClick={handleUpdate}
                                    >
                                        <p className='px-4'>Save</p><Save/>
                                    </button>
                                    <button
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex"
                                        onClick={handleCancelService}
                                    >
                                        <p className='px-4'>Cancel Service</p><Ban/>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
export default Experiences