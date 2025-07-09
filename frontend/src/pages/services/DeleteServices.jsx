import { useServiceServices } from '../../store/serviceServices';
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { formatDateTimeDisplayHours } from '../../components/formatDateDisplay';
import DateRangePicker from "../../components/DateRangePicker"
import { Search, Trash2 } from 'lucide-react';
import { useExperienceServices } from '../../store/experienceServices';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DeleteServices() {

    const { createService, getServicesByNameDate, removeServicesById } = useServiceServices();
    const { removeServicesFromExperience } = useExperienceServices();
    const [loading, setLoading] = useState(false);
    const storeId = Cookies.get('storeId');
    const [selectAll, setSelectAll] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        serviceList: [],
        deleteServiceList: [],
        dateStart: "",
        dateEnd: "",
        storeId: storeId
    });

    useEffect(() => {
        setSelectAll(
            formData.serviceList.length > 0 &&
            formData.deleteServiceList.length === formData.serviceList.length
        );
        //console.log("Listado de servicios a eliminar: ", formData.deleteServiceList);
    }, [formData.serviceList, formData.deleteServiceList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateRangeChange = ({ start, end }) => {
        setFormData(prev => ({
            ...prev,
            dateStart: start,
            dateEnd: end
        }));
    }

    const handleSearchServices = async (e) => {
        setLoading(true)
        try {
            const auxServices = await getServicesByNameDate(formData.name, formData.dateStart, formData.dateEnd, storeId);
            //console.log("getServicesByNameDate: ", auxServices);
            setTimeout(() => {
                setFormData(prev => ({
                    ...prev,
                    serviceList: auxServices.serviceList,
                }));
                setLoading(false);
            }, 0);
        } catch (error) {
            setLoading(false)
            toast.error("Error finding Services")
        }

    }

    const handleSubmit = async (e) => {
        try {
            setLoading(true)
            //console.log("removeServicesFromExperience: ", formData.deleteServiceList)
            const numberExp = await removeServicesFromExperience(formData.deleteServiceList)
            if (numberExp > 0) {
                toast.success(`${numberExp} Services deleted from experiences`)
            }

            for (const auxId of formData.deleteServiceList) {
                //console.log("auxId: ", auxId);
                await removeServicesById(auxId)
            }
            toast.success("Services deleted")
            setFormData({
                name: "",
                serviceList: [],
                deleteServiceList: [],
                dateStart: "",
                dateEnd: "",
                storeId: storeId
            })
            setLoading(false)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setLoading(false)
            toast.error("Error deleting services")
        }
    }

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
                    <h1 className="text-3xl font-bold mb-6 text-center text-[#00C49F]">Service Deletion</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg p-6 bg-sky-50 text-slate-800 w-full">
                        <div>
                            <label className="block font-medium mb-1">Name the staff or customer assigned to the service:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                className="w-full border rounded px-3 py-2 bg-white text-slate-900  border-slate-300"
                            />
                        </div>
                        {/* Date Filters */}
                        <div className="flex flex-col mb-6 justify-center items-center">
                            <label className="block font-medium mb-1">Date Range</label>
                            <DateRangePicker value={{ start: formData.dateStart, end: formData.dateEnd }} onChange={handleDateRangeChange} />
                        </div>
                        <div className='flex justify-center'>
                            <button type='button' className='bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 rounded border flex flex-row px-2 py-2' onClick={handleSearchServices}>
                                Search Services
                                <Search className='ml-2' />
                            </button>
                        </div>
                        {(formData.serviceList.length > 0) ? (
                            <fieldset className='border rounded-2xl'>
                                <legend className='ml-2 font-semibold text-lg'>Service List: </legend>

                                <label className="text-sm flex items-center gap-1 top-1 ml-2 mt-2">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setSelectAll(checked);
                                            setFormData(prev => ({
                                                ...prev,
                                                deleteServiceList: checked ? prev.serviceList.map(s => s._id) : []
                                            }));
                                        }}
                                    />
                                    Select All
                                </label>

                                {(formData.serviceList || []).map((service, index) => (
                                    <div className='flex flex-row items-center justify-center mr-2 mb-2 bg-cyan-100 rounded py-2 mt-2 ml-2'>
                                        <div className='ml-2 flex-1 text-left'>
                                            <label key={service._id} className='flex flex-row'>
                                                <div>
                                                    <input
                                                        type="checkbox"
                                                        value={service._id}
                                                        checked={(formData.deleteServiceList || []).includes(service._id)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setFormData(prev => {
                                                                const newDeleteList = checked
                                                                    ? [...prev.deleteServiceList, service._id]
                                                                    : prev.deleteServiceList.filter(id => id !== service._id);

                                                                // Actualiza también selectAll si es necesario
                                                                setSelectAll(newDeleteList.length === prev.serviceList.length);

                                                                return {
                                                                    ...prev,
                                                                    deleteServiceList: newDeleteList
                                                                };
                                                            });
                                                        }}
                                                        className="accent-blue-500 mr-2 "
                                                    />
                                                </div>
                                                <div>
                                                    {index + 1}.- {service.name} - {formatDateTimeDisplayHours(service.dateIn)} to {formatDateTimeDisplayHours(service.dateOut)}
                                                </div>
                                            </label>
                                        </div>

                                    </div>
                                ))}
                                {(formData.serviceList.length > 0) ? (
                                    <div className='flex justify-center items-center'>
                                        <button type='button' onClick={handleSubmit} className='bg-red-400 hover:bg-red-500 text-cyan-50 rounded px-2 py-2 border flex flex-row mb-2'>
                                            Delete Selected Services
                                            <Trash2 className='ml-2'></Trash2>
                                        </button>
                                    </div>
                                ) : (
                                    <div></div>
                                )}
                            </fieldset>
                        ) : ""}
                    </form>
                </motion.div>
            </div>
        </>
    )
}