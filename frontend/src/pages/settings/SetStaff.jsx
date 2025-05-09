import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleX, Delete, Save, Trash2, UserPlus } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useStaffServices } from '../../store/staffServices';
import languagesList from '../../components/languages.json'

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
        }
    }, []);


    const openNewStaffModal = () => {
        setStaffData({ email: '' });
        setEmailCheckPhase(true);
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEditStaffModal = (staff) => {
        setStaffData({
            ...staff,
            birthdate: staff.birthdate ? new Date(staff.birthdate).toISOString().slice(0, 10) : '',
            languages: Array.isArray(staff.languages) ? staff.languages : [],
            professionalCertificates: Array.isArray(staff.professionalCertificates) ? staff.professionalCertificates.map((certArray) => certArray[0]) : [],
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
            const res = await getStaffEmail(staffData.email);
            const staffFound = res.staffList?.[0];

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
                console.log("F: Idioma del staff encontrado", staffFound.languages);
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

    if (loading) return <div className="text-white text-center mt-10">Cargando staff...</div>;

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-950 text-white px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-8xl mx-auto bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden"
            >
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                    Staff List
                </h2>

                <div className="flex flex-col items-center gap-3 mb-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
                        onClick={openNewStaffModal}
                    >
                        <p>Add Staff</p><UserPlus />
                    </button>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>


                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-3 mr-3 mb-3">
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
                                    className="relative bg-white text-black rounded-lg shadow p-4 hover:bg-blue-100 transition-all"
                                >
                                    <div onClick={() => openEditStaffModal(staff)}>
                                        <p><strong>Name:</strong> {staff.name}</p>
                                        <p><strong>Email:</strong> {staff.email}</p>
                                        <p><strong>Phone:</strong> {staff.phone || 'N/A'}</p>
                                        <p><strong>Languages:</strong> {staff.languages.join(', ')}</p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({ email: staff.email })}
                                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {confirmDelete ? (
                            <motion.div
                                className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative"
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
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                        onClick={confirmRemove}
                                    >
                                        Yes, Remove
                                    </button>
                                    <button
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 scrollbar-thumb-rounded-full"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                    onClick={closeModal}
                                >
                                    <CircleX />
                                </button>

                                <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                                    {isEditing ? 'Edit Staff' : 'New Staff'}
                                </h3>

                                {emailCheckPhase ? (
                                    <div className="space-y-4">
                                        <label>Email del Staff:</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 rounded bg-gray-800 text-white"
                                            value={staffData.email || ''}
                                            onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                                        />
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mt-4"
                                            onClick={handleEmailCheck}
                                        >
                                            {isEditing ? 'Continue' : 'Staff Search'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-sm">
                                        {["name", "phone", "country", "birthdate", "nationalId"].map((field) => (
                                            <div key={field}>
                                                <label className="capitalize">{field}:</label>
                                                <input
                                                    type={field === 'birthdate' ? 'date' : 'text'}
                                                    className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                                    value={staffData[field] || ''}
                                                    onChange={(e) => setStaffData({ ...staffData, [field]: e.target.value })}
                                                />
                                            </div>
                                        ))}

                                        <select
                                            multiple
                                            value={staffData.languages}
                                            onChange={(e) =>
                                                setStaffData({
                                                    ...staffData,
                                                    languages: Array.from(e.target.selectedOptions, option => option.value),
                                                })
                                            }
                                            className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
                                        >
                                            {languagesList.map((lang) => (
                                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                                            ))}
                                        </select>

                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold">Professional Certificates</h4>
                                            {(staffData.professionalCertificates || []).map((cert, certIndex) => (
                                                <div key={certIndex} className="border border-gray-700 rounded-lg p-4 relative space-y-2 bg-gray-800">
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
                                                    {["organization", "certificateName", "certificateId"].map((key) => (
                                                        <div key={key}>
                                                            <label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
                                                                value={cert[key] || ''}
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
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4"
                                                onClick={() => {
                                                    const updated = [...(staffData.professionalCertificates || [])];
                                                    updated.push({ organization: '', certificateName: '', certificateId: '' });
                                                    setStaffData({ ...staffData, professionalCertificates: updated });
                                                }}
                                            >
                                                Add Certificate
                                            </button>
                                        </div>

                                        <div className="flex justify-center mt-6">
                                            <button
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
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