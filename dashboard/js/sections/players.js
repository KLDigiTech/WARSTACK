import {
  fetchSupabase,
  updateSupabase,
  deleteSupabase
} from '../api.js';

import { createPanel }
from '../components/panel.js';

import { createTable }
from '../components/table.js';

import { createActionButtons }
from '../components/actionButtons.js';

let allPlayers = [];

// ============================================
// INIT
// ============================================

export async function initPlayers() {

  const content =
    document.getElementById(
      'section-content'
    );

  content.innerHTML = `

    ${createPanel({

      title: '👥 Joueurs inscrits',

      body: `

        <div class="search-box">

          <i class="fas fa-search"></i>

          <input
            type="text"
            id="search-player"
            class="search-input"
            placeholder="Rechercher..."
          >

        </div>

        <div id="players-table-wrapper">

          <div class="loading-state">
            Chargement...
          </div>

        </div>

      `
    })}

  `;

  const players =
    await fetchSupabase(
      'players?select=*&order=kd.desc'
    );

  allPlayers = players || [];

  renderPlayersTable(allPlayers);

  document
    .getElementById('search-player')
    .addEventListener('input', (e) => {

      const q =
        e.target.value.toLowerCase();

      const filtered =
        allPlayers.filter(p =>

          p.pseudo_bf6
            ?.toLowerCase()
            .includes(q)

        );

      renderPlayersTable(filtered);
    });
}

// ============================================
// TABLE
// ============================================

function renderPlayersTable(players) {

  const wrapper =
    document.getElementById(
      'players-table-wrapper'
    );

  if (!players || players.length === 0) {

    wrapper.innerHTML = `

      <div class="empty-state">
        Aucun joueur trouvé
      </div>

    `;

    return;
  }

  wrapper.innerHTML = createTable({

    headers: [
      'Pseudo',
      'Plateforme',
      'K/D',
      'Kills',
      'Deaths',
      'Wins',
      'Actions'
    ],

    rows: players.map(p => `

      <tr>

        <td>
          <strong>
            ${p.pseudo_bf6}
          </strong>
        </td>

        <td>
          ${p.platform?.toUpperCase()}
        </td>

        <td>
          ${(p.kd || 0).toFixed(2)}
        </td>

        <td>
          ${p.kills || 0}
        </td>

        <td>
          ${p.deaths || 0}
        </td>

        <td>
          ${p.wins || 0}
        </td>

        <td>

          ${createActionButtons({

            edit: `
              window.editPlayer(
                '${p.discord_id}'
              )
            `,

            remove: `
              window.deletePlayer(
                '${p.discord_id}',
                '${p.pseudo_bf6}'
              )
            `
          })}

        </td>

      </tr>

    `).join('')

  });
}

// ============================================
// EDIT PLAYER
// ============================================

window.editPlayer = function(discordId) {

  const player =
    allPlayers.find(

      p =>
        p.discord_id === discordId

    );

  if (!player) return;

  const pseudo =
    prompt(
      'Modifier pseudo',
      player.pseudo_bf6
    );

  if (!pseudo) return;

  updatePlayer(
    discordId,
    pseudo
  );
};

// ============================================
// UPDATE PLAYER
// ============================================

async function updatePlayer(
  discordId,
  pseudo
) {

  await updateSupabase(

    `players?discord_id=eq.${discordId}`,

    {
      pseudo_bf6: pseudo
    }
  );

  initPlayers();
}

// ============================================
// DELETE PLAYER
// ============================================

window.deletePlayer = async function(
  discordId,
  pseudo
) {

  const confirmDelete =
    confirm(

      `Supprimer ${pseudo} ?`

    );

  if (!confirmDelete) {
    return;
  }

  await deleteSupabase(
    `players?discord_id=eq.${discordId}`
  );

  initPlayers();
};