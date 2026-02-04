import { useEffect, useState, useRef } from 'react';
import { getPosts, getClubs } from './services/api';
import NewsCard from './components/NewsCard';
import Header from './components/Header';
import Pagination from './components/Pagination';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
      loadNews();
    };
    init();

    // Auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      // Only refresh if we are on the first page (no prevPage)
      // We read from ref to get current value inside closure
      // if (!stateRef.current.prevPage) { // Actually simpler to just refresh current view
         loadNews(null, stateRef.current.selectedClub, true);
      // }
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Handle Filter Click
  const handleFilter = (slug) => {
    // If clicking same button, toggle off (null)
    // If clicking "Rest of League" (premier-league), select it
    // If clicking Top 5, select it
    const newClub = selectedClub === slug ? null : slug;
    
    setSelectedClub(newClub);
    setNextPage(null); 
    setPrevPage(null);
    loadNews(null, newClub); 
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header 
        clubs={clubs} 
        selectedClub={selectedClub} 
        onFilterChange={handleFilter} 
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
                <NewsCard key={post.id} post={post} />
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
    </div>
  );
}
