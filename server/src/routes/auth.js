import { Router } from 'express';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import jwt from 'jsonwebtoken';
import { auth, db } from '../config/firebase.js';

const router = Router();

// Register
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, age, gender, height, weight } = req.body;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user profile in Realtime Database
    await set(ref(db, 'users/' + user.uid), {
      name,
      email,
      age: Number(age) || 0,
      gender: gender || '',
      height: Number(height) || 0,
      weight: Number(weight) || 0,
      role: 'user',
      createdAt: Date.now()
    });

    const token = jwt.sign(
      { uid: user.uid, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { uid: user.uid, email, name, role: 'user' }
    });
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (err.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const snapshot = await get(ref(db, 'users/' + user.uid));
    const userData = snapshot.exists() ? snapshot.val() : {};

    const token = jwt.sign(
      { uid: user.uid, email, role: userData.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { uid: user.uid, email, name: userData.name, role: userData.role || 'user' }
    });
  } catch (err) {
    if (err.code === 'auth/invalid-credential') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;

    const snapshot = await get(ref(db, 'users/' + uid));

    if (!snapshot.exists()) {
      await set(ref(db, 'users/' + uid), {
        name: displayName || '',
        email,
        age: 0,
        gender: '',
        height: 0,
        weight: 0,
        role: 'user',
        createdAt: Date.now()
      });
    }

    const userData = snapshot.exists() ? snapshot.val() : { role: 'user', name: displayName };

    const token = jwt.sign(
      { uid, email, role: userData.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google sign-in successful',
      token,
      user: { uid, email, name: userData.name || displayName, role: userData.role || 'user' }
    });
  } catch (err) {
    res.status(500).json({ error: 'Google sign-in failed', details: err.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    await signOut(auth);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Admin Login
router.post('/admin-login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { uid: 'admin', email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: { uid: 'admin', email, name: 'Admin', role: 'admin' }
    });
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed' });
  }
});

export default router;
