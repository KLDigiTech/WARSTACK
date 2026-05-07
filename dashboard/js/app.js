import { initModal } from './ui/modal.js';

import { $ } from './utils/dom.js';

import {
  getBotStatus
} from './services/botService.js';

console.log('WARSTACK Dashboard Loaded');

// ============================================
// HELPERS
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

setInterval(updateClock, 1000);

updateClock();

// ============================================
// BOT STATUS
// ============================================

async function checkBotStatus() {

  const data =
    await getBotStatus();

  const dot =
    $('#status-dot');

  const label =
    $('#status-label');

  if (data?.status === 'online') {

    dot?.classList.add('online');

    label.textContent =
      'BOT ONLINE';

  } else {

    dot?.classList.remove('online');

    label.textContent =
      'BOT OFFLINE';
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
    .forEach(i => i.classList.remove('active'));

  const item = document.querySelector(
    `[data-section="${section}"]`
  );

  if (!item) return;

  item.classList.add('active');

  $('#section-title').textContent =
    item.querySelector('span').textContent;

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

document
  .querySelectorAll('.nav-item')
  .forEach(item => {

    item.addEventListener(
      'click',
      (e) => {

        e.preventDefault();

        navigate(
          item.dataset.section
        );
      }
    );
  });

// ============================================
// INIT
// ============================================

const initialSection =

  window.location.hash
    ?.replace('#', '')

  || 'overview';

navigate(initialSection);