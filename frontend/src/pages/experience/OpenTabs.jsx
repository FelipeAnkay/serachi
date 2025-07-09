import Cookies from 'js-cookie';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Bed, CircleX, ConeIcon, Copy, MapPinCheckInside, MapPinPlus, Receipt, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useExperienceServices } from '../../store/experienceServices';
import toast from 'react-hot-toast';
import { useServiceServices } from '../../store/serviceServices';
import { useCustomerServices } from '../../store/customerServices';
import { useRoomReservationServices } from '../../store/roomReservationServices';
import { useCloseTabServices } from '../../store/closeTabServices';
import { formatDateDisplay, formatDateShort, formatDateInput, formatDateISO } from '../../components/formatDateDisplay'
import { useProductServices } from '../../store/productServices';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useIncomeServices } from '../../store/incomeServices';
import paymentMethods from '../../components/paymentMethods.json'

export default function OpenTabs() {
    const { updateExperience, getExperienceById, getExperienceByCheckout } = useExperienceServices();
    const { getServiceByIds, getServiceById } = useServiceServices();
    const { getReservationsByIds, updateRoomReservation } = useRoomReservationServices();
    const { createIncome } = useIncomeServices();
    const { getCustomerEmail } = useCustomerServices();
    const { getProductById, getProductByIds } = useProductServices();
    const { createCloseTab } = useCloseTabServices();
    const [loading, setLoading] = useState(false);
    const storeId = Cookies.get('storeId');
    const timezone = Cookies.get('timezone');
    const { user } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [experienceList, setExperienceList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [reservationList, setReservationList] = useState([]);
    const [serviceList, setServiceList] = useState([]);
    const [customer, setCustomer] = useState([]);
    const [modalTab, setModalTab] = useState(null);
    const [experienceSearch, setExperienceSearch] = useState("");
    const [selectedExperience, setSelectedExperience] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [pendingUpdates, setPendingUpdates] = useState({
        service: {},      // { serviceId: true/false }
        product: {},      // { productId: true/false }
        reservation: {},  // { reservationId: true/false }
    });
    const [serviceTotal, setServiceTotal] = useState(0);
    const [productTotal, setProductTotal] = useState(0);
    const [reservationTotal, setReservationTotal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const fetchExperiences = async () => {
        setLoading(true)
        try {
            //console.log("Entre a fetchExperiences")
            const experiences = await getExperienceByCheckout(storeId);
            //console.log("Respuesta de getExperienceList: ", experiences)
            setExperienceList(experiences.experienceList);
        } catch (error) {
            toast.error("Error Fetching Experiences")
        } finally {
            setLoading(false)
        }

    };

    useEffect(() => {
        if (storeId) {
            fetchExperiences();
        }
    }, [storeId, location.key]);

    useEffect(() => {
        if (location.state?.updated) {
            // Limpiar el estado para que no recargue de nuevo en otros montajes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    useEffect(() => {
        setLoading(true);
        //console.log("Entré a useEffect de calcular totales");

        // Función que determina si un ítem está pagado según pendingUpdates o valor original
        const isPaid = (category, id, original) => pendingUpdates[category]?.[id] ?? original;

        const calculateTotals = async () => {
            try {
                setLoading(true)
                const productCache = {};
                const isCheckedNow = (category, id) => pendingUpdates[category]?.[id] === true;
                // Total de servicios
                const sTotal = await Promise.all(
                    serviceList.map(async (s) => {
                        if (isPaid('service', s._id, s.isPaid) && isCheckedNow('service', s._id)) {
                            if (!productCache[s.productId]) {
                                const response = await getProductById(s.productId);
                                productCache[s.productId] = response?.product || {}; // Cachear el producto
                            }
                            return productCache[s.productId].finalPrice || 0;
                        }
                        return 0;
                    })
                ).then(prices => prices.reduce((acc, price) => acc + price, 0));

                // Total de productos
                const pTotal = productList.reduce((acc, p, index) => {
                    const paid = pendingUpdates.product?.[index] ?? p.isPaid;
                    const checked = pendingUpdates.product?.[index] === true;
                    if (paid && checked) {
                        return acc + (p.price || 0) * (p.Qty || 1);
                    }
                    return acc;
                }, 0);

                // Total de reservas
                const rTotal = reservationList.reduce((acc, r) => {
                    if (isPaid('reservation', r._id, r.isPaid) && isCheckedNow('reservation', r._id)) {
                        return acc + (r.roomFinalPrice || 0);
                    }
                    return acc;
                }, 0);

                // Actualiza los estados
                setServiceTotal(sTotal);
                setProductTotal(pTotal);
                setReservationTotal(rTotal);
                setGrandTotal(sTotal + pTotal + rTotal);
            } catch (error) {
                toast.error("Error calculating totals")
            } finally {
                setLoading(false)
            }

        };

        calculateTotals();

    }, [pendingUpdates, serviceList, productList, reservationList]);

    const handleOpenModal = async (experience) => {
        try {
            //console.log("En handleOpenModal: ", experience);
            if (experience.serviceList && experience.serviceList.length > 0) {
                const response = await getServiceByIds(experience.serviceList);
                //console.log("El getServiceByIds es: ", response);
                setServiceList(response.serviceList);
            }

            //console.log("Listado de Ids: ", experience.productList)
            let productsIds = []
            for (const prod of experience.productList) {
                productsIds.push(prod.productId);
            }
            //console.log("productsIds: ", productsIds)
            if (productsIds.length > 0) {
                //console.log("Entre al IF")
                const auxProductList = await getProductByIds(productsIds)
                //console.log("auxProductList: ", auxProductList)
                const newProductList = experience.productList
                    .map((product) => {
                        const prod = auxProductList.productList.find(s => s._id === product.productId);
                        const productName = prod?.name;

                        return {
                            ...product,
                            productName: productName,
                        };
                    })
                //console.log("newProductList: ", newProductList)
                setProductList(newProductList);
            }

            if (experience.bookList && experience.bookList.length > 0) {
                //console.log("If booklist:  ", experience.bookList);
                const reservations = await getReservationsByIds(experience.bookList);
                //console.log("El getReservationsByIds es: ", reservations);
                setReservationList(reservations.roomReservationList)
            }
            setSelectedExperience(experience);
            setModalTab(experience);
            setIsModalOpen(true);
        } catch (error) {
            //console.error('Error handleOpenModal', error);
            toast.error("No services for this experience")
        }
    };

    const handleUpdatePaidStatus = async (type, id, isPaid) => {
        setLoading(true)
        try {
            if (type === 'service') {
                await updateService(id, { isPaid });
            } else if (type === 'reservation') {
                //console.log("Enviaré esto a updateRoomReservation", id," - ", isPaid)
                await updateRoomReservation(id, { isPaid });
            } else if (type === 'product') {
                const updatedProductList = selectedExperience.productList.map((p, index) =>
                    index === id ? { ...p, isPaid } : p
                );

                await updateExperience(selectedExperience._id, {
                    productList: updatedProductList,
                });
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Estado de pago actualizado');

            // Refrescar experiencia
            const updated = await getExperienceById(selectedExperience._id);
            setSelectedExperience(updated.experience);
        } catch (error) {
            toast.error('Error actualizando estado de pago');
            //console.error(error);
        } finally {
            setLoading(false)
        }
    };
    /*
        useEffect(() => {
            console.log("ProductList es: ", productList)
        }, [productList])
        
    */
    const handleSelectAll = (list, setList, key) => (e) => {
        const isChecked = e.target.checked;

        const updatedList = list.map(item => ({ ...item, isPaid: isChecked }));
        setList(updatedList);

        const updatedPending = {};
        updatedList.forEach(item => {
            if (!item.isPaid || isChecked) {
                updatedPending[item._id] = isChecked;
            }
        });

        setPendingUpdates(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                ...updatedPending,
            },
        }));
    };
    /*
        useEffect(() => {
          console.log("pendingUpdates es: ", pendingUpdates)
        }, [pendingUpdates])
        
    */
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
                    <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-slate-800 bg-clip-text">Experience Tabs</h1>
                    <div className='w-full'>
                        <fieldset className="flex-grow space-y-4 border rounded-2xl p-4 ml-4 mr-4">
                            <legend className="text-2xl font-bold">Experience List</legend>
                            <input
                                type="text"
                                placeholder="Search experience by email..."
                                className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded"
                                value={experienceSearch}
                                onChange={(e) => setExperienceSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-1">
                                {experienceList.length === 0 ? (
                                    <p>No Experiences found for this store.</p>
                                ) : (
                                    experienceList
                                        .filter(experience =>
                                            experience.customerEmail.toLowerCase().includes(experienceSearch.toLowerCase())
                                        )
                                        .map((experience) => {
                                            return (
                                                <div
                                                    key={experience._id}
                                                    className="border rounded-lg p-4 hover:shadow transition relative bg-white border-slate-300 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0"
                                                >
                                                    <div>
                                                        <h3 className="text-md sm:text-lg font-semibold text-gray-800">
                                                            {experience.customerEmail} - From: {new Date(experience.dateIn).toLocaleDateString("en-US", {
                                                                timeZone: timezone || "America/Guatemala",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                            {' to ' + new Date(experience.dateOut).toLocaleDateString("en-US", {
                                                                timeZone: timezone || "America/Guatemala",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                            {" - " + experience.serviceList.length + ' Servs  - ' + experience.productList.length + ' Prod Orders - ' + experience.bookList.length + ' Res'}
                                                        </h3>
                                                    </div>

                                                    <div className={`flex flex-col sm:flex-row gap-2 w-max`}>
                                                        <motion.button
                                                            type='button'
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleOpenModal(experience)}
                                                            className={`w-full py-3 px-4 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg`}
                                                        >
                                                            <div className='flex flex-col justify-center items-center text-sm sm:text-base'>
                                                                <Receipt className='text-cyan-50' />
                                                                <span>View Tab</span>
                                                            </div>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            );
                                        })

                                )}
                                <AnimatePresence className="relative">
                                    {loading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                                            <div className="text-slate-800 text-lg font-semibold animate-pulse">Updating...</div>
                                        </div>
                                    )}
                                    {isModalOpen && modalTab && (
                                        <motion.div className={`relative ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                                            <motion.div
                                                key="custom-experience-modal"
                                                className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <motion.div
                                                    className="bg-sky-50 rounded-2xl p-6 h-[90%] overflow-y-auto relative w-full max-w-4xl"
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0.8 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="absolute top-2 right-3 text-slate-800 hover:text-slate-500"
                                                        onClick={() => {
                                                            setIsModalOpen(false);
                                                            setModalTab(null);
                                                            setSelectedExperience(null);
                                                        }}
                                                    >
                                                        <CircleX />
                                                    </button>
                                                    <h3 className='font-bold text-lg text-center'>Tab Detail</h3>
                                                    <div className="mb-4 flex items-center gap-4">
                                                        <label className="text-sm font-medium text-slate-800">Filter:</label>
                                                        <select
                                                            value={filterStatus}
                                                            onChange={(e) => setFilterStatus(e.target.value)}
                                                            className="rounded-md px-3 py-1 bg-white text-slate-900 border border-zinc-600"
                                                        >
                                                            <option value="all">All</option>
                                                            <option value="paid">Paid only</option>
                                                            <option value="unpaid">Unpaid only</option>
                                                        </select>
                                                    </div>

                                                    {/* Servicios */}
                                                    <div className="mb-6">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h3 className="text-lg font-semibold">Services</h3>
                                                            <label className="text-sm flex items-center gap-1 top-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={serviceList.every(s => s.isPaid)}
                                                                    onChange={handleSelectAll(serviceList, setServiceList, 'service')}
                                                                />
                                                                Select All
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {serviceList
                                                                .filter((s) =>
                                                                    filterStatus === "all" ? true :
                                                                        filterStatus === "paid" ? s.isPaid :
                                                                            !s.isPaid
                                                                )
                                                                .map((s, i) => (
                                                                    <div key={i} className="flex items-center justify-between border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 mb-2 bg-white">
                                                                        <div>
                                                                            <p className="font-medium">{s.name}</p>
                                                                            <p className="text-sm">{formatDateDisplay(s.dateIn)} - {formatDateDisplay(s.dateOut)}</p>
                                                                        </div>
                                                                        <label className="flex items-center gap-2 text-sm ml-2 border rounded-2xl">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={pendingUpdates.service[s._id] ?? s.isPaid}
                                                                                onChange={(e) => {
                                                                                    setPendingUpdates(prev => ({
                                                                                        ...prev,
                                                                                        service: {
                                                                                            ...prev.service,
                                                                                            [s._id]: e.target.checked,
                                                                                        },
                                                                                    }));
                                                                                }}
                                                                                disabled={s.isPaid}
                                                                                className="ml-2 mt-4 mb-4"
                                                                            />
                                                                            <p className="mr-2 mt-4 mb-4">Paid?</p>
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                    {/* Productos */}
                                                    <div className="mb-6">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h3 className="text-lg font-semibold">Products</h3>
                                                            <label className="text-sm flex items-center gap-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={productList.every(p => p.isPaid)}
                                                                    onChange={handleSelectAll(productList, setProductList, 'product')}
                                                                />
                                                                Select All
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {productList
                                                                .filter((p) =>
                                                                    filterStatus === "all" ? true :
                                                                        filterStatus === "paid" ? p.isPaid :
                                                                            !p.isPaid
                                                                )
                                                                .map((p, i) => (
                                                                    <div key={i} className="flex items-center justify-between border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 mb-2 bg-white">
                                                                        <div>
                                                                            <p className="font-medium">{p.productName}</p>
                                                                            <p className="text-sm">Quantity: {p.Qty}</p>
                                                                            <p className="text-sm">Price: ${p.price}</p>
                                                                            <p className="text-sm">Total: ${p.Qty * p.price}</p>
                                                                        </div>
                                                                        <label className="flex items-center gap-2 text-sm ml-2 border rounded-2xl">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={pendingUpdates.product[i] ?? p.isPaid}
                                                                                className="ml-2 mt-4 mb-4"
                                                                                onChange={(e) => {
                                                                                    setPendingUpdates(prev => ({
                                                                                        ...prev,
                                                                                        product: {
                                                                                            ...prev.product,
                                                                                            [i]: e.target.checked,
                                                                                        },
                                                                                    }));
                                                                                }}
                                                                                disabled={p.isPaid}
                                                                            />
                                                                            <p className="mr-2 mt-4 mb-4">Paid?</p>
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                    {/* Reservas */}
                                                    <div className="mb-6">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h3 className="text-lg font-semibold">Room Reservation</h3>
                                                            <label className="text-sm flex items-center gap-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={reservationList.every(r => r.isPaid)}
                                                                    onChange={handleSelectAll(reservationList, setReservationList, 'reservation')}
                                                                />
                                                                Select All
                                                            </label>
                                                        </div>
                                                        {reservationList
                                                            .filter((r) =>
                                                                filterStatus === "all" ? true :
                                                                    filterStatus === "paid" ? r.isPaid :
                                                                        !r.isPaid
                                                            )
                                                            .map((r, i) => (
                                                                <div key={i} className="flex items-center justify-between border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 mb-2">
                                                                    <div>
                                                                        <p className="font-medium">{`${r.bedsReserved} Beds - From: ${formatDateDisplay(r.dateIn)} to ${formatDateDisplay(r.dateOut)}`}</p>
                                                                    </div>
                                                                    <label className="flex items-center gap-2 text-sm ml-2 border rounded-2xl">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={pendingUpdates.reservation[r._id] ?? r.isPaid}
                                                                            className="ml-2 mt-4 mb-4"
                                                                            onChange={(e) => {
                                                                                setPendingUpdates(prev => ({
                                                                                    ...prev,
                                                                                    reservation: {
                                                                                        ...prev.reservation,
                                                                                        [r._id]: e.target.checked,
                                                                                    },
                                                                                }));
                                                                            }}
                                                                            disabled={r.isPaid}
                                                                        />
                                                                        <p className="mr-2 mt-4 mb-4">Paid?</p>
                                                                    </label>
                                                                </div>
                                                            ))}
                                                    </div>
                                                    <div className="mt-6 mb-4 p-4 border-t border-zinc-600 text-slate-800 space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Services:</span>
                                                            <span className="font-semibold">${serviceTotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Products:</span>
                                                            <span className="font-semibold">${productTotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Room Reservations:</span>
                                                            <span className="font-semibold">${reservationTotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between border-t border-zinc-500 pt-2 mt-2 text-lg">
                                                            <span className="font-bold">Total Due:</span>
                                                            <span className="font-bold text-green-400">${grandTotal.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-6">
                                                        <label className="block font-medium mb-1">Payment Method</label>
                                                        <select
                                                            name="paymentMethod"
                                                            value={selectedPayment || ''}
                                                            onChange={(e) => setSelectedPayment(e.target.value)}
                                                            className="w-full bg-white text-slate-900 border border-slate-300 rounded py-2"
                                                        >
                                                            <option value="">Select Payment Method</option>
                                                            {paymentMethods.map((method, index) => (
                                                                <option key={index} value={method.name}>{method.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Botón final */}
                                                    <div className="mt-8 text-right">
                                                        <button
                                                            onClick={async () => {
                                                                setLoading(true);

                                                                const updates = [];

                                                                const paidProducts = [];
                                                                const paidServices = [];
                                                                const paidReservations = [];

                                                                //console.log("pendingUpdates es: ", pendingUpdates)

                                                                // Servicios actualizados
                                                                for (const [id, isPaid] of Object.entries(pendingUpdates.service || {})) {
                                                                    const servicio = serviceList.find(s => s._id === id);
                                                                    updates.push(handleUpdatePaidStatus('service', id, isPaid));
                                                                    paidServices.push({
                                                                        serviceId: id,
                                                                        Qty: 1, // Asumo 1 por servicio
                                                                        amount: servicio?.price || 0, // puedes ajustar si usas finalPrice
                                                                    });
                                                                }

                                                                // Productos actualizados
                                                                /*
                                                                for (const [id, isPaid] of Object.entries(pendingUpdates.product || {})) {
                                                                    const producto = productList.find(p => p.productId === id);
                                                                    //console.log("Producto a actualizar es: ", { producto, id, isPaid })
                                                                    updates.push(handleUpdatePaidStatus('product', id, isPaid));
                                                                    paidProducts.push({
                                                                        productId: id,
                                                                        Qty: producto?.Qty || 1,
                                                                        amount: (producto?.price || 0) * (producto?.Qty || 1),
                                                                    });
                                                                }
*/
                                                                for (const [indexStr, isPaid] of Object.entries(pendingUpdates.product || {})) {
                                                                    const index = parseInt(indexStr, 10);
                                                                    const producto = productList[index];

                                                                    if (!producto) continue;

                                                                    updates.push(handleUpdatePaidStatus('product', index, isPaid));
                                                                    paidProducts.push({
                                                                        productId: producto.productId,
                                                                        Qty: producto.Qty || 1,
                                                                        amount: (producto.price || 0) * (producto.Qty || 1),
                                                                    });
                                                                }

                                                                // Reservas actualizadas
                                                                for (const [id, isPaid] of Object.entries(pendingUpdates.reservation || {})) {
                                                                    //console.log("Entre a actualizar reserva: ", { id, isPaid })
                                                                    const reserva = reservationList.find(r => r._id === id);
                                                                    updates.push(handleUpdatePaidStatus('reservation', id, isPaid));
                                                                    paidReservations.push({
                                                                        reservationId: id,
                                                                        Qty: 1,
                                                                        amount: reserva?.roomFinalPrice || 0,
                                                                    });
                                                                }
                                                                await Promise.all(updates);
                                                                //console.log("Respuesta de promise: ", updates);
                                                                // Calcular monto total cerrado
                                                                const totalAmount =
                                                                    paidServices.reduce((acc, s) => acc + s.amount, 0) +
                                                                    paidProducts.reduce((acc, p) => acc + p.amount, 0) +
                                                                    paidReservations.reduce((acc, r) => acc + r.amount, 0);


                                                                const closeTabPayload = {
                                                                    date: new Date(),
                                                                    userEmail: user.email,
                                                                    customerEmail: selectedExperience.customerEmail,
                                                                    closedAmount: totalAmount.toFixed(2),
                                                                    productList: paidProducts,
                                                                    serviceList: paidServices,
                                                                    reservationList: paidReservations,
                                                                    storeId: selectedExperience.storeId,
                                                                }
                                                                // Crear registro CloseTab
                                                                //console.log("Creare el siguiente CloseTab: ", closeTabPayload)
                                                                const auxCloseTab = await createCloseTab(closeTabPayload);
                                                                const now = formatDateISO(new Date());
                                                                const tagPayload = [
                                                                    {
                                                                        name: "CloseTab Payment",
                                                                        code: auxCloseTab._id
                                                                    }
                                                                ];
                                                                const incomePayload = {
                                                                    date: now,
                                                                    customerEmail: selectedExperience.customerEmail,
                                                                    amount: totalAmount,
                                                                    paymentMethod: selectedPayment || "",
                                                                    tag: tagPayload,
                                                                    userEmail: user.email,
                                                                    storeId: selectedExperience.storeId,
                                                                }
                                                                const auxIncome = await createIncome(incomePayload)

                                                                // Cierre visual del modal
                                                                setLoading(false);
                                                                setIsModalOpen(false);
                                                                setModalTab(null);
                                                                setSelectedExperience(null);
                                                                setSelectedPayment("");

                                                            }}
                                                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded-xl transition"
                                                        >
                                                            Update Tab
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </fieldset>
                    </div>
                </motion.div >
            </div >
        </>
    )
}