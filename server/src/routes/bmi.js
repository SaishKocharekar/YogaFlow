import { Router } from 'express';
import { ref, get, push, set, update } from 'firebase/database';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ─── Helper Functions ───

function calculate_bmi(weight, heightCm) {
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(2));
}

function classify_bmi(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function analyze_progress(currentBmi, previousBmi) {
  if (!previousBmi) return { status: 'First Record', direction: 'none' };
  const diff = Number((currentBmi - previousBmi).toFixed(2));
  if (diff < -0.3) return { status: 'Improved (Weight Loss)', direction: 'improving', diff };
  if (diff > 0.3) return { status: 'Increased (Weight Gain)', direction: 'worsening', diff };
  return { status: 'No Change', direction: 'stable', diff };
}

// ─── AI Recommendation Generator ───

async function generate_recommendation(userProfile, currentBmi, category, progress, bmiHistory) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const historyText = bmiHistory.slice(0, 5).map(r =>
    `BMI: ${r.bmi} (${r.category}) on ${new Date(r.createdAt).toLocaleDateString()}`
  ).join('\n  ');

  const prompt = `You are an intelligent fitness and diet recommendation system with progress tracking.

Analyze the user's BMI and progress, then generate a personalized plan.

INPUT:
- Name: ${userProfile.name || 'User'}
- Age: ${userProfile.age || 'Unknown'}
- Gender: ${userProfile.gender || 'Unknown'}
- Height: ${userProfile.height} cm
- Current Weight: ${userProfile.weight} kg
- Current BMI: ${currentBmi}
- BMI Category: ${category}
- Previous BMI: ${bmiHistory.length > 0 ? bmiHistory[0].bmi : 'None'}
- Progress: ${progress.status}
- Recent BMI History:
  ${historyText || 'No previous records'}

OUTPUT (STRICT JSON ONLY — no markdown, no explanation, just raw JSON):

{
  "current_bmi": ${currentBmi},
  "category": "${category}",
  "progress_status": "${progress.status}",
  "health_feedback": "short 1-2 sentence explanation of their progress",
  "recommendation_update": ${bmiHistory.length > 0 && (bmiHistory[0]?.category !== category)},
  "updated_diet_plan": {
    "goal": "weight loss / gain / maintenance based on category",
    "meals": {
      "breakfast": "specific meal suggestion",
      "mid_morning": "specific snack",
      "lunch": "specific meal suggestion",
      "evening_snack": "specific snack",
      "dinner": "specific meal suggestion"
    },
    "recommended_foods": ["5-6 specific foods"],
    "foods_to_avoid": ["4-5 specific foods"],
    "plan_note": "how this plan is adjusted based on their progress"
  },
  "yoga_plan": {
    "focus": "what the yoga routine focuses on",
    "poses": [
      {"name": "Pose Name", "duration": "duration", "benefit": "short benefit"},
      {"name": "Pose Name", "duration": "duration", "benefit": "short benefit"},
      {"name": "Pose Name", "duration": "duration", "benefit": "short benefit"},
      {"name": "Pose Name", "duration": "duration", "benefit": "short benefit"},
      {"name": "Pose Name", "duration": "duration", "benefit": "short benefit"}
    ],
    "frequency": "how often per week"
  },
  "meditation_plan": {
    "type": "meditation type",
    "duration": "daily duration",
    "technique": "brief technique description",
    "best_time": "when to practice"
  },
  "next_step_advice": [
    "tip 1",
    "tip 2",
    "tip 3"
  ]
}

RULES:
- Round BMI to 2 decimal places
- Adjust plan based on progress: if improving → continue + slight upgrade; if no change → modify stricter; if worsening → correct diet and suggest discipline
- Keep suggestions practical and specific to Indian diet if possible
- Do not include medical advice
- Output ONLY valid JSON, nothing else`;

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a health and fitness AI. You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1200
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Groq AI error:', data);
      return null;
    }

    let content = data.choices?.[0]?.message?.content || '';
    // Clean any markdown formatting
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(content);
  } catch (err) {
    console.error('AI recommendation error:', err);
    return null;
  }
}

// ─── Routes ───

// Calculate BMI + Generate AI Recommendation
router.post('/', verifyToken, async (req, res) => {
  try {
    const { weight, height } = req.body;
    const bmi = calculate_bmi(Number(weight), Number(height));
    const category = classify_bmi(bmi);

    // Fetch user profile
    let userProfile = { weight: Number(weight), height: Number(height) };
    try {
      const userSnap = await get(ref(db, `users/${req.user.uid}`));
      if (userSnap.exists()) userProfile = { ...userSnap.val(), weight: Number(weight), height: Number(height) };
    } catch (e) {}

    // Fetch BMI history for progress detection
    const historySnap = await get(ref(db, 'bmiRecords'));
    let bmiHistory = [];
    if (historySnap.exists()) {
      const histData = historySnap.val();
      bmiHistory = Object.keys(histData)
        .map(k => ({ id: k, ...histData[k] }))
        .filter(r => r.userId === req.user.uid)
        .sort((a, b) => b.createdAt - a.createdAt);
    }

    // Analyze progress
    const previousBmi = bmiHistory.length > 0 ? bmiHistory[0].bmi : null;
    const progress = analyze_progress(bmi, previousBmi);

    // Check if category changed
    const previousCategory = bmiHistory.length > 0 ? bmiHistory[0].category : null;
    const categoryChanged = previousCategory && previousCategory !== category;

    // Save BMI record
    const record = {
      userId: req.user.uid,
      bmi,
      category,
      weight: Number(weight),
      height: Number(height),
      previousBmi,
      progressStatus: progress.status,
      categoryChanged: categoryChanged || false,
      createdAt: Date.now()
    };

    const newRef = push(ref(db, 'bmiRecords'));
    await set(newRef, record);

    // Generate AI recommendation
    const recommendation = await generate_recommendation(userProfile, bmi, category, progress, bmiHistory);

    // Save recommendation linked to BMI record
    if (recommendation) {
      await set(ref(db, `bmiRecommendations/${newRef.key}`), {
        ...recommendation,
        userId: req.user.uid,
        bmiRecordId: newRef.key,
        createdAt: Date.now()
      });
    }

    // Emit socket events
    const io = req.app.get('io');
    io.to(`user-${req.user.uid}`).emit('bmi-calculated', { id: newRef.key, ...record });
    io.to('admin-room').emit('bmi-recorded', { userId: req.user.uid });

    if (categoryChanged) {
      io.to(`user-${req.user.uid}`).emit('plan-updated', {
        message: `Your BMI category changed from ${previousCategory} to ${category}. Your plan has been updated!`,
        oldCategory: previousCategory,
        newCategory: category
      });
    }

    res.status(201).json({
      id: newRef.key,
      ...record,
      progress,
      recommendation
    });
  } catch (err) {
    console.error('BMI calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate BMI' });
  }
});

// Get saved recommendation for a BMI record
router.get('/recommendation/:recordId', verifyToken, async (req, res) => {
  try {
    const snap = await get(ref(db, `bmiRecommendations/${req.params.recordId}`));
    if (!snap.exists()) return res.status(404).json({ error: 'Recommendation not found' });

    const data = snap.val();
    if (data.userId !== req.user.uid) return res.status(403).json({ error: 'Access denied' });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
});

// Get user's BMI history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'bmiRecords'));
    if (!snapshot.exists()) return res.json([]);

    const data = snapshot.val();
    const records = Object.keys(data)
      .map(key => ({ id: key, ...data[key] }))
      .filter(r => r.userId === req.user.uid)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch BMI history' });
  }
});

export default router;
