import { useState, useEffect } from "react"
import DateRangePicker from "../../components/DateRangePicker"
import { motion, AnimatePresence } from "framer-motion"
import { formatDateShort, formatDateISO, formatYearMonth } from '../../components/formatDateDisplay'
import { useIncomeServices } from "../../store/incomeServices"
import { useExpenseServices } from "../../store/expenseServices"
import Cookies from 'js-cookie';
import { useStoreServices } from "../../store/storeServices"


const MonthlyCashFlow = () => {
    const [dateRange, setDateRange] = useState({ start: null, end: null })
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [storeData, setStoreData] = useState([])
    const [monthlyData, setMonthlyData] = useState([])
    const { getExpenseByDates } = useExpenseServices()
    const { getIncomeByDates } = useIncomeServices();
    const { getStoreById } = useStoreServices();
    const storeId = Cookies.get('storeId');

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const formatMonth = (month) => {
        const [year, m] = month.split("-");
        return new Date(year, m - 1).toLocaleString("default", { month: "short" });
    };

    const getYears = () => {
        const years = [];
        for (let y = 2000; y <= currentYear; y++) {
            years.push(y);
        }
        return years;
    };

    const fetchData = async () => {
        //console.log("El dateRange es: ", dateRange)
        const start = `${selectedYear}-01-01`;
        const end = `${selectedYear}-12-31`;
        const [incomes, expenses] = await Promise.all([
            getIncomeByDates(start, end, storeId),
            getExpenseByDates(start, end, storeId)
        ])
        const auxStore = await getStoreById(storeId);
        console.log("auxStore: ", auxStore);
        const openingBalanceEntry = auxStore.store?.openningBalance?.find(
            entry => parseInt(entry.year) === selectedYear
        );
        const openingBalance = openingBalanceEntry?.amount || 0;

        setStoreData(auxStore.storeList)
        console.log("incomes: ", incomes);
        console.log("expenses: ", expenses);
        const data = processMonthlyData(incomes.incomeList, expenses.expenseList, openingBalance);
        console.log("processMonthlyData: ", data);
        setMonthlyData(data);
    }

    const processMonthlyData = (incomes, expenses, openingBalance = 0) => {
        const data = {};
        const monthList = new Set();
        const expenseTypeSet = new Set();

        const getMonthKey = (dateStr) => {
            const date = new Date(dateStr);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        };

        // Procesar ingresos
        for (const income of incomes) {
            const month = getMonthKey(income.date);
            monthList.add(month);
            if (!data[month]) {
                data[month] = { incomes: 0, expenses: {}, totalExpenses: 0, balance: 0, movement: 0, opening: 0 };
            }
            data[month].incomes += income.amount;
        }

        // Procesar egresos
        for (const expense of expenses) {
            const month = getMonthKey(expense.date);
            monthList.add(month);
            const type = expense.type || 'Other';
            expenseTypeSet.add(type);
            if (!data[month]) {
                data[month] = { incomes: 0, expenses: {}, totalExpenses: 0, balance: 0, movement: 0, opening: 0 };
            }
            if (!data[month].expenses[type]) {
                data[month].expenses[type] = 0;
            }
            data[month].expenses[type] += expense.amount;
            data[month].totalExpenses += expense.amount;
        }

        // Ordenar meses cronológicamente
        const sortedMonths = [...monthList].sort();

        // Calcular apertura, movimientos y saldos
        let runningBalance = openingBalance;
        for (let i = 0; i < sortedMonths.length; i++) {
            const month = sortedMonths[i];
            const monthData = data[month];

            monthData.opening = runningBalance;
            monthData.movement = monthData.incomes - monthData.totalExpenses;
            monthData.balance = runningBalance + monthData.movement;
            runningBalance = monthData.balance;
        }

        return {
            months: sortedMonths,
            data,
            allExpenseTypes: [...expenseTypeSet].sort(),
        };
    };

    return (
        <div className="p-6 space-y-6 text-white">
            <h1 className="text-3xl font-bold">Reports</h1>
            <div className="flex items-center gap-4">
                <label htmlFor="year" className="font-medium">Select year:</label>
                <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-gray-800 text-white p-2 rounded"
                >
                    {getYears().map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            <AnimatePresence>
                <table className="min-w-[600px] w-full text-sm text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr>
                            <th className="font-semibold text-2xl">Cash flow {selectedYear}</th>
                            {monthlyData.months?.map(month => (
                                <th key={month} className="font-semibold text-center">
                                    {formatYearMonth(month)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {monthlyData && monthlyData.months && monthlyData.data ? (
                        <tbody>
                            {/* Ingresos */}
                            <tr>
                                <td className="font-medium text-lg text-green-600">Total Incomes</td>
                                {monthlyData.months?.map(month => (
                                    <td key={month} className="text-center text-green-600 font-semibold  text-lg">
                                        ${monthlyData.data[month]?.incomes?.toFixed(2) || "0.00"}
                                    </td>
                                ))}
                            </tr>
                            {/* Egresos por tipo */}
                            {monthlyData.allExpenseTypes?.map(type => (
                                <tr key={type}>
                                    <td className="text-red-600">{type}</td>
                                    {monthlyData.months.map(month => (
                                        <td key={month} className="text-center text-red-600">
                                            ${monthlyData.data[month]?.expenses?.[type]?.toFixed(2) || "0.00"}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Total egresos */}
                            <tr className="font-medium text-lg text-red-700 border-t border-gray-300">
                                <td>Total Expenses</td>
                                {monthlyData.months.map(month => (
                                    <td key={month} className="text-center">
                                        ${monthlyData.data[month]?.totalExpenses?.toFixed(2) || "0.00"}
                                    </td>
                                ))}
                            </tr>
                            {/* Opening del mes */}
                            <tr>
                                <td className="font-semibold">Opening</td>
                                {monthlyData.months.map(month => (
                                    <td key={month} className="text-center">
                                        ${monthlyData.data[month]?.opening?.toFixed(2) || "0.00"}
                                    </td>
                                ))}
                            </tr>

                            {/* Movimiento mensual */}
                            <tr className="font-medium text-blue-600 border-t border-gray-300">
                                <td>Movement</td>
                                {monthlyData.months.map(month => (
                                    <td key={month} className="text-center">
                                        ${monthlyData.data[month]?.movement?.toFixed(2) || "0.00"}
                                    </td>
                                ))}
                            </tr>

                            {/* Balance acumulado */}
                            <tr className="font-bold text-black border-t border-gray-400">
                                <td>Balance</td>
                                {monthlyData.months.map(month => (
                                    <td key={month} className="text-center">
                                        ${monthlyData.data[month]?.balance?.toFixed(2) || "0.00"}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            <tr>
                                <td colSpan={12} className="text-center py-4 text-gray-500">
                                    No monthly data...
                                </td>
                            </tr>
                        </tbody>
                    )}
                </table>

            </AnimatePresence>
        </div>
    )
}

export default MonthlyCashFlow