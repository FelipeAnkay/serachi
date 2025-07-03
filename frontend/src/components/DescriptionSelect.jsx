import { Heart, HeartOff } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import { useFavoriteDescriptionServices } from '../store/favoriteDescriptionServices';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const DescriptionSelect = ({
    storeId,
    user,
    type,
    value,
    onChange,
}) => {
    const inputRef = useRef(null);
    const { createFavoriteDescription, removeFavoriteDescription, getFavoriteDescriptionList } = useFavoriteDescriptionServices();
    const [isInList, setIsInList] = useState(false);
    const [descriptionList, setDescriptionList] = useState([]);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const auxDescriptionList = await getFavoriteDescriptionList(storeId, type)
                //console.log("auxDescriptionList: ", auxDescriptionList)
                setDescriptionList(auxDescriptionList.favoriteDescriptionList)
            } catch (error) {
                toast.error("Error fetching Descriptions")
            }
        }
        if (storeId) {
            fetchData();
        }
    }, [type]);

    useEffect(() => {
        const auxOptions = descriptionList.map((desc) => ({
            label: desc.description, // texto visible
            value: desc.description, // valor real
            id: desc._id,            // útil para eliminar luego
        }));
        setOptions(auxOptions)
    }, [descriptionList]);



    useEffect(() => {
        setIsInList(descriptionList.some(d => d.description === value));
    }, [value, descriptionList]);

    const handleSelectChange = (selectedOption) => {
        const selectedValue = selectedOption?.value || '';
        onChange(selectedValue);
        inputRef.current?.focus();
    };

    const handleAdd = async () => {
        if (!value || descriptionList.includes(value)) return;

        const payload = {
            description: value,
            storeId,
            userEmail: user.email,
            type,
        };

        try {
            //console.log("payload", payload)
            await createFavoriteDescription(payload);
            const auxDescriptionList = await getFavoriteDescriptionList(storeId, type)
            setDescriptionList(auxDescriptionList.favoriteDescriptionList)
            toast.success("Description added")
        } catch (error) {
            console.error('Failed to add description:', error);
            toast.error("Error adding description")
        }
    };

    const handleRemove = async () => {
        const selectedOption = descriptionList.find((d) => d.description === value);
        const selectedId = selectedOption?._id;
        if (!selectedId) return;

        try {
            //console.log("toRemove", selectedOption)
            await removeFavoriteDescription(selectedId);
            setDescriptionList(descriptionList.filter(d => d._id !== selectedId));
            toast.success("Description removed successfully")
        } catch (error) {
            //console.error('Failed to remove description:', error);
            toast.error("Failed to remove description");
        }
    };


    return (
        <div className="w-full">

            <div className="flex gap-2 items-center">
                <div className="flex-1">
                    <label className='block font-medium mb-1'>Favorite Descriptions:</label>
                    <CreatableSelect
                        isClearable
                        options={options}
                        onChange={handleSelectChange}
                        placeholder="Select favorite description"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderColor: '#d1d5db', // Tailwind border-gray-300
                                padding: '2px',
                                fontSize: '0.875rem', // text-sm
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 50,
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isFocused ? "#3BA0AC" : "white",
                                color: "#1e293b", // slate-900
                            }),
                        }}
                    />
                    <div className='mt-2'>
                        <label className="block font-medium mb-1">Description</label>
                        <div className='flex flex-row'>
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1"
                                placeholder="You can modify or extend description here"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={isInList ? handleRemove : handleAdd}
                                className="text-cyan-500 hover:text-cyan-800 ml-2"
                                title={isInList ? 'Remove from saved list' : 'Add to saved list'}
                            >
                                {isInList ? <HeartOff className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DescriptionSelect;