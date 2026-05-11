// ============================================
// COMMANDE — register.js
// Lie un profil tracker.gg à un compte Discord
// ============================================

const { SlashCommandBuilder } = require('discord.js');
const supabase = require('../services/supabase');
const { scrapeTrackerGG } = require('../services/scraper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('🎮 Lie ton profil tracker.gg à WARSTACK')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('Ton URL tracker.gg ex: https://tracker.gg/bf6/profile/1023163556057/overview')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const url = interaction.options.getString('url');
    const discordId = interaction.user.id;
    const username = interaction.user.username;

    const match = url.match(/tracker\.gg\/bf6\/profile\/(\d+)/);
    if (!match) {
      return interaction.editReply({
        content: '❌ URL invalide.\nExemple : `https://tracker.gg/bf6/profile/1023163556057/overview`',
      });
    }

    const trackerId = match[1];

    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (existing) {
      await supabase
        .from('players')
        .update({ tracker_id: trackerId, tracker_url: url })
        .eq('discord_id', discordId);

      return interaction.editReply({
        content: `✅ Profil mis à jour !\n🔗 Tracker ID : \`${trackerId}\`\n📊 Les stats seront mises à jour prochainement.`,
      });
    }

    const { error } = await supabase
      .from('players')
      .insert({
        discord_id: discordId,
        username: username,
        tracker_id: trackerId,
        tracker_url: url,
      });

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return interaction.editReply({
        content: '❌ Erreur lors de l\'enregistrement. Réessaie plus tard.',
      });
    }

    await interaction.editReply({
      content: `✅ Inscription enregistrée, **${username}** !\n\n🔗 Profil lié :\n${url}\n\n📋 Les stats seront disponibles dans les prochaines heures.`,
    });

    scrapeTrackerGG('psn', trackerId).then(async (stats) => {
      if (!stats) return;
      await supabase.from('player_snapshots').insert({
        tracker_id  : trackerId,
        kills       : stats.kills,
        deaths      : stats.deaths,
        kd          : stats.kd,
        wins        : stats.wins,
        winrate     : stats.winrate,
        games       : stats.games,
        playtime    : stats.playtime,
        snapshot_at : new Date().toISOString(),
      });
      console.log(`✅ Snapshot initial sauvegardé pour ${trackerId}`);
    });
  }
};