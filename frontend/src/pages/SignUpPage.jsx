import React from 'react'
import { motion } from "framer-motion";
import Input from "../components/Input";
import { User } from "lucide-react";
import { useState } from "react";

const SignUpPage = () => {

  const [name, setName] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-md w-full bg-blue-950 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
    overflow-hidden'
    >
      <div className="p-8">
        <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-700 text-transparent bg-clip-text'>
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
        </form>
      </div>
    </motion.div>
  );
};
export default SignUpPage;
