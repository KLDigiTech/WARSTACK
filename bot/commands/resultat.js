// ============================================
// COMMANDE — resultat.js
// Saisie manuelle des stats + détection rank up
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supabase = require('../services/supabase');
const { calcScore, getDivision } = require('../jobs/leaderboard');
const { checkRankUp, notifyRankUp } = require('../services/rankup');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resultat')
    .setDescription('📊 Soumet tes stats après une partie')
    .addIntegerOption(o => o.setName('kills').setDescription('Nombre de kills').setRequired(true))
    .addIntegerOption(o => o.setName('deaths').setDescription('Nombre de deaths').setRequired(true))
    .addIntegerOption(o => o.setName('wins').setDescription('Victoire ? (1 = oui, 0 = non)').setRequired(true).addChoices(
      { name: 'Victoire', value: 1 },
      { name: 'Défaite', value: 0 }
    )),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const kills  = interaction.options.getInteger('kills');
    const deaths = interaction.options.getInteger('deaths');
    const win    = interaction.options.getInteger('wins');

    // Récupère le joueur
    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (!player) {
      return interaction.editReply({ content: '❌ Tu n\'es pas inscrit. Utilise **/register** d\'abord.' });
    }

    // Récupère l'ancien snapshot pour comparaison
    const { data: oldSnapshot } = await supabase
      .from('player_snapshots')
      .select('*')
      .eq('tracker_id', player.tracker_id)
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single();

    const oldScore = oldSnapshot ? calcScore(oldSnapshot) : 0;
    const oldDiv   = getDivision(oldScore);

    // Calcule les nouvelles stats cumulées
    const newKills  = (parseInt(oldSnapshot?.kills)  || 0) + kills;
    const newDeaths = (parseInt(oldSnapshot?.deaths) || 0) + deaths;
    const newWins   = (parseInt(oldSnapshot?.wins)   || 0) + win;
    const newGames  = (parseInt(oldSnapshot?.games)  || 0) + 1;
    const newKd     = newDeaths > 0 ? (newKills / newDeaths).toFixed(2) : newKills.toFixed(2);
    const newWinrate = ((newWins / newGames) * 100).toFixed(1);

    const newSnapshot = {
      kills   : newKills,
      deaths  : newDeaths,
      wins    : newWins,
      games   : newGames,
      kd      : parseFloat(newKd),
      winrate : parseFloat(newWinrate),
      playtime: oldSnapshot?.playtime || '0h',
    };

    // Sauvegarde en Supabase
    await supabase.from('player_snapshots').insert({
      tracker_id  : player.tracker_id,
      kills       : newSnapshot.kills,
      deaths      : newSnapshot.deaths,
      wins        : newSnapshot.wins,
      games       : newSnapshot.games,
      kd          : newSnapshot.kd,
      winrate     : newSnapshot.winrate,
      playtime    : newSnapshot.playtime,
      snapshot_at : new Date().toISOString(),
    });

    // Calcule le nouveau score et division
    const newScore = calcScore(newSnapshot);
    const newDiv   = getDivision(newScore);

    // Vérifie rank up
    const rankUpResult = checkRankUp(oldDiv, newDiv);
    if (rankUpResult.rankUp) {
      await notifyRankUp(interaction.client, discordId, rankUpResult.from, rankUpResult.to);
    }

    // Réponse au joueur
    const embed = new EmbedBuilder()
      .setTitle('✅ Résultat enregistré')
      .setColor(rankUpResult.rankUp ? 0xFF6600 : 0x2ECC71)
      .addFields(
        { name: '🎯 Kills',      value: `\`${kills}\``,                    inline: true },
        { name: '💀 Deaths',     value: `\`${deaths}\``,                   inline: true },
        { name: win ? '🏆 Victoire' : '🏳️ Défaite', value: win ? '`+1`' : '`—`', inline: true },
        { name: '📈 K/D global', value: `\`${newKd}\``,                    inline: true },
        { name: '🏳️ Win Rate',  value: `\`${newWinrate}%\``,              inline: true },
        { name: '⭐ Division',   value: `${newDiv.emoji} \`${newDiv.name}\``, inline: true },
      )
      .setFooter({ text: rankUpResult.rankUp ? `🔥 RANK UP : ${oldDiv.name} → ${newDiv.name} !` : 'WARSTACK • Battlefield 6' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};