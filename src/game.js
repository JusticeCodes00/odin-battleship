import { renderBoard, renderMiniGrid } from "./ui.js";
import { Gameboard } from "./models/Gameboard.js";
import { Player } from "./models/Player.js";
import { Ship } from "./models/Ship.js";
import interact from "interactjs";
import eruda from "eruda";

eruda.init();

// ======= AI STATE =======
const ai = {
  mode: "hunt",
  hitQueue: [],
  firstHit: null,
  lastHit: null,
  direction: null,
};

const resetAI = () => {
  ai.mode = "hunt";
  ai.hitQueue = [];
  ai.firstHit = null;
  ai.lastHit = null;
  ai.direction = null;
};

const getAdjacentCells = (x, y) => {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ].filter(
    ([ax, ay]) =>
      ax >= 0 &&
      ay >= 0 &&
      ax < 10 &&
      ay < 10 &&
      !checkHasAttackedCoordinateBefore(playerOne, ax, ay),
  );
};

const getNextInDirection = (x, y, dx, dy) => {
  const nx = x + dx;
  const ny = y + dy;
  if (
    nx >= 0 &&
    ny >= 0 &&
    nx < 10 &&
    ny < 10 &&
    !checkHasAttackedCoordinateBefore(playerOne, nx, ny)
  )
    return [nx, ny];
  return null;
};

const runPCTurn = () => {
  let x, y;

  if (ai.mode === "hunt") {
    while (true) {
      const rx = genRandomInt(10);
      const ry = genRandomInt(10);
      if (!checkHasAttackedCoordinateBefore(playerOne, rx, ry)) {
        x = rx;
        y = ry;
        break;
      }
    }
  } else if (ai.mode === "target") {
    while (ai.hitQueue.length > 0) {
      const candidate = ai.hitQueue.shift();
      if (
        !checkHasAttackedCoordinateBefore(playerOne, candidate[0], candidate[1])
      ) {
        [x, y] = candidate;
        break;
      }
    }
    if (x === undefined) {
      resetAI();
      runPCTurn();
      return;
    }
  } else if (ai.mode === "direction") {
    const next = getNextInDirection(
      ai.lastHit[0],
      ai.lastHit[1],
      ai.direction[0],
      ai.direction[1],
    );
    if (next) {
      [x, y] = next;
    } else {
      const [rdx, rdy] = [-ai.direction[0], -ai.direction[1]];
      const reverse = getNextInDirection(
        ai.firstHit[0],
        ai.firstHit[1],
        rdx,
        rdy,
      );
      if (reverse) {
        ai.direction = [rdx, rdy];
        ai.lastHit = ai.firstHit;
        [x, y] = reverse;
      } else {
        resetAI();
        runPCTurn();
        return;
      }
    }
  }

  const result = playerOne.gameboard.receiveAttack(x, y);

  renderBoard(
    realBoard,
    playerOne.gameboard.board,
    playerOne.gameboard.hits,
    playerOne.gameboard.misses,
  );
  // Game is in progress — pass null so all ships show with hit tracking
  renderMiniGrid(realMiniGridElem, playerOne.gameboard, playerOne.type, null);

  if (result === "hit") {
    setStateMessage("Computer hit your ship!");

    if (ai.mode === "hunt") {
      ai.mode = "target";
      ai.firstHit = [x, y];
      ai.lastHit = [x, y];
      ai.hitQueue = getAdjacentCells(x, y);
    } else if (ai.mode === "target") {
      ai.mode = "direction";
      ai.direction = [x - ai.firstHit[0], y - ai.firstHit[1]];
      ai.lastHit = [x, y];
    } else if (ai.mode === "direction") {
      ai.lastHit = [x, y];
    }

    const hitShip = playerOne.gameboard.get(x, y);
    if (hitShip && hitShip.isSunk()) resetAI();
  } else {
    setStateMessage("Computer missed!");
    if (ai.mode === "direction") {
      const [rdx, rdy] = [-ai.direction[0], -ai.direction[1]];
      const reverse = getNextInDirection(
        ai.firstHit[0],
        ai.firstHit[1],
        rdx,
        rdy,
      );
      if (reverse) {
        ai.direction = [rdx, rdy];
        ai.lastHit = ai.firstHit;
      } else {
        resetAI();
      }
    }
  }

  if (checkWinner()) return;
  switchPlayerTurn();
};

// ======= DRAG AND DROP =======

let dragOrientation = "row";
let dragClone = null;
let activeDragShipName = null;

// Tracks which ships have been placed on the board during placement phase
const placedShips = new Set();

const renderPlayerMiniGrid = () => {
  // During placement, pass placedShips so placed ships are hidden
  // During game (states.start === true), pass null so all ships show normally
  renderMiniGrid(
    realMiniGridElem,
    playerOne.gameboard,
    playerOne.type,
    states.start ? null : placedShips,
  );
};

const getCellFromPoint = (clientX, clientY) => {
  const rect = realBoard.getBoundingClientRect();
  if (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  )
    return null;

  const cellW = rect.width / 10;
  const cellH = rect.height / 10;
  const x = Math.floor((clientY - rect.top) / cellH);
  const y = Math.floor((clientX - rect.left) / cellW);

  if (x < 0 || x >= 10 || y < 0 || y >= 10) return null;
  return { x, y };
};

const createDragClone = (shipName) => {
  const length = playerOne.gameboard.ships[shipName].length;
  dragClone = document.createElement("div");
  dragClone.classList.add("drag-clone", dragOrientation);

  for (let i = 0; i < length; i++) {
    const cell = document.createElement("div");
    cell.classList.add("drag-clone-cell");
    dragClone.appendChild(cell);
  }
  document.body.appendChild(dragClone);
};

const moveDragClone = (clientX, clientY) => {
  if (!dragClone) return;
  dragClone.style.left = `${clientX + 8}px`;
  dragClone.style.top = `${clientY + 8}px`;
};

const updateDragCloneOrientation = () => {
  if (!dragClone) return;
  dragClone.classList.remove("row", "col");
  dragClone.classList.add(dragOrientation);
};

const highlightPlacement = (x, y, shipName) => {
  clearHighlights();
  const length = playerOne.gameboard.ships[shipName].length;
  const valid = playerOne.gameboard.canPlace(shipName, dragOrientation, x, y);

  for (let i = 0; i < length; i++) {
    const cx = dragOrientation === "col" ? x + i : x;
    const cy = dragOrientation === "row" ? y + i : y;
    if (cx >= 10 || cy >= 10) continue;
    const cell = realBoard.querySelector(`[data-x="${cx}"][data-y="${cy}"]`);
    if (cell)
      cell.classList.add(valid ? "placement-valid" : "placement-invalid");
  }
};

const clearHighlights = () => {
  realBoard
    .querySelectorAll(".placement-valid, .placement-invalid")
    .forEach((cell) => {
      cell.classList.remove("placement-valid", "placement-invalid");
    });
};

const initDragAndDrop = () => {
  interact(".ship-map").draggable({
    listeners: {
      start(event) {
        if (states.start) return;

        activeDragShipName = event.target.dataset.name;
        event.target.classList.add("is-dragging");
        createDragClone(activeDragShipName);
        moveDragClone(event.clientX0, event.clientY0);
      },

      move(event) {
        if (!activeDragShipName) return;
        moveDragClone(event.clientX, event.clientY);
        const cell = getCellFromPoint(event.clientX, event.clientY);
        if (cell) highlightPlacement(cell.x, cell.y, activeDragShipName);
        else clearHighlights();
      },

      end(event) {
        if (!activeDragShipName) return;

        event.target.classList.remove("is-dragging");

        if (dragClone) {
          dragClone.remove();
          dragClone = null;
        }

        const cell = getCellFromPoint(event.clientX, event.clientY);

        if (
          cell &&
          playerOne.gameboard.canPlace(
            activeDragShipName,
            dragOrientation,
            cell.x,
            cell.y,
          )
        ) {
          playerOne.gameboard.removeShip(activeDragShipName);
          playerOne.gameboard.place(
            activeDragShipName,
            dragOrientation,
            cell.x,
            cell.y,
          );

          // Mark this ship as placed — it disappears from mini grid
          placedShips.add(activeDragShipName);

          renderBoard(
            realBoard,
            playerOne.gameboard.board,
            playerOne.gameboard.hits,
            playerOne.gameboard.misses,
          );
          renderPlayerMiniGrid();

          // Enable start only when all ships are placed
          const allShipNames = Object.keys(Gameboard.VALID_SHIPS);
          const allPlaced = allShipNames.every((name) => placedShips.has(name));
          startBtnElem.disabled = !allPlaced;

          initDragAndDrop();
        }

        clearHighlights();
        activeDragShipName = null;
      },
    },
  });
};

const toggleOrientation = () => {
  dragOrientation = dragOrientation === "row" ? "col" : "row";
  rotateBtnElem.textContent = `Rotate: ${dragOrientation.toUpperCase()}`;
  updateDragCloneOrientation();

  if (activeDragShipName && dragClone) {
    const rect = dragClone.getBoundingClientRect();
    const cell = getCellFromPoint(rect.left, rect.top);
    if (cell) highlightPlacement(cell.x, cell.y, activeDragShipName);
  }
};

// ======= GAME LOGIC =======

const setStateMessage = (text) => {
  states.stateMessage = text;
  gameStateTextElem.textContent = text;
};

const checkWinner = () => {
  if (playerOne.gameboard.allSunk() || playerTwo.gameboard.allSunk()) {
    states.gameOver = true;
    const isComputerWin = playerOne.gameboard.allSunk();
    setStateMessage(isComputerWin ? "Computer wins!" : "You win!");
    winnerTextElem.textContent = isComputerWin ? "Computer" : "You";
    randomizeBtnElem.disabled = true;
    showOverPopover();
    return true;
  }
  return false;
};

const playTurn = (x, y) => {
  if (states.gameOver) return;

  const enemy = getEnemyPlayer();

  if (checkHasAttackedCoordinateBefore(enemy, x, y)) {
    setStateMessage("Already attacked that spot!");
    return;
  }

  const result = enemy.gameboard.receiveAttack(x, y);

  renderBoard(
    getElemBoardToRender(enemy),
    enemy.gameboard.board,
    enemy.gameboard.hits,
    enemy.gameboard.misses,
  );
  // Game is in progress — pass null so all ships show with hit tracking
  renderMiniGrid(getMiniGridToRender(enemy), enemy.gameboard, enemy.type, null);

  setStateMessage(result === "hit" ? "You hit a ship!" : "You missed!");

  if (checkWinner()) return;

  switchPlayerTurn();

  if (states.currentPlayer.type === "computer") {
    setTimeout(() => runPCTurn(), 500);
  }
};

const showOverPopover = () => {
  popOverElem.showPopover();
};

const getElemBoardToRender = (enemy) =>
  enemy.type === "computer" ? enemyBoard : realBoard;
const getMiniGridToRender = (enemy) =>
  enemy.type === "computer" ? enemyMinGridElem : realMiniGridElem;
const getEnemyPlayer = () =>
  states.currentPlayer === playerOne ? playerTwo : playerOne;
const genRandomInt = (max) => Math.floor(Math.random() * max);

const checkHasAttackedCoordinateBefore = (enemyPlayer, x, y) => {
  return (
    enemyPlayer.gameboard.hits.includes(`${x},${y}`) ||
    enemyPlayer.gameboard.misses.includes(`${x},${y}`)
  );
};

const switchPlayerTurn = () => {
  states.currentPlayer =
    states.currentPlayer === playerOne ? playerTwo : playerOne;
};

const renderBoards = () => {
  renderBoard(
    enemyBoard,
    playerTwo.gameboard.board,
    playerTwo.gameboard.hits,
    playerTwo.gameboard.misses,
  );
  renderBoard(
    realBoard,
    playerOne.gameboard.board,
    playerOne.gameboard.hits,
    playerOne.gameboard.misses,
  );
};

const createShips = () => {
  return Object.values(Gameboard.VALID_SHIPS).map(
    ([name, length]) => new Ship(name, length),
  );
};

const placeShipsAtRandomCoord = (playerBoard) => {
  const shipObjects = createShips();
  const DIRECTIONS = ["row", "col"];
  let count = 0;
  while (count < shipObjects.length) {
    try {
      const rx = genRandomInt(10);
      const ry = genRandomInt(10);
      const randomDirect = DIRECTIONS[genRandomInt(2)];
      playerBoard.place(shipObjects[count].name, randomDirect, rx, ry);
    } catch {
      count--;
    }
    count++;
  }
};

const resetGame = () => {
  states.gameOver = false;
  states.start = false;
  states.currentPlayer = playerOne;

  playerOne.gameboard.clear();
  playerTwo.gameboard.clear();
  resetAI();

  // Clear placed ships tracking
  placedShips.clear();

  startBtnElem.disabled = true;
  randomizeBtnElem.disabled = false;
  rotateBtnElem.disabled = false;

  renderBoards();
  renderPlayerMiniGrid();
  renderMiniGrid(enemyMinGridElem, playerTwo.gameboard, playerTwo.type, null);

  sections.forEach((s) => s.classList.add("fade"));
  realBoard.closest("section").classList.remove("fade");

  setStateMessage("Randomize or drag your ships to begin!");
  initDragAndDrop();
};

// ======= EVENT HANDLERS =======

const handlePlayerClick = (e) => {
  if (!e.target.hasAttribute("data-cell") || !states.start || states.gameOver)
    return;
  playTurn(+e.target.dataset.x, +e.target.dataset.y);
};

const handleRandomBtnClick = () => {
  playerOne.gameboard.clear();
  playerTwo.gameboard.clear();
  placeShipsAtRandomCoord(playerOne.gameboard);
  placeShipsAtRandomCoord(playerTwo.gameboard);
  resetAI();

  // Mark all ships as placed when randomizing
  placedShips.clear();
  Object.keys(Gameboard.VALID_SHIPS).forEach((name) => placedShips.add(name));

  renderBoards();
  renderPlayerMiniGrid(); // All ships hidden from mini grid (all on board)
  renderMiniGrid(enemyMinGridElem, playerTwo.gameboard, playerTwo.type, null);

  startBtnElem.disabled = false;
  setStateMessage("Ships placed! Drag to reposition or press Start.");
  initDragAndDrop();
};

const handleStartBtnClick = () => {
  if (startBtnElem.disabled) return;

  states.start = true;
  states.gameOver = false;
  states.currentPlayer = playerOne;

  sections.forEach((s) => s.classList.remove("fade"));

  // Re-render mini grid without placedShips filter so all ships show with hit tracking
  renderPlayerMiniGrid();

  startBtnElem.disabled = true;
  rotateBtnElem.disabled = true;
  setStateMessage("Your turn! Attack the enemy grid.");
};

const handlePlayAgainClick = () => {
  popOverElem.hidePopover();
  randomizeBtnElem.disabled = false;
  resetGame();
};

const handleRotateBtnClick = () => {
  if (states.start) return;
  toggleOrientation();
};

document.addEventListener("keydown", (e) => {
  if ((e.key === "r" || e.key === "R") && !states.start) toggleOrientation();
});

// ======= MAIN =======

const playerOne = new Player();
const playerTwo = new Player("computer");

const states = {
  gameOver: false,
  start: false,
  currentPlayer: playerOne,
  stateMessage: null,
  winner: null,
};

const realBoard = document.querySelector("[data-real-board]");
const enemyBoard = document.querySelector("[data-enemy-board]");
const gameStateTextElem = document.querySelector("[data-game-state-text]");
const realMiniGridElem = document.querySelector("[data-your-fleet-map]");
const enemyMinGridElem = document.querySelector("[data-enemy-fleet-map]");
const popOverElem = document.querySelector("[data-popover]");
const randomizeBtnElem = document.querySelector("[data-randomize-btn]");
const startBtnElem = document.querySelector("[data-start-btn]");
const playAgainBtnElem = document.querySelector("[data-play-again-btn]");
const winnerTextElem = document.querySelector("[data-winner-text]");
const rotateBtnElem = document.querySelector("[data-rotate-btn]");
const sections = document.querySelectorAll(".main section");

// Initial render
renderBoards();
renderPlayerMiniGrid();
renderMiniGrid(enemyMinGridElem, playerTwo.gameboard, playerTwo.type, null);
setStateMessage("Randomize or drag your ships to begin!");

// Keep your grid visible for drag, fade enemy until game starts
realBoard.closest("section").classList.remove("fade");

// Event listeners
enemyBoard.addEventListener("click", handlePlayerClick);
randomizeBtnElem.addEventListener("click", handleRandomBtnClick);
startBtnElem.addEventListener("click", handleStartBtnClick);
playAgainBtnElem.addEventListener("click", handlePlayAgainClick);
rotateBtnElem.addEventListener("click", handleRotateBtnClick);

initDragAndDrop();
