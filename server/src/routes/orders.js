import { Router } from 'express';
import { ref, get, push, set, update } from 'firebase/database';
import { db } from '../config/firebase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Place order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, productName, quantity, price, total } = req.body;
    const order = {
      userId: req.user.uid,
      userName: req.user.email,
      productId, productName,
      quantity: Number(quantity),
      price: Number(price),
      total: Number(total),
      status: 'Pending',
      createdAt: Date.now()
    };
    const newRef = push(ref(db, 'orders'));
    await set(newRef, order);

    const io = req.app.get('io');
    io.to('admin-room').emit('new-order', { id: newRef.key, ...order });
    io.to(`user-${req.user.uid}`).emit('order-placed', { id: newRef.key, ...order });

    res.status(201).json({ id: newRef.key, ...order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get user's orders
router.get('/my', verifyToken, async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'orders'));
    if (!snapshot.exists()) return res.json([]);

    const data = snapshot.val();
    const orders = Object.keys(data)
      .map(key => ({ id: key, ...data[key] }))
      .filter(o => o.userId === req.user.uid)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Get all orders
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'orders'));
    if (!snapshot.exists()) return res.json([]);
    const data = snapshot.val();
    const orders = Object.keys(data)
      .map(key => ({ id: key, ...data[key] }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Update order status
router.put('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await update(ref(db, 'orders/' + req.params.id), { status });
    const io = req.app.get('io');
    io.emit('order-updated', { id: req.params.id, status });
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
