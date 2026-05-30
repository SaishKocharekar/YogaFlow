import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' },
    { name: 'Features', path: '/#features' },
    { name: 'BMI Calculator', path: currentUser ? '/dashboard/bmi' : '/#features' },
    { name: 'Products', path: '/#products' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (e, path) => {
    if (path.startsWith('/#')) {
      e.preventDefault();
      const id = path.replace('/#', '');
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass shadow-lg shadow-purple-500/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg transform group-hover:rotate-12 transition-transform duration-300">
              Y
            </div>
            <span className="text-xl lg:text-2xl font-bold">
              <span className="gradient-text">Yoga</span>
              <span className="text-white">Flow</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-purple-500/25"
                >
                  Dashboard
                </Link>
                {userData?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-5 py-2.5 text-sm font-medium text-amber-400 border border-amber-400/30 rounded-xl hover:bg-amber-400/10 transition-all duration-300"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 rounded-xl hover:border-gray-500 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 rounded-xl hover:border-purple-500/50 transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl hover:from-purple-500 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-purple-500/25"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {isOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'text-purple-400 bg-purple-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-2">
                {currentUser ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 text-center">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 border border-gray-700 hover:text-white">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-300 border border-gray-700 text-center">
                      Login
                    </Link>
                    <Link to="/signup" className="block px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-amber-500 text-center">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
