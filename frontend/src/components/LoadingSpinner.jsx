import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = () => {
	return (
		<div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-blue-700 to-blue-900 flex flex-col items-center justify-center">
			{/* Simple Loading Spinner */}
			<motion.div
				className='w-16 h-16 border-4 border-t-4 border-t-blue-500 border-blue-200 rounded-full'
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
			/>
			<div>
				<p className='text-white mt-2 text-lg font-semibold'>Loading...</p>
			</div>
		</div>
	)
}

export default LoadingSpinner