import { Bed, BedDouble, Boxes, ChevronDown, DollarSign, Home, MapPinCheckInside, Settings, Store, User } from "lucide-react"
import logo from "../../public/Serachi_logo-nobg.png"
import { Link } from "react-router-dom"
import { useState } from "react"

const LeftMenu = ({ show }) => {
    const [openSetting, setOpenSetting] = useState(false);
    //const [openExp, setOpenExp] = useState(false);
    return (
        <div className={show ? "h-screen w-64 bg-gray-900/30 text-white p-4 ease-in duration-300 ml-0" : "h-screen -ml-100 ease-out duration-500"}>
            <img src={logo} alt="logo" className="w-20 h-20 flex items-center justify-center" />
            <h2 className="text-xl font-bold mb-6">Serachi</h2>
            <ul className="space-y-3">
                <li className="px-4 py-2 rounded-lg  hover:bg-blue-700"><Link to="/" className="flex items-center gap-2"><Home />Home</Link></li>
                <li className="px-4 py-2 rounded-lg  hover:bg-blue-700"><Link to="/experiences" className="flex items-center gap-2"><MapPinCheckInside />Experiences</Link></li>
                <li className="px-4 py-2 rounded-lg  hover:bg-blue-700"><Link to="/cashFlow" className="flex items-center gap-2"><DollarSign />Cash Flow</Link></li>
                <li className="px-4 py-2 rounded-lg  hover:bg-blue-700"><Link to="/bookings" className="flex items-center gap-2"><BedDouble />Bookings</Link></li>
                <div className="px-4 py-2 block rounded-lg  hover:bg-blue-700 transition delay-200">
                   <li className="rounded-lg flex gap-2" onClick={() => setOpenSetting(!openSetting)}><Settings className="inline-block" /><span className="inline-block">Settings</span><ChevronDown className={openSetting ? "block rotate-180" : "block"}/></li>
                    <div className={openSetting ? "py-4 w-64 p-4 transition ease-out duration-100 transform opacity-100 scale-100" : "transform h-0 scale-95 transition ease-in duration-75 overflow-hidden"}>
                        <li><Link to="/set-users" className="flex items-center gap-2 py-1"><User/>Users</Link></li>
                        <li><Link to="/set-rooms" className="flex items-center gap-2 py-1"><Bed/>Rooms</Link></li>
                        <li><Link to="/set-products" className="flex items-center gap-2 py-1"><Boxes/>Products</Link></li>
                        <li><Link to="/set-store" className="flex items-center gap-2 py-1"><Store/>Store</Link></li>
                    </div>
                </div>
            </ul>
        </div>
    )
}

export default LeftMenu