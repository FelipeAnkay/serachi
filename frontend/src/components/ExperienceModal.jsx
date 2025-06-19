import { AnimatePresence, motion } from 'framer-motion'
import { CircleX, Contact2, Search } from 'lucide-react'
import countries from './contries.json'
import { useEffect, useState, useRef } from 'react';
import { useExperienceServices } from '../store/experienceServices';
import { useQuoteServices } from '../store/quoteServices';
import { useCustomerServices } from '../store/customerServices';
import toast from 'react-hot-toast';
import CustomerDetails from './CustomerDetail';
import DateRangePicker from './DateRangePicker';
import { formatDateShort } from './formatDateDisplay'
import Select from 'react-select';

export default function ExperienceModal({ isOpen, onClose, experience, setExperience, onSave, storeId, userEmail, created }) {
    const [customer, setCustomer] = useState({});
    const { createExperience } = useExperienceServices();
    const { getCustomerEmail, updateCustomer, createCustomer } = useCustomerServices();
    const { getConfirmedQuoteList, getQuoteByCustomerEmail } = useQuoteServices();
    const customerEmailRef = useRef(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [quoteList, setQuoteList] = useState([]);

    const [experiencePayload, setExperiencePayload] = useState({
        name: '',
        storeId: storeId,
        userEmail: userEmail,
        customerEmail: '',
        dateIn: '',
        dateOut: '',
        quoteId: '',
    });

    useEffect(() => {
        console.log("Entre a ExperienceModal: ", { storeId, userEmail })
        if (experience) {
            setExperiencePayload((prev) => ({
                ...prev,
                name: experience.name,
                storeId: experience.storeId,
                userEmail: experience.userEmail,
                customerEmail: experience.customerEmail,
                dateIn: experience.dateIn,
                dateOut: experience.dateOut,
                quoteId: experience.quoteId || ''
            }))
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const handleCustomerEmailSearch = async (customerEmail) => {
        console.log("El email en handleCustomerEmailSearch es: ", customerEmail);
        try {
            const response = await getCustomerEmail(customerEmail, storeId);
            const found = response.customerList;
            console.log("F: el found es:", found);
            if (found) {
                toast.success('Customer Found');
                //console.log("El cliente encontrdo es:", found)
                found.map((cust) => (
                    setCustomer({
                        _id: cust._id,
                        email: cust.email,
                        name: cust.name || '',
                        lastName: cust.lastName || '',
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
                setExperiencePayload((prev) => ({
                    ...prev,
                    customerEmail: found[0].email,
                }));
                const auxQuotes = await getQuoteByCustomerEmail(found[0].email, storeId);
                console.log("auxQuotes: ", auxQuotes);
                setQuoteList(auxQuotes.quote);
                setIsNew(false);
                setIsCustomerModalOpen(false);
            } else {
                toast.success('Customer not found, please create one');
                setCustomer({
                    _id: '',
                    email: customerEmail,
                    name: '',
                    lastName: '',
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
                setExperiencePayload((prev) => ({ ...prev, customerEmail: customerEmail }));
                const auxQuotes = await getConfirmedQuoteList(storeId);
                console.log("auxQuotes: ", auxQuotes);
                setQuoteList(auxQuotes.quote);
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

    const handleSaveClient = async (e) => {
        try {
            //console.log("F: El cliente es:", customer);
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
            //console.log("F: El cliente a CREAR o EDITAR es:", customerPayload);
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

    const handleCreateExperience = async () => {
        try {
            //console.log("experiencePayload: ", experiencePayload)
            const auxExp = await createExperience(experiencePayload)
            created();
            onClose();
            toast.success("Experience Created")
        } catch (error) {
            toast.error("Error Creating the experience")
        }
    };

    const handleSelectChange = (selectedOption) => {
        const selectedValue = selectedOption?.value || '';
        setExperiencePayload((prev) => ({
            ...prev,
            quoteId: selectedValue,
        }))
    };

    const quoteOptions = quoteList?.map((quote) => ({
        value: quote._id,
        label: `${quote.customerEmail} — ${formatDateShort(quote.dateIn)} to ${formatDateShort(quote.dateOut)} — $${quote.finalPrice}`
    }));

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
                        type="button"
                        className="absolute top-3 right-3 text-gray-300 hover:text-white"
                        onClick={onClose}
                    >
                        <CircleX />
                    </button>

                    <h2 className="text-xl font-bold mb-4 text-center text-white">Create Experience</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                ref={customerEmailRef}
                                type="email"
                                name="customerEmail"
                                value={experiencePayload.customerEmail}
                                onChange={(e) =>
                                    setExperiencePayload((prev) => ({
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
                        <div>
                            <label className="block text-sm font-medium">Experience Name</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 bg-white text-blue-950 rounded px-3 py-2 mt-1"
                                value={experiencePayload.name || ''}
                                onChange={(e) =>
                                    setExperiencePayload((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Dates:</label>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-full max-w-md mb-4">
                                    <label className="mb-2 block font-medium text-center">
                                        Date Range (Check-in / Check-out)
                                    </label>
                                    <div className="flex justify-center">
                                        <DateRangePicker
                                            value={{ start: experiencePayload.dateIn, end: experiencePayload.dateOut }}
                                            onChange={({ start, end }) =>
                                                setExperiencePayload((prev) => ({
                                                    ...prev,
                                                    dateIn: start,
                                                    dateOut: end
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {(quoteList?.length>0) && (
                            <div>
                                <label className="block text-sm font-medium">Associate Quote (if its needed)</label>
                                <Select
                                    options={quoteOptions}
                                    onChange={handleSelectChange}
                                    placeholder="Select or search a quote..."
                                    className="text-blue-950"
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            backgroundColor: '#ffffff',
                                            color: '#0f172a',
                                            borderColor: '#d1d5db',
                                            fontSize: '0.875rem',
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: '#0f172a',
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: '#0f172a',
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 50,
                                            backgroundColor: '#ffffff',
                                            color: '#0f172a',
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? '#e2e8f0' : '#ffffff',
                                            color: '#0f172a',
                                            cursor: 'pointer',
                                        }),
                                    }}
                                />
                            </div>
                        )}
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full mt-4"
                            type="button"
                            onClick={handleCreateExperience}
                        >
                            Create Experience
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    )
}