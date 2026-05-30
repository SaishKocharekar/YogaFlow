import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: '', height: '', weight: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(formData.email, formData.password, {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight
      });
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
        setStep(1);
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg">Y</div>
          <span className="text-2xl font-bold">
            <span className="gradient-text">Yoga</span><span className="text-white">Flow</span>
          </span>
        </Link>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">Create Account</h2>
          <p className="text-gray-400 text-sm text-center mb-6">Begin your wellness transformation</p>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white' : 'bg-dark-700 text-gray-400'}`}>1</div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-purple-500' : 'bg-dark-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white' : 'bg-dark-700 text-gray-400'}`}>2</div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition-all duration-300 mb-6 disabled:opacity-50"
              >
                <FcGoogle className="text-xl" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500 uppercase">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                      placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                      placeholder="your@email.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                      className="w-full pl-10 pr-12 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                      placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                      className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                      placeholder="Repeat password" />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/25">
                  Next — Health Details
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-400 mb-4 text-center">These details help us personalize your yoga and diet recommendations.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required min="10" max="100"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="25" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} required min="100" max="250"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="170" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} required min="20" max="300"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="65" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-700 rounded-xl text-gray-300 font-medium hover:border-gray-500 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-amber-400 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
