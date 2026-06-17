import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGetBMIHistory, apiGetBMIRecommendation } from '../services/api';
import { FaDumbbell, FaBrain, FaAppleAlt, FaLightbulb } from 'react-icons/fa';
import { HiTrendingDown, HiTrendingUp } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const mealIcons = { breakfast: '🥣', mid_morning: '🍎', lunch: '🥘', evening_snack: '☕', dinner: '🍛', snack: '🥜', pre_workout: '💪', post_workout: '🥤' };

const AIPlan = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [bmiRecord, setBmiRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diet');
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  useEffect(() => { loadLatest(); }, []);

  const loadLatest = async () => {
    setLoading(true);
    try {
      const records = await apiGetBMIHistory();
      setHistory(records);
      if (records.length > 0) {
        const latest = records[0];
        setBmiRecord(latest);
        setSelectedRecordId(latest.id);
        try {
          const rec = await apiGetBMIRecommendation(latest.id);
          setRecommendation(rec);
        } catch (e) { setRecommendation(null); }
      }
    } catch (e) {}
    setLoading(false);
  };

  const loadForRecord = async (record) => {
    setSelectedRecordId(record.id);
    setBmiRecord(record);
    setRecommendation(null);
    try {
      const rec = await apiGetBMIRecommendation(record.id);
      setRecommendation(rec);
    } catch (e) { setRecommendation(null); }
  };

  const getCategoryColor = (cat) => {
    const map = { Underweight: '#3b82f6', Normal: '#22c55e', Overweight: '#f59e0b', Obese: '#ef4444' };
    return map[cat] || '#9ca3af';
  };

  // --- Loading State ---
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading your AI plan...</p>
      </div>
    </div>
  );

  // --- No Record State ---
  if (!bmiRecord) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center text-4xl mx-auto mb-5">🤖</div>
        <h2 className="text-xl font-bold text-white mb-2">No AI Plan Yet</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">Calculate your BMI first to generate a personalized AI-powered diet, yoga, and meditation plan.</p>
        <Link to="/dashboard/bmi" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-amber-400 transition-all shadow-lg shadow-purple-500/20">
          🧮 Go to BMI Calculator
        </Link>
      </div>
    </div>
  );

  const color = getCategoryColor(bmiRecord.category);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">AI Personalized Plan</h1>
          <p className="text-gray-400 text-sm mt-1">Tailored health plan based on your BMI progress</p>
        </div>
        <Link to="/dashboard/bmi"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-800/60 text-sm font-medium text-gray-300 border border-white/10 hover:border-purple-500/30 hover:text-white transition-all whitespace-nowrap">
          🧮 Recalculate BMI
        </Link>
      </div>

      {/* BMI Summary Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass-light rounded-2xl border border-white/5 mb-6 overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* BMI Value */}
            <div className="flex items-center gap-5">
              <div className="text-center min-w-[80px]">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Current BMI</p>
                <p className="text-4xl font-bold leading-none" style={{ color }}>{bmiRecord.bmi}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${color}15`, color }}>
                  {bmiRecord.category}
                </span>
                {bmiRecord.progressStatus && bmiRecord.progressStatus !== 'First Record' && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    bmiRecord.progressStatus.includes('Improved') ? 'bg-green-500/10 text-green-400' :
                    bmiRecord.progressStatus.includes('Increased') ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {bmiRecord.progressStatus.includes('Improved') ? <HiTrendingDown size={13} /> : <HiTrendingUp size={13} />}
                    {bmiRecord.progressStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-12 bg-white/5" />

            {/* Weight & Height */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Weight</p>
                <p className="text-white font-semibold">{bmiRecord.weight} kg</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Height</p>
                <p className="text-white font-semibold">{bmiRecord.height} cm</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Date</p>
                <p className="text-white font-semibold">{new Date(bmiRecord.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Health Feedback */}
          {recommendation?.health_feedback && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-3">
              <span className="text-lg mt-0.5">💡</span>
              <p className="text-gray-400 text-sm leading-relaxed">{recommendation.health_feedback}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* History Selector */}
      {history.length > 1 && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2.5">Past Calculations</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {history.slice(0, 8).map((rec) => (
              <button key={rec.id} onClick={() => loadForRecord(rec)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  selectedRecordId === rec.id
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                    : 'bg-dark-800/40 text-gray-500 hover:text-gray-300 border border-white/5'
                }`}>
                {rec.bmi} · {new Date(rec.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Tabs + Content */}
      {recommendation ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tabs — scroll horizontally on mobile */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {[
              { key: 'diet', label: 'Diet Plan', icon: <FaAppleAlt size={13} />, color: 'text-green-400' },
              { key: 'yoga', label: 'Yoga Plan', icon: <FaDumbbell size={13} />, color: 'text-purple-400' },
              { key: 'meditation', label: 'Meditation', icon: <FaBrain size={13} />, color: 'text-blue-400' },
              { key: 'tips', label: 'Next Steps', icon: <FaLightbulb size={13} />, color: 'text-amber-400' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r from-purple-500/15 to-amber-500/15 text-white border border-purple-500/25`
                    : 'bg-dark-800/40 text-gray-500 hover:text-gray-300 border border-white/5'
                }`}>
                <span className={activeTab === tab.key ? tab.color : ''}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="glass-light rounded-2xl p-5 sm:p-7 border border-white/5">

              {/* ─── DIET PLAN ─── */}
              {activeTab === 'diet' && recommendation.updated_diet_plan && (() => {
                const diet = recommendation.updated_diet_plan;
                return (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h3 className="text-white font-semibold text-lg">Your Diet Plan</h3>
                      <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold capitalize border border-green-500/20">
                        🎯 Goal: {diet.goal}
                      </span>
                    </div>

                    {diet.plan_note && (
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                        <p className="text-amber-300/80 text-sm">💡 {diet.plan_note}</p>
                      </div>
                    )}

                    {/* Meals Grid */}
                    {diet.meals && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">Daily Meal Plan</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(diet.meals).map(([meal, desc]) => (
                            <div key={meal} className="bg-dark-800/30 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{mealIcons[meal] || '🍽️'}</span>
                                <p className="text-amber-400 text-xs font-bold uppercase tracking-wide">{meal.replace(/_/g, ' ')}</p>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Foods */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {diet.recommended_foods?.length > 0 && (
                        <div>
                          <p className="text-green-400 text-xs font-bold uppercase tracking-wide mb-3">✅ Recommended Foods</p>
                          <div className="flex flex-wrap gap-2">
                            {diet.recommended_foods.map((food, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-green-500/8 border border-green-500/15 text-green-300 text-sm">{food}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {diet.foods_to_avoid?.length > 0 && (
                        <div>
                          <p className="text-red-400 text-xs font-bold uppercase tracking-wide mb-3">❌ Foods to Avoid</p>
                          <div className="flex flex-wrap gap-2">
                            {diet.foods_to_avoid.map((food, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-red-500/8 border border-red-500/15 text-red-300 text-sm">{food}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ─── YOGA PLAN ─── */}
              {activeTab === 'yoga' && recommendation.yoga_plan && (() => {
                const yoga = recommendation.yoga_plan;
                return (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h3 className="text-white font-semibold text-lg">Your Yoga Routine</h3>
                      <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
                        📅 {yoga.frequency}
                      </span>
                    </div>
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl px-4 py-3">
                      <p className="text-purple-300/80 text-sm">🧘 Focus: {yoga.focus}</p>
                    </div>

                    {yoga.poses?.length > 0 && (
                      <div className="space-y-2.5">
                        {yoga.poses.map((pose, i) => (
                          <div key={i} className="flex items-center gap-4 bg-dark-800/30 rounded-xl p-4 border border-white/5 hover:border-purple-500/15 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/10 text-purple-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold">{pose.name}</p>
                              <p className="text-gray-500 text-xs mt-0.5 truncate">{pose.benefit}</p>
                            </div>
                            <span className="text-purple-400 text-xs font-medium bg-purple-500/10 px-3 py-1.5 rounded-lg flex-shrink-0 border border-purple-500/15">
                              {pose.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ─── MEDITATION ─── */}
              {activeTab === 'meditation' && recommendation.meditation_plan && (() => {
                const med = recommendation.meditation_plan;
                return (
                  <div className="space-y-6">
                    <h3 className="text-white font-semibold text-lg">Your Meditation Practice</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Type', value: med.type, icon: '🧠', gradient: 'from-blue-500/15 to-blue-900/5' },
                        { label: 'Duration', value: med.duration, icon: '⏱️', gradient: 'from-purple-500/15 to-purple-900/5' },
                        { label: 'Best Time', value: med.best_time, icon: '🌅', gradient: 'from-amber-500/15 to-amber-900/5' },
                      ].map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                          className={`bg-gradient-to-br ${item.gradient} rounded-xl p-5 border border-white/5`}>
                          <span className="text-2xl block mb-3">{item.icon}</span>
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
                          <p className="text-white text-sm font-semibold">{item.value}</p>
                        </motion.div>
                      ))}
                    </div>
                    {med.technique && (
                      <div className="bg-dark-800/30 rounded-xl p-5 border border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Technique</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{med.technique}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ─── NEXT STEPS ─── */}
              {activeTab === 'tips' && recommendation.next_step_advice && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg mb-1">Next Steps & Advice</h3>
                  {recommendation.next_step_advice.map((tip, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex gap-4 items-start bg-dark-800/30 rounded-xl p-5 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/5 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {recommendation.recommendation_update && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 px-5 py-3 rounded-xl bg-purple-500/8 border border-purple-500/15 text-purple-400 text-sm font-medium text-center">
              🔄 This plan was updated because your BMI category changed!
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div className="glass-light rounded-2xl p-10 border border-white/5 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-400 text-sm mb-3">No recommendation found for this record.</p>
          <Link to="/dashboard/bmi" className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-all">
            Recalculate to generate a new plan →
          </Link>
        </div>
      )}
    </div>
  );
};

export default AIPlan;
