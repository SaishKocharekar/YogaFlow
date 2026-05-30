import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiTrash, HiEye, HiSearch, HiX } from 'react-icons/hi';

const AdminUsers = () => {
  const { getAllUsers, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users');
    }
    setLoading(false);
  };

  const handleDelete = async (uid) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await deleteUser(uid);
      setUsers(prev => prev.filter(u => u.id !== uid));
    } catch (err) {
      console.error('Failed to delete user');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} registered users</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-dark-800/50 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading users...</div>
      ) : (
        <div className="glass-light rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium hidden md:table-cell">Height</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium hidden md:table-cell">Weight</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium hidden lg:table-cell">BMI</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const bmi = user.height && user.weight
                    ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
                    : '—';
                  return (
                    <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                            {(user.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name || '—'}</p>
                            <p className="text-gray-500 text-xs sm:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-300 hidden sm:table-cell">{user.email}</td>
                      <td className="px-6 py-3 text-gray-300 hidden md:table-cell">{user.height ? `${user.height} cm` : '—'}</td>
                      <td className="px-6 py-3 text-gray-300 hidden md:table-cell">{user.weight ? `${user.weight} kg` : '—'}</td>
                      <td className="px-6 py-3 hidden lg:table-cell">
                        <span className="text-white font-medium">{bmi}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewUser(user)} className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                            <HiEye size={16} />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <HiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No users found.</div>
          )}
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-900 rounded-2xl p-6 sm:p-8 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-white">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-white"><HiX size={20} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Name', value: viewUser.name },
                { label: 'Email', value: viewUser.email },
                { label: 'Age', value: viewUser.age },
                { label: 'Gender', value: viewUser.gender },
                { label: 'Height', value: viewUser.height ? `${viewUser.height} cm` : '—' },
                { label: 'Weight', value: viewUser.weight ? `${viewUser.weight} kg` : '—' },
                { label: 'Role', value: viewUser.role },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="text-white font-medium text-sm">{value || '—'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
