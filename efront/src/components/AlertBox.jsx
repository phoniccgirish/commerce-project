import React from "react";

const AlertBox = ({ type = "success", message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  return (
    <div
      className={`border px-4 py-3 rounded relative ${styles[type]} mb-4`}
      role='alert'
    >
      <span className='block sm:inline'>{message}</span>
      <button
        onClick={onClose}
        className='absolute top-0 bottom-0 right-0 px-4 py-3 focus:outline-none'
      >
        <span className='text-xl'>&times;</span>
      </button>
    </div>
  );
};

export default AlertBox;
