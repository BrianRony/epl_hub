import React from 'react';

export default function Pagination({ prevPage, nextPage, onPageChange }) {
  // Common button styles
  const btnBase = "px-4 sm:px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md";
  const btnActive = "bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95";
  const btnDisabled = "bg-slate-100 text-slate-400 cursor-not-allowed";

  return (
    <div className="flex justify-center items-center gap-3 mt-8 mb-8" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <button
        onClick={() => onPageChange(prevPage)}
        disabled={!prevPage}
        className={`${btnBase} ${prevPage ? btnActive : btnDisabled}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline text-xs">Previous</span>
      </button>

      <div className="h-1.5 w-1.5 bg-slate-300 rounded-full"></div>

      <button
        onClick={() => onPageChange(nextPage)}
        disabled={!nextPage}
        className={`${btnBase} ${nextPage ? btnActive : btnDisabled}`}
      >
        <span className="hidden sm:inline text-xs">Next</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
