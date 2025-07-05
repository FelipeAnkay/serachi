import { useState, useEffect } from "react"
import DateRangePicker from "../../components/DateRangePicker"
import { Legend, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { formatDateShort } from '../../components/formatDateDisplay'
import { useIncomeServices } from "../../store/incomeServices"
import Cookies from 'js-cookie';
import toast from "react-hot-toast"
import { useCustomerServices } from "../../store/customerServices"
import { useQuoteServices } from "../../store/quoteServices"
import { Copy } from "lucide-react"
import PieChartPayed from "../../components/PieChartPayed"

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"]

const QuoteDashboard = () => {
    const { getIncomeByDates } = useIncomeServices();
    const [incomeData, setIncomeData] = useState([]);
    const { getQuoteByCheckout, getOpenQuoteList } = useQuoteServices();
    const [quoteData, setQuoteData] = useState([]);
    const { getCustomerList } = useCustomerServices();
    const [customerList, setCustomerList] = useState([]);
    const storeId = Cookies.get('storeId');
    const [searchTerm, setSearchTerm] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [firstTime, setFirstTime] = useState(true);

    useEffect(() => {
        if (firstTime) {
            fetchData();
            setFirstTime(false);
        }
    }, [])

    const fetchData = async () => {
        //console.log("El dateRange es: ", dateRange)
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const oneMoreYear = new Date(today);
        oneMoreYear.setFullYear(today.getFullYear() + 1);
        const [quotes, incomes, customers] = await Promise.all([
            getQuoteByCheckout(storeId, true),
            getIncomeByDates(oneYearAgo, oneMoreYear, storeId),
            getCustomerList(storeId)
        ])
        //console.log("Promises: ", { incomes, quotes, customers })
        setCustomerList(customers.customerList)
        setIncomeData(incomes.incomeList);
        const complementedQuotes = quotes.quoteList
            .map((quote) => {
                const incomeQuotes = incomes.incomeList.filter(i => i.quoteId === quote._id);
                //console.log("incomeQuotes: ", incomeQuotes)
                const customer = customers.customerList.find(c => c.email === quote.customerEmail)
                //console.log("customer", customer)
                const sumPayed = incomeQuotes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                const porcentagePayed = quote.finalPrice > 0 ? (sumPayed / quote.finalPrice) * 100 : 0;
                const auxName = customer.name + (customer.lastName ? " " + customer.lastName : "");
                return {
                    ...quote,
                    payed: sumPayed,
                    porcentagePayed: porcentagePayed,
                    customerName: auxName
                };
            })
        setQuoteData(complementedQuotes);
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


    const filteredQuotes = quoteData
        .filter((quote) => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                quote.customerName.toLowerCase().includes(term) ||
                quote.customerEmail.toLowerCase().includes(term)
            );
        })
        .sort((a, b) => new Date(a.dateIn) - new Date(b.dateIn));
    const totalQuotedFiltered = filteredQuotes.reduce((sum, e) => sum + e.finalPrice, 0);
    const totalPayedFiltered = filteredQuotes.reduce((sum, e) => sum + e.payed, 0);
    const notPayed = totalQuotedFiltered - totalPayedFiltered
    const totalPercentage = totalQuotedFiltered > 0 ? (totalPayedFiltered / totalQuotedFiltered) * 100 : 0;
    const data = [
        { name: '$ Payed', value: totalPayedFiltered },
        { name: '$ Not Payed', value: notPayed }
    ];
    const COLORS = ['#00C49F', '#FF8042'];

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h1 className="text-3xl font-bold mb-6 text-[#00C49F] text-center">Quote Dashboard</h1>

                <div className="w-full">
                    <div width="100%" height={300}>
                        <PieChartPayed
                            totalPayedFiltered={totalPayedFiltered}
                            notPayed={totalQuotedFiltered - totalPayedFiltered}
                        />
                    </div>
                </div>

                <div className="flex flex-col mt-5 w-full">
                    <div className="w-full">
                        {quoteData.length > 0 && (
                            <motion.div
                                key="quotes"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-sky-50 p-4 rounded-2xl shadow-md text-slate-800"
                            >
                                <h2 className="text-xl font-semibold mb-2">
                                    Quote List - Qty: {filteredQuotes.length} | Total Quoted: <span className="text-blue-500">${totalQuotedFiltered.toFixed(2)}</span> | Total Received: <span className="text-green-500">${totalPayedFiltered.toFixed(2)}</span> | % Payed: <span className="text-cyan-600">{totalPercentage.toFixed(2)}%</span>
                                </h2>

                                {quoteData?.length > 0 && (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Search by email or name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full max-w-md px-4 py-2 rounded bg-white text-slate-900 border border-slate-300  focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <div className="mt-2">
                                            <table id="quotes-table" className="w-full text-left border-collapse bg-white rounded text-slate-900">
                                                <thead>
                                                    <tr className="text-center">
                                                        <th>Dates In</th>
                                                        <th>Dates Out</th>
                                                        <th>Customer Email</th>
                                                        <th>Customer Name</th>
                                                        <th>Amount Quoted</th>
                                                        <th>Amount Payed</th>
                                                        <th>%</th>
                                                    </tr>
                                                </thead>
                                                {filteredQuotes.map((quote, i) => (
                                                    <tbody key={i}>
                                                        <tr className="text-center">
                                                            <td>{formatDateShort(quote.dateIn)}</td>
                                                            <td>{formatDateShort(quote.dateOut)}</td>
                                                            <td>{quote.customerEmail}</td>
                                                            <td>{quote.customerName}</td>
                                                            <td>{quote.finalPrice}</td>
                                                            <td>{quote.payed}</td>
                                                            <td>{quote.porcentagePayed.toFixed(2)}%</td>
                                                        </tr>
                                                    </tbody>
                                                ))}
                                            </table>
                                            <div className="flex flex-row">
                                                <button
                                                    onClick={() => copyTableToClipboard("quotes")}
                                                    className="mt-4 px-4 py-2 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 w-full flex flex-row items-center justify-center"
                                                >
                                                    Copy Table
                                                    <Copy className="ml-2"></Copy>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div >
        </div >
    )
}

export default QuoteDashboard