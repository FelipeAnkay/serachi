import {
    Banknote, BanknoteArrowDown, Bed, BedDouble, BookMarked, BookOpenCheck, Boxes, Calculator, CalendarCheck,
    CalendarHeart, CalendarPlus2, ChartColumnIncreasing, ChartNoAxesCombined, ChevronDown, CircleUser, Contact, DollarSign, HandCoins, Handshake, Home,
    MapPinCheckInside, PiggyBank, Receipt, Scale, Settings, ShieldCheck, ShieldUser, Ship, ShoppingBasket, Store,
    TicketCheck, Truck, Wallet, Menu,
    Trash2,
    TrendingUp,
    Coins
} from "lucide-react";

import logo from "../../public/Serachi_logo-nobg.png";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { useStoreServices } from "../store/storeServices";

const menuItems = [
    {
        label: "Quotes",
        icon: <PiggyBank />,
        key: "quotes",
        children: [
            { to: "/new-quote", label: "New", icon: <Receipt /> },
            { to: "/past-quote", label: "Created", icon: <BanknoteArrowDown /> },
            { to: "/confirmed-quote", label: "Confirmed", icon: <TicketCheck /> },
        ]
    },
    {
        label: "Experiences",
        icon: <MapPinCheckInside />,
        key: "experience",
        children: [
            { to: "/experience-calendar", label: "Exp Calendar", icon: <CalendarHeart /> },
            { to: "/experience-list", label: "Exp List", icon: <CalendarCheck /> },
            { to: "/set-service-dates", label: "Set Missing Data", icon: <CalendarPlus2 /> },
            { to: "/experience-create-service", label: "Create Service", icon: <BookMarked /> },
            { to: "/experience-add-items", label: "Add Items", icon: <ShoppingBasket /> },
            { to: "/experience-open-tabs", label: "Open Tabs", icon: <BookOpenCheck /> },
            { to: "/delete-services", label: "Delete Services", icon: <Trash2 /> },
        ]
    },
    {
        label: "CashFlow",
        icon: <DollarSign />,
        key: "cashflow",
        children: [
            { to: "/cashflow-summary", label: "Summary", icon: <Scale /> },
            { to: "/new-income", label: "New Income", icon: <HandCoins /> },
            { to: "/new-expense", label: "New Expense", icon: <BanknoteArrowDown /> },
        ]
    },
    {
        label: "Settings",
        icon: <Settings />,
        key: "settings",
        children: [
            { to: "/set-users", label: "Users", icon: <ShieldUser /> },
            { to: "/set-staff", label: "Staff", icon: <Contact /> },
            { to: "/set-staff-rates", label: "Staff Fees", icon: <Banknote /> },
            { to: "/set-roles", label: "Roles", icon: <ShieldCheck /> },
            { to: "/set-customer", label: "Customers", icon: <CircleUser /> },
            { to: "/set-rooms", label: "Rooms", icon: <Bed /> },
            { to: "/set-products", label: "Products", icon: <Boxes /> },
            { to: "/set-partner", label: "Partners", icon: <Handshake /> },
            { to: "/set-supplier", label: "Supplier", icon: <Truck /> },
            { to: "/set-types", label: "Types", icon: <Boxes /> },
            { to: "/set-store", label: "Store", icon: <Store /> },
        ]
    }
];

const menuItemsMed = [
    {
        label: "Quotes",
        icon: <PiggyBank />,
        key: "quotes",
        children: [
            { to: "/new-quote", label: "New", icon: <Receipt /> },
            { to: "/past-quote", label: "Created", icon: <BanknoteArrowDown /> },
            { to: "/confirmed-quote", label: "Confirmed", icon: <TicketCheck /> },
        ]
    },
    {
        label: "Experiences",
        icon: <MapPinCheckInside />,
        key: "experience",
        children: [
            { to: "/experience-calendar", label: "Exp Calendar", icon: <CalendarHeart /> },
            { to: "/experience-list", label: "Exp List", icon: <CalendarCheck /> },
            { to: "/set-service-dates", label: "Set Missing Data", icon: <CalendarPlus2 /> },
            { to: "/experience-create-service", label: "Create Service", icon: <BookMarked /> },
            { to: "/experience-add-items", label: "Add Items", icon: <ShoppingBasket /> },
            { to: "/experience-open-tabs", label: "Open Tabs", icon: <BookOpenCheck /> },
            { to: "/delete-services", label: "Delete Services", icon: <Trash2 /> },
        ]
    },
    {
        label: "CashFlow",
        icon: <DollarSign />,
        key: "cashflow",
        children: [
            { to: "/cashflow-summary", label: "Summary", icon: <Scale /> },
            { to: "/new-income", label: "New Income", icon: <HandCoins /> },
            { to: "/new-expense", label: "New Expense", icon: <BanknoteArrowDown /> },
        ]
    },
    {
        label: "Room Bookings",
        icon: <BedDouble />,
        key: "booking",
        children: [
            { to: "/create-reservation", label: "Create Reservation", icon: <Bed /> },
            { to: "/booking-calendar", label: "Room Calendar", icon: <CalendarCheck /> },
        ]
    },
    {
        label: "PayRoll",
        icon: <Wallet />,
        key: "payroll",
        children: [
            { to: "/payroll-calculator", label: "Calculator", icon: <Calculator /> },
        ]
    },
    {
        label: "Insights",
        icon: <ChartNoAxesCombined />,
        key: "insights",
        children: [
            { to: "/report-incomes", label: "Report", icon: <ChartColumnIncreasing /> },
            { to: "/report-cashflow", label: "Monthly Cash Flow", icon: <TrendingUp /> },
            { to: "/report-cashflow-detail", label: "Income & Expenses", icon: <Coins /> },
            
        ]
    },
    {
        label: "Settings",
        icon: <Settings />,
        key: "settings",
        children: [
            { to: "/set-users", label: "Users", icon: <ShieldUser /> },
            { to: "/set-staff", label: "Staff", icon: <Contact /> },
            { to: "/set-staff-rates", label: "Staff Fees", icon: <Banknote /> },
            { to: "/set-roles", label: "Roles", icon: <ShieldCheck /> },
            { to: "/set-customer", label: "Customers", icon: <CircleUser /> },
            { to: "/set-rooms", label: "Rooms", icon: <Bed /> },
            { to: "/set-products", label: "Products", icon: <Boxes /> },
            { to: "/set-partner", label: "Partners", icon: <Handshake /> },
            { to: "/set-supplier", label: "Supplier", icon: <Truck /> },
            { to: "/set-types", label: "Types", icon: <Boxes /> },
            { to: "/set-store", label: "Store", icon: <Store /> },
        ]
    }
];

const menuItemsPro = [
    {
        label: "Quotes",
        icon: <PiggyBank />,
        key: "quotes",
        children: [
            { to: "/new-quote", label: "New", icon: <Receipt /> },
            { to: "/past-quote", label: "Created", icon: <BanknoteArrowDown /> },
            { to: "/confirmed-quote", label: "Confirmed", icon: <TicketCheck /> },
        ]
    },
    {
        label: "Experiences",
        icon: <MapPinCheckInside />,
        key: "experience",
        children: [
            { to: "/experience-calendar", label: "Exp Calendar", icon: <CalendarHeart /> },
            { to: "/experience-list", label: "Exp List", icon: <CalendarCheck /> },
            { to: "/set-service-dates", label: "Set Missing Data", icon: <CalendarPlus2 /> },
            { to: "/experience-create-service", label: "Create Service", icon: <BookMarked /> },
            { to: "/experience-add-items", label: "Add Items", icon: <ShoppingBasket /> },
            { to: "/experience-open-tabs", label: "Open Tabs", icon: <BookOpenCheck /> },
            { to: "/delete-services", label: "Delete Services", icon: <Trash2 /> },
        ]
    },
    {
        label: "CashFlow",
        icon: <DollarSign />,
        key: "cashflow",
        children: [
            { to: "/cashflow-summary", label: "Summary", icon: <Scale /> },
            { to: "/new-income", label: "New Income", icon: <HandCoins /> },
            { to: "/new-expense", label: "New Expense", icon: <BanknoteArrowDown /> },
        ]
    },
    {
        label: "Room Bookings",
        icon: <BedDouble />,
        key: "booking",
        children: [
            { to: "/create-reservation", label: "Create Reservation", icon: <Bed /> },
            { to: "/booking-calendar", label: "Room Calendar", icon: <CalendarCheck /> },
        ]
    },
    {
        label: "PayRoll",
        icon: <Wallet />,
        key: "payroll",
        children: [
            { to: "/payroll-calculator", label: "Calculator", icon: <Calculator /> },
        ]
    },
    {
        label: "Insights",
        icon: <ChartNoAxesCombined />,
        key: "insights",
        children: [
            { to: "/report-incomes", label: "Report", icon: <ChartColumnIncreasing /> },
            { to: "/report-cashflow", label: "Monthly Cash Flow", icon: <TrendingUp /> },
            { to: "/report-cashflow-detail", label: "Income & Expenses", icon: <Coins /> },
        ]
    },
    {
        label: "Settings",
        icon: <Settings />,
        key: "settings",
        children: [
            { to: "/set-users", label: "Users", icon: <ShieldUser /> },
            { to: "/set-staff", label: "Staff", icon: <Contact /> },
            { to: "/set-staff-rates", label: "Staff Fees", icon: <Banknote /> },
            { to: "/set-roles", label: "Roles", icon: <ShieldCheck /> },
            { to: "/set-customer", label: "Customers", icon: <CircleUser /> },
            { to: "/set-rooms", label: "Rooms", icon: <Bed /> },
            { to: "/set-products", label: "Products", icon: <Boxes /> },
            { to: "/set-partner", label: "Partners", icon: <Handshake /> },
            { to: "/set-supplier", label: "Supplier", icon: <Truck /> },
            { to: "/set-types", label: "Types", icon: <Boxes /> },
            { to: "/set-store", label: "Store", icon: <Store /> },
        ]
    }
];

const LeftMenu = ({ show, setShow }) => {
    const [openMenus, setOpenMenus] = useState({});
    const [menuList, setMenuList] = useState([]);
    const { logout } = useAuthStore();
    const storeId = Cookies.get('storeId');
    const { store, getStoreById } = useStoreServices();
    const [storePlan, setStorePlan] = useState("")
    const [storeLoaded, setStoreLoaded] = useState(false)

    const fetchStore = async () => {
        try {
            if (!storeLoaded) {
                //console.log("storeId", storeId)
                const auxStore = await getStoreById(storeId)
                //console.log("auxStore: ", auxStore)
                setStorePlan(auxStore.store.plan)
                setStoreLoaded(true)
            }
        } catch (error) {
            setStoreLoaded(false)
            console.log("Errore getting the store")
        }
    }

    useEffect(() => {
        //console.log("Entre al menu izquierdo - Store", { store })
        if (!storePlan) {
            //console.log("Llamar a fetchStore")
            fetchStore();

        }
        if (storeLoaded) {
            //console.log("Llamar a fetchMenu")
            fetchMenu();
        }
    }, [])

    useEffect(() => {
        if (storeLoaded) {
            //console.log("Llamar a fetchMenu")
            fetchMenu();
        }
    }, [storeLoaded])

    const fetchMenu = () => {
        //console.log("fetchMenu - storePlan: ", { storePlan })
        if (storeLoaded) {
            switch (storePlan) {
                case "BAS":
                    setMenuList(menuItems)
                    break;
                case "MED":
                    setMenuList(menuItemsMed)
                    break;
                case "PRO":
                    setMenuList(menuItemsPro)
                    break;
                default:
                    console.log("No plan loaded for this store");
            }
        }
    }

    const toggleMenu = (key) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        Cookies.remove('storeId');
        Cookies.remove('timezone');
        logout();
    };

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setShow(false); // colapsar menú
        }
    };

    return (
        <div
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            className={`fixed top-0 left-0 z-50 h-screen ${show ? "w-64" : "w-16"} 
              bg-gray-900/30 text-white transition-all duration-300 ease-in-out 
              overflow-y-auto flex flex-col`}
        >
            <div className="flex items-center justify-between p-4">
                {show && (
                    <>
                        <img src={logo} alt="logo" className="w-10 h-10" />
                        <h2 className="text-xl font-bold">Serachi - {storeId}</h2>
                    </>
                )}
                <Menu onClick={() => setShow(!show)} className="cursor-pointer" />
            </div>

            <ul className="space-y-2 px-2">
                <li className="px-2 py-2 rounded-lg hover:bg-blue-700">
                    <Link to="/" className="flex items-center gap-2"><Home />{show && "Home"}</Link>
                </li>

                {menuList.map(({ label, icon, key, children }) => (
                    <div key={key} className="px-2 py-1 rounded-lg hover:bg-blue-700 transition-all">
                        <li
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                                // Expandir menú si está colapsado en pantallas pequeñas
                                if (window.innerWidth < 768 && !show) {
                                    setShow(true);
                                }
                                toggleMenu(key);
                            }}
                        >
                            {icon}
                            {show && <span>{label}</span>}
                            {show && <ChevronDown className={`${openMenus[key] ? "rotate-180" : ""} transition-transform ml-auto`} />}
                        </li>
                        {show && openMenus[key] && (
                            <div className="mt-2 ml-4 space-y-1">
                                {children.map(({ to, label, icon }) => (
                                    <li key={to} className="hover:bg-blue-500 rounded-lg">
                                        <Link
                                            to={to}
                                            className="flex items-center gap-2 py-1 px-2"
                                            onClick={handleLinkClick}
                                        >
                                            {icon}{label}
                                        </Link>
                                    </li>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </ul>

            {show && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className='mt-5 mx-4 py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700'
                >
                    Logout
                </motion.button>
            )}
        </div>
    );
};

export default LeftMenu;