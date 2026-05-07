// ============================================
// SERVICE — tracker.js
// Stats BF6 via API officielle tracker.gg
// ============================================

const axios = require('axios');

const BASE_URL = 'https://public-api.tracker.gg/v2/bf6/standard/profile';

async function getPlayerStats(platform, identifier) {
  try {
    const response = await axios.get(
      `${BASE_URL}/${platform}/${identifier}`,
      {
        headers: {
          'TRN-Api-Key': process.env.TRACKER_API_KEY,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        },
        timeout: 10000
      }
    );

    const data = response.data?.data;
    if (!data) return null;

    const segments = data.segments;
    const overview = segments?.find(s => s.type === 'overview');

    if (!overview) return null;

    const stats = overview.stats;

    return {
      kills: stats?.kills?.value || 0,
      deaths: stats?.deaths?.value || 0,
      kd: stats?.kDRatio?.value || 0,
      wins: stats?.wins?.value || 0,
      games: stats?.matchesPlayed?.value || 0,
      playtime: stats?.timePlayed?.displayValue || '0h',
      level: data.platformInfo?.avatarUrl || null,
      pseudo: data.platformInfo?.platformUserHandle || identifier
    };

  } catch (error) {
    console.error('❌ Tracker API error:', error.response?.status, error.message);
    return null;
  }
}

module.exports = { getPlayerStats };