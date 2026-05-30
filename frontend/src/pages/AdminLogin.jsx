import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import { apiAdminLogin, setToken } from '../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Call dedicated admin-login endpoint (checks env credentials on server)
      const result = await apiAdminLogin(email, password);
      setToken(result.token);
      // Store admin info in sessionStorage so AdminRoute can check
      sessionStorage.setItem('yogaflow_admin', JSON.stringify(result.user));
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">A</div>
          <h2 className="text-2xl font-display font-bold text-white">Admin Portal</h2>
          <p className="text-gray-400 text-sm mt-1">Restricted access for platform administrators</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="admin@gmail.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl text-white font-semibold hover:from-amber-400 hover:to-purple-500 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
