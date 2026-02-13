import { useEffect, useState, useRef } from 'react';
import { getPosts, getClubs } from './services/api';
import NewsCard from './components/NewsCard';
import Header from './components/Header';
import Pagination from './components/Pagination';
import CommentsModal from './components/CommentsModal';

const getClubBackgroundGradient = (slug) => {
  const gradients = {
    arsenal: "from-red-600/20 via-red-500/15 to-transparent",
    "aston-villa": "from-red-900/20 via-blue-800/15 to-transparent",
    chelsea: "from-blue-700/20 via-blue-600/15 to-transparent",
    everton: "from-blue-800/20 via-blue-600/15 to-transparent",
    liverpool: "from-red-700/20 via-red-600/15 to-transparent",
    "manchester-city": "from-sky-400/20 via-sky-300/15 to-transparent",
    "manchester-united": "from-red-700/20 via-red-600/15 to-transparent",
    newcastle: "from-black/20 via-gray-800/15 to-transparent",
    "tottenham-hotspur": "from-blue-900/20 via-gray-100/10 to-transparent",
    spurs: "from-blue-900/20 via-gray-100/10 to-transparent",
    "west-ham": "from-red-800/20 via-blue-400/15 to-transparent",
    wolves: "from-yellow-500/20 via-yellow-400/15 to-transparent",
    brighton: "from-blue-500/20 via-white/10 to-transparent",
    brentford: "from-red-600/20 via-white/10 to-transparent",
    "crystal-palace": "from-blue-700/20 via-red-600/15 to-transparent",
    fulham: "from-black/20 via-white/10 to-transparent",
    "nottingham-forest": "from-red-600/20 via-red-500/15 to-transparent",
    bournemouth: "from-red-700/20 via-black/15 to-transparent",
    leicester: "from-blue-600/20 via-blue-500/15 to-transparent",
    southampton: "from-red-600/20 via-white/10 to-transparent",
    ipswich: "from-blue-600/20 via-blue-500/15 to-transparent",
    "premier-league": "from-purple-600/20 via-emerald-500/15 to-transparent",
  };
  return gradients[slug] || "from-slate-600/20 via-slate-500/15 to-transparent";
};

export default function App() {
  const [posts, setPosts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [activePost, setActivePost] = useState(null);

  // Track current state for interval to use
  const stateRef = useRef({ selectedClub, posts });
  stateRef.current = { selectedClub, posts };

  // Load news with optional club filter
  const loadNews = async (url, club = selectedClub, background = false) => {
    if (!background) setLoading(true);
    if (!background) window.scrollTo({ top: 0, behavior: 'smooth' });

    const apiCallUrl = url || undefined;
    const data = await getPosts(apiCallUrl, club);

    if (data.results) {
      setPosts(data.results);
      setNextPage(data.next);
      setPrevPage(data.previous);
    }
    if (!background) setLoading(false);
  };

  // Initial load: Fetch clubs AND news
  useEffect(() => {
    const init = async () => {
      const clubsData = await getClubs();
      setClubs(clubsData.results || clubsData);
      await loadNews();
    };
    init();

    // Auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
         loadNews(null, stateRef.current.selectedClub, true);
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Handlers
  const handleFilter = (slug) => {
    const newClub = selectedClub === slug ? null : slug;
    setSelectedClub(newClub);
    setNextPage(null); 
    setPrevPage(null);
    loadNews(null, newClub); 
  };

  const handleCommentClick = (post) => {
      setActivePost(post);
      setIsCommentsModalOpen(true);
  };

  const bgGradient = selectedClub ? getClubBackgroundGradient(selectedClub) : "from-gradient-start";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 font-sans selection:bg-blue-200 selection:text-blue-900 transition-all duration-700">
      {/* Animated background overlay for club colors */}
      <div className={`fixed inset-0 bg-gradient-to-br ${bgGradient} pointer-events-none transition-all duration-700 z-0`} />
      
      <div className="relative z-10">
        <Header 
          clubs={clubs} 
          selectedClub={selectedClub} 
          onFilterChange={handleFilter}
        />

        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-32">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl animate-bounce">📖</span>
                </div>
              </div>
              <p className="text-slate-500 font-semibold text-lg mt-4">Loading the latest stories...</p>
            </div>
          ) : (
            <>
              {posts.length > 0 ? (
                <>
                  <div className="mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                      {selectedClub ? `📰 Latest News` : `🌟 All Premier League News`}
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12" style={{
                    animation: 'fadeInUp 0.6s ease-out'
                  }}>
                    {posts.map((post, idx) => (
                      <div key={post.id} style={{
                        animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                      }}>
                        <NewsCard 
                          post={post} 
                          onComment={handleCommentClick}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-32" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                  <div className="text-6xl mb-4">⚽</div>
                  <p className="text-2xl font-bold text-slate-700 mb-2">No Stories Yet</p>
                  <p className="text-slate-500 max-w-md mx-auto">No news found for this club. Check back soon for the latest updates and breaking stories!</p>
                </div>
              )}

              <Pagination 
                prevPage={prevPage} 
                nextPage={nextPage} 
                onPageChange={loadNews} 
              />
            </>
          )}
        </main>
      </div>

      {/* Style animations */}
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
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>

      {/* Modals */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        post={activePost}
      />

    </div>
  );
}
