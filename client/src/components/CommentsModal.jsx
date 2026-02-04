import React, { useState, useEffect } from 'react';
import { getComments, postComment } from '../services/api';

export default function CommentsModal({ isOpen, onClose, post, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
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
      await postComment(post.id, newComment);
      setNewComment('');
      loadComments(); // Refresh
    } catch (error) {
      console.error("Failed to post comment", error);
      alert("Failed to post comment. Ensure you are logged in.");
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <h3 className="font-bold text-slate-800 truncate pr-4">
            Discussion: <span className="text-blue-600">{post.title}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20 text-slate-400 italic">
              No comments yet. Be the first to say something!
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-slate-50 p-3 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-900">{comment.user?.username || 'Fan'}</span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Share your thoughts..." 
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Send
              </button>
            </form>
          ) : (
            <div className="text-center text-sm text-slate-500">
              Please <span className="font-bold text-blue-600">log in</span> to join the discussion.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
