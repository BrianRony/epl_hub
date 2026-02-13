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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden border border-blue-200/50" style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-blue-200/30 flex justify-between items-center gap-2 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-t-2xl flex-shrink-0">
          <div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mb-1">Discussion</p>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate pr-4 line-clamp-2">
              {post.title}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-2 hover:bg-white/50 rounded-lg transition-all duration-300">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4" style={{ scrollBehavior: 'smooth' }}>
          {loading ? (
             <div className="flex justify-center py-12">
               <div className="relative w-12 h-12">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin"></div>
                 <div className="absolute inset-2 bg-white rounded-full"></div>
               </div>
             </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-4xl mb-3">💬</div>
              <p className="italic font-medium">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div key={comment.id} className="bg-gradient-to-r from-slate-50/80 to-blue-50/50 border border-slate-200/50 p-4 rounded-xl hover:shadow-md transition-all duration-300" style={{
                animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both`,
              }}>
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                      {(comment.author_name || comment.user?.username || 'Fan')[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {comment.author_name || comment.user?.username || 'Fan'}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 whitespace-nowrap flex-shrink-0">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-10 sm:pl-12">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 border-t border-blue-200/30 bg-gradient-to-r from-blue-50/30 via-white to-purple-50/30 rounded-b-2xl flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    className="w-full sm:w-1/3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm font-medium transition-all duration-300 placeholder:text-slate-400"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Share your thoughts..." 
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm transition-all duration-300 placeholder:text-slate-400"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 text-xs sm:text-sm flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-105 transform"
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
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
      `}</style>
    </div>
  );
}
