// components/DeleteService.jsx
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import {useServiceServices} from "../store/serviceServices"; // Ajusta el path si es necesario
import { useState } from "react";

const DeleteService = ({ serviceId, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const {removeServicesById} = useServiceServices();


  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this service?");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await removeServicesById(serviceId);
      if (onDeleted) onDeleted(); // Callback opcional
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete the service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={loading}
      onClick={handleDelete}
      className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg shadow-lg
                 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex flex-col justify-center items-center">
        <Trash2 className="" />
        <span className="">{loading ? "Deleting..." : "Delete"}</span>
      </div>
    </motion.button>
  );
};

export default DeleteService;