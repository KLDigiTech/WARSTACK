import {
  BOT_URL,
  GUILD_ID
} from '../config.js';

import {
  loadConfigs,
  saveConfig,
  getConfig
} from '../services/configService.js';

// ============================================
// INIT
// ============================================

export async function initSettings() {

  document.getElementById(
    'section-content'
  ).innerHTML = `

    <div class="panel">

      <div class="panel-header">
        <h2>⚙️ Paramètres</h2>
      </div>

      <div class="panel-body">

        <div class="form-grid">

          <div class="form-group">

            <label>
              Langue
            </label>

            <select
              id="settings-language"
              class="form-select"
            >

              <option value="fr">
                Français
              </option>

              <option value="en">
                English
              </option>

            </select>

          </div>

          <div class="form-group">

            <label>
              Préfixe
            </label>

            <input
              type="text"
              id="settings-prefix"
              class="form-input"
              placeholder="!"
            >

          </div>

        </div>

      </div>

      <div class="panel-footer">

        <button
          class="btn btn-primary"
          id="save-settings"
        >
          Sauvegarder
        </button>

      </div>

    </div>

    <div class="panel">

      <div class="panel-header">
        <h2>🔑 API</h2>
      </div>

      <div class="panel-body">

        <div class="form-grid">

          <div class="form-group full">

            <label>
              BOT URL
            </label>

            <input
              type="text"
              class="form-input"
              value="${BOT_URL}"
              disabled
            >

          </div>

          <div class="form-group full">

            <label>
              GUILD ID
            </label>

            <input
              type="text"
              class="form-input"
              value="${GUILD_ID}"
              disabled
            >

          </div>

        </div>

      </div>

    </div>

  `;

  // ============================================
  // LOAD CONFIGS
  // ============================================

  const configs =
    await loadConfigs();

  document.getElementById(
    'settings-language'
  ).value =

    getConfig(
      configs,
      'settings_language'
    ) || 'fr';

  document.getElementById(
    'settings-prefix'
  ).value =

    getConfig(
      configs,
      'settings_prefix'
    ) || '!';

  // ============================================
  // EVENTS
  // ============================================

  document
    .getElementById('save-settings')
    .addEventListener(
      'click',
      saveSettings
    );
}

// ============================================
// SAVE
// ============================================

async function saveSettings() {

  await saveConfig(

    'settings_language',

    document.getElementById(
      'settings-language'
    ).value
  );

  await saveConfig(

    'settings_prefix',

    document.getElementById(
      'settings-prefix'
    ).value
  );

  alert(
    '✅ Paramètres sauvegardés'
  );
}