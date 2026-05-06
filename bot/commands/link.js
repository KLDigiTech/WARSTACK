// ============================================
// COMMANDE — link.js
// Lie un compte BF6 à un utilisateur Discord
// ============================================

const { SlashCommandBuilder } = require('discord.js');
const supabase = require('../services/supabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('🔗 Lie ton compte Battlefield 6')
    .addStringOption(option =>
      option
        .setName('pseudo')
        .setDescription('Ton pseudo BF6 exact')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('platform')
        .setDescription('Ta plateforme')
        .setRequired(true)
        .addChoices(
          { name: '💻 PC', value: 'pc' },
          { name: '🎮 PlayStation', value: 'psn' },
          { name: '🎮 Xbox', value: 'xbox' },
        )
    ),

  async execute(interaction) {
    const pseudo = interaction.options.getString('pseudo');
    const platform = interaction.options.getString('platform');
    const discordId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    // Vérifie si le joueur existe déjà
    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (existing) {
      // Mise à jour
      await supabase
        .from('players')
        .update({ pseudo_bf6: pseudo, platform })
        .eq('discord_id', discordId);

      return interaction.editReply({
        content: `✅ Compte mis à jour → **${pseudo}** (${platform.toUpperCase()})`,
      });
    }

    // Nouveau joueur
    const { error } = await supabase
      .from('players')
      .insert({ discord_id: discordId, pseudo_bf6: pseudo, platform });

    if (error) {
      return interaction.editReply({
        content: '❌ Erreur lors de l\'enregistrement.',
      });
    }

    await interaction.editReply({
      content: `✅ Compte lié avec succès !\n🎮 Pseudo : **${pseudo}**\n📱 Plateforme : **${platform.toUpperCase()}**`,
    });
  }
};