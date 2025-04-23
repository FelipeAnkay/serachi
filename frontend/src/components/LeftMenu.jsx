import { BedDouble, DollarSign, Home, MapPinCheckInside, Settings } from "lucide-react"
import logo from "../../public/Serachi_logo-nobg.png"
import { Link } from "react-router-dom"

const LeftMenu = ({show}) => {
    return (
        <div className={show ? "h-screen w-64 bg-gray-900/30 text-white p-4 ease-in duration-300 ml-0" : "h-screen -ml-100 ease-out duration-500"}>
            <img src={logo} alt="logo" className="w-20 h-20 flex items-center justify-center"/>
            <h2 className="text-xl font-bold mb-6">Serachi</h2>
            <ul className="space-y-3">
                <li className="px-4 py-2 rounded-lg transition hover:bg-blue-700"><Link to="/" className="flex items-center gap-2"><Home/>Home</Link></li>
                <li className="px-4 py-2 rounded-lg transition hover:bg-blue-700"><Link to="/experiences" className="flex items-center gap-2"><MapPinCheckInside/>Experiences</Link></li>    
                <li className="px-4 py-2 rounded-lg transition hover:bg-blue-700"><Link to="/cashFlow" className="flex items-center gap-2"><DollarSign/>Cash Flow</Link></li>
                <li className="px-4 py-2 rounded-lg transition hover:bg-blue-700"><Link to="/bookings" className="flex items-center gap-2"><BedDouble/>Bookings</Link></li>
                <li className="px-4 py-2 rounded-lg transition hover:bg-blue-700"><Link to="/settings" className="flex items-center gap-2"><Settings/>Settings</Link></li>
            </ul>
        </div>
    )
}

export default LeftMenu