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
        relative bg-white rounded-xl overflow-hidden
        border ${borderColor} border-opacity-30
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-out
        flex flex-col group cursor-pointer
        backdrop-blur-sm
        hover:border-opacity-60
      `}>
        {/* Card Header: Club & Date */}
        <div className="relative z-10 px-4 sm:px-5 pt-4 sm:pt-4 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-100 group-hover:border-slate-200 transition-colors">
            <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider w-fit transition-all duration-200 group-hover:scale-105 ${clubTagStyle}`}>
                {post.club.name}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 transition-colors group-hover:text-slate-500">
                {dateStr} {timeStr}
            </span>
        </div>

        {/* Main Content (Clickable Link) */}
        <a 
            href={post.link || "#"} 
            target={post.link ? "_blank" : "_self"}
            rel="noopener noreferrer" 
            className="relative z-10 px-4 sm:px-5 py-3 sm:py-4 flex-1 block focus:outline-none group/link hover:bg-slate-50 transition-colors"
        >
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-2 group-hover/link:text-blue-600 transition-all duration-200">
            {post.title}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 group-hover/link:text-slate-700 transition-colors duration-200">
            {plainTextContent}
          </p>
        </a>

        {/* Footer Actions - Compact */}
        <div className="relative z-10 px-4 sm:px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500 group-hover:bg-slate-50 transition-colors">
             <button 
                onClick={(e) => handleAction(e, onComment)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 hover:scale-105"
                title="Comments"
             >
                 <svg className="w-4 h-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
                 <span className="text-xs font-semibold">{post.comment_count || 0}</span>
             </button>

            <a 
                href={post.link || "#"} 
                target={post.link ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            >
                Read
                <svg className="w-3.5 h-3.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </a>
        </div>
      </div>
  );
}
