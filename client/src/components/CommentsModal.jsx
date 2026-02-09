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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:h-[80vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center gap-2 bg-slate-50 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
            <span className="hidden sm:inline">Discussion: </span><span className="text-blue-600">{post.title}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20 text-slate-400 italic">
              No comments yet. Be the first to say something!
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-slate-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-900 break-words">
                    {comment.author_name || comment.user?.username || 'Fan'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 whitespace-nowrap flex-shrink-0">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white rounded-b-xl sm:rounded-b-2xl flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Name (Optional)"
                    className="w-full sm:w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Share your thoughts..." 
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm flex-shrink-0"
                  >
                    Send
                  </button>
              </div>
              <div className="text-[10px] text-slate-400 px-2 italic">
                * Leave name empty to get a cool generated identity!
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
