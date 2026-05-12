// ============================================
// COMMANDE — classement.js
// Affiche le classement WARSTACK
// ============================================

const { SlashCommandBuilder } = require('discord.js');
const { updateLeaderboard } = require('../jobs/leaderboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classement')
    .setDescription('🏆 Affiche le classement WARSTACK'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await updateLeaderboard(interaction.client);
    await interaction.editReply({ content: '✅ Classement mis à jour dans #classement !' });
  }
};