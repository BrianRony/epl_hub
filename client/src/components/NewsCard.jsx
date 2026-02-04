import React from 'react';

// Returns a Tailwind border color class
const getClubBorderColor = (slug) => {
  const colors = {
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
  };
  return colors[slug] || "border-indigo-500";
};

// Returns a nice light background for the card header/tag
const getClubLightBg = (slug) => {
  const colors = {
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
  };
  return colors[slug] || "bg-indigo-50 text-indigo-700";
};

// HTML Stripping Helper
const stripHtml = (html) => {
    if (!html) return "";
    // Create a temporary element to let the browser parse and extract text
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

export default function NewsCard({ post }) {
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

  // Fallback for link if missing or invalid
  const handleLinkClick = (e) => {
    if (!post.link) {
      e.preventDefault();
      alert("Source link not available");
    }
  };

  return (
    <a 
      href={post.link || "#"} 
      target={post.link ? "_blank" : "_self"}
      rel="noopener noreferrer" 
      onClick={handleLinkClick}
      className="group block h-full focus:outline-none cursor-pointer"
    >
      <div className={`
        relative h-full bg-white rounded-2xl overflow-hidden
        border-t-[6px] ${borderColor}
        shadow-[0_2px_8px_rgba(0,0,0,0.04)]
        hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
        transition-all duration-300 ease-out
        flex flex-col
      `}>
        
        {/* Card Header: Club & Date */}
        <div className="px-6 pt-5 pb-2 flex justify-between items-center">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${clubTagStyle}`}>
                {post.club.name}
            </span>
            <span className="text-xs font-medium text-slate-400">
                {dateStr} <span className="text-slate-300">•</span> {timeStr}
            </span>
        </div>

        {/* Main Content */}
        <div className="px-6 py-2 flex-1">
          <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-blue-700 transition-colors">
            {post.title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
            {plainTextContent}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 mt-auto border-t border-slate-50 flex items-center justify-between bg-white">
             {/* Source Badge */}
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${badgeStyle}`}>
                {post.source}
            </span>

            <span className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                Read Story
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </span>
        </div>
      </div>
    </a>
  );
}
