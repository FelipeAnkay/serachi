import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQuoteServices } from '../../store/quoteServices';
import { useAuthStore } from '../../store/authStore';
import { useCustomerServices } from '../../store/customerServices';
import { CircleX, Contact, Contact2, QuoteIcon, Search } from 'lucide-react';
import languagesList from '../../components/languages.json';
import sourceList from '../../components/sourceList.json';
import dietaryList from '../../components/dietaryList.json';
import { AnimatePresence } from 'framer-motion';
import { useProductServices } from '../../store/productServices';
import { CircleCheck } from 'lucide-react';
import { usePartnerServices } from '../../store/partnerServices';

export default function NewQuote() {
    const { createQuote } = useQuoteServices();
    const storeId = Cookies.get('storeId');
    const { user } = useAuthStore();
    const [customerEditable, setCustomerEditable] = useState(false);
    const { getCustomerEmail, createCustomer } = useCustomerServices();
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [quote, setQuote] = useState({});
    const [customer, setCustomer] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getProductByStoreId, getProductById, removeProduct, updateProduct, createProduct } = useProductServices();
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [finalPrice, setFinalPrice] = useState();
    const [productSearch, setProductSearch] = useState("");
    const customerEmailRef = useRef(null);
    const { getPartnerList } = usePartnerServices();
    const [partners, setPartners] = useState([]);

    useEffect(() => {
        console.log("El user es: ", user.email)
        setQuote({
            userEmail: user.email,
            storeId: storeId,
        })
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
    }, []);
    useEffect(() => {
        console.log("F: El cliente actual es:", customer);
    }, [customer]);
    useEffect(() => {
        console.log("F: Los datos de quote son: ", quote);
    }, [quote]);

    const handleProductSelected = (productId) => {
        setSelectedProductIds((prevSelected = []) => {
            let updatedSelected;

            if (prevSelected.includes(productId)) {
                // Deseleccionar producto
                updatedSelected = prevSelected.filter((id) => id !== productId);
            } else {
                // Seleccionar producto
                updatedSelected = [...prevSelected, productId];
            }
            // Calcular precio total con los productos seleccionados
            const total = updatedSelected.reduce((sum, id) => {
                const product = products.find((p) => p._id === id);
                return sum + (product?.price || 0);
            }, 0);

            // Actualizar el estado del precio final
            setFinalPrice(total);

            // Actualizar el estado de la cotización con el nuevo precio
            setQuote((prevQuote) => ({
                ...prevQuote,
                finalPrice: total,
                productList: updatedSelected,
            }));
            console.log("Los datos de quote en handleProductSelected son: ", quote);
            return updatedSelected;
        });
    };


    const handleQuoteChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log("Los datos en handleQuoteChange de las const son: ", name, " - ", value, " - ", type, " - ", checked);
        setQuote((prev) => ({
            ...prev,
            [name]: value,
        }));
        console.log("Los datos de quote en handleQuoteChange son: ", quote);
    };

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({
            ...prev,
            email: value,
        }));
        setQuote((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCustomerEmailSearch = async (customerEmail) => {
        console.log("El email en handleCustomerEmailSearch es: ", customerEmail);
        try {
            const response = await getCustomerEmail(customerEmail);
            const found = response.customerList;
            console.log("F: el found es:", found);
            if (found) {
                toast.success('Customer Found');
                //console.log("El cliente encontrdo es:", found)
                found.map((cust) => (
                    setCustomer({
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
                setCustomerEditable(false);
                setQuote((prev) => ({
                    ...prev,
                    customerEmail: found[0].email,
                }));
                setIsNew(false);
                setIsCustomerModalOpen(false);
            } else {
                toast.error('Cliente no encontrado, puedes completar sus datos');
                setCustomerEditable(true);
                setQuote((prev) => ({ ...prev, customerEmail: customer.email }));
                setIsNew(true);
                setIsCustomerModalOpen(true);
            }
        } catch (err) {
            toast.success('Please create a customer');
            setCustomerEditable(true);
            setIsCustomerModalOpen(true);
        }
    };

    const handleSubmit = async (e) => {

        if (!quote.dateIn || !quote.dateOut || !quote.customerEmail || !quote.storeId || !quote.userEmail) {
            toast.error('Por favor completa los campos obligatorios.');
            return;
        }

        try {

            await createQuote(quote);
            toast.success('Cotización creada correctamente');

            setQuote({
                dateIn: '',
                dateOut: '',
                customerEmail: '',
                storeId: '',
                roomId: '',
                partnerId: '',
                productList: [],
                discount: 0,
                finalPrice: 0,
                currency: 'USD',
                isConfirmed: false,
                isReturningCustomer: false,
                tag: [],
                userEmail: '',
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

            setCustomerEditable(false);
        } catch (err) {
            toast.error('Error al guardar la cotización');
        }
    };


    const handleSaveClient = async (e) => {
        try {
            if (customerEditable) {
                const customerPayload = {
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
                //console.log("F: El cliente a crear es:", customerPayload);
                await createCustomer(customerPayload);
                toast.success('Customer created');
                setIsNew(false);
                setNewCustomerEmail(customer.email);
                setIsCustomerModalOpen(false);
            }
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
                className="flex flex-col w-full max-w-8xl mx-auto bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen"
            >
                <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">New Quote</h1>
                <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md shadow bg-blue ml-2 mr-2 mb-2">
                    {/* DATOS DE CLIENTE*/}
                    <fieldset className="border p-4 rounded bg-gray-800">
                        <legend className="font-semibold text-lg">Customer Details</legend>
                        <div className="flex items-center gap-2">
                            <input
                                ref={customerEmailRef}
                                type="email"
                                name="customerEmail"
                                value={quote.customerEmail}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCustomerEmailSearch(customerEmailRef.current.value);
                                    }
                                }}
                                className="w-full border px-2 py-1 rounded"
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
                            <AnimatePresence>
                                {isCustomerModalOpen && (
                                    <motion.div
                                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full max-h"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <motion.div
                                            className="bg-blue-900 rounded-2xl p-6 max-w-lg w-[90%] h-[90%] overflow-y-auto relative"
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <button
                                                type='button'
                                                className="absolute top-3 right-3 text-gray-600 hover:text-black"
                                                onClick={() => setIsCustomerModalOpen(false)}
                                            >
                                                <CircleX />
                                            </button>

                                            <h2 className="text-xl font-bold mb-4 text-center text-white">Cliente</h2>

                                            {/* Aquí colocas tu formulario de cliente completo */}
                                            <div className="space-y-4">
                                                {/* Ejemplo de campo: */}
                                                <div>
                                                    <label className="block text-sm font-medium">Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                        value={customer.name || ''}
                                                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">Email</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                        value={customer.email || ''}
                                                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">Phone</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                        value={customer.phone || ''}
                                                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">Birthdate</label>
                                                    <input
                                                        type="date"
                                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                        value={customer.birthdate || ''}
                                                        onChange={(e) => setCustomer({ ...customer, birthdate: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">National ID</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                        value={customer.nationalId || ''}
                                                        onChange={(e) => setCustomer({ ...customer, nationalId: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">Dietary Restriction</label>
                                                    <select
                                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                        value={customer.diet || ''}
                                                        onChange={(e) => setCustomer({ ...customer, diet: e.target.value })}
                                                    >
                                                        <option value="" className='text-blue-950'>Select Diet</option>
                                                        {dietaryList.map((item, index) => (
                                                            <option key={index} value={item.name} className='text-blue-950'>
                                                                {item.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">Country</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                        value={customer.country || ''}
                                                        onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                                                    />
                                                </div>
                                                <select
                                                    multiple
                                                    value={customer.languages}
                                                    onChange={(e) =>
                                                        setCustomer({
                                                            ...customer,
                                                            languages: Array.from(e.target.selectedOptions, option => option.value),
                                                        })
                                                    }
                                                    className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                                >
                                                    {languagesList.map((lang) => (
                                                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                                                    ))}
                                                </select>
                                                <div className="space-y-4 mt-6">
                                                    <h3 className="text-lg font-semibold  text-white">
                                                        Emergency Contact:
                                                    </h3>

                                                    <div>
                                                        <label className="block text-sm font-medium  text-white">Name:</label>
                                                        <input
                                                            type="text"
                                                            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                            value={customer.emergencyContactName || ''}
                                                            onChange={(e) =>
                                                                setCustomer({
                                                                    ...customer,
                                                                    emergencyContactName: e.target.value,

                                                                })
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium  text-white">Phone</label>
                                                        <input
                                                            type="text"
                                                            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                            value={customer.emergencyContactPhone || ''}
                                                            onChange={(e) =>
                                                                setCustomer({
                                                                    ...customer,
                                                                    emergencyContactPhone: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-bold">Diving Certificates</h4>
                                                    {(customer.divingCertificates || []).map((cert, certIndex) => (
                                                        <div key={certIndex} className="border border-gray-700 rounded-lg p-4 relative space-y-2 bg-gray-800">
                                                            <button
                                                                type="button"
                                                                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                                                onClick={() => {
                                                                    const updated = customer.divingCertificates.filter((_, i) => i !== certIndex);
                                                                    setCustomer({ ...customer, divingCertificates: updated });
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                            {["organization", "certificateName", "certificateId"].map((key) => (
                                                                <div key={key}>
                                                                    <label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
                                                                        value={cert[key] || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...customer.divingCertificates];
                                                                            updated[certIndex][key] = e.target.value;
                                                                            setCustomer({ ...customer, divingCertificates: updated });
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4"
                                                        onClick={() => {
                                                            const updated = [...(customer.divingCertificates || [])];
                                                            updated.push({ organization: '', certificateName: '', certificateId: '' });
                                                            setCustomer({ ...customer, divingCertificates: updated });
                                                        }}
                                                    >
                                                        Add Certificate
                                                    </button>
                                                </div>

                                                <button
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full mt-4"
                                                    type="button"
                                                    onClick={handleSaveClient}
                                                >
                                                    Save Customer
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </fieldset>
                    {/* DATOS DE COTIZACION*/}
                    <div className='flex'>
                        <div className="w-1/2 pr-2">
                            <label>Fecha de Entrada</label>
                            <input type="date" name="dateIn"
                                value={quote.dateIn}
                                onChange={handleQuoteChange}
                                className="w-full border px-2 py-1 rounded"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                        </div>
                        <div className="w-1/2">
                            <label>Fecha de Salida</label>
                            <input type="date" name="dateOut"
                                value={quote.dateOut}
                                onChange={handleQuoteChange}
                                className="w-full border px-2 py-1 rounded"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Add logic if we want to do something when enter is pressed
                                    }
                                }}
                            />
                        </div>
                    </div>
                    {/* DATOS DE PRODUCTOS Y PRECIOS */}
                    <div className="flex gap-6 px-6">
                        {/* DATOS DE PRODUCTOS*/}
                        <div className="flex-grow space-y-4">
                            <h2 className="text-2xl font-bold">Product List</h2>
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
                                            const isSelected = selectedProductIds.includes(product._id);
                                            return (
                                                <div
                                                    key={product._id}
                                                    className={`border rounded-lg p-2 cursor-pointer hover:shadow transition relative ${isSelected ? ' bg-green-100 border-green-500 border-2 ' : 'border-gray-300 bg-blue-100'
                                                        }`}
                                                    onClick={() => handleProductSelected(product._id)}
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">{product.name} - { product.durationDays ? product.durationDays + ' days -' : '' }  ${product.price}</h3>
                                                    {isSelected && (
                                                        <CircleCheck className="absolute top-2 right-2 text-green-600" />
                                                    )}

                                                </div>

                                            );
                                        })
                                )}
                            </div>
                        </div>
                        {/* Price Column */}
                        <div className="w-64 space-y-4 bg-blue-950 rounded-2xl">
                            <div className="ml-4 mr-4 mt-4">
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
                                        if(selected !== 'Other'){
                                            updatedQuote.customSource = '';
                                        }
                                        if(selected !== 'Partner'){
                                            updatedQuote.partnerId = '';
                                        }
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
                            {/* Condicional: mostrar input si el source es "Other" */}
                            {quote.source === 'Other' && (
                                <div className="ml-4 mr-4">
                                    <label className="block text-sm font-medium text-white">Specify Source</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                                        placeholder="Enter custom source"
                                        value={quote.customSource || ''}
                                        onChange={(e) =>
                                            setQuote((prev) => ({
                                                ...prev,
                                                customSource: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            )}
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
                            <div className="ml-4 mr-4 flex flex-col items-center justify-center">
                                <label className=" text-white font-bold text-2xl">Final Price: ${quote.finalPrice}</label>
                            </div>
                            <div className="flex justify-center">
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                    Save Quote
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
