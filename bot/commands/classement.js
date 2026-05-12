// ============================================
// COMMANDE — classement.js
// ============================================

const { SlashCommandBuilder } = require('discord.js');
const { updateLeaderboard } = require('../jobs/leaderboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classement')
    .setDescription('🏆 Affiche le classement WARSTACK'),

  async execute(interaction) {
    // Répond immédiatement pour éviter le timeout Discord
    await interaction.reply({ 
      content: '⏳ Mise à jour du classement en cours...', 
      ephemeral: true 
    });
    
    // Lance le leaderboard en arrière-plan
    updateLeaderboard(interaction.client).catch(console.error);
  }
};