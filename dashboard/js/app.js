// ============================================
// app.js
// ============================================

import { initModal } from './ui/modal.js';

import { $ } from './utils/dom.js';

import {
  getBotStatus
} from './services/botService.js';

import {
  getUserPermissions
} from './services/permissionService.js';

console.log('WARSTACK Dashboard Loaded');

// ============================================
// INIT
// ============================================

initModal();

// ============================================
// CLOCK
// ============================================

function updateClock() {

  const now = new Date();

  $('#current-time').textContent =
    `${now.toLocaleTimeString('fr-FR')} — ${now.toLocaleDateString('fr-FR')}`;
}

setInterval(
  updateClock,
  1000
);

updateClock();

// ============================================
// BOT STATUS
// ============================================

async function checkBotStatus() {

  try {

    const data =
      await getBotStatus();

    const dot =
      $('#status-dot');

    const label =
      $('#status-label');

    if (data?.status === 'online') {

      dot?.classList.add(
        'online'
      );

      label.textContent =
        'BOT ONLINE';

    } else {

      dot?.classList.remove(
        'online'
      );

      label.textContent =
        'BOT OFFLINE';
    }

  } catch (err) {

    console.error(
      'Bot status error:',
      err
    );
  }
}

checkBotStatus();

setInterval(
  checkBotStatus,
  30000
);

// ============================================
// SECTIONS
// ============================================

const sections = {

  overview: async () =>
    (await import('./sections/overview.js'))
      .initOverview(),

  players: async () =>
    (await import('./sections/players.js'))
      .initPlayers(),

  tournament: async () =>
    (await import('./sections/tournament.js'))
      .initTournament(),

  welcome: async () =>
    (await import('./sections/welcome.js'))
      .initWelcome(),

  roles: async () =>
    (await import('./sections/roles.js'))
      .initRoles(),

  birthdays: async () =>
    (await import('./sections/birthdays.js'))
      .initBirthdays(),

  suggestions: async () =>
    (await import('./sections/suggestions.js'))
      .initSuggestions(),

  moderation: async () =>
    (await import('./sections/moderation.js'))
      .initModeration(),

  automod: async () =>
    (await import('./sections/automod.js'))
      .initAutomod(),

  tickets: async () =>
    (await import('./sections/tickets.js'))
      .initTickets(),

  logs: async () =>
    (await import('./sections/logs.js'))
      .initLogs(),

  messages: async () =>
    (await import('./sections/messages.js'))
      .initMessages(),

  reactions: async () =>
    (await import('./sections/reactions.js'))
      .initReactions(),

  channels: async () =>
    (await import('./sections/channels.js'))
      .initChannels(),

  access: async () =>
    (await import('./sections/access.js'))
      .initAccess(),

  settings: async () =>
    (await import('./sections/settings.js'))
      .initSettings()
};

// ============================================
// ROUTER
// ============================================

async function navigate(section) {

  document
    .querySelectorAll('.nav-item')
    .forEach(item => {

      item.classList.remove(
        'active'
      );
    });

  const item =
    document.querySelector(
      `[data-section="${section}"]`
    );

  if (!item) {
    return;
  }

  item.classList.add(
    'active'
  );

  $('#section-title').textContent =
    item.querySelector('span')
      ?.textContent || '';

  const render =
    sections[section];

  if (render) {

    $('#section-content').innerHTML = `

      <div class="loading-screen">
        CHARGEMENT...
      </div>

    `;

    await render();
  }

  window.location.hash =
    section;
}

// ============================================
// PERMISSIONS
// ============================================

async function applyPermissions() {

  try {

    const permissions =
      await getUserPermissions();

    console.log(
      'Permissions:',
      permissions
    );

    // SI aucune permission => tout afficher
    if (
      !permissions ||
      permissions.length === 0
    ) {

      console.warn(
        'Aucune permission trouvée'
      );

      document
        .querySelectorAll('.nav-item')
        .forEach(item => {

          item.style.display =
            'flex';
        });

      return;
    }

    document
      .querySelectorAll('.nav-item')
      .forEach(item => {

        const section =
          item.dataset.section;

        if (!section) {
          return;
        }

        // overview toujours visible
        if (section === 'overview') {

          item.style.display =
            'flex';

          return;
        }

        const hasPermission =
          permissions.includes(
            section
          );

        item.style.display =
          hasPermission
            ? 'flex'
            : 'none';
      });

  } catch (err) {

    console.error(
      'Permissions error:',
      err
    );

    // sécurité => tout afficher
    document
      .querySelectorAll('.nav-item')
      .forEach(item => {

        item.style.display =
          'flex';
      });
  }
}

// ============================================
// NAV EVENTS
// ============================================

document
  .querySelectorAll('.nav-item')
  .forEach(item => {

    item.addEventListener(
      'click',
      async (e) => {

        e.preventDefault();

        const section =
          item.dataset.section;

        await navigate(
          section
        );
      }
    );
  });

// ============================================
// INIT DASHBOARD
// ============================================

async function initDashboard() {

  await applyPermissions();

  const initialSection =

    window.location.hash
      ?.replace('#', '')

    || 'overview';

  await navigate(
    initialSection
  );
}
const userMenu =
  document.getElementById('user-menu');

const userDropdown =
  document.getElementById('user-dropdown');

if (
  userMenu &&
  userDropdown
){

  userMenu.addEventListener(
    'click',
    () => {

      userDropdown.classList.toggle(
        'open'
      );

      userMenu.classList.toggle(
        'user-menu-open'
      );
    }
  );
}
initDashboard();

