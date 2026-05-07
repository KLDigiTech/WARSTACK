export async function initLogs() {

  document.getElementById(
    'section-content'
  ).innerHTML = `

    <div class="panel">

      <div class="panel-header">
        <h2>📋 Logs</h2>
      </div>

      <div class="panel-body">

        <div class="form-group">

          <label>
            Salon logs
          </label>

          <input
            type="text"
            class="form-input"
            placeholder="logs"
          >

        </div>

        <div
          class="toggle-row"
          style="margin-top:20px"
        >

          <div>

            <strong>
              Logs suppressions
            </strong>

            <p>
              Messages supprimés
            </p>

          </div>

          <div class="toggle"></div>

        </div>

        <div class="toggle-row">

          <div>

            <strong>
              Logs éditions
            </strong>

            <p>
              Messages modifiés
            </p>

          </div>

          <div class="toggle"></div>

        </div>

        <div class="toggle-row">

          <div>

            <strong>
              Logs sanctions
            </strong>

            <p>
              Bans et kicks
            </p>

          </div>

          <div class="toggle"></div>

        </div>

      </div>

    </div>

  `;
}