import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import dietaryList from '../../components/dietaryList.json';
import languagesList from '../../components/languages.json';
import countries from '../../components/contries.json'
import toast from 'react-hot-toast';
import { useCustomerServices } from '../../store/customerServices';
import { useFormServices } from '../../store/formServices';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useStoreServices } from '../../store/storeServices';


const SetCustomerView = () => {
    const { getDataToken } = useFormServices();
    const { getCustomerEmail, updateCustomer } = useCustomerServices();
    const { getStoreById } = useStoreServices();
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState({});
    const [originalEmail, setOriginalEmail] = useState('')
    const [auxStore, setAuxStore] = useState({});
    const [searchParams] = useSearchParams();
    const [customCountry, setCustomCountry] = useState('');
    const [countrySelectValue, setCountrySelectValue] = useState(customer.country || '');
    const [isRegistered, setIsRegistered] = useState(false)


    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            //window.location.href = '/unauthorized';
            return;
        }

        const fetchTokenData = async () => {
            try {
                setLoading(true)
                const today = new Date().toISOString().split('T')[0];
                const res = await getDataToken(token);
                const { customerEmail, endDate, storeId } = res.urlData;
                //console.log("endDate es: ", endDate)
                //console.log("today es: ", today)
                if (!customerEmail || !storeId || !(endDate >= today)) {
                    window.location.href = '/unauthorized';
                }
                setOriginalEmail(customerEmail)
                const xStore = await getStoreById(storeId)
                //console.log("xStore: ", xStore)
                setAuxStore(xStore.store);
                const auxCustomer = await getCustomerEmail(customerEmail, storeId)
                //console.log("auxCustomer: ", auxCustomer)
                if (auxCustomer.success) {
                    setIsRegistered(true)
                    setCustomer(auxCustomer.customerList[0])
                }

            } catch (error) {
                console.error('Error getting token data:', error);
                //window.location.href = '/unauthorized';
            } finally {
                setLoading(false)
            }
        };

        fetchTokenData();
    }, [searchParams]);


    const handleSave = async () => {
        //console.log('Saving store:', store)
        try {
            /*
                        console.log("Los datos del cliente son: ", {
                            customer,
                            auxStore
                        })
            */
            if (!isRegistered) {
                toast.error('Customer not registered');
                return;
            }
            if (customer.email.toLowerCase() !== originalEmail.toLowerCase()) {
                toast.error('The email needs to match with the registered one');
                return;
            }
            await updateCustomer(customer.email, auxStore.storeId, customer)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Customer updated successfully")
        } catch (error) {
            //console.log("Error updating store: ", error)
            toast.error("Error updating the Customer")
        }
    }

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
                    <h2 className="text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text">
                        Customer Detail
                    </h2>
                    <motion.div
                        className="bg-sky-50 text-slate-800 rounded-2xl shadow-2xl p-8 w-[90%] relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                    value={customer.name || ''}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                    value={customer.lastName || ''}
                                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                    value={customer.email || ''}
                                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Gender</label>
                                <select
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                    value={customer.gender || ''}
                                    onChange={(e) => setCustomer({ ...customer, gender: e.target.value })}
                                >
                                    <option value="" className="text-slate-900">Select Gender</option>
                                    <option key="FEM" value="Female" className='text-slate-900'>Female</option>
                                    <option key="MAL" value="Male" className='text-slate-900'>Male</option>
                                </select>

                            </div>
                            <div>
                                <label className="block text-sm font-medium">Phone</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                    value={customer.phone || ''}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Birthdate</label>
                                <input
                                    type="date"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                    value={customer.birthdate?.slice(0, 10) || ''}
                                    onChange={(e) => setCustomer({ ...customer, birthdate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">National Id or Passport</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                    value={customer.nationalId || ''}
                                    onChange={(e) => setCustomer({ ...customer, nationalId: e.target.value })}
                                />
                            </div>
                            {!auxStore?.shortCustomerProfile && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium">Country</label>
                                        <select
                                            className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                            value={countrySelectValue}
                                            onChange={(e) => {
                                                const selected = e.target.value;
                                                setCountrySelectValue(selected);
                                                if (selected !== "Others") {
                                                    setCustomer({ ...customer, country: selected });
                                                    setCustomCountry('');
                                                } else {
                                                    setCustomer({ ...customer, country: '' });
                                                }
                                            }}
                                        >
                                            <option value="" className="bg-white text-slate-900">Select Country</option>
                                            {countries.map((c) => (
                                                <option key={c.code} value={c.name} className='bg-white text-slate-900'>{c.name}</option>
                                            ))}
                                        </select>

                                        {countrySelectValue === "Others" && (
                                            <input
                                                type="text"
                                                placeholder="Enter your country"
                                                className="w-full mt-2 bg-white text-slate-900 border border-slate-300 rounded px-3 py-2"
                                                value={customCountry}
                                                onChange={(e) => {
                                                    setCustomCountry(e.target.value);
                                                    setCustomer({ ...customer, country: e.target.value });
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Dietary Restriction</label>
                                        <select
                                            className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                            value={customer.diet || ''}
                                            onChange={(e) => setCustomer({ ...customer, diet: e.target.value })}
                                        >
                                            <option value="" className='bg-white text-slate-900'>Select Diet</option>
                                            {dietaryList.map((item, index) => (
                                                <option key={index} value={item.name} className='bg-white text-slate-900'>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Allergies</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                            value={customer.allergies || ''}
                                            onChange={(e) => setCustomer({ ...customer, allergies: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-2">Languages:</label>
                                <div className="space-y-2">
                                    {languagesList.map((lang) => (
                                        <label key={lang.code} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                value={lang.code}
                                                checked={(customer.languages || []).includes(lang.code)}
                                                onChange={(e) => {
                                                    const currentLanguages = customer.languages || [];
                                                    const updatedLanguages = currentLanguages.includes(lang.code)
                                                        ? currentLanguages.filter((code) => code !== lang.code)
                                                        : [...currentLanguages, lang.code];
                                                    setCustomer({ ...customer, languages: updatedLanguages });
                                                }}
                                                className="accent-blue-500"
                                            />
                                            <span>{lang.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4 mt-6">
                                <h3 className="text-lg font-semibold  text-slate-800">
                                    Emergency Contact:
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium  text-slate-800">Name:</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
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
                                    <label className="block text-sm font-medium  text-slate-800">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
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
                                        <div key="organization">
                                            <label className="">Certifying Organization:</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 rounded bg-white text-slate-900"
                                                value={cert["organization"] || ''}
                                                onChange={(e) => {
                                                    const updated = [...customer.divingCertificates];
                                                    updated[certIndex]["organization"] = e.target.value;
                                                    setCustomer({ ...customer, divingCertificates: updated });
                                                }}
                                            />
                                        </div>
                                        <div key="certificateName">
                                            <label>Certification Level:</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 rounded bg-white text-slate-900"
                                                value={cert["certificateName"] || ''}
                                                onChange={(e) => {
                                                    const updated = [...customer.divingCertificates];
                                                    updated[certIndex]["certificateName"] = e.target.value;
                                                    setCustomer({ ...customer, divingCertificates: updated });
                                                }}
                                            />
                                        </div>
                                        <div key="certificateId">
                                            <label>ID Number:</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 rounded bg-white text-slate-900"
                                                value={cert["certificateId"] || ''}
                                                onChange={(e) => {
                                                    const updated = [...customer.divingCertificates];
                                                    updated[certIndex]["certificateId"] = e.target.value;
                                                    setCustomer({ ...customer, divingCertificates: updated });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-4 py-2 rounded mt-4"
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
                                className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4"
                                type="button"
                                onClick={handleSave}
                            >
                                Save Customer
                            </button>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </>
    );
};

export default SetCustomerView;