// ============================================
// COMMANDE — ping.js
// Test de connexion du bot
// ============================================

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // Définition de la commande slash
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Vérifie si WARSTACK est en ligne'),

  async execute(interaction) {
    // Calcul de la latence
    const latence = Date.now() - interaction.createdTimestamp;

    await interaction.reply({
      content: `🟢 **WARSTACK opérationnel**\n⚡ Latence : **${latence}ms**`,
      ephemeral: true  // Visible que par toi
    });
  }
};