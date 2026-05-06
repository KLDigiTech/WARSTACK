// ============================================
// API — api.js
// Endpoints HTTP pour contrôler le bot
// ============================================

const express = require('express');
const { updateLeaderboard } = require('./jobs/leaderboard');
const { postMVP } = require('./jobs/mvp');

const router = express.Router();

// Clé API secrète
const API_KEY = process.env.API_KEY || 'warstack-secret-2026';

// Middleware auth
function auth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

// ============================================
// ROUTES
// ============================================

// Status du bot
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    bot: global.botClient?.user?.tag || 'inconnu',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Forcer update leaderboard
router.post('/leaderboard', auth, async (req, res) => {
  try {
    await updateLeaderboard(global.botClient);
    res.json({ success: true, message: 'Leaderboard mis à jour !' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forcer post MVP
router.post('/mvp', auth, async (req, res) => {
  try {
    await postMVP(global.botClient);
    res.json({ success: true, message: 'MVP posté !' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;