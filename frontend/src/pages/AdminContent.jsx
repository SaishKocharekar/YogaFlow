import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';

const AdminContent = () => {
  const { getWellnessContent, addWellnessContent, updateWellnessContent, deleteWellnessContent } = useAuth();
  const [activeTab, setActiveTab] = useState('yoga');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: '' });

  const tabs = [
    { key: 'yoga', label: 'Yoga Exercises' },
    { key: 'meditation', label: 'Meditation' },
    { key: 'diet', label: 'Diet Tips' },
  ];

  useEffect(() => { loadContent(); }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try { setContent(await getWellnessContent(activeTab)); } catch(e) { setContent([]); }
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ title: '', description: '', category: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ title: item.title, description: item.description, category: item.category || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateWellnessContent(activeTab, editing.id, form); }
      else { await addWellnessContent(activeTab, form); }
      await loadContent();
      setModalOpen(false);
    } catch(e) { console.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content?')) return;
    try { await deleteWellnessContent(activeTab, id); await loadContent(); } catch(e) {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Wellness Content</h1>
          <p className="text-gray-400 text-sm mt-1">Manage yoga, meditation, and diet content</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white text-sm font-medium">
          <HiPlus /> Add Content
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-dark-800/50 text-gray-400 border border-transparent'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : content.length === 0 ? (
        <div className="text-center py-16"><div className="text-5xl mb-4">📝</div><p className="text-gray-400">No content yet. Add some!</p></div>
      ) : (
        <div className="space-y-3">
          {content.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-light rounded-2xl p-5 border border-white/5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  {item.category && <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">{item.category}</span>}
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"><HiPencil size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"><HiTrash size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-900 rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-white">{editing ? 'Edit' : 'Add'} Content</h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white"><HiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input type="text" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required rows={4}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 resize-none" /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-gray-700 rounded-xl text-gray-300 font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl text-white font-semibold">{editing ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContent;
