import {
  loadConfigs,
  saveConfig,
  getConfig
} from '../services/configService.js';

// ============================================
// INIT
// ============================================

export async function initAutomod() {

  document.getElementById(
    'section-content'
  ).innerHTML = `

    <div class="panel">

      <div class="panel-header">
        <h2>🤖 Auto-Modération</h2>
      </div>

      <div class="panel-body">

        <div class="toggle-row">

          <div>

            <strong>
              Anti Spam
            </strong>

            <p>
              Bloque les messages spam
            </p>

          </div>

          <div
            class="toggle"
            id="toggle-antispam"
          ></div>

        </div>

        <div class="toggle-row">

          <div>

            <strong>
              Anti Liens
            </strong>

            <p>
              Supprime les liens
            </p>

          </div>

          <div
            class="toggle"
            id="toggle-links"
          ></div>

        </div>

        <div class="toggle-row">

          <div>

            <strong>
              Anti Caps
            </strong>

            <p>
              Détecte les majuscules abusives
            </p>

          </div>

          <div
            class="toggle"
            id="toggle-caps"
          ></div>

        </div>

        <div
          class="form-group"
          style="margin-top:20px"
        >

          <label>
            Mots interdits
          </label>

          <textarea
            id="banned-words"
            class="form-textarea"
            rows="4"
            placeholder="mot1, mot2, mot3"
          ></textarea>

        </div>

      </div>

      <div class="panel-footer">

        <button
          class="btn btn-primary"
          id="save-automod"
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

  setToggle(
    'toggle-antispam',
    getConfig(
      configs,
      'automod_antispam'
    )
  );

  setToggle(
    'toggle-links',
    getConfig(
      configs,
      'automod_links'
    )
  );

  setToggle(
    'toggle-caps',
    getConfig(
      configs,
      'automod_caps'
    )
  );

  document.getElementById(
    'banned-words'
  ).value =

    getConfig(
      configs,
      'automod_words'
    ) || '';

  // ============================================
  // EVENTS
  // ============================================

  bindToggle('toggle-antispam');
  bindToggle('toggle-links');
  bindToggle('toggle-caps');

  document
    .getElementById('save-automod')
    .addEventListener(
      'click',
      saveAutomod
    );
}

// ============================================
// TOGGLES
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

function setToggle(
  id,
  value
) {

  if (value === true) {

    document
      .getElementById(id)
      .classList.add('on');
  }
}

// ============================================
// SAVE
// ============================================

async function saveAutomod() {

  await saveConfig(

    'automod_antispam',

    document
      .getElementById(
        'toggle-antispam'
      )
      .classList.contains('on')
  );

  await saveConfig(

    'automod_links',

    document
      .getElementById(
        'toggle-links'
      )
      .classList.contains('on')
  );

  await saveConfig(

    'automod_caps',

    document
      .getElementById(
        'toggle-caps'
      )
      .classList.contains('on')
  );

  await saveConfig(

    'automod_words',

    document.getElementById(
      'banned-words'
    ).value
  );

  alert(
    '✅ AutoMod sauvegardé'
  );
}