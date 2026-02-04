import React from 'react';

const getClubGradient = (slug) => {
  const gradients = {
    arsenal: "from-red-600 via-red-500 to-white",
    "aston-villa": "from-red-900 via-blue-800 to-blue-900",
    chelsea: "from-blue-700 via-blue-600 to-white",
    everton: "from-blue-800 via-blue-600 to-white",
    liverpool: "from-red-700 via-red-600 to-red-800",
    "man-city": "from-sky-300 via-sky-400 to-white",
    "man-utd": "from-red-700 via-red-600 to-black",
    newcastle: "from-black via-gray-800 to-gray-500",
    spurs: "from-blue-900 via-gray-100 to-white",
    "west-ham": "from-red-800 via-blue-400 to-blue-800",
    wolves: "from-yellow-500 via-yellow-400 to-black",
  };
  return gradients[slug] || "from-slate-700 to-slate-500";
};

const getClubTextColor = (slug) => {
   // For active state text color contrast against the gradient
   const lightText = ['arsenal', 'aston-villa', 'chelsea', 'everton', 'liverpool', 'man-utd', 'newcastle', 'west-ham', 'wolves', 'spurs'];
   if (slug === 'man-city') return 'text-slate-800'; 
   return 'text-white';
}

export default function Header({ clubs, selectedClub, onFilterChange }) {
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
        </div>

        {/* Filter Scroll Container */}
        <div className="relative group">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mask-image-linear-to-r">
            
            {/* 'All' Button */}
            <button
              onClick={() => onFilterChange(null)}
              className={`
                flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5
                ${selectedClub === null 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-2 ring-slate-900 ring-offset-2" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }
              `}
            >
              All Feeds
            </button>

            {/* Club Buttons */}
            {clubs.map((club) => {
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
          </div>
          
          {/* Fade effect on right for scrolling indication */}
          <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
        </div>
      </div>
    </header>
  );
}
