import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiSearch } from 'react-icons/hi';
import { connectSocket } from '../services/socket';

const AdminOrders = () => {
  const { getAllOrders, updateOrderStatus } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
    const socket = connectSocket();
    socket.on('new-order', (order) => setOrders(prev => [order, ...prev]));
    return () => { socket.off('new-order'); };
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try { setOrders(await getAllOrders()); } catch (e) {}
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) {}
  };

  const filtered = orders.filter(o =>
    o.productName?.toLowerCase().includes(search.toLowerCase()) ||
    o.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    Pending: 'text-amber-400 bg-amber-500/10',
    Processing: 'text-blue-400 bg-blue-500/10',
    Shipped: 'text-purple-400 bg-purple-500/10',
    Delivered: 'text-green-400 bg-green-500/10',
    Cancelled: 'text-red-400 bg-red-500/10',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Order Management</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-dark-800/50 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500/50" />
        </div>
      </div>

      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : filtered.length === 0 ? (
        <div className="text-center py-16"><div className="text-5xl mb-4">📦</div><p className="text-gray-400">No orders found.</p></div>
      ) : (
        <div className="glass-light rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Order</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium hidden sm:table-cell">User</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Product</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium hidden md:table-cell">Total</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
              </tr></thead>
              <tbody>{filtered.map(order => (
                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-3 text-gray-300 text-xs font-mono">#{order.id?.slice(0,8)}</td>
                  <td className="px-6 py-3 text-gray-300 hidden sm:table-cell">{order.userName || '—'}</td>
                  <td className="px-6 py-3 text-white font-medium">{order.productName}</td>
                  <td className="px-6 py-3 text-amber-400 font-medium hidden md:table-cell">₹{order.total?.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 focus:outline-none ${statusColors[order.status] || 'text-gray-400 bg-gray-500/10'}`}>
                      {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
