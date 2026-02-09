import React, { useMemo } from 'react';

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
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
              EPL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">HUB</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide mt-1">THE PREMIER LEAGUE PULSE</p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a 
              href="https://www.premierleague.com/tables" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
            >
              <span className="text-lg">📊</span> PL Table
            </a>
          </div>
        </div>

        {/* Filter Scroll Container */}
        <div className="relative group">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-image-linear-to-r items-center">
            
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
                    flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 border border-transparent
                    ${isActive
                      ? `bg-gradient-to-br ${gradient} ${textColor} shadow-lg ring-2 ring-offset-2 ring-slate-200`
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md"
                    }
                  `}
                >
                  {club.name}
                </button>
              );
            })}

            {/* Separator */}
            <div className="w-[1px] h-8 bg-slate-300 mx-1"></div>

            {/* Rest of League Button */}
            <button
                onClick={() => onFilterChange('premier-league')}
                className={`
                    flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border
                    ${selectedClub === 'premier-league'
                        ? "bg-slate-800 text-white border-slate-800 shadow-md"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
                    }
                `}
            >
                Rest of League
            </button>
            
          </div>
          
          {/* Fade effect on right for scrolling indication */}
          <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
        </div>
      </div>
    </header>
  );
}
