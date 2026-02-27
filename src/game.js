import { renderBoard, renderMiniGrid } from "./ui.js";
import { Gameboard } from "./models/Gameboard.js";
import { Player } from "./models/Player.js";
import { Ship } from "./models/Ship.js";
import interact from "interactjs";

const playTurn = (x, y) => {
  if (store.gameOver) return;

  const enemy = getEnemyPlayer();

  // Prevent human from attacking same coordinate twice
  if (checkHasAttackedCoordinateBefore(enemy, x, y)) {
    store.stateMessage = "Already attacked that spot";
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

  if (winner) handleGameOver();

  switchPlayerTurn();

  if (store.currentPlayer.type === "computer") runPCTurn();
};

const handleGameOver = () => {
  store.gameOver = true;
  store.stateMessage = "Game Over!!";
  store.winner = store.currentPlayer;
};

const getElemBoardToRender = (enemy) => {
  return enemy.type === "computer" ? enemyBoard : realBoard;
};

const getEnemyPlayer = () =>
  store.currentPlayer === playerOne ? playerTwo : playerOne;

const runPCTurn = () => {
  while (true) {
    const rx = Math.floor(Math.random() * 10);
    const ry = Math.floor(Math.random() * 10);

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
  store.currentPlayer =
    store.currentPlayer === playerOne ? playerTwo : playerOne;
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

const handlePlayerClick = (e) => {
  if (!e.target.hasAttribute("data-cell") || store.gameOver) return;

  const x = +e.target.dataset.x;
  const y = +e.target.dataset.y;

  playTurn(x, y);
};

//  === MAIN ===

const playerOne = new Player(); // Default is human
const playerTwo = new Player("computer");

const store = {
  gameOver: false,
  currentPlayer: playerOne,
  stateMessage: null,
  winner: null,
};

// List of ship objects
const ships = Object.fromEntries(
  Object.values(Gameboard.VALID_SHIPS).map(([name, length]) => [
    name,
    new Ship(name, length),
  ]),
);

playerOne.gameboard.place(ships.carrier.name, "row", 0, 0);
playerOne.gameboard.place(ships.battleship.name, "row", 1, 0);
playerOne.gameboard.place(ships.cruiser.name, "row", 2, 0);
playerOne.gameboard.place(ships.submarine.name, "row", 3, 0);
playerOne.gameboard.place(ships.destroyer.name, "row", 4, 0);

playerTwo.gameboard.place(ships.carrier.name, "row", 0, 0);
playerTwo.gameboard.place(ships.battleship.name, "row", 1, 0);
playerTwo.gameboard.place(ships.cruiser.name, "row", 2, 0);
playerTwo.gameboard.place(ships.submarine.name, "row", 3, 0);
playerTwo.gameboard.place(ships.destroyer.name, "row", 4, 0);

const realBoard = document.querySelector("[data-real-board]");
const enemyBoard = document.querySelector("[data-enemy-board]");
const gameStateTextElem = document.querySelector("[data-game-state-text]");
const realFleetMapElem = document.querySelector("[data-your-fleet-map]");
const enemyFleetMapElem = document.querySelector("[data-enemy-fleet-map]");

// Initial board rendering
renderBoards();
renderMiniGrid(realFleetMapElem, playerOne.gameboard, playerOne.type);
renderMiniGrid(enemyFleetMapElem, playerTwo.gameboard, playerTwo.type);

enemyBoard.addEventListener("click", handlePlayerClick);
