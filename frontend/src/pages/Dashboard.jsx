import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiUser, HiCalculator, HiOutlineSparkles,
  HiClipboardList, HiHeart, HiShoppingCart, HiLogout,
  HiMenuAlt2, HiX, HiChevronRight, HiArchive, HiChartBar, HiLightBulb
} from 'react-icons/hi';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: <HiHome />, exact: true },
    { name: 'Profile', path: '/dashboard/profile', icon: <HiUser /> },
    { name: 'BMI Calculator', path: '/dashboard/bmi', icon: <HiCalculator /> },
    { name: 'AI Plan', path: '/dashboard/ai-plan', icon: <HiLightBulb /> },
    { name: 'Yoga', path: '/dashboard/yoga', icon: <HiOutlineSparkles /> },
    { name: 'Diet Plans', path: '/dashboard/diet', icon: <HiClipboardList /> },
    { name: 'Meditation', path: '/dashboard/meditation', icon: <HiHeart /> },
    { name: 'Progress', path: '/dashboard/progress', icon: <HiChartBar /> },
    { name: 'Products', path: '/dashboard/products', icon: <HiShoppingCart /> },
    { name: 'My Orders', path: '/dashboard/orders', icon: <HiArchive /> },
  ];

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const DashboardOverview = () => (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">
        Welcome back, <span className="gradient-text">{userData?.name || currentUser?.displayName || 'User'}</span>
      </h1>
      <p className="text-gray-400 mb-8">Here's your wellness overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Your BMI', value: userData?.weight && userData?.height ? (userData.weight / Math.pow(userData.height / 100, 2)).toFixed(1) : '—', color: 'from-blue-500 to-purple-500', icon: '📊' },
          { label: 'Height', value: userData?.height != null && userData.height > 0 ? `${userData.height} cm` : 'Not set', color: 'from-purple-500 to-pink-500', icon: '📏' },
          { label: 'Weight', value: userData?.weight != null && userData.weight > 0 ? `${userData.weight} kg` : 'Not set', color: 'from-amber-500 to-orange-500', icon: '⚖️' },
          { label: 'Age', value: userData?.age != null && userData.age > 0 ? userData.age : 'Not set', color: 'from-green-500 to-teal-500', icon: '🎂' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-light rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Calculate BMI', desc: 'Get personalized recommendations', path: '/dashboard/bmi', icon: '🧮', color: 'purple' },
          { title: 'Yoga Exercises', desc: 'Poses tailored for your body', path: '/dashboard/yoga', icon: '🧘', color: 'amber' },
          { title: 'Diet Plans', desc: 'Nutrition for your goals', path: '/dashboard/diet', icon: '🥗', color: 'green' },
          { title: 'Meditation', desc: 'Peace of mind awaits', path: '/dashboard/meditation', icon: '🧠', color: 'blue' },
        ].map((card, i) => (
          <Link
            key={i}
            to={card.path}
            className="glass-light rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl mb-3 block">{card.icon}</span>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{card.desc}</p>
              </div>
              <HiChevronRight className="text-gray-600 group-hover:text-purple-400 text-xl transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-dark-900/50 fixed h-full z-30">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm">Y</div>
            <span className="text-xl font-bold"><span className="gradient-text">Yoga</span><span className="text-white">Flow</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path, item.exact)
                  ? 'bg-gradient-to-r from-purple-500/20 to-transparent text-purple-400 border-l-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-dark-900 z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm">Y</div>
                  <span className="text-xl font-bold"><span className="gradient-text">Yoga</span><span className="text-white">Flow</span></span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <HiX size={20} />
                </button>
              </div>

              <nav className="flex-1 px-3 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.path, item.exact)
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-white/5">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <HiMenuAlt2 size={24} />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{userData?.name || currentUser?.displayName || 'User'}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm">
                {(userData?.name || currentUser?.displayName || 'U')[0].toUpperCase()}
              </div>
              <button onClick={handleLogout} title="Logout"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/20">
                <HiLogout className="text-lg" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {location.pathname === '/dashboard' ? <DashboardOverview /> : <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
