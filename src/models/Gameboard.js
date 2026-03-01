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

    // Pre creates ships when board is created
    this.ships = Object.fromEntries(
      Object.values(Gameboard.VALID_SHIPS).map(([name, length]) => [
        name,
        new Ship(name, length),
      ]),
    );
  }

  createBoard = () => {
    const grid = [];

    // Loop for rows
    for (let i = 0; i < Gameboard.GRID_SIZE; i++) {
      const row = [];

      // Loop for columns
      for (let j = 0; j < Gameboard.GRID_SIZE; j++) {
        row.push([]);
      }
      grid.push(row);
    }
    return grid;
  };

  place = (name, direction, x, y) => {
    this.#validateShipInfo(name, direction, x, y);

    // Validate ALL coordinates first before touching the board
    for (let i = 0; i < this.ships[name].length; i++) {
      if (direction === "row") this.#checkOverlap(x, y + i);
      if (direction === "col") this.#checkOverlap(x + i, y);
    }

    // Only place if everything passed
    for (let i = 0; i < this.ships[name].length; i++) {
      if (direction === "row") this.#board[x][y + i].push(this.ships[name]);
      if (direction === "col") this.#board[x + i][y].push(this.ships[name]);
    }
  };

  #validateShipInfo = (name, direction, x, y) => {
    this.#validateShipName(name);
    this.#validateShipDirection(direction);
    this.#checkOutOfBounds(x, y);

    const length = this.ships[name].length;
    if (direction === "row") this.#checkOutOfBounds(x, y + length - 1);
    if (direction === "col") this.#checkOutOfBounds(x + length - 1, y);
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

new Gameboard();
