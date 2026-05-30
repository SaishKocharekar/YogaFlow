import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket';
import { motion } from 'framer-motion';

const MyOrders = () => {
  const { getUserOrders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    // Real-time: listen for order updates
    const socket = connectSocket();
    socket.on('order-placed', (order) => {
      setOrders(prev => [order, ...prev]);
    });
    socket.on('order-updated', ({ id, status }) => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    });

    return () => {
      socket.off('order-placed');
      socket.off('order-updated');
    };
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try { setOrders(await getUserOrders()); } catch (e) { setOrders([]); }
    setLoading(false);
  };

  const statusColors = {
    Pending: 'text-amber-400 bg-amber-500/10',
    Processing: 'text-blue-400 bg-blue-500/10',
    Shipped: 'text-purple-400 bg-purple-500/10',
    Delivered: 'text-green-400 bg-green-500/10',
    Cancelled: 'text-red-400 bg-red-500/10',
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-2">My Orders</h1>
      <p className="text-gray-400 text-sm mb-8">Track your purchased products</p>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Orders Yet</h3>
          <p className="text-gray-400 text-sm">Your purchased products will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-light rounded-2xl p-5 border border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-white font-semibold">{order.productName}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                    <span>Qty: {order.quantity}</span><span>•</span>
                    <span className="text-amber-400 font-medium">₹{order.total?.toLocaleString()}</span><span>•</span>
                    <span className="text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Just now'}</span>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${statusColors[order.status] || 'text-gray-400 bg-gray-500/10'}`}>{order.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
