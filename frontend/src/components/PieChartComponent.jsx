import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A28EFF", "#FF6C8F", "#55D8C1", "#FFD166"
];

const groupAndSum = (data, datakey, values) => {
  const grouped = {};
  for (const item of data) {
    const key = item[datakey];
    const value = parseFloat(item[values]) || 0;
    if (!grouped[key]) grouped[key] = 0;
    grouped[key] += value;
    grouped[key] = parseFloat(grouped[key].toFixed(2));
  }
  return Object.entries(grouped).map(([key, value]) => ({ name: key, value }));
};

const PieChartComponent = ({ isOpen, onClose, data, values, datakey, title }) => {
  if (!data || !Array.isArray(data) || !values || !datakey) return null;

  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isOpen]);

  const processedData = groupAndSum(data, datakey, values);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/95 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900">{title || "Pie Chart"}</h2>
                <button onClick={onClose} className="text-slate-900 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {processedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PieChartComponent;