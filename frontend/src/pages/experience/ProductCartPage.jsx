import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFormServices } from '../../store/formServices';
import { useCustomerServices } from '../../store/customerServices';
import { useStoreServices } from '../../store/storeServices';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from 'react-select';
import { useProductServices } from '../../store/productServices';
import { useExperienceServices } from '../../store/experienceServices';
import { Loader2, Search } from 'lucide-react';
import ProductSelectForm from '../../components/ProductSelectForm';


const ProductCartPage = () => {
    const { getDataToken } = useFormServices();
    const { getCustomerEmail } = useCustomerServices();
    const { getStoreById } = useStoreServices();
    const { getProductForDisplay } = useProductServices();
    const { getValidExperienceByEmail } = useExperienceServices();
    const [productList, setProductList] = useState([]);
    const [searchParams] = useSearchParams();
    const [store, setStore] = useState({});
    const [customer, setCustomer] = useState({})
    const [loading, setLoading] = useState(true);
    const [customerFound, setCustomerFound] = useState(false);
    const customerEmailRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        productList: [],
    });

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
                const auxProduct = await getProductForDisplay(storeId)
                //console.log("auxProduct: ", auxProduct)
                setProductList(auxProduct.productList)
                const auxStore = await getStoreById(storeId)
                //console.log("auxStore: ", auxStore)
                setStore(auxStore.store)

            } catch (error) {
                console.error('Error getting token data:', error);
                window.location.href = '/unauthorized';
            } finally {
                setLoading(false)
            }
        };

        fetchTokenData();
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log('Submitting form:', formPayload);
        setLoading(true)
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("Form Saved Successfully")
        } catch (error) {
            console.log("Error guardando el form: ", error)
            toast.error("Error saving the Form")
        } finally {
            setLoading(false)
        }
    };


    const handleCustomerEmailSearch = async (customerEmail) => {
        //console.log("El email en handleCustomerEmailSearch es: ", customerEmail);
        try {
            setLoading(true)
            const response = await getCustomerEmail(customerEmail, store.storeId);
            const found = response.customerList;
            //console.log("F: el found es:", found);
            if (found) {
                toast.success('Mail found');
                //console.log("El cliente encontrdo es:", found)
                found.map((cust) => (
                    setCustomer({
                        _id: cust._id,
                        email: cust.email,
                        name: cust.name || '',
                        lastName: cust.lastName || '',
                    }
                    )));
                setCustomerFound(true);
            } else {
                toast.success('Mail not found, please contact the staff');
                setCustomerFound(false);
            }
        } catch (err) {
            toast.success('Mail not found, please contact the staff');
            setCustomerFound(false);
        } finally {
            setLoading(false)
        }
    };

    const grandTotal = formData.productList.reduce((total, item) => {
        return total + (Number(item.productFinalPrice) || 0);
    }, 0);

    return (
        <>
            {
                loading && (
                    <LoadingSpinner />
                )
            }
            <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
                <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold mb-4 text-center text-[#00C49F]">{store.name || ""} Menu</h1>
                    <div className="flex items-center gap-2">
                        <input
                            ref={customerEmailRef}
                            type="email"
                            name="customerEmail"
                            value={customer.email}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleCustomerEmailSearch(customerEmailRef.current.value);
                                }
                            }}
                            className="w-full border px-2 py-1 rounded bg-white text-slate-900"
                            placeholder="Enter customer email"
                        />
                        <button
                            type="button"
                            onClick={() => handleCustomerEmailSearch(customerEmailRef.current.value)}
                            className=" text-cyan-50 px-3 py-1 rounded bg-[#118290] hover:bg-[#0d6c77]"
                        >
                            <Search />
                        </button>
                    </div>
                    {customerFound && (
                        <div className='mt-2 w-full'>
                            <p className='mb-2 text-lg font-semibold'>Hi {customer.name}, please select products:</p>
                            <ProductSelectForm
                                products={productList}
                                value={formData.productList}
                                onChange={(newList) => setFormData({ ...formData, productList: newList })}
                                display={true}
                            />
                            {formData?.productList?.length > 0 && (
                                <div className='flex flex-row justify-center mt-2'>
                                    <p className='text-lg font-bold text-[#0d6c77]'>Total: ${grandTotal}</p>
                                </div>
                            )}
                            <div className="flex justify-center mt-2">
                                <button type="button" disabled={isLoading} onClick={handleSubmit} className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 rounded px-4 py-2 transition">
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="animate-spin w-4 h-4" />
                                            Creating...
                                        </span>
                                    ) : (
                                        "Submit"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductCartPage;