import {
  BOT_URL,
  GUILD_ID
} from '../config.js';

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

            <select class="form-select">

              <option>
                Français
              </option>

              <option>
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
              class="form-input"
              placeholder="!"
            >

          </div>

        </div>

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
}