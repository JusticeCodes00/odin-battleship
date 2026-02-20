import { Gameboard } from "../models/Gameboard.js";

describe("Gameboard", () => {
  let board = new Gameboard();

  const cols = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
  };

  const rows = {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
    8: 7,
    9: 8,
    10: 9,
  };

  beforeEach(() => {
    board = new Gameboard();
  });

  it("should place ship on a row", () => {
    const ship = {
      name: "carrier",
      direction: "row",
      x: rows[1],
      y: cols["A"],
    };

    board.placeShip(ship);

    expect(board.getBoard()[ship.x][cols["A"]][0].name).toBe("carrier");
    expect(board.getBoard()[ship.x][cols["B"]][0].name).toBe("carrier");
    expect(board.getBoard()[ship.x][cols["C"]][0].name).toBe("carrier");
    expect(board.getBoard()[ship.x][cols["D"]][0].name).toBe("carrier");
    expect(board.getBoard()[ship.x][cols["E"]][0].name).toBe("carrier");
  });

  it("should place ship on a column", () => {
    const ship = {
      name: "destroyer",
      direction: "col",
      x: rows[2],
      y: cols["A"],
    };

    board.placeShip(ship);

    expect(board.getBoard()[rows[2]][ship.y][0].name).toBe("destroyer");
    expect(board.getBoard()[rows[3]][ship.y][0].name).toBe("destroyer");
  });

  it("should throw if player provides coordinates less than zero", () => {
    const ship = {
      name: "carrier",
      direction: "row",
      x: -1,
      y: -1,
    };

    expect(() => board.placeShip(ship)).toThrow(
      "Ship placement out of bounds.",
    );

    ship.direction = "col";

    expect(() => board.placeShip(ship)).toThrow(
      "Ship placement out of bounds.",
    );
  });

  it("should throw if player provides coordinates greater than or equal to 10", () => {
    const ship = {
      name: "carrier",
      direction: "row",
      x: 10,
      y: 10,
    };

    expect(() => board.placeShip(ship)).toThrow(
      "Ship placement out of bounds.",
    );

    ship.describe = "col";

    expect(() => board.placeShip(ship)).toThrow(
      "Ship placement out of bounds.",
    );
  });

  it("should throw when an invalid ship name is provided", () => {
    const ship = {
      name: "wrong name",
      direction: "row",
      x: 0,
      y: 0,
    };

    expect(() => board.placeShip(ship)).toThrow(
      `Invalid ship name: ${ship.name}`,
    );
  });

  it("should throw when an invalid direction is provided", () => {
    const ship = {
      name: "battleship",
      direction: "bad direction",
      x: 0,
      y: 0,
    };

    expect(() => board.placeShip(ship)).toThrow(
      `Invalid direction: ${ship.direction}`,
    );
  });

  it("should throw if player provided coordinate will cause an overlap", () => {
    const ship = {
      name: "destroyer",
      direction: "row",
      x: rows[2],
      y: cols["I"],
    };

    board.placeShip(ship);

    expect(() => board.placeShip(ship)).toThrow(
      "Ship overlaps with another ship.",
    );

    ship.direction = "col";
    ship.x = rows[1];

    expect(() => board.placeShip(ship)).toThrow(
      "Ship overlaps with another ship.",
    );
  });

  it("should receive a hit", () => {
    const attack = { x: rows[1], y: cols["A"] };

    const ship = {
      name: "destroyer",
      direction: "col",
      x: attack.x,
      y: attack.y,
    };

    board.placeShip(ship);

    expect(board.receiveAttack(attack)).toBe("hit");

    expect(board.getHits()).toContain(`${attack.x},${attack.y}`);

    expect(board.getBoard()[ship.x][ship.y][0].hits).toBe(1);
  });

  it("should record a miss", () => {
    const attack = { x: rows[1], y: cols["A"] };

    expect(board.receiveAttack(attack)).toBe("miss");

    expect(board.getMissedAttacks()).toContain(`${attack.x},${attack.y}`);
  });

  it("should be able to report whether or not all of it's ships have been sunk.", () => {
    const destroyer = {
      name: "destroyer",
      direction: "col",
      len: 2,
      x: rows[9],
      y: cols["A"],
    };

    const battleship = {
      name: "battleship",
      direction: "col",
      len: 4,
      x: rows[1],
      y: cols["J"],
    };

    const carrier = {
      name: "carrier",
      direction: "col",
      len: 5,
      x: rows[1],
      y: cols["A"],
    };

    const submarine = {
      name: "submarine",
      direction: "col",
      len: 3,
      x: rows[8],
      y: cols["J"],
    };

    const cruiser = {
      name: "cruiser",
      direction: "row",
      len: 3,
      x: rows[1],
      y: cols["B"],
    };

    const ships = [carrier, battleship, submarine, destroyer, cruiser];

    ships.forEach((ship) => {
      board.placeShip(ship);
    });

    ships.forEach((ship) => {
      for (let i = 0; i < ship.len; i++) {
        if (ship.direction === "col") {
          board.receiveAttack({ x: ship.x + i, y: ship.y });
        } else if (ship.direction === "row") {
          board.receiveAttack({ x: ship.x, y: ship.y + i });
        }
      }
    });

    expect(board.allSunk()).toBe(true);
  });
});
