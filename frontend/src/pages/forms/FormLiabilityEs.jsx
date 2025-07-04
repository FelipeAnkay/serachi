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


const LiabilityEs = () => {
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

    const [formData, setFormData] = useState({
        participantName: '',
        customerEmail: '',
        formName: 'Liability ES',
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
            setLoading(true);
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
            } finally {
                setLoading(false);
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
        setLoading(true);
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
        } finally {
            setLoading(false)
        }

    };

    const agreementText = `ACUERDO DE DIVULGACIÓN Y RECONOCIMIENTO DE NO AGENCIA

Entiendo y acepto que los Miembros PADI ("Miembros"), incluyendo a ${store.name}, y/o cualquier Instructor o Divemaster PADI asociado con el programa en el que participo, están autorizados para usar diversas marcas registradas de PADI y para realizar entrenamientos PADI, pero no son agentes, empleados ni franquiciados de PADI Americas, Inc., ni de sus compañías matrices, subsidiarias o afiliadas ("PADI"). Además, comprendo que las actividades comerciales de los Miembros son independientes, no son propiedad ni están operadas por PADI, y aunque PADI establece los estándares para los programas de entrenamiento de buceo PADI, no es responsable ni tiene derecho a controlar la operación de los negocios de los Miembros, ni la supervisión diaria de los programas y buzos por parte de los Miembros o su personal asociado. También entiendo y acepto, en nombre propio, mis herederos y mi patrimonio, que en caso de lesión o muerte durante esta actividad, ni yo ni mi patrimonio buscaremos responsabilizar a PADI por las acciones, omisiones o negligencias de las entidades mencionadas y/o de los instructores y divemasters asociados con la actividad.

Yo, ${customer.name} ${customer.lastName}, afirmo que soy un buzo certificado entrenado en prácticas seguras de buceo, o un estudiante bajo el control y supervisión de un instructor certificado. Sé que el buceo libre, apnea y buceo con tanque tienen riesgos inherentes, incluyendo los riesgos asociados con el traslado en barco hacia y desde el sitio de buceo (en adelante "Excursión"), los cuales pueden causar lesiones graves o la muerte. Entiendo que el buceo con aire comprimido implica riesgos inherentes; incluyendo pero no limitado a enfermedad por descompresión, embolia u otras lesiones por presión que requieren tratamiento en cámara hiperbárica. Si buceo con aire enriquecido con oxígeno ("Aire Enriquecido") u otras mezclas que incluyen oxígeno, entiendo también que existen riesgos de toxicidad por oxígeno y/o mezclas inadecuadas del gas respirable. Reconozco que esta Excursión incluye riesgos como resbalones o caídas a bordo del barco, cortes o golpes por el barco en el agua, lesiones al subir o bajar del barco y otros peligros marítimos. También comprendo que la Excursión se realizará en un sitio remoto, ya sea por tiempo, distancia o ambos, respecto a una cámara hiperbárica. Aun así elijo continuar con la Excursión a pesar de la ausencia de una cámara hiperbárica cercana al sitio(s) de buceo.

Entiendo y acepto que ni ${store.name}, ni los profesionales de buceo presentes en el sitio, ni PADI Americas, Inc., ni sus afiliadas o subsidiarias, ni sus empleados, oficiales, agentes, contratistas y cesionarios (en adelante "Partes Exoneradas") pueden ser responsables o estar obligados de ninguna manera por cualquier lesión, muerte u otro daño a mí, mi familia, patrimonio, herederos o cesionarios que ocurra durante la Excursión como resultado de mi participación o por negligencia de cualquier parte, incluyendo a las Partes Exoneradas, ya sea pasiva o activa.

Afirmo estar en buena condición mental y física para la Excursión. También declaro que no participaré si estoy bajo la influencia de alcohol o drogas contraindicadas para el buceo. Si tomo medicación, afirmo que he consultado a un médico y tengo autorización para bucear bajo su influencia. Entiendo que bucear es una actividad físicamente demandante y que me esforzaré durante la Excursión; si sufro lesiones por ataque cardíaco, pánico, hiperventilación, ahogamiento u otra causa, asumo expresamente el riesgo y no responsabilizaré a las Partes Exoneradas.

Sé que las prácticas seguras recomiendan bucear con compañero a menos que esté entrenado como buzo autosuficiente. Sé que es mi responsabilidad planificar el buceo considerando mi experiencia, limitaciones y condiciones ambientales. No responsabilizaré a las Partes Exoneradas por no planear, seguir el plan o las instrucciones del profesional de buceo.

Si buceo desde barco, estaré presente y atento a las instrucciones de la tripulación. Si algo no entiendo, lo notificaré de inmediato. Reconozco que es mi responsabilidad planear buceos sin descompresión y con parada de seguridad antes del ascenso, llegando a la embarcación con gas en el tanque. Si me encuentro en dificultades en superficie, soltaré lastre y inflaré mi chaleco para mantener flotabilidad.

Sé que las prácticas seguras recomiendan un buceo de actualización o guiado tras un periodo sin bucear, disponible por un costo adicional. Si decido no hacerlo, no responsabilizaré a las Partes Exoneradas.

Reconozco que las Partes Exoneradas pueden proveer un guía en el agua durante la Excursión para ayudar con la navegación y reconocimiento de flora y fauna. Si decido bucear con el guía, es mi responsabilidad permanecer cerca. Asumo todos los riesgos de bucear con o sin guía. Mi participación es bajo mi propio riesgo.

Afirmo que es mi responsabilidad inspeccionar todo el equipo antes de zarpar y no bucear con equipo defectuoso. No responsabilizaré a las Partes Exoneradas por no inspeccionar o bucear con equipo en mal estado.

Reconozco que las Partes Exoneradas no garantizan rescates ni primeros auxilios efectivos. En caso de mostrar señales de dificultad o pedir ayuda, deseo asistencia y no responsabilizaré a las Partes Exoneradas, su tripulación o pasajeros por sus acciones en un intento de rescate o primeros auxilios.

Declaro que este Acuerdo será válido para todas las Excursiones en las que participe durante un (1) año desde la fecha de firma.

Declaro ser mayor de edad y legalmente competente para firmar este documento, o contar con consentimiento escrito de padre o tutor. Entiendo que los términos son contractuales y firmo libremente renunciando a mis derechos legales. Si alguna cláusula se considera inválida, será separada y el resto seguirá vigente. Entiendo y acepto renunciar a mi derecho a demandar a las Partes Exoneradas y que mis herederos tampoco podrán hacerlo por mi muerte. Afirmo tener autoridad para ello y que mis herederos, cesionarios y beneficiarios no podrán alegar lo contrario.

Yo, ${customer.name} ${customer.lastName}, POR ESTE INSTRUMENTO, EXIMO Y LIBERO A LAS PARTES EXONERADAS DE TODA RESPONSABILIDAD POR LESIONES PERSONALES, DAÑOS A LA PROPIEDAD O MUERTE, INCLUYENDO PERO NO LIMITADO A NEGLIGENCIA DE LAS PARTES EXONERADAS, YA SEA PASIVA O ACTIVA.

HE LEÍDO COMPLETAMENTE ESTE ACUERDO DE DIVULGACIÓN Y RENUNCIA DE RESPONSABILIDAD, Y LO FIRMO EN REPRESENTACIÓN PROPIA Y DE MIS HEREDEROS.`;

    return (
        <>
            {
                loading && (
                    <LoadingSpinner />
                )
            }
            <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-4">Descargo de Responsabilidad - Actividad de Buceo</h1>
                <div className="whitespace-pre-wrap bg-gray-100 p-4 border rounded text-sm max-h-[400px] overflow-auto mb-6">
                    {agreementText}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium">Nombre Participante*</label>
                        <input type="text" name="participantName" value={formData.participantName} required onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block font-medium">Edad *</label>
                        <input type="text" name="age" value={formData.age} required onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block font-medium">Fecha (Dia/Mes/Año) *</label>
                        <input type="date" name="date" value={formData.date} required onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block font-medium">Firma *</label>
                        <SignatureCanvas
                            penColor="black"
                            canvasProps={{ width: 500, height: 150, className: 'border rounded' }}
                            ref={sigPadRef}
                        />
                        <button type="button" onClick={() => handleClear(sigPadRef)} className="text-sm text-red-600 mt-1">Limpiar Firma</button>
                    </div>
                    {formData.age < 18 && (
                        <>
                            <div>
                                <label className="block font-medium">Firma del tutor (en caso que corresponda)</label>
                                <SignatureCanvas
                                    penColor="black"
                                    canvasProps={{ width: 500, height: 150, className: 'border rounded' }}
                                    ref={guardianSigPadRef}
                                />
                                <button type="button" onClick={() => handleClear(guardianSigPadRef)} className="text-sm text-red-600 mt-1">Limpiar Firma Tutor</button>
                            </div>

                            <div>
                                <label className="block font-medium">Fecha cumpleaños del Tutor</label>
                                <input type="date" name="guardianDate" onChange={handleChange} className="w-full border p-2 rounded" />
                            </div>
                        </>
                    )}


                    <div>
                        <label className="block font-medium">Seguro de accidentes de buceo *</label>
                        <div className="flex items-center gap-4 mt-1">
                            <label><input type="radio" name="insurance" value="Yes" required onChange={handleChange} /> Si</label>
                            <label><input type="radio" name="insurance" value="No" required onChange={handleChange} /> No</label>
                        </div>
                    </div>
                    {formData.insurance === "Si" && (
                        <div>
                            <label className="block font-medium">Compañia de seguro - Numero de Poliza</label>
                            <input type="text" name="policyNumber" onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    )}
                    <button type="submit" className="mt-4 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-4 py-2 rounded">Enviar</button>
                </form>
            </div>
        </>
    );
};

export default LiabilityEs;