import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '../../data/content';
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa';

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-3 mb-6">
            <span className="text-white">What Our </span>
            <span className="gradient-text">Users Say</span>
          </h2>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="glass-light rounded-2xl p-6 h-full border border-transparent hover:border-purple-500/20 transition-all duration-300">
                <FaQuoteLeft className="text-purple-500/20 text-2xl mb-4" />
                <p className="text-gray-300 text-sm leading-relaxed mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <FaStar key={idx} className={`text-xs ${idx < testimonial.rating ? 'text-amber-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="glass-light rounded-2xl p-6 border border-purple-500/10"
            >
              <FaQuoteLeft className="text-purple-500/20 text-2xl mb-4" />
              <p className="text-gray-300 text-sm leading-relaxed mb-6">{testimonials[current].content}</p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <FaStar key={idx} className={`text-xs ${idx < testimonials[current].rating ? 'text-amber-400' : 'text-gray-600'}`} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center text-lg">
                  {testimonials[current].avatar}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{testimonials[current].name}</p>
                  <p className="text-gray-500 text-xs">{testimonials[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <FaChevronLeft />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-purple-500 w-6' : 'bg-gray-600'}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
