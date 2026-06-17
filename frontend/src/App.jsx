import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BMICalculator from './pages/BMICalculator';
import YogaRecommendations from './pages/YogaRecommendations';
import DietPlans from './pages/DietPlans';
import MeditationGuide from './pages/MeditationGuide';
import ProductStore from './pages/ProductStore';
import MyOrders from './pages/MyOrders';
import Progress from './pages/Progress';
import AIPlan from './pages/AIPlan';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminContent from './pages/AdminContent';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import Chatbot from './components/Chatbot/Chatbot';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

// Wrapper to conditionally show chatbot (hide on admin pages)
const ChatbotWrapper = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <Chatbot />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route path="profile" element={<Profile />} />
            <Route path="bmi" element={<BMICalculator />} />
            <Route path="yoga" element={<YogaRecommendations />} />
            <Route path="diet" element={<DietPlans />} />
            <Route path="meditation" element={<MeditationGuide />} />
            <Route path="products" element={<ProductStore />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="progress" element={<Progress />} />
            <Route path="ai-plan" element={<AIPlan />} />
          </Route>

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="content" element={<AdminContent />} />
          </Route>

          {/* Checkout & Success Flow */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        </Routes>

        {/* AI Chatbot — hidden on admin pages */}
        <ChatbotWrapper />
      </AuthProvider>
    </Router>
  );
}

export default App;
