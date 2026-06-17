import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGetProgress, apiLogActivity } from '../services/api';
import { FaFire, FaDumbbell, FaBrain, FaAppleAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { HiTrendingDown, HiTrendingUp, HiClock, HiCalendar } from 'react-icons/hi';

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState(false);
  const [logType, setLogType] = useState('yoga');
  const [logDuration, setLogDuration] = useState('30');
  const [logNotes, setLogNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadProgress(); }, []);

  const loadProgress = async () => {
    setLoading(true);
    try { setProgress(await apiGetProgress()); }
    catch (e) { setProgress(null); }
    setLoading(false);
  };

  const handleLogActivity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiLogActivity({ type: logType, duration: Number(logDuration), notes: logNotes });
      setLogModal(false); setLogNotes(''); setLogDuration('30');
      await loadProgress();
    } catch (e) {}
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading your wellness journey...</div>;
  if (!progress) return <div className="text-center py-16 text-gray-400">Could not load progress data.</div>;

  const { streak, yogaSessions, meditationMins, dietAdherence, bmiHistory, weeklyActivity, lastBmi } = progress;
  const maxYoga = Math.max(...(weeklyActivity || []).map(d => d.yoga), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Your Wellness Journey</h1>
          <p className="text-gray-400 text-sm mt-1">Track your progress, celebrate achievements, and stay motivated</p>
        </div>
        <button onClick={() => setLogModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white text-sm font-medium hover:from-amber-400 hover:to-purple-500 transition-all shadow-lg shadow-amber-500/20">
          <FaPlus size={12} /> Log Activity
        </button>
      </div>

      {/* Streak Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-2xl p-8 text-center"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 text-6xl opacity-30">🔥</div>
          <div className="absolute bottom-4 right-8 text-6xl opacity-30">🏆</div>
        </div>
        <div className="relative">
          <FaFire className="text-amber-400 text-4xl mx-auto mb-3 animate-pulse" />
          <p className="text-6xl font-display font-bold gradient-text-reverse mb-2">{streak} Day{streak !== 1 ? 's' : ''}</p>
          <p className="text-gray-300 text-sm font-medium tracking-wider uppercase">Current Streak</p>
          {streak >= 7 && <p className="text-amber-400 text-xs mt-2">🎉 You're on fire! Keep it up!</p>}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Yoga Sessions', value: yogaSessions, sub: 'This week', icon: <FaDumbbell />, color: 'from-purple-500 to-pink-500' },
          { label: 'Meditation Time', value: `${meditationMins} min`, sub: 'This week', icon: <FaBrain />, color: 'from-blue-500 to-cyan-500' },
          { label: 'BMI Progress', value: lastBmi ? lastBmi.bmi?.toFixed(1) : '—', sub: lastBmi ? (bmiHistory.length >= 2 ? `${(lastBmi.bmi - bmiHistory[bmiHistory.length - 2].bmi).toFixed(1)} from last` : 'Latest') : 'No data', icon: lastBmi && bmiHistory.length >= 2 && lastBmi.bmi < bmiHistory[bmiHistory.length - 2].bmi ? <HiTrendingDown /> : <HiTrendingUp />, color: 'from-green-500 to-teal-500' },
          { label: 'Diet Adherence', value: dietAdherence || 0, sub: 'Logs this week', icon: <FaAppleAlt />, color: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-light rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-xs font-medium">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm`}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {/* BMI Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-light rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-1">BMI Trend Over Time</h3>
          <p className="text-gray-500 text-xs mb-5">Your BMI progress over the last 6 months</p>
          {bmiHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No BMI records yet. Calculate your BMI to start tracking!</div>
          ) : (
            <div className="overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              <div className="flex items-end gap-3 min-w-[320px] sm:min-w-0" style={{ height: '140px' }}>
                {bmiHistory.map((record, i) => {
                  const minBmi = Math.min(...bmiHistory.map(r => r.bmi)) - 2;
                  const maxBmi = Math.max(...bmiHistory.map(r => r.bmi)) + 2;
                  const pct = ((record.bmi - minBmi) / (maxBmi - minBmi));
                  const barH = Math.max(pct * 100, 12);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-xs text-gray-400 font-medium mb-1">{record.bmi?.toFixed(1)}</span>
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-teal-400 transition-all"
                        style={{ height: `${barH}px` }} />
                      <span className="text-[10px] text-gray-500 mt-2">{new Date(record.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Weekly Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-light rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-1">Weekly Yoga Activity</h3>
          <p className="text-gray-500 text-xs mb-5">Number of yoga sessions per day</p>
          <div className="overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            <div className="flex items-end gap-2 min-w-[320px] sm:min-w-0" style={{ height: '140px' }}>
              {(weeklyActivity || []).map((day, i) => {
                const hasActivity = day.yoga > 0;
                const barH = hasActivity ? Math.max((day.yoga / maxYoga) * 100, 20) : 20;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className={`text-xs font-medium mb-1 ${hasActivity ? 'text-purple-400' : 'text-gray-600'}`}>{day.yoga}</span>
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${barH}px`,
                        background: hasActivity ? 'linear-gradient(to top, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.08)'
                      }} />
                    <span className="text-[10px] text-gray-500 mt-2">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {weeklyActivity && weeklyActivity.every(d => d.yoga === 0) && (
            <p className="text-center text-gray-600 text-xs mt-4">No yoga sessions this week. Log an activity to start tracking! 🧘</p>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      {progress.recentLogs?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-light rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {progress.recentLogs.slice(0, 5).map((log, i) => (
              <div key={i} className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                    log.type === 'yoga' ? 'bg-purple-500/10 text-purple-400' :
                    log.type === 'meditation' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {log.type === 'yoga' ? '🧘' : log.type === 'meditation' ? '🧠' : '🍎'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium capitalize">{log.type} Session</p>
                    <p className="text-gray-500 text-xs">{log.notes || `${log.duration} minutes`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500 text-xs">
                  <div className="flex items-center gap-1.5">
                    <HiClock size={12} />
                    <span>{log.duration}m</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HiCalendar size={12} />
                    <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Log Activity Modal */}
      <AnimatePresence>
        {logModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setLogModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-900 rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-white">Log Activity</h3>
                <button onClick={() => setLogModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleLogActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Activity Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'yoga', label: '🧘 Yoga', color: 'purple' },
                      { value: 'meditation', label: '🧠 Meditation', color: 'blue' },
                      { value: 'diet', label: '🍎 Diet', color: 'amber' },
                    ].map(opt => (
                      <button key={opt.value} type="button" onClick={() => setLogType(opt.value)}
                        className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                          logType === opt.value
                            ? `bg-${opt.color}-500/20 text-${opt.color}-400 border border-${opt.color}-500/30`
                            : 'bg-dark-800/50 text-gray-400 border border-transparent hover:text-white'
                        }`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                  <input type="number" value={logDuration} onChange={e => setLogDuration(e.target.value)} min="1"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea value={logNotes} onChange={e => setLogNotes(e.target.value)} rows={2} placeholder="e.g. Morning sun salutation..."
                    className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl text-white font-semibold transition-all disabled:opacity-50">
                  {submitting ? 'Logging...' : 'Log Activity'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Progress;
