import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { connectSocket } from '../services/socket';
import {
  HiHome, HiUsers, HiShoppingBag, HiClipboardList,
  HiPencilAlt, HiLogout, HiMenuAlt2, HiX, HiChartBar
} from 'react-icons/hi';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, bmiRecords: 0 });
  const { currentUser, userData, logout, getAllUsers, getProducts, getAllOrders } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    // Real-time stat updates
    const socket = connectSocket();
    socket.on('new-order', () => setStats(prev => ({ ...prev, orders: prev.orders + 1 })));
    socket.on('product-added', () => setStats(prev => ({ ...prev, products: prev.products + 1 })));
    socket.on('product-deleted', () => setStats(prev => ({ ...prev, products: Math.max(0, prev.products - 1) })));
    socket.on('user-deleted', () => setStats(prev => ({ ...prev, users: Math.max(0, prev.users - 1) })));
    return () => { socket.off('new-order'); socket.off('product-added'); socket.off('product-deleted'); socket.off('user-deleted'); };
  }, []);

  const loadStats = async () => {
    try {
      const [users, products, orders] = await Promise.all([
        getAllUsers(),
        getProducts(),
        getAllOrders()
      ]);
      setStats({
        users: users.length,
        products: products.length,
        orders: orders.length,
        bmiRecords: 0
      });
    } catch (err) {
      console.log('Could not load admin stats');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <HiHome />, exact: true },
    { name: 'Users', path: '/admin/users', icon: <HiUsers /> },
    { name: 'Products', path: '/admin/products', icon: <HiShoppingBag /> },
    { name: 'Orders', path: '/admin/orders', icon: <HiClipboardList /> },
    { name: 'Content', path: '/admin/content', icon: <HiPencilAlt /> },
  ];

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const AdminOverview = () => (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
      <p className="text-gray-400 mb-8">Platform overview and management</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.users, icon: <HiUsers />, color: 'from-purple-500 to-pink-500', bg: 'purple' },
          { label: 'Products', value: stats.products, icon: <HiShoppingBag />, color: 'from-amber-500 to-orange-500', bg: 'amber' },
          { label: 'Orders', value: stats.orders, icon: <HiClipboardList />, color: 'from-green-500 to-teal-500', bg: 'green' },
          { label: 'Analytics', value: '—', icon: <HiChartBar />, color: 'from-blue-500 to-indigo-500', bg: 'blue' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-light rounded-2xl p-6 border border-white/5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {menuItems.filter(m => !m.exact).map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className="glass-light rounded-2xl p-6 border border-white/5 hover:border-amber-500/20 transition-all group flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold">{item.name} Management</h3>
              <p className="text-gray-400 text-sm">Manage platform {item.name.toLowerCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-dark-900/50 fixed h-full z-30">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-xl font-bold"><span className="gradient-text-reverse">Admin</span><span className="text-white"> Panel</span></span>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path, item.exact)
                  ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-2 border-amber-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-purple-400 transition-all mb-1">
            <HiHome className="text-lg" /> User Dashboard
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 transition-all">
            <HiLogout className="text-lg" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-dark-900 z-50 lg:hidden flex flex-col">
              <div className="p-6 flex items-center justify-between">
                <span className="text-xl font-bold"><span className="gradient-text-reverse">Admin</span></span>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white"><HiX size={20} /></button>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {menuItems.map(item => (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.path, item.exact) ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <span className="text-lg">{item.icon}</span>{item.name}
                  </Link>
                ))}
              </nav>
              <div className="p-3 border-t border-white/5">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400">
                  <HiLogout className="text-lg" /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 glass border-b border-white/5">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white"><HiMenuAlt2 size={24} /></button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium">Admin</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {(userData?.name || 'A')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
          {location.pathname === '/admin' ? <AdminOverview /> : <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
