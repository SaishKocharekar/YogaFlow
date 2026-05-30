import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { products } from '../../data/content';
import { FaStar } from 'react-icons/fa';

const ProductShowcase = () => {
  return (
    <section id="products" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">Shop</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-3 mb-6">
            <span className="text-white">Premium </span>
            <span className="gradient-text-reverse">Yoga Products</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Enhance your practice with carefully curated yoga and wellness accessories.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="glass-light rounded-2xl overflow-hidden border border-transparent hover:border-amber-500/20 transition-all duration-500">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full glass text-xs text-amber-400 font-medium">
                    {product.category}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, idx) => (
                      <FaStar
                        key={idx}
                        className={`text-xs ${idx < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-600'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold gradient-text-reverse">₹{product.price}</span>
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-500 hover:to-amber-400 transition-all duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
