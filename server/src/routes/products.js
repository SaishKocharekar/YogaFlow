import { Router } from 'express';
import { ref, get, push, set, update, remove } from 'firebase/database';
import { db } from '../config/firebase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'products'));
    if (!snapshot.exists()) return res.json([]);
    const data = snapshot.val();
    const products = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'products/' + req.params.id));
    if (!snapshot.exists()) return res.status(404).json({ error: 'Product not found' });
    res.json({ id: req.params.id, ...snapshot.val() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin: Add product
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;
    const product = {
      name, price: Number(price), description, image,
      category, stock: Number(stock), rating: 4.5,
      createdAt: Date.now()
    };
    const newRef = push(ref(db, 'products'));
    await set(newRef, product);

    const io = req.app.get('io');
    io.to('admin-room').emit('product-added', { id: newRef.key, ...product });

    res.status(201).json({ id: newRef.key, ...product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Admin: Update product
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = Number(stock);

    await update(ref(db, 'products/' + req.params.id), updateData);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: Delete product
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await remove(ref(db, 'products/' + req.params.id));
    const io = req.app.get('io');
    io.to('admin-room').emit('product-deleted', req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
