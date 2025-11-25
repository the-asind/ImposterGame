const defaultWords = [
  'Слова не подгрузились!',
];

let wordList = [...defaultWords];

const elements = {
  sections: {
    setup: document.getElementById('setup'),
    dealing: document.getElementById('dealing'),
    complete: document.getElementById('complete')
  },
  playerCount: document.getElementById('playerCount'),
  playerValue: document.getElementById('playerValue'),
  start: document.getElementById('start'),
  playerLabel: document.getElementById('playerLabel'),
  remaining: document.getElementById('remaining'),
  card: document.getElementById('secretCard'),
  cardValue: document.getElementById('cardValue'),
  restart: document.getElementById('restart'),
  restartFinal: document.getElementById('restartFinal'),
  backFromComplete: document.getElementById('backFromComplete')
};

const state = {
  playerCount: 5,
  currentPlayer: 1,
  imposterIndex: 1,
  secretWord: '',
  holding: false,
  holdTimer: null
};

async function loadWords() {
  try {
    const response = await fetch('words.txt');
    if (!response.ok) return;
    const text = await response.text();
    const parsed = parseWords(text);
    if (parsed.length) {
      wordList = parsed;
    }
  } catch {
    // Offline or missing file
  }
}

function parseWords(input) {
  return input
    .split(/,|\n/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function sampleWord(pool) {
  const list = pool.length ? pool : wordList;
  return list[Math.floor(Math.random() * list.length)];
}

function startRound() {
  const count = Number(elements.playerCount.value);
  if (!Number.isFinite(count) || count < 3) {
    elements.playerCount.value = 3;
    elements.playerValue.textContent = '3';
  }

  state.playerCount = Math.min(Number(elements.playerCount.value), 20);
  state.secretWord = sampleWord(wordList);
  state.imposterIndex = 1 + Math.floor(Math.random() * state.playerCount);
  state.currentPlayer = 1;
  state.holding = false;
  state.holdTimer = null;

  elements.card.classList.remove('revealed');
  elements.card.classList.remove('holding');
  elements.sections.setup.classList.add('hidden');
  elements.sections.complete.classList.add('hidden');
  elements.sections.dealing.classList.remove('hidden');

  updateDealUI();
}

function updateDealUI() {
  elements.playerLabel.textContent = `Игрок ${state.currentPlayer}`;
  const left = state.playerCount - state.currentPlayer + 1;
  elements.remaining.textContent = `${left} до завершения`;
  elements.cardValue.textContent =
    state.currentPlayer === state.imposterIndex ? 'Imposter' : state.secretWord;
  elements.card.classList.remove('revealed');
  elements.card.classList.remove('holding');
}

function revealCard() {
  elements.card.classList.remove('holding');
  elements.card.classList.add('revealed');
}

function hideCardAndAdvance() {
  elements.card.classList.remove('revealed');
  elements.card.classList.remove('holding');
  const advance = () => {
    if (state.currentPlayer >= state.playerCount) {
      elements.sections.dealing.classList.add('hidden');
      elements.sections.complete.classList.remove('hidden');
      return;
    }
    state.currentPlayer += 1;
    updateDealUI();
  };
  // Ждем окончания поворота, чтобы не подсмотреть карту следующего игрока.
  setTimeout(advance, 300);
}

function resetGame() {
  elements.sections.dealing.classList.add('hidden');
  elements.sections.complete.classList.add('hidden');
  elements.sections.setup.classList.remove('hidden');
  elements.card.classList.remove('revealed');
  elements.card.classList.remove('holding');
}

function cancelHold() {
  if (state.holdTimer) {
    clearTimeout(state.holdTimer);
    state.holdTimer = null;
  }
  state.holding = false;
  elements.card.classList.remove('holding');
}

function bindInteractions() {
  elements.start.addEventListener('click', startRound);
  elements.restart.addEventListener('click', resetGame);
  elements.restartFinal.addEventListener('click', resetGame);
  elements.backFromComplete.addEventListener('click', resetGame);
  elements.playerCount.addEventListener('input', () => {
    elements.playerValue.textContent = elements.playerCount.value;
  });

  const card = elements.card;
  card.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (state.holding) return;
    state.holding = true;
    elements.card.classList.add('holding');
    state.holdTimer = setTimeout(() => {
      revealCard();
    }, 500);
  });

  card.addEventListener('pointerup', () => {
    if (state.holdTimer) {
      clearTimeout(state.holdTimer);
      state.holdTimer = null;
    }
    if (elements.card.classList.contains('revealed')) {
      state.holding = false;
      hideCardAndAdvance();
    } else {
      cancelHold();
    }
  });

  card.addEventListener('pointerleave', cancelHold);
  card.addEventListener('pointercancel', cancelHold);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Best-effort only
      });
    });
  }
}

function init() {
  bindInteractions();
  loadWords();
  registerServiceWorker();
}

init();
