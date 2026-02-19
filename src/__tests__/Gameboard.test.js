import { Gameboard } from "../models/Gameboard.js";

describe("Gameboard", () => {
  const board = new Gameboard();

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

  it("should place ships at specific coordinates", () => {
    const ship = {
      name: "carrier",
      direction: "row",
      x: rows[1],
      y: cols[A],
    };

    board.placeShip(ship);

    expect(board.getBoard()[1][A].name).toBe("carrier");
    expect(board.getBoard()[1][B].name).toBe("carrier");
    expect(board.getBoard()[1][C].name).toBe("carrier");
    expect(board.getBoard()[1][D].name).toBe("carrier");
    expect(board.getBoard()[1][E].name).toBe("carrier");

    ship = {
      name: "destroyer",
      direction: "column",
      y: cols[A],
      x: rows[2],
    };

    board.placeShip(ship);

    expect(board.getBoard()[A][2].name).toBe("destroyer");
    expect(board.getBoard()[A][3].name).toBe("destroyer");
  });

  const coordinate = { x: rows[1], y: cols[A] };

  it("should receive a hit", () => {
    expect(board.getBoard()[coordinate.x][coordinate.y].getHits).toBe(1);
  });

  it("should record a miss", () => {
    expect(board.getMissedAttacks()).toContainEqual([
      coordinate.x,
      coordinate.y,
    ]);
  });
});
