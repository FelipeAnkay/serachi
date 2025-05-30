import { useState, useEffect } from "react"
import DateRangePicker from "../../components/DateRangePicker"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { formatDateShort, formatDateISO, formatYearMonth } from '../../components/formatDateDisplay'
import { useServiceServices } from "../../store/serviceServices"
import { useIncomeServices } from "../../store/incomeServices"
import { useExpenseServices } from "../../store/expenseServices"
import Cookies from 'js-cookie';

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"]

const Reports = () => {
    const [dateRange, setDateRange] = useState({ start: null, end: null })
    const [incomeData, setIncomeData] = useState([])
    const [serviceData, setServiceData] = useState([])
    const [expenseData, setExpenseData] = useState([])
    const { getExpenseByDates } = useExpenseServices()
    const { getServicesByDate } = useServiceServices();
    const { getIncomeByDates } = useIncomeServices();
    const storeId = Cookies.get('storeId');

    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            fetchData()
        }
    }, [dateRange])

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
                <div className="bg-gray-800 text-white rounded-lg p-3 shadow-lg text-sm">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="flex items-center space-x-2">
                            <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span>{entry.name}:</span>
                            <span className="font-bold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="p-6 space-y-6 text-white">
            <h1 className="text-3xl font-bold">Reports</h1>
            <DateRangePicker value={dateRange} onChange={setDateRange} />

            <AnimatePresence>
                {incomeData.length > 0 && (
                    <motion.div
                        key="income"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-blue-800 p-4 rounded-2xl shadow-md text-white"
                    >
                        <h2 className="text-xl font-semibold mb-2">Monthly Incomes vs Expenses</h2>
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

                {serviceData.length > 0 && (
                    <motion.div
                        key="services"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-blue-800 p-4 rounded-2xl shadow-md"
                    >
                        <h2 className="text-xl font-semibold mb-2">Services by Staff</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={serviceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
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
            </AnimatePresence>
        </div>
    )
}

export default Reports