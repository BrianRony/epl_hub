import React, { useState, useEffect } from 'react';
import { getComments, postComment } from '../services/api';

export default function CommentsModal({ isOpen, onClose, post, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && post) {
      loadComments();
    }
  }, [isOpen, post]);

  const loadComments = async () => {
    setLoading(true);
    const data = await getComments(post.id);
    setComments(data.results || data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await postComment(post.id, newComment, authorName);
      setNewComment('');
      // We keep the author name so they don't have to type it again
      loadComments(); 
    } catch (error) {
      console.error("Failed to post comment", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-lg p-0 sm:p-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border-2 border-slate-200" style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-2 border-slate-100 flex justify-between items-start gap-3 bg-gradient-to-r from-blue-50 via-purple-50 to-slate-50 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💬</span>
              <p className="text-xs sm:text-sm text-slate-600 font-extrabold uppercase tracking-wider">Discussion</p>
            </div>
            <h3 className="font-black text-base sm:text-xl text-slate-900 break-words line-clamp-2 leading-tight">
              {post.title}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-2.5 sm:p-3 hover:bg-slate-100 rounded-xl transition-all duration-300 touch-target group">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 scrollbar-thin bg-gradient-to-b from-slate-50/50 to-white" style={{ scrollBehavior: 'smooth' }}>
          {loading ? (
             <div className="flex justify-center items-center h-32 sm:h-40">
               <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                   <span className="text-xl sm:text-2xl">💬</span>
                 </div>
               </div>
             </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16 sm:py-24 text-slate-400">
              <div className="text-5xl sm:text-6xl mb-4 animate-bounce-slow">💬</div>
              <p className="font-extrabold text-base sm:text-lg px-2 text-slate-500 mb-2">No comments yet</p>
              <p className="text-xs sm:text-sm text-slate-400">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div key={comment.id} className="bg-white border-2 border-slate-100 p-4 sm:p-5 rounded-2xl hover:shadow-lg hover:border-slate-200 transition-all duration-300 transform hover:-translate-y-0.5" style={{
                animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both`,
              }}>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm sm:text-base font-black flex-shrink-0 shadow-md">
                      {(comment.author_name || comment.user?.username || 'Fan')[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm sm:text-base font-black text-slate-900 break-words block">
                        {comment.author_name || comment.user?.username || 'Fan'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Premier League Fan
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 whitespace-nowrap flex-shrink-0 ml-2 bg-slate-100 px-2 py-1 rounded-full">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-12 sm:pl-14">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 border-t-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                maxLength="50"
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 text-xs sm:text-sm font-bold transition-all duration-300 placeholder:text-slate-400 shadow-sm hover:shadow-md"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
              <div className="flex gap-2.5">
                  <input 
                    type="text" 
                    placeholder="Share your thoughts..." 
                    maxLength="300"
                    className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 text-xs sm:text-sm font-medium transition-all duration-300 placeholder:text-slate-400 shadow-sm hover:shadow-md"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white font-black rounded-xl transition-all duration-300 text-xs sm:text-sm flex-shrink-0 shadow-lg hover:shadow-xl active:scale-95 touch-target transform hover:scale-105"
                  >
                    Send
                  </button>
              </div>
            </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
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
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        /* Touch-friendly targets */
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Custom scrollbar for comments */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.4);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.6);
        }
      `}</style>
    </div>
  );
}