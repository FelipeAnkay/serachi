import { AnimatePresence, motion } from 'framer-motion'
import { CircleX } from 'lucide-react'
import dietaryList from './dietaryList.json';
import languagesList from './languages.json';
import countries from './contries.json'
import { useEffect, useState } from 'react';

export default function CustomerDetails({ isOpen, onClose, customer, setCustomer, onSave }) {
    const [customCountry, setCustomCountry] = useState('');
    const [countrySelectValue, setCountrySelectValue] = useState(customer.country || '');
    const [genderSelectValue, setGenderSelectValue] = useState(customer.gender || '');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])


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

                    <h2 className="text-xl font-bold mb-4 text-center text-white">Customer</h2>
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
                            <label className="block text-sm font-medium">Last Name</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                value={customer.lastName || ''}
                                onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
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
                            <label className="block text-sm font-medium">Gender</label>
                            <select
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                value={customer.gender || ''}
                                onChange={(e) => setCustomer({ ...customer, gender: e.target.value })}
                            >
                                <option value="" className="text-blue-950">Select Gender</option>
                                <option key="FEM" value="Female" className='text-blue-950'>Female</option>
                                <option key="MAL" value="Male" className='text-blue-950'>Male</option>
                            </select>

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
                                value={customer.birthdate?.slice(0, 10) || ''}
                                onChange={(e) => setCustomer({ ...customer, birthdate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">National Id or Passport</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                value={customer.nationalId || ''}
                                onChange={(e) => setCustomer({ ...customer, nationalId: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Country</label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
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
                                <option value="" className="text-blue-950">Select Country</option>
                                {countries.map((c) => (
                                    <option key={c.code} value={c.name} className='text-blue-950'>{c.name}</option>
                                ))}
                            </select>

                            {countrySelectValue === "Others" && (
                                <input
                                    type="text"
                                    placeholder="Enter your country"
                                    className="w-full mt-2 border border-gray-300 rounded px-3 py-2"
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
                            <label className="block text-sm font-medium">Allergies</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                value={customer.allergies || ''}
                                onChange={(e) => setCustomer({ ...customer, allergies: e.target.value })}
                            />
                        </div>
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
                                    <div key="organization">
                                        <label className="">Certifying Organization:</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
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
                                            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
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
                                                className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
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
                            onClick={onSave}
                        >
                            Save Customer
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}