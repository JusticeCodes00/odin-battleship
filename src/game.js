import { renderBoard, renderMiniGrid } from "./ui.js";
import { Gameboard } from "./models/Gameboard.js";
import { Player } from "./models/Player.js";
import { Ship } from "./models/Ship.js";
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
  ) {
    return [nx, ny];
  }
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
      // Reverse direction from firstHit
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
  renderMiniGrid(realMiniGridElem, playerOne.gameboard, playerOne.type);

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

    // If the ship is now sunk, reset AI to hunt for next ship
    const hitShip = playerOne.gameboard.get(x, y);
    if (hitShip && hitShip.isSunk()) {
      resetAI();
    }
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

// ======= GAME LOGIC =======

const setStateMessage = (text) => {
  states.stateMessage = text;
  gameStateTextElem.textContent = text;
};

const checkWinner = () => {
  if (playerOne.gameboard.allSunk() || playerTwo.gameboard.allSunk()) {
    states.gameOver = true;
    const winnerMsg = playerOne.gameboard.allSunk()
      ? "Computer wins!"
      : "You win!";
    setStateMessage(winnerMsg);
    winnerTextElem.textContent = playerOne.gameboard.allSunk()
      ? "Computer"
      : "You";
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
  renderMiniGrid(getMiniGridToRender(enemy), enemy.gameboard, enemy.type);

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

const getElemBoardToRender = (enemy) => {
  return enemy.type === "computer" ? enemyBoard : realBoard;
};

const getMiniGridToRender = (enemy) => {
  return enemy.type === "computer" ? enemyMinGridElem : realMiniGridElem;
};

const getEnemyPlayer = () => {
  return states.currentPlayer === playerOne ? playerTwo : playerOne;
};

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

  startBtnElem.disabled = true;
  renderBoards();
  renderMiniGrid(realMiniGridElem, playerOne.gameboard, playerOne.type);
  renderMiniGrid(enemyMinGridElem, playerTwo.gameboard, playerTwo.type);

  // Fade both sections until game starts
  sections.forEach((s) => s.classList.add("fade"));

  setStateMessage("Randomize your ships to begin!");
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

  renderBoards();
  renderMiniGrid(realMiniGridElem, playerOne.gameboard, playerOne.type);
  renderMiniGrid(enemyMinGridElem, playerTwo.gameboard, playerTwo.type);

  // Enable start button once ships are placed
  startBtnElem.disabled = false;
  setStateMessage("Ships placed! Press Start when ready.");
};

const handleStartBtnClick = () => {
  if (startBtnElem.disabled) return;

  states.start = true;
  states.gameOver = false;
  states.currentPlayer = playerOne;

  // Remove fade from both sections
  sections.forEach((s) => s.classList.remove("fade"));

  startBtnElem.disabled = true;
  setStateMessage("Your turn! Attack the enemy grid.");
};

const handlePlayAgainClick = () => {
  popOverElem.hidePopover();
  randomizeBtnElem.disabled = false;
  resetGame();
};

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
const sections = document.querySelectorAll(".main section");

// Initial render
renderBoards();
renderMiniGrid(realMiniGridElem, playerOne.gameboard, playerOne.type);
renderMiniGrid(enemyMinGridElem, playerTwo.gameboard, playerTwo.type);
setStateMessage("Randomize your ships to begin!");

// Event listeners
enemyBoard.addEventListener("click", handlePlayerClick);
randomizeBtnElem.addEventListener("click", handleRandomBtnClick);
startBtnElem.addEventListener("click", handleStartBtnClick);
playAgainBtnElem.addEventListener("click", handlePlayAgainClick);
