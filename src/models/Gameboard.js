import { Ship } from "../models/Ship.js";

export class Gameboard {
  static GRID_COLUMN_LENGTH = 10;
  static GRID_ROW_LENGTH = Gameboard.GRID_COLUMN_LENGTH;
  static VALID_SHIPS = [
    "carrier",
    "battleship",
    "cruiser",
    "submarine",
    "destroyer",
  ];

  static VALID_DIRECTIONS = ["row", "col"];

  constructor() {
    this.oceanGridBoard = this.createGrid();
    this.missedAttacks = new Set();
    this.successfulAttacks = new Set();
    this.ships = {
      carrier: new Ship("carrier", 5),
      battleship: new Ship("battleship", 4),
      cruiser: new Ship("cruiser", 3),
      submarine: new Ship("submarine", 3),
      destroyer: new Ship("destroyer", 2),
    };
  }

  createGrid = () => {
    const grid = [];

    // Create 10 rows
    for (let i = 0; i < Gameboard.GRID_ROW_LENGTH; i++) {
      const row = [];

      // Push 10 new arrays in to current row
      for (let j = 0; j < Gameboard.GRID_COLUMN_LENGTH; j++) {
        if (i === 1 && j === 1) {
          row.push([]);
          continue;
        }
        row.push([]);
      }
      grid.push(row);
    }
    return grid;
  };

  placeShip = ({ name, direction, x, y } = {}) => {
    if (!Gameboard.VALID_SHIPS.includes(name))
      throw new Error(`Invalid ship name: ${name}`);

    if (!Gameboard.VALID_DIRECTIONS.includes(direction))
      throw new Error(`Invalid direction: ${direction}`);

    this.#checkOutOfBounds(x, y);
    // Loop according to the length of the ship specified and place ship

    for (let i = 0; i < this.ships[name].length; i++) {
      if (direction === "row") {
        this.#checkOverlap(x, y + i);
        this.oceanGridBoard[x][y + i].push(this.ships[name]);
      }

      if (direction === "col") {
        this.#checkOverlap(x + i, y);
        this.oceanGridBoard[x + i][y].push(this.ships[name]);
      }
    }
  };

  #checkOutOfBounds = (x, y) => {
    if (x < 0 || y < 0 || x >= 10 || y >= 10)
      throw new RangeError("Ship placement out of bounds.");
  };

  #checkOverlap = (x, y) => {
    if (this.oceanGridBoard[x][y][0])
      throw new RangeError("Ship overlaps with another ship.");
  };

  getBoard = () => {
    return this.oceanGridBoard;
  };

  receiveAttack = ({ x, y }) => {
    if (this.oceanGridBoard[x][y][0] == null) {
      this.missedAttacks.add(`${x},${y}`);
      return "miss";
    }

    this.successfulAttacks.add(`${x},${y}`);
    this.oceanGridBoard[x][y][0].hit();
    return "hit";
  };

  getHits = () => [...this.successfulAttacks];

  getMissedAttacks = () => [...this.missedAttacks];

  allSunk = () => {
    return Object.values(this.ships).every((ship) => ship.isSunk());
  };
}
