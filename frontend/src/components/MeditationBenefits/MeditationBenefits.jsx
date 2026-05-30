import { motion } from 'framer-motion';
import { BiBrain, BiHeart } from 'react-icons/bi';
import { FaRegSmile, FaMoon } from 'react-icons/fa';

const MeditationBenefits = () => {
  const benefits = [
    {
      icon: <BiBrain className="text-3xl" />,
      title: 'Stress Reduction',
      description: 'Meditation activates the parasympathetic nervous system, lowering cortisol levels and reducing the physiological effects of chronic stress.',
      stat: '68%',
      statLabel: 'stress reduction reported'
    },
    {
      icon: <FaRegSmile className="text-3xl" />,
      title: 'Improved Concentration',
      description: 'Regular meditation practice strengthens attention span and cognitive function, boosting productivity and mental performance.',
      stat: '14%',
      statLabel: 'attention improvement'
    },
    {
      icon: <BiHeart className="text-3xl" />,
      title: 'Emotional Balance',
      description: 'Develop greater emotional awareness and regulation. Meditation helps process emotions healthily and cultivate inner peace.',
      stat: '50%',
      statLabel: 'emotional stability gain'
    },
    {
      icon: <FaMoon className="text-3xl" />,
      title: 'Better Sleep',
      description: 'Evening meditation routines calm the mind and prepare the body for restorative sleep, reducing insomnia and improving sleep quality.',
      stat: '72%',
      statLabel: 'sleep quality improvement'
    }
  ];

  return (
    <section id="meditation" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">Meditation</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-3 mb-6">
            <span className="text-white">Unlock the Power of </span>
            <span className="gradient-text-reverse">Mindfulness</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Scientific research confirms what ancient practitioners have known for millennia — 
            meditation transforms the brain, body, and spirit in profound ways.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <div className="glass-light rounded-2xl p-6 h-full border border-transparent hover:border-amber-500/20 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{benefit.description}</p>
                <div className="pt-4 border-t border-white/5">
                  <span className="text-2xl font-bold gradient-text-reverse">{benefit.stat}</span>
                  <p className="text-xs text-gray-500 mt-1">{benefit.statLabel}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeditationBenefits;
