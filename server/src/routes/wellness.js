import { Router } from 'express';
import { ref, get, push, set, update, remove } from 'firebase/database';
import { db } from '../config/firebase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Get wellness content by type (yoga, meditation, diet)
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['yoga', 'meditation', 'diet'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Use: yoga, meditation, or diet' });
    }
    const snapshot = await get(ref(db, 'wellness_' + type));
    if (!snapshot.exists()) return res.json([]);
    const data = snapshot.val();
    res.json(Object.keys(data).map(key => ({ id: key, ...data[key] })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Admin: Add content
router.post('/:type', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { title, description, category } = req.body;
    const data = { title, description, category, createdAt: Date.now() };
    const newRef = push(ref(db, 'wellness_' + type));
    await set(newRef, data);
    res.status(201).json({ id: newRef.key, ...data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add content' });
  }
});

// Admin: Update content
router.put('/:type/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { title, description, category } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    await update(ref(db, `wellness_${type}/${id}`), updateData);
    res.json({ message: 'Content updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Admin: Delete content
router.delete('/:type/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await remove(ref(db, `wellness_${req.params.type}/${req.params.id}`));
    res.json({ message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

export default router;
