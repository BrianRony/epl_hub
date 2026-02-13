import React from 'react';

// Returns a Tailwind border color class
const getClubBorderColor = (slug) => {
  const colors = {
    // Big 6
    arsenal: "border-red-600",
    "aston-villa": "border-red-900",
    chelsea: "border-blue-700",
    everton: "border-blue-600",
    liverpool: "border-red-700",
    "man-city": "border-sky-400",
    "man-utd": "border-red-700",
    newcastle: "border-black",
    spurs: "border-blue-900",
    "west-ham": "border-red-800",
    wolves: "border-yellow-500",

    // Rest of League
    brighton: "border-blue-400",
    brentford: "border-red-500",
    "crystal-palace": "border-blue-800",
    fulham: "border-slate-800",
    "nottingham-forest": "border-red-600",
    bournemouth: "border-red-700",
    leicester: "border-blue-600",
    southampton: "border-red-500",
    ipswich: "border-blue-500",
    
    // General
    "premier-league": "border-purple-600",
  };
  return colors[slug] || "border-slate-400";
};

// Returns a nice light background for the card header/tag
const getClubLightBg = (slug) => {
  const colors = {
    // Big 6 + Challengers
    arsenal: "bg-gradient-to-r from-red-50 to-red-100 text-red-700",
    "aston-villa": "bg-gradient-to-r from-red-50 to-red-100 text-red-900",
    chelsea: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700",
    everton: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700",
    liverpool: "bg-gradient-to-r from-red-50 to-red-100 text-red-800",
    "man-city": "bg-gradient-to-r from-sky-50 to-sky-100 text-sky-700",
    "man-utd": "bg-gradient-to-r from-red-50 to-red-100 text-red-800",
    newcastle: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800",
    spurs: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900",
    "west-ham": "bg-gradient-to-r from-red-50 to-red-100 text-red-800",
    wolves: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800",

    // Rest
    brighton: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600",
    brentford: "bg-gradient-to-r from-red-50 to-red-100 text-red-600",
    "crystal-palace": "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800",
    fulham: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800",
    "nottingham-forest": "bg-gradient-to-r from-red-50 to-red-100 text-red-700",
    bournemouth: "bg-gradient-to-r from-red-50 to-red-100 text-red-800",
    leicester: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700",
    southampton: "bg-gradient-to-r from-red-50 to-red-100 text-red-600",
    ipswich: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600",

    "premier-league": "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700",
  };
  return colors[slug] || "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600";
};

// HTML Stripping Helper
const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

export default function NewsCard({ post, onComment }) {
  const clubSlug = post.club.slug || "";
  const borderColor = getClubBorderColor(clubSlug);
  const clubTagStyle = getClubLightBg(clubSlug);

  // Formatting the date nicely
  const dateObj = new Date(post.publication_date);
  const dateStr = dateObj.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  });
  const timeStr = dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
  });

  // Source badges
  const isOfficial = post.source === 'official';
  const badgeStyle = isOfficial 
    ? "bg-green-100 text-green-800 border-green-200" 
    : "bg-slate-100 text-slate-600 border-slate-200";

  // Clean the content preview
  const plainTextContent = stripHtml(post.content);

  const handleAction = (e, action) => {
      e.preventDefault();
      e.stopPropagation();
      action(post);
  }

  return (
    <div className={`
        relative bg-white rounded-2xl overflow-hidden
        border-2 ${borderColor} border-opacity-40
        shadow-md hover:shadow-2xl
        transition-all duration-300 ease-out
        flex flex-col group cursor-pointer
        backdrop-blur-sm
        hover:border-opacity-100
        transform hover:-translate-y-1
      `}>
        {/* Card Header: Club & Date */}
        <div className="relative z-10 px-5 sm:px-6 pt-4 sm:pt-5 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b-2 border-slate-100 group-hover:border-slate-200 transition-all duration-300 bg-gradient-to-r from-slate-50/50 to-white">
            <span className={`px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest w-fit transition-all duration-300 group-hover:scale-110 shadow-sm ${clubTagStyle}`}>
                {post.club.name}
            </span>
            <div className="flex items-center gap-2">
                <span className="text-lg">🕐</span>
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-500 transition-colors group-hover:text-slate-700">
                    {dateStr} • {timeStr}
                </span>
            </div>
        </div>

        {/* Main Content (Clickable Link) */}
        <a 
            href={post.link || "#"} 
            target={post.link ? "_blank" : "_self"}
            rel="noopener noreferrer" 
            className="relative z-10 px-5 sm:px-6 py-4 sm:py-5 flex-1 block focus:outline-none group/link hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/30 transition-all duration-300"
        >
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-3 group-hover/link:text-blue-600 transition-all duration-300 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 group-hover/link:text-slate-800 transition-colors duration-300 font-medium">
            {plainTextContent}
          </p>
        </a>

        {/* Footer Actions - Compact */}
        <div className="relative z-10 px-5 sm:px-6 py-3.5 border-t-2 border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500 group-hover:bg-gradient-to-r group-hover:from-slate-50/50 group-hover:to-white transition-all duration-300">
             <button 
                onClick={(e) => handleAction(e, onComment)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-105 transform shadow-sm hover:shadow-md font-bold"
                title="Comments"
             >
                 <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
                 <span className="text-xs sm:text-sm font-black">{post.comment_count || 0}</span>
             </button>

            <a 
                href={post.link || "#"} 
                target={post.link ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-xl"
            >
                <span>Read Full</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </a>
        </div>
      </div>
  );
}