import { fetchSupabase, updateSupabase, insertSupabase, callBotAPI } from '../api.js';

export async function initTournament() {
  document.getElementById('section-content').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h2>🏆 Gestion Tournoi</h2>
        <div class="panel-tabs">
          <button class="tab-btn active" data-tab="tournoi">Tournoi</button>
          <button class="tab-btn" data-tab="inscrits">Inscrits</button>
          <button class="tab-btn" data-tab="soumissions">Soumissions</button>
          <button class="tab-btn" data-tab="scoreboard">Scoreboard</button>
          <button class="tab-btn" data-tab="outils">Outils</button>
        </div>
      </div>
      <div class="panel-body">
        <div id="tab-tournoi" class="tab-content active"></div>
        <div id="tab-inscrits" class="tab-content hidden"></div>
        <div id="tab-soumissions" class="tab-content hidden"></div>
        <div id="tab-scoreboard" class="tab-content hidden"></div>
        <div id="tab-outils" class="tab-content hidden"></div>
        <div id="tournament-feedback" class="feedback"></div>
      </div>
    </div>
  `;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
      loadTab(btn.dataset.tab);
    });
  });

  loadTab('tournoi');
}

async function loadTab(tab) {
  switch(tab) {
    case 'tournoi':     return loadTournoi();
    case 'inscrits':    return loadInscrits();
    case 'soumissions': return loadSoumissions();
    case 'scoreboard':  return loadScoreboard();
    case 'outils':      return loadOutils();
  }
}

// ============================================
// ONGLET TOURNOI — Créer / Gérer
// ============================================
async function loadTournoi() {
  const container = document.getElementById('tab-tournoi');
  container.innerHTML = '<p>Chargement...</p>';

  const tournois = await fetchSupabase('tournaments?order=created_at.desc&limit=5');
  const actif = tournois?.find(t => t.status === 'active');

  let html = '';

  if (actif) {
    html += `
      <div class="card card-orange">
        <h3>🟢 Tournoi en cours : ${actif.name}</h3>
        <p>📅 Du <strong>${formatDate(actif.start_date)}</strong> au <strong>${formatDate(actif.end_date)}</strong></p>
        <p>👥 Max joueurs : <strong>${actif.max_players || '∞'}</strong></p>
        <p>📊 Statut : <strong>${actif.status}</strong></p>
        <div class="actions-grid" style="margin-top:12px">
          <button class="btn btn-danger" id="btn-terminer">🏁 Terminer le tournoi</button>
          <button class="btn btn-secondary" id="btn-annuler">❌ Annuler</button>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="card">
        <h3>➕ Créer un tournoi</h3>
        <div class="form-group">
          <label>Nom du tournoi</label>
          <input type="text" id="t-nom" class="form-control" placeholder="ex: Tournoi PöF Saison 1">
        </div>
        <div class="form-group">
          <label>Date de début</label>
          <input type="date" id="t-start" class="form-control">
        </div>
        <div class="form-group">
          <label>Date de fin</label>
          <input type="date" id="t-end" class="form-control">
        </div>
        <div class="form-group">
          <label>Max joueurs (0 = illimité)</label>
          <input type="number" id="t-max" class="form-control" value="0" min="0">
        </div>
        <button class="btn btn-primary" id="btn-create-tournoi">🏆 Créer le tournoi</button>
      </div>
    `;
  }

  // Historique
  const archives = tournois?.filter(t => t.status !== 'active') || [];
  if (archives.length) {
    html += `<div class="card" style="margin-top:16px"><h3>📁 Historique</h3><table class="data-table"><thead><tr><th>Nom</th><th>Début</th><th>Fin</th><th>Statut</th></tr></thead><tbody>`;
    archives.forEach(t => {
      html += `<tr><td>${t.name}</td><td>${formatDate(t.start_date)}</td><td>${formatDate(t.end_date)}</td><td>${t.status}</td></tr>`;
    });
    html += `</tbody></table></div>`;
  }

  container.innerHTML = html;

  if (actif) {
    document.getElementById('btn-terminer')?.addEventListener('click', () => terminerTournoi(actif.id));
    document.getElementById('btn-annuler')?.addEventListener('click', () => changerStatut(actif.id, 'annule'));
  } else {
    document.getElementById('btn-create-tournoi')?.addEventListener('click', creerTournoi);
  }
}

async function creerTournoi() {
  const nom   = document.getElementById('t-nom').value.trim();
  const start = document.getElementById('t-start').value;
  const end   = document.getElementById('t-end').value;
  const max   = parseInt(document.getElementById('t-max').value) || 0;

  if (!nom || !start || !end) {
    setFeedback('❌ Remplis tous les champs.'); return;
  }

  setFeedback('Création en cours...');

  await insertSupabase('tournaments', {
    name        : nom,
    start_date  : start,
    end_date    : end,
    max_players : max || null,
    status      : 'active',
    created_at  : new Date().toISOString()
  });

  setFeedback('✅ Tournoi créé !');
  loadTournoi();
}

async function terminerTournoi(id) {
  if (!confirm('Terminer ce tournoi ?')) return;
  await changerStatut(id, 'termine');
  setFeedback('✅ Tournoi terminé.');
  loadTournoi();
}

async function changerStatut(id, statut) {
  await updateSupabase(`tournaments?id=eq.${id}`, { status: statut });
  loadTournoi();
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function setFeedback(msg) {
  document.getElementById('tournament-feedback').textContent = msg;
}


// ============================================
// ONGLET INSCRITS
// ============================================
async function loadInscrits() {
  const container = document.getElementById('tab-inscrits');
  container.innerHTML = '<p>Chargement...</p>';

  const actif = await getTournoiActif();
  if (!actif) { container.innerHTML = '<p>Aucun tournoi en cours.</p>'; return; }

  const entries = await fetchSupabase(
    `tournament_entries?tournament_id=eq.${actif.id}&select=*`
  );

  if (!entries?.length) {
    container.innerHTML = '<p>Aucun inscrit pour l\'instant.</p>'; return;
  }

  let html = `
    <div class="card">
      <h3>👥 Inscrits — ${actif.name} (${entries.length})</h3>
      <table class="data-table">
        <thead><tr><th>Joueur</th><th>Discord ID</th><th>Inscrit le</th><th>Action</th></tr></thead>
        <tbody>
  `;

  entries.forEach(e => {
    html += `
      <tr>
        <td>${e.username || '—'}</td>
        <td><code>${e.discord_id}</code></td>
        <td>${formatDate(e.created_at)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="expulserJoueur('${e.id}')">❌ Expulser</button></td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

window.expulserJoueur = async function(id) {
  if (!confirm('Expulser ce joueur ?')) return;
  await updateSupabase(`tournament_entries?id=eq.${id}`, { status: 'expelled' });
  setFeedback('✅ Joueur expulsé.');
  loadInscrits();
};

// ============================================
// ONGLET SOUMISSIONS
// ============================================
async function loadSoumissions() {
  const container = document.getElementById('tab-soumissions');
  container.innerHTML = '<p>Chargement...</p>';

  const actif = await getTournoiActif();
  if (!actif) { container.innerHTML = '<p>Aucun tournoi en cours.</p>'; return; }

  const subs = await fetchSupabase(
    `tournament_submissions?tournament_id=eq.${actif.id}&order=submitted_at.desc`
  );

  if (!subs?.length) {
    container.innerHTML = '<p>Aucune soumission.</p>'; return;
  }

  let html = `<div class="card"><h3>📸 Soumissions à valider</h3>`;

  subs.forEach(s => {
    const badgeColor = s.status === 'pending' ? 'orange' : s.status === 'validated' ? 'green' : 'red';
    html += `
      <div class="submission-card" style="border-left: 4px solid ${badgeColor}; padding:12px; margin-bottom:12px; background: var(--bg-secondary); border-radius:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${s.discord_id}</strong> — ${formatDate(s.submitted_at)}
            <span class="badge badge-${badgeColor}">${s.status}</span>
          </div>
          <div style="display:flex; gap:8px;">
            ${s.status === 'pending' ? `
              <button class="btn btn-primary btn-sm" onclick="validerSub('${s.id}')">✅ Valider</button>
              <button class="btn btn-danger btn-sm" onclick="rejeterSub('${s.id}')">❌ Rejeter</button>
            ` : ''}
          </div>
        </div>
        <div style="margin-top:8px; display:flex; gap:16px;">
          <span>🎯 Kills: <strong>${s.kills ?? '—'}</strong></span>
          <span>💀 Deaths: <strong>${s.deaths ?? '—'}</strong></span>
          <span>📊 Score: <strong>${s.score ?? '—'}</strong></span>
          <span>📈 K/D: <strong>${s.kd ?? '—'}</strong></span>
        </div>
        ${s.image_url ? `<div style="margin-top:8px;"><a href="${s.image_url}" target="_blank"><img src="${s.image_url}" style="max-height:120px; border-radius:4px; cursor:pointer;"></a></div>` : ''}
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

window.validerSub = async function(id) {
  await updateSupabase(`tournament_submissions?id=eq.${id}`, { status: 'validated' });
  setFeedback('✅ Soumission validée.');
  loadSoumissions();
};

window.rejeterSub = async function(id) {
  await updateSupabase(`tournament_submissions?id=eq.${id}`, { status: 'rejected' });
  setFeedback('❌ Soumission rejetée.');
  loadSoumissions();
};

// ============================================
// ONGLET SCOREBOARD
// ============================================
async function loadScoreboard() {
  const container = document.getElementById('tab-scoreboard');
  container.innerHTML = '<p>Chargement...</p>';

  const actif = await getTournoiActif();
  if (!actif) { container.innerHTML = '<p>Aucun tournoi en cours.</p>'; return; }

  const scores = await fetchSupabase(
    `tournament_scores?tournament_id=eq.${actif.id}&order=score.desc`
  );

  if (!scores?.length) {
    container.innerHTML = '<p>Aucun score enregistré.</p>'; return;
  }

  const podium = ['🥇', '🥈', '🥉'];

  let html = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3>🏆 Scoreboard — ${actif.name}</h3>
        <button class="btn btn-primary btn-sm" onclick="refreshScoreboard()">🔄 Rafraîchir</button>
      </div>
      <table class="data-table">
        <thead><tr><th>#</th><th>Joueur</th><th>Kills</th><th>Deaths</th><th>K/D</th><th>Score</th></tr></thead>
        <tbody>
  `;

  scores.forEach((s, i) => {
    html += `
      <tr ${i < 3 ? 'style="font-weight:bold"' : ''}>
        <td>${podium[i] || `#${i+1}`}</td>
        <td>${s.username || s.discord_id}</td>
        <td>${s.kills ?? '—'}</td>
        <td>${s.deaths ?? '—'}</td>
        <td>${s.kd ?? '—'}</td>
        <td>${s.score ?? '—'}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

window.refreshScoreboard = function() { loadScoreboard(); };

// ============================================
// ONGLET OUTILS
// ============================================
async function loadOutils() {
  const container = document.getElementById('tab-outils');
  container.innerHTML = `
    <div class="card">
      <h3>🔧 Outils</h3>
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
      <div id="tournament-feedback" class="feedback" style="margin-top:12px;"></div>
    </div>
  `;

  document.getElementById('btn-leaderboard').addEventListener('click', async () => {
    setFeedback('Envoi leaderboard...');
    const d = await callBotAPI('leaderboard', 'POST');
    setFeedback(d?.success ? '✅ Leaderboard envoyé' : '❌ Erreur bot');
  });

  document.getElementById('btn-mvp').addEventListener('click', async () => {
    setFeedback('Publication MVP...');
    const d = await callBotAPI('mvp', 'POST');
    setFeedback(d?.success ? '✅ MVP publié' : '❌ Erreur bot');
  });

  document.getElementById('btn-reset').addEventListener('click', async () => {
    if (!confirm('Reset tout le classement ?')) return;
    setFeedback('Reset en cours...');
    const players = await fetchSupabase('players?select=discord_id');
    for (const p of players) {
      await updateSupabase(`players?discord_id=eq.${p.discord_id}`, { kills:0, deaths:0, kd:0, wins:0 });
    }
    setFeedback('✅ Classement reset');
  });
}

// ============================================
// HELPER
// ============================================
async function getTournoiActif() {
  const tournois = await fetchSupabase('tournaments?status=eq.active&limit=1');
  return tournois?.[0] || null;
}