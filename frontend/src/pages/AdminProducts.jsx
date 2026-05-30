import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import { connectSocket } from '../services/socket';

const AdminProducts = () => {
  const { getProducts, addProduct, updateProduct, deleteProduct } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', image: '', category: '', stock: '' });

  useEffect(() => {
    loadProducts();
    const socket = connectSocket();
    socket.on('product-added', (product) => setProducts(prev => [...prev, product]));
    socket.on('product-deleted', (productId) => setProducts(prev => prev.filter(p => p.id !== productId)));
    return () => { socket.off('product-added'); socket.off('product-deleted'); };
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try { setProducts(await getProducts()); }
    catch (err) { setProducts([]); }
    setLoading(false);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', price: '', description: '', image: '', category: '', stock: '' });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      price: String(product.price || ''),
      description: product.description || '',
      image: product.image || '',
      category: product.category || '',
      stock: String(product.stock || '')
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      image: form.image,
      category: form.category,
      stock: Number(form.stock),
      rating: editingProduct?.rating || 4.5
    };

    try {
      if (editingProduct?.id && typeof editingProduct.id === 'string' && !editingProduct.id.startsWith('prod_')) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      await loadProducts();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Product Management</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} products in catalog</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white text-sm font-medium hover:from-amber-400 hover:to-purple-500 transition-all shadow-lg shadow-amber-500/20">
          <HiPlus /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading products...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-light rounded-2xl overflow-hidden border border-white/5"
            >
              <div className="h-36 overflow-hidden">
                {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-dark-800/50 flex items-center justify-center text-4xl">🧘</div>}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">{product.category}</span>
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold gradient-text-reverse">₹{product.price}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(product)} className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                      <HiPencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <HiTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-900 rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white"><HiX size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'name', label: 'Product Name', type: 'text' },
                  { key: 'price', label: 'Price (₹)', type: 'number' },
                  { key: 'category', label: 'Category', type: 'text' },
                  { key: 'stock', label: 'Stock', type: 'number' },
                  { key: 'image', label: 'Image URL', type: 'url' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-gray-700 rounded-xl text-gray-300 font-medium hover:border-gray-500 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl text-white font-semibold transition-all">
                    {editingProduct ? 'Update' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
