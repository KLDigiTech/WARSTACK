// ============================================
// COMMANDE — stats.js
// Affiche les stats BF6 depuis les snapshots
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supabase = require('../services/supabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('📊 Affiche les stats BF6 d\'un joueur')
    .addUserOption(option =>
      option
        .setName('joueur')
        .setDescription('Le joueur à consulter (toi par défaut)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getUser('joueur') || interaction.user;
    const discordId = target.id;

    // Récupère le joueur
    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (!player || !player.tracker_id) {
      return interaction.editReply({
        content: `❌ **${target.username}** n'est pas inscrit.\nUtilise **/register** avec ton URL tracker.gg !`,
      });
    }

    // Récupère le dernier snapshot
    const { data: snapshot } = await supabase
      .from('player_snapshots')
      .select('*')
      .eq('tracker_id', player.tracker_id)
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single();

    if (!snapshot) {
      return interaction.editReply({
        content: `⏳ **${target.username}** est inscrit mais les stats ne sont pas encore disponibles.\nReviens dans quelques heures !`,
      });
    }

    // Calcul score WARSTACK
    const kd       = parseFloat(snapshot.kd)      || 0;
    const winrate  = parseFloat(snapshot.winrate?.replace('%','')) || 0;
    const kills    = parseInt(snapshot.kills)      || 0;
    const games    = parseInt(snapshot.games)      || 1;
    const kpm      = games > 0 ? (kills / games).toFixed(2) : 0;
    const score    = ((kd * 30) + (winrate * 35 / 100) + (parseFloat(kpm) * 25)).toFixed(2);

    // Division
    function getDivision(score) {
      const s = parseFloat(score);
      if (s >= 65) return { name: 'WARSTACK', emoji: '🔱' };
      if (s >= 55) return { name: 'Phantom', emoji: '👻' };
      if (s >= 45) return { name: 'Elite', emoji: '💎' };
      if (s >= 35) return { name: 'Veteran', emoji: '🎖️' };
      if (s >= 25) return { name: 'Grunt', emoji: '⚔️' };
      return { name: 'Recruit', emoji: '🪖' };
    }

    const division = getDivision(score);

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${player.username || target.username}`)
      .setColor(0xFF6600)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '🏅 Division', value: `${division.emoji} **${division.name}**`, inline: true },
        { name: '📊 Score WARSTACK', value: `\`${score}\``, inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: '🎯 Kills', value: `\`${snapshot.kills ?? '—'}\``, inline: true },
        { name: '💀 Deaths', value: `\`${snapshot.deaths ?? '—'}\``, inline: true },
        { name: '📈 K/D', value: `\`${snapshot.kd ?? '—'}\``, inline: true },
        { name: '🏆 Wins', value: `\`${snapshot.wins ?? '—'}\``, inline: true },
        { name: '🎮 Parties', value: `\`${snapshot.games ?? '—'}\``, inline: true },
        { name: '🏳️ Win Rate', value: `\`${snapshot.winrate ?? '—'}\``, inline: true },
        { name: '⏱️ Temps de jeu', value: `\`${snapshot.playtime ?? '—'}\``, inline: true },
        { name: '🔗 Tracker ID', value: `\`${player.tracker_id}\``, inline: true },
      )
      .setFooter({ text: `WARSTACK • Mis à jour : ${new Date(snapshot.snapshot_at).toLocaleDateString('fr-FR')}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};