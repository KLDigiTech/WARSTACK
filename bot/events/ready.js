// ============================================
// EVENT — ready.js
// Se déclenche quand le bot est connecté
// ============================================

const cron = require('node-cron');
const { updateLeaderboard } = require('../jobs/leaderboard');
const { postMVP } = require('../jobs/mvp');

module.exports = {
  name: 'clientReady',
  once: true,

  execute(client) {
    console.log(`✅ WARSTACK connecté en tant que ${client.user.tag}`);

    // Statut affiché sous le nom du bot
    client.user.setActivity('⚔️ Battlefield 6 | /help', {
      type: 'WATCHING'
    });

    // ============================================
    // CRON JOBS
    // ============================================

    // Leaderboard toutes les heures
    cron.schedule('0 * * * *', () => {
      console.log('⏰ Update leaderboard...');
      updateLeaderboard(client);
    });

    // MVP chaque lundi à 10h00
    cron.schedule('0 10 * * 1', () => {
      console.log('⏰ Post MVP hebdomadaire...');
      postMVP(client);
    });

    // Update immédiat au démarrage
    updateLeaderboard(client);

    console.log('✅ Cron jobs démarrés');
  }
};