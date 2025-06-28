import React from 'react'

const Input = ({ icon: Icon, ...props }) => {
    return (
        <div className='relative mb-6'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <Icon className='size-5 text-[#3BA0AC]' />
            </div>
            <input
                {...props}
                className='w-full pl-10 pr-3 py-2 bg-white rounded-lg border border-gray-700 focus:border-cyan-200 focus:ring-2 focus:ring-cyan-500 text-slate-800 placeholder-gray-400 transition duration-200'
            />
        </div>
    );
};
export default Input;