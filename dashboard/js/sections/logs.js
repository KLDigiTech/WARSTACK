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

          <div
            class="toggle"
            id="toggle-delete"
          ></div>

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

          <div
            class="toggle"
            id="toggle-edit"
          ></div>

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

          <div
            class="toggle"
            id="toggle-sanctions"
          ></div>

        </div>

      </div>

    </div>

  `;

  bindToggle('toggle-delete');
  bindToggle('toggle-edit');
  bindToggle('toggle-sanctions');
}

// ============================================
// TOGGLE
// ============================================

function bindToggle(id) {

  document
    .getElementById(id)
    .addEventListener(
      'click',
      () => {

        document
          .getElementById(id)
          .classList.toggle('on');
      }
    );
}