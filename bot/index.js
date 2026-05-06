// ============================================
// WARSTACK BOT — index.js
// Point d'entrée principal
// ============================================

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { updateLeaderboard } = require('./jobs/leaderboard');
const { postMVP } = require('./jobs/mvp');
const express = require('express');
const apiRouter = require('./api');

// Serveur Express
const app = express();
app.use(express.json());

// CORS pour le dashboard
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// Routes API
app.use('/api', apiRouter);

// Démarrage serveur
app.listen(process.env.PORT || 3000, () => {
  console.log('✅ API WARSTACK démarrée');
});

// --- Client Discord ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// --- Collection des commandes ---
client.commands = new Collection();

// --- Chargement des commandes ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Commande chargée : /${command.data.name}`);
  }
}

// --- Chargement des events ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// --- Connexion ---
client.login(process.env.DISCORD_TOKEN);