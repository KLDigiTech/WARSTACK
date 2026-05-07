import {
  fetchSupabase,
  updateSupabase,
  callBotAPI
} from '../api.js';

export async function initTournament() {

  document.getElementById(
    'section-content'
  ).innerHTML = `

    <div class="panel">

      <div class="panel-header">
        <h2>🏆 Gestion Tournoi</h2>
      </div>

      <div class="panel-body">

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

        <div
          id="tournament-feedback"
          class="feedback"
        ></div>

      </div>

    </div>

  `;

  document
    .getElementById('btn-leaderboard')
    .addEventListener('click', postLeaderboard);

  document
    .getElementById('btn-mvp')
    .addEventListener('click', postMVP);

  document
    .getElementById('btn-reset')
    .addEventListener('click', resetTournament);
}

async function postLeaderboard() {

  const feedback =
    document.getElementById(
      'tournament-feedback'
    );

  feedback.textContent =
    'Envoi du leaderboard...';

  const data =
    await callBotAPI(
      'leaderboard',
      'POST'
    );

  feedback.textContent =
    data?.success
      ? '✅ Leaderboard envoyé'
      : '❌ Erreur bot';
}

async function postMVP() {

  const feedback =
    document.getElementById(
      'tournament-feedback'
    );

  feedback.textContent =
    'Publication MVP...';

  const data =
    await callBotAPI(
      'mvp',
      'POST'
    );

  feedback.textContent =
    data?.success
      ? '✅ MVP publié'
      : '❌ Erreur bot';
}

async function resetTournament() {

  const confirmReset =
    confirm(
      'Reset tout le classement ?'
    );

  if (!confirmReset) {
    return;
  }

  const feedback =
    document.getElementById(
      'tournament-feedback'
    );

  feedback.textContent =
    'Reset en cours...';

  const players =
    await fetchSupabase(
      'players?select=discord_id'
    );

  for (const p of players) {

    await updateSupabase(
      `players?discord_id=eq.${p.discord_id}`,
      {
        kills: 0,
        deaths: 0,
        kd: 0,
        wins: 0
      }
    );
  }

  feedback.textContent =
    '✅ Classement reset';
}