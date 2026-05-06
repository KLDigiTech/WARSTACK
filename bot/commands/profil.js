// ============================================
// COMMANDE — profil.js
// Affiche la carte profil complète d'un joueur
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supabase = require('../services/supabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profil')
    .setDescription('🪪 Affiche le profil complet d\'un joueur')
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

    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (!player) {
      return interaction.editReply({
        content: `❌ **${target.username}** n'a pas lié son compte BF6.\nUtilise **/link** pour rejoindre !`,
      });
    }

    // Calcul du rang dans le classement
    const { data: allPlayers } = await supabase
      .from('players')
      .select('discord_id')
      .order('kd', { ascending: false });

    const rang = allPlayers
      ? allPlayers.findIndex(p => p.discord_id === discordId) + 1
      : '?';

    const kd = player.kd ? player.kd.toFixed(2) : '0.00';

    const embed = new EmbedBuilder()
      .setTitle(`🪪 ${player.pseudo_bf6}`)
      .setColor(0xFF6600)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '🏆 Rang', value: `\`#${rang}\``, inline: true },
        { name: '📱 Plateforme', value: `\`${player.platform?.toUpperCase()}\``, inline: true },
        { name: '📈 K/D', value: `\`${kd}\``, inline: true },
        { name: '🎯 Kills', value: `\`${player.kills || 0}\``, inline: true },
        { name: '💀 Deaths', value: `\`${player.deaths || 0}\``, inline: true },
        { name: '🏅 Wins', value: `\`${player.wins || 0}\``, inline: true },
      )
      .setFooter({ text: 'WARSTACK • PöF BF6 Tournament' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};