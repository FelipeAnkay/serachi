import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQuoteServices } from '../../store/quoteServices';
import { useAuthStore } from '../../store/authStore';
import { useCustomerServices } from '../../store/customerServices';
import { CircleX, Contact2, Search, CircleCheck, CirclePlus } from 'lucide-react';
import sourceList from '../../components/sourceList.json';
import { AnimatePresence } from 'framer-motion';
import { useProductServices } from '../../store/productServices';
import { usePartnerServices } from '../../store/partnerServices';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CustomerDetails from '../../components/CustomerDetail'


export default function NewQuote() {
    const { createQuote, getQuoteById, updateQuote } = useQuoteServices();
    const { quoteId } = useParams();
    const storeId = Cookies.get('storeId');
    const clone = Cookies.get('clone');
    const { user } = useAuthStore();
    const { getCustomerEmail, createCustomer, updateCustomer } = useCustomerServices();
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [quote, setQuote] = useState({});
    const [customer, setCustomer] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getProductByStoreId } = useProductServices();
    const [selectedProducts, setSelectedProducts] = useState({});
    const [finalPrice, setFinalPrice] = useState();
    const [productSearch, setProductSearch] = useState("");
    const customerEmailRef = useRef(null);
    const { getPartnerList } = usePartnerServices();
    const [partners, setPartners] = useState([]);
    const [newTag, setNewTag] = useState({ name: '', code: '' });
    const hasFetchedEmail = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const resp = await getQuoteById(quoteId);
                const response = resp.quote;
                if (!hasFetchedEmail.current && response.customerEmail) {
                    handleCustomerEmailSearch(response.customerEmail);
                    hasFetchedEmail.current = true;
                }
                //console.log("OLD Quote Found Response: ", response);
                if (clone) {
                    console.log("Entré a Clone:", response);
                    const { _id, ...clonedQuote } = response; // elimina _id
                    console.log("Elimine ID a Clone:", clonedQuote);
                    setQuote({
                        ...clonedQuote,
                        userName: user.name,
                        customerName: customer.name,
                    });
                    Cookies.remove('clone')
                } else {
                    setQuote({
                        ...response,
                        userName: user.name,
                        customerName: customer.name,
                    })
                }


                setLoading(false);

                //console.log("F: Estoy en useEffect-productList:", response.productList)
                if (response.productList && response.productList.length > 0) {
                    const initialSelectedProducts = {};
                    response.productList.forEach((p) => {
                        initialSelectedProducts[p.productID] = p.Qty;
                    });
                    setSelectedProducts(initialSelectedProducts);
                }
                setFinalPrice(response.finalPrice + response.discount)
            } catch (error) {
                //console.error('Error fetching products:', error);
                setLoading(false);
            }
        }

        if (quoteId) {
            // Si hay ID, carga la cotización existente
            fetchQuote();
        }
    }, [quoteId]);


    useEffect(() => {
        //console.log("El user es: ", user.email)
        if (!quoteId) {
            setQuote({
                userEmail: user.email,
                userName: user.name,
                storeId: storeId,
                isConfirmed: false,
                isReturningCustomer: false,
            });
        }
        const fetchProducts = async () => {
            try {
                const response = await getProductByStoreId(storeId);
                //console.log("ProductList Response: ", response);
                setProducts(response.productList);
                setLoading(false);
                //console.log("ProductList: ", products);
            } catch (error) {
                //console.error('Error fetching products:', error);
                setLoading(false);
            }
        }
        const fetchPartners = async () => {
            try {
                const response = await getPartnerList(storeId);
                //console.log("ProductList Response: ", response);
                setPartners(response.partnerList);
                setLoading(false);
                //console.log("ProductList: ", products);
            } catch (error) {
                //console.error('Error fetching products:', error);
                setLoading(false);
            }
        }
        if (storeId) {
            fetchProducts();
            fetchPartners();
        }
    }, [quoteId, storeId, user.email, user.name]);


    useEffect(() => {
        //console.log("F: El cliente actual es:", customer);
        setQuote((prevQuote) => ({
            ...prevQuote,
            customerName: customer.name,
        }));
    }, [customer]);

    useEffect(() => {
        console.log("F: Los datos de quote son: ", quote);
        console.log("F: Los datos de customer son: ", customer);
        //console.log("F: Los datos de Selected Product son: ", selectedProducts);
        //console.log("F: FinalPrice es:", finalPrice)
    }, [quote]);

    const formatDateInput = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const tzOffset = date.getTimezoneOffset() * 60000; // en milisegundos
        const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
        return localISOTime;
    };

    const incrementProduct = (productId) => {
        setSelectedProducts((prev) => {
            const updated = { ...prev, [productId]: (prev[productId] || 0) + 1 };
            return updateQuoteFromSelected(updated);
        });
    };

    const decrementProduct = (productId) => {
        setSelectedProducts((prev) => {
            if (!prev[productId]) return prev; // No hay que restar

            const updated = { ...prev };
            if (updated[productId] === 1) {
                delete updated[productId];
            } else {
                updated[productId] -= 1;
            }
            return updateQuoteFromSelected(updated);
        });
    };

    const updateQuoteFromSelected = (selected) => {
        const structuredList = Object.entries(selected).map(([id, qty]) => {
            const product = products.find((p) => p._id === id);
            return {
                productID: id,
                productName: product?.name || '',
                Qty: qty,
                productUnitaryPrice: (product?.price || 0),
                productFinalPrice: (product?.price || 0) * qty,
            };
        });

        const total = structuredList.reduce((sum, item) => sum + item.productFinalPrice, 0);

        setFinalPrice(total);
        setQuote((prev) => ({
            ...prev,
            discount: 0,
            finalPrice: total,
            productList: structuredList,
        }));

        return selected;
    };

    const handleQuoteChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuote((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCustomerEmailSearch = async (customerEmail) => {
        //console.log("El email en handleCustomerEmailSearch es: ", customerEmail);
        try {
            const response = await getCustomerEmail(customerEmail);
            const found = response.customerList;
            //console.log("F: el found es:", found);
            if (found) {
                toast.success('Customer Found');
                //console.log("El cliente encontrdo es:", found)
                found.map((cust) => (
                    setCustomer({
                        _id: cust._id,
                        email: cust.email,
                        name: cust.name || '',
                        phone: cust.phone || '',
                        country: cust.country || '',
                        languages: cust.languages || [],
                        birthdate: cust.birthdate ? cust.birthdate.slice(0, 10) : '',
                        nationalId: cust.nationalId || '',
                        diet: cust.diet || '',
                        emergencyContactName: cust.emergencyContact?.emergencyContactName || '',
                        emergencyContactPhone: cust.emergencyContact?.emergencyContactPhone || '',
                        divingCertificates: cust.divingCertificates || [],
                    }
                    )));
                setQuote((prev) => ({
                    ...prev,
                    customerEmail: found[0].email,
                }));
                setIsNew(false);
                setIsCustomerModalOpen(false);
            } else {
                toast.success('Customer not found, please create one');
                setCustomer({
                    _id: '',
                    email: customerEmail,
                    name: '',
                    phone: '',
                    country: '',
                    languages: [],
                    birthdate: '',
                    nationalId: '',
                    diet: '',
                    emergencyContactName: '',
                    emergencyContactPhone: '',
                    divingCertificates: [],
                });
                setQuote((prev) => ({ ...prev, customerEmail: customerEmail }));
                setIsNew(true);
                setIsCustomerModalOpen(true);
            }
        } catch (err) {
            toast.success('Customer not found, please create one');
            setCustomer({
                _id: '',
                email: customerEmail,
                name: '',
                phone: '',
                country: '',
                languages: [],
                birthdate: '',
                nationalId: '',
                diet: '',
                emergencyContactName: '',
                emergencyContactPhone: '',
                divingCertificates: [],
            });
            setIsCustomerModalOpen(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quote.dateIn || !quote.dateOut || !quote.customerEmail || !quote.storeId || !quote.userEmail) {
            toast.error('Please fill all the mandatory data.');
            return;
        }
        try {

            if (!quote._id) {
                await createQuote(quote);
                toast.success('Quote Created');
            } else {
                await updateQuote(quote._id, quote);
                toast.success('Quote Updated');
                if (quote.isConfirmed) {
                    navigate(`/confirmed-quote/`, { state: {}, replace: true });
                } else {
                    navigate(`/past-quote/`, { state: {}, replace: true });
                }

            }

            setTimeout(() => {
                setQuote({
                    dateIn: '',
                    dateOut: '',
                    customerEmail: '',
                    roomId: '',
                    partnerId: '',
                    productList: [],
                    discount: 0,
                    finalPrice: 0,
                    currency: 'USD',
                    isReturningCustomer: false,
                    tag: [],
                    userEmail: user.email,
                    userName: user.name,
                    storeId: storeId,
                    isConfirmed: false,
                });

                setCustomer({
                    email: '',
                    name: '',
                    phone: '',
                    country: '',
                    languages: [],
                    birthdate: '',
                    nationalId: '',
                    diet: '',
                    emergencyContactName: '',
                    emergencyContactPhone: '',
                    professionalCertificates: [],
                });
                setSelectedProducts({});
                setCustomerEditable(false);
                setIsNew(true);
                setFinalPrice("0");
            }, 0); // espera XXXms antes de reiniciar

        } catch (err) {
            toast.error('Error al guardar la cotización');
        }
    };

    const handleSaveClient = async (e) => {
        try {
            console.log("F: El cliente es:", customer);
            const customerPayload = {
                _id: customer._id,
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                country: customer.country,
                languages: customer.languages,
                birthdate: customer.birthdate,
                nationalId: customer.nationalId,
                diet: customer.diet,
                emergencyContact: {
                    emergencyContactName: customer.emergencyContactName,
                    emergencyContactPhone: customer.emergencyContactPhone,
                },
                divingCertificates: customer.divingCertificates,
                storeId: storeId,
            };
            console.log("F: El cliente a CREAR o EDITAR es:", customerPayload);
            if (customerPayload._id) {
                // El cliente ya existe: actualizar
                //console.log("F: entré a modificar");
                await updateCustomer(customerPayload.email, customerPayload); // Asegúrate de tener esta función
                toast.success("Customer updated successfully");
            } else {
                // Crear nuevo cliente
                await createCustomer(customerPayload);
                toast.success("Customer created successfully");
            }
            setIsCustomerModalOpen(false);
            setIsNew(false);
        } catch (error) {
            toast.error('Error creating a Customer');
        }

    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-8xl mx-auto bg-blue-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen"
            >
                <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white bg-clip-text">New Quote</h1>
                <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-2xl shadow bg-blue ml-2 mr-2 mb-2 bg-blue-800">
                    {/* DATOS DE CLIENTE*/}
                    <div className='flex'>
                        <fieldset className="border p-4 rounded-2xl w-1/2">
                            <legend className="font-semibold text-lg">Customer Details</legend>
                            <div className="flex items-center gap-2">
                                <input
                                    ref={customerEmailRef}
                                    type="email"
                                    name="customerEmail"
                                    value={quote.customerEmail}
                                    onChange={(e) =>
                                        setQuote((prev) => ({
                                            ...prev,
                                            customerEmail: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCustomerEmailSearch(customerEmailRef.current.value);
                                        }
                                    }}
                                    onBlur={() => {
                                        handleCustomerEmailSearch(customerEmailRef.current.value);
                                    }}
                                    className="w-full border px-2 py-1 rounded bg-white text-blue-950"
                                    placeholder="Enter customer email"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCustomerEmailSearch(customerEmailRef.current.value)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    <Search />
                                </button>

                                {!isNew && (
                                    <button
                                        type="button"
                                        variant="outline"
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        onClick={() => setIsCustomerModalOpen(true)}
                                    >
                                        <Contact2 />
                                    </button>
                                )}
                                {isCustomerModalOpen && (
                                    <CustomerDetails
                                        isOpen={isCustomerModalOpen}
                                        onClose={() => setIsCustomerModalOpen(false)}
                                        customer={customer}
                                        setCustomer={setCustomer}
                                        onSave={handleSaveClient}
                                    />
                                )}
                            </div>

                        </fieldset>
                        {/* DATOS DE COTIZACION*/}
                        <fieldset className="border rounded-2xl w-1/2 flex pl-4 ml-4 justify-center">
                            <legend className="font-semibold text-lg">Dates</legend>
                            <div className="w-1/2">
                                <label>Check-in</label>
                                <input type="datetime-local"
                                    name="dateIn"
                                    value={formatDateInput(quote.dateIn)}
                                    onChange={handleQuoteChange}
                                    className="w-full border px-2 py-1 rounded bg-white text-blue-950"
                                    min={new Date().toISOString().split('T')[0]}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            // Add logic if we want to do something when enter is pressed
                                        }
                                    }}
                                />
                            </div>
                            <div className="w-1/2 pl-2 pr-2">
                                <label>Check-out</label>
                                <input type="datetime-local"
                                    name="dateOut"
                                    value={formatDateInput(quote.dateOut)}
                                    onChange={handleQuoteChange}
                                    className={`w-full border px-2 py-1 rounded text-blue-950 ${!quote.dateIn ? 'bg-gray-400' : 'bg-white'}`}
                                    min={quote.dateIn || new Date().toISOString().split('T')[0]}
                                    disabled={!quote.dateIn}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            // Add logic if we want to do something when enter is pressed
                                        }
                                    }}
                                />
                            </div>
                        </fieldset>
                    </div>
                    {/* DATOS DE PRODUCTOS Y PRECIOS */}
                    <div className="flex gap-6">
                        {/* DATOS DE PRODUCTOS*/}
                        <fieldset className="flex-grow space-y-4 border rounded-2xl p-4">
                            <legend className="text-2xl font-bold">Product List</legend>
                            <input
                                type="text"
                                placeholder="Search product by name..."
                                className="w-full p-2 border border-gray-300 rounded"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2">
                                {products.length === 0 ? (
                                    <p>No products found for this store.</p>
                                ) : (
                                    products
                                        .filter(product =>
                                            product.name.toLowerCase().includes(productSearch.toLowerCase())
                                        )
                                        .sort((a, b) => a.type.localeCompare(b.type))
                                        .map((product) => {
                                            const qty = selectedProducts[product._id] || 0;

                                            return (
                                                <div
                                                    key={product._id}
                                                    className={`border rounded-lg p-2 hover:shadow transition relative ${qty > 0 ? ' bg-green-100 border-green-500 border-2 ' : 'border-gray-300 bg-blue-100'
                                                        }`}
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {product.name} - {product.durationDays ? product.durationDays + ' days -' : ''} ${product.price}
                                                    </h3>

                                                    {qty > 0 && (
                                                        <div className="absolute top-2 right-2 flex gap-2 items-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => decrementProduct(product._id)}
                                                                className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-sm font-bold text-black">{qty}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => incrementProduct(product._id)}
                                                                className="bg-green-500 text-white px-2 rounded hover:bg-green-600"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}

                                                    {qty === 0 && (
                                                        <div className="absolute top-2 right-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => incrementProduct(product._id)}
                                                                className="bg-green-500 text-white px-2 rounded hover:bg-green-600"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </fieldset>
                        {/* Price Column */}
                        <fieldset className="w-64 space-y-4 rounded-2xl border p-4">
                            <legend className="text-2xl font-bold">Pricing</legend>
                            <div className="flex ml-4 mr-4 items-center justify-center">
                                <label className=" text-white font-bold text-lg">Price: ${finalPrice}</label>
                            </div>
                            <div className="ml-4 mr-4">
                                <div className="flex justify-between w-full">
                                    <label className="block text-sm font-medium text-white">Discount</label>
                                    <label className="block text-sm font-medium text-white">{(finalPrice && quote.discount) ? ((quote.discount / finalPrice) * 100).toFixed(2) : '0.00'}%</label>
                                </div>
                                <input
                                    type="text"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                                    value={quote.discount || 0}
                                    onChange={(e) => {
                                        const discount = parseFloat(e.target.value) || 0;
                                        setQuote((prev) => ({
                                            ...prev,
                                            discount,
                                            finalPrice: finalPrice - discount,
                                        }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            // Add logic if we want to do something when enter is pressed
                                        }
                                    }}
                                />
                            </div>
                            <div className="ml-4 mr-4 flex items-center justify-center">
                                <label className=" text-white font-bold text-lg mt-6">Final Price: </label>
                                <label className=" text-white font-bold text-2xl mt-6 ml-2">${quote.finalPrice}</label>
                            </div>
                        </fieldset>

                    </div>
                    {/* Other Details  Fieldset */}
                    <fieldset className="w-full rounded-2xl border p-4 space-y-4">

                        <legend className="text-2xl font-bold">Other Details</legend>

                        {/* Fila principal con Source y Tags */}
                        <div className="flex gap-4">
                            {/* Source */}
                            <div className="w-1/2 space-y-4">
                                <div className="ml-4 mr-4">
                                    <label className="block text-sm font-medium">Source</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                        value={quote.source || ''}
                                        onChange={(e) => {
                                            const selected = e.target.value;
                                            const updatedQuote = {
                                                ...quote,
                                                source: selected,
                                            };
                                            if (selected !== 'Other') updatedQuote.customSource = '';
                                            if (selected !== 'Partner') updatedQuote.partnerId = '';
                                            setQuote(updatedQuote);
                                        }}
                                    >
                                        <option value="" className='text-blue-950'>Select Source</option>
                                        {sourceList.map((item, index) => (
                                            <option key={index} value={item.name} className='text-blue-950'>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {quote.source === 'Partner' && (
                                    <div className="ml-4 mr-4">
                                        <label className="block text-sm font-medium text-white">Partner</label>
                                        <select
                                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                                            value={quote.partnerId || ''}
                                            onChange={(e) =>
                                                setQuote((prev) => ({
                                                    ...prev,
                                                    partnerId: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="" className='text-blue-950'>Select a partner</option>
                                            {partners.map((partner) => (
                                                <option key={partner._id} value={partner._id} className='text-blue-950'>
                                                    {partner.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {quote.source === 'Other' && (
                                    <div className="ml-4 mr-4">
                                        <label className="block text-sm font-medium text-white">Specify Source</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                                            placeholder="Custom source"
                                            value={quote.customSource || ''}
                                            onChange={(e) =>
                                                setQuote((prev) => ({
                                                    ...prev,
                                                    customSource: e.target.value,
                                                }))
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    // Add logic if we want to do something when enter is pressed
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <fieldset className="w-1/2 space-y-4 rounded-2xl border p-4">
                                <legend className="font-bold">Tags</legend>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-1/2 p-2 border border-gray-300 rounded"
                                        value={newTag.name}
                                        onChange={(e) => setNewTag((prev) => ({ ...prev, name: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newTag.name || newTag.code) {
                                                    setQuote((prev) => ({
                                                        ...prev,
                                                        tag: [...(prev.tag || []), newTag],
                                                    }));
                                                    setNewTag({ name: '', code: '' });
                                                }
                                            }
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Code"
                                        className="w-1/2 p-2 border border-gray-300 rounded"
                                        value={newTag.code}
                                        onChange={(e) => setNewTag((prev) => ({ ...prev, code: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newTag.name || newTag.code) {
                                                    setQuote((prev) => ({
                                                        ...prev,
                                                        tag: [...(prev.tag || []), newTag],
                                                    }));
                                                    setNewTag({ name: '', code: '' });
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => {
                                            if (newTag.name || newTag.code) {
                                                setQuote((prev) => ({
                                                    ...prev,
                                                    tag: [...(prev.tag || []), newTag],
                                                }));
                                                setNewTag({ name: '', code: '' });
                                            }
                                        }}
                                    >
                                        <CirclePlus className='hover:bg-green-500 rounded-4xl' />
                                    </button>
                                </div>

                                <ul className="space-y-1">
                                    {(quote.tag || []).map((tag, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between items-center bg-blue-700 rounded px-3 py-2"
                                        >
                                            <span>{tag.name} - {tag.code}</span>
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => {
                                                    const updatedTags = quote.tag.filter((_, i) => i !== index);
                                                    setQuote((prev) => ({ ...prev, tag: updatedTags }));
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </fieldset>
                        </div>

                        {/* Botón  y switch centrado */}
                        <div className="flex flex-col items-center pt-4 space-y-4">
                            <div className="flex">
                                <div className="ml-4 mr-4 flex items-center gap-4 ">
                                    <label className="text-sm font-medium text-white">Is Confirmed?</label>

                                    {/* Switch */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="isConfirmed"
                                            className="sr-only peer"
                                            checked={quote.isConfirmed}
                                            onChange={(e) =>
                                                setQuote((prev) => ({
                                                    ...prev,
                                                    isConfirmed: e.target.checked,
                                                }))
                                            }
                                        />
                                        {/* Track */}
                                        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors duration-300"></div>

                                        {/* Slider */}
                                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 pointer-events-none"></div>
                                    </label>

                                    <span className="text-sm text-white">{quote.isConfirmed ? "Yes" : "No"}</span>
                                </div>
                                <div className="ml-4 mr-4 flex items-center gap-4 ">
                                    <label className="text-sm font-medium text-white">Is a returning customer?</label>

                                    {/* Switch */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="isReturningCustomer"
                                            className="sr-only peer"
                                            checked={quote.isReturningCustomer}
                                            onChange={(e) =>
                                                setQuote((prev) => ({
                                                    ...prev,
                                                    isReturningCustomer: e.target.checked,
                                                }))
                                            }
                                        />
                                        {/* Track */}
                                        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors duration-300"></div>

                                        {/* Slider */}
                                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 pointer-events-none"></div>
                                    </label>

                                    <span className="text-sm text-white">{quote.isReturningCustomer ? "Yes" : "No"}</span>
                                </div>
                            </div>
                            <div>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                    Send Quote
                                </button>
                            </div>

                        </div>
                    </fieldset>
                </form>
            </motion.div>
        </div>
    );
}
