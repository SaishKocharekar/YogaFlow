import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FaCreditCard, 
  FaUniversity, 
  FaWallet, 
  FaMoneyBillWave, 
  FaMobileAlt, 
  FaLock, 
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';

const Checkout = () => {
  const { currentUser, placeOrder } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get items passed via router state
  const checkoutItems = location.state?.items || [];

  // Address state
  const [address, setAddress] = useState({
    fullName: currentUser?.displayName || '',
    mobileNumber: '',
    emailAddress: currentUser?.email || '',
    houseNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  // Errors state
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState('');
  
  // Selected Payment Method state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [placing, setPlacing] = useState(false);

  // Redirect if no items in checkout state
  useEffect(() => {
    if (checkoutItems.length === 0) {
      navigate('/dashboard/products');
    }
  }, [checkoutItems, navigate]);

  // Calculations
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharges = subtotal >= 499 ? 0 : 49;
  const grandTotal = subtotal + deliveryCharges;

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Payment selection handler
  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    setPaymentError('');
  };

  // Form validator
  const validateForm = () => {
    const tempErrors = {};
    if (!address.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    
    // Mobile number validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!address.mobileNumber.trim()) {
      tempErrors.mobileNumber = 'Mobile Number is required';
    } else if (!mobileRegex.test(address.mobileNumber.trim())) {
      tempErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!address.emailAddress.trim()) {
      tempErrors.emailAddress = 'Email is required';
    } else if (!emailRegex.test(address.emailAddress.trim())) {
      tempErrors.emailAddress = 'Enter a valid email address';
    }

    if (!address.houseNumber.trim()) tempErrors.houseNumber = 'House/Flat Number is required';
    if (!address.streetAddress.trim()) tempErrors.streetAddress = 'Street Address is required';
    if (!address.city.trim()) tempErrors.city = 'City is required';
    if (!address.state.trim()) tempErrors.state = 'State is required';
    
    // Pincode validation (6 digits)
    const pinRegex = /^[0-9]{6}$/;
    if (!address.pincode.trim()) {
      tempErrors.pincode = 'Pincode is required';
    } else if (!pinRegex.test(address.pincode.trim())) {
      tempErrors.pincode = 'Enter a valid 6-digit pincode';
    }

    if (!address.country.trim()) tempErrors.country = 'Country is required';

    setErrors(tempErrors);
    
    // Validate payment method
    if (!paymentMethod) {
      setPaymentError('Please select a payment method before placing your order');
    }

    return Object.keys(tempErrors).length === 0 && !!paymentMethod;
  };

  // Order Submission Handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPlacing(true);
    try {
      const placedOrderIds = [];
      // Place order for each checkout item to keep database records atomic and clean
      for (const item of checkoutItems) {
        const result = await placeOrder({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          paymentMethod,
          deliveryAddress: address
        });
        if (result && result.id) {
          placedOrderIds.push(result.id);
        }
      }

      // Navigate to success page with order details
      navigate('/order-success', {
        state: {
          orderIds: placedOrderIds,
          items: checkoutItems,
          totalAmount: grandTotal,
          paymentMethod,
          deliveryAddress: address
        }
      });
    } catch (err) {
      console.error('Failed to place order:', err);
      setErrors(prev => ({ ...prev, submit: 'Failed to place order. Please try again.' }));
    }
    setPlacing(false);
  };

  const paymentOptions = [
    { id: 'Credit Card', label: 'Credit Card', icon: <FaCreditCard size={20} />, description: 'Pay with Visa, Mastercard' },
    { id: 'Debit Card', label: 'Debit Card', icon: <FaCreditCard size={20} />, description: 'Use any bank Debit Card' },
    { id: 'UPI', label: 'UPI / NetBanking', icon: <FaMobileAlt size={20} />, description: 'Pay via Google Pay, PhonePe, UPI ID' },
    { id: 'Net Banking', label: 'Net Banking', icon: <FaUniversity size={20} />, description: 'Direct transfer from major banks' },
    { id: 'Wallets', label: 'Wallets', icon: <FaWallet size={20} />, description: 'Pay via Paytm, PhonePe Wallet' },
    { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: <FaMoneyBillWave size={20} />, description: 'Pay cash when items arrive' }
  ];

  if (checkoutItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col font-sans">
      {/* Checkout Navbar */}
      <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard/products" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm">Y</div>
            <span className="text-lg font-bold"><span className="gradient-text">Yoga</span><span className="text-white">Flow</span></span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 border border-white/10 px-3 py-1.5 rounded-xl bg-dark-800/50">
            <FaLock className="text-green-500" />
            <span className="font-medium">100% SECURE CHECKOUT</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6 group">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Store
        </Link>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-8">Checkout</h1>

        {errors.submit && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            ⚠️ {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Columns - Address Form & Payment Method Selection */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Delivery Address Form */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="glass-light rounded-2xl p-6 border border-white/5 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-purple-500/30">1</span>
                <h2 className="text-lg font-bold text-white">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name *</label>
                  <input type="text" name="fullName" value={address.fullName} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="John Doe" />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1.5">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mobile Number *</label>
                  <input type="text" name="mobileNumber" value={address.mobileNumber} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.mobileNumber ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="9876543210" />
                  {errors.mobileNumber && <p className="text-red-400 text-xs mt-1.5">{errors.mobileNumber}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address *</label>
                  <input type="email" name="emailAddress" value={address.emailAddress} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.emailAddress ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="john@example.com" />
                  {errors.emailAddress && <p className="text-red-400 text-xs mt-1.5">{errors.emailAddress}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">House / Flat No. *</label>
                  <input type="text" name="houseNumber" value={address.houseNumber} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.houseNumber ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="Flat 101, building name" />
                  {errors.houseNumber && <p className="text-red-400 text-xs mt-1.5">{errors.houseNumber}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Street Address *</label>
                  <input type="text" name="streetAddress" value={address.streetAddress} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.streetAddress ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="Main Street, Area" />
                  {errors.streetAddress && <p className="text-red-400 text-xs mt-1.5">{errors.streetAddress}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">City *</label>
                  <input type="text" name="city" value={address.city} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.city ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="Mumbai" />
                  {errors.city && <p className="text-red-400 text-xs mt-1.5">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State *</label>
                  <input type="text" name="state" value={address.state} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.state ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="Maharashtra" />
                  {errors.state && <p className="text-red-400 text-xs mt-1.5">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pincode *</label>
                  <input type="text" name="pincode" value={address.pincode} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.pincode ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="400001" />
                  {errors.pincode && <p className="text-red-400 text-xs mt-1.5">{errors.pincode}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Country *</label>
                  <input type="text" name="country" value={address.country} onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-dark-800/50 border ${errors.country ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:outline-none focus:border-purple-500`}
                    placeholder="India" />
                  {errors.country && <p className="text-red-400 text-xs mt-1.5">{errors.country}</p>}
                </div>
              </div>
            </motion.div>

            {/* Step 2: Payment Options Form */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-light rounded-2xl p-6 border border-white/5 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-purple-500/30">2</span>
                <h2 className="text-lg font-bold text-white">Payment Method</h2>
              </div>

              {paymentError && (
                <p className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm font-medium">
                  ⚠️ {paymentError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentOptions.map((opt) => {
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <div 
                      key={opt.id} 
                      onClick={() => handlePaymentSelect(opt.id)}
                      className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
                        isSelected 
                          ? 'bg-purple-500/10 border-purple-500 shadow-md shadow-purple-500/10' 
                          : 'bg-dark-800/50 border-white/5 hover:border-white/20 hover:bg-dark-800'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-all ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-dark-900 text-gray-400 group-hover:text-white'
                      }`}>
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-white">{opt.label}</p>
                          {isSelected && <FaCheckCircle className="text-purple-400 text-sm shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{opt.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary & Placing Order */}
          <div className="space-y-6">
            
            {/* Step 3: Order Summary */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-light rounded-2xl p-6 border border-white/5 space-y-6 sticky top-24">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4">Order Summary</h2>
              
              {/* Product list */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center py-1 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-lg bg-dark-800 border border-white/5 overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🧘</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-amber-400">₹{(item.price * item.quantity).toLocaleString()}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-gray-500">₹{item.price} each</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-white/5 pt-4 space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  {deliveryCharges === 0 ? (
                    <span className="text-green-400 font-semibold uppercase text-xs tracking-wider">FREE</span>
                  ) : (
                    <span className="text-white font-medium">₹{deliveryCharges}</span>
                  )}
                </div>
                {deliveryCharges > 0 && (
                  <p className="text-[10px] text-amber-400/80">Add ₹{(499 - subtotal) > 0 ? (499 - subtotal) : 0} more to get FREE Delivery!</p>
                )}
                
                <div className="border-t border-white/5 my-3" />
                
                <div className="flex justify-between items-baseline text-white">
                  <span className="font-bold text-base">Grand Total</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-amber-400 transition-all shadow-lg hover:shadow-purple-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Place Order
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[10px] text-gray-500">By placing this order you agree to our Terms and Conditions.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
