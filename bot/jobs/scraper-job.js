// ============================================
// JOB — scraper-job.js
// Scrape tous les joueurs enregistrés
// Lancé automatiquement via GitHub Actions
// ============================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { scrapeTrackerGG } = require('../services/scraper');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runScraper() {
  console.log('🚀 Démarrage du scraper WARSTACK...');

  // Récupère tous les joueurs avec un tracker_id
  const { data: players, error } = await supabase
    .from('players')
    .select('discord_id, tracker_id, username')
    .not('tracker_id', 'is', null);

  if (error || !players?.length) {
    console.log('❌ Aucun joueur trouvé ou erreur:', error);
    return;
  }

  console.log(`👥 ${players.length} joueur(s) à scraper`);

  for (const player of players) {
    console.log(`\n🎮 Scraping ${player.username || player.discord_id} (${player.tracker_id})`);

    const stats = await scrapeTrackerGG('psn', player.tracker_id);

    if (!stats) {
      console.warn(`⚠️ Échec scraping pour ${player.tracker_id}`);
      await sleep(5000);
      continue;
    }

    // Sauvegarde le snapshot
    const { error: snapError } = await supabase
      .from('player_snapshots')
      .insert({
        tracker_id  : player.tracker_id,
        kills       : stats.kills,
        deaths      : stats.deaths,
        kd          : stats.kd,
        wins        : stats.wins,
        winrate     : stats.winrate,
        games       : stats.games,
        playtime    : stats.playtime,
        snapshot_at : new Date().toISOString(),
      });

    if (snapError) {
      console.error(`❌ Erreur snapshot pour ${player.tracker_id}:`, snapError);
    } else {
      console.log(`✅ Snapshot sauvegardé — K/D: ${stats.kd} | Kills: ${stats.kills}`);
    }

    // Rate limit — 10 secondes entre chaque joueur
    await sleep(10000);
  }

  console.log('\n✅ Scraper terminé !');
}

runScraper().catch(console.error);