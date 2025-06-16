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
                    <div className='mt-2'>
                        <label className="block font-medium mb-1">Description</label>
                        <div className='flex flex-row'>
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-blue-950 bg-white"
                                placeholder="You can modify or extend description here"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={isInList ? handleRemove : handleAdd}
                                className="text-blue-300 hover:text-blue-500 ml-2"
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