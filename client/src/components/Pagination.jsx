import React from 'react';

export default function Pagination({ prevPage, nextPage, onPageChange }) {
  // Common button styles
  const btnBase = "px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform";
  const btnActive = "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border border-transparent hover:scale-105 active:scale-95";
  const btnDisabled = "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed";

  return (
    <div className="flex justify-center items-center gap-4 sm:gap-6 mt-16 sm:mt-20 mb-12 sm:mb-16" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <button
        onClick={() => onPageChange(prevPage)}
        disabled={!prevPage}
        className={`${btnBase} ${prevPage ? btnActive : btnDisabled}`}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="h-2 sm:h-2.5 w-2 sm:w-2.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>

      <button
        onClick={() => onPageChange(nextPage)}
        disabled={!nextPage}
        className={`${btnBase} ${nextPage ? btnActive : btnDisabled}`}
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
