// ============================================
// inscription.js
// Logique — page inscription tournoi publique
// ============================================

import { SUPABASE_URL, SUPABASE_KEY, BOT_URL } from './config.js';

// ============================================
// STATE
// ============================================
let tournoiActif = null;
let selectedTeam = null;
let psnVerified  = false;
let psnFallback  = false;
let trackerId    = null;

// ============================================
// SUPABASE HELPER
// ============================================
async function sb(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'apikey'        : SUPABASE_KEY,
      'Authorization' : `Bearer ${SUPABASE_KEY}`,
      'Content-Type'  : 'application/json',
      'Prefer'        : 'return=representation'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ============================================
// STATES
// ============================================
function showState(id) {
  ['state-loading', 'state-no-tournoi', 'state-form', 'state-success'].forEach(s => {
    document.getElementById(s).classList.remove('visible');
  });
  document.getElementById(id).classList.add('visible');
}

// ============================================
// INIT
// ============================================
async function init() {
  try {
    const tournois = await sb('tournaments?status=eq.active&limit=1');

    if (!tournois || tournois.length === 0) {
      showState('state-no-tournoi');
      return;
    }

    tournoiActif = tournois[0];

    document.getElementById('tournoi-name').textContent = tournoiActif.name;
    const start = new Date(tournoiActif.start_date).toLocaleDateString('fr-FR');
    const end   = new Date(tournoiActif.end_date).toLocaleDateString('fr-FR');
    document.getElementById('tournoi-dates').textContent = `Du ${start} au ${end}`;

    // Teams
    const teams = Array.isArray(tournoiActif.teams) ? tournoiActif.teams : [];
    if (teams.length > 0) {
      document.getElementById('team-zone').style.display = 'block';
      const grid = document.getElementById('teams-grid');
      grid.innerHTML = '';
      teams.forEach(team => {
        const btn = document.createElement('button');
        btn.className = 'team-btn';
        btn.textContent = team;
        btn.onclick = () => selectTeam(team, btn);
        grid.appendChild(btn);
      });
    }

    showState('state-form');

  } catch(e) {
    console.error(e);
    showState('state-no-tournoi');
  }
}

// ============================================
// VERIFY PSN
// ============================================
async function verifyPSN() {
  const psn  = document.getElementById('psn-input').value.trim();
  if (!psn) return;

  const hint     = document.getElementById('psn-hint');
  const btnV     = document.getElementById('btn-verify');
  const fallback = document.getElementById('fallback-box');

  // Reset
  psnVerified = false;
  psnFallback = false;
  trackerId   = null;
  fallback.classList.remove('visible');
  hint.style.display = 'block';
  hint.className = 'hint info';
  hint.innerHTML = '<span class="spinner"></span> Vérification sur tracker.gg...';
  btnV.disabled = true;
  checkSubmit();

  // Vérif doublon
  try {
    const existing = await sb(`tournament_entries?tournament_id=eq.${tournoiActif.id}&username=eq.${encodeURIComponent(psn)}`);
    if (existing && existing.length > 0) {
      hint.className = 'hint err';
      hint.textContent = '⚠ Ce pseudo est déjà inscrit à ce tournoi.';
      btnV.disabled = false;
      return;
    }
  } catch(e) { /* continue */ }

  // Appel route tracker
  try {
    const res  = await fetch(`${BOT_URL}/tracker/${encodeURIComponent(psn)}`);
    const data = await res.json();

    if (data.found) {
      psnVerified = true;
      trackerId   = data.tracker_id || null;
      hint.className = 'hint ok';
      hint.textContent = `✅ Profil trouvé : ${psn}`;
    } else {
      psnFallback = true;
      hint.className = 'hint warn';
      hint.textContent = '⚠ Profil non trouvé sur tracker.gg.';
      fallback.classList.add('visible');
    }
  } catch(e) {
    psnFallback = true;
    hint.className = 'hint warn';
    hint.textContent = '⚠ Impossible de vérifier — entre ton Discord pour validation manuelle.';
    fallback.classList.add('visible');
  }

  btnV.disabled = false;
  checkSubmit();
}

// ============================================
// SELECT TEAM
// ============================================
function selectTeam(team, btn) {
  selectedTeam = team;
  document.querySelectorAll('.team-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('team-hint').style.display = 'none';
  checkSubmit();
}

// ============================================
// CHECK SUBMIT
// ============================================
function checkSubmit() {
  const hasPsn    = psnVerified || psnFallback;
  const teams     = Array.isArray(tournoiActif?.teams) ? tournoiActif.teams : [];
  const needsTeam = teams.length > 0;
  const hasTeam   = selectedTeam !== null;
  document.getElementById('btn-submit').disabled = !(hasPsn && (!needsTeam || hasTeam));
}

// ============================================
// SUBMIT
// ============================================
async function submitInscription() {
  const psn     = document.getElementById('psn-input').value.trim();
  const discord = document.getElementById('discord-input')?.value.trim() || null;
  const btn     = document.getElementById('btn-submit');
  const hint    = document.getElementById('psn-hint');

  if (psnFallback && !discord) {
    hint.className = 'hint err';
    hint.textContent = '⚠ Entre ton pseudo Discord pour valider ton inscription.';
    hint.style.display = 'block';
    return;
  }

  const teams = Array.isArray(tournoiActif?.teams) ? tournoiActif.teams : [];
  if (teams.length > 0 && !selectedTeam) {
    document.getElementById('team-hint').style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'INSCRIPTION EN COURS...';

  try {
    await sb('tournament_entries', 'POST', {
      tournament_id    : tournoiActif.id,
      discord_id       : null,
      username         : psn,
      tracker_id       : trackerId,
      team_name        : selectedTeam || null,
      discord_username : psnFallback ? discord : null,
      verified         : psnVerified,
      status           : psnVerified ? 'active' : 'pending',
      created_at       : new Date().toISOString()
    });

    const teamLine   = selectedTeam ? `<br>TEAM &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span>${selectedTeam}</span>` : '';
    const pendingNote = !psnVerified
      ? `<div class="pending-note">⏳ En attente de validation par un orga (profil PSN non vérifié).</div>`
      : '';

    document.getElementById('success-recap').innerHTML =
      `TOURNOI &nbsp;&nbsp; <span>${tournoiActif.name}</span><br>` +
      `JOUEUR &nbsp;&nbsp;&nbsp; <span>${psn}</span>` +
      teamLine + pendingNote;

    showState('state-success');

  } catch(e) {
    btn.disabled = false;
    btn.textContent = "S'INSCRIRE AU TOURNOI";
    hint.className = 'hint err';
    hint.style.display = 'block';
    hint.textContent = '❌ Erreur lors de l\'inscription. Réessaie ou contacte un orga.';
    console.error(e);
  }
}

// ============================================
// BOOT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('psn-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyPSN();
  });
  document.getElementById('btn-verify').addEventListener('click', verifyPSN);
  document.getElementById('btn-submit').addEventListener('click', submitInscription);
  init();
});