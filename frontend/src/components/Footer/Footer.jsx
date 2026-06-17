import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaYoutube, FaFacebook, FaHeart } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/#about' },
      { name: 'Features', path: '/#features' },
      { name: 'Products', path: '/#products' },
    ],
    Wellness: [
      { name: 'BMI Calculator', path: '/signup' },
      { name: 'Yoga Poses', path: '/signup' },
      { name: 'Meditation', path: '/signup' },
      { name: 'Diet Plans', path: '/signup' },
    ],
    Legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
      { name: 'Cookie Policy', path: '#' },
      { name: 'Disclaimer', path: '#' },
    ]
  };

  return (
    <footer className="relative pt-20 pb-8 border-t border-white/5 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg">
                Y
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Yoga</span>
                <span className="text-white">Flow</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Your complete wellness platform for personalized yoga, meditation, and nutrition guidance. 
              Transform your mind and body with science-backed recommendations.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <FaInstagram />, href: '#' },
                { icon: <FaTwitter />, href: '#' },
                { icon: <FaYoutube />, href: '#' },
                { icon: <FaFacebook />, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-gray-400 hover:text-purple-400 hover:border-purple-500/30 border border-transparent transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="text-gray-400 text-sm hover:text-purple-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <MdEmail className="text-purple-400" />
              <span>contact@yogaflow.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MdPhone className="text-purple-400" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <MdLocationOn className="text-purple-400" />
              <span>Mumbai, India</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          <p>
            © {currentYear} YogaFlow. Made with <FaHeart className="inline text-red-400 mx-1" /> for a healthier world.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
