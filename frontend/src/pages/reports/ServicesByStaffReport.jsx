import { useState, useEffect } from "react"
import DateRangePicker from "../../components/DateRangePicker"
import { motion } from "framer-motion"
import { formatDateShort } from '../../components/formatDateDisplay'
import Cookies from 'js-cookie';
import toast from "react-hot-toast"
import { useStaffServices } from "../../store/staffServices"
import { Copy } from "lucide-react"
import { useServiceServices } from "../../store/serviceServices"
import { useProductServices } from "../../store/productServices";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"]

const ServicesByStaffReport = () => {
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [serviceData, setServiceData] = useState([]);
    const { getServicesForFees } = useServiceServices();
    const { getStaffList } = useStaffServices();
    const [staffList, setStaffList] = useState([]);
    const {getProductByStoreId} =  useProductServices();
    const [productList, setProductList] = useState([]);
    const storeId = Cookies.get('storeId');
    const [serviceTerm, setServiceTerm] = useState('');

    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            fetchData();
        }
    }, [dateRange])


    const fetchData = async () => {
        //console.log("El dateRange es: ", dateRange)
        const [services, products] = await Promise.all([
            getServicesForFees(dateRange.start, dateRange.end, storeId),
            getProductByStoreId(storeId)
        ])
        const auxStaff = await getStaffList(storeId);
        //console.log("auxSupp y auxStaff", {auxSupp,auxStaff})
        setStaffList(auxStaff.staffList);
        //console.log("services: ", services);
        //console.log("products: ", products);
        setServiceData(services.serviceList)
        setProductList(products.productList)
    }

    const copyTableToClipboard = (name) => {
        const table = document.querySelector(`#${name}-table`);
        if (!table) return;

        let text = "";
        for (const row of table.rows) {
            const cells = [...row.cells].map(cell => cell.innerText.trim());
            text += cells.join("\t") + "\n";
        }

        navigator.clipboard.writeText(text).then(() => {
            toast.success("Table copied to clipboard!");
        }).catch(err => {
            toast.error("Failed to copy");
        });
    };

    const filteredServices = serviceData
        .map((service) => {
            const product = productList.find(s => s._id === service.productId);
            const staff = staffList.find(s => s.email === service.staffEmail);

            const productName = product?.name || "Unkwown"
            const productPrice = product?.finalPrice.toFixed(2) || "Unkwown"
            const productTax = (product?.finalPrice - product?.price).toFixed(2) || "TBD"
            const staffName = staff?.name || "Unkwown"

            return {
                ...service,
                staffName: staffName,
                productName: productName,
                productPrice: productPrice,
                productTax: productTax,
            };
        })
        .filter((service) => {
            if (!serviceTerm) return true;
            const term = serviceTerm.toLowerCase();
            return (
                service.staffName.includes(term) ||
                service.productName.includes(term)
            );
        });

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-sky-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden min-h-screen items-center p-4"
            >
                <h1 className="text-3xl font-bold mb-6 text-center">Services by Staff</h1>
                <DateRangePicker value={dateRange} onChange={setDateRange} />

                <div className="flex flex-col mt-5 w-full">
                    {serviceData?.length > 0 && (
                        <motion.div
                            key="service"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-sky-50 p-4 rounded-2xl shadow-md text-slate-800"
                        >
                            <h2 className="text-xl font-semibold mb-2">
                                Service List - Qty: {filteredServices.length} 
                            </h2>

                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="Search by Staff or Product name..."
                                    value={serviceTerm}
                                    onChange={(e) => setServiceTerm(e.target.value)}
                                    className="w-full max-w-md px-4 py-2 rounded bg-white text-slate-900 border border-slate-300  focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <div className="mt-5">
                                    <table id="services-table" className="w-full text-left border-collapse bg-white rounded text-slate-900">
                                        <thead>
                                            <tr className="text-center">
                                                <th>Date In</th>
                                                <th>Date Out</th>
                                                <th>Product Name</th>
                                                <th>Product Price (w/tax)</th>
                                                <th>Staff</th>
                                                <th>Service Name</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredServices.map((service, i) => (
                                                <tr key={i} className="text-center">
                                                    <td>{formatDateShort(service.dateIn)}</td>
                                                    <td>{formatDateShort(service.dateOut)}</td>
                                                    <td>{service.productName}</td>
                                                    <td>${service.productPrice}</td>
                                                    <td>{service.staffName}</td>
                                                    <td>{service.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="flex flex-row">
                                        <button
                                            onClick={() => copyTableToClipboard("services")}
                                            className="mt-4 px-4 py-2 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 w-full flex flex-row items-center justify-center"
                                        >
                                            Copy Table
                                            <Copy className="ml-2"></Copy>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div >
        </div >
    )
}

export default ServicesByStaffReport