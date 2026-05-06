// ============================================
// EVENT — ready.js
// Se déclenche quand le bot est connecté
// ============================================

module.exports = {
  name: 'clientReady',      // Nom de l'event Discord
  once: true,         // Se déclenche UNE seule fois au démarrage

  execute(client) {
    console.log(`✅ WARSTACK connecté en tant que ${client.user.tag}`);
    
    // Statut affiché sous le nom du bot dans Discord
    client.user.setActivity('⚔️ Battlefield 6 | /help', { 
      type: 'WATCHING' 
    });
  }
};