import { useEffect, useState, useRef } from 'react';
import { getPosts, getClubs, getUser, logout, toggleBookmark } from './services/api';
import NewsCard from './components/NewsCard';
import Header from './components/Header';
import Pagination from './components/Pagination';
import AuthModal from './components/AuthModal';
import CommentsModal from './components/CommentsModal';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth & User State
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
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

  // Check Auth Status
  const checkUser = async () => {
      const userData = await getUser();
      setUser(userData);
  }

  // Initial load: Fetch clubs AND news
  useEffect(() => {
    const init = async () => {
      const clubsData = await getClubs();
      setClubs(clubsData.results || clubsData);
      await loadNews();
      await checkUser();
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

  const handleLoginSuccess = async () => {
      await checkUser();
  };

  const handleLogout = async () => {
      await logout();
      setUser(null);
  };

  const handleCommentClick = (post) => {
      setActivePost(post);
      setIsCommentsModalOpen(true);
  };

  const handleBookmarkClick = async (post) => {
      if (!user) {
          setIsAuthModalOpen(true);
          return;
      }
      try {
          await toggleBookmark(post.id);
          alert(`Saved "${post.title}" to bookmarks!`);
      } catch (e) {
          console.error(e);
          alert("Could not save bookmark.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header 
        clubs={clubs} 
        selectedClub={selectedClub} 
        onFilterChange={handleFilter}
        user={user}
        onLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <NewsCard 
                    key={post.id} 
                    post={post} 
                    onComment={handleCommentClick}
                    onBookmark={handleBookmarkClick}
                />
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No news found for this club yet.
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

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        post={activePost}
        user={user}
      />

    </div>
  );
}
