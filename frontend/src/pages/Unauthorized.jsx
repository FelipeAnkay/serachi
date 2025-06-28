import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Unauthorized Access</h1>
      <p className="text-gray-700 mb-6 max-w-xl">
        You are not authorized to view this page. Please make sure you accessed the form using a valid and secure link.
      </p>
    </div>
  );
};

export default Unauthorized;
