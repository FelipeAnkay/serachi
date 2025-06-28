import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader, Building } from 'lucide-react';
import { Link } from "react-router-dom";
import Input from "../../components/Input";
import { useAuthStore } from '../../store/authStore';
import Cookies from 'js-cookie';
import { useStoreServices } from '../../store/storeServices';
import { useNavigate } from "react-router-dom";
import { useCustomerServices } from '../../store/customerServices';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeId, setStoreId] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const { getStoreById } = useStoreServices();
  const { getCustomerList } = useCustomerServices();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const normalizedStore = storeId.toUpperCase();
      await login(normalizedStore, email, password);
      //console.log("almacenando cookie", storeId);
      Cookies.set('storeId', storeId);
      const store = await getStoreById(storeId)
      //console.log ("La store encontrada es:", store)
      Cookies.set('timezone', store.store.timezone);
      window.location.reload();
    } catch (error) {

    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='fixed inset-0 flex items-center justify-center z-50 bg-[#18394C] bg-opacity-50 backdrop-filter backdrop-blur-xl shadow-xl 
        overflow-hidden'
    >
      <div className="p-8">
        <h2 className='text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text'>
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
            <Link to='/forgot-password' className='text-sm text-cyan-200 hover:underline'>
              Forgot password?
            </Link>
          </div>
          {error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
          <motion.button
            className='mt-5 w-full py-3 px-4 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 rounded transition duration-200'
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
            <Link to={"/signup"} className='text-cyan-200 hover:underline'>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default LoginPage