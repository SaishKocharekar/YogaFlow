import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase.js';

const router = Router();

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are "YogaFlow AI", a friendly wellness assistant. You ONLY help with:
- Yoga poses, routines, and techniques
- Meditation and mindfulness practices
- Diet plans, nutrition advice, and healthy eating
- BMI guidance and wellness tips
- Breathing exercises and stress management

RULES:
1. If someone asks about ANYTHING outside yoga, diet, nutrition, meditation, or wellness — politely decline: "I can only help with yoga, diet, nutrition, and meditation topics. 🧘"
2. ALWAYS address the user by their name if available — make it feel personal
3. Keep responses concise but with good context — not too descriptive, not too short
4. Use a clean structured format — short paragraphs, clear sections. Use bullets only when listing items like meals or poses, not for everything
5. Do NOT repeat their profile stats back to them — silently use their data to personalize advice
6. Be direct — give actionable advice without lengthy intros
7. Use 1-2 emojis per response, not more
8. Personalize based on user's BMI, body type, and goals without explicitly stating the numbers`;

// Try to extract user from token (optional - chatbot works for non-logged-in users too)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) { /* ignore invalid token */ }
  }
  next();
};

// Chat endpoint
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'ENTER_YOUR_GROQ_API_KEY') {
      return res.json({
        reply: "I'm currently offline. The admin needs to configure the AI API key. Please try again later! 🧘"
      });
    }

    // Build personalized context if user is logged in
    let userContext = '';
    if (req.user && req.user.uid && req.user.uid !== 'admin') {
      try {
        const userSnap = await get(ref(db, `users/${req.user.uid}`));
        if (userSnap.exists()) {
          const profile = userSnap.val();
          const parts = [];
          if (profile.name) parts.push(`Name: ${profile.name}`);
          if (profile.age) parts.push(`Age: ${profile.age}`);
          if (profile.gender) parts.push(`Gender: ${profile.gender}`);
          if (profile.height) parts.push(`Height: ${profile.height} cm`);
          if (profile.weight) parts.push(`Weight: ${profile.weight} kg`);
          if (profile.height && profile.weight) {
            const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
            parts.push(`BMI: ${bmi}`);
            if (bmi < 18.5) parts.push(`BMI Category: Underweight`);
            else if (bmi < 25) parts.push(`BMI Category: Normal`);
            else if (bmi < 30) parts.push(`BMI Category: Overweight`);
            else parts.push(`BMI Category: Obese`);
          }
          if (profile.fitnessGoal) parts.push(`Fitness Goal: ${profile.fitnessGoal}`);
          if (profile.activityLevel) parts.push(`Activity Level: ${profile.activityLevel}`);

          if (parts.length > 0) {
            userContext = `\n\nUSER PROFILE (use this to personalize your advice):\n${parts.join('\n')}`;
          }
        }
      } catch (e) { /* ignore DB errors, continue without context */ }
    }

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + userContext },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.json({ reply: "Sorry, I'm having trouble thinking right now. Please try again! 🙏" });
    }

    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again!";

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.json({ reply: "Something went wrong. Please try again later! 🙏" });
  }
});

export default router;
