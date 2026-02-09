import React from 'react';

export default function Pagination({ prevPage, nextPage, onPageChange }) {
  // Common button styles
  const btnBase = "px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2";
  const btnActive = "bg-white text-slate-800 shadow-sm border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md active:scale-95";
  const btnDisabled = "bg-slate-50 text-slate-300 border border-transparent cursor-not-allowed";

  return (
    <div className="flex justify-center items-center gap-3 sm:gap-4 mt-12 sm:mt-16 mb-8 sm:mb-12">
      <button
        onClick={() => onPageChange(prevPage)}
        disabled={!prevPage}
        className={`${btnBase} ${prevPage ? btnActive : btnDisabled}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Previous
      </button>

      <div className="h-1 w-1 bg-slate-300 rounded-full"></div>

      <button
        onClick={() => onPageChange(nextPage)}
        disabled={!nextPage}
        className={`${btnBase} ${nextPage ? btnActive : btnDisabled}`}
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
