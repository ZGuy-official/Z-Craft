/* ============================================================
   Z CRAFT — PURE JAVASCRIPT VERSION
   Works directly on GitHub Pages (NO React, NO build tools)
   ============================================================ */

/* ---------------------------
   CONSTANTS & GAME DATA
---------------------------- */

// Starter items
const STARTER = [
  { id: "earth", name: "Earth 🌍" },
  { id: "water", name: "Water 💧" },
  { id: "wind", name: "Wind 💨" },
  { id: "light", name: "Light ✨" },
  { id: "fire", name: "Fire 🔥" }
];

// Crafting pairs
const PAIRS = {
  "earth+fire": ["Lava 🌋", "Stone 🪨"],
  "water+wind": ["Cloud ☁️", "Rain 🌧️"],
  "light+wind": ["Aura ✨", "Atmosphere 🌫️"],
  "water+fire": ["Steam 💨", "Swamp 🪵"],
  "water+earth": ["Swamp 🐊", "Crocodile 🐊"],
  "fire+light": ["Lamp 🪔", "Technology ⚙️"],
  "earth+wind": ["Sand 🏖️", "Stone 🪨"],
  "light+earth": ["Life 🌱", "House 🏠"],
  "light+water": ["Rain 🌧️", "Life 🌱"],
  "earth+water": ["Swamp 🐊", "Crocodile 🐊"],
  "earth+light": ["Life 🌱", "Village 🏘️"],
  "life+technology": ["Phone 📱", "Tablet 💻"],
  "technology+light": ["YouTube ▶️", "Channel 📺"],
  "earth+metal": ["Factory 🏭", "Factory 🏭"],
};

// Fallback random items
const FALLBACK = [
  "Thunder ⚡", "Cloud ☁️", "Rain 🌧️", "Lava 🌋", "Stone 🪨", "Life 🌱",
  "Atmosphere 🌫️", "Aura ✨", "Swamp 🐊", "Crocodile 🐊", "Crocs 🥿",
  "Shoes 👟", "Boat ⛵", "Ship 🚢", "Metal 🛠️", "Smoke 💨", "Human 🧑",
  "House 🏠", "Village 🏘️", "City 🏙️", "Technology ⚙️", "Lamp 🪔",
  "Phone 📱", "Tablet 💻", "Factory 🏭", "Social Media 🌐",
  "YouTube ▶️", "Channel 📺", "Z Guy Channel 😎",
];

// Shop items
const SHOP_ITEMS = [
  { id: "chocolate", name: "Chocolate 🍫", price: 20 },
  { id: "sand", name: "Sand 🏖️", price: 10 },
];

// Minesweeper rewards
const MINE_REWARDS = {
  easy: 2,
  normal: 3,
  hard: 5,
  veryhard: 7,
  insane: 10,
};

// Minesweeper costs
const MINE_COST = {
  easy: 0,
  normal: 0,
  hard: 0,
  veryhard: 5,
  insane: 10,
};

// Minesweeper grid sizes
const MINE_CONFIG = {
  easy: { rows: 6, cols: 6, mines: 6 },
  normal: { rows: 8, cols: 8, mines: 10 },
  hard: { rows: 10, cols: 10, mines: 18 },
  veryhard: { rows: 12, cols: 12, mines: 30 },
  insane: { rows: 14, cols: 14, mines: 50 },
};

// Utility for unique IDs
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/* ============================================================
   GAME STATE
============================================================ */
let username = localStorage.getItem("zuser") || "";
let agreedCookies = JSON.parse(localStorage.getItem("zcookies") || "false");

let cash = Number(localStorage.getItem("zcash") || "0");

// Load inventory or starter items
let inventory = JSON.parse(localStorage.getItem("zinv") || "null");
if (!inventory) inventory = STARTER.map((x) => x.id);

// Load item metadata or build from starter
let itemsMeta = JSON.parse(localStorage.getItem("zmeta") || "null");
if (!itemsMeta) {
  itemsMeta = {};
  STARTER.forEach((s) => (itemsMeta[s.id] = s.name));
}

// Selected items for crafting
let selected = [];

// Messages
let messages = [];

/* ============================================================
   DOM ELEMENTS
============================================================ */
const elInv = document.getElementById("inventory");
const elMessages = document.getElementById("messages");
const elCash = document.getElementById("cashDisplay");
const elUsernameDisp = document.getElementById("usernameDisplay");
const elUsernameAcct = document.getElementById("usernameAcct");

const cookieGate = document.getElementById("cookieGate");
const usernameInput = document.getElementById("usernameInput");
const cookieCheckbox = document.getElementById("cookieCheckbox");
const continueBtn = document.getElementById("continueBtn");

const craftBtn = document.getElementById("craftBtn");
const clearSelectBtn = document.getElementById("clearSelectBtn");

const shopList = document.getElementById("shopList");

const minesModal = document.getElementById("minesModal");
const minesBoardEl = document.getElementById("minesBoard");
const closeMinesBtn = document.getElementById("closeMines");
const minesButtons = document.querySelectorAll(".mines-btn");

const signOutBtn = document.getElementById("signOut");

/* ============================================================
   RENDERING FUNCTIONS
============================================================ */

function render() {
  renderInventory();
  renderMessages();
  renderCash();
  renderShop();
  renderUsernames();

  localStorage.setItem("zcash", cash);
  localStorage.setItem("zinv", JSON.stringify(inventory));
  localStorage.setItem("zmeta", JSON.stringify(itemsMeta));
}

function renderUsernames() {
  elUsernameDisp.textContent = username || "Guest";
  elUsernameAcct.textContent = username || "Guest";
}

function renderCash() {
  elCash.textContent = cash;
}

function renderInventory() {
  elInv.innerHTML = "";
  inventory.forEach((id) => {
    const div = document.createElement("div");
    div.textContent = itemsMeta[id];
    div.className = "inv-item" + (selected.includes(id) ? " inv-selected" : "");
    div.onclick = () => toggleSelect(id);
    elInv.appendChild(div);
  });
}

function renderMessages() {
  elMessages.innerHTML = "";
  messages.slice(0, 8).forEach((m) => {
    const li = document.createElement("li");
    li.textContent = "• " + m;
    elMessages.appendChild(li);
  });
}

function renderShop() {
  shopList.innerHTML = "";
  SHOP_ITEMS.forEach((it) => {
    const row = document.createElement("div");
    row.className = "row space";

    const label = document.createElement("div");
    label.textContent = `${it.name} — ${it.price} 💵`;

    const btn = document.createElement("button");
    btn.className = "btn-light";
    btn.textContent = "Buy";
    btn.onclick = () => buy(it);

    row.appendChild(label);
    row.appendChild(btn);
    shopList.appendChild(row);
  });
}

function addMessage(t) {
  messages.unshift(t);
  messages = messages.slice(0, 8);
  renderMessages();
}

/* ============================================================
   COOKIE / USERNAME GATE
============================================================ */

function showCookieGate() {
  cookieGate.classList.remove("hidden");
  usernameInput.value = username;
  cookieCheckbox.checked = agreedCookies;
}

function hideCookieGate() {
  cookieGate.classList.add("hidden");
}

continueBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return addMessage("Enter a username.");

  if (!cookieCheckbox.checked)
    return addMessage("You must accept cookies to continue.");

  username = name;
  agreedCookies = true;

  localStorage.setItem("zuser", username);
  localStorage.setItem("zcookies", "true");

  addMessage(`Welcome, ${username}!`);
  hideCookieGate();
  renderUsernames();
};

/* Show gate if needed */
if (!agreedCookies) showCookieGate();

/* ============================================================
   INVENTORY & CRAFTING
============================================================ */

function toggleSelect(id) {
  if (selected.includes(id)) {
    selected = selected.filter((x) => x !== id);
  } else {
    if (selected.length >= 2) selected = [id];
    else selected.push(id);
  }
  renderInventory();
}

clearSelectBtn.onclick = () => {
  selected = [];
  renderInventory();
};

craftBtn.onclick = () => {
  if (selected.length < 2) return addMessage("Select two items to craft.");
  craft(selected[0], selected[1]);
  selected = [];
  renderInventory();
};

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function craft(aId, bId) {
  if (aId === bId) {
    addMessage("Select two different items.");
    return;
  }

  const baseA = aId.split("_")[0];
  const baseB = bId.split("_")[0];

  const keyA = baseA + "+" + baseB;
  const keyB = baseB + "+" + baseA;

  let result = null;

  if (PAIRS[keyA]) result = randomChoice(PAIRS[keyA]);
  else if (PAIRS[keyB]) result = randomChoice(PAIRS[keyB]);
  else {
    if (["chocolate", "sand"].includes(baseA) || ["chocolate", "sand"].includes(baseB)) {
      result = randomChoice(FALLBACK);
    } else {
      result = randomChoice(FALLBACK);
    }
  }

  const newId = result.replace(/[^a-z0-9]+/gi, "_") + "_" + uid();

  inventory.unshift(newId);
  itemsMeta[newId] = result;

  cash += 5;
  addMessage(`Crafted ${result} (+5 cash)`);

  render();
}

/* ============================================================
   SHOP
============================================================ */

function buy(item) {
  if (cash < item.price) return addMessage("Not enough cash to buy " + item.name);

  cash -= item.price;

  const id = item.id + "_" + uid();
  inventory.unshift(id);
  itemsMeta[id] = item.name;

  addMessage(`Bought ${item.name} for ${item.price} cash`);

  render();
}

/* ============================================================
   MINESWEEPER
============================================================ */

let currentBoard = null;
let currentStatus = "playing";
let currentMode = "easy";

function openMinesweeper(mode) {
  const cost = MINE_COST[mode];
  if (cash < cost) return addMessage("Not enough cash to play " + mode);

  if (cost > 0) cash -= cost;

  currentMode = mode;
  startMinesGame(MINE_CONFIG[mode]);

  minesModal.classList.remove("hidden");
  render();
}

function startMinesGame(config) {
  const { rows, cols, mines } = config;
  currentBoard = makeBoard(rows, cols, mines);
  currentStatus = "playing";

  renderMinesBoard();
}

function renderMinesBoard() {
  const rows = currentBoard.length;
  const cols = currentBoard[0].length;

  minesBoardEl.innerHTML = "";
  minesBoardEl.style.gridTemplateColumns = `repeat(${cols}, 26px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = currentBoard[r][c];
      const div = document.createElement("div");
      div.className = "cell " + (cell.revealed ? "cell-revealed" : "cell-hidden");

      if (cell.revealed) {
        div.textContent = cell.mine ? "💣" : (cell.adjacent > 0 ? cell.adjacent : "");
      } else if (cell.flagged) {
        div.textContent = "🚩";
      }

      div.oncontextmenu = (e) => {
        e.preventDefault();
        toggleFlag(r, c);
      };

      div.onclick = () => revealCell(r, c);

      minesBoardEl.appendChild(div);
    }
  }
}

/* Mines logic */
function makeBoard(rows, cols, mines) {
  let board = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      r,
      c,
      mine: false,
      flagged: false,
      revealed: false,
      adjacent: 0
    }))
  );

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let adj = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr,
            nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine)
            adj++;
        }
      board[r][c].adjacent = adj;
    }

  return board;
}

function revealCell(r, c) {
  if (currentStatus !== "playing") return;

  const cell = currentBoard[r][c];
  if (cell.revealed || cell.flagged) return;

  if (cell.mine) {
    revealAll();
    currentStatus = "lost";
    addMessage(`You lost ${currentMode} minesweeper.`);
    setTimeout(() => minesModal.classList.add("hidden"), 600);
    renderMinesBoard();
    return;
  }

  floodReveal(r, c);
  checkWin();
  renderMinesBoard();
}

function revealAll() {
  currentBoard.flat().forEach((c) => (c.revealed = true));
}

function floodReveal(r, c) {
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    const cell = currentBoard[cr][cc];

    if (cell.revealed || cell.flagged || cell.mine) continue;

    cell.revealed = true;

    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cr + dr,
            nc = cc + dc;
          if (
            nr >= 0 &&
            nr < currentBoard.length &&
            nc >= 0 &&
            nc < currentBoard[0].length &&
            !currentBoard[nr][nc].revealed
          ) {
            stack.push([nr, nc]);
          }
        }
    }
  }
}

function toggleFlag(r, c) {
  const cell = currentBoard[r][c];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  renderMinesBoard();
}

function checkWin() {
  const allRevealed = currentBoard
    .flat()
    .filter((c) => !c.mine)
    .every((c) => c.revealed);

  if (allRevealed) {
    currentStatus = "won";
    cash += MINE_REWARDS[currentMode];
    addMessage(`You won ${currentMode} minesweeper! (+${MINE_REWARDS[currentMode]} cash)`);
    render();
    setTimeout(() => minesModal.classList.add("hidden"), 600);
  }
}

/* Button triggers */
minesButtons.forEach((btn) => {
  btn.onclick = () => openMinesweeper(btn.dataset.mode);
});

closeMinesBtn.onclick = () => {
  minesModal.classList.add("hidden");
};

/* ============================================================
   SIGN OUT
============================================================ */
signOutBtn.onclick = () => {
  username = "";
  agreedCookies = false;
  localStorage.removeItem("zuser");
  localStorage.removeItem("zcookies");
  addMessage("Signed out.");
  showCookieGate();
};

/* ============================================================
   INITIAL RENDER
============================================================ */
render();
