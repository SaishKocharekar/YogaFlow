import { Router } from 'express';
import { ref, get, set, push, update } from 'firebase/database';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Get user progress
router.get('/', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Helper: local date string (YYYY-MM-DD) to avoid UTC timezone mismatch
    const toLocalDate = (d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };

    // Get activity logs
    const logsSnap = await get(ref(db, `progress/${uid}/logs`));
    const logs = logsSnap.exists() ? logsSnap.val() : {};
    const logsList = Object.keys(logs).map(k => ({ id: k, ...logs[k] })).sort((a, b) => b.createdAt - a.createdAt);

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateStr = toLocalDate(checkDate);
      const hasLog = logsList.some(l => toLocalDate(l.createdAt) === dateStr);
      if (hasLog) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }

    // Weekly stats
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekLogs = logsList.filter(l => l.createdAt >= oneWeekAgo);
    const yogaSessions = weekLogs.filter(l => l.type === 'yoga').length;
    const meditationMins = weekLogs.filter(l => l.type === 'meditation').reduce((s, l) => s + (l.duration || 0), 0);
    const dietLogs = weekLogs.filter(l => l.type === 'diet').length;

    // BMI history
    const bmiSnap = await get(ref(db, 'bmiRecords'));
    let bmiHistory = [];
    if (bmiSnap.exists()) {
      const bmiData = bmiSnap.val();
      bmiHistory = Object.keys(bmiData)
        .map(k => ({ id: k, ...bmiData[k] }))
        .filter(r => r.userId === uid)
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-6);
    }

    // Weekly activity breakdown (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDate(d);
      const dayName = d.toLocaleDateString('en', { weekday: 'short' });
      const dayLogs = logsList.filter(l => toLocalDate(l.createdAt) === dateStr);
      weeklyActivity.push({
        day: dayName,
        date: dateStr,
        yoga: dayLogs.filter(l => l.type === 'yoga').length,
        meditation: dayLogs.filter(l => l.type === 'meditation').length,
        diet: dayLogs.filter(l => l.type === 'diet').length
      });
    }

    res.json({
      streak,
      yogaSessions,
      meditationMins,
      dietAdherence: dietLogs,
      bmiHistory,
      weeklyActivity,
      recentLogs: logsList.slice(0, 10),
      lastBmi: bmiHistory.length > 0 ? bmiHistory[bmiHistory.length - 1] : null
    });
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Log an activity
router.post('/log', verifyToken, async (req, res) => {
  try {
    const { type, duration, notes } = req.body;
    if (!['yoga', 'meditation', 'diet'].includes(type)) {
      return res.status(400).json({ error: 'Type must be yoga, meditation, or diet' });
    }

    const log = {
      type,
      duration: Number(duration) || 0,
      notes: notes || '',
      createdAt: Date.now()
    };

    const newRef = push(ref(db, `progress/${req.user.uid}/logs`));
    await set(newRef, log);

    res.status(201).json({ id: newRef.key, ...log });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

export default router;
