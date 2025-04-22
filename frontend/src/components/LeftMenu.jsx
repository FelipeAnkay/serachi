// src/components/LeftMenu.jsx
import { useState } from "react";
import { Home, DollarSign, CalendarCheck, Settings } from "lucide-react";

const menuItems = [
  { label: "Experiences", icon: <Home /> },
  { label: "Cash Flow", icon: <DollarSign /> },
  { label: "Bookings", icon: <CalendarCheck /> },
  { label: "Settings", icon: <Settings /> },
];

export default function LeftMenu() {
  const [active, setActive] = useState("Experiences");

  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li
            key={item.label}
            onClick={() => setActive(item.label)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition hover:bg-gray-700 ${
              active === item.label ? "bg-gray-700" : ""
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}