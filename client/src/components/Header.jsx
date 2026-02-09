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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // "Chain Refresh": Hit the backend 5 times to cover more clubs
      // effectively bypassing the single-request timeout limit.
      let successCount = 0;
      for (let i = 0; i < 5; i++) {
          await triggerRefresh();
          successCount++;
          // Small delay between hits to be nice to the server
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

  const isRestActive = selectedClub && !topSlugs.includes(selectedClub);

  
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl sm:text-4xl md:text-5xl">📖</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-red-600 to-purple-700">EPL BIBLE</span>
              </h1>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs font-semibold tracking-widest mt-1.5 uppercase">✨ The Ultimate Premier League Guide ✨</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${refreshing ? 'opacity-60 cursor-not-allowed scale-100' : ''}`}
            >
              <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>🔄</span> 
              <span className="hidden md:inline">{refreshing ? 'Syncing...' : 'Refresh Feed'}</span>
            </button>

            <button 
              onClick={handleRefreshMobile}
              disabled={refreshing}
              className={`sm:hidden px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 ${refreshing ? 'opacity-60 cursor-not-allowed scale-100' : ''}`}
              title="Refresh Feed"
            >
              <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
            </button>

            <a 
              href="https://www.premierleague.com/tables" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 rounded-xl text-sm font-bold transition-all duration-200"
            >
              <span className="text-lg">📊</span> <span className="hidden md:inline">League Table</span>
            </a>
          </div>
        </div>

        {/* Filter Scroll Container */}
        <div className="relative group mt-1">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide items-center">
            
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
                    flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 transform border-2
                    ${isActive
                      ? `bg-gradient-to-br ${gradient} ${textColor} shadow-xl ring-2 ring-offset-2 ring-white hover:scale-105 hover:shadow-2xl border-transparent`
                      : "bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:shadow-md hover:scale-105"
                    }
                  `}
                >
                  {club.name}
                </button>
              );
            })}

            {/* Separator Divider */}
            <div className="hidden sm:block w-[2px] h-8 bg-gradient-to-b from-transparent via-slate-300 to-transparent mx-0.5"></div>
            <div className="sm:hidden w-[1px] h-6 bg-slate-300 mx-0.5"></div>

            {/* Rest of League Button */}
            <button
                onClick={() => onFilterChange('premier-league')}
                className={`
                    flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 transform border-2
                    ${selectedClub === 'premier-league'
                        ? "bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-xl ring-2 ring-offset-2 ring-white hover:scale-105 hover:shadow-2xl border-transparent"
                        : "bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:shadow-md hover:scale-105"
                    }
                `}
            >
                <span className="hidden sm:inline">🏆 All </span><span className="sm:hidden">🏆</span> Teams
            </button>
            
          </div>
          
          {/* Fade effect on right for scrolling indication */}
          <div className="absolute right-0 top-0 bottom-2 w-8 sm:w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      </div>
    </header>
  );
}
