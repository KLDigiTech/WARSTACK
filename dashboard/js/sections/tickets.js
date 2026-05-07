import {
  loadConfigs,
  saveConfig,
  getConfig
} from '../services/configService.js';

// ============================================
// INIT
// ============================================

export async function initTickets() {

  document.getElementById(
    'section-content'
  ).innerHTML = `

    <div class="panel">

      <div class="panel-header">
        <h2>🎫 Tickets</h2>
      </div>

      <div class="panel-body">

        <div class="form-grid">

          <div class="form-group">

            <label>
              Catégorie tickets
            </label>

            <input
              type="text"
              id="tickets-category"
              class="form-input"
              placeholder="TICKETS"
            >

          </div>

          <div class="form-group">

            <label>
              Salon création
            </label>

            <input
              type="text"
              id="tickets-channel"
              class="form-input"
              placeholder="ouvrir-ticket"
            >

          </div>

          <div class="form-group">

            <label>
              Rôle staff
            </label>

            <input
              type="text"
              id="tickets-role"
              class="form-input"
              placeholder="Staff"
            >

          </div>

          <div class="form-group">

            <label>
              Salon logs
            </label>

            <input
              type="text"
              id="tickets-logs"
              class="form-input"
              placeholder="logs-tickets"
            >

          </div>

          <div class="form-group full">

            <label>
              Message ouverture
            </label>

            <textarea
              id="tickets-message"
              class="form-textarea"
              rows="4"
              placeholder="Clique sur le bouton pour ouvrir un ticket."
            ></textarea>

          </div>

        </div>

      </div>

      <div class="panel-footer">

        <button
          class="btn btn-primary"
          id="save-tickets"
        >
          Sauvegarder
        </button>

      </div>

    </div>

  `;

  // ============================================
  // LOAD CONFIGS
  // ============================================

  const configs =
    await loadConfigs();

  document.getElementById(
    'tickets-category'
  ).value =

    getConfig(
      configs,
      'tickets_category'
    ) || '';

  document.getElementById(
    'tickets-channel'
  ).value =

    getConfig(
      configs,
      'tickets_channel'
    ) || '';

  document.getElementById(
    'tickets-role'
  ).value =

    getConfig(
      configs,
      'tickets_role'
    ) || '';

  document.getElementById(
    'tickets-logs'
  ).value =

    getConfig(
      configs,
      'tickets_logs'
    ) || '';

  document.getElementById(
    'tickets-message'
  ).value =

    getConfig(
      configs,
      'tickets_message'
    ) || '';

  // ============================================
  // EVENTS
  // ============================================

  document
    .getElementById('save-tickets')
    .addEventListener(
      'click',
      saveTickets
    );
}

// ============================================
// SAVE
// ============================================

async function saveTickets() {

  await saveConfig(

    'tickets_category',

    document.getElementById(
      'tickets-category'
    ).value
  );

  await saveConfig(

    'tickets_channel',

    document.getElementById(
      'tickets-channel'
    ).value
  );

  await saveConfig(

    'tickets_role',

    document.getElementById(
      'tickets-role'
    ).value
  );

  await saveConfig(

    'tickets_logs',

    document.getElementById(
      'tickets-logs'
    ).value
  );

  await saveConfig(

    'tickets_message',

    document.getElementById(
      'tickets-message'
    ).value
  );

  alert(
    '✅ Tickets sauvegardés'
  );
}