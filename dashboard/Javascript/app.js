// ============================================
// WARSTACK DASHBOARD — app.js
// Panneau d'administration complet
// ============================================

const SUPABASE_URL = 'https://eaiuibqpouwwkqdcwthl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaXVpYnFwb3V3d2txZGN3dGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODkyNzMsImV4cCI6MjA5MzY2NTI3M30.QHjd47M2ODKkYLvkCed5Ay4a5bPxxoBsk2aXeWlNk6M';
const BOT_URL = 'https://warstack-bot.onrender.com';
const API_KEY = 'warstack-secret-2026';
const GUILD_ID = '1501685144501620798';

// ============================================
// SUPABASE HELPERS
// ============================================

async function fetchSupabase(endpoint) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  return res.json();
}

async function updateSupabase(endpoint, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function deleteSupabase(endpoint) {
  await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
}

// Sauvegarde une config en DB (upsert)
async function saveConfig(key, value) {
  await fetch(`${SUPABASE_URL}/rest/v1/config`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ guild_id: GUILD_ID, key, value })
  });
}

// Récupère toutes les configs du serveur
async function loadConfigs() {
  return await fetchSupabase(`config?guild_id=eq.${GUILD_ID}`);
}

// Récupère une config spécifique
function getConfig(configs, key) {
  return configs?.find(c => c.key === key)?.value;
}

// ============================================
// BOT API HELPERS
// ============================================

async function callBotAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${BOT_URL}/api/${endpoint}`, options);
    return res.json();
  } catch (error) {
    console.error('❌ Bot API error:', error);
    return null;
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function toast(message, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = `toast show ${type}`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ============================================
// HORLOGE
// ============================================

function updateClock() {
  const now = new Date();
  document.getElementById('current-time').textContent =
    now.toLocaleTimeString('fr-FR') + ' — ' + now.toLocaleDateString('fr-FR');
}
setInterval(updateClock, 1000);
updateClock();

// ============================================
// BOT STATUS
// ============================================

async function checkBotStatus() {
  const data = await callBotAPI('status');
  const dot = document.getElementById('status-dot');
  const label = document.getElementById('status-label');
  if (data?.status === 'online') {
    dot.classList.add('online');
    label.textContent = 'BOT ONLINE';
    document.getElementById('server-name').textContent = data.bot || 'WARSTACK';
  } else {
    dot.classList.remove('online');
    label.textContent = 'BOT OFFLINE';
  }
}

checkBotStatus();
setInterval(checkBotStatus, 30000);

// ============================================
// TOGGLE HELPER
// ============================================

function toggleConfig(el, key) {
  el.classList.toggle('on');
  saveConfig(key, el.classList.contains('on'));
  toast(el.classList.contains('on') ? '✅ Activé' : '⭕ Désactivé');
}

// ============================================
// MODAL HELPERS
// ============================================

function openModal(title, body, footer) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-footer').innerHTML = footer;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// ============================================
// NAVIGATION
// ============================================

const sections = {
  overview:   renderOverview,
  players:    renderPlayers,
  tournament: renderTournament,
  welcome:    renderWelcome,
  roles:      renderRoles,
  birthdays:  renderBirthdays,
  suggestions: renderSuggestions,
  moderation: renderModeration,
  automod:    renderAutomod,
  tickets:    renderTickets,
  logs:       renderLogs,
  messages:   renderMessages,
  reactions:  renderReactions,
  channels:   renderChannels,
  settings:   renderSettings
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.dataset.section;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('section-title').textContent =
      item.querySelector('span').textContent;
    const render = sections[section];
    if (render) render();
  });
});

// ============================================
// OVERVIEW — Vue d'ensemble
// ============================================

async function renderOverview() {
  const content = document.getElementById('section-content');
  content.innerHTML = `
    <div class="cards-grid">
      <div class="card">
        <div class="card-icon"><i class="fas fa-users"></i></div>
        <div class="card-info">
          <div class="card-value" id="ov-players">—</div>
          <div class="card-label">Joueurs inscrits</div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon"><i class="fas fa-crosshairs"></i></div>
        <div class="card-info">
          <div class="card-value" id="ov-kills">—</div>
          <div class="card-label">Kills totaux</div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon"><i class="fas fa-chart-line"></i></div>
        <div class="card-info">
          <div class="card-value" id="ov-kd">—</div>
          <div class="card-label">Meilleur K/D</div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon"><i class="fas fa-star"></i></div>
        <div class="card-info">
          <div class="card-value" id="ov-mvp">—</div>
          <div class="card-label">MVP actuel</div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><h2>🏆 Top 5 Joueurs</h2></div>
      <div class="panel-body" id="top5-list">
        <div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Chargement...</p></div>
      </div>
    </div>
  `;

  const players = await fetchSupabase('players?select=*&order=kd.desc');
  if (!players || players.length === 0) return;

  document.getElementById('ov-players').textContent = players.length;
  document.getElementById('ov-kills').textContent =
    players.reduce((s, p) => s + (p.kills || 0), 0).toLocaleString();
  document.getElementById('ov-kd').textContent = (players[0].kd || 0).toFixed(2);
  document.getElementById('ov-mvp').textContent = players[0].pseudo_bf6;

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  document.getElementById('top5-list').innerHTML = players.slice(0, 5).map((p, i) => `
    <div class="top5-row">
      <div class="top5-rank">${medals[i]}</div>
      <div class="top5-name">${p.pseudo_bf6}</div>
      <div class="top5-platform">${p.platform?.toUpperCase()}</div>
      <div class="top5-kd">${(p.kd || 0).toFixed(2)}</div>
      <div class="top5-kills">🎯 ${p.kills || 0}</div>
    </div>
  `).join('');
}

// ============================================
// PLAYERS — Gestion des joueurs
// ============================================

let allPlayers = [];

async function renderPlayers() {
  const content = document.getElementById('section-content');
  content.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h2>👥 Joueurs inscrits</h2>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="search-player" class="search-input" placeholder="Rechercher...">
        </div>
      </div>
      <div class="panel-body" style="padding:0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Pseudo BF6</th>
              <th>Plateforme</th>
              <th>K/D</th>
              <th>Kills</th>
              <th>Deaths</th>
              <th>Wins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="players-table">
            <tr><td colspan="7" style="text-align:center;padding:2rem;color:#3a5a3a;letter-spacing:2px">CHARGEMENT...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const players = await fetchSupabase('players?select=*&order=kd.desc');
  allPlayers = players || [];
  renderPlayersTable(allPlayers);

  document.getElementById('search-player').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    renderPlayersTable(allPlayers.filter(p => p.pseudo_bf6.toLowerCase().includes(q)));
  });
}

function renderPlayersTable(players) {
  const tbody = document.getElementById('players-table');
  if (!players || players.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#3a5a3a;letter-spacing:2px">AUCUN JOUEUR</td></tr>';
    return;
  }
  tbody.innerHTML = players.map(p => `
    <tr>
      <td><strong>${p.pseudo_bf6}</strong></td>
      <td><span class="badge badge-green">${p.platform?.toUpperCase()}</span></td>
      <td style="color:#FF6B35;font-weight:700">${(p.kd || 0).toFixed(2)}</td>
      <td>${p.kills || 0}</td>
      <td>${p.deaths || 0}</td>
      <td>${p.wins || 0}</td>
      <td style="display:flex;gap:6px">
        <button class="btn btn-secondary btn-sm" onclick="editPlayer('${p.discord_id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="deletePlayer('${p.discord_id}', '${p.pseudo_bf6}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function editPlayer(discordId) {
  const p = allPlayers.find(p => p.discord_id === discordId);
  if (!p) return;
  openModal(
    `✏️ Modifier — ${p.pseudo_bf6}`,
    `<div class="form-grid">
      <div class="form-group">
        <label>Pseudo BF6</label>
        <input type="text" id="e-pseudo" class="form-input" value="${p.pseudo_bf6}">
      </div>
      <div class="form-group">
        <label>Plateforme</label>
        <select id="e-platform" class="form-select">
          <option ${p.platform === 'ps5' ? 'selected' : ''}>ps5</option>
          <option ${p.platform === 'psn' ? 'selected' : ''}>psn</option>
          <option ${p.platform === 'xboxseries' ? 'selected' : ''}>xboxseries</option>
          <option ${p.platform === 'pc' ? 'selected' : ''}>pc</option>
          <option ${p.platform === 'steam' ? 'selected' : ''}>steam</option>
        </select>
      </div>
      <div class="form-group">
        <label>Kills</label>
        <input type="number" id="e-kills" class="form-input" value="${p.kills || 0}">
      </div>
      <div class="form-group">
        <label>Deaths</label>
        <input type="number" id="e-deaths" class="form-input" value="${p.deaths || 0}">
      </div>
      <div class="form-group">
        <label>Wins</label>
        <input type="number" id="e-wins" class="form-input" value="${p.wins || 0}">
      </div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="savePlayer('${discordId}')">Sauvegarder</button>`
  );
}

async function savePlayer(discordId) {
  const kills = parseInt(document.getElementById('e-kills').value) || 0;
  const deaths = parseInt(document.getElementById('e-deaths').value) || 0;
  const kd = deaths > 0 ? kills / deaths : kills;
  await updateSupabase(`players?discord_id=eq.${discordId}`, {
    pseudo_bf6: document.getElementById('e-pseudo').value,
    platform: document.getElementById('e-platform').value,
    kills, deaths,
    wins: parseInt(document.getElementById('e-wins').value) || 0,
    kd
  });
  closeModal();
  renderPlayers();
  toast('✅ Joueur mis à jour');
}

async function deletePlayer(discordId, pseudo) {
  if (!confirm(`Supprimer ${pseudo} ?`)) return;
  await deleteSupabase(`players?discord_id=eq.${discordId}`);
  renderPlayers();
  toast('✅ Joueur supprimé');
}

// ============================================
// TOURNAMENT — Gestion du tournoi
// ============================================

async function renderTournament() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header"><h2>⚙️ Actions tournoi</h2></div>
      <div class="panel-body">
        <div class="actions-grid">
          <button class="btn btn-primary" id="btn-leaderboard">
            <i class="fas fa-sync"></i> Forcer leaderboard
          </button>
          <button class="btn btn-orange" id="btn-mvp">
            <i class="fas fa-star"></i> Poster MVP
          </button>
          <button class="btn btn-danger" id="btn-reset">
            <i class="fas fa-redo"></i> Reset classement
          </button>
        </div>
        <div id="t-feedback" class="feedback"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-leaderboard').addEventListener('click', async () => {
    const data = await callBotAPI('leaderboard', 'POST');
    document.getElementById('t-feedback').textContent =
      data?.success ? '✅ Leaderboard posté dans #classement' : '❌ Erreur bot';
  });

  document.getElementById('btn-mvp').addEventListener('click', async () => {
    const data = await callBotAPI('mvp', 'POST');
    document.getElementById('t-feedback').textContent =
      data?.success ? '✅ MVP posté dans #annonces-mvp' : '❌ Erreur bot';
  });

  document.getElementById('btn-reset').addEventListener('click', async () => {
    if (!confirm('Reset tout le classement ?')) return;
    const players = await fetchSupabase('players?select=discord_id');
    for (const p of players) {
      await updateSupabase(`players?discord_id=eq.${p.discord_id}`, {
        kills: 0, deaths: 0, kd: 0, wins: 0
      });
    }
    document.getElementById('t-feedback').textContent = '✅ Classement reset !';
    toast('✅ Classement reset');
  });
}

// ============================================
// WELCOME — Arrivées et Départs
// ============================================

async function renderWelcome() {
  document.getElementById('section-content').innerHTML = `

    <!-- MESSAGE D'ARRIVÉE -->
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>👋 Message d'arrivée</h2>
          <p>Envoyé quand un membre rejoint le serveur</p>
        </div>
        <div class="toggle" id="toggle-welcome" onclick="toggleConfig(this, 'welcome_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Salon d'arrivée</label>
            <input type="text" id="welcome-channel" class="form-input" placeholder="Ex: bienvenue">
          </div>
          <div class="form-group">
            <label>Variables disponibles</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
              <span class="badge badge-green">{user}</span>
              <span class="badge badge-green">{server}</span>
              <span class="badge badge-green">{count}</span>
              <span class="badge badge-green">{username}</span>
            </div>
          </div>
          <div class="form-group full">
            <label>Message d'arrivée</label>
            <textarea id="welcome-msg" class="form-textarea" rows="4"
              placeholder="Ex: Bienvenue {user} sur {server} ! Tu es le membre n°{count}."></textarea>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-secondary" onclick="previewMsg('welcome-msg')">
          <i class="fas fa-eye"></i> Aperçu
        </button>
        <button class="btn btn-primary" onclick="saveWelcome()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>

    <!-- MESSAGE DE DÉPART -->
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🚪 Message de départ</h2>
          <p>Envoyé quand un membre quitte le serveur</p>
        </div>
        <div class="toggle" id="toggle-leave" onclick="toggleConfig(this, 'leave_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Salon de départ</label>
            <input type="text" id="leave-channel" class="form-input" placeholder="Ex: bienvenue">
          </div>
          <div class="form-group">
            <label>Variables disponibles</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
              <span class="badge badge-red">{user}</span>
              <span class="badge badge-red">{server}</span>
              <span class="badge badge-red">{username}</span>
            </div>
          </div>
          <div class="form-group full">
            <label>Message de départ</label>
            <textarea id="leave-msg" class="form-textarea" rows="4"
              placeholder="Ex: {username} a quitté le serveur. Bonne route soldat."></textarea>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-secondary" onclick="previewMsg('leave-msg')">
          <i class="fas fa-eye"></i> Aperçu
        </button>
        <button class="btn btn-primary" onclick="saveLeave()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>

    <!-- RÔLE AUTOMATIQUE -->
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🎖️ Rôle automatique à l'arrivée</h2>
          <p>Rôle attribué automatiquement aux nouveaux membres</p>
        </div>
        <div class="toggle" id="toggle-autorole" onclick="toggleConfig(this, 'autorole_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="form-group">
          <label>Nom du rôle à attribuer</label>
          <input type="text" id="autorole-name" class="form-input" placeholder="Ex: Membre">
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveAutorole()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>

    <div id="welcome-feedback" class="feedback"></div>
  `;

  // Charge la config existante
  const configs = await loadConfigs();
  if (!configs) return;

  const get = (key) => getConfig(configs, key);

  if (get('welcome_enabled')) document.getElementById('toggle-welcome')?.classList.add('on');
  if (get('leave_enabled')) document.getElementById('toggle-leave')?.classList.add('on');
  if (get('autorole_enabled')) document.getElementById('toggle-autorole')?.classList.add('on');
  if (get('welcome_channel')) document.getElementById('welcome-channel').value = get('welcome_channel');
  if (get('welcome_msg')) document.getElementById('welcome-msg').value = get('welcome_msg');
  if (get('leave_channel')) document.getElementById('leave-channel').value = get('leave_channel');
  if (get('leave_msg')) document.getElementById('leave-msg').value = get('leave_msg');
  if (get('autorole_name')) document.getElementById('autorole-name').value = get('autorole_name');
}

async function saveWelcome() {
  await saveConfig('welcome_channel', document.getElementById('welcome-channel').value);
  await saveConfig('welcome_msg', document.getElementById('welcome-msg').value);
  document.getElementById('welcome-feedback').textContent = '✅ Message d\'arrivée sauvegardé !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('welcome-feedback').textContent = '', 3000);
}

async function saveLeave() {
  await saveConfig('leave_channel', document.getElementById('leave-channel').value);
  await saveConfig('leave_msg', document.getElementById('leave-msg').value);
  document.getElementById('welcome-feedback').textContent = '✅ Message de départ sauvegardé !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('welcome-feedback').textContent = '', 3000);
}

async function saveAutorole() {
  await saveConfig('autorole_name', document.getElementById('autorole-name').value);
  document.getElementById('welcome-feedback').textContent = '✅ Rôle automatique sauvegardé !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('welcome-feedback').textContent = '', 3000);
}

// Aperçu du message avec les variables remplacées
function previewMsg(fieldId) {
  const msg = document.getElementById(fieldId).value
    .replace(/{user}/g, '@PoF_HolyPriest34')
    .replace(/{username}/g, 'PoF_HolyPriest34')
    .replace(/{server}/g, 'Les Potes Ö Feu')
    .replace(/{count}/g, '205');
  openModal(
    '👁️ Aperçu du message',
    `<div style="background:#0f150f;border:1px solid rgba(74,124,89,0.3);padding:16px;font-size:14px;line-height:1.6;white-space:pre-wrap">${msg}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button>`
  );
}

// ============================================
// ROLES — Rôles automatiques
// ============================================

async function renderRoles() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🎖️ Rôles automatiques</h2>
          <p>Attribuer des rôles selon des conditions</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group full">
            <label>Rôle attribué à l'arrivée</label>
            <input type="text" id="role-join" class="form-input" placeholder="Ex: Membre">
          </div>
          <div class="form-group full">
            <label>Rôle attribué après vérification (bouton réaction)</label>
            <input type="text" id="role-verify" class="form-input" placeholder="Ex: Vérifié">
          </div>
          <div class="form-group full">
            <label>Rôle Admin</label>
            <input type="text" id="role-admin" class="form-input" placeholder="Ex: Admin">
          </div>
          <div class="form-group full">
            <label>Rôle Modérateur</label>
            <input type="text" id="role-mod" class="form-input" placeholder="Ex: Modérateur">
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveRoles()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="roles-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('role_join')) document.getElementById('role-join').value = get('role_join');
  if (get('role_verify')) document.getElementById('role-verify').value = get('role_verify');
  if (get('role_admin')) document.getElementById('role-admin').value = get('role_admin');
  if (get('role_mod')) document.getElementById('role-mod').value = get('role_mod');
}

async function saveRoles() {
  await saveConfig('role_join', document.getElementById('role-join').value);
  await saveConfig('role_verify', document.getElementById('role-verify').value);
  await saveConfig('role_admin', document.getElementById('role-admin').value);
  await saveConfig('role_mod', document.getElementById('role-mod').value);
  document.getElementById('roles-feedback').textContent = '✅ Rôles sauvegardés !';
  toast('✅ Rôles sauvegardés');
  setTimeout(() => document.getElementById('roles-feedback').textContent = '', 3000);
}

// ============================================
// BIRTHDAYS — Anniversaires
// ============================================

async function renderBirthdays() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🎂 Anniversaires</h2>
          <p>Message automatique le jour de l'anniversaire d'un membre</p>
        </div>
        <div class="toggle" id="toggle-birthday" onclick="toggleConfig(this, 'birthday_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Salon anniversaires</label>
            <input type="text" id="birthday-channel" class="form-input" placeholder="Ex: anniversaires">
          </div>
          <div class="form-group">
            <label>Variables disponibles</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
              <span class="badge badge-yellow">{user}</span>
              <span class="badge badge-yellow">{username}</span>
              <span class="badge badge-yellow">{age}</span>
            </div>
          </div>
          <div class="form-group full">
            <label>Message d'anniversaire</label>
            <textarea id="birthday-msg" class="form-textarea" rows="3"
              placeholder="Ex: 🎂 Joyeux anniversaire {user} ! Toute l'équipe PöF te souhaite une excellente journée !"></textarea>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-secondary" onclick="previewMsg('birthday-msg')">
          <i class="fas fa-eye"></i> Aperçu
        </button>
        <button class="btn btn-primary" onclick="saveBirthdays()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="birthday-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('birthday_enabled')) document.getElementById('toggle-birthday')?.classList.add('on');
  if (get('birthday_channel')) document.getElementById('birthday-channel').value = get('birthday_channel');
  if (get('birthday_msg')) document.getElementById('birthday-msg').value = get('birthday_msg');
}

async function saveBirthdays() {
  await saveConfig('birthday_channel', document.getElementById('birthday-channel').value);
  await saveConfig('birthday_msg', document.getElementById('birthday-msg').value);
  document.getElementById('birthday-feedback').textContent = '✅ Anniversaires sauvegardés !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('birthday-feedback').textContent = '', 3000);
}

// ============================================
// SUGGESTIONS
// ============================================

async function renderSuggestions() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>💡 Suggestions</h2>
          <p>Permettre aux membres de faire des suggestions</p>
        </div>
        <div class="toggle" id="toggle-suggestions" onclick="toggleConfig(this, 'suggestions_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Salon des suggestions</label>
            <input type="text" id="suggestions-channel" class="form-input" placeholder="Ex: suggestions">
          </div>
          <div class="form-group">
            <label>Salon de validation (staff)</label>
            <input type="text" id="suggestions-staff" class="form-input" placeholder="Ex: staff-suggestions">
          </div>
          <div class="form-group full">
            <label>Réactions automatiques</label>
            <div style="display:flex;gap:8px;margin-top:4px">
              <span class="badge badge-green">✅ Pour</span>
              <span class="badge badge-red">❌ Contre</span>
            </div>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveSuggestions()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="suggestions-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('suggestions_enabled')) document.getElementById('toggle-suggestions')?.classList.add('on');
  if (get('suggestions_channel')) document.getElementById('suggestions-channel').value = get('suggestions_channel');
  if (get('suggestions_staff')) document.getElementById('suggestions-staff').value = get('suggestions_staff');
}

async function saveSuggestions() {
  await saveConfig('suggestions_channel', document.getElementById('suggestions-channel').value);
  await saveConfig('suggestions_staff', document.getElementById('suggestions-staff').value);
  document.getElementById('suggestions-feedback').textContent = '✅ Suggestions sauvegardées !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('suggestions-feedback').textContent = '', 3000);
}

// ============================================
// MODERATION
// ============================================

async function renderModeration() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🛡️ Modération</h2>
          <p>Configuration des sanctions et logs</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Salon des logs de modération</label>
            <input type="text" id="mod-logs" class="form-input" placeholder="Ex: logs-modération">
          </div>
          <div class="form-group">
            <label>Salon des sanctions publiques</label>
            <input type="text" id="mod-sanctions" class="form-input" placeholder="Ex: sanctions">
          </div>
          <div class="form-group full">
            <label>Options</label>
            <div class="toggle-row">
              <div class="toggle-info">
                <h4>Notifier le membre sanctionné en DM</h4>
                <p>Envoie un message privé au membre lors d'un avertissement ou ban</p>
              </div>
              <div class="toggle" id="toggle-mod-dm" onclick="toggleConfig(this, 'mod_dm_enabled')"></div>
            </div>
            <div class="toggle-row">
              <div class="toggle-info">
                <h4>Publier les sanctions dans le salon</h4>
                <p>Affiche publiquement les sanctions dans le salon configuré</p>
              </div>
              <div class="toggle" id="toggle-mod-public" onclick="toggleConfig(this, 'mod_public_enabled')"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveModeration()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="mod-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('mod_dm_enabled')) document.getElementById('toggle-mod-dm')?.classList.add('on');
  if (get('mod_public_enabled')) document.getElementById('toggle-mod-public')?.classList.add('on');
  if (get('mod_logs')) document.getElementById('mod-logs').value = get('mod_logs');
  if (get('mod_sanctions')) document.getElementById('mod-sanctions').value = get('mod_sanctions');
}

async function saveModeration() {
  await saveConfig('mod_logs', document.getElementById('mod-logs').value);
  await saveConfig('mod_sanctions', document.getElementById('mod-sanctions').value);
  document.getElementById('mod-feedback').textContent = '✅ Modération sauvegardée !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('mod-feedback').textContent = '', 3000);
}

// ============================================
// AUTOMOD — Auto-Modération
// ============================================

async function renderAutomod() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🤖 Auto-Modération</h2>
          <p>Filtres automatiques appliqués aux messages</p>
        </div>
        <div class="toggle" id="toggle-automod" onclick="toggleConfig(this, 'automod_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="toggle-row">
          <div class="toggle-info">
            <h4>Anti-spam</h4>
            <p>Supprime les messages envoyés trop rapidement</p>
          </div>
          <div class="toggle" id="toggle-antispam" onclick="toggleConfig(this, 'antispam_enabled')"></div>
        </div>
        <div class="toggle-row">
          <div class="toggle-info">
            <h4>Anti-liens</h4>
            <p>Supprime les liens non autorisés</p>
          </div>
          <div class="toggle" id="toggle-antilinks" onclick="toggleConfig(this, 'antilinks_enabled')"></div>
        </div>
        <div class="toggle-row">
          <div class="toggle-info">
            <h4>Anti-majuscules</h4>
            <p>Supprime les messages en majuscules excessives</p>
          </div>
          <div class="toggle" id="toggle-anticaps" onclick="toggleConfig(this, 'anticaps_enabled')"></div>
        </div>
        <div class="toggle-row">
          <div class="toggle-info">
            <h4>Anti-mentions abusives</h4>
            <p>Supprime les messages avec trop de mentions</p>
          </div>
          <div class="toggle" id="toggle-antimentions" onclick="toggleConfig(this, 'antimentions_enabled')"></div>
        </div>
        <div style="margin-top:1.5rem">
          <div class="form-group full">
            <label>Mots interdits (séparés par des virgules)</label>
            <textarea id="banned-words" class="form-textarea" rows="3"
              placeholder="Ex: mot1, mot2, mot3"></textarea>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveAutomod()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="automod-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('automod_enabled')) document.getElementById('toggle-automod')?.classList.add('on');
  if (get('antispam_enabled')) document.getElementById('toggle-antispam')?.classList.add('on');
  if (get('antilinks_enabled')) document.getElementById('toggle-antilinks')?.classList.add('on');
  if (get('anticaps_enabled')) document.getElementById('toggle-anticaps')?.classList.add('on');
  if (get('antimentions_enabled')) document.getElementById('toggle-antimentions')?.classList.add('on');
  if (get('banned_words')) document.getElementById('banned-words').value = get('banned_words');
}

async function saveAutomod() {
  await saveConfig('banned_words', document.getElementById('banned-words').value);
  document.getElementById('automod-feedback').textContent = '✅ Auto-modération sauvegardée !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('automod-feedback').textContent = '', 3000);
}

// ============================================
// TICKETS
// ============================================

async function renderTickets() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🎫 Tickets</h2>
          <p>Système de support par tickets</p>
        </div>
        <div class="toggle" id="toggle-tickets" onclick="toggleConfig(this, 'tickets_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Catégorie des tickets</label>
            <input type="text" id="tickets-category" class="form-input" placeholder="Ex: TICKETS">
          </div>
          <div class="form-group">
            <label>Salon de création des tickets</label>
            <input type="text" id="tickets-channel" class="form-input" placeholder="Ex: créer-un-ticket">
          </div>
          <div class="form-group">
            <label>Rôle accès aux tickets (staff)</label>
            <input type="text" id="tickets-role" class="form-input" placeholder="Ex: Staff">
          </div>
          <div class="form-group">
            <label>Salon des logs tickets</label>
            <input type="text" id="tickets-logs" class="form-input" placeholder="Ex: logs-tickets">
          </div>
          <div class="form-group full">
            <label>Message du bouton de création</label>
            <textarea id="tickets-msg" class="form-textarea" rows="3"
              placeholder="Ex: Clique sur le bouton ci-dessous pour ouvrir un ticket de support."></textarea>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveTickets()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="tickets-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('tickets_enabled')) document.getElementById('toggle-tickets')?.classList.add('on');
  if (get('tickets_category')) document.getElementById('tickets-category').value = get('tickets_category');
  if (get('tickets_channel')) document.getElementById('tickets-channel').value = get('tickets_channel');
  if (get('tickets_role')) document.getElementById('tickets-role').value = get('tickets_role');
  if (get('tickets_logs')) document.getElementById('tickets-logs').value = get('tickets_logs');
  if (get('tickets_msg')) document.getElementById('tickets-msg').value = get('tickets_msg');
}

async function saveTickets() {
  await saveConfig('tickets_category', document.getElementById('tickets-category').value);
  await saveConfig('tickets_channel', document.getElementById('tickets-channel').value);
  await saveConfig('tickets_role', document.getElementById('tickets-role').value);
  await saveConfig('tickets_logs', document.getElementById('tickets-logs').value);
  await saveConfig('tickets_msg', document.getElementById('tickets-msg').value);
  document.getElementById('tickets-feedback').textContent = '✅ Tickets sauvegardés !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('tickets-feedback').textContent = '', 3000);
}

// ============================================
// LOGS
// ============================================

async function renderLogs() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>📋 Logs</h2>
          <p>Enregistrement des événements du serveur</p>
        </div>
        <div class="toggle" id="toggle-logs" onclick="toggleConfig(this, 'logs_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="form-group">
          <label>Salon des logs principal</label>
          <input type="text" id="logs-channel" class="form-input" placeholder="Ex: logs">
        </div>
        <div style="margin-top:1rem">
          <div class="toggle-row">
            <div class="toggle-info">
              <h4>Logs des messages supprimés</h4>
              <p>Enregistre les messages supprimés</p>
            </div>
            <div class="toggle" id="toggle-logs-delete" onclick="toggleConfig(this, 'logs_delete_enabled')"></div>
          </div>
          <div class="toggle-row">
            <div class="toggle-info">
              <h4>Logs des messages modifiés</h4>
              <p>Enregistre les messages modifiés</p>
            </div>
            <div class="toggle" id="toggle-logs-edit" onclick="toggleConfig(this, 'logs_edit_enabled')"></div>
          </div>
          <div class="toggle-row">
            <div class="toggle-info">
              <h4>Logs des arrivées/départs</h4>
              <p>Enregistre les membres qui arrivent et partent</p>
            </div>
            <div class="toggle" id="toggle-logs-members" onclick="toggleConfig(this, 'logs_members_enabled')"></div>
          </div>
          <div class="toggle-row">
            <div class="toggle-info">
              <h4>Logs des sanctions</h4>
              <p>Enregistre tous les bans, kicks et avertissements</p>
            </div>
            <div class="toggle" id="toggle-logs-sanctions" onclick="toggleConfig(this, 'logs_sanctions_enabled')"></div>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveLogs()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="logs-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('logs_enabled')) document.getElementById('toggle-logs')?.classList.add('on');
  if (get('logs_delete_enabled')) document.getElementById('toggle-logs-delete')?.classList.add('on');
  if (get('logs_edit_enabled')) document.getElementById('toggle-logs-edit')?.classList.add('on');
  if (get('logs_members_enabled')) document.getElementById('toggle-logs-members')?.classList.add('on');
  if (get('logs_sanctions_enabled')) document.getElementById('toggle-logs-sanctions')?.classList.add('on');
  if (get('logs_channel')) document.getElementById('logs-channel').value = get('logs_channel');
}

async function saveLogs() {
  await saveConfig('logs_channel', document.getElementById('logs-channel').value);
  document.getElementById('logs-feedback').textContent = '✅ Logs sauvegardés !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('logs-feedback').textContent = '', 3000);
}

// ============================================
// MESSAGES RÉCURRENTS
// ============================================

async function renderMessages() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🕐 Messages récurrents</h2>
          <p>Messages envoyés automatiquement à intervalle régulier</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Salon</label>
            <input type="text" id="recurrent-channel" class="form-input" placeholder="Ex: annonces">
          </div>
          <div class="form-group">
            <label>Intervalle</label>
            <select id="recurrent-interval" class="form-select">
              <option value="daily">Chaque jour</option>
              <option value="weekly">Chaque semaine</option>
              <option value="monthly">Chaque mois</option>
            </select>
          </div>
          <div class="form-group full">
            <label>Message</label>
            <textarea id="recurrent-msg" class="form-textarea" rows="4"
              placeholder="Ex: 🎮 N'oubliez pas de mettre à jour vos stats avec /link !"></textarea>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-secondary" onclick="previewMsg('recurrent-msg')">
          <i class="fas fa-eye"></i> Aperçu
        </button>
        <button class="btn btn-primary" onclick="saveMessages()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="messages-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('recurrent_channel')) document.getElementById('recurrent-channel').value = get('recurrent_channel');
  if (get('recurrent_interval')) document.getElementById('recurrent-interval').value = get('recurrent_interval');
  if (get('recurrent_msg')) document.getElementById('recurrent-msg').value = get('recurrent_msg');
}

async function saveMessages() {
  await saveConfig('recurrent_channel', document.getElementById('recurrent-channel').value);
  await saveConfig('recurrent_interval', document.getElementById('recurrent-interval').value);
  await saveConfig('recurrent_msg', document.getElementById('recurrent-msg').value);
  document.getElementById('messages-feedback').textContent = '✅ Messages récurrents sauvegardés !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('messages-feedback').textContent = '', 3000);
}

// ============================================
// REACTIONS — Rôles par réactions
// ============================================

async function renderReactions() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>😀 Rôles-Réactions</h2>
          <p>Attribuer des rôles via des réactions sur un message</p>
        </div>
        <div class="toggle" id="toggle-reactions" onclick="toggleConfig(this, 'reactions_enabled')"></div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Salon du message de réactions</label>
            <input type="text" id="reactions-channel" class="form-input" placeholder="Ex: choisir-roles">
          </div>
          <div class="form-group full">
            <label>Message à afficher</label>
            <textarea id="reactions-msg" class="form-textarea" rows="3"
              placeholder="Ex: Réagis pour obtenir ton rôle !"></textarea>
          </div>
          <div class="form-group full">
            <label>Paires emoji → rôle (une par ligne)</label>
            <textarea id="reactions-pairs" class="form-textarea" rows="5"
              placeholder="Ex:&#10;🎮 Joueur&#10;🏆 Compétitif&#10;🎯 FPS"></textarea>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveReactions()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="reactions-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('reactions_enabled')) document.getElementById('toggle-reactions')?.classList.add('on');
  if (get('reactions_channel')) document.getElementById('reactions-channel').value = get('reactions_channel');
  if (get('reactions_msg')) document.getElementById('reactions-msg').value = get('reactions_msg');
  if (get('reactions_pairs')) document.getElementById('reactions-pairs').value = get('reactions_pairs');
}

async function saveReactions() {
  await saveConfig('reactions_channel', document.getElementById('reactions-channel').value);
  await saveConfig('reactions_msg', document.getElementById('reactions-msg').value);
  await saveConfig('reactions_pairs', document.getElementById('reactions-pairs').value);
  document.getElementById('reactions-feedback').textContent = '✅ Rôles-Réactions sauvegardés !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('reactions-feedback').textContent = '', 3000);
}

// ============================================
// CHANNELS — Gestion des salons
// ============================================

async function renderChannels() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>#️⃣ Salons WARSTACK</h2>
          <p>Configuration des salons utilisés par le bot</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Salon #tournoi-live</label>
            <input type="text" id="ch-tournoi" class="form-input" placeholder="tournoi-live">
          </div>
          <div class="form-group">
            <label>Salon #classement</label>
            <input type="text" id="ch-classement" class="form-input" placeholder="classement">
          </div>
          <div class="form-group">
            <label>Salon #inscriptions</label>
            <input type="text" id="ch-inscriptions" class="form-input" placeholder="inscriptions">
          </div>
          <div class="form-group">
            <label>Salon #annonces-mvp</label>
            <input type="text" id="ch-mvp" class="form-input" placeholder="annonces-mvp">
          </div>
          <div class="form-group">
            <label>Salon #annonces</label>
            <input type="text" id="ch-annonces" class="form-input" placeholder="annonces">
          </div>
          <div class="form-group">
            <label>Salon #logs</label>
            <input type="text" id="ch-logs" class="form-input" placeholder="logs">
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveChannels()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
    <div id="channels-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('ch_tournoi')) document.getElementById('ch-tournoi').value = get('ch_tournoi');
  if (get('ch_classement')) document.getElementById('ch-classement').value = get('ch_classement');
  if (get('ch_inscriptions')) document.getElementById('ch-inscriptions').value = get('ch_inscriptions');
  if (get('ch_mvp')) document.getElementById('ch-mvp').value = get('ch_mvp');
  if (get('ch_annonces')) document.getElementById('ch-annonces').value = get('ch_annonces');
  if (get('ch_logs')) document.getElementById('ch-logs').value = get('ch_logs');
}

async function saveChannels() {
  await saveConfig('ch_tournoi', document.getElementById('ch-tournoi').value);
  await saveConfig('ch_classement', document.getElementById('ch-classement').value);
  await saveConfig('ch_inscriptions', document.getElementById('ch-inscriptions').value);
  await saveConfig('ch_mvp', document.getElementById('ch-mvp').value);
  await saveConfig('ch_annonces', document.getElementById('ch-annonces').value);
  await saveConfig('ch_logs', document.getElementById('ch-logs').value);
  document.getElementById('channels-feedback').textContent = '✅ Salons sauvegardés !';
  toast('✅ Salons sauvegardés');
  setTimeout(() => document.getElementById('channels-feedback').textContent = '', 3000);
}

// ============================================
// SETTINGS — Paramètres généraux
// ============================================

async function renderSettings() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>⚙️ Paramètres généraux</h2>
          <p>Configuration globale de WARSTACK</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Préfixe des commandes</label>
            <input type="text" id="settings-prefix" class="form-input" placeholder="Ex: !">
          </div>
          <div class="form-group">
            <label>Langue</label>
            <select id="settings-lang" class="form-select">
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          <div class="form-group full">
            <label>Options</label>
            <div class="toggle-row">
              <div class="toggle-info">
                <h4>Mode maintenance</h4>
                <p>Désactive toutes les commandes sauf pour les admins</p>
              </div>
              <div class="toggle" id="toggle-maintenance" onclick="toggleConfig(this, 'maintenance_enabled')"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary" onclick="saveSettings()">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>🔑 API & Tokens</h2>
          <p>Informations de connexion</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group full">
            <label>Bot URL (Render)</label>
            <input type="text" class="form-input" value="${BOT_URL}" disabled>
          </div>
          <div class="form-group full">
            <label>Guild ID</label>
            <input type="text" class="form-input" value="${GUILD_ID}" disabled>
          </div>
        </div>
      </div>
    </div>

    <div id="settings-feedback" class="feedback"></div>
  `;

  const configs = await loadConfigs();
  const get = (key) => getConfig(configs, key);
  if (get('maintenance_enabled')) document.getElementById('toggle-maintenance')?.classList.add('on');
  if (get('settings_prefix')) document.getElementById('settings-prefix').value = get('settings_prefix');
  if (get('settings_lang')) document.getElementById('settings-lang').value = get('settings_lang');
}

async function saveSettings() {
  await saveConfig('settings_prefix', document.getElementById('settings-prefix').value);
  await saveConfig('settings_lang', document.getElementById('settings-lang').value);
  document.getElementById('settings-feedback').textContent = '✅ Paramètres sauvegardés !';
  toast('✅ Sauvegardé');
  setTimeout(() => document.getElementById('settings-feedback').textContent = '', 3000);
}

// ============================================
// INIT — Chargement initial
// ============================================

renderOverview();