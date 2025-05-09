import { BanknoteArrowDown, Bed, BedDouble, Boxes, CalendarHeart, ChevronDown, Contact, DollarSign, Home, MapPinCheckInside, PiggyBank, Receipt, Settings, ShieldUser, Ship, Store, TicketCheck, User, User2, UserPlus } from "lucide-react"
import logo from "../../public/Serachi_logo-nobg.png"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion'

const LeftMenu = ({ show }) => {
    const [openSetting, setOpenSetting] = useState(false);
    const [openExperience, setOpenExperience] = useState(false);
    const [openBooking, setOpenBooking] = useState(false);
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className={show ? "h-screen w-64 bg-gray-900/30 text-white p-4 ease-in duration-300 ml-0" : "h-screen w-0 overflow-hidden ease-out duration-300"}>
            <div className="flex flex-col items-center justify-center mb-6">
                <img src={logo} alt="logo" className="w-20 h-20" />
                <h2 className="text-xl font-bold text-center">Serachi</h2>
            </div>
            <ul className="space-y-3">
                <li className="px-4 py-2 rounded-lg  hover:bg-blue-700"><Link to="/" className="flex items-center gap-2"><Home />Home</Link></li>
                <div className="px-4 py-2 block rounded-lg  hover:bg-blue-700 transition delay-200">
                    <li className="rounded-lg flex gap-2" onClick={() => setOpenBooking(!openBooking)}><PiggyBank className="inline-block" /><span className="inline-block">Quotes</span><ChevronDown className={openBooking ? "block rotate-180" : "block"} /></li>
                    <div className={openBooking ? "w-full py-4 px-5 p-4 transition ease-out duration-100 transform opacity-100 scale-100 hover:bg-blue-600 rounded-lg" : "transform h-0 scale-95 transition ease-in duration-75 overflow-hidden"}>
                        <li className="hover:bg-blue-500 rounded-lg flex"><Link to="/new-quote" className="flex items-center gap-2 py-1"><Receipt />New</Link></li>
                        <li className="hover:bg-blue-500 rounded-lg flex"><Link to="/past-quote" className="flex items-center gap-2 py-1"><BanknoteArrowDown />Past</Link></li>
                        <li className="hover:bg-blue-500 rounded-lg flex"><Link to="/confirmed-quote" className="flex items-center gap-2 py-1"><TicketCheck />Confirmed</Link></li>
                    </div>
                </div>
                <div className="px-4 py-2 block rounded-lg  hover:bg-blue-700 transition delay-200">
                    <li className="rounded-lg flex gap-2" onClick={() => setOpenExperience(!openExperience)}><MapPinCheckInside className="inline-block" /><span className="inline-block">Experiences</span><ChevronDown className={openExperience ? "block rotate-180" : "block"} /></li>
                    <div className={openExperience ? "w-full py-4 px-5 p-4 transition ease-out duration-100 transform opacity-100 scale-100 hover:bg-blue-600 rounded-lg" : "transform h-0 scale-95 transition ease-in duration-75 overflow-hidden"}>
                        <li className="hover:bg-blue-500 rounded-lg flex"><Link to="/experiences" className="flex items-center gap-2 py-1"><CalendarHeart />Exp Calendar</Link></li>
                        <li className="hover:bg-blue-500 rounded-lg flex"><Link to="/set-service-staff" className="flex items-center gap-2 py-1"><UserPlus />Assign Staff</Link></li>
                        <li className="hover:bg-blue-500 rounded-lg flex"><Link to="/set-staff" className="flex items-center gap-2 py-1"><Ship />Assign Boat</Link></li>
                    </div>
                </div>
                <li className="px-4 py-2 rounded-lg  hover:bg-blue-700"><Link to="/cashFlow" className="flex items-center gap-2"><DollarSign />Cash Flow</Link></li>
                <li className="px-4 py-2 rounded-lg  hover:bg-blue-700"><Link to="/bookings" className="flex items-center gap-2"><BedDouble />Rooms</Link></li>
                <div className="px-4 py-2 block rounded-lg  hover:bg-blue-700 transition delay-200">
                    <li className="rounded-lg flex gap-2" onClick={() => setOpenSetting(!openSetting)}><Settings className="inline-block" /><span className="inline-block">Settings</span><ChevronDown className={openSetting ? "block rotate-180" : "block"} /></li>
                    <div className={openSetting ? "py-4 px-5 w-full p-4 transition ease-out duration-100 transform opacity-100 scale-100 hover:bg-blue-600 rounded-lg" : "transform h-0 scale-95 transition ease-in duration-75 overflow-hidden"}>
                        <li className="hover:bg-blue-500 rounded-lg"><Link to="/set-users" className="flex items-center gap-2 py-1"><ShieldUser />Users</Link></li>
                        <li className="hover:bg-blue-500 rounded-lg"><Link to="/set-staff" className="flex items-center gap-2 py-1"><Contact />Staff</Link></li>
                        <li className="hover:bg-blue-500 rounded-lg"><Link to="/set-rooms" className="flex items-center gap-2 py-1"><Bed />Rooms</Link></li>
                        <li className="hover:bg-blue-500 rounded-lg"><Link to="/set-products" className="flex items-center gap-2 py-1"><Boxes />Products</Link></li>
                        <li className="hover:bg-blue-500 rounded-lg"><Link to="/set-store" className="flex items-center gap-2 py-1"><Store />Store</Link></li>
                    </div>
                </div>
            </ul>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
				font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700
				 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
            >
                Logout
            </motion.button>
        </div>
    )
}

export default LeftMenu