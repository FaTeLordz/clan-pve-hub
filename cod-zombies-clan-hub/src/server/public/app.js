// App State
const state = {
  activeView: 'hub', // 'hub' or 'leaderboard'
  selectedFranchise: 'cod', // 'cod', 'halo', 'gears'
  selectedGame: 'all',
  selectedMap: 'all',
  selectedPlayerCount: 'all',
  selectedMode: 'all',
  searchQuery: '',
  franchises: [],
  games: [],
  maps: [],
  leaderboardData: []
};

// Franchise Metadata & Visual Themes
const franchiseConfigs = {
  cod: {
    name: 'Call of Duty [Zombies]',
    metricLabel: 'Round',
    color: '#E50914',
    glowClass: 'bg-red-900/20',
    headerBorder: 'border-red-500/40',
    headerBg: 'from-red-600 to-red-950',
    icon: 'skull',
    activeBtnClass: 'active-game',
    badgeClass: 'metric-badge-cod'
  },
  halo: {
    name: 'Halo [Firefight]',
    metricLabel: 'Set / Wave',
    color: '#00F0FF',
    glowClass: 'bg-cyan-900/20',
    headerBorder: 'border-cyan-500/40',
    headerBg: 'from-cyan-600 to-cyan-950',
    icon: 'shield',
    activeBtnClass: 'active-game-halo',
    badgeClass: 'metric-badge-halo'
  },
  gears: {
    name: 'Gears of War [Horde]',
    metricLabel: 'Wave',
    color: '#F59E0B',
    glowClass: 'bg-amber-900/20',
    headerBorder: 'border-amber-500/40',
    headerBg: 'from-amber-600 to-amber-950',
    icon: 'cog',
    activeBtnClass: 'active-game-gears',
    badgeClass: 'metric-badge-gears'
  }
};

// DOM Elements
const elements = {
  hubView: document.getElementById('hubView'),
  leaderboardView: document.getElementById('leaderboardView'),
  dynamicAmbientGlow: document.getElementById('dynamicAmbientGlow'),
  headerLogoBox: document.getElementById('headerLogoBox'),
  headerLogoIcon: document.getElementById('headerLogoIcon'),
  headerSubTitle: document.getElementById('headerSubTitle'),
  navHubBtn: document.getElementById('navHubBtn'),
  // Hub tile record labels
  hubCodRecord: document.getElementById('hubCodRecord'),
  hubHaloRecord: document.getElementById('hubHaloRecord'),
  hubGearsRecord: document.getElementById('hubGearsRecord'),
  // Quick tabs
  tabCod: document.getElementById('tabCod'),
  tabHalo: document.getElementById('tabHalo'),
  tabGears: document.getElementById('tabGears'),
  // Leaderboard elements
  stat1Title: document.getElementById('stat1Title'),
  stat2Title: document.getElementById('stat2Title'),
  statTotalRounds: document.getElementById('statTotalRounds'),
  statHighestRound: document.getElementById('statHighestRound'),
  statHighestPlayer: document.getElementById('statHighestPlayer'),
  statTotalRecords: document.getElementById('statTotalRecords'),
  gameFilters: document.getElementById('gameFilters'),
  mapSelect: document.getElementById('mapSelect'),
  playerCountSelect: document.getElementById('playerCountSelect'),
  modeSelect: document.getElementById('modeSelect'),
  searchPlayerInput: document.getElementById('searchPlayerInput'),
  tableTitle: document.getElementById('tableTitle'),
  tableMetricHeader: document.getElementById('tableMetricHeader'),
  recordCount: document.getElementById('recordCount'),
  leaderboardBody: document.getElementById('leaderboardBody'),
  // Video Modal
  videoModal: document.getElementById('videoModal'),
  closeVideoModalBtn: document.getElementById('closeVideoModalBtn'),
  modalTitle: document.getElementById('modalTitle'),
  modalPlayerContainer: document.getElementById('modalPlayerContainer'),
  modalMeta: document.getElementById('modalMeta'),
  modalExternalLink: document.getElementById('modalExternalLink'),
  // Submit Modal
  submitModal: document.getElementById('submitModal'),
  openSubmitModalBtn: document.getElementById('openSubmitModalBtn'),
  closeSubmitModalBtn: document.getElementById('closeSubmitModalBtn'),
  submitRunForm: document.getElementById('submitRunForm'),
  modalFormFranchise: document.getElementById('modalFormFranchise'),
  modalFormGame: document.getElementById('modalFormGame'),
  modalFormMap: document.getElementById('modalFormMap'),
  modalFormRoundLabel: document.getElementById('modalFormRoundLabel'),
  modalFormRound: document.getElementById('modalFormRound'),
  modalFormPlayers: document.getElementById('modalFormPlayers'),
  modalFormMode: document.getElementById('modalFormMode'),
  modalFormPlayerName: document.getElementById('modalFormPlayerName'),
  modalFormTeammates: document.getElementById('modalFormTeammates'),
  modalFormProof: document.getElementById('modalFormProof'),
  modalFormTwitch: document.getElementById('modalFormTwitch'),
  submitResultMsg: document.getElementById('submitResultMsg')
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  await loadHubTileStats();
  setupEventListeners();

  // Check URL Hash for deep linking e.g. #cod, #halo, #gears
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (['cod', 'halo', 'gears'].includes(hash)) {
    selectFranchise(hash);
  } else {
    showHubView();
  }
});

// Setup Listeners
function setupEventListeners() {
  // Map select
  elements.mapSelect.addEventListener('change', (e) => {
    state.selectedMap = e.target.value;
    loadLeaderboard();
  });

  // Player count select
  elements.playerCountSelect.addEventListener('change', (e) => {
    state.selectedPlayerCount = e.target.value;
    loadLeaderboard();
  });

  // Mode select
  elements.modeSelect.addEventListener('change', (e) => {
    state.selectedMode = e.target.value;
    loadLeaderboard();
  });

  // Search input
  elements.searchPlayerInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderLeaderboard();
  });

  // Video modal
  elements.closeVideoModalBtn.addEventListener('click', closeVideoModal);
  elements.videoModal.addEventListener('click', (e) => {
    if (e.target === elements.videoModal) closeVideoModal();
  });

  // Submit modal
  elements.openSubmitModalBtn.addEventListener('click', () => {
    elements.submitResultMsg.className = 'hidden';
    elements.modalFormFranchise.value = state.selectedFranchise;
    updateModalGames(state.selectedFranchise);
    elements.submitModal.classList.remove('hidden');
  });

  elements.closeSubmitModalBtn.addEventListener('click', () => {
    elements.submitModal.classList.add('hidden');
  });

  elements.submitModal.addEventListener('click', (e) => {
    if (e.target === elements.submitModal) elements.submitModal.classList.add('hidden');
  });

  // Modal Franchise change updates Game and Map options
  elements.modalFormFranchise.addEventListener('change', (e) => {
    updateModalGames(e.target.value);
  });

  elements.modalFormGame.addEventListener('change', (e) => {
    updateModalMaps(e.target.value);
  });

  // Submit form
  elements.submitRunForm.addEventListener('submit', handleFormSubmit);

  // Hash change
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['cod', 'halo', 'gears'].includes(hash)) {
      selectFranchise(hash);
    } else {
      showHubView();
    }
  });
}

// 1. Show Hub View
window.showHubView = function() {
  state.activeView = 'hub';
  window.location.hash = '';

  elements.hubView.classList.remove('hidden');
  elements.leaderboardView.classList.add('hidden');
  elements.navHubBtn.classList.add('hidden');

  // Reset header to neutral clan hub theme
  elements.dynamicAmbientGlow.className = 'fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-red-900/20 blur-[140px] -z-10 pointer-events-none transition-all duration-700';
  elements.headerLogoBox.className = 'w-11 h-11 rounded-lg bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center border border-red-500/40 shadow-lg shadow-red-900/40 transition';
  elements.headerLogoIcon.setAttribute('data-lucide', 'skull');
  elements.headerSubTitle.textContent = 'Clan Gaming Hub';
  elements.headerSubTitle.className = 'text-xs uppercase tracking-widest text-red-500 font-bold block';

  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 2. Select Franchise & Open Leaderboard View
window.selectFranchise = async function(franchiseId) {
  state.activeView = 'leaderboard';
  state.selectedFranchise = franchiseId;
  state.selectedGame = 'all';
  state.selectedMap = 'all';
  state.selectedMode = 'all';
  state.searchQuery = '';
  window.location.hash = franchiseId;

  const config = franchiseConfigs[franchiseId] || franchiseConfigs.cod;

  // View toggles
  elements.hubView.classList.add('hidden');
  elements.leaderboardView.classList.remove('hidden');
  elements.navHubBtn.classList.remove('hidden');

  // Header Theme adjustments
  elements.dynamicAmbientGlow.className = `fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] ${config.glowClass} blur-[140px] -z-10 pointer-events-none transition-all duration-700`;
  elements.headerLogoBox.className = `w-11 h-11 rounded-lg bg-gradient-to-br ${config.headerBg} flex items-center justify-center border ${config.headerBorder} shadow-lg transition`;
  elements.headerLogoIcon.setAttribute('data-lucide', config.icon);
  elements.headerSubTitle.textContent = config.name;
  elements.headerSubTitle.style.color = config.color;

  // Quick Switcher tabs active highlight
  ['cod', 'halo', 'gears'].forEach(f => {
    const btn = elements[`tab${f.charAt(0).toUpperCase() + f.slice(1)}`];
    if (btn) {
      if (f === franchiseId) {
        btn.className = `px-3 py-1 rounded-lg text-xs font-bold border ${config.headerBorder} bg-darkCard text-white shadow-sm`;
        btn.style.borderColor = config.color;
      } else {
        btn.className = 'px-3 py-1 rounded-lg text-xs font-bold border border-darkBorder text-gray-400 hover:text-white hover:bg-darkBorder/40 transition';
      }
    }
  });

  // Update dynamic metric labels
  elements.stat1Title.textContent = `Total ${config.metricLabel}s Recorded`;
  elements.tableMetricHeader.textContent = config.metricLabel;
  elements.tableTitle.textContent = `${config.name} Leaderboard`;

  if (window.lucide) lucide.createIcons();

  await loadClanStats(franchiseId);
  await loadGames(franchiseId);
  await loadMaps(franchiseId);
  await loadLeaderboard();

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 3. Load Hub Tile Stats
async function loadHubTileStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success && data.stats && data.stats.franchises) {
      data.stats.franchises.forEach(f => {
        const recordText = f.max_score > 0 
          ? `${f.metric_label} ${f.max_score} (${f.run_count} runs)` 
          : 'No runs recorded yet';

        if (f.id === 'cod' && elements.hubCodRecord) elements.hubCodRecord.textContent = recordText;
        if (f.id === 'halo' && elements.hubHaloRecord) elements.hubHaloRecord.textContent = recordText;
        if (f.id === 'gears' && elements.hubGearsRecord) elements.hubGearsRecord.textContent = recordText;
      });
    }
  } catch (err) {
    console.error('Failed to load hub stats:', err);
  }
}

// 4. Load Clan Stats for Franchise
async function loadClanStats(franchiseId) {
  try {
    const res = await fetch(`/api/stats?franchise=${franchiseId}`);
    const data = await res.json();
    if (data.success && data.stats) {
      const { totalRounds, totalSubmissions, highestRound } = data.stats;
      const config = franchiseConfigs[franchiseId];

      elements.statTotalRounds.textContent = (totalRounds || 0).toLocaleString();
      elements.statTotalRecords.textContent = (totalSubmissions || 0).toLocaleString();

      if (highestRound) {
        elements.statHighestRound.textContent = `${config.metricLabel} ${highestRound.round}`;
        elements.statHighestPlayer.textContent = `by ${highestRound.player_name} (${highestRound.map_name})`;
      } else {
        elements.statHighestRound.textContent = 'None yet';
        elements.statHighestPlayer.textContent = 'Be the first to set the record!';
      }
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// 5. Load Games for Franchise
async function loadGames(franchiseId) {
  try {
    const res = await fetch(`/api/games?franchise=${franchiseId}`);
    const data = await res.json();
    if (data.success && data.games) {
      state.games = data.games;
      const config = franchiseConfigs[franchiseId];

      // Build Game filter pills
      elements.gameFilters.innerHTML = `
        <button data-game="all" class="game-btn ${config.activeBtnClass} px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition">
          All Titles
        </button>
      `;

      data.games.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'game-btn px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition';
        btn.dataset.game = g.id;
        btn.textContent = g.short_code;
        btn.addEventListener('click', () => filterByGame(g.id));
        elements.gameFilters.appendChild(btn);
      });

      const allBtn = elements.gameFilters.querySelector('[data-game="all"]');
      allBtn.addEventListener('click', () => filterByGame('all'));
    }
  } catch (err) {
    console.error('Failed to load games:', err);
  }
}

// Filter by game title pill
async function filterByGame(gameId) {
  state.selectedGame = gameId;
  state.selectedMap = 'all';

  const config = franchiseConfigs[state.selectedFranchise];
  const buttons = elements.gameFilters.querySelectorAll('button');
  buttons.forEach(btn => {
    if (btn.dataset.game === gameId) {
      btn.className = `game-btn ${config.activeBtnClass} px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition`;
    } else {
      btn.className = 'game-btn px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition';
    }
  });

  await loadMaps(state.selectedFranchise);
  await loadLeaderboard();
}

// 6. Load Maps
async function loadMaps(franchiseId) {
  try {
    const url = state.selectedGame === 'all'
      ? `/api/maps?franchise=${franchiseId}`
      : `/api/maps?game=${state.selectedGame}&franchise=${franchiseId}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.success && data.maps) {
      state.maps = data.maps;

      elements.mapSelect.innerHTML = '<option value="all">All Maps</option>';
      data.maps.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = state.selectedGame === 'all' && m.short_code ? `${m.name} (${m.short_code})` : m.name;
        elements.mapSelect.appendChild(opt);
      });
      elements.mapSelect.value = state.selectedMap;
    }
  } catch (err) {
    console.error('Failed to load maps:', err);
  }
}

// 7. Load Leaderboard
async function loadLeaderboard() {
  elements.leaderboardBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-12 text-gray-500">
        <div class="flex flex-col items-center justify-center space-y-2">
          <div class="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading verified runs...</span>
        </div>
      </td>
    </tr>
  `;

  try {
    const params = new URLSearchParams({ franchise: state.selectedFranchise });
    if (state.selectedGame !== 'all') params.append('game', state.selectedGame);
    if (state.selectedMap !== 'all') params.append('map', state.selectedMap);
    if (state.selectedPlayerCount !== 'all') params.append('players', state.selectedPlayerCount);
    if (state.selectedMode !== 'all') params.append('mode', state.selectedMode);

    const res = await fetch(`/api/leaderboard?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      state.leaderboardData = data.leaderboard || [];
      renderLeaderboard();
    }
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
    elements.leaderboardBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-red-400">Failed to load records. Is the server running?</td>
      </tr>
    `;
  }
}

// 8. Render Leaderboard Rows
function renderLeaderboard() {
  let filtered = state.leaderboardData;
  const config = franchiseConfigs[state.selectedFranchise] || franchiseConfigs.cod;

  // Search filter
  if (state.searchQuery) {
    filtered = filtered.filter(rec =>
      rec.player_name.toLowerCase().includes(state.searchQuery) ||
      (rec.teammates && rec.teammates.toLowerCase().includes(state.searchQuery)) ||
      rec.map_name.toLowerCase().includes(state.searchQuery) ||
      (rec.game_mode && rec.game_mode.toLowerCase().includes(state.searchQuery))
    );
  }

  elements.recordCount.textContent = `${filtered.length} run${filtered.length === 1 ? '' : 's'} recorded`;

  if (filtered.length === 0) {
    elements.leaderboardBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-12 text-gray-400">
          <div class="flex flex-col items-center justify-center space-y-2">
            <i data-lucide="ghost" class="w-8 h-8 text-gray-600"></i>
            <p class="font-medium text-gray-300">No records found for this filter.</p>
            <p class="text-xs text-gray-500">Submit the first clan high round or wave defense!</p>
          </div>
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const medals = [
    '<span class="text-xl">🥇</span>',
    '<span class="text-xl">🥈</span>',
    '<span class="text-xl">🥉</span>'
  ];

  elements.leaderboardBody.innerHTML = filtered.map((rec, index) => {
    const rank = index + 1;
    const rankBadge = rank <= 3 ? medals[rank - 1] : `<span class="font-bold text-gray-400">#${rank}</span>`;
    const rowClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'hover:bg-darkBorder/30';

    const formattedDate = new Date(rec.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const teammatesHtml = rec.teammates
      ? `<div class="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><i data-lucide="users" class="w-3 h-3 text-gray-500"></i> w/ ${escapeHtml(rec.teammates)}</div>`
      : '';

    const twitchBadge = rec.twitch_channel
      ? `<a href="https://twitch.tv/${escapeHtml(rec.twitch_channel.replace('@', ''))}" target="_blank" rel="noopener noreferrer" 
            class="text-[11px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 hover:text-white transition">
            <i data-lucide="tv" class="w-3 h-3"></i> ${escapeHtml(rec.twitch_channel)}
         </a>`
      : '';

    const metricText = `${rec.metric_label || config.metricLabel} ${rec.round}`;

    return `
      <tr class="transition ${rowClass}">
        <td class="py-4 px-4 text-center font-bold">${rankBadge}</td>
        <td class="py-4 px-4">
          <span class="metric-badge ${config.badgeClass}">
            ${metricText.toUpperCase()}
          </span>
        </td>
        <td class="py-4 px-4">
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-white text-base">${escapeHtml(rec.player_name)}</span>
            ${twitchBadge}
          </div>
          ${teammatesHtml}
        </td>
        <td class="py-4 px-4">
          <div class="font-semibold text-gray-200">${escapeHtml(rec.map_name)}</div>
          <span class="text-xs text-red-400 font-medium" style="color: ${config.color}">${escapeHtml(rec.short_code || rec.game_name || '')}</span>
        </td>
        <td class="py-4 px-4">
          <span class="px-2 py-1 rounded bg-darkBg border border-darkBorder text-xs font-medium text-gray-300">
            ${escapeHtml(rec.player_count)}
          </span>
          ${rec.game_mode && rec.game_mode !== 'Standard' ? `
            <div class="mt-1">
              <span class="px-1.5 py-0.5 rounded bg-darkBg border border-gray-700 text-[10px] font-semibold text-gray-300">
                ${escapeHtml(rec.game_mode)}
              </span>
            </div>
          ` : ''}
        </td>
        <td class="py-4 px-4 text-xs text-gray-400">
          ${formattedDate}
        </td>
        <td class="py-4 px-4 text-right">
          ${rec.proof_url ? `
            <button onclick="openVideoProof('${encodeURIComponent(JSON.stringify(rec))}')" 
                    class="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-300 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm">
              <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
              <span>Watch Proof</span>
            </button>
          ` : '<span class="text-xs text-gray-500">No VOD</span>'}
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// 9. Video Proof Modal
window.openVideoProof = function(encodedRecord) {
  const rec = JSON.parse(decodeURIComponent(encodedRecord));
  const url = rec.proof_url;

  elements.modalTitle.innerHTML = `
    <i data-lucide="tv" class="w-5 h-5 text-red-500"></i>
    <span>${rec.metric_label || 'Round'} ${rec.round} on ${rec.map_name} by ${rec.player_name}</span>
  `;
  elements.modalMeta.textContent = `${rec.game_name || rec.short_code} • ${rec.player_count} • Achieved ${new Date(rec.created_at).toLocaleDateString()}`;
  elements.modalExternalLink.href = url;

  elements.modalPlayerContainer.innerHTML = '';
  const parentDomain = window.location.hostname || 'localhost';

  if (url.includes('twitch.tv/videos/')) {
    const videoId = url.split('videos/')[1].split('?')[0].split('/')[0];
    elements.modalPlayerContainer.innerHTML = `
      <iframe src="https://player.twitch.tv/?video=${videoId}&parent=${parentDomain}&autoplay=false" 
              class="w-full h-full" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>
    `;
  } else if (url.includes('clips.twitch.tv/') || url.includes('/clip/')) {
    const clipSlug = url.includes('clips.twitch.tv/') ? url.split('clips.twitch.tv/')[1].split('?')[0] : url.split('/clip/')[1].split('?')[0];
    elements.modalPlayerContainer.innerHTML = `
      <iframe src="https://clips.twitch.tv/embed?clip=${clipSlug}&parent=${parentDomain}&autoplay=false" 
              class="w-full h-full" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>
    `;
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let ytId = '';
    if (url.includes('youtu.be/')) {
      ytId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
      ytId = url.split('watch?v=')[1].split('&')[0];
    }
    if (ytId) {
      elements.modalPlayerContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${ytId}" 
                class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
    } else {
      renderFallbackLink(url);
    }
  } else {
    renderFallbackLink(url);
  }

  elements.videoModal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
};

function renderFallbackLink(url) {
  elements.modalPlayerContainer.innerHTML = `
    <div class="text-center p-8 space-y-3">
      <i data-lucide="external-link" class="w-12 h-12 text-gray-500 mx-auto"></i>
      <p class="text-sm text-gray-300">Proof is hosted on an external site or screenshot:</p>
      <a href="${url}" target="_blank" rel="noopener noreferrer" 
         class="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold text-sm transition">
        Open Proof Link
      </a>
    </div>
  `;
}

function closeVideoModal() {
  elements.videoModal.classList.add('hidden');
  elements.modalPlayerContainer.innerHTML = '';
}

// 10. Update Modal Games & Maps based on Franchise
async function updateModalGames(franchiseId) {
  try {
    const res = await fetch(`/api/games?franchise=${franchiseId}`);
    const data = await res.json();
    if (data.success && data.games) {
      elements.modalFormGame.innerHTML = '';
      data.games.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = `${g.name} (${g.short_code})`;
        elements.modalFormGame.appendChild(opt);
      });

      const config = franchiseConfigs[franchiseId] || franchiseConfigs.cod;
      elements.modalFormRoundLabel.textContent = `${config.metricLabel} Achieved`;

      if (data.games.length > 0) {
        updateModalMaps(data.games[0].id);
      }
    }
  } catch (err) {
    console.error('Failed to update modal games:', err);
  }
}

async function updateModalMaps(gameId) {
  try {
    const res = await fetch(`/api/maps?game=${gameId}`);
    const data = await res.json();
    if (data.success && data.maps) {
      elements.modalFormMap.innerHTML = '';
      data.maps.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        elements.modalFormMap.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Failed to update modal maps:', err);
  }
}

// 11. Handle Run Submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const payload = {
    franchise_id: elements.modalFormFranchise.value,
    game_id: elements.modalFormGame.value,
    map_name: elements.modalFormMap.value,
    round: elements.modalFormRound.value,
    player_count: elements.modalFormPlayers.value,
    game_mode: elements.modalFormMode.value.trim() || 'Standard',
    player_name: elements.modalFormPlayerName.value.trim(),
    teammates: elements.modalFormTeammates.value.trim() || null,
    proof_url: elements.modalFormProof.value.trim(),
    twitch_channel: elements.modalFormTwitch.value.trim() || null
  };

  const btn = document.getElementById('submitRunBtn');
  btn.disabled = true;
  btn.innerHTML = `<span>Submitting...</span>`;

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      elements.submitResultMsg.className = 'p-3 rounded-lg text-xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 block';
      elements.submitResultMsg.textContent = '✅ Submission received! Your run has been queued for clan review.';
      elements.submitRunForm.reset();
      setTimeout(() => {
        elements.submitModal.classList.add('hidden');
      }, 2500);
    } else {
      throw new Error(data.error || 'Submission failed');
    }
  } catch (err) {
    elements.submitResultMsg.className = 'p-3 rounded-lg text-xs bg-red-950/80 border border-red-500/40 text-red-300 block';
    elements.submitResultMsg.textContent = `❌ ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Submit for Clan Review</span> <i data-lucide="send" class="w-4 h-4"></i>`;
    if (window.lucide) lucide.createIcons();
  }
}

// Utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
