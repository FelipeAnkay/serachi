import { useState, useEffect } from "react"
import DateRangePicker from "../../components/DateRangePicker"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { formatDateShort } from '../../components/formatDateDisplay'
import { useIncomeServices } from "../../store/incomeServices"
import { useExpenseServices } from "../../store/expenseServices"
import Cookies from 'js-cookie';
import toast from "react-hot-toast"
import { useSupplierServices } from "../../store/supplierServices"
import { useStaffServices } from "../../store/staffServices"
import { ChartPie, Copy } from "lucide-react"
import PieChartComponent from "../../components/PieChartComponent"
import { useCustomerServices } from "../../store/customerServices"

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"]

const CashflowReports = () => {
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [incomeData, setIncomeData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const { getExpenseByDates } = useExpenseServices();
    const { getSupplierList } = useSupplierServices();
    const [supplierList, setSupplierList] = useState([]);
    const { getStaffList } = useStaffServices();
    const [staffList, setStaffList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const { getCustomerList } = useCustomerServices();
    const { getIncomeByDates } = useIncomeServices();
    const storeId = Cookies.get('storeId');
    const [incomeTerm, setIncomeTerm] = useState('');
    const [expenseTerm, setExpenseTerm] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [dataChart, setDataChart] = useState([]);
    const [valueChart, setValueChart] = useState('');
    const [datakeyChart, setDataKeyChart] = useState('');
    const [titleChart, setTitleChart] = useState('');

    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            fetchData();
        }
    }, [dateRange])


    const fetchData = async () => {
        //console.log("El dateRange es: ", dateRange)
        const [incomes, expenses] = await Promise.all([
            getIncomeByDates(dateRange.start, dateRange.end, storeId),
            getExpenseByDates(dateRange.start, dateRange.end, storeId)
        ])
        //console.log("Incomes: ", incomes)
        const auxCustomer = await getCustomerList(storeId);
        const auxSupp = await getSupplierList(storeId);
        const auxStaff = await getStaffList(storeId);
        //console.log("auxSupp, auxStaff, auxCustomer", {auxSupp,auxStaff,auxCustomer})
        setCustomerList(auxCustomer.customerList)
        setSupplierList(auxSupp.supplierList);
        setStaffList(auxStaff.staffList);
        //console.log("incomes: ", incomes);
        //console.log("expenses: ", expenses);
        //console.log("combinedArray: ", combinedArray)
        setIncomeData(incomes.incomeList);
        setExpenseData(expenses.expenseList);
    }

    const copyTableToClipboard = (name) => {
        const table = document.querySelector(`#${name}-table`);
        if (!table) return;

        let text = "";
        for (const row of table.rows) {
            const cells = [...row.cells].map(cell => cell.innerText.trim());
            text += cells.join("\t") + "\n";
        }

        navigator.clipboard.writeText(text).then(() => {
            toast.success("Table copied to clipboard!");
        }).catch(err => {
            toast.error("Failed to copy");
        });
    };

    const openModalPieChart = (data, value, dataKey, title) => {
        setDataChart(data);
        setValueChart(value);
        setDataKeyChart(dataKey)
        setTitleChart(title)
        setOpenModal(true);
    };

    const filteredIncomes = incomeData
        .map((income) => {
            const customer = customerList.find(s => s.email === income.customerEmail);
            const responsible = [
                customer?.name?.trim(),
                customer?.lastName?.trim()
            ].filter(Boolean).join(" ");
            return {
                ...income,
                responsibleName: responsible,
            };
        })
        .filter((income) => {
            if (!incomeTerm) return true;
            const term = incomeTerm.toLowerCase();
            return (
                income.responsibleName.toLowerCase().includes(term) ||
                income.customerEmail.toLowerCase().includes(term)
            );
        });

    const totalIncomeAmount = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
    const avgIncomeAmount = filteredIncomes.length > 0 ? totalIncomeAmount / filteredIncomes.length : 0;

    const filteredExpenses = expenseData
        .map((expense) => {
            const supplier = supplierList.find(s => s._id === expense.supplierId);
            const staff = staffList.find(s => s.email === expense.staffEmail);

            const responsible = supplier?.name || staff?.name || "Unknown";

            return {
                ...expense,
                responsibleName: responsible,
                descriptionLower: expense.description?.toLowerCase() || "",
                typeLower: expense.type?.toLowerCase() || "",
            };
        })
        .filter((expense) => {
            if (!expenseTerm) return true;
            const term = expenseTerm.toLowerCase();
            return (
                expense.responsibleName.toLowerCase().includes(term) ||
                expense.descriptionLower.toLowerCase().includes(term) ||
                expense.typeLower.toLowerCase().includes(term)
            );
        });

    const totalExpensesFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avgExpensesFiltered = filteredExpenses.length > 0 ? totalExpensesFiltered / filteredExpenses.length : 0;

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h1 className="text-3xl font-bold mb-6 text-center">Income & Expense List</h1>
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
                                <h2 className="text-xl font-semibold mb-2">
                                    Income List - Qty: {filteredIncomes.length} | Total: <span className="text-[#0d6c77]">${totalIncomeAmount.toFixed(2)}</span> | Avg: <span className="text-cyan-500">${avgIncomeAmount.toFixed(2)}</span>
                                </h2>

                                {incomeData?.length > 0 && (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Search by email..."
                                            value={incomeTerm}
                                            onChange={(e) => setIncomeTerm(e.target.value)}
                                            className="w-full max-w-md px-4 py-2 rounded bg-white text-slate-900 border border-slate-300  focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <div className="mt-2">
                                            <table id="incomes-table" className="w-full text-left border-collapse bg-white rounded text-slate-900">
                                                <thead>
                                                    <tr className="text-center">
                                                        <th>Date</th>
                                                        <th>Customer Email</th>
                                                        <th>Customer Name</th>
                                                        <th>Amount</th>
                                                        <th>Payment Method</th>
                                                    </tr>
                                                </thead>
                                                {filteredIncomes.map((income, i) => (
                                                    <tbody key={i}>
                                                        <tr className="text-center">
                                                            <td>{formatDateShort(income.date)}</td>
                                                            <td>{income.customerEmail}</td>
                                                            <td>{income.responsibleName}</td>
                                                            <td>{income.amount}</td>
                                                            <td>{income.paymentMethod}</td>
                                                        </tr>
                                                    </tbody>
                                                ))}
                                            </table>
                                            <div className="flex flex-row">
                                                <button
                                                    onClick={() => copyTableToClipboard("incomes")}
                                                    className="mt-4 px-4 py-2 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 w-full flex flex-row items-center justify-center"
                                                >
                                                    Copy Table
                                                    <Copy className="ml-2"></Copy>
                                                </button>
                                                <button
                                                    onClick={() => openModalPieChart(filteredIncomes, "amount", "paymentMethod", "Income Amount by Payment Method")}
                                                    className=" ml-2 mt-4 px-4 py-2 bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 w-full flex flex-row items-center justify-center"
                                                >
                                                    View Pie Chart
                                                    <ChartPie className="ml-2" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col mt-5 w-full">
                    {expenseData?.length > 0 && (
                        <motion.div
                            key="income"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-sky-50 p-4 rounded-2xl shadow-md text-slate-800"
                        >
                            <h2 className="text-xl font-semibold mb-2">
                                Expense List - Qty: {filteredExpenses.length} | Total: <span className="text-[#0d6c77]">${totalExpensesFiltered.toFixed(2)}</span> | Avg: <span className="text-cyan-500">${avgExpensesFiltered.toFixed(2)}</span>
                            </h2>

                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="Search by name, description or type..."
                                    value={expenseTerm}
                                    onChange={(e) => setExpenseTerm(e.target.value)}
                                    className="w-full max-w-md px-4 py-2 rounded bg-white text-slate-900 border border-slate-300  focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <div className="mt-5">
                                    <table id="expenses-table" className="w-full text-left border-collapse bg-white rounded text-slate-900">
                                        <thead>
                                            <tr className="text-center">
                                                <th>Date</th>
                                                <th>Description</th>
                                                <th>Supplier or Staff</th>
                                                <th>Amount</th>
                                                <th>Payment Method</th>
                                                <th>Type</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredExpenses.map((expense, i) => (
                                                <tr key={i} className="text-center">
                                                    <td>{formatDateShort(expense.date)}</td>
                                                    <td>{expense.description}</td>
                                                    <td>{expense.responsibleName}</td>
                                                    <td>{expense.amount}</td>
                                                    <td>{expense.paymentMethod}</td>
                                                    <td>{expense.type}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="flex flex-row">
                                        <button
                                            onClick={() => copyTableToClipboard("expenses")}
                                            className="mt-4 px-4 py-2 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 w-full flex flex-row items-center justify-center"
                                        >
                                            Copy Table
                                            <Copy className="ml-2"></Copy>
                                        </button>
                                        <button
                                            onClick={() => openModalPieChart(filteredExpenses, "amount", "responsibleName", "Expense Amount by Supplier")}
                                            className=" ml-2 mt-4 px-4 py-2 bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 w-full flex flex-row items-center justify-center"
                                        >
                                            View Pie Chart
                                            <ChartPie className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {openModal && (
                        <PieChartComponent
                            isOpen={openModal}
                            onClose={() => setOpenModal(false)}
                            data={dataChart}
                            values={valueChart}
                            datakey={datakeyChart}
                            title={titleChart}
                        />
                    )}
                </div>
            </motion.div >
        </div >
    )
}

export default CashflowReports