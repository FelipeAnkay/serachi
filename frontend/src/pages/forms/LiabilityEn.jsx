import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFormServices } from '../../store/formServices';
import SignatureCanvas from 'react-signature-canvas';
import { useCustomerServices } from '../../store/customerServices';
import { useStoreServices } from '../../store/storeServices';
import { trimCanvas } from '../../components/trimCanvas'
import { useFormRecordServices } from '../../store/formRecordServices';
import toast from 'react-hot-toast';


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

    const [formData, setFormData] = useState({
        participantName: '',
        customerEmail: '',
        formName: 'Liability EN',
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
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await getDataToken(token);
                const { customerEmail, storeId } = res.urlData;
                if (!customerEmail || !storeId) {
                    window.location.href = '/unauthorized';
                }
                const auxCustomer = await getCustomerEmail(customerEmail, storeId)
                const auxStore = await getStoreById(storeId)
                console.log("auxCustomer: ", auxCustomer)
                console.log("auxStore: ", auxStore)
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
        console.log('Submitting form:', formPayload);
        try {
            await createFormRecord(formPayload)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Form Saved Successfully")
        } catch (error) {
            console.log("Error guardando el form: ", error)
            toast.error("Error saving the Form")
        }

        // Aquí haces el POST al backend
    };

    const agreementText = `NON-AGENCY DISCLOSURE AND ACKNOWLEDGMENT AGREEMENT

I understand and agree that PADI Members (\"Members\"), including ${store.name}, and/or any individual PADI Instructors and Divemasters associated with the program in which I am participating, are licensed to use various PADI Trademarks and to conduct PADI training, but are not agents, employees or franchisees of PADI Americas, Inc., or its parent, subsidiary and affiliated corporations (\"PADI\"). I further understand that Member business activities are independent, and are neither owned nor operated by PADI, and that while PADI establishes the standards for PADI diver training programs, it is not responsible for, nor does it have the right to control, the operation of the Members' business activities and the day-to-day conduct of PADI programs and supervision of divers by the Members or their associated staff. I further understand and agree on behalf of myself, my heirs and my estate that in the event of an injury or death during this activity, neither I nor my estate shall seek to hold PADI liable for the actions, inactions or negligence of the entities listed above and/or the instructors and divemasters associated with the activity.

I, ${customer.name} ${customer.lastName}, hereby affirm that I am a certified scuba diver trained in safe dive practices, or a student diver under the control and supervision of a certified scuba instructor. I know that skin diving, freediving and scuba diving have inherent risks including those risks associated with boat travel to and from the dive site (hereinafter \"Excursion\"), which may result in serious injury or death. I understand that scuba diving with compressed air involves certain inherent risks; including but not limited to decompression sickness, embolism or other hyperbaric/air expansion injury that require treatment in a recompression chamber. If I am scuba diving with oxygen enriched air (\"Enriched Air\") or other gas blends including oxygen, I also understand that it involves inherent risks of oxygen toxicity and/or improper mixtures of breathing gas. I acknowledge this Excursion includes risks of slipping or falling while on board the boat, being cut or struck by a boat while in the water, injuries occurring while getting on or off a boat, and other perils of the sea. I further understand that the Excursion will be conducted at a site that is remote, either by time or distance or both, from a recompression chamber. I still choose to proceed with the Excursion in spite of the absence of a recompression chamber in proximity to the dive site(s).

I understand and agree that neither ${store.name}; nor the dive professional(s) who may be present at the dive site, nor PADI Americas, Inc., nor any of their affiliate and subsidiary corporations, nor any of their respective employees, officers, agents, contractors and assigns (hereinafter \"Released Parties\") may be held liable or responsible in any way for any injury, death or other damages to me, my family, estate, heirs or assigns that may occur during the Excursion as a result of my participation in the Excursion or as a result of the negligence of any party, including the Released Parties, whether passive or active.

I affirm I am in good mental and physical fitness for the Excursion. I further state that I will not participate in the Excursion if I am under the influence of alcohol or any drugs that are contraindicated to diving. If I am taking medication, I affirm that I have seen a physician and have approval to dive while under the influence of the medication/drugs. I understand that diving is a physically strenuous activity and that I will be exerting myself during the Excursion and that if I am injured as a result of heart attack, panic, hyperventilation, drowning or any other cause, that I expressly assume the risk of said injuries and that I will not hold the Released Parties responsible for the same.

I am aware that safe dive practices suggest diving with a buddy unless trained as a self-reliant diver. I am aware it is my responsibility to plan my dive allowing for my diving experience and limitations, and the prevailing water conditions and environment. I will not hold the Released Parties responsible for my failure to safely plan my dive, dive my plan, and follow the instructions and dive briefing of the dive professional(s).

If diving from a boat, I will be present at and attentive to the briefing given by the boat crew. If there is anything I do not understand I will notify the boat crew or captain immediately. I acknowledge it is my responsibility to plan my dives as no-decompression dives, and within parameters that allow me to make a safety stop before ascending to the surface, arriving on board the vessel with gas remaining in my cylinder as a measure of safety. If I become distressed on the surface I will immediately drop my weights and inflate my BCD (orally or with low pressure inflator) to establish buoyancy on the surface.

I am aware safe dive practices recommend a refresher or guided orientation dive following a period of diving inactivity. I understand such refresher/guided dive is available for an additional fee. If I choose not to follow this recommendation I will not hold the Released Parties responsible for my decision.

I acknowledge Released Parties may provide an in-water guide (hereinafter \"Guide\") during the Excursion. The Guide is present to assist in navigation during the dive and identifying local flora and fauna. If I choose to dive with the Guide I acknowledge it is my responsibility to stay in proximity to the Guide during the dive. I assume all risks associated with my choice whether to dive in proximity to the Guide or to dive independent of the Guide. I acknowledge my participation in diving is at my own risk and peril.

I affirm it is my responsibility to inspect all of the equipment I will be using prior to the leaving the dock for the Excursion and that I should not dive if the equipment is not functioning properly. I will not hold the Released Parties responsible for my failure to inspect the equipment prior to diving or if I choose to dive with equipment that may not be functioning properly.

I acknowledge Released Parties have made no representation to me, implied or otherwise, that they or their crew can or will perform affective rescues or render first aid. In the event I show signs of distress or call for aid I would like assistance and will not hold the Released Parties, their crew, dive boats or passengers responsible for their actions in attempting the performance of rescue or first aid.

I hereby state and agree that this Agreement will be effective for all Excursions in which I participate for one (1) year from the date on which I sign this Agreement.

I further state that I am of lawful age and legally competent to sign this liability release, or that I have acquired the written consent of my parent or guardian. I understand the terms herein are contractual and not a mere recital, and that I have signed this Agreement of my own free act and with the knowledge that I hereby agree to waive my legal rights. I further agree that if any provision of this Agreement is found to be unenforceable or invalid, that provision shall be severed from this Agreement. The remainder of this Agreement will then be construed as though the unenforceable provision had never been contained herein. I understand and agree that I am not only giving up my right to sue the Released Parties but also any rights my heirs, assigns, or beneficiaries may have to sue the Released Parties resulting from my death. I further represent that I have the authority to do so and that my heirs, assigns, and beneficiaries will be estopped from claiming otherwise because of my representations to the Released Parties.

I, ${customer.name} ${customer.lastName}, BY THIS INSTRUMENT, AGREE TO EXEMPT AND RELEASE THE RELEASED PARTIES DEFINED ABOVE FROM ALL LIABILITY OR RESPONSIBILITY WHATSOEVER FOR PERSONAL INJURY, PROPERTY DAMAGE OR WRONGFUL DEATH HOWEVER CAUSED, INCLUDING BUT NOT LIMITED TO THE NEGLIGENCE OF THE RELEASED PARTIES, WHETHER PASSIVE OR ACTIVE.

I HAVE FULLY INFORMED MYSELF AND MY HEIRS OF THE CONTENTS OF THIS NON-AGENCY DISCLOSURE AND ACKNOWLEDGMENT AGREEMENT, AND LIABILITY RELEASE AND ASSUMPTION OF RISK AGREEMENT BY READING BOTH BEFORE SIGNING BELOW ON BEHALF OF MYSELF AND MY HEIRS.`;


    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Liability Release - Diver Activities</h1>
            <div className="whitespace-pre-wrap bg-gray-100 p-4 border rounded text-sm max-h-[400px] overflow-auto mb-6">
                {agreementText}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Participant Name *</label>
                    <input type="text" name="participantName" value={formData.participantName} required onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block font-medium">Age *</label>
                    <input type="text" name="age" value={formData.age} required onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div>
                    <label className="block font-medium">Date (Day/Month/Year) *</label>
                    <input type="date" name="date" value={formData.date} required onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div>
                    <label className="block font-medium">Signature *</label>
                    <SignatureCanvas
                        penColor="black"
                        canvasProps={{ width: 500, height: 150, className: 'border rounded' }}
                        ref={sigPadRef}
                    />
                    <button type="button" onClick={() => handleClear(sigPadRef)} className="text-sm text-red-600 mt-1">Clear Signature</button>
                </div>
                {formData.age < 18 && (
                    <>
                        <div>
                            <label className="block font-medium">Signature of Parent or Guardian (if applicable)</label>
                            <SignatureCanvas
                                penColor="black"
                                canvasProps={{ width: 500, height: 150, className: 'border rounded' }}
                                ref={guardianSigPadRef}
                            />
                            <button type="button" onClick={() => handleClear(guardianSigPadRef)} className="text-sm text-red-600 mt-1">Clear Guardian Signature</button>
                        </div>

                        <div>
                            <label className="block font-medium">Parent/Guardian Birthdate</label>
                            <input type="date" name="guardianDate" onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </>
                )}


                <div>
                    <label className="block font-medium">Diver Accident Insurance *</label>
                    <div className="flex items-center gap-4 mt-1">
                        <label><input type="radio" name="insurance" value="Yes" required onChange={handleChange} /> Yes</label>
                        <label><input type="radio" name="insurance" value="No" required onChange={handleChange} /> No</label>
                    </div>
                </div>
                {formData.insurance === "Yes" && (
                    <div>
                        <label className="block font-medium">Insurance Company - Policy Number</label>
                        <input type="text" name="policyNumber" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                )}
                <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
            </form>
        </div>
    );
};

export default LiabilityEn;