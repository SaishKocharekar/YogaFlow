import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { yogaPoses, getBMICategory, calculateBMI } from '../data/content';
import { HiChevronDown, HiChevronUp, HiClock, HiLightningBolt } from 'react-icons/hi';

const YogaRecommendations = () => {
  const { userData } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedPose, setExpandedPose] = useState(null);

  useEffect(() => {
    // Priority 1: URL search param from BMI calculator
    const urlCategory = searchParams.get('category');
    if (urlCategory && yogaPoses[urlCategory]) {
      setSelectedCategory(urlCategory);
      return;
    }
    // Priority 2: Calculate from user profile data
    if (userData?.height && userData?.weight) {
      const bmi = calculateBMI(userData.weight, userData.height);
      const cat = getBMICategory(Number(bmi));
      setSelectedCategory(cat.key);
    }
  }, [userData, searchParams]);

  const categories = [
    { key: 'underweight', label: 'Underweight', color: 'blue', emoji: '🔵' },
    { key: 'normal', label: 'Normal', color: 'green', emoji: '🟢' },
    { key: 'overweight', label: 'Overweight', color: 'amber', emoji: '🟡' },
    { key: 'obese', label: 'Obese', color: 'red', emoji: '🔴' },
  ];

  const poses = selectedCategory ? yogaPoses[selectedCategory] : [];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-2">Yoga Recommendations</h1>
      <p className="text-gray-400 text-sm mb-8">
        {selectedCategory
          ? `Showing yoga poses for ${selectedCategory} BMI category`
          : 'Update your profile with height and weight for personalized recommendations'}
      </p>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === cat.key
                ? 'border'
                : 'bg-dark-800/50 text-gray-400 hover:text-white border border-transparent'
            }`}
            style={selectedCategory === cat.key ? {
              backgroundColor: cat.key === 'underweight' ? 'rgba(59,130,246,0.2)' : cat.key === 'normal' ? 'rgba(34,197,94,0.2)' : cat.key === 'overweight' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
              color: cat.key === 'underweight' ? '#60a5fa' : cat.key === 'normal' ? '#4ade80' : cat.key === 'overweight' ? '#fbbf24' : '#f87171',
              borderColor: cat.key === 'underweight' ? 'rgba(59,130,246,0.3)' : cat.key === 'normal' ? 'rgba(34,197,94,0.3)' : cat.key === 'overweight' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'
            } : {}}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Poses */}
      {selectedCategory && (
        <div className="space-y-4">
          {poses.map((pose, i) => (
            <motion.div
              key={pose.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-light rounded-2xl border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedPose(expandedPose === pose.id ? null : pose.id)}
                className="w-full p-6 text-left flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{pose.name}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                      pose.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {pose.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{pose.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <HiClock /> {pose.duration}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <HiLightningBolt /> {pose.benefits.length} benefits
                    </span>
                  </div>
                </div>
                <div className="text-gray-400 mt-1">
                  {expandedPose === pose.id ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </div>
              </button>

              <AnimatePresence>
                {expandedPose === pose.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-white/5 pt-4">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3">How to Perform</h4>
                          <ol className="space-y-2">
                            {pose.steps.map((step, idx) => (
                              <li key={idx} className="flex gap-3 text-sm text-gray-400">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                  {idx + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3">Benefits</h4>
                          <div className="flex flex-wrap gap-2">
                            {pose.benefits.map((benefit, idx) => (
                              <span key={idx} className="px-3 py-1.5 rounded-xl bg-dark-800/50 text-gray-300 text-xs border border-white/5">
                                ✓ {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {!selectedCategory && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🧘</div>
          <h3 className="text-lg font-semibold text-white mb-2">Select a BMI Category</h3>
          <p className="text-gray-400 text-sm">Choose a category above to see recommended yoga poses.</p>
        </div>
      )}
    </div>
  );
};

export default YogaRecommendations;
