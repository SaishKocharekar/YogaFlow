import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import MeditationBenefits from '../components/MeditationBenefits/MeditationBenefits';
import Features from '../components/Features/Features';
import ProductShowcase from '../components/ProductShowcase/ProductShowcase';
import Testimonials from '../components/Testimonials/Testimonials';
import Footer from '../components/Footer/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <Hero />
      <About />
      <MeditationBenefits />
      <Features />
      <ProductShowcase />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
