import React from 'react'
import { motion } from "framer-motion";
import Input from "../../components/Input";
import { Loader, Lock, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import PasswordStrenghtMeter from '../../components/PasswordStrenghtMeter';
import { useAuthStore } from '../../store/authStore';

const SignUpPage = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const { signup, error, isLoading } = useAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      //console.log("Creare el siguiente usuario:", email, " - ", password, " - ", email, " - ", phone)
      await signup(email, password, name, phone);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-[#18394C] bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
overflow-hidden flex flex-col justify-center mx-auto"
    >
      <div className="p-8">
        <h2 className='text-3xl font-bold mb-6 text-center text-[#00C49F] bg-clip-text'>
          Create Account
        </h2>
        <form onSubmit={handleSignUp}>
          <Input
            icon={User}
            type='text'
            placeholder='Full Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            icon={Mail}
            type='email'
            placeholder='Email address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon={Phone}
            type='string'
            placeholder='Country code + Phone number'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            icon={Lock}
            type='password'
            placeholder='Enter Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className='text-red-700 font-semibold mt-2'>{error}</p>}
          <PasswordStrenghtMeter password={password} />

          <motion.button
            className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-700 text-slate-800 
						font-bold rounded-lg shadow-lg hover:from-blue-600
						hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? <Loader className='animated-s mx-auto' size={24} /> : "Sign Up"}
          </motion.button>
        </form>
      </div>
      <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
        <p className='text-sm text-gray-400'>
          Already have an account?{" "}
          <Link to={"/login"} className='text-blue-400 hover:underline'>
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
export default SignUpPage;
