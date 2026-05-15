// ============================================
// SECTION — tournament.js
// ============================================

import {
  fetchSupabase,
  updateSupabase,
  insertSupabase,
  deleteSupabase,
  callBotAPI
} from '../api.js';

import { showConfirm } from '../ui/confirm.js';

export async function initTournament() {

  document.getElementById('section-content').innerHTML = `

    <div class="panel">

      <div class="panel-header">

        <h2>🏆 Gestion Tournoi</h2>

        <div class="panel-tabs">

          <button class="tab-btn active" data-tab="tournoi">
            Tournoi
          </button>

          <button class="tab-btn" data-tab="inscrits">
            Inscrits
          </button>

          <button class="tab-btn" data-tab="soumissions">
            Soumissions
          </button>

          <button class="tab-btn" data-tab="scoreboard">
            Scoreboard
          </button>

          <button class="tab-btn" data-tab="outils">
            Outils
          </button>

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

      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
      });

      document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.add('hidden');
      });

      btn.classList.add('active');

      document
        .getElementById(`tab-${btn.dataset.tab}`)
        .classList.remove('hidden');

      loadTab(btn.dataset.tab);

    });

  });

  loadTab('tournoi');

}

// ============================================
// LOAD TAB
// ============================================

async function loadTab(tab) {

  switch (tab) {

    case 'tournoi':
      return loadTournoi();

    case 'inscrits':
      return loadInscrits();

    case 'soumissions':
      return loadSoumissions();

    case 'scoreboard':
      return loadScoreboard();

    case 'outils':
      return loadOutils();

  }

}

// ============================================
// ONGLET TOURNOI
// ============================================

async function loadTournoi() {

  const container =
    document.getElementById('tab-tournoi');

  container.innerHTML =
    '<p>Chargement...</p>';

  const tournois =
    await fetchSupabase(
      'tournaments?order=created_at.desc&limit=20'
    );

  const actif =
    tournois?.find(t => t.status === 'active');

  let html = '';

  if (actif) {

    html += `

      <div class="tournament-active-card">

        <div class="tournament-active-top">

          <div>

            <div class="tournament-badge-active">
              🟢 TOURNOI ACTIF
            </div>

            <h2 class="tournament-active-title">
              ${actif.name}
            </h2>

            <div class="tournament-stats">

              <div class="tournament-stat">

                <span class="tournament-stat-label">
                  DÉBUT
                </span>

                <span class="tournament-stat-value">
                  ${formatDate(actif.start_date)}
                </span>

              </div>

              <div class="tournament-stat">

                <span class="tournament-stat-label">
                  FIN
                </span>

                <span class="tournament-stat-value">
                  ${formatDate(actif.end_date)}
                </span>

              </div>

              <div class="tournament-stat">

                <span class="tournament-stat-label">
                  MAX JOUEURS
                </span>

                <span class="tournament-stat-value">
                  ${actif.max_players || '∞'}
                </span>

              </div>

            </div>

            ${actif.description ? `

              <p class="tournament-description">
                ${actif.description}
              </p>

            ` : ''}

          </div>

          <div class="tournament-actions-column">

            <button class="btn btn-danger" id="btn-terminer">
              🏁 Terminer
            </button>

            <button class="btn btn-secondary" id="btn-annuler">
              ❌ Annuler
            </button>

          </div>

        </div>

      </div>

    `;

  } else {

    html += `

      <div class="tournament-create-card">

        <div class="tournament-create-header">
          ➕ CRÉER UN TOURNOI
        </div>

        <div class="tournament-form-grid">

          <div class="form-group full">

            <label>
              Nom du tournoi
            </label>

            <input
              type="text"
              id="t-nom"
              class="form-input"
              placeholder="ex: Tournoi PöF — Saison 1"
            >

          </div>

          <div class="form-group">

            <label>
              Date de début
            </label>

            <input
              type="date"
              id="t-start"
              class="form-input"
            >

          </div>

          <div class="form-group">

            <label>
              Date de fin
            </label>

            <input
              type="date"
              id="t-end"
              class="form-input"
            >

          </div>

          <div class="form-group">

            <label>
              Max joueurs
              <span class="muted">
                (0 = illimité)
              </span>
            </label>

            <input
              type="number"
              id="t-max"
              class="form-input"
              value="0"
              min="0"
            >

          </div>

          <div class="form-group full">

            <label>
              Description
              <span class="muted">
                (optionnel)
              </span>
            </label>

            <textarea
              id="t-desc"
              class="form-textarea"
              placeholder="Règles, format, informations..."
            ></textarea>

          </div>

        </div>

        <div class="tournament-actions">

          <button
            id="btn-create-tournoi"
            class="btn btn-primary"
          >
            <i class="fas fa-trophy"></i>
            Créer le tournoi
          </button>

          <span class="form-helper">
            * Champs obligatoires : nom, dates
          </span>

        </div>

      </div>

    `;

  }

  const archives =
    tournois?.filter(t => t.status !== 'active') || [];

  if (archives.length) {

    html += `

      <div class="tournament-history-card">

        <div class="tournament-history-title">
          📁 HISTORIQUE
        </div>

        <table class="data-table">

          <thead>

            <tr>

              <th>Nom</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Statut</th>
              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            ${archives.map(t => `

              <tr>

                <td>${t.name}</td>

                <td>
                  ${formatDate(t.start_date)}
                </td>

                <td>
                  ${formatDate(t.end_date)}
                </td>

                <td class="
                  ${t.status === 'termine'
                    ? 'status-green'
                    : 'status-red'}
                ">
                  ${t.status}
                </td>

                <td>

                  <button
                    class="btn btn-danger btn-sm"
                    onclick="supprimerTournoi('${t.id}', '${t.name}')"
                  >
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

    document
      .getElementById('btn-terminer')
      ?.addEventListener('click', () => {
        terminerTournoi(actif.id);
      });

    document
      .getElementById('btn-annuler')
      ?.addEventListener('click', () => {
        annulerTournoi(actif.id);
      });

  } else {

    document
      .getElementById('btn-create-tournoi')
      ?.addEventListener('click', creerTournoi);

  }

}

// ============================================
// CREATE
// ============================================

async function creerTournoi() {

  const nom =
    document.getElementById('t-nom').value.trim();

  const start =
    document.getElementById('t-start').value;

  const end =
    document.getElementById('t-end').value;

  const max =
    parseInt(
      document.getElementById('t-max').value
    ) || 0;

  const desc =
    document.getElementById('t-desc').value.trim();

  if (!nom || !start || !end) {

    setFeedback(
      '❌ Remplis tous les champs obligatoires.'
    );

    return;

  }

  setFeedback('Création en cours...');

  await insertSupabase('tournaments', {

    name: nom,

    start_date: start,

    end_date: end,

    max_players: max || null,

    description: desc || null,

    status: 'active',

    created_at: new Date().toISOString()

  });

  setFeedback('✅ Tournoi créé !');

  loadTournoi();

}

// ============================================
// ACTIONS
// ============================================

async function terminerTournoi(id) {

  showConfirm({

    title:
      '🏁 Terminer le tournoi',

    message:
      'Es-tu sûr de vouloir terminer ce tournoi ?',

    confirmText:
      'Terminer',

    cancelText:
      'Annuler',

    onConfirm:
      async () => {

        await changerStatut(id, 'termine');

        setFeedback(
          '✅ Tournoi terminé.'
        );

        loadTournoi();

      }

  });

}

async function annulerTournoi(id) {

  showConfirm({

    title:
      '❌ Annuler le tournoi',

    message:
      'Es-tu sûr de vouloir annuler ce tournoi ?',

    confirmText:
      'Annuler le tournoi',

    cancelText:
      'Retour',

    onConfirm:
      async () => {

        await changerStatut(id, 'annule');

        setFeedback(
          '✅ Tournoi annulé.'
        );

        loadTournoi();

      }

  });

}

async function changerStatut(id, statut) {

  await updateSupabase(
    `tournaments?id=eq.${id}`,
    { status: statut }
  );

  loadTournoi();

}

// ============================================
// ONGLET OUTILS
// ============================================

async function loadOutils() {

  const container =
    document.getElementById('tab-outils');

  container.innerHTML = `

    <div class="card">

      <h3>🔧 Outils</h3>

      <div class="actions-grid">

        <button
          class="btn btn-primary"
          id="btn-leaderboard"
        >
          <i class="fas fa-sync"></i>
          Forcer leaderboard
        </button>

        <button
          class="btn btn-orange"
          id="btn-mvp"
        >
          <i class="fas fa-star"></i>
          Poster MVP
        </button>

        <button
          class="btn btn-danger"
          id="btn-reset"
        >
          <i class="fas fa-redo"></i>
          Reset classement
        </button>

      </div>

    </div>

  `;

}

// ============================================
// HELPERS
// ============================================

async function getTournoiActif() {

  const tournois =
    await fetchSupabase(
      'tournaments?status=eq.active&limit=1'
    );

  return tournois?.[0] || null;

}

function formatDate(d) {

  if (!d) return '—';

  return new Date(d)
    .toLocaleDateString('fr-FR');

}

function setFeedback(msg) {

  const el =
    document.getElementById(
      'tournament-feedback'
    );

  if (el) {
    el.textContent = msg;
  }

}