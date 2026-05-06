// ============================================
// WARSTACK DASHBOARD — app.js
// ============================================

const SUPABASE_URL = 'https://eaiuibqpouwwkqdcwthl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaXVpYnFwb3V3d2txZGN3dGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODkyNzMsImV4cCI6MjA5MzY2NTI3M30.QHjd47M2ODKkYLvkCed5Ay4a5bPxxoBsk2aXeWlNk6M';

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
// NAVIGATION
// ============================================
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.dataset.section;

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    item.classList.add('active');
    document.getElementById(section).classList.add('active');
    document.getElementById('section-title').textContent = item.querySelector('span').textContent;

    if (section === 'players') loadPlayers();
  });
});

// ============================================
// OVERVIEW
// ============================================
async function loadOverview() {
  const players = await fetchSupabase('players?select=*&order=kd.desc');

  if (!players || players.length === 0) return;

  document.getElementById('total-players').textContent = players.length;
  document.getElementById('total-kills').textContent =
    players.reduce((s, p) => s + (p.kills || 0), 0).toLocaleString();
  document.getElementById('best-kd').textContent =
    (players[0].kd || 0).toFixed(2);
  document.getElementById('mvp-name').textContent = players[0].pseudo_bf6;

  // Top 5
  const top5 = players.slice(0, 5);
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  document.getElementById('top5-list').innerHTML = top5.map((p, i) => `
    <div class="top5-row">
      <div class="top5-rank">${medals[i]}</div>
      <div class="top5-name">${p.pseudo_bf6}</div>
      <div class="top5-kd">${(p.kd || 0).toFixed(2)}</div>
      <div class="top5-kills">🎯 ${p.kills || 0} kills</div>
    </div>
  `).join('');
}

// ============================================
// PLAYERS
// ============================================
let allPlayers = [];

async function loadPlayers() {
  const players = await fetchSupabase('players?select=*&order=kd.desc');
  allPlayers = players || [];
  renderPlayers(allPlayers);
}

function renderPlayers(players) {
  const tbody = document.getElementById('players-table');

  if (!players || players.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Aucun joueur</td></tr>';
    return;
  }

  tbody.innerHTML = players.map(p => `
    <tr>
      <td><strong>${p.pseudo_bf6}</strong></td>
      <td>${p.platform?.toUpperCase()}</td>
      <td style="color:#FF6600">${(p.kd || 0).toFixed(2)}</td>
      <td>${p.kills || 0}</td>
      <td>${p.deaths || 0}</td>
      <td>${p.wins || 0}</td>
      <td style="display:flex;gap:8px">
        <button class="action-btn primary small" onclick="openEdit('${p.discord_id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="action-btn danger small" onclick="deletePlayer('${p.discord_id}', '${p.pseudo_bf6}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Search
document.getElementById('search-player').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allPlayers.filter(p =>
    p.pseudo_bf6.toLowerCase().includes(query)
  );
  renderPlayers(filtered);
});

// ============================================
// EDIT JOUEUR
// ============================================
function openEdit(discordId) {
  const player = allPlayers.find(p => p.discord_id === discordId);
  if (!player) return;

  document.getElementById('edit-discord-id').value = player.discord_id;
  document.getElementById('edit-pseudo').value = player.pseudo_bf6;
  document.getElementById('edit-kills').value = player.kills || 0;
  document.getElementById('edit-deaths').value = player.deaths || 0;
  document.getElementById('edit-wins').value = player.wins || 0;

  document.getElementById('edit-modal').classList.add('open');
}

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('edit-modal').classList.remove('open');
});

document.getElementById('btn-cancel').addEventListener('click', () => {
  document.getElementById('edit-modal').classList.remove('open');
});

document.getElementById('btn-save').addEventListener('click', async () => {
  const discordId = document.getElementById('edit-discord-id').value;
  const kills = parseInt(document.getElementById('edit-kills').value) || 0;
  const deaths = parseInt(document.getElementById('edit-deaths').value) || 0;
  const wins = parseInt(document.getElementById('edit-wins').value) || 0;
  const pseudo = document.getElementById('edit-pseudo').value;
  const kd = deaths > 0 ? kills / deaths : kills;

  await updateSupabase(
    `players?discord_id=eq.${discordId}`,
    { pseudo_bf6: pseudo, kills, deaths, wins, kd }
  );

  document.getElementById('edit-modal').classList.remove('open');
  await loadPlayers();
});

// ============================================
// DELETE JOUEUR
// ============================================
async function deletePlayer(discordId, pseudo) {
  if (!confirm(`Supprimer ${pseudo} ?`)) return;
  await deleteSupabase(`players?discord_id=eq.${discordId}`);
  await loadPlayers();
}

// ============================================
// TOURNOI ACTIONS
// ============================================
document.getElementById('btn-reset').addEventListener('click', async () => {
  if (!confirm('Reset tout le classement ? (kills, deaths, kd, wins à 0)')) return;

  const players = await fetchSupabase('players?select=discord_id');
  for (const p of players) {
    await updateSupabase(
      `players?discord_id=eq.${p.discord_id}`,
      { kills: 0, deaths: 0, kd: 0, wins: 0 }
    );
  }

  document.getElementById('action-feedback').textContent = '✅ Classement reset avec succès !';
  setTimeout(() => {
    document.getElementById('action-feedback').textContent = '';
  }, 3000);
});

document.getElementById('btn-update').addEventListener('click', () => {
  document.getElementById('action-feedback').textContent = '✅ Mise à jour forcée — le bot va poster dans #classement dans 1 minute.';
  setTimeout(() => {
    document.getElementById('action-feedback').textContent = '';
  }, 3000);
});

// ============================================
// INIT
// ============================================
loadOverview();