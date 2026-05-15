// ============================================
// SECTION — tournament.js
// ============================================

import { fetchSupabase, updateSupabase, insertSupabase, deleteSupabase, callBotAPI } from '../api.js';
import { showConfirm } from '../ui/confirm.js';

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
  switch (tab) {
    case 'tournoi':     return loadTournoi();
    case 'inscrits':    return loadInscrits();
    case 'soumissions': return loadSoumissions();
    case 'scoreboard':  return loadScoreboard();
    case 'outils':      return loadOutils();
  }
}

// ============================================
// ONGLET TOURNOI
// ============================================
async function loadTournoi() {
  const container = document.getElementById('tab-tournoi');
  container.innerHTML = '<p>Chargement...</p>';

  const tournois = await fetchSupabase('tournaments?order=created_at.desc&limit=20');
  const actif = tournois?.find(t => t.status === 'active');

  let html = '';

  if (actif) {
    html += `
      <div style="
        background: linear-gradient(135deg, var(--surface-2), var(--surface-3));
        border: 1px solid var(--orange);
        border-left: 4px solid var(--orange);
        box-shadow: 0 0 24px var(--orange-glow);
        padding: 24px;
        border-radius: var(--radius);
        margin-bottom: 16px;
      ">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:10px; letter-spacing:3px; color:var(--orange); font-weight:700; margin-bottom:6px;">🟢 TOURNOI ACTIF</div>
            <h2 style="font-size:22px; color:var(--text); margin:0 0 16px 0; letter-spacing:2px;">${actif.name}</h2>
            <div style="display:flex; gap:24px; flex-wrap:wrap;">
              <div>
                <div style="font-size:10px; letter-spacing:2px; color:var(--text-muted); margin-bottom:4px;">DÉBUT</div>
                <div style="color:var(--green); font-weight:600;">${formatDate(actif.start_date)}</div>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:2px; color:var(--text-muted); margin-bottom:4px;">FIN</div>
                <div style="color:var(--green); font-weight:600;">${formatDate(actif.end_date)}</div>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:2px; color:var(--text-muted); margin-bottom:4px;">MAX JOUEURS</div>
                <div style="color:var(--text); font-weight:600;">${actif.max_players || '∞'}</div>
              </div>
            </div>
            ${actif.description ? `<p style="margin:16px 0 0 0; color:var(--text-dim); font-size:13px;">${actif.description}</p>` : ''}
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; min-width:140px;">
            <button class="btn btn-danger" id="btn-terminer">🏁 Terminer</button>
            <button class="btn btn-secondary" id="btn-annuler">❌ Annuler</button>
          </div>
        </div>
      </div>
    `;
  } else {
    html += `
      <div style="
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-top: 3px solid var(--green);
        padding: 28px;
        border-radius: var(--radius);
        box-shadow: 0 0 32px var(--green-glow);
      ">
        <div style="font-size:10px; letter-spacing:3px; color:var(--green-dim); font-weight:700; margin-bottom:20px;">➕ CRÉER UN TOURNOI</div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          <div class="form-group" style="grid-column: 1 / -1;">
            <label>Nom du tournoi</label>
            <input type="text" id="t-nom" class="form-input" placeholder="ex: Tournoi PöF — Saison 1">
          </div>
          <div class="form-group">
            <label>Date de début</label>
            <input type="date" id="t-start" class="form-input">
          </div>
          <div class="form-group">
            <label>Date de fin</label>
            <input type="date" id="t-end" class="form-input">
          </div>
          <div class="form-group">
            <label>Max joueurs <span style="color:var(--text-muted)">(0 = illimité)</span></label>
            <input type="number" id="t-max" class="form-input" value="0" min="0">
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label>Description <span style="color:var(--text-muted)">(optionnel)</span></label>
            <textarea id="t-desc" class="form-textarea" placeholder="Règles, format, informations..."></textarea>
          </div>
        </div>

        <div style="margin-top:24px; display:flex; align-items:center; gap:16px;">
          <button id="btn-create-tournoi" style="
            background: linear-gradient(135deg, var(--green), var(--green-dim));
            color: var(--bg);
            border: none;
            padding: 12px 28px;
            font-family: 'Rajdhani', sans-serif;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
            border-radius: var(--radius);
            transition: opacity .2s;
          " onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            🏆 Créer le tournoi
          </button>
          <span style="font-size:11px; color:var(--text-muted); letter-spacing:1px;">* Champs obligatoires : nom, dates</span>
        </div>
      </div>
    `;
  }

  const archives = tournois?.filter(t => t.status !== 'active') || [];
  if (archives.length) {
    html += `
      <div style="
        background: var(--surface-2);
        border: 1px solid var(--border);
        padding: 20px;
        border-radius: var(--radius);
        margin-top: 16px;
      ">
        <div style="font-size:10px; letter-spacing:3px; color:var(--text-muted); font-weight:700; margin-bottom:16px;">📁 HISTORIQUE</div>
        <table class="data-table">
          <thead>
            <tr><th>Nom</th><th>Début</th><th>Fin</th><th>Statut</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${archives.map(t => `
              <tr>
                <td>${t.name}</td>
                <td>${formatDate(t.start_date)}</td>
                <td>${formatDate(t.end_date)}</td>
                <td style="color:${t.status === 'termine' ? 'var(--green-dim)' : 'var(--red)'}">
                  ${t.status}
                </td>
                <td>
                  <button class="btn btn-danger btn-sm" onclick="supprimerTournoi('${t.id}', '${t.name}')">
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = html;

  if (actif) {
    document.getElementById('btn-terminer')?.addEventListener('click', () => terminerTournoi(actif.id));
    document.getElementById('btn-annuler')?.addEventListener('click', () => annulerTournoi(actif.id));
  } else {
    document.getElementById('btn-create-tournoi')?.addEventListener('click', creerTournoi);
  }
}

async function creerTournoi() {
  const nom   = document.getElementById('t-nom').value.trim();
  const start = document.getElementById('t-start').value;
  const end   = document.getElementById('t-end').value;
  const max   = parseInt(document.getElementById('t-max').value) || 0;
  const desc  = document.getElementById('t-desc').value.trim();

  if (!nom || !start || !end) {
    setFeedback('❌ Remplis tous les champs obligatoires.'); return;
  }

  setFeedback('Création en cours...');

  await insertSupabase('tournaments', {
    name        : nom,
    start_date  : start,
    end_date    : end,
    max_players : max || null,
    description : desc || null,
    status      : 'active',
    created_at  : new Date().toISOString()
  });

  setFeedback('✅ Tournoi créé !');
  loadTournoi();
}

async function terminerTournoi(id) {
  showConfirm({
    title       : '🏁 Terminer le tournoi',
    message     : 'Es-tu sûr de vouloir terminer ce tournoi ? Cette action est irréversible.',
    confirmText : 'Terminer',
    cancelText  : 'Annuler',
    onConfirm   : async () => {
      await changerStatut(id, 'termine');
      setFeedback('✅ Tournoi terminé.');
      loadTournoi();
    }
  });
}

async function annulerTournoi(id) {
  showConfirm({
    title       : '❌ Annuler le tournoi',
    message     : 'Es-tu sûr de vouloir annuler ce tournoi ?',
    confirmText : 'Annuler le tournoi',
    cancelText  : 'Retour',
    onConfirm   : async () => {
      await changerStatut(id, 'annule');
      setFeedback('✅ Tournoi annulé.');
      loadTournoi();
    }
  });
}

async function changerStatut(id, statut) {
  await updateSupabase(`tournaments?id=eq.${id}`, { status: statut });
  loadTournoi();
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

  container.innerHTML = `
    <div class="card">
      <h3>👥 Inscrits — ${actif.name} (${entries.length})</h3>
      <table class="data-table">
        <thead><tr><th>Joueur</th><th>Discord ID</th><th>Inscrit le</th><th>Action</th></tr></thead>
        <tbody>
          ${entries.map(e => `
            <tr>
              <td>${e.username || '—'}</td>
              <td><code>${e.discord_id}</code></td>
              <td>${formatDate(e.created_at)}</td>
              <td><button class="btn btn-danger btn-sm" onclick="expulserJoueur('${e.id}')">❌ Expulser</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.expulserJoueur = function(id) {
  showConfirm({
    title       : '❌ Expulser le joueur',
    message     : 'Confirmes-tu l\'expulsion de ce joueur du tournoi ?',
    confirmText : 'Expulser',
    cancelText  : 'Annuler',
    onConfirm   : async () => {
      await updateSupabase(`tournament_entries?id=eq.${id}`, { status: 'expelled' });
      setFeedback('✅ Joueur expulsé.');
      loadInscrits();
    }
  });
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
    const borderColor = s.status === 'pending' ? 'var(--orange)' : s.status === 'validated' ? 'var(--green)' : 'var(--red)';
    html += `
      <div style="border-left:4px solid ${borderColor}; padding:12px; margin-bottom:12px; background:var(--surface-2); border-radius:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${s.discord_id}</strong> — ${formatDate(s.submitted_at)}
            <span style="margin-left:8px; font-size:11px; color:${borderColor};">[${s.status}]</span>
          </div>
          <div style="display:flex; gap:8px;">
            ${s.status === 'pending' ? `
              <button class="btn btn-primary btn-sm" onclick="validerSub('${s.id}')">✅ Valider</button>
              <button class="btn btn-danger btn-sm" onclick="rejeterSub('${s.id}')">❌ Rejeter</button>
            ` : ''}
          </div>
        </div>
        <div style="margin-top:8px; display:flex; gap:16px; font-size:13px;">
          <span>🎯 Kills: <strong>${s.kills ?? '—'}</strong></span>
          <span>💀 Deaths: <strong>${s.deaths ?? '—'}</strong></span>
          <span>📊 Score: <strong>${s.score ?? '—'}</strong></span>
          <span>📈 K/D: <strong>${s.kd ?? '—'}</strong></span>
        </div>
        ${s.image_url ? `
          <div style="margin-top:8px;">
            <a href="${s.image_url}" target="_blank">
              <img src="${s.image_url}" style="max-height:120px; border-radius:4px; cursor:pointer;">
            </a>
          </div>
        ` : ''}
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

  container.innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3>🏆 Scoreboard — ${actif.name}</h3>
        <button class="btn btn-primary btn-sm" onclick="refreshScoreboard()">🔄 Rafraîchir</button>
      </div>
      <table class="data-table">
        <thead><tr><th>#</th><th>Joueur</th><th>Kills</th><th>Deaths</th><th>K/D</th><th>Score</th></tr></thead>
        <tbody>
          ${scores.map((s, i) => `
            <tr ${i < 3 ? 'style="font-weight:bold"' : ''}>
              <td>${podium[i] || `#${i + 1}`}</td>
              <td>${s.username || s.discord_id}</td>
              <td>${s.kills ?? '—'}</td>
              <td>${s.deaths ?? '—'}</td>
              <td>${s.kd ?? '—'}</td>
              <td>${s.score ?? '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
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

  document.getElementById('btn-reset').addEventListener('click', () => {
    showConfirm({
      title       : '⚠️ Reset classement',
      message     : 'Cette action va remettre à zéro tous les kills, deaths, K/D et wins. Continuer ?',
      confirmText : 'Reset',
      cancelText  : 'Annuler',
      onConfirm   : async () => {
        setFeedback('Reset en cours...');
        const players = await fetchSupabase('players?select=discord_id');
        for (const p of players) {
          await updateSupabase(`players?discord_id=eq.${p.discord_id}`, { kills: 0, deaths: 0, kd: 0, wins: 0 });
        }
        setFeedback('✅ Classement reset');
      }
    });
  });
}

// ============================================
// WINDOW FUNCTIONS
// ============================================
window.supprimerTournoi = function(id, nom) {
  showConfirm({
    title       : '🗑️ Supprimer le tournoi',
    message     : `Supprimer définitivement "${nom}" de l'historique ? Cette action est irréversible.`,
    confirmText : 'Supprimer',
    cancelText  : 'Annuler',
    onConfirm   : async () => {
      // Supprime d'abord les enfants
      await deleteSupabase(`tournament_submissions?tournament_id=eq.${id}`);
      await deleteSupabase(`tournament_entries?tournament_id=eq.${id}`);
      await deleteSupabase(`tournament_scores?tournament_id=eq.${id}`);
      // Puis le tournoi
      await deleteSupabase(`tournaments?id=eq.${id}`);
      setFeedback('✅ Tournoi supprimé.');
      loadTournoi();
    }
  });
};

// ============================================
// HELPERS
// ============================================
async function getTournoiActif() {
  const tournois = await fetchSupabase('tournaments?status=eq.active&limit=1');
  return tournois?.[0] || null;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function setFeedback(msg) {
  const el = document.getElementById('tournament-feedback');
  if (el) el.textContent = msg;
}