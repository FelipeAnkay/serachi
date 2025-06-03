import { useEffect, useState } from 'react';
import { useSupplierServices } from '../store/supplierServices';

export default function SupplierSelector({ value, onChange, storeId }) {
    const { getSupplierList, createSupplier } = useSupplierServices();
    const [supplierList, setSupplierList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newSupplier, setNewSupplier] = useState({
        name: '', email: '', phone: '', country: '', nationalId: ''
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                setLoading(true);
                const res = await getSupplierList(storeId);
                const sortedList = (res.supplierList || []).sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                setSupplierList(sortedList);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            } finally {
                setLoading(false);
            }
        };

        if (storeId) fetchSupplier();
    }, [storeId]);

    const filteredSuppliers = supplierList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (supplier) => {
        onChange(supplier._id);
        setSearchTerm(supplier.name);
        setShowDropdown(false);
    };

    const handleCreate = async () => {
        const res = await createSupplier({ ...newSupplier, storeId });
        if (res?.service?._id) {
            const newEntry = res.service;
            setSupplierList(prev => [...prev, newEntry]);
            onChange(newEntry._id);
            setSearchTerm(newEntry.name);
            setShowForm(false);
        }
    };
    const handleCancel = () => {
        setNewSupplier({
            name: '',
            email: '',
            phone: '',
            country: '',
            nationalId: ''
        });
        setShowForm(false);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                }}
                placeholder="Search supplier by name or email"
                className="w-full border px-2 py-1 rounded mb-2"
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // para permitir clic en dropdown
            />
            {showDropdown && filteredSuppliers.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto text-blue-950">
                    {filteredSuppliers.map((s) => (
                        <li
                            key={s._id}
                            onClick={() => handleSelect(s)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {s.name} – {s.email}
                        </li>
                    ))}
                </ul>
            )}

            {showDropdown && searchTerm && filteredSuppliers.length === 0 && (
                <div className="text-sm text-gray-500 mt-1">No supplier found.</div>
            )}

            <button
                type="button"
                className="text-sm text-blue-300 hover:underline mt-2 block"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Cancel' : 'Create new supplier'}
            </button>

            {showForm && (
                <div className="mt-2 space-y-2 bg-blue-800 p-2 rounded">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier(p => ({ ...p, name: e.target.value }))}
                        className="w-full p-2 rounded bg-blue-900"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier(p => ({ ...p, email: e.target.value }))}
                        className="w-full p-2 rounded bg-blue-900"
                    />
                    <input
                        type="text"
                        placeholder="Phone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier(p => ({ ...p, phone: e.target.value }))}
                        className="w-full p-2 rounded bg-blue-900"
                    />
                    <input
                        type="text"
                        placeholder="Country"
                        value={newSupplier.country}
                        onChange={(e) => setNewSupplier(p => ({ ...p, country: e.target.value }))}
                        className="w-full p-2 rounded bg-blue-900"
                    />
                    <input
                        type="text"
                        placeholder="National ID"
                        value={newSupplier.nationalId}
                        onChange={(e) => setNewSupplier(p => ({ ...p, nationalId: e.target.value }))}
                        className="w-full p-2 rounded bg-blue-900"
                    />
                    <div className="flex flex-col md:flex-row gap-2">
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="bg-green-600 text-white px-4 py-1 rounded"
                        >
                            Save Supplier
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-red-400 text-white px-4 py-1 rounded ml-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}