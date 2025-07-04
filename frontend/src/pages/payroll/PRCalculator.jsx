import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useServiceServices } from '../../store/serviceServices';
import { useProductServices } from '../../store/productServices';
import { usePayRateServices } from '../../store/payrateServices';
import { usePRrecordServices } from '../../store/prrecordServices';
import { useExpenseServices } from '../../store/expenseServices';
import Cookies from 'js-cookie';
import { calculateCommission } from '../../components/commissionUtils.js';
import { useAuthStore } from '../../store/authStore';
import { Calculator, CirclePlus, Save, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentList from '../../components/paymentMethods.json'
import DateRangePicker from "../../components/DateRangePicker"
import LoadingSpinner from '../../components/LoadingSpinner.jsx';


const PRCalculator = () => {
    const { getProductById } = useProductServices();
    const { user } = useAuthStore();
    const { getServicesForFees, updateService } = useServiceServices();
    const { getPayrateByEmail } = usePayRateServices();
    const { createPRrecord } = usePRrecordServices();
    const { createExpense } = useExpenseServices();
    const [dateIn, setDateIn] = useState('');
    const [dateOut, setDateOut] = useState('');
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRules, setSelectedRules] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const [showServicesModal, setShowServicesModal] = useState(false);
    const storeId = Cookies.get('storeId');
    const [newTag, setNewTag] = useState({ name: '', code: '' });
    const [tags, setTags] = useState([]);
    const [tableVisible, setTableVisible] = useState(false);
    const [useGlobalPaymentMethod, setUseGlobalPaymentMethod] = useState(true);
    const [globalPaymentMethod, setGlobalPaymentMethod] = useState('');
    const [existingPayrollServices, setExistingPayrollServices] = useState([]);
    const [showExistingServicesModal, setShowExistingServicesModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [excludedServiceIds, setExcludedServiceIds] = useState([]);

    const fetchData = async () => {
        if (!dateIn || !dateOut) return;
        setLoading(true);
        try {
            const servicesResponse = await getServicesForFees(dateIn, dateOut, storeId);
            console.log("servicesResponse is: ", servicesResponse);
            if (!servicesResponse.success) {
                toast.error("No services in the selected range")
                setLoading(false);
                return
            }
            const services = servicesResponse.serviceList;
            //console.log("services is: ", services);
            const alreadyInPayroll = services.filter(s => Array.isArray(s.payrollList) && s.payrollList.length > 0);
            setExistingPayrollServices(alreadyInPayroll);

            const allStaff = [...new Set(services.map(s => s.staffEmail))];
            const allPayrates = [];
            for (const staff of allStaff) {
                const res = await getPayrateByEmail(storeId, staff);
                //console.log("Res is: ", res)
                allPayrates.push(...res.payrate);
            }
            //console.log("allPayrates is: ", allPayrates);
            const commissions = calculateCommission(services, allPayrates);
            //console.log("commissions is: ", commissions);

            const summaryData = await Promise.all(commissions.map(async (item) => {
                const product = await getProductById(item.productId);
                const pname = product.product.name
                //console.log("Product is: ", product);
                return {
                    staffEmail: item.staffEmail,
                    productName: pname || 'Unknown',
                    commission: item.totalCommission,
                    originalCommission: item.totalCommission,
                    editedCommission: item.totalCommission,
                    feeRules: item.feeRules,
                    productId: item.productId,
                    paymentMethod: '',
                    services: services.filter(s => s.staffEmail === item.staffEmail && s.productId === item.productId),
                };
            }));
            //console.log("summaryData is: ", summaryData);
            setSummary(summaryData);
            setTableVisible(true);
        } catch (error) {
            //console.error("Error fetching data:", error);
            toast.error("Error Calculating Commission")
        } finally {
            setLoading(false);
        }
    };
    const [dateRange, setDateRange] = useState({
        start: dateIn || '',  // usa el estado previo si lo necesitas
        end: dateOut || ''
    })

    useEffect(() => {
        setDateIn(dateRange.start)
        setDateOut(dateRange.end)
    }, [dateRange])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowModal(false)
                setShowExistingServicesModal(false)
                setShowServicesModal(false)
            }
        }

        if (showModal || showServicesModal || showExistingServicesModal) {
            window.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [showModal, showServicesModal, showExistingServicesModal])

    const handleEditCommission = (index, value) => {
        const updated = [...summary];
        updated[index].commission = Number(value);
        setSummary(updated);
    };

    const handleRemoveRow = (index) => {
        const updated = [...summary];
        updated.splice(index, 1);
        setSummary(updated);
    };


    const handleRegisterPayroll = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setLoading(true);
        try {
            const userEmail = user.email;
            const storeId = Cookies.get("storeId");
            const missingPayments = summary.filter(item => !item.paymentMethod);

            if (useGlobalPaymentMethod && !globalPaymentMethod) {
                toast.error("❗ All the payment methods must be selected");
                return;
            }

            if (!useGlobalPaymentMethod && missingPayments.length > 0) {
                toast.error("❗ All the payment methods must be selected");
                return;
            }
            const prrecord = {
                dateInit: new Date(dateIn),
                dateEnd: new Date(dateOut),
                recordDetail: summary.map(item => ({
                    staffEmail: item.staffEmail,
                    serviceId: item.services.map(s => s._id),
                    amount: item.commission,
                })),
                tag: tags,
                type: "Payroll",
                userEmail,
                storeId,
            };

            //console.log("Payload final a guardar:", prrecord);
            //const auxPRId = 'DEBUG'
            const auxPR = await createPRrecord(prrecord);
            const auxPRId = auxPR.service._id;

            for (const item of summary) {
                if (item.commission > 0) {
                    const expense = {
                        date: new Date().toISOString(),
                        staffEmail: item.staffEmail,
                        amount: item.commission,
                        type: 'Staff',
                        storeId: storeId,
                        userEmail: user.email,
                        paymentMethod: item.paymentMethod,
                        description: `Payroll for ${item.productName} - ${auxPRId}`,
                    };
                    //console.log("El expense a registrar es: ", expense)
                    await createExpense(expense);
                }

                for (const updService of item.services) {
                    await updateService(updService._id, {
                        payrollList: [
                            ...(updService.payrollList || []),
                            auxPRId
                        ],
                    });
                }

            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Payroll registered successfully');
            setSummary([]);
            setTableVisible(false);

        } catch (error) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.error('Error registering payroll');
            //console.error('❌ Error registering payroll:', error);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleExcludeSelectedServices = async () => {
        try {
            setLoading(true)
            //console.log("excludedServiceIds: ", excludedServiceIds)
            const remaining = existingPayrollServices.filter(s => !excludedServiceIds.includes(s._id));
            setExistingPayrollServices(remaining);
            setExcludedServiceIds([]);
            const allStaff = [...new Set(remaining.map(s => s.staffEmail))];
            const allPayrates = [];
            for (const staff of allStaff) {
                const res = await getPayrateByEmail(storeId, staff);
                //console.log("Res is: ", res)
                allPayrates.push(...res.payrate);
            }
            const newCommissions = calculateCommission(remaining, allPayrates);
            const newSummary = await Promise.all(
                newCommissions.map(async (item) => {
                    const product = await getProductById(item.productId);
                    return {
                        staffEmail: item.staffEmail,
                        productName: product?.name || 'Unknown',
                        commission: item.totalCommission,
                        originalCommission: item.totalCommission,
                        editedCommission: item.totalCommission,
                        feeRules: item.feeRules,
                        productId: item.productId,
                        paymentMethod: globalPaymentMethod || '',
                        services: remaining.filter(
                            s => s.staffEmail === item.staffEmail && s.productId === item.productId
                        ),
                    };
                })
            );
            setShowExistingServicesModal(false);
            setSummary(newSummary);
            toast.success("Selected services excluded from calculation");
        } catch (error) {
            console.error("El error es: ", error)
            toast.success("Error excluding from calculation");
        } finally {
            setLoading(false)
        }
    };

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
                    <h1 className='font-bold text-2xl flex justify-center text-[#00C49F]'>Payroll Calculator</h1>

                    <fieldset className='mb-5 border rounded-2xl p-4 flex flex-col gap-4 bg-white text-slate-800 w-max mt-5'>
                        <div className="flex flex-col justify-center items-center w-full mb-4">
                            <label className="mb-2 font-medium text-sm text-slate-800">Date Range:</label>
                            <DateRangePicker value={dateRange} onChange={setDateRange} />
                        </div>

                        <div className='flex justify-center mt-4'>
                            <button onClick={fetchData} className='px-6 py-2 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 rounded flex justify-center'>
                                <Calculator className='mr-2' />
                                Calculate
                            </button>
                        </div>
                        {existingPayrollServices.length > 0 && (
                            <div className="flex items-center justify-center gap-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow">
                                <span>⚠️ {existingPayrollServices.length} service(s) were already included in previous payrolls.</span>
                                <button
                                    onClick={() => setShowExistingServicesModal(true)}
                                    className="bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-2 py-1 rounded"
                                >
                                    <Search className="inline mr-1" /> View
                                </button>
                            </div>
                        )}
                    </fieldset>

                    {loading && <p className='text-slate-800 text-lg font-bold'>Loading...</p>}

                    {/* Tabla resumen de comisiones por staff */}
                    {tableVisible && (
                        <div>
                            <fieldset className='border rounded-2xl p-2 mb-5 bg-white'>
                                <legend className='ml-2 text-lg text-slate-800 font-bold'>
                                    {`Fees for ${dateIn} to ${dateOut}`}
                                </legend>

                                <table className='text-slate-800 w-full'>
                                    <thead>
                                        <tr>
                                            <th className='px-2 py-1 text-center'>Staff Email</th>
                                            <th className='px-2 py-1 text-center'>Product</th>
                                            <th className='px-2 py-1 text-center'>Original Commission</th>
                                            <th className='px-2 py-1 text-center'>Edit Commission</th>
                                            <th className='px-2 py-1 text-center'>Save</th>
                                            <th className='px-2 py-1 text-center'>View Rule</th>
                                            <th className='px-2 py-1 text-center'>View Services</th>
                                            {!useGlobalPaymentMethod && (
                                                <th className='px-2 py-1 text-center'>Payment Methods</th>
                                            )}
                                            <th className='px-2 py-1 text-center'>Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.map((item, index) => (
                                            <tr key={index} className='border-t border-white/20'>
                                                <td className='px-2 py-1 text-left'>{item.staffEmail}</td>
                                                <td className='px-2 py-1 text-left'>{item.productName}</td>
                                                <td className='px-2 py-1 text-center font-bold'>${item.originalCommission}</td>
                                                <td className='px-2 py-1 text-center font-bold'>
                                                    <input
                                                        type="number"
                                                        value={item.editedCommission}
                                                        onChange={e => {
                                                            const updated = [...summary];
                                                            updated[index].editedCommission = Number(e.target.value);
                                                            setSummary(updated);
                                                        }}
                                                        className={`rounded px-2 py-1 w-24 text-right ${item.editedCommission !== item.originalCommission
                                                            ? 'bg-yellow-100 text-black'
                                                            : 'bg-white text-black'
                                                            }`}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleEditCommission(index, item.editedCommission);
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td className='px-2 py-1'>
                                                    <div className='flex justify-center'>
                                                        <button
                                                            onClick={() => handleEditCommission(index, item.editedCommission)}
                                                            className='bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-2 py-1 rounded'
                                                        >
                                                            <Save />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className='px-2 py-1'>
                                                    <div className='flex justify-center'>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRules(item.feeRules);
                                                                setShowModal(true);
                                                            }}
                                                            className='bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-2 py-1 rounded'
                                                        >
                                                            <Search />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className='px-2 py-1'>
                                                    <div className='flex justify-center'>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedServices(item.services);
                                                                setShowServicesModal(true);
                                                            }}
                                                            className='bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-2 py-1 rounded'
                                                        >
                                                            <Search />
                                                        </button>
                                                    </div>
                                                </td>
                                                {!useGlobalPaymentMethod && (
                                                    <td>
                                                        <div className="mt-1 mb-1">
                                                            <select
                                                                name="paymentMethod"
                                                                value={item.paymentMethod}
                                                                onChange={e => {
                                                                    const updated = [...summary];
                                                                    updated[index].paymentMethod = e.target.value;
                                                                    setSummary(updated);
                                                                }}
                                                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded"
                                                            >
                                                                <option value="">Select Payment Method</option>
                                                                {paymentList.map((method, index) => (
                                                                    <option key={method.name || index} value={method.name}>{method.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className='px-2 py-1'>
                                                    <div className='flex justify-center'>
                                                        <button
                                                            onClick={() => handleRemoveRow(index)}
                                                            className='bg-red-400 hover:bg-red-600 text-cyan-50 px-2 py-1 rounded'
                                                        >
                                                            <Trash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="flex items-center gap-4 mt-4 text-slate-800">
                                    <label className="font-semibold">Same Payment Method for all the commissions:</label>
                                    <input
                                        type="checkbox"
                                        checked={useGlobalPaymentMethod}
                                        onChange={e => {
                                            const checked = e.target.checked;
                                            setUseGlobalPaymentMethod(checked);
                                            if (checked && globalPaymentMethod) {
                                                // aplicar a todas las filas
                                                const updated = summary.map(item => ({
                                                    ...item,
                                                    paymentMethod: globalPaymentMethod,
                                                }));
                                                setSummary(updated);
                                            }
                                        }}
                                    />
                                    {useGlobalPaymentMethod && (
                                        <select
                                            className="bg-white text-slate-900 border border-slate-300 rounded px-3 py-2"
                                            value={globalPaymentMethod}
                                            onChange={e => {
                                                const selected = e.target.value;
                                                setGlobalPaymentMethod(selected);
                                                const updated = summary.map(item => ({
                                                    ...item,
                                                    paymentMethod: selected,
                                                }));
                                                setSummary(updated);
                                            }}
                                        >
                                            <option value="">Select Payment Method</option>
                                            {paymentList.map(method => (
                                                <option key={method.name} value={method.name}>{method.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </fieldset>
                            {/* Tabla resumen de staff y total de comisiones*/}
                            <fieldset className='border rounded-2xl p-4 mb-6 bg-white'>
                                <legend className='ml-2 text-lg text-slate-800 font-bold'>
                                    {`Total Payroll Summary from ${dateIn} to ${dateOut}`}
                                </legend>

                                <table className='text-slate-800 w-full'>
                                    <thead>
                                        <tr>
                                            <th className='px-4 py-2 text-left'>Staff Email</th>
                                            <th className='px-4 py-2 text-center'>Total Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(
                                            summary.reduce((acc, item) => {
                                                const email = item.staffEmail;
                                                if (!acc[email]) acc[email] = 0;
                                                acc[email] += Number(item.commission || 0);
                                                return acc;
                                            }, {})
                                        ).map(([staffEmail, total], index) => (
                                            <tr key={staffEmail || index} className='border-t border-white/20'>
                                                <td className='px-4 py-2 text-left'>{staffEmail}</td>
                                                <td className='px-4 py-2 text-center font-bold text-green-400'>
                                                    ${total.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </fieldset>
                            {/* TAG SECTION */}
                            <fieldset className="w-full space-y-4 rounded-2xl border p-4 text-slate-800 mb-5 bg-white">
                                <legend className="font-bold">Tags</legend>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-1/2 p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                        value={newTag.name}
                                        onChange={(e) => setNewTag((prev) => ({ ...prev, name: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newTag.name || newTag.code) {
                                                    setTags(prev => [...prev, newTag]);
                                                    setNewTag({ name: '', code: '' });
                                                }
                                            }
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Code"
                                        className="w-1/2 p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                        value={newTag.code}
                                        onChange={(e) => setNewTag((prev) => ({ ...prev, code: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newTag.name || newTag.code) {
                                                    setTags(prev => [...prev, newTag]);
                                                    setNewTag({ name: '', code: '' });
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            if (newTag.name || newTag.code) {
                                                setTags(prev => [...prev, newTag]);
                                                setNewTag({ name: '', code: '' });
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => {
                                            if (newTag.name || newTag.code) {
                                                setTags(prev => [...prev, newTag]);
                                                setNewTag({ name: '', code: '' });
                                            }
                                        }}
                                    >
                                        <CirclePlus className='hover:bg-cyan-600 rounded-4xl' />
                                    </button>
                                </div>

                                <ul className="space-y-1">
                                    {(tags || []).map((tag, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between items-center bg-sky-50 rounded px-3 py-2"
                                        >
                                            <span>{tag.name} - {tag.code}</span>
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => {
                                                    const updated = [...tags];
                                                    updated.splice(index, 1);
                                                    setTags(updated);
                                                }}
                                            >
                                                <Trash2 />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </fieldset>
                        </div>
                    )}
                    {summary.length > 0 && (
                        <div className='flex flex-row justify-center items-center'>
                            <button
                                onClick={handleRegisterPayroll}
                                disabled={isSubmitting}
                                className={`mt-4 px-4 py-2 rounded text-slate-800 font-semibold ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
  `}
                            >
                                {isSubmitting ? 'Processing...' : 'Register Payroll'}
                            </button>
                        </div>
                    )}
                </motion.div>
                {/* Modal de Fee Rules */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            className='fixed inset-0 bg-black/95 flex items-center justify-center z-50'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className='bg-sky-50 rounded-xl p-6 w-[90%] max-w-md shadow-xl'
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <h3 className='text-lg font-bold mb-4'>Evaluated Fee Rules</h3>

                                <div className='space-y-2'>
                                    {selectedRules.length === 0 ? (
                                        <p>No rules applied.</p>
                                    ) : (
                                        selectedRules.map((rule, idx) => (
                                            <div key={idx} className='border p-2 rounded bg-cyan-100'>
                                                <label className='block'><strong>Timeframe:</strong> {rule.timeframe}</label>
                                                <label className='block'><strong>Operator:</strong> {rule.operator}</label>
                                                <label className='block'><strong>Value:</strong> {rule.value}</label>
                                                <label className='block'><strong>Fee:</strong> ${rule.fee}</label>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className='mt-6 flex justify-end'>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className='px-4 py-2 bg-red-400 text-slate-800 rounded hover:bg-red-700'
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Modal de View Services */}
                <AnimatePresence>
                    {showServicesModal && (
                        <motion.div
                            className='fixed inset-0 bg-black/95 flex items-center justify-center z-50'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className='bg-sky-50 rounded-xl p-6 w-[90%] max-w-lg shadow-xl overflow-y-auto max-h-[80vh]'
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <h3 className='text-lg font-bold mb-4'>Services Included in Commission</h3>

                                <ul className='space-y-2'>
                                    {selectedServices.length === 0 ? (
                                        <li>No services found.</li>
                                    ) : (
                                        selectedServices.map((s, idx) => (
                                            <li key={s._id} className='border rounded p-2 bg-cyan-100'>
                                                <p><strong>{s.name}</strong></p>
                                                <p>Date In: {new Date(s.dateIn).toLocaleString()}</p>
                                                <p>Date Out: {new Date(s.dateOut).toLocaleString()}</p>
                                            </li>
                                        ))
                                    )}
                                </ul>

                                <div className='mt-6 flex justify-end'>
                                    <button
                                        onClick={() => setShowServicesModal(false)}
                                        className='px-4 py-2 bg-red-400 text-slate-800 rounded hover:bg-red-700'
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Modal servicios con Payroll */}
                <AnimatePresence>
                    {showExistingServicesModal && (
                        <motion.div
                            className='fixed inset-0 bg-black/95 flex items-center justify-center z-50'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className='bg-sky-50 rounded-xl p-6 w-[90%] max-w-lg shadow-xl overflow-y-auto max-h-[80vh]'
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <h3 className='text-lg font-bold mb-4 text-slate-900'>Services already included in previous payrolls</h3>

                                <ul className='space-y-2 text-black'>
                                    {/* Select All checkbox */}
                                    <li className='border rounded p-2 bg-gray-200 flex items-center gap-3 font-semibold'>
                                        <input
                                            type="checkbox"
                                            checked={existingPayrollServices.length > 0 && excludedServiceIds.length === existingPayrollServices.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    // Select all
                                                    const allIds = existingPayrollServices.map(s => s._id);
                                                    setExcludedServiceIds(allIds);
                                                } else {
                                                    // Deselect all
                                                    setExcludedServiceIds([]);
                                                }
                                            }}
                                        />
                                        <span>Select All</span>
                                    </li>
                                    {existingPayrollServices.map((s) => (
                                        <li key={s._id} className='border rounded p-2 bg-cyan-100 flex items-start gap-3'>
                                            <input
                                                type="checkbox"
                                                checked={excludedServiceIds.includes(s._id)}
                                                onChange={() => {
                                                    setExcludedServiceIds(prev =>
                                                        prev.includes(s._id)
                                                            ? prev.filter(id => id !== s._id)
                                                            : [...prev, s._id]
                                                    );
                                                }}
                                            />
                                            <div>
                                                <p><strong>{s.name}</strong></p>
                                                <p>Date In: {new Date(s.dateIn).toLocaleString()}</p>
                                                <p>Date Out: {new Date(s.dateOut).toLocaleString()}</p>
                                                <p>Payroll IDs: {s.payrollList.join(', ')}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className='mt-6 flex justify-end'>
                                    <button
                                        onClick={handleExcludeSelectedServices}
                                        disabled={excludedServiceIds.length === 0}
                                        className='px-4 py-2 mr-2 bg-red-400 text-slate-800 rounded hover:bg-red-700'
                                    >
                                        Exclude Selected Services
                                    </button>
                                    <button
                                        onClick={() => setShowExistingServicesModal(false)}
                                        className='px-4 py-2 bg-slate-600 hover:bg-slate-700 text-cyan-50 rounded'
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default PRCalculator;