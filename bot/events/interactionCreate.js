// ============================================
// EVENT — interactionCreate.js
// Se déclenche à chaque commande slash tapée
// ============================================

module.exports = {
  name: 'interactionCreate',  // Event Discord natif
  once: false,                // Se déclenche à chaque fois

  async execute(interaction, client) {

    // On ignore si c'est pas une commande slash
    if (!interaction.isChatInputCommand()) return;

    // On cherche la commande dans la collection
    const command = client.commands.get(interaction.commandName);

    // Commande inconnue
    if (!command) {
      return interaction.reply({ 
        content: '❌ Commande inconnue.', 
        ephemeral: true  // Visible que par l'utilisateur
      });
    }

    // On exécute la commande
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Erreur commande /${interaction.commandName}:`, error);
      interaction.reply({ 
        content: '❌ Une erreur est survenue.', 
        ephemeral: true 
      });
    }
  }
};