import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiPencil, HiCheck, HiX } from 'react-icons/hi';

const Profile = () => {
  const { currentUser, userData, updateUserData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '', age: '', gender: '', height: '', weight: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || '',
        age: userData.age || '',
        gender: userData.gender || '',
        height: userData.height || '',
        weight: userData.weight || ''
      });
    }
  }, [userData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserData(currentUser.uid, {
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight)
      });
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile.');
    }
    setSaving(false);
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: '👤' },
    { key: 'age', label: 'Age', type: 'number', icon: '🎂' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other'], icon: '⚧' },
    { key: 'height', label: 'Height (cm)', type: 'number', icon: '📏' },
    { key: 'weight', label: 'Weight (kg)', type: 'number', icon: '⚖️' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your personal information</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all text-sm font-medium">
            <HiPencil /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setForm({ name: userData?.name || '', age: userData?.age || '', gender: userData?.gender || '', height: userData?.height || '', weight: userData?.weight || '' }); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-all text-sm font-medium">
              <HiX /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-white text-sm font-medium disabled:opacity-50">
              <HiCheck /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3 rounded-xl text-sm text-center ${message.includes('success') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
        >
          {message}
        </motion.div>
      )}

      <div className="glass-light rounded-2xl p-6 sm:p-8">
        {/* Email (non-editable) */}
        <div className="mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-xl">📧</span>
            <div>
              <p className="text-gray-400 text-xs mb-1">Email Address</p>
              <p className="text-white font-medium">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <span>{field.icon}</span> {field.label}
              </label>
              {editing ? (
                field.type === 'select' ? (
                  <select
                    value={form[field.key]}
                    onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  >
                    <option value="">Select</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                )
              ) : (
                <p className="px-4 py-3 bg-dark-800/30 rounded-xl text-white border border-white/5">
                  {form[field.key] || <span className="text-gray-500">Not set</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
