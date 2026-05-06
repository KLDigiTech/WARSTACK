// ============================================
// COMMANDE — comparer.js
// Compare les stats de deux joueurs
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supabase = require('../services/supabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('comparer')
    .setDescription('⚔️ Compare les stats de deux joueurs')
    .addUserOption(option =>
      option
        .setName('joueur1')
        .setDescription('Premier joueur')
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName('joueur2')
        .setDescription('Deuxième joueur')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const user1 = interaction.options.getUser('joueur1');
    const user2 = interaction.options.getUser('joueur2');

    // Récupère les deux joueurs
    const { data: p1 } = await supabase
      .from('players')
      .select('*')
      .eq('discord_id', user1.id)
      .single();

    const { data: p2 } = await supabase
      .from('players')
      .select('*')
      .eq('discord_id', user2.id)
      .single();

    if (!p1) {
      return interaction.editReply({
        content: `❌ **${user1.username}** n'a pas lié son compte BF6.`,
      });
    }

    if (!p2) {
      return interaction.editReply({
        content: `❌ **${user2.username}** n'a pas lié son compte BF6.`,
      });
    }

    // Détermine le gagnant sur chaque stat
    const kdWinner = (p1.kd || 0) >= (p2.kd || 0) ? '⬅️' : '➡️';
    const killsWinner = (p1.kills || 0) >= (p2.kills || 0) ? '⬅️' : '➡️';
    const winsWinner = (p1.wins || 0) >= (p2.wins || 0) ? '⬅️' : '➡️';

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${p1.pseudo_bf6} VS ${p2.pseudo_bf6}`)
      .setColor(0xFF6600)
      .addFields(
        {
          name: '📈 K/D',
          value: `\`${(p1.kd || 0).toFixed(2)}\` ${kdWinner} \`${(p2.kd || 0).toFixed(2)}\``,
        },
        {
          name: '🎯 Kills',
          value: `\`${p1.kills || 0}\` ${killsWinner} \`${p2.kills || 0}\``,
        },
        {
          name: '🏅 Wins',
          value: `\`${p1.wins || 0}\` ${winsWinner} \`${p2.wins || 0}\``,
        },
      )
      .setFooter({ text: 'WARSTACK • PöF BF6 Tournament' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
