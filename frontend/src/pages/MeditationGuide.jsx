import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { meditationContent } from '../data/content';
import { HiClock, HiChevronDown, HiChevronUp } from 'react-icons/hi';

const MeditationGuide = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const categories = ['All', 'Breathing', 'Relaxation', 'Emotional', 'Focus'];

  const filtered = selectedCategory === 'All'
    ? meditationContent
    : meditationContent.filter(m => m.category === selectedCategory);

  const categoryColors = {
    Breathing: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    Relaxation: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    Emotional: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
    Focus: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-2">Meditation Guidance</h1>
      <p className="text-gray-400 text-sm mb-8">Explore techniques for mental wellness, stress relief, and inner peace</p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-dark-800/50 text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meditation Cards */}
      <div className="space-y-4">
        {filtered.map((item, i) => {
          const colors = categoryColors[item.category] || { bg: 'bg-purple-500/10', text: 'text-purple-400' };
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-light rounded-2xl border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full p-6 text-left flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                    <HiClock /> {item.duration}
                  </div>
                </div>
                <div className="text-gray-400 mt-1">
                  {expandedId === item.id ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </div>
              </button>

              <AnimatePresence>
                {expandedId === item.id && (
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
                          <h4 className="text-sm font-semibold text-white mb-3">Step-by-Step Guide</h4>
                          <ol className="space-y-2">
                            {item.steps.map((step, idx) => (
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
                            {item.benefits.map((benefit, idx) => (
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
          );
        })}
      </div>
    </div>
  );
};

export default MeditationGuide;
