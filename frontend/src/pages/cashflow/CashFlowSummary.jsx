import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from "framer-motion";
import { useIncomeServices } from "../../store/incomeServices";
import { useExpenseServices } from "../../store/expenseServices";
import { formatDateInput, formatDateDisplay } from '../../components/formatDateDisplay';
import DateRangePicker from "../../components/DateRangePicker"

export default function CashFlowSummary() {
    const { getExpenseByDates, updateExpense } = useExpenseServices();
    const { getIncomeByDates, updateIncome } = useIncomeServices();
    const storeId = Cookies.get('storeId');
    const [selectedItem, setSelectedItem] = useState(null);

    const now = new Date();
    const [formData, setFormData] = useState({
        dateStart: new Date(now.getFullYear(), now.getMonth(), 1),
        dateEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        expenseList: [],
        incomeList: [],
    });

    const fetchData = async () => {
        const incomes = await getIncomeByDates(formData.dateStart, formData.dateEnd, storeId);
        const expenses = await getExpenseByDates(formData.dateStart, formData.dateEnd, storeId);
        //console.log("getIncomeByDates: ", incomes)
        //console.log("getExpenseByDates: ", expenses)
        setFormData((prev) => ({
            ...prev,
            incomeList: incomes.incomeList || [],
            expenseList: expenses.expenseList || [],
        }));
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
        try {
            if (selectedItem.type === "income") {
                await updateIncome(selectedItem.data._id, selectedItem.data);
                toast.success("Income updated");
                await fetchIncomes();
            } else {
                await updateExpense(selectedItem.data._id, selectedItem.data);
                toast.success("Expense updated");
                await fetchExpenses();
            }
            setSelectedItem(null);
        } catch (error) {
            toast.error("Error updating");
        }
    };

    const totalIncomes = formData.incomeList.reduce((acc, item) => acc + item.amount, 0);
    const totalExpenses = formData.expenseList.reduce((acc, item) => acc + item.amount, 0);
    const balance = totalIncomes - totalExpenses;

    return (
        <AnimatePresence>
            <motion.div
                className="p-6 max-w-5xl mx-auto bg-blue-900 rounded-2xl text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <h1 className="text-3xl font-bold mb-6 text-center">Cashflow Summary</h1>

                {/* Date Filters */}
                <div className="flex gap-4 mb-6 justify-center">
                    <DateRangePicker value={{ start: formData.dateStart, end: formData.dateEnd }} onChange={handleDateRangeChange} />
                </div>

                {/* Totals Summary */}
                <div className="bg-blue-900 p-4 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-2">Financial Summary</h2>
                    <div className="grid grid-cols-3 gap-4 text-lg">
                        <div>Total Incomes: <span className="font-bold text-green-400">${totalIncomes.toFixed(2)}</span></div>
                        <div>Total Expenses: <span className="font-bold text-red-400">${totalExpenses.toFixed(2)}</span></div>
                        <div>Balance: <span className={`font-bold ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>${balance.toFixed(2)}</span></div>
                    </div>
                </div>

                {/* Listings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Incomes List */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Incomes</h3>
                        <div className="space-y-2 max-h-80 overflow-auto">
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
                    <div>
                        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Expenses</h3>
                        <div className="space-y-2 max-h-80 overflow-auto">
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
                {/* MODAL EDICIÓN */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                        <div className="bg-blue-900 text-white p-6 rounded-xl w-full max-w-md space-y-4">
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

                            <label className="block text-sm">Payment Method:</label>
                            <input
                                type="text"
                                name="paymentMethod"
                                value={selectedItem.data.paymentMethod}
                                onChange={handleEditChange}
                                className="w-full border rounded p-2"
                            />

                            <div className="flex justify-between mt-4">
                                <button onClick={() => setSelectedItem(null)} className="bg-red-800 px-4 py-2 rounded">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="bg-green-800 text-white px-4 py-2 rounded">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );

}