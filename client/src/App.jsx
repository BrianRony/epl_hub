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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white font-sans selection:bg-blue-200 selection:text-blue-900 transition-all duration-700">
      {/* Subtle animated background for club colors */}
      <div className={`fixed inset-0 bg-gradient-to-br ${bgGradient} pointer-events-none transition-all duration-700 z-0 opacity-10 animate-gradient-shift`} />
      
      {/* Decorative floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <Header 
          clubs={clubs} 
          selectedClub={selectedClub} 
          onFilterChange={handleFilter}
        />

        <main className="container mx-auto max-w-2xl px-3 sm:px-4 py-10 sm:py-12">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-40">
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <span className="text-3xl animate-bounce">📖</span>
                </div>
              </div>
              <p className="text-slate-600 font-black text-xl mt-4 animate-pulse">Loading EPL stories...</p>
              <p className="text-slate-400 font-semibold text-sm mt-2">Getting the latest updates</p>
            </div>
          ) : (
            <>
              {posts.length > 0 ? (
                <>
                  <div className="mb-10 text-center" style={{ animation: 'fadeInDown 0.6s ease-out' }}>
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-slate-200 mb-3">
                      <span className="text-2xl">
                        {selectedClub ? '📰' : '🌟'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        {selectedClub ? `Latest News` : `All Premier League`}
                      </h2>
                    </div>
                    <p className="text-slate-500 text-sm font-bold">
                      <span className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {posts.length} stories available
                      </span>
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-10" style={{
                    animation: 'fadeInUp 0.6s ease-out'
                  }}>
                    {posts.map((post, idx) => (
                      <div key={post.id} style={{
                        animation: `fadeInUp 0.6s ease-out ${idx * 0.08}s both`,
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
                <div className="text-center py-40" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                  <div className="text-7xl mb-6 animate-bounce-slow">⚽</div>
                  <p className="text-3xl font-black text-slate-800 mb-3 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
                    No Stories Yet
                  </p>
                  <p className="text-slate-500 text-base font-semibold">Check back soon for the latest updates!</p>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400 bg-slate-100 px-5 py-2.5 rounded-full">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                    Waiting for new content
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Pagination 
                  prevPage={prevPage} 
                  nextPage={nextPage} 
                  onPageChange={loadNews} 
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Style animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
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
            transform: translateY(-15px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.15;
          }
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
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