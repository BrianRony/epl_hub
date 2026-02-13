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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 sm:border-slate-200" style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-slate-100 flex justify-between items-start gap-3 bg-gradient-to-r from-blue-50/50 to-slate-50 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Discussion</p>
            <h3 className="font-bold text-sm sm:text-lg text-slate-900 break-words line-clamp-2">
              {post.title}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-2 sm:p-2.5 hover:bg-slate-100 rounded-lg transition-all duration-300 touch-target">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-2 sm:space-y-3 scrollbar-thin" style={{ scrollBehavior: 'smooth' }}>
          {loading ? (
             <div className="flex justify-center items-center h-32">
               <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin"></div>
                 <div className="absolute inset-2 bg-white rounded-full"></div>
               </div>
             </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 sm:py-20 text-slate-400">
              <div className="text-3xl sm:text-4xl mb-2">💬</div>
              <p className="italic font-medium text-xs sm:text-sm px-2">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div key={comment.id} className="bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-lg hover:shadow-sm transition-all duration-300" style={{
                animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both`,
              }}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">
                      {(comment.author_name || comment.user?.username || 'Fan')[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                        {comment.author_name || comment.user?.username || 'Fan'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-medium text-slate-400 whitespace-nowrap flex-shrink-0 ml-2">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-3 sm:p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                maxLength="50"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm font-medium transition-all duration-300 placeholder:text-slate-400"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Share your thoughts..." 
                    maxLength="300"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm transition-all duration-300 placeholder:text-slate-400"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all duration-300 text-xs sm:text-sm flex-shrink-0 shadow-sm hover:shadow-md active:scale-95 touch-target"
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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Touch-friendly targets */
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Custom scrollbar for comments */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
}
