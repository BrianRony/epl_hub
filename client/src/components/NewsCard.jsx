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
    arsenal: "bg-red-50 text-red-700",
    "aston-villa": "bg-red-50 text-red-900",
    chelsea: "bg-blue-50 text-blue-700",
    everton: "bg-blue-50 text-blue-700",
    liverpool: "bg-red-50 text-red-800",
    "man-city": "bg-sky-50 text-sky-700",
    "man-utd": "bg-red-50 text-red-800",
    newcastle: "bg-slate-100 text-slate-800",
    spurs: "bg-blue-50 text-blue-900",
    "west-ham": "bg-red-50 text-red-800",
    wolves: "bg-yellow-50 text-yellow-800",

    // Rest
    brighton: "bg-blue-50 text-blue-600",
    brentford: "bg-red-50 text-red-600",
    "crystal-palace": "bg-blue-50 text-blue-800",
    fulham: "bg-slate-100 text-slate-800",
    "nottingham-forest": "bg-red-50 text-red-700",
    bournemouth: "bg-red-50 text-red-800",
    leicester: "bg-blue-50 text-blue-700",
    southampton: "bg-red-50 text-red-600",
    ipswich: "bg-blue-50 text-blue-600",

    "premier-league": "bg-purple-50 text-purple-700",
  };
  return colors[slug] || "bg-slate-100 text-slate-600";
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
        relative h-full bg-white rounded-2xl overflow-hidden
        border-l-4 ${borderColor}
        shadow-lg hover:shadow-2xl
        hover:scale-105 hover:-rotate-1
        transition-all duration-500 ease-out
        flex flex-col group cursor-pointer
        backdrop-blur-sm bg-opacity-95
      `}>
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Card Header: Club & Date */}
        <div className="relative z-10 px-5 sm:px-6 pt-5 sm:pt-6 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b border-slate-100/50 group-hover:border-slate-200 transition-colors">
            <span className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider w-fit shadow-sm transition-transform duration-300 group-hover:scale-110 ${clubTagStyle}`}>
                {post.club.name}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 whitespace-nowrap transition-colors group-hover:text-slate-600">
                {dateStr} <span className="text-slate-300">•</span> {timeStr}
            </span>
        </div>

        {/* Main Content (Clickable Link) */}
        <a 
            href={post.link || "#"} 
            target={post.link ? "_blank" : "_self"}
            rel="noopener noreferrer" 
            className="relative z-10 px-5 sm:px-6 py-4 sm:py-5 flex-1 block focus:outline-none group/link"
        >
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-3 sm:mb-4 group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-gradient-to-r group-hover/link:from-blue-600 group-hover/link:to-purple-600 transition-all duration-300">
            {post.title}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-3 sm:mb-4 group-hover/link:text-slate-700 transition-colors duration-300">
            {plainTextContent}
          </p>
        </a>

        {/* Footer Actions */}
        <div className="relative z-10 px-5 sm:px-6 py-4 sm:py-5 mt-auto border-t border-slate-100/50 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-blue-50/30 group-hover:from-slate-100/50 group-hover:to-blue-100/50 transition-all duration-500">
             <button 
                onClick={(e) => handleAction(e, onComment)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group/btn"
                title="Comments"
             >
                 <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
                 <span className="text-xs sm:text-sm font-bold">{post.comment_count || 0}</span>
             </button>

            <a 
                href={post.link || "#"} 
                target={post.link ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group/read"
            >
                Read
                <svg className="w-4 h-4 transition-transform group-hover/read:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </a>
        </div>
      </div>
  );
}
