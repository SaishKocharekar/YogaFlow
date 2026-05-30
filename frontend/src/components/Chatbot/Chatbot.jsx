import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiChat } from '../../services/api';
import { HiX } from 'react-icons/hi';
import { FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm YogaFlow AI 🧘 Ask me about yoga, diet, nutrition, or meditation!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await apiChat(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't respond. Please try again! 🙏" }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button + Tooltip — BOTTOM RIGHT */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Tooltip text */}
        <AnimatePresence>
          {showTooltip && !open && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-dark-800/90 backdrop-blur-md border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl rounded-br-md shadow-lg whitespace-nowrap"
            >
              Hey, I'll help you! 👋
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => { setOpen(!open); setShowTooltip(false); }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 text-white shadow-2xl shadow-purple-500/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {open ? <HiX size={22} /> : '🧘'}
        </motion.button>
      </div>

      {/* Chat Panel — BOTTOM RIGHT */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden shadow-2xl shadow-black/40"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-amber-500 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🧘</div>
                <div>
                  <h3 className="text-white font-bold text-sm">YogaFlow AI</h3>
                  <p className="text-white/70 text-xs">Yoga • Diet • Nutrition</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>

            {/* Messages */}
            <div className="bg-dark-950 h-[340px] overflow-y-auto p-4 space-y-3" id="chatbot-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-md'
                      : 'bg-dark-800/80 text-gray-200 border border-white/5 rounded-bl-md'
                  }`} style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-dark-800/80 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="bg-dark-900 border-t border-white/5 p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about yoga, diet..."
                className="flex-1 px-4 py-2.5 bg-dark-800/50 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 text-white flex items-center justify-center hover:from-purple-500 hover:to-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaPaperPlane size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
