import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { useIncomeServices } from "../../store/incomeServices";
import { useExpenseServices } from "../../store/expenseServices";
import { formatDateInput, formatDateDisplay } from '../../components/formatDateDisplay';
import paymentMethods from '../../components/paymentMethods.json'
import DateRangePicker from "../../components/DateRangePicker"
import { useTypeServices } from '../../store/typeServices';
import LoadingSpinner from "../../components/LoadingSpinner";


export default function CashFlowSummary() {
    const { getExpenseByDates, updateExpense } = useExpenseServices();
    const { getIncomeByDates, updateIncome } = useIncomeServices();
    const { getTypeByCategory } = useTypeServices();
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const storeId = Cookies.get('storeId');
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const [formData, setFormData] = useState({
        dateStart: new Date(now.getFullYear(), now.getMonth(), 1),
        dateEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        expenseList: [],
        incomeList: [],
    });

    const fetchData = async () => {
        setLoading(true)
        try {
            const incomes = await getIncomeByDates(formData.dateStart, formData.dateEnd, storeId);
            const expenses = await getExpenseByDates(formData.dateStart, formData.dateEnd, storeId);
            // Cargar tipos
            const typesFromAPI = await getTypeByCategory("EXPENSE", storeId);
            //console.log("typesFromAPI: ", typesFromAPI)
            setTypes(typesFromAPI.typeList);
            //console.log("getIncomeByDates: ", incomes)
            //console.log("getExpenseByDates: ", expenses)
            setFormData((prev) => ({
                ...prev,
                incomeList: incomes.incomeList || [],
                expenseList: expenses.expenseList || [],
            }));
        } catch (error) {
            toast.error("Error Fetching Data")
        } finally {
            setLoading(false)
        }

    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleItemClick = (type, item) => {
        setSelectedItem({ type, data: { ...item } });
    };

    const handleDateRangeChange = ({ start, end }) => {
        setFormData(prev => ({
            ...prev,
            dateStart: start,
            dateEnd: end
        }));
    }

    useEffect(() => {
        fetchData();
    }, [formData.dateStart, formData.dateEnd]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedItem((prev) => ({
            ...prev,
            data: {
                ...prev.data,
                [name]: name === "amount" ? parseFloat(value) : value,
            },
        }));
    };


    const handleSave = async () => {
        setLoading(true)
        try {
            if (selectedItem.type === "income") {
                await updateIncome(selectedItem.data._id, selectedItem.data);
                toast.success("Income updated");
                await fetchData();
            } else {
                //console.log("Expense a actualizar: ", selectedItem.data)
                await updateExpense(selectedItem.data._id, selectedItem.data);
                toast.success("Expense updated");
                await fetchData();
            }
            setSelectedItem(null);
        } catch (error) {
            console.log("Error updating", error)
            toast.error("Error updating");
        } finally {
            setLoading(false)
        }
    };

    const totalIncomes = formData.incomeList.reduce((acc, item) => acc + item.amount, 0);
    const totalExpenses = formData.expenseList.reduce((acc, item) => acc + item.amount, 0);
    const balance = totalIncomes - totalExpenses;

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
                    className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
                >
                    <h1 className="text-3xl font-bold mb-6 text-center text-[#00C49F]">Cashflow Summary</h1>

                    {/* Date Filters */}
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-semibold text-lg">Select range date</span>
                        <div className="flex gap-4 mb-6">
                            <DateRangePicker value={{ start: formData.dateStart, end: formData.dateEnd }} onChange={handleDateRangeChange} />
                        </div>
                    </div>
                    <div className="border rounded-2xl px-5 py-2">
                        {/* Totals Summary */}
                        <div className="bg-white p-4 rounded-lg mb-8">
                            <h2 className="text-xl font-semibold mb-2">Financial Summary</h2>
                            <div className="flex flex-col lg:flex-row gap-4 text-lg">
                                <div>Total Incomes: <span className="font-bold text-green-400">${totalIncomes.toFixed(2)}</span></div>
                                <div>Total Expenses: <span className="font-bold text-red-400">${totalExpenses.toFixed(2)}</span></div>
                                <div>Balance: <span className={`font-bold ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>${balance.toFixed(2)}</span></div>
                            </div>
                        </div>

                        {/* Listings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                            {/* Incomes List */}
                            <div className="ml-2">
                                <h3 className="text-lg font-semibold mb-2 border-b pb-1">Incomes</h3>
                                <div className="space-y-2 max-h-200 overflow-auto">
                                    {formData.incomeList.map((item, index) => (
                                        <div key={index} className="bg-green-800 p-3 rounded" onClick={() => handleItemClick("income", item)}>
                                            <div className="flex justify-between">
                                                <span>{formatDateDisplay(item.date)}</span>
                                                <span className="font-bold text-green-300">${item.amount.toFixed(2)}</span>
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                {item.customerEmail || "Without Customer Data"}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {item.paymentMethod}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expenses List */}
                            <div className="mr-2">
                                <h3 className="text-lg font-semibold mb-2 border-b pb-1">Expenses</h3>
                                <div className="space-y-2 max-h-200 overflow-auto">
                                    {formData.expenseList.map((item, index) => (
                                        <div key={index} className="bg-red-800 p-3 rounded" onClick={() => handleItemClick("expense", item)}>
                                            <div className="flex justify-between" >
                                                <span>{formatDateDisplay(item.date)}</span>
                                                <span className="font-bold text-red-200">${item.amount.toFixed(2)}</span>
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                {item.description || "Sin descripción"}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {item.paymentMethod}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* MODAL EDICIÓN */}
                    {selectedItem && (
                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                            <div className="bg-blue-900 text-slate-800 p-6 rounded-xl w-full max-w-md space-y-4">
                                <h3 className="text-xl font-bold text-center">Edit {selectedItem.type}</h3>
                                <label className="block text-sm">Date:</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formatDateInput(selectedItem.data.date)}
                                    onChange={(e) => handleEditChange({ target: { name: "date", value: e.target.value } })}
                                    className="w-full border rounded p-2"
                                />

                                <label className="block text-sm">Amount:</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={selectedItem.data.amount}
                                    onChange={handleEditChange}
                                    className="w-full border rounded p-2"
                                />
                                <label className="block text-sm">Description:</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={selectedItem.data.description}
                                    onChange={handleEditChange}
                                    className="w-full border rounded p-2"
                                />
                                {(selectedItem.type === "expense") && (
                                    <div className="mt-6">

                                        <label className="block font-medium mb-1">Type:</label>
                                        <select
                                            name="type"
                                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded"
                                            value={selectedItem.data.type || ''}
                                            onChange={handleEditChange}
                                        >
                                            <option value="">Select a Type</option>
                                            {types.map((t) => (
                                                <option key={t.name} value={t.name}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <label className="block text-sm">Payment Method:</label>

                                <select
                                    name="paymentMethod"
                                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded"
                                    value={selectedItem.data.paymentMethod}
                                    onChange={handleEditChange}
                                >
                                    <option value="">Select Payment Method</option>
                                    {paymentMethods.map((t) => (
                                        <option key={t.name} value={t.name}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex justify-between mt-4">
                                    <button onClick={() => setSelectedItem(null)} className="bg-red-800 px-4 py-2 rounded">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} className="bg-green-800 text-slate-800 px-4 py-2 rounded">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );

}