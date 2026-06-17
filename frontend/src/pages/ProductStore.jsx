import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { connectSocket } from '../services/socket';
import { FaStar, FaShoppingCart, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';

const ProductStore = () => {
  const { currentUser, getProducts, placeOrder } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedProduct, setAddedProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    loadProducts();
    const socket = connectSocket();
    socket.on('product-added', (product) => setProducts(prev => [...prev, product]));
    socket.on('product-deleted', (productId) => setProducts(prev => prev.filter(p => p.id !== productId)));
    socket.on('product-updated', () => loadProducts());
    return () => { socket.off('product-added'); socket.off('product-deleted'); socket.off('product-updated'); };
  }, []);

  useEffect(() => {
    if (showPopup && addedProduct) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showPopup, addedProduct]);

  const loadProducts = async () => {
    setLoading(true);
    try { setProducts(await getProducts()); }
    catch (err) { setProducts([]); }
    setLoading(false);
  };

  const categories = products.length > 0 ? ['All', ...new Set(products.map(p => p.category))] : ['All'];
  const filtered = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setAddedProduct(product);
    setShowPopup(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) { const q = item.quantity + delta; return q > 0 ? { ...item, quantity: q } : item; }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setCartOpen(false);
    navigate('/checkout', { state: { items: cart } });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      for (const item of cart) {
        await placeOrder({
          productId: item.id, productName: item.name,
          quantity: item.quantity, price: item.price,
          total: item.price * item.quantity
        });
      }
      setCart([]); setCartOpen(false); setOrderPlaced(true);
      setTimeout(() => setOrderPlaced(false), 4000);
    } catch (err) { console.error('Order failed:', err); }
    setPlacing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Product Store</h1>
          <p className="text-gray-400 text-sm mt-1">Premium yoga and wellness accessories</p>
        </div>
        <button onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all text-sm font-medium">
          <FaShoppingCart /> Cart
          {totalItems > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 text-white text-xs flex items-center justify-center font-bold">{totalItems}</span>}
        </button>
      </div>

      {orderPlaced && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
          🎉 Order placed successfully! View it in My Orders.
        </motion.div>
      )}

      {products.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-dark-800/50 text-gray-400 hover:text-white border border-transparent'}`}>{cat}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Products Available</h3>
          <p className="text-gray-400 text-sm">Products will appear here once added by the admin.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-light rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="relative h-44 overflow-hidden">
                {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full bg-dark-800/50 flex items-center justify-center text-5xl">🧘</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
                <span className="absolute top-3 right-3 px-2 py-1 rounded-lg glass text-xs text-amber-400 font-medium">{product.category}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, idx) => <FaStar key={idx} className={`text-xs ${idx < Math.floor(product.rating || 4) ? 'text-amber-400' : 'text-gray-600'}`} />)}
                </div>
                <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold gradient-text-reverse">₹{product.price}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => addToCart(product)}
                      className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all border border-purple-500/20"
                      title="Add to Cart">
                      <FaShoppingCart size={14} />
                    </button>
                    <button onClick={() => navigate('/checkout', { state: { items: [{ ...product, quantity: 1 }] } })}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-500 hover:to-amber-400 transition-all shadow-md">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-900 z-50 flex flex-col border-l border-white/5">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-display font-bold text-white">Your Cart ({totalItems})</h2>
                <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-white"><HiX size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12"><div className="text-5xl mb-4">🛒</div><p className="text-gray-400">Your cart is empty</p></div>
                ) : cart.map(item => (
                  <div key={item.id} className="flex gap-4 glass-light rounded-xl p-4 border border-white/5">
                    {item.image ? <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-dark-800 flex items-center justify-center text-2xl">🧘</div>}
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{item.name}</h4>
                      <p className="text-amber-400 font-semibold text-sm mt-1">₹{item.price}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-md bg-dark-800 text-gray-400 flex items-center justify-center hover:text-white text-xs"><FaMinus /></button>
                        <span className="text-white text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-md bg-dark-800 text-gray-400 flex items-center justify-center hover:text-white text-xs"><FaPlus /></button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-400 hover:text-red-300 text-xs"><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Total</span>
                    <span className="text-xl font-bold gradient-text-reverse">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <button onClick={handleProceedToCheckout}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-amber-400 transition-all shadow-lg">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Addition Success Popup */}
      <AnimatePresence>
        {showPopup && addedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[400px] bg-dark-900/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center">
                  <FaCheckCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm">Added to Cart!</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Product added to cart successfully!</p>
                </div>
                <button onClick={() => setShowPopup(false)} className="text-gray-500 hover:text-white transition-colors">
                  <HiX size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                {addedProduct.image ? (
                  <img src={addedProduct.image} alt={addedProduct.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-dark-800 flex items-center justify-center text-xl">🧘</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{addedProduct.name}</p>
                  <p className="text-amber-400 text-xs font-bold mt-0.5">₹{addedProduct.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 hover:text-white transition-all text-gray-400"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setCartOpen(true);
                    setShowPopup(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md"
                >
                  View Cart
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductStore;
