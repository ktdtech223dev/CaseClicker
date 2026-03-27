import React, { useState } from 'react';

export default function PriceResetTooltip({ className = '' }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-500 hover:text-gray-400 cursor-help">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a1d23] border border-gray-700 rounded-lg text-xs text-gray-300 whitespace-nowrap z-50 shadow-lg">
          Prices reset at 12:00 AM CST
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#1a1d23] border-r border-b border-gray-700 rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
}
