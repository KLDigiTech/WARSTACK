// ============================================
// JOB — leaderboard.js
// ============================================

const { EmbedBuilder } = require('discord.js');
const supabase = require('../services/supabase');

async function updateLeaderboard(client) {
  try {
    const channel = client.channels.cache.find(c => c.name === 'classement');
    if (!channel) return console.log('❌ Salon #classement introuvable');

    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .order('kd', { ascending: false })
      .limit(10);

    if (error || !players || players.length === 0) return;

    // Podium
    const podium = ['🥇', '🥈', '🥉'];
    const separator = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';

    // Rows du classement
    const rows = players.map((p, i) => {
      const rank = podium[i] || `\`#${i + 1}\``;
      const kd = (p.kd || 0).toFixed(2);
      const kills = (p.kills || 0).toString().padStart(4, ' ');
      const platform = p.platform?.toUpperCase() || '???';
      return `${rank} **${p.pseudo_bf6}** \`[${platform}]\`\n┗ ⚡ K/D: \`${kd}\` • 🎯 Kills: \`${kills}\` • 🏅 Wins: \`${p.wins || 0}\``;
    });

    // Stats globales
    const totalKills = players.reduce((s, p) => s + (p.kills || 0), 0);
    const bestKD = (players[0].kd || 0).toFixed(2);
    const mvp = players[0].pseudo_bf6;

    const embed = new EmbedBuilder()
      .setTitle('🏆  C L A S S E M E N T  —  P ö F  B F 6')
      .setColor(0x00ff41)
      .setDescription(
        `${separator}\n` +
        rows.join(`\n${separator}\n`) +
        `\n${separator}`
      )
      .addFields(
        {
          name: '📊 STATISTIQUES SAISON',
          value:
            `> 👥 **Joueurs inscrits** : \`${players.length}\`\n` +
            `> 🎯 **Kills totaux** : \`${totalKills.toLocaleString()}\`\n` +
            `> 📈 **Meilleur K/D** : \`${bestKD}\`\n` +
            `> ⭐ **MVP actuel** : **${mvp}**`,
        }
      )
      .setFooter({
        text: '⚔️ WARSTACK • PöF BF6 Tournament • Mis à jour toutes les heures'
      })
      .setTimestamp();

    // Supprime anciens messages bot
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(m => m.author.bot);
    await Promise.all(botMessages.map(m => m.delete()));

    await channel.send({ embeds: [embed] });
    console.log('✅ Leaderboard mis à jour dans #classement');

  } catch (error) {
    console.error('❌ Erreur leaderboard job:', error.message);
  }
}

module.exports = { updateLeaderboard };