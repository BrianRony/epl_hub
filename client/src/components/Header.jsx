import React, { useState } from 'react';
import { triggerRefresh } from '../services/api';

export default function Header({ clubs, selectedClub, onFilterChange }) {
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const openWatchInPIP = async () => {
    try {
      const video = document.createElement('video');
      video.src = 'https://soccer.totalsportek.army/';
      video.style.display = 'none';
      document.body.appendChild(video);
      
      // Try to open in Picture-in-Picture mode
      if (document.pictureInPictureEnabled) {
        try {
          await video.requestPictureInPicture();
        } catch (err) {
          // If PIP not available, just open in new window
          window.open('https://soccer.totalsportek.army/', '_blank', 'width=800,height=600');
        }
      } else {
        // Fallback to embedded iframe in a popup window
        const width = 800;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        window.open('https://soccer.totalsportek.army/', 'watchpl', `width=${width},height=${height},left=${left},top=${top}`);
      }
    } catch (error) {
      // Ultimate fallback: just open normally
      window.open('https://soccer.totalsportek.army/', '_blank');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      let successCount = 0;
      for (let i = 0; i < 5; i++) {
          await triggerRefresh();
          successCount++;
          await new Promise(r => setTimeout(r, 1000));
      }
      
      alert(`News refreshed! (Batch ran ${successCount} times). Content updating...`);
      window.location.reload(); 
    } catch (e) {
      console.error(e);
      alert("Refresh finished with some errors. Try again if data is missing.");
      window.location.reload();
    }
    setRefreshing(false);
  };

  const handleRefreshMobile = async () => {
    setRefreshing(true);
    try {
      let successCount = 0;
      for (let i = 0; i < 5; i++) {
          await triggerRefresh();
          successCount++;
          await new Promise(r => setTimeout(r, 1000));
      }
      alert(`Refreshed!`);
      window.location.reload(); 
    } catch (e) {
      console.error(e);
      window.location.reload();
    }
    setRefreshing(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-xl border-b border-slate-200/80 shadow-lg transition-all duration-300">
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-5">
        {/* Title and Action Buttons - Centered */}
        <div className="flex flex-col items-center justify-center gap-5 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-5xl sm:text-6xl md:text-7xl animate-bounce-slow">📖</span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-red-600 to-purple-700 animate-gradient">
                  EPL BIBLE
                </span>
              </h1>
            </div>
            <p className="text-slate-500 text-[11px] sm:text-sm font-bold tracking-widest uppercase">
              ✨ The Ultimate Premier League Guide ✨
            </p>
          </div>

          {/* Action Buttons - Centered */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`hidden sm:flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white rounded-full text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${refreshing ? 'opacity-60 cursor-not-allowed scale-100 animate-pulse' : ''}`}
            >
              <span className={`text-xl ${refreshing ? 'animate-spin' : ''}`}>🔄</span> 
              <span className="hidden md:inline tracking-wide">{refreshing ? 'Syncing Feed...' : 'Refresh Feed'}</span>
            </button>

            <button 
              onClick={handleRefreshMobile}
              disabled={refreshing}
              className={`sm:hidden px-4 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white rounded-full text-xs font-extrabold transition-all duration-300 transform hover:scale-105 shadow-lg ${refreshing ? 'opacity-60 cursor-not-allowed scale-100 animate-pulse' : ''}`}
              title="Refresh Feed"
            >
              <span className={`inline ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
              <span className="ml-1.5 align-middle">{refreshing ? 'Sync' : 'Refresh'}</span>
            </button>

            <button 
              onClick={openWatchInPIP}
              className="flex items-center gap-2.5 px-5 sm:px-7 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:via-red-600 hover:to-red-700 text-white rounded-full text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              title="Watch Premier League (opens in new window or Picture-in-Picture)"
            >
              <span className="text-lg sm:text-xl animate-pulse">📺</span> 
              <span className="tracking-wide">Watch Live</span>
              <span className="hidden sm:inline">PL</span>
            </button>
          </div>
        </div>

        {/* Club Selector: mobile dropdown + md+ centered inline selector */}
        <div className="relative mt-5">
          {/* Mobile: original dropdown trigger (hidden on md+) */}
          <div className="md:hidden">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-2 border-slate-300 rounded-xl font-extrabold text-slate-800 text-sm transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span className="text-xl">⚽</span>
              <span className="truncate max-w-xs">
                {selectedClub === 'premier-league'
                  ? '🏆 All Teams'
                  : selectedClub
                    ? clubs.find(c => c.slug === selectedClub)?.name || 'Select Club'
                    : 'Select Club'
                }
              </span>
              <svg className={`w-5 h-5 ml-auto transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu (mobile) */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-slate-200 rounded-xl shadow-2xl z-40 max-h-96 overflow-y-auto" style={{ animation: 'slideDown 0.3s ease-out' }}>
                <button
                  onClick={() => { onFilterChange('premier-league'); setDropdownOpen(false); }}
                  className={`w-full text-left px-5 py-3.5 flex items-center gap-3 transition-all duration-200 border-b-2 border-slate-100 last:border-b-0 ${selectedClub === 'premier-league' ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 font-extrabold' : 'text-slate-700 hover:bg-slate-50 font-bold'}`}>
                  <span className="text-xl">🏆</span>
                  <span className="font-extrabold">All Teams</span>
                </button>

                <div className="border-b-2 border-slate-100 px-2 py-2">
                  <p className="text-xs font-extrabold text-slate-500 uppercase px-3 py-2 mb-1 tracking-wider">Big 5</p>
                  {clubs.filter(c => ['manchester-city','chelsea','arsenal','manchester-united','liverpool'].includes(c.slug)).map(club => (
                    <button key={club.id} onClick={() => { onFilterChange(club.slug); setDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2.5 transition-all duration-200 text-sm ${selectedClub === club.slug ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-extrabold shadow-sm' : 'text-slate-700 hover:bg-slate-100 font-semibold'}`}>
                      {selectedClub === club.slug && <span className="text-blue-600">✓</span>}
                      {club.name}
                    </button>
                  ))}
                </div>

                <div className="px-2 py-2">
                  <p className="text-xs font-extrabold text-slate-500 uppercase px-3 py-2 mb-1 tracking-wider">Other Teams</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {clubs.filter(c => !['manchester-city','chelsea','arsenal','manchester-united','liverpool'].includes(c.slug)).map(club => (
                      <button key={club.id} onClick={() => { onFilterChange(club.slug); setDropdownOpen(false); }} className={`text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 ${selectedClub === club.slug ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-extrabold shadow-sm' : 'text-slate-700 hover:bg-slate-100 font-semibold'}`}>
                        {club.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {dropdownOpen && <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />}
          </div>

          {/* Desktop / Wide screens: centered inline selector */}
          <div className="hidden md:flex items-center justify-center">
            <select
              value={selectedClub || 'premier-league'}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-96 px-5 py-3.5 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-300 rounded-xl shadow-lg text-sm font-extrabold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 hover:shadow-xl cursor-pointer"
              aria-label="Select Club"
            >
              <option value="premier-league">🏆 All Teams</option>
              <optgroup label="Big 5" className="font-extrabold">
                {clubs.filter(c => ['manchester-city','chelsea','arsenal','manchester-united','liverpool'].includes(c.slug)).map(club => (
                  <option key={club.id} value={club.slug}>{club.name}</option>
                ))}
              </optgroup>
              <optgroup label="Other Teams" className="font-bold">
                {clubs.filter(c => !['manchester-city','chelsea','arsenal','manchester-united','liverpool'].includes(c.slug)).map(club => (
                  <option key={club.id} value={club.slug}>{club.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          
          @keyframes gradient {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 4s ease infinite;
          }
        `}</style>
      </div>
    </header>
  );
}