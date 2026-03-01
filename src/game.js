import { renderBoard, renderMiniGrid } from "./ui.js";
import { Gameboard } from "./models/Gameboard.js";
import { Player } from "./models/Player.js";
import { Ship } from "./models/Ship.js";

const playTurn = (x, y) => {
  if (states.gameOver) return;

  const enemy = getEnemyPlayer();

  // Prevent human from attacking same coordinate twice
  if (checkHasAttackedCoordinateBefore(enemy, x, y)) {
    states.stateMessage = "Already attacked that spot";
    return;
  }

  enemy.gameboard.receiveAttack(x, y); // Attack enemy board

  const boardToRender = getElemBoardToRender(enemy); // Get the enemy grid on the DOM to render

  // Render the enemy board only
  renderBoard(
    boardToRender,
    enemy.gameboard.board,
    enemy.gameboard.hits,
    enemy.gameboard.misses,
  );

  const winner = playerOne.gameboard.allSunk() || playerTwo.gameboard.allSunk();

  if (winner) showOverPopover();

  switchPlayerTurn();

  if (states.currentPlayer.type === "computer") runPCTurn();
};

const showOverPopover = () => {
  popOverElem.showPopover();
};

const getElemBoardToRender = (enemy) =>
  enemy.type === "computer" ? enemyBoard : realBoard;

const getEnemyPlayer = () => {
  states.currentPlayer === playerOne ? playerTwo : playerOne;
};

const genRandomInt = (max) => Math.floor(Math.random() * max);

const runPCTurn = () => {
  while (true) {
    const rx = genRandomInt(10);
    const ry = genRandomInt(10);

    if (!checkHasAttackedCoordinateBefore(playerOne, rx, ry)) {
      playTurn(rx, ry);
      return;
    }
  }
};

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
  const shipInfo = Object.values(Gameboard.VALID_SHIPS);
  return shipInfo.map(([name, length]) => new Ship(name, length));
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

// EventHandlers
const handlePlayerClick = (e) => {
  if (!e.target.hasAttribute("data-cell") || !states.start || states.gameOver)
    return;

  const x = +e.target.dataset.x;
  const y = +e.target.dataset.y;

  playTurn(x, y);
};

const handleRandomBtnClick = () => {
  playerOne.gameboard.clear();
  playerTwo.gameboard.clear();
  placeShipsAtRandomCoord(playerOne.gameboard);
  placeShipsAtRandomCoord(playerTwo.gameboard);

  renderBoards();
};

//  === MAIN ===

const playerOne = new Player(); // Default is human
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
const realFleetMapElem = document.querySelector("[data-your-fleet-map]");
const enemyFleetMapElem = document.querySelector("[data-enemy-fleet-map]");
const popOverElem = document.querySelector("[data-popover]");
const randomizeBtnElem = document.querySelector("[data-randomize-btn]");

// Initial board rendering
renderBoards();
renderMiniGrid(realFleetMapElem, playerOne.gameboard, playerOne.type);
renderMiniGrid(enemyFleetMapElem, playerTwo.gameboard, playerTwo.type);

// Event Listeners
enemyBoard.addEventListener("click", handlePlayerClick);
randomizeBtnElem.addEventListener("click", handleRandomBtnClick);
