import { AnimatePresence, motion } from 'framer-motion'
import { CircleX } from 'lucide-react'
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useFacilityServices } from '../store/facilityServices';
import { useFacilityReservationServices } from '../store/facilityReservationServices';
import { endOfDayUTC, formatDateShort, formatEndOfDayDateISO } from './formatDateDisplay';
import { differenceInCalendarDays } from 'date-fns';
import { useServiceServices } from '../store/serviceServices';


export default function AssignFacilityModal({ isOpen, onClose, service }) {
    if (!isOpen) return null

    const { getAvailableSpaces, createFacilityReservation } = useFacilityReservationServices();
    const { updateService } = useServiceServices();
    const { user } = useAuthStore();
    const [facilityList, setFacilityList] = useState([])
    const [selectedDates, setSelectedDates] = useState({})
    const serviceDays = differenceInCalendarDays(new Date(service.dateOut), new Date(service.dateIn)) + 1;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])


    const handleSelectFacility = async (facility) => {
        try {
            //console.log("Entre a handleSelectDate")
            //console.log("fetchToken: ", experience.customerEmail)

        } catch (error) {
            //console.log("Error fetching the token: ", error)
            toast.error("Error assigning facility")
        }
    }

    const handleCheckboxChange = (facilityId, date) => {
        setSelectedDates((prev) => {
            const prevDates = prev[facilityId] || [];
            const isSelected = prevDates.includes(date);

            const updatedDates = isSelected
                ? prevDates.filter(d => d !== date)
                : [...prevDates, date];

            return {
                ...prev,
                [facilityId]: updatedDates
            };
        });
    };

    const handleAssignFacility = async () => {
        try {
            // Paso 2: Calcular total de días seleccionados (de todos los facilities)
            const totalSelectedDays = Object.values(selectedDates).reduce((sum, dates) => sum + dates.length, 0);

            // Paso 3: Validar cantidad de días
            if (totalSelectedDays < serviceDays) {
                toast.error("You have to assign a facility for each day of service");
                return;
            }
            let facilityIdList = []
            for (const facilityId in selectedDates) {
                facilityIdList.push(facilityId);
                const dateList = selectedDates[facilityId];
                for (const date of dateList) {
                    const auxDateIn = date;
                    const auxDateOut = endOfDayUTC(date)
                    const payload = {
                        facilityId: facilityId,
                        serviceId: service._id,
                        customerEmail: service.customerEmail,
                        staffEmail: service.staffEmail,
                        storeId: service.storeId,
                        spaceReserved: 1,
                        userEmail: user.email,
                        dateIn: auxDateIn,
                        dateOut: auxDateOut, // si es por día, puedes usar la misma fecha para in/out
                    };
                    console.log("El payload es: ", payload);
                    await createFacilityReservation(payload);
                }
            }
            const servicePayload = {
                facilityId: facilityIdList
            };
            await updateService(service._id, servicePayload)
            toast.success("Facility assigned successfully!");
            onClose();
            window.location.reload();
        } catch (error) {
            console.error("Error assigning facility:", error);
            toast.error("Error assigning facility");
        }
    };

    const handleChange = (selected) => {
        console.log("Selected: ", selected)
        const facility = selected?.facility;
        if (facility) {
            console.log("Selected Facility: ", facility)
        }
    };


    useEffect(() => {
        const fetchFacility = async () => {
            try {
                //console.log("Service: ", service)
                //const auxFacility = await getFacilityByStore(service.storeId);
                const auxFacility = await getAvailableSpaces(service.dateIn, service.dateOut, 1, service.storeId)
                //console.log("getFacilityById: ", auxFacility);
                setFacilityList(auxFacility.availableFacility)
            } catch (error) {
                //console.log("Error fetching the forms: ", error)
                toast.error("Error fetching the facilities")
            }
        }

        if (service) {
            fetchFacility();
        }

    }, [service])

    const facilityOptions = facilityList.map(facility => ({
        value: facility._id,
        label: `${facility.name} - ${facility.availability}`,
        facility, // por si necesitas usar más info en el onChange
    }));

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-sky-50 rounded-2xl p-6 max-w-lg w-[90%] h-[90%] overflow-y-auto relative"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        type="button"
                        className="absolute top-3 right-3 text-gray-300 hover:text-slate-800"
                        onClick={onClose}
                    >
                        <CircleX />
                    </button>

                    <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Assign Facility</h2>
                    <div>
                        <p className='font-semibold'>Dates: <span>{formatDateShort(service.dateIn)}</span> to <span>{formatDateShort(service.dateOut)}</span></p>
                        <label>You need to assign {serviceDays} days</label>
                    </div>
                    {facilityList?.length > 0 && (
                        <div className='mt-2'>
                            <label className="block text-sm font-medium mb-1 text-slate-800">
                                Facilities with availability:
                            </label>
                            {facilityList.map((facility, i) => {
                                const dailyAvailability = facility.dailyAvailability || {};
                                return (
                                    <div key={facility._id} className="mb-4 border rounded-lg p-2 bg-sky-50">
                                        <h3 className="font-semibold text-slate-800 mb-2">{facility.name}</h3>
                                        <label>Available Days:</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {Object.entries(dailyAvailability).map(([date, count]) => (
                                                <div key={date} className="flex items-center gap-2 bg-white rounded p-2 border">
                                                    <input
                                                        type="checkbox"
                                                        id={`${facility._id}-${date}`}
                                                        className="accent-blue-500"
                                                        value={date}
                                                        disabled={count === 0}
                                                        onChange={() => handleCheckboxChange(facility._id, date)}
                                                    />
                                                    <label htmlFor={`${facility._id}-${date}`} className="text-sm text-slate-900">
                                                        {date} ({count})
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="space-y-4">
                        <button
                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4"
                            type="button"
                            onClick={handleAssignFacility}
                        >
                            Save
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}