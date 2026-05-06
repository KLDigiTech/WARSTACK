// ============================================
// COMMANDE — stats.js
// Affiche les stats BF6 d'un joueur
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supabase = require('../services/supabase');
const { getPlayerStats } = require('../services/gametools');

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

    // Cible : joueur mentionné ou soi-même
    const target = interaction.options.getUser('joueur') || interaction.user;
    const discordId = target.id;

    // Récupère le joueur en DB
    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (!player) {
      return interaction.editReply({
        content: `❌ **${target.username}** n'a pas lié son compte BF6.\nUtilise **/link** pour commencer !`,
      });
    }

    // Récupère les stats depuis GameTools
    const stats = await getPlayerStats(player.pseudo_bf6, player.platform);

    if (!stats) {
      return interaction.editReply({
        content: `❌ Impossible de récupérer les stats de **${player.pseudo_bf6}**.\nVérifie le pseudo ou réessaie plus tard.`,
      });
    }

    // Construction de l'embed
    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${player.pseudo_bf6}`)
      .setColor(0xFF6600)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '🎯 Kills', value: `${stats.kills ?? '—'}`, inline: true },
        { name: '💀 Deaths', value: `${stats.deaths ?? '—'}`, inline: true },
        { name: '📈 K/D', value: `${stats.kd ?? '—'}`, inline: true },
        { name: '🏆 Wins', value: `${stats.wins ?? '—'}`, inline: true },
        { name: '🎮 Parties', value: `${stats.games ?? '—'}`, inline: true },
        { name: '📱 Plateforme', value: `${player.platform.toUpperCase()}`, inline: true },
      )
      .setFooter({ text: 'WARSTACK • Stats BF6' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};