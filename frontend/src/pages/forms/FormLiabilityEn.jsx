import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFormServices } from '../../store/formServices';
import SignatureCanvas from 'react-signature-canvas';
import { useCustomerServices } from '../../store/customerServices';
import { useStoreServices } from '../../store/storeServices';
import { trimCanvas } from '../../components/trimCanvas'
import { useFormRecordServices } from '../../store/formRecordServices';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import liabilityFields from '../../components/FormLiabilityFields.json'
import Select from 'react-select';


const LiabilityEn = () => {
    const { getDataToken } = useFormServices();
    const { getCustomerEmail } = useCustomerServices();
    const { getStoreById } = useStoreServices();
    const { createFormRecord } = useFormRecordServices();
    const sigPadRef = useRef(null);
    const guardianSigPadRef = useRef(null);
    const [searchParams] = useSearchParams();
    const [store, setStore] = useState({});
    const [customer, setCustomer] = useState({})
    const [loading, setLoading] = useState(true);
    const [selectedLang, setSelectedLang] = useState(false);

    const [formData, setFormData] = useState({
        participantName: '',
        customerEmail: '',
        formName: 'Liability',
        date: '',
        age: 18,
        signature: '',
        guardianSignature: '',
        guardianDate: '',
        signedAt: '',
        insurance: '',
        policyNumber: '',
        storeName: '',
        storeId: ''
    });

    const [fieldData, setFieldData] = useState({
        title: '',
        agreementText: '',
        field1: '',
        field2: '',
        field3: '',
        field4: '',
        field5: '',
        field6: '',
        field7: '',
        field8: '',
        field9: '',
        field10: '',
        field11: '',
        field12: ''
    });

    const calculateAge = (birthdate) => {
        if (!birthdate) return "";
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            window.location.href = '/unauthorized';
            return;
        }

        const fetchTokenData = async () => {
            setLoading(true)
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await getDataToken(token);
                const { customerEmail, endDate, storeId } = res.urlData;
                //console.log("endDate es: ", endDate)
                //console.log("today es: ", today)
                if (!customerEmail || !storeId || !(endDate >= today)) {
                    window.location.href = '/unauthorized';
                }
                const auxCustomer = await getCustomerEmail(customerEmail, storeId)
                const auxStore = await getStoreById(storeId)
                //console.log("auxCustomer: ", auxCustomer)
                //console.log("auxStore: ", auxStore)
                setCustomer(auxCustomer.customerList[0])
                setStore(auxStore.store)
                const auxAge = calculateAge(auxCustomer.customerList[0].birthdate)
                setFormData(prev => ({
                    ...prev,
                    storeName: auxStore.store.name,
                    participantName: auxCustomer.customerList[0].name + " " + auxCustomer.customerList[0].lastName,
                    date: today,
                    age: auxAge,
                    storeId: storeId
                }));

            } catch (error) {
                console.error('Error getting token data:', error);
                window.location.href = '/unauthorized';
            } finally {
                setLoading(false)
            }
        };

        fetchTokenData();
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = (ref) => {
        ref.current.clear();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const canvas = sigPadRef.current.getCanvas();
        const trimmedCanvas = trimCanvas(canvas);
        const signature = trimmedCanvas.toDataURL('image/png');

        let guardianSignature = null;
        if (guardianSigPadRef.current && !guardianSigPadRef.current.isEmpty()) {
            const guardianCanvas = guardianSigPadRef.current.getCanvas();
            const trimmedGuardianCanvas = trimCanvas(guardianCanvas);
            guardianSignature = trimmedGuardianCanvas.toDataURL('image/png');
        }

        const auxDate = new Date();

        const formPayload = {
            customerEmail: customer.email,
            storeId: store.storeId,
            formName: "Liability EN",
            formTxt: agreementText,
            date: new Date(),
            answers: {
                participantName: customer.name + " " + customer.lastName,
                age: calculateAge(customer.birthdate),
                guardianDate: formData.guardianDate,
                insurance: formData.insurance,
                policyNumber: formData.policyNumber,
                storeName: store.name
            },
            signature: signature,
            guardianSignature: guardianSignature,
            signedAt: new Date() // fecha en la que se firmó, opcional

        }
        //console.log('Submitting form:', formPayload);
        setLoading(true)
        try {
            await createFormRecord(formPayload)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Form Saved Successfully")
        } catch (error) {
            console.log("Error guardando el form: ", error)
            toast.error("Error saving the Form")
        } finally {
            setLoading(false)
        }
    };

    const availableOptions = liabilityFields
        .map((l) => ({
            value: l.lang,
            label: l.name,
            language: l,
        }));

    const handleSelect = (selectedOption) => {
        if (!selectedOption) return;
        console.log("Selected Option: ", selectedOption)
        setFieldData(prev => ({
            ...prev,
            title: selectedOption.language.title,
            agreementText: selectedOption.language.text,
            field1: selectedOption.language.field1,
            field2: selectedOption.language.field2,
            field3: selectedOption.language.field3,
            field4: selectedOption.language.field4,
            field5: selectedOption.language.field5,
            field6: selectedOption.language.field6,
            field7: selectedOption.language.field7,
            field8: selectedOption.language.field8,
            field9: selectedOption.language.field9,
            field10: selectedOption.language.field10,
            field11: selectedOption.language.field11,
            field12: selectedOption.language.field12,
        }))
        setSelectedLang(true)
    };

    const renderedText = fieldData.agreementText
        .replace(/\${store.name}/g, store.name)
        .replace(/\${customer.name}/g, customer.name)
        .replace(/\${customer.lastName}/g, customer.lastName);
    return (
        <>
            {
                loading && (
                    <LoadingSpinner />
                )
            }
            <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
                <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold mb-4">{fieldData.title || "Liability Release - Diver Activities"}</h1>
                    <Select
                        options={availableOptions}
                        onChange={handleSelect}
                        placeholder="Select your language..."
                        isClearable
                        className="text-slate-900"
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
                    {selectedLang && (
                        <div>
                            <div className="whitespace-pre-wrap bg-gray-100 p-4 border rounded text-sm max-h-[400px] overflow-auto mb-6 mt-2">
                                {renderedText || "No Text"}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block font-medium">{fieldData.field1 || "Participant Name *"}</label>
                                    <input type="text" name="participantName" value={formData.participantName} required onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block font-medium">{fieldData.field2 || "Age *"}</label>
                                    <input type="text" name="age" value={formData.age} required onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>

                                <div>
                                    <label className="block font-medium">{fieldData.field3 || "Date (Day/Month/Year) *"}</label>
                                    <input type="date" name="date" value={formData.date} required onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>

                                <div>
                                    <label className="block font-medium">{fieldData.field4 || "Signature *"}</label>
                                    <SignatureCanvas
                                        penColor="black"
                                        canvasProps={{ width: 500, height: 150, className: 'border rounded' }}
                                        ref={sigPadRef}
                                    />
                                    <button type="button" onClick={() => handleClear(sigPadRef)} className="text-sm text-red-600 mt-1">{fieldData.field12 || "Clear Signature"}</button>
                                </div>
                                {formData.age < 18 && (
                                    <>
                                        <div>
                                            <label className="block font-medium">{fieldData.field5 || "Signature of Parent or Guardian (if applicable)"}</label>
                                            <SignatureCanvas
                                                penColor="black"
                                                canvasProps={{ width: 500, height: 150, className: 'border rounded' }}
                                                ref={guardianSigPadRef}
                                            />
                                            <button type="button" onClick={() => handleClear(guardianSigPadRef)} className="text-sm text-red-600 mt-1">{fieldData.field12 || "Clear Signature"}</button>
                                        </div>

                                        <div>
                                            <label className="block font-medium">{fieldData.field6 || "Parent/Guardian Birthdate"}</label>
                                            <input type="date" name="guardianDate" onChange={handleChange} className="w-full border p-2 rounded" />
                                        </div>
                                    </>
                                )}


                                <div>
                                    <label className="block font-medium">{fieldData.field7 || "Diver Accident Insurance *"}</label>
                                    <div className="flex items-center gap-4 mt-1">
                                        <label><input type="radio" name="insurance" value="Yes" required onChange={handleChange} /> {fieldData.field8 || "Yes"}</label>
                                        <label><input type="radio" name="insurance" value="No" required onChange={handleChange} /> {fieldData.field9 || "No"}</label>
                                    </div>
                                </div>
                                {formData.insurance === "Yes" && (
                                    <div>
                                        <label className="block font-medium">{fieldData.field10 || "Insurance Company - Policy Number"}</label>
                                        <input type="text" name="policyNumber" onChange={handleChange} className="w-full border p-2 rounded" />
                                    </div>
                                )}
                                <button type="submit" className="mt-4 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded">{fieldData.field11 || "Submit"}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LiabilityEn;