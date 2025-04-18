import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Loader } from 'lucide-react';
import Input from '../components/Input';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { resetPassword, error, isLoading, message } = useAuthStore();
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword){
            alert ("Passwords do not match");
            return;
        }
        try {
            await resetPassword(token, password);
            toast.success("Password reset successfully, redirecting to login page...");
            setTimeout(() => {
                navigate("/login")
            }, 2000);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error reseting Password")
            
        }
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
                    Reset Password
                </h2>
                {error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
                {message && <p className='text-blue-500 font-semibold mb-2'>{message}</p>}

                <form onSubmit={handleSubmit}>
                    <p className='text-gray-300 mb-6 text-center'>Enter your email address and we'll send you a link to reset your password</p>
                    <Input
                        icon={Lock}
                        type='password'
                        placeholder='New Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Input
                        icon={Lock}
                        type='password'
                        placeholder='Confirm New Password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
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
                        {isLoading ? <Loader className='size-6 animate-spin mx-auto' /> : "Set New Password"}
                    </motion.button>
                </form>

            </div>
        </motion.div>
    )
}

export default ResetPasswordPage