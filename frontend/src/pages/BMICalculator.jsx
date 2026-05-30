import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCalculateBMI, apiGetBMIHistory } from '../services/api';
import { connectSocket } from '../services/socket';
import { Link } from 'react-router-dom';
import { HiTrendingDown, HiTrendingUp } from 'react-icons/hi';
import { FaMinus } from 'react-icons/fa';

const BMICalculator = () => {
  const { currentUser, userData } = useAuth();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [planPopup, setPlanPopup] = useState(null);

  useEffect(() => {
    if (userData) {
      if (userData.height) setHeight(String(userData.height));
      if (userData.weight) setWeight(String(userData.weight));
    }
    loadHistory();

    const socket = connectSocket();
    socket.on('plan-updated', (data) => {
      setPlanPopup(data.message);
      setTimeout(() => setPlanPopup(null), 6000);
    });
    return () => { socket.off('plan-updated'); };
  }, [userData]);

  const loadHistory = async () => {
    try { setHistory(await apiGetBMIHistory()); } catch (err) {}
  };

  const handleCalculate = async () => {
    if (!height || !weight) return;
    setSaving(true);
    try {
      const data = await apiCalculateBMI(Number(weight), Number(height));
      setResult(data);
      await loadHistory();
    } catch (err) {
      console.error('BMI calculation failed:', err);
    }
    setSaving(false);
  };

  const getCategoryColor = (cat) => {
    if (cat === 'Underweight') return '#3b82f6';
    if (cat === 'Normal') return '#22c55e';
    if (cat === 'Overweight') return '#f59e0b';
    return '#ef4444';
  };

  const getProgressColor = (status) => {
    if (!status) return '';
    if (status.includes('Improved')) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (status.includes('Increased')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  const gaugeRotation = result ? Math.min(Math.max((result.bmi - 10) / 35 * 180, 0), 180) : 0;

  return (
    <div>
      {/* Plan Updated Popup */}
      <AnimatePresence>
        {planPopup && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl bg-gradient-to-r from-purple-600/90 to-amber-500/90 backdrop-blur-md text-white shadow-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔄</div>
              <div>
                <p className="font-semibold text-sm">Plan Updated!</p>
                <p className="text-xs text-white/80">{planPopup}</p>
              </div>
              <button onClick={() => setPlanPopup(null)} className="ml-2 text-white/60 hover:text-white">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-display font-bold text-white mb-2">BMI Calculator</h1>
      <p className="text-gray-400 text-sm mb-8">Calculate your Body Mass Index and get AI-powered recommendations</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calculator Card */}
        <div className="glass-light rounded-2xl p-6 sm:p-8 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">Enter Your Details</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 170" min="100" max="250"
                className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 65" min="20" max="300"
                className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all" />
            </div>
            <button onClick={handleCalculate} disabled={!height || !weight || saving}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-amber-400 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50">
              {saving ? '🔄 Calculating & generating plan...' : 'Calculate BMI'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-gray-500 mb-3 font-medium">BMI Categories</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Underweight', range: '< 18.5', color: 'bg-blue-500' },
                { label: 'Normal', range: '18.5 – 24.9', color: 'bg-green-500' },
                { label: 'Overweight', range: '25 – 29.9', color: 'bg-amber-500' },
                { label: 'Obese', range: '≥ 30', color: 'bg-red-500' },
              ].map((cat, i) => (
                <div key={i} className="text-center">
                  <div className={`h-1.5 rounded-full ${cat.color} mb-2`} />
                  <p className="text-xs text-gray-400 font-medium">{cat.label}</p>
                  <p className="text-xs text-gray-500">{cat.range}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className="glass-light rounded-2xl p-6 sm:p-8 border border-white/5">
          {result ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              {/* Gauge */}
              <div className="relative w-48 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-t-full overflow-hidden">
                  <div className="w-full h-full bmi-gauge rounded-t-full" />
                  <div className="absolute inset-2 bg-dark-800 rounded-t-full" />
                </div>
                <div className="absolute bottom-0 left-1/2 w-1 h-20 bg-white rounded-full origin-bottom transition-transform duration-1000"
                  style={{ transform: `translateX(-50%) rotate(${gaugeRotation - 90}deg)` }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg" />
              </div>

              <div className="text-5xl font-bold mb-2" style={{ color: getCategoryColor(result.category) }}>{result.bmi}</div>
              <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
                style={{ backgroundColor: `${getCategoryColor(result.category)}20`, color: getCategoryColor(result.category) }}>
                {result.category}
              </div>

              {/* Progress Badge */}
              {result.progressStatus && result.progressStatus !== 'First Record' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium border mb-4 ${getProgressColor(result.progressStatus)}`}>
                  {result.progressStatus.includes('Improved') ? <HiTrendingDown /> : result.progressStatus.includes('Increased') ? <HiTrendingUp /> : <FaMinus />}
                  <span>{result.progressStatus}</span>
                  {result.previousBmi && <span className="text-xs opacity-70">(prev: {result.previousBmi})</span>}
                </motion.div>
              )}

              {/* Health Feedback */}
              {result.recommendation?.health_feedback && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{result.recommendation.health_feedback}</p>
              )}

              {result.categoryChanged && (
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
                  🔄 Category changed! Your plan has been updated.
                </div>
              )}

              {/* Link to AI Plan */}
              <Link to="/dashboard/ai-plan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-amber-400 transition-all shadow-lg shadow-purple-500/25 mt-2">
                🤖 View Your AI Plan
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-6xl mb-4">🧮</div>
              <h3 className="text-lg font-semibold text-white mb-2">Calculate Your BMI</h3>
              <p className="text-gray-400 text-sm">Enter your height and weight to get your BMI and AI-powered personalized plans.</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">BMI History</h2>
          <div className="glass-light rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">BMI</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Category</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Progress</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((record, i) => {
                    const color = getCategoryColor(record.category);
                    return (
                      <tr key={record.id || i} className="border-b border-white/5 last:border-0">
                        <td className="px-6 py-3 text-gray-300">
                          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'Just now'}
                        </td>
                        <td className="px-6 py-3 font-semibold" style={{ color }}>{record.bmi}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: `${color}20`, color }}>{record.category}</span>
                        </td>
                        <td className="px-6 py-3">
                          {record.progressStatus && record.progressStatus !== 'First Record' ? (
                            <span className={`text-xs font-medium ${record.progressStatus.includes('Improved') ? 'text-green-400' : record.progressStatus.includes('Increased') ? 'text-red-400' : 'text-amber-400'}`}>
                              {record.progressStatus}
                            </span>
                          ) : <span className="text-xs text-gray-500">—</span>}
                        </td>
                        <td className="px-6 py-3 text-gray-300">{record.weight} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
