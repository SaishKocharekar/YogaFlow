import { motion } from 'framer-motion';
import { GiMeditation, GiStrong, GiLotus, GiWindSlap } from 'react-icons/gi';

const About = () => {
  const benefits = [
    {
      icon: <GiStrong className="text-3xl" />,
      title: 'Physical Strength',
      description: 'Build lean muscle, improve endurance, and increase your overall physical capacity through targeted yoga practices.'
    },
    {
      icon: <GiLotus className="text-3xl" />,
      title: 'Flexibility',
      description: 'Unlock your body\'s full range of motion. Regular practice gently stretches muscles and improves joint mobility.'
    },
    {
      icon: <GiWindSlap className="text-3xl" />,
      title: 'Breathing Control',
      description: 'Master pranayama techniques to enhance lung capacity, improve oxygen flow, and regulate your nervous system.'
    },
    {
      icon: <GiMeditation className="text-3xl" />,
      title: 'Mental Focus',
      description: 'Develop laser-sharp concentration and mental clarity through mindful movement and meditation integration.'
    }
  ];

  return (
    <section id="about" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">About Yoga</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-3 mb-6">
              <span className="text-white">The Ancient Art of </span>
              <span className="gradient-text">Holistic Wellness</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Yoga is a centuries-old practice that unites body, mind, and spirit. Originating in ancient India, 
              it combines physical postures (asanas), breathing techniques (pranayama), and meditation to create 
              a comprehensive approach to health and well-being.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Whether you seek to build strength, increase flexibility, manage stress, or find inner peace, 
              yoga offers a path tailored to every individual. Our platform personalizes this journey based 
              on your unique body composition.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {['🧘‍♀️', '🧘‍♂️', '💪', '🙏'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-dark-800 border-2 border-dark-950 flex items-center justify-center text-lg">
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                <span className="text-white font-semibold">10,000+</span> practitioners trust YogaFlow
              </p>
            </div>
          </motion.div>

          {/* Right - benefit cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-light rounded-2xl p-6 hover:border-purple-500/30 border border-transparent transition-all duration-300 group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center text-purple-400 group-hover:text-amber-400 transition-colors mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
