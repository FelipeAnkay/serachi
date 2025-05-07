import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useQuoteServices } from '../../store/quoteServices';
import { useAuthStore } from '../../store/authStore';
import { useCustomerServices } from '../../store/customerServices';
import { CircleX, Contact, Contact2, Search } from 'lucide-react';
import languagesList from '../../components/languages.json';
import { AnimatePresence } from 'framer-motion';
import { useProductServices } from '../../store/productServices';
import { CircleCheck } from 'lucide-react';

export default function NewQuote() {
    const [productList, setProductList] = useState([]);
    const { createQuote } = useQuoteServices();
    const storeId = Cookies.get('storeId');
    const { user } = useAuthStore();
    const [customerEditable, setCustomerEditable] = useState(false);
    const { getCustomerEmail, createCustomer } = useCustomerServices();
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [quote, setQuote] = useState({});
    const [customer, setCustomer] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getProductByStoreId, getProductById, removeProduct, updateProduct, createProduct } = useProductServices();
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [finalPrice, setFinalPrice] = useState();
    const [isSelected, setIsSelected] = useState();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProductByStoreId(storeId);
                console.log("ProductList Response: ", response);
                setProducts(response.productList);
                setLoading(false);
                console.log("ProductList: ", products);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        }
        if (storeId) {
            fetchProducts();
        }
    }, [storeId]);

    const handleProductSelected = (productId) => {

        const fetchSelectProducts = () => {
            setSelectedProductIds((prevSelected) => {
                let updatedSelected;
                if (prevSelected.includes(productId)) {
                    // Deseleccionar
                    updatedSelected = prevSelected.filter((id) => id !== productId);
                    setIsSelected(false)
                } else {
                    // Seleccionar
                    updatedSelected = [...prevSelected, productId];
                    setIsSelected(true)
                }

                // Actualiza el precio total
                const total = updatedSelected.reduce((sum, id) => {
                    const product = products.find((p) => p._id === id);
                    return sum + (product?.price || 0);
                }, 0);
                setFinalPrice(total);
            });
        }
        const fetchFinalPrice = () => {
            setQuote({ finalPrice: finalPrice })
            console.log("Datos de Quote", quote);
        }

        fetchSelectProducts();
        fetchFinalPrice();

    };


    const handleQuoteChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuote((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        console.log("El valor de value es:", value)
        setCustomer((prev) => ({
            ...prev,
            email: value,
        }));
        setQuote((prev) => ({
            ...prev,
            [name]: value,
        }));
        console.log("F: Datos de cliente", customer)
        console.log("F: Datos de quote", quote)
    };

    const handleCustomerEmailSearch = async () => {
        try {
            setCustomer({
                email: customer.email,
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
            const response = await getCustomerEmail(customer.email);
            const found = response.customerList;
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
                    })));
                //console.log("F: El cliente es:", customer);
                setCustomerEditable(false);
                setQuote({ customerEmail: found.email });
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
                className="flex flex-col w-full max-w-6xl mx-auto bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen"
            >
                <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">New Quote</h1>
                <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md shadow bg-blue">
                    {/* DATOS DE CLIENTE*/}
                    <fieldset className="border p-4 rounded bg-gray-800">
                        <legend className="font-semibold text-lg">Customer Details</legend>
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                name="customerEmail"
                                value={quote.customerEmail}
                                onChange={handleCustomerChange}
                                className="w-full border px-2 py-1 rounded"
                                placeholder="Email del cliente"
                            />
                            <button
                                type="button"
                                onClick={handleCustomerEmailSearch}
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
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                                        value={customer.diet || ''}
                                                        onChange={(e) => setCustomer({ ...customer, diet: e.target.value })}
                                                    />
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
                    <div>
                        <label>Fecha de Entrada</label>
                        <input type="date" name="dateIn" value={quote.dateIn} onChange={handleQuoteChange} className="w-full border px-2 py-1 rounded" />
                    </div>
                    <div>
                        <label>Fecha de Salida</label>
                        <input type="date" name="dateOut" value={quote.dateOut} onChange={handleQuoteChange} className="w-full border px-2 py-1 rounded" />
                    </div>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold">Product List</h2>
                        {products.length === 0 ? (
                            <p>No products found for this store.</p>
                        ) : (
                            products.map((product) => {
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-3 mr-3 mb-3">
                                    <div
                                        key={product._id}
                                        className={`border rounded-lg p-4 cursor-pointer bg-white hover:shadow transition relative ${isSelected ? 'border-green-500' : 'border-gray-300'
                                            }`}
                                        onClick={() => handleProductSelected(product._id)}
                                    >
                                        <h3 className="text-lg font-semibold">{product.name}</h3>
                                        <p className="text-sm text-gray-600">Price: ${product.price}</p>
                                        <p className="text-sm text-gray-600">Duration: {product.durationDays} days</p>
                                        {isSelected && (
                                            <CircleCheck className="absolute top-2 right-2 text-green-600" />
                                        )}

                                    </div>
                                </div>
                            }
                            )

                        )
                        }
                    </div>
                    <div>
                        <label>Discount</label>
                        <input type="number" name="discount" value={quote.discount} onChange={handleQuoteChange} className="w-full border px-2 py-1 rounded" />
                    </div>
                    <div>
                        <label>Final Price</label>
                        <input type="number" name="finalPrice" value={quote.finalPrice} onChange={handleQuoteChange} className="w-full border px-2 py-1 rounded" />
                    </div>

                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Save Quote
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
