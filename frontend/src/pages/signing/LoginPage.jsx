import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader, Building } from 'lucide-react';
import { Link } from "react-router-dom";
import Input from "../../components/Input";
import { useAuthStore } from '../../store/authStore';
import Cookies from 'js-cookie';
import { useStoreServices } from '../../store/storeServices';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeId, setStoreId] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const { getStoreById } = useStoreServices();

  const handleLogin = async (e) => {
    e.preventDefault();
    const normalizedStore = storeId.toUpperCase();
    await login(normalizedStore, email, password);
    //console.log("almacenando cookie", storeId);
    Cookies.set('storeId', storeId);
    const store = await getStoreById(storeId)
    //console.log ("La store encontrada es:", store)
    Cookies.set('timezone', store.store.timezone);
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='fixed inset-0 flex items-center justify-center z-50 bg-blue-950 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
        overflow-hidden'
    >
      <div className="p-8">
        <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-700 text-transparent bg-clip-text'>
          Welcome Back
        </h2>
        <form
          onSubmit={handleLogin}
        >
          <Input
            icon={Building}
            type='text'
            placeholder='Company ID'
            value={storeId}
            autoFocus
            onChange={(e) => setStoreId(e.target.value)}
          />
          <Input
            icon={Mail}
            type='email'
            placeholder='Email address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon={Lock}
            type='password'
            placeholder='Enter Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className='flex items-center mb-6'>
            <Link to='/forgot-password' className='text-sm text-blue-400 hover:underline'>
              Forgot password?
            </Link>
          </div>
          {error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
          <motion.button
            className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white 
                      font-bold rounded-lg shadow-lg hover:from-blue-600
                      hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       focus:ring-offset-gray-900 transition duration-200'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? <Loader className='size-6 animate-spin mx-auto' /> : "Login"}
          </motion.button>
        </form>
        <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center mt-2'>
          <p className='text-sm text-gray-400'>
            Don&apos;t have an account?{" "}
            <Link to={"/signup"} className='text-blue-400 hover:underline'>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default LoginPage