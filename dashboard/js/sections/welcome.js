import {
  loadConfigs,
  saveConfig,
  getConfig
} from '../services/configService.js';

// ============================================
// INIT
// ============================================

export async function initWelcome() {

  const content =
    document.getElementById(
      'section-content'
    );

  content.innerHTML = `

    <div class="panel">

      <div class="panel-header">
        <h2>👋 Arrivées / Départs</h2>
      </div>

      <div class="panel-body">

        <div class="form-grid">

          <div class="form-group">

            <label>
              Salon bienvenue
            </label>

            <input
              type="text"
              id="welcome-channel"
              class="form-input"
              placeholder="bienvenue"
            >

          </div>

          <div class="form-group">

            <label>
              Salon départs
            </label>

            <input
              type="text"
              id="leave-channel"
              class="form-input"
              placeholder="départs"
            >

          </div>

          <div class="form-group full">

            <label>
              Message bienvenue
            </label>

            <textarea
              id="welcome-message"
              class="form-textarea"
              rows="4"
            ></textarea>

          </div>

          <div class="form-group full">

            <label>
              Message départ
            </label>

            <textarea
              id="leave-message"
              class="form-textarea"
              rows="4"
            ></textarea>

          </div>

        </div>

      </div>

      <div class="panel-footer">

        <button
          class="btn btn-primary"
          id="save-welcome"
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

  fillConfigs(configs);

  // ============================================
  // EVENTS
  // ============================================

  document
    .getElementById('save-welcome')
    .addEventListener(
      'click',
      saveWelcomeConfigs
    );
}

// ============================================
// HELPERS
// ============================================

function fillConfigs(configs) {

  document.getElementById(
    'welcome-channel'
  ).value =

    getConfig(
      configs,
      'welcome_channel'
    ) || '';

  document.getElementById(
    'leave-channel'
  ).value =

    getConfig(
      configs,
      'leave_channel'
    ) || '';

  document.getElementById(
    'welcome-message'
  ).value =

    getConfig(
      configs,
      'welcome_message'
    ) || '';

  document.getElementById(
    'leave-message'
  ).value =

    getConfig(
      configs,
      'leave_message'
    ) || '';
}

// ============================================
// SAVE
// ============================================

async function saveWelcomeConfigs() {

  await saveConfig(

    'welcome_channel',

    document.getElementById(
      'welcome-channel'
    ).value
  );

  await saveConfig(

    'leave_channel',

    document.getElementById(
      'leave-channel'
    ).value
  );

  await saveConfig(

    'welcome_message',

    document.getElementById(
      'welcome-message'
    ).value
  );

  await saveConfig(

    'leave_message',

    document.getElementById(
      'leave-message'
    ).value
  );

  alert(
    '✅ Config sauvegardée'
  );
}