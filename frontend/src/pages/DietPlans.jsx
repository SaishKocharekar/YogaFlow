import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dietPlans, getBMICategory, calculateBMI } from '../data/content';

const DietPlans = () => {
  const { userData } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    // Priority 1: URL search param from BMI calculator
    const urlCategory = searchParams.get('category');
    if (urlCategory && dietPlans[urlCategory]) {
      setSelectedPlan(urlCategory);
      return;
    }
    // Priority 2: Calculate from user profile
    if (userData?.height && userData?.weight) {
      const bmi = calculateBMI(userData.weight, userData.height);
      const cat = getBMICategory(Number(bmi));
      setSelectedPlan(cat.key);
    }
  }, [userData, searchParams]);

  const plans = [
    { key: 'underweight', label: 'Weight Gain', emoji: '🔵', color: '#3b82f6' },
    { key: 'normal', label: 'Balanced', emoji: '🟢', color: '#22c55e' },
    { key: 'overweight', label: 'Weight Loss', emoji: '🟡', color: '#f59e0b' },
    { key: 'obese', label: 'Medical Plan', emoji: '🔴', color: '#ef4444' },
  ];

  const currentPlan = selectedPlan ? dietPlans[selectedPlan] : null;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-2">Diet Plans</h1>
      <p className="text-gray-400 text-sm mb-8">Nutritional recommendations tailored to your BMI category</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {plans.map((plan) => (
          <button key={plan.key} onClick={() => setSelectedPlan(plan.key)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
            style={{
              backgroundColor: selectedPlan === plan.key ? `${plan.color}20` : 'rgba(30,41,59,0.5)',
              color: selectedPlan === plan.key ? plan.color : '#94a3b8',
              borderColor: selectedPlan === plan.key ? `${plan.color}30` : 'transparent'
            }}>
            {plan.emoji} {plan.label}
          </button>
        ))}
      </div>

      {currentPlan && (
        <motion.div key={selectedPlan} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-light rounded-2xl p-6 sm:p-8 border border-white/5 mb-6">
            <h2 className="text-xl font-display font-bold text-white mb-2">{currentPlan.title}</h2>
            <p className="text-gray-400 text-sm mb-4">{currentPlan.goal}</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/50 border border-white/5">
              <span className="text-amber-400 font-semibold">{currentPlan.dailyCalories}</span>
              <span className="text-gray-400 text-sm">daily target</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {currentPlan.meals.map((meal, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-light rounded-2xl p-5 sm:p-6 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{meal.name}</h3>
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg font-medium">{meal.calories}</span>
                </div>
                <ul className="space-y-2">
                  {meal.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="glass-light rounded-2xl p-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4">💡 Tips for Success</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {currentPlan.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-purple-400 mt-0.5">✓</span>{tip}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!selectedPlan && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🥗</div>
          <h3 className="text-lg font-semibold text-white mb-2">Select a Diet Plan</h3>
          <p className="text-gray-400 text-sm">Choose a plan above to see detailed meal recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default DietPlans;
