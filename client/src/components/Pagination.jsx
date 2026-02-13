import React from 'react';

export default function Pagination({ prevPage, nextPage, onPageChange }) {
  // Common button styles
  const btnBase = "px-6 sm:px-8 py-3.5 rounded-full text-sm font-black transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-2xl transform";
  const btnActive = "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white hover:scale-110 active:scale-95";
  const btnDisabled = "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50";

  return (
    <div className="flex justify-center items-center gap-5 mt-12 mb-12 px-4" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <button
        onClick={() => onPageChange(prevPage)}
        disabled={!prevPage}
        className={`${btnBase} ${prevPage ? btnActive : btnDisabled} group`}
        aria-label="Previous page"
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline font-black tracking-wide">Previous</span>
        <span className="sm:hidden font-black">Prev</span>
      </button>

      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse shadow-sm"></div>
        <div className="h-2 w-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse animation-delay-150 shadow-sm"></div>
        <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-pulse animation-delay-300"></div>
      </div>

      <button
        onClick={() => onPageChange(nextPage)}
        disabled={!nextPage}
        className={`${btnBase} ${nextPage ? btnActive : btnDisabled} group`}
        aria-label="Next page"
      >
        <span className="hidden sm:inline font-black tracking-wide">Next</span>
        <span className="sm:hidden font-black">Next</span>
        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}