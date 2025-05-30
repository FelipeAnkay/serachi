import {
    Banknote, BanknoteArrowDown, Bed, BedDouble, BookMarked, BookOpenCheck, Boxes, Calculator, CalendarCheck,
    CalendarHeart, CalendarPlus2, ChartColumnIncreasing, ChartNoAxesCombined, ChevronDown, CircleUser, Contact, DollarSign, HandCoins, Handshake, Home,
    MapPinCheckInside, PiggyBank, Receipt, Scale, Settings, ShieldUser, Ship, ShoppingBasket, Store,
    TicketCheck, Truck, Wallet
} from "lucide-react";

import logo from "../../public/Serachi_logo-nobg.png";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

const menuItems = [
    {
        label: "Quotes",
        icon: <PiggyBank />,
        key: "quotes",
        children: [
            { to: "/new-quote", label: "New", icon: <Receipt /> },
            { to: "/past-quote", label: "Past", icon: <BanknoteArrowDown /> },
            { to: "/confirmed-quote", label: "Confirmed", icon: <TicketCheck /> },
        ]
    },
    {
        label: "Experiences",
        icon: <MapPinCheckInside />,
        key: "experience",
        children: [
            { to: "/experience-calendar", label: "Exp Calendar", icon: <CalendarHeart /> },
            { to: "/set-service-dates", label: "Set Missing Data", icon: <CalendarPlus2 /> },
            { to: "/experience-create-service", label: "Create Service", icon: <BookMarked /> },
            { to: "/experience-add-items", label: "Add Items", icon: <ShoppingBasket /> },
            { to: "/experience-open-tabs", label: "Open Tabs", icon: <BookOpenCheck /> },
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
            { to: "/set-customer", label: "Customers", icon: <CircleUser /> },
            { to: "/set-rooms", label: "Rooms", icon: <Bed /> },
            { to: "/set-products", label: "Products", icon: <Boxes /> },
            { to: "/set-partner", label: "Partners", icon: <Handshake /> },
            { to: "/set-supplier", label: "Supplier", icon: <Truck /> },
            { to: "/set-store", label: "Store", icon: <Store /> },
        ]
    }
];

const LeftMenu = ({ show }) => {
    const [openMenus, setOpenMenus] = useState({});
    const { logout } = useAuthStore();

    const toggleMenu = (key) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        Cookies.remove('storeId');
        Cookies.remove('timezone');
        logout();
    };

    return (
        <div className={show ? "h-screen w-64 bg-gray-900/30 text-white p-4 ease-in duration-300 ml-0 overflow-y-auto" : "h-screen w-0 overflow-hidden ease-out duration-300"}>
            <div className="flex flex-col items-center justify-center mb-6">
                <img src={logo} alt="logo" className="w-20 h-20" />
                <h2 className="text-xl font-bold text-center">Serachi</h2>
            </div>

            <ul className="space-y-3">
                <li className="px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Link to="/" className="flex items-center gap-2"><Home />Home</Link>
                </li>

                {menuItems.map(({ label, icon, key, children }) => (
                    <div key={key} className="px-4 py-2 block rounded-lg hover:bg-blue-700 transition delay-200">
                        <li className="rounded-lg flex gap-2 cursor-pointer" onClick={() => toggleMenu(key)}>
                            {icon}
                            <span>{label}</span>
                            <ChevronDown className={openMenus[key] ? "rotate-180 transition-transform" : "transition-transform"} />
                        </li>
                        <div className={openMenus[key]
                            ? "w-full py-4 px-5 transition ease-out duration-100 transform opacity-100 scale-100 hover:bg-blue-600 rounded-lg"
                            : "transform h-0 scale-95 transition ease-in duration-75 overflow-hidden"}>
                            {children.map(({ to, label, icon }) => (
                                <li key={to} className="hover:bg-blue-500 rounded-lg flex">
                                    <Link to={to} className="flex items-center gap-2 py-1">
                                        {icon}{label}
                                    </Link>
                                </li>
                            ))}
                        </div>
                    </div>
                ))}
            </ul>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
            >
                Logout
            </motion.button>
        </div>
    );
};

export default LeftMenu;