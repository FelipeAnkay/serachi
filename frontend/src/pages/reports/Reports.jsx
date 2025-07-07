import { useState, useEffect } from "react"
import DateRangePicker from "../../components/DateRangePicker"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { formatDateShort, formatDateISO, formatYearMonth } from '../../components/formatDateDisplay'
import { useServiceServices } from "../../store/serviceServices"
import { useIncomeServices } from "../../store/incomeServices"
import { useExpenseServices } from "../../store/expenseServices"
import Cookies from 'js-cookie';
import toast from "react-hot-toast"

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"]

const Reports = () => {
    const [dateRange, setDateRange] = useState({ start: null, end: null })
    const [incomeData, setIncomeData] = useState([])
    const [serviceData, setServiceData] = useState([])
    const [rawServices, setRawServices] = useState([])
    const [auxCustomerServices, setAuxCustomerServices] = useState([])
    const [auxBackServices, setAuxBackServices] = useState([])
    const [customerServiceData, setCustomerServiceData] = useState([])
    const [backServiceData, setBackServiceData] = useState([])
    const [expenseData, setExpenseData] = useState([])
    const { getExpenseByDates } = useExpenseServices()
    const { getServicesByDate } = useServiceServices();
    const { getIncomeByDates } = useIncomeServices();
    const storeId = Cookies.get('storeId');

    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            setAuxCustomerServices([]);
            setAuxBackServices([]);
            setCustomerServiceData([]);
            setBackServiceData([]);
            fetchData();
        }
    }, [dateRange])

    useEffect(() => {
        try {
            if (rawServices?.length > 0) {
                //console.log("rawServices: ", rawServices)
                setAuxCustomerServices(rawServices.filter(service => service.type === "Customer"));
                setAuxBackServices(rawServices.filter(service => service.type === "Back"));
            }
        } catch (error) {
            toast.error("No data found")
        }

    }, [rawServices])
    useEffect(() => {
        if (auxCustomerServices.length > 0) {
            setCustomerServiceData(groupByStaff(auxCustomerServices))
        }
    }, [auxCustomerServices])
    useEffect(() => {
        if (auxBackServices.length > 0) {
            setBackServiceData(groupByStaff(auxBackServices))
        }
    }, [auxBackServices])

    const fetchData = async () => {
        //console.log("El dateRange es: ", dateRange)
        const [incomes, services, expenses] = await Promise.all([
            getIncomeByDates(dateRange.start, dateRange.end, storeId),
            getServicesByDate(dateRange.start, dateRange.end, storeId),
            getExpenseByDates(dateRange.start, dateRange.end, storeId)
        ])
        //console.log("incomes: ", incomes);
        //console.log("expenses: ", expenses);
        //console.log("services: ", services);
        const combinedData = combineIncomeExpenseByMonth(incomes.incomeList, expenses.expenseList);
        const combinedArray = Object.values(combinedData);
        //console.log("combinedArray: ", combinedArray)
        setRawServices(services.serviceList);
        setIncomeData(combinedArray);
        setServiceData(groupByStaff(services.serviceList));
    }

    const combineIncomeExpenseByMonth = (incomes, expenses) => {
        const combined = {};

        // Si incomes no es un array válido, asignar array vacío
        (Array.isArray(incomes) ? incomes : []).forEach(i => {
            const month = formatYearMonth(i.date);
            combined[month] = combined[month] || { month, income: 0, expense: 0 };
            combined[month].income += i.amount;
        });

        // Lo mismo para expenses
        (Array.isArray(expenses) ? expenses : []).forEach(e => {
            const month = formatYearMonth(e.date);
            combined[month] = combined[month] || { month, income: 0, expense: 0 };
            combined[month].expense += e.amount;
        });

        return combined;
    };

    const groupByStaff = (services) => {
        if (!services || services.length === 0) return [];

        const grouped = {};
        services.forEach((s) => {
            grouped[s.staffEmail] = (grouped[s.staffEmail] || 0) + 1;
        });
        return Object.entries(grouped).map(([staff, count]) => ({ name: staff, value: count }));
    }
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-sky-50 text-slate-800 rounded-lg p-3 shadow-lg text-sm">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="flex items-center space-x-2">
                            <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span>{entry.name}:</span>
                            <span className="font-bold">{entry.value.toFixed(2)}</span>
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h1 className="text-3xl font-bold mb-6 text-center">Ops Reports</h1>
                <DateRangePicker value={dateRange} onChange={setDateRange} />

                <div className="flex flex-col mt-5 w-full">
                    <div className="w-full">
                        {incomeData.length > 0 && (
                            <motion.div
                                key="income"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-sky-50 p-4 rounded-2xl shadow-md text-slate-800"
                            >
                                <h2 className="text-xl font-semibold mb-2">Incomes vs Expenses</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={incomeData}>
                                        <XAxis
                                            dataKey="month"
                                            stroke="#FFFFFF"               // axis line color
                                            tick={{ fill: "#FFFFFF" }}    // tick label color
                                        />
                                        <YAxis
                                            stroke="#FFFFFF"
                                            tick={{ fill: "#FFFFFF" }}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip />}
                                        />
                                        <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                                        <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        )}
                    </div>
                    <div className="ml-5 w-full mt-5">
                        <div >
                            {serviceData.length > 0 && (
                                <motion.div
                                    key="services"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-sky-50 p-4 rounded-2xl shadow-md min-w-[400px] max-w-xl mx-auto"
                                >
                                    <h2 className="text-xl font-semibold mb-2">Services by Staff [ {auxBackServices.length + auxCustomerServices.length} ]</h2>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={serviceData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={130}
                                                labelRadius={150}
                                                label={({ name, percent }) => {
                                                    const displayName = name.split('@')[0];
                                                    return `${displayName} ${(percent * 100).toFixed(0)}%`;
                                                }}
                                                dataKey="value"
                                            >
                                                {serviceData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </div>
                    </div>
                    <div className="mt-5 flex flex-row justify-center w-full">
                        <div>
                            {customerServiceData?.length > 0 && (
                                <motion.div
                                    key="services"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-sky-50 p-4 rounded-2xl shadow-md min-w-[400px] max-w-xl mx-auto"
                                >
                                    <h2 className="text-xl font-semibold mb-2">Services to Customer [ {auxCustomerServices.length || 0} ]</h2>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={customerServiceData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={130}
                                                labelRadius={150}
                                                label={({ name, percent }) => {
                                                    const displayName = name.split('@')[0];
                                                    return `${displayName} ${(percent * 100).toFixed(0)}%`;
                                                }}
                                                dataKey="value"
                                            >
                                                {customerServiceData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </div>
                        <div className="ml-5">
                            {backServiceData?.length > 0 && (
                                <motion.div
                                    key="services"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-sky-50 p-4 rounded-2xl shadow-md min-w-[400px] max-w-xl mx-auto"
                                >
                                    <h2 className="text-xl font-semibold mb-2">Back Office Services [ {auxBackServices.length || 0} ]</h2>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={backServiceData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={130}
                                                labelRadius={150}
                                                label={({ name, percent }) => {
                                                    const displayName = name.split('@')[0];
                                                    return `${displayName} ${(percent * 100).toFixed(0)}%`;
                                                }}
                                                dataKey="value"
                                            >
                                                {backServiceData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    )
}

export default Reports