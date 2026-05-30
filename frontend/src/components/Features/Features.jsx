import { motion } from 'framer-motion';
import { platformFeatures } from '../../data/content';

const Features = () => {
  const iconColors = [
    'from-blue-500/20 to-purple-500/20 text-blue-400',
    'from-purple-500/20 to-pink-500/20 text-purple-400',
    'from-amber-500/20 to-orange-500/20 text-amber-400',
    'from-green-500/20 to-teal-500/20 text-green-400',
  ];

  return (
    <section id="features" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/3 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">Platform Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-3 mb-6">
            <span className="text-white">Everything You Need for </span>
            <span className="gradient-text">Complete Wellness</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Our platform combines cutting-edge technology with ancient wisdom to deliver 
            a personalized wellness experience tailored to your body and goals.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformFeatures.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group cursor-default"
            >
              <div className="glass-light rounded-2xl p-8 h-full border border-transparent hover:border-purple-500/20 transition-all duration-500 text-center relative overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-amber-500/0 group-hover:from-purple-500/5 group-hover:to-amber-500/5 transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${iconColors[i]} flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
