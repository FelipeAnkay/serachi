import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleX, Delete, Save, Trash2, UserPlus } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useStaffServices } from '../../store/staffServices';
import languagesList from '../../components/languages.json'
import countries from '../../components/contries.json'


const SetStaff = () => {
    const { getStaffList, createStaff, updateStaff, getStaffEmail, removeStaff } = useStaffServices();
    const storeId = Cookies.get('storeId');
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [staffData, setStaffData] = useState({});
    const [emailCheckPhase, setEmailCheckPhase] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const staff = await getStaffList(storeId);
                setStaffList(staff.staffList || []);
            } catch (error) {
                console.error('Error fetching staff list:', error);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchStaff();
            //console.log("La lista de staff es: ", staffList)
        }
    }, []);

    useEffect(() => {
        //console.log("El staffData es: ", staffData)
    }, [staffData]);


    useEffect(() => {
        if (!modalOpen) return; // solo activa listener si el modal está abierto

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closeModal(); // tu función para cerrar el modal
            }
        };
        window.addEventListener('keydown', handleEsc);
        // Cleanup: remover listener cuando modal se cierra o componente desmonta
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [modalOpen]); // se ejecuta cuando cambia modalOpen

    const openNewStaffModal = () => {
        setStaffData({ email: '' });
        setEmailCheckPhase(true);
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditStaffModal = (staff) => {
        //console.log("El staff es: ", staff)
        setStaffData({
            ...staff,
            birthdate: staff.birthdate ? new Date(staff.birthdate).toISOString().slice(0, 10) : '',
            languages: Array.isArray(staff.languages) ? staff.languages : [],
            professionalCertificates: Array.isArray(staff.professionalCertificates)
                ? staff.professionalCertificates
                : [],
        });
        setIsEditing(true);
        setEmailCheckPhase(false);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDelete(null);
    };
    const handleEmailCheck = async () => {
        if (!staffData.email) return;

        try {
            const res = await getStaffEmail(staffData.email, storeId);
            const staffFound = res.staffList?.[0];
            console.log("handleEmailCheck staffFound:", staffFound);
            if (staffFound) {
                const alreadyAssigned = staffFound.storeId?.includes(storeId.toUpperCase());
                const updatedStoreId = alreadyAssigned
                    ? staffFound.storeId
                    : [...new Set([...staffFound.storeId, storeId.toUpperCase()])];
                setStaffData({
                    ...staffFound,
                    storeId: updatedStoreId,
                    birthdate: staffFound.birthdate ? new Date(staffFound.birthdate).toISOString().slice(0, 10) : '',
                    professionalCertificates: Array.isArray(staffFound.professionalCertificates) ? staffFound.professionalCertificates : [],
                    languages: Array.isArray(staffFound.languages) ? staffFound.languages : [],
                });
                //console.log("F: Idioma del staff encontrado", staffFound.languages);
                setIsEditing(true);
                toast.success('Staff founded');
            } else {
                toast.success("Staff not found, you can assign a new staff");
                setIsEditing(false);
            }

            setEmailCheckPhase(false); // Pasar al formulario completo
        } catch (err) {
            console.error("Error checking staff by email:", err);
            toast.error("Error checking email");
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...staffData,
                birthdate: staffData.birthdate ? new Date(staffData.birthdate) : null,
                languages: staffData.languages,
                professionalCertificates: staffData.professionalCertificates,
                storeId: storeId,
            };
            //console.log("Is Editing? ", isEditing);
            //console.log("El payload es: ", payload);
            if (isEditing) {
                await updateStaff(staffData.email, storeId, payload);
                toast.success('Staff updated successfully');
            } else {
                await createStaff(payload);
                toast.success('Staff created successfully');
            }

            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error saving staff:', error);
            toast.error('Error saving staff');
        }
    };

    const confirmRemove = async () => {
        try {
            await removeStaff(confirmDelete.email, storeId);
            toast.success(`Staff ${confirmDelete.email} removed from store.`);
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error removing staff:', error);
            toast.error('Error removing staff');
        }
    };

    if (loading) return <div className="text-slate-800 text-center mt-10">Loading staff...</div>;

    return (
            <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
                >
                <h2 className="text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text">
                    Staff List
                </h2>

                <div className="flex flex-col items-center gap-3 mb-4">
                    <button
                        className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewStaffModal}
                    >
                        <p>Add Staff</p><UserPlus />
                    </button>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 rounded bg-white text-slate-900 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>


                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 ml-3 mr-3 mb-3 w-full">
                    {staffList.length === 0 ? (
                        <div className="text-center text-gray-400 col-span-full">No staff members found</div>
                    ) : (
                        staffList
                            .filter(staff => {
                                const term = searchTerm.toLowerCase();
                                return (
                                    staff.name?.toLowerCase().includes(term) ||
                                    staff.email?.toLowerCase().includes(term)
                                );
                            })
                            .map((staff) => (
                                <div
                                    key={staff._id}
                                    className="relative text-black rounded-lg shadow p-4 hover:bg-blue-100 transition-all"
                                    style={{ backgroundColor: staff.color || '#6b7280' }}
                                >
                                    <div onClick={() => openEditStaffModal(staff)}>
                                        <p><strong>Name:</strong> {staff.name}</p>
                                        <p><strong>Email:</strong> {staff.email}</p>
                                        <p><strong>Phone:</strong> {staff.phone || 'N/A'}</p>
                                        <p><strong>Languages:</strong> {staff.languages.join(', ')}</p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({ email: staff.email })}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                        title="Remove from Store"
                                    >
                                        <Trash2 />
                                    </button>
                                </div>
                            ))
                    )}
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>

                {(modalOpen || confirmDelete) && (
                    <motion.div
                        className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {confirmDelete ? (
                            <motion.div
                                className="bg-sky-50 text-slate-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-xl font-bold mb-6 text-center text-red-400">
                                    Do you really want to remove {confirmDelete.email} from the Store?
                                </h3>
                                <div className="flex justify-around">
                                    <button
                                        className="bg-red-400 hover:bg-red-500 text-slate-800 px-4 py-2 rounded"
                                        onClick={confirmRemove}
                                    >
                                        Yes, Remove
                                    </button>
                                    <button
                                        className="bg-gray-700 hover:bg-gray-600 text-slate-800 px-4 py-2 rounded"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="bg-sky-50 text-slate-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-slate-800"
                                    onClick={closeModal}
                                >
                                    <CircleX />
                                </button>

                                <h3 className="text-2xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text">
                                    {isEditing ? 'Edit Staff' : 'New Staff'}
                                </h3>

                                {emailCheckPhase ? (
                                    <div className="space-y-4">
                                        <label>Email del Staff:</label>
                                        <input
                                            type="email"
                                            className="bg-white text-slate-900 border border-slate-300 rounded w-full p-2"
                                            value={staffData.email || ''}
                                            onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                                        />
                                        <button
                                            className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded w-full mt-4"
                                            onClick={handleEmailCheck}
                                        >
                                            {isEditing ? 'Continue' : 'Staff Search'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <label className="">Name:</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                                value={staffData.name || ''}
                                                onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="">Phone (+Country Code-Phone):</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                                value={staffData.phone || ''}
                                                onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="">Birthdate:</label>
                                            <input
                                                type="date"
                                                className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                                value={staffData.birthdate || ''}
                                                onChange={(e) => setStaffData({ ...staffData, birthdate: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="capitalize">National Id or Passport:</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 mt-1 bg-white text-slate-900 border border-slate-300 rounded"
                                                value={staffData.nationalId || ''}
                                                onChange={(e) => setStaffData({ ...staffData, nationalId: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Country</label>
                                            <select
                                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 mt-1"
                                                value={staffData.country}
                                                onChange={(e) =>
                                                    setStaffData({
                                                        ...staffData,
                                                        country: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="" className="text-slate-900">Select Country</option>
                                                {countries.map((c) => (
                                                    <option key={c.code} value={c.name} className='text-slate-900'>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Speaking Languages:</label>
                                            <div className="space-y-2">
                                                {languagesList.map((lang) => (
                                                    <label key={lang.code} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            value={lang.code}
                                                            checked={staffData.languages?.includes(lang.code) || false}
                                                            onChange={(e) => {
                                                                const currentLanguages = Array.isArray(staffData.languages) ? staffData.languages : [];
                                                                const selected = currentLanguages.includes(lang.code)
                                                                    ? currentLanguages.filter((code) => code !== lang.code)
                                                                    : [...currentLanguages, lang.code];
                                                                setStaffData({ ...staffData, languages: selected });
                                                            }}
                                                            className="accent-blue-500"
                                                        />
                                                        <span>{lang.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold">Professional Certificates</h4>
                                            {(staffData.professionalCertificates || []).map((cert, certIndex) => (
                                                <div
                                                    key={certIndex}
                                                    className="border border-gray-700 rounded-lg p-4 relative space-y-2 bg-gray-800"
                                                >
                                                    {/* Botón de eliminación */}
                                                    <button
                                                        type="button"
                                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                                        onClick={() => {
                                                            const updated = staffData.professionalCertificates.filter((_, i) => i !== certIndex);
                                                            setStaffData({ ...staffData, professionalCertificates: updated });
                                                        }}
                                                    >
                                                        Delete
                                                    </button>

                                                    {/* Campos de certificado */}
                                                    {[
                                                        { key: "organization", label: "Organization" },
                                                        { key: "certificateName", label: "Certificate Name" },
                                                        { key: "certificateId", label: "Certificate ID" },
                                                    ].map(({ key, label }) => (
                                                        <div key={key}>
                                                            <label className="block text-sm font-medium text-slate-800">{label}:</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 mt-1 rounded bg-gray-700 text-slate-800"
                                                                value={cert[key] || ""}
                                                                onChange={(e) => {
                                                                    const updated = [...staffData.professionalCertificates];
                                                                    updated[certIndex][key] = e.target.value;
                                                                    setStaffData({ ...staffData, professionalCertificates: updated });
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className="bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-4 py-2 rounded mt-4"
                                                onClick={() => {
                                                    const updated = [...(staffData.professionalCertificates || [])];
                                                    updated.push({ organization: '', certificateName: '', certificateId: '' });
                                                    setStaffData({ ...staffData, professionalCertificates: updated });
                                                }}
                                            >
                                                Add Certificate
                                            </button>
                                        </div>

                                        <div className="flex justify-center mt-6 flex-col items-center gap-4">
                                            {/* Selector de color */}
                                            <div className="flex items-center gap-4">
                                                <label htmlFor="colorPicker" className="text-slate-800 font-medium">Staff Color:</label>
                                                <input
                                                    id="colorPicker"
                                                    type="color"
                                                    value={staffData.color || '#6b7280'}
                                                    onChange={(e) => setStaffData({ ...staffData, color: e.target.value })}
                                                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-center mt-6">
                                            <button
                                                className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded flex items-center gap-2"
                                                onClick={handleSave}
                                            >
                                                <p>Save</p><Save />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SetStaff;