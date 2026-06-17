import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaShoppingBag, FaBoxOpen, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract order parameters from state
  const { orderIds, items, totalAmount, paymentMethod, deliveryAddress } = location.state || {};

  // Redirect if no order data is available in state (e.g. direct url hit)
  useEffect(() => {
    if (!location.state) {
      navigate('/dashboard/products');
    }
  }, [location.state, navigate]);

  if (!location.state) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col font-sans justify-center items-center p-4">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl glass-light rounded-3xl p-6 sm:p-8 border border-white/5 space-y-8 relative z-10 my-8 shadow-2xl"
      >
        {/* Animated Checkmark and Success Header */}
        <div className="text-center space-y-3">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-2"
          >
            <FaCheckCircle size={44} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl font-display font-bold text-white"
          >
            Order Placed Successfully!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm max-w-md mx-auto"
          >
            Your order has been placed successfully. A confirmation has been logged to your account.
          </motion.p>
        </div>

        {/* Order Details Details */}
        <div className="space-y-6">
          
          {/* Section: Basic Details */}
          <div className="p-4 rounded-2xl bg-dark-900/50 border border-white/5 space-y-3 text-sm">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-gray-400 text-xs uppercase font-semibold tracking-wider">Order ID(s)</span>
              <span className="text-white font-mono text-xs select-all text-right font-medium">
                {orderIds && orderIds.length > 0 ? orderIds.map(id => `#${id.slice(0, 10)}`).join(', ') : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs uppercase font-semibold tracking-wider">Payment Method</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <FaCreditCard className="text-purple-400 text-xs" /> {paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-400 text-xs uppercase font-semibold tracking-wider">Total Paid</span>
              <span className="text-xl font-bold text-amber-400">₹{totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          {/* Section: Items Ordered */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <FaBoxOpen className="text-purple-400" /> Items Summary
            </h3>
            <div className="divide-y divide-white/5 border border-white/5 rounded-2xl bg-dark-900/30 overflow-hidden">
              {items && items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 text-sm hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded bg-dark-800 flex items-center justify-center text-[10px] text-gray-400 shrink-0 font-medium">{item.quantity}x</span>
                    <span className="text-white font-medium truncate">{item.name}</span>
                  </div>
                  <span className="text-amber-400 font-bold shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Delivery Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <FaMapMarkerAlt className="text-purple-400" /> Shipping Details
            </h3>
            <div className="p-4 border border-white/5 rounded-2xl bg-dark-900/30 text-sm space-y-1.5">
              <p className="font-semibold text-white">{deliveryAddress?.fullName}</p>
              <p className="text-gray-400 text-xs">
                {deliveryAddress?.houseNumber}, {deliveryAddress?.streetAddress}
              </p>
              <p className="text-gray-400 text-xs">
                {deliveryAddress?.city}, {deliveryAddress?.state} - {deliveryAddress?.pincode}
              </p>
              <p className="text-gray-400 text-xs">{deliveryAddress?.country}</p>
              <div className="border-t border-white/5 pt-2 mt-2 flex justify-between text-xs text-gray-500">
                <span>Phone: {deliveryAddress?.mobileNumber}</span>
                <span>Email: {deliveryAddress?.emailAddress}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Redirect Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <Link 
            to="/dashboard/products" 
            className="flex items-center justify-center gap-2 py-3 bg-dark-800 hover:bg-dark-700 text-white font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-all text-sm"
          >
            <FaShoppingBag size={14} /> Continue Shopping
          </Link>
          <Link 
            to="/dashboard/orders" 
            className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold rounded-2xl hover:from-purple-500 hover:to-amber-400 transition-all text-sm shadow-md"
          >
            <FaBoxOpen size={14} /> View My Orders
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
