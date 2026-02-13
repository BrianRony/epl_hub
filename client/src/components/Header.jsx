import React, { useMemo, useState } from 'react';
import { triggerRefresh } from '../services/api';

const getClubGradient = (slug) => {
  const gradients = {
    // Big 6 + Challengers
    arsenal: "from-red-600 via-red-500 to-white",
    "aston-villa": "from-red-900 via-blue-800 to-blue-900",
    chelsea: "from-blue-700 via-blue-600 to-white",
    everton: "from-blue-800 via-blue-600 to-white",
    liverpool: "from-red-700 via-red-600 to-red-800",
    "manchester-city": "from-sky-300 via-sky-400 to-white",
    "manchester-united": "from-red-700 via-red-600 to-black",
    newcastle: "from-black via-gray-800 to-gray-500",
    "tottenham-hotspur": "from-blue-900 via-gray-100 to-white", 
    spurs: "from-blue-900 via-gray-100 to-white",
    "west-ham": "from-red-800 via-blue-400 to-blue-800",
    wolves: "from-yellow-500 via-yellow-400 to-black",

    // Rest of League
    brighton: "from-blue-500 via-white to-blue-500",
    brentford: "from-red-600 via-white to-black",
    "crystal-palace": "from-blue-700 via-red-600 to-blue-800",
    fulham: "from-black via-white to-black",
    "nottingham-forest": "from-red-600 via-red-500 to-white",
    bournemouth: "from-red-700 via-black to-red-600",
    leicester: "from-blue-600 via-blue-500 to-white",
    southampton: "from-red-600 via-white to-red-600",
    ipswich: "from-blue-600 via-blue-500 to-white",
    
    // General
    "premier-league": "from-purple-900 via-purple-600 to-emerald-400",
  };
  return gradients[slug] || "from-slate-700 to-slate-500";
};

const getClubTextColor = (slug) => {
   // For active state text color contrast against the gradient
   const lightText = ['arsenal', 'aston-villa', 'chelsea', 'everton', 'liverpool', 'manchester-united', 'newcastle', 'west-ham', 'wolves', 'tottenham-hotspur', 'spurs', 'nottingham-forest', 'bournemouth', 'crystal-palace', 'brentford', 'leicester', 'ipswich', 'premier-league', 'fulham'];
   
   if (['manchester-city', 'brighton', 'southampton'].includes(slug)) return 'text-slate-900'; 
   
   return 'text-white';
}

export default function Header({ clubs, selectedClub, onFilterChange }) {
  const [refreshing, setRefreshing] = useState(false);

  const openWatchInPIP = async () => {
    try {
      const video = document.createElement('video');
      video.src = 'https://totalsportek.army/';
      video.style.display = 'none';
      document.body.appendChild(video);
      
      // Try to open in Picture-in-Picture mode
      if (document.pictureInPictureEnabled) {
        try {
          await video.requestPictureInPicture();
        } catch (err) {
          // If PIP not available, just open in new window
          window.open('https://totalsportek.army/', '_blank', 'width=800,height=600');
        }
      } else {
        // Fallback to embedded iframe in a popup window
        const width = 800;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        window.open('https://totalsportek.army/', 'watchpl', `width=${width},height=${height},left=${left},top=${top}`);
      }
    } catch (error) {
      // Ultimate fallback: just open normally
      window.open('https://totalsportek.army/', '_blank');
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

  // 1. Prioritize and separate clubs
  const topSlugs = ['manchester-city', 'chelsea', 'arsenal', 'manchester-united', 'liverpool'];
  
  const topTeams = useMemo(() => {
    const clubMap = new Map(clubs.map(c => [c.slug, c]));
    const top = [];
    topSlugs.forEach(slug => {
        if (clubMap.has(slug)) {
            top.push(clubMap.get(slug));
        }
    });
    return top;
  }, [clubs]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 py-3 sm:py-4">
        {/* Title and Action Buttons - Centered */}
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl sm:text-5xl md:text-6xl">📖</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-red-600 to-purple-700">EPL BIBLE</span>
              </h1>
            </div>
            <p className="text-slate-400 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">✨ The Ultimate Premier League Guide ✨</p>
          </div>

          {/* Action Buttons - Centered */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${refreshing ? 'opacity-60 cursor-not-allowed scale-100' : ''}`}
            >
              <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>🔄</span> 
              <span className="hidden md:inline">{refreshing ? 'Syncing...' : 'Refresh Feed'}</span>
            </button>

            <button 
              onClick={handleRefreshMobile}
              disabled={refreshing}
              className={`sm:hidden px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full text-xs font-bold transition-all duration-200 transform hover:scale-105 ${refreshing ? 'opacity-60 cursor-not-allowed scale-100' : ''}`}
              title="Refresh Feed"
            >
              <span className={`inline ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
              <span className="ml-1 align-middle">{refreshing ? 'Sync' : 'Refresh'}</span>
            </button>

            <button 
              onClick={openWatchInPIP}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              title="Watch Premier League (opens in new window or Picture-in-Picture)"
            >
              <span className="text-base sm:text-lg">📺</span> 
              <span>Watch</span>
              <span className="hidden sm:inline">PL</span>
            </button>
          </div>
        </div>

        {/* Filter Scroll Container - Team Selection */}
        <div className="relative group mt-4">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide items-center justify-center">
            
            {/* Top 5 Teams */}
            {topTeams.map((club) => {
              const isActive = selectedClub === club.slug;
              const gradient = getClubGradient(club.slug);
              const textColor = isActive ? getClubTextColor(club.slug) : 'text-slate-600';

              return (
                <button
                  key={club.id}
                  onClick={() => onFilterChange(club.slug)}
                  className={`
                    flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 transform border-2 whitespace-nowrap
                    ${isActive
                      ? `bg-gradient-to-br ${gradient} ${textColor} shadow-lg ring-2 ring-offset-2 ring-white hover:scale-105 hover:shadow-xl border-transparent`
                      : "bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400 hover:shadow-md hover:scale-105"
                    }
                  `}
                >
                  {club.name}
                </button>
              );
            })}

            {/* Separator Divider */}
            <div className="w-[1px] h-6 bg-slate-300 mx-1"></div>

            {/* Rest of League Button */}
            <button
                onClick={() => onFilterChange('premier-league')}
                className={`
                    flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 transform border-2 whitespace-nowrap
                    ${selectedClub === 'premier-league'
                        ? "bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-lg ring-2 ring-offset-2 ring-white hover:scale-105 hover:shadow-xl border-transparent"
                        : "bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400 hover:shadow-md hover:scale-105"
                    }
                `}
            >
                <span>🏆</span> <span className="hidden sm:inline">All</span> Teams
            </button>
            
          </div>
          
          {/* Fade effect on right for scrolling indication */}
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      </div>
    </header>
  );
}
