import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const CompleteProfile = () => {
  const { currentUser, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ age: '', gender: '', height: '', weight: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.age || !form.height || !form.weight) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateUserData(currentUser.uid, {
        age: Number(form.age),
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight)
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">🧘</div>
          <h2 className="text-2xl font-display font-bold text-white">Complete Your Profile</h2>
          <p className="text-gray-400 text-sm mt-2">We need a few details to personalize your experience</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age *</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm(p => ({ ...p, age: e.target.value }))}
                required
                min="10"
                max="100"
                className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                placeholder="e.g., 25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm) *</label>
              <input
                type="number"
                value={form.height}
                onChange={(e) => setForm(p => ({ ...p, height: e.target.value }))}
                required
                min="100"
                max="250"
                className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                placeholder="e.g., 170"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg) *</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm(p => ({ ...p, weight: e.target.value }))}
                required
                min="20"
                max="300"
                className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                placeholder="e.g., 65"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
