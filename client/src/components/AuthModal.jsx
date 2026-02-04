import React, { useState } from 'react';
import { login, register } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        // dj-rest-auth registration endpoint expects "password" and "password" (confirmation)
        // or sometimes password/password_confirm depending on config. 
        // Our curl test showed it wanted "password1" and "password2".
        // Let's adapt our API call in api.jsx to send this structure.
        await register(formData.username, formData.email, formData.password);
        
        // Auto login attempt after registration
        try {
           await login(formData.username, formData.password);
        } catch (loginErr) {
           // If auto-login fails, just let them know to login manually
           setIsLogin(true);
           setLoading(false);
           return;
        }
      }
      onLoginSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      // Try to parse API error message
      if (err.response && err.response.data) {
          const data = err.response.data;
          // Join error messages if multiple
          const msg = Object.values(data).flat().join(' ');
          setError(msg || 'Authentication failed.');
      } else {
          setError('Authentication failed. Check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {isLogin ? 'Welcome Back!' : 'Join the Squad'}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {isLogin ? 'Login to comment & bookmark.' : 'Create an account to join the conversation.'}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-slate-500 hover:text-blue-600 font-bold transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </div>
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
             <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase">Close</button>
        </div>
      </div>
    </div>
  );
}
