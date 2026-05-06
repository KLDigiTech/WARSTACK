// ============================================
// COMMANDE — dashboard.js
// Lien vers le dashboard admin — Admin only
// ============================================

const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const ADMIN_ROLE = 'Admin'; // Nom du rôle admin sur ton serveur

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('🖥️ Accès au dashboard WARSTACK'),

  async execute(interaction) {

    // Vérifie si l'utilisateur a le rôle Admin
    const isAdmin = interaction.member.roles.cache.some(
      r => r.name === ADMIN_ROLE
    );

    if (!isAdmin) {
      return interaction.reply({
        content: '❌ Accès refusé — Réservé aux admins.',
        ephemeral: true
      });
    }

    // Bouton cliquable vers le dashboard
    const button = new ButtonBuilder()
      .setLabel('🖥️ Ouvrir le Dashboard')
      .setURL('https://warstack.netlify.app')
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    const embed = new EmbedBuilder()
      .setTitle('🖥️ WARSTACK — Panel Admin')
      .setColor(0xFF6600)
      .setDescription('Accès au dashboard d\'administration WARSTACK.')
      .addFields(
        { name: '👥 Joueurs', value: 'Gérer les joueurs inscrits', inline: true },
        { name: '🏆 Tournoi', value: 'Reset / forcer update', inline: true },
        { name: '📊 Stats', value: 'Vue d\'ensemble live', inline: true },
      )
      .setFooter({ text: 'WARSTACK • Admin Only • Ne partage pas ce lien' })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true // Visible que par toi
    });
  }
};