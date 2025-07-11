import React from 'react'
import { motion } from 'framer-motion'
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { formatDate } from "../utils/date";
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStoreServices } from '../store/storeServices';

const HomePage = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.unauthorized) {
      toast.error("User or store not authorized to use this option");
    }
  }, [location]);

  const handleLogout = () => {
    logout();
  };
  return (
        <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
            <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col w-full max-w-9/12 mx-auto bg-[#18394C] bg-opacity-80 backdrop-filter backdrop-blur-lg  overflow-hidden min-h-screen items-center p-4"
            >
        <h2 className='text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text'>
          Welcome to Serachi
        </h2>
        <div className='space-y-6  rounded-2xl px-5 py-2 '>
          <motion.div
            className='p-4 bg-white bg-opacity-50 rounded-lg border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className='text-xl font-semibold text-[#00C49F] mb-3'>Profile Information</h3>
            <p className='text-slate-900'>Name: {user.name}</p>
            <p className='text-slate-900'>Email: {user.email}</p>
          </motion.div>
          <motion.div
            className='p-4 bg-white bg-opacity-50 rounded-lg border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className='text-xl font-semibold text-[#00C49F] mb-3'>Account Activity</h3>
            <p className='text-slate-900'>
              <span className='font-bold'>Joined: </span>
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className='text-slate-900'>
              <span className='font-bold'>Last Login: </span>

              {formatDate(user.lastLogin)}
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='mt-4'
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className='mt-5 mx-4 py-2 px-4 bg-[#118290] hover:bg-[#0d6c77] text-slate-800 font-bold rounded-lg shadow-lg'
          >
            Logout
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default HomePage