import { Router } from 'express';
import { ref, get, update, remove } from 'firebase/database';
import { db } from '../config/firebase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'users/' + req.user.uid));
    if (!snapshot.exists()) return res.status(404).json({ error: 'User not found' });
    res.json({ id: req.user.uid, ...snapshot.val() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, age, gender, height, weight } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = Number(age);
    if (gender !== undefined) updateData.gender = gender;
    if (height !== undefined) updateData.height = Number(height);
    if (weight !== undefined) updateData.weight = Number(weight);

    await update(ref(db, 'users/' + req.user.uid), updateData);
    res.json({ message: 'Profile updated', ...updateData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin: Get all users
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'users'));
    if (!snapshot.exists()) return res.json([]);
    const data = snapshot.val();
    const users = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Delete user
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await remove(ref(db, 'users/' + req.params.id));
    const io = req.app.get('io');
    io.to('admin-room').emit('user-deleted', req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
