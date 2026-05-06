// ============================================
// SERVICE — gametools.js
// Récupère les stats BF6 via GameTools API
// ============================================

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.GAMETOOLS_BASE_URL;

/**
 * Récupère les stats d'un joueur BF6
 * @param {string} pseudo - Pseudo du joueur
 * @param {string} platform - pc / psn / xbox
 */
async function getPlayerStats(pseudo, platform) {
  try {
    const response = await axios.get(`${BASE_URL}/bf6/stats/`, {
      params: {
        name: pseudo,
        platform: platform,
        lang: 'fr-fr'
      },
      timeout: 10000
    });

    return response.data;

  } catch (error) {
    console.error('❌ GameTools API error:', error.message);
    return null;
  }
}

module.exports = { getPlayerStats };