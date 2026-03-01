import { Ship } from "../models/Ship.js";

export class Gameboard {
  static GRID_SIZE = 10;
  static VALID_SHIPS = {
    carrier: ["carrier", 5],
    battleship: ["battleship", 4],
    cruiser: ["cruiser", 3],
    submarine: ["submarine", 3],
    destroyer: ["destroyer", 2],
  };
  static VALID_DIRECTIONS = ["row", "col"];

  #board;
  #misses;
  #hits;

  constructor() {
    this.#board = this.createBoard();
    this.#misses = new Set();
    this.#hits = new Set();

    this.ships = Object.fromEntries(
      Object.values(Gameboard.VALID_SHIPS).map(([name, length]) => [
        name,
        new Ship(name, length),
      ]),
    );
  }

  createBoard = () => {
    const grid = [];
    for (let i = 0; i < Gameboard.GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < Gameboard.GRID_SIZE; j++) {
        row.push([]);
      }
      grid.push(row);
    }
    return grid;
  };

  place = (name, direction, x, y) => {
    this.#validateShipInfo(name, direction, x, y);

    const length = this.ships[name].length;
    if (direction === "row") this.#checkOutOfBounds(x, y + length - 1);
    if (direction === "col") this.#checkOutOfBounds(x + length - 1, y);

    // Validate all first, then place
    for (let i = 0; i < length; i++) {
      if (direction === "row") this.#checkOverlap(x, y + i);
      if (direction === "col") this.#checkOverlap(x + i, y);
    }

    for (let i = 0; i < length; i++) {
      if (direction === "row") this.#board[x][y + i].push(this.ships[name]);
      if (direction === "col") this.#board[x + i][y].push(this.ships[name]);
    }
  };

  // Check if placement is valid without modifying the board
  canPlace = (name, direction, x, y) => {
    try {
      this.#validateShipName(name);
      this.#validateShipDirection(direction);

      const length = this.ships[name].length;

      for (let i = 0; i < length; i++) {
        const cx = direction === "col" ? x + i : x;
        const cy = direction === "row" ? y + i : y;

        if (
          cx < 0 ||
          cy < 0 ||
          cx >= Gameboard.GRID_SIZE ||
          cy >= Gameboard.GRID_SIZE
        )
          return false;

        // Allow overlapping with self (so you can re-place same ship)
        if (
          this.#board[cx][cy][0] &&
          this.#board[cx][cy][0] !== this.ships[name]
        )
          return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  // Remove a ship from the board without resetting hits/misses
  removeShip = (name) => {
    for (let i = 0; i < Gameboard.GRID_SIZE; i++) {
      for (let j = 0; j < Gameboard.GRID_SIZE; j++) {
        if (this.#board[i][j][0] === this.ships[name]) {
          this.#board[i][j] = [];
        }
      }
    }
  };

  #validateShipInfo = (name, direction, x, y) => {
    this.#validateShipName(name);
    this.#validateShipDirection(direction);
    this.#checkOutOfBounds(x, y);
  };

  #validateShipDirection = (direction) => {
    if (!Gameboard.VALID_DIRECTIONS.includes(direction))
      throw new Error(`Invalid direction: ${direction}`);
  };

  #validateShipName = (name) => {
    if (!Gameboard.VALID_SHIPS[name])
      throw new Error(`Invalid ship name: ${name}`);
  };

  #checkOutOfBounds = (x, y) => {
    if (x < 0 || y < 0 || x >= Gameboard.GRID_SIZE || y >= Gameboard.GRID_SIZE)
      throw new RangeError("Ship placement out of bounds.");
  };

  #checkOverlap = (x, y) => {
    if (this.#board[x][y][0]) {
      throw new RangeError("Ship overlaps with another.");
    }
  };

  get board() {
    return this.#board;
  }

  receiveAttack = (x, y) => {
    if (this.#board[x][y][0] == null) {
      this.#misses.add(`${x},${y}`);
      return "miss";
    }

    this.#hits.add(`${x},${y}`);
    this.#board[x][y][0].hit();
    return "hit";
  };

  get = (x, y) => this.#board[x][y][0];

  get hits() {
    return [...this.#hits];
  }

  get misses() {
    return [...this.#misses];
  }

  allSunk = () => {
    return Object.values(this.ships).every((ship) => ship.isSunk());
  };

  clear = () => {
    this.#board = this.createBoard();
    this.#misses = new Set();
    this.#hits = new Set();

    this.ships = Object.fromEntries(
      Object.values(Gameboard.VALID_SHIPS).map(([name, length]) => [
        name,
        new Ship(name, length),
      ]),
    );
  };
}
