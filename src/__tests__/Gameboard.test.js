import { Gameboard } from "../models/Gameboard.js";
import { Ship } from "../models/Ship.js";

describe("Gameboard", () => {
  let board;
  beforeEach(() => {
    board = new Gameboard();
  });
  it("should be able to place ships at specific coordinates by calling the ship factory or class.", () => {
    board.place("destroyer", "row", 0, 0);
    expect(board.get(0, 0).name).toBe("destroyer");

    board.place("carrier", "col", 1, 0);
    expect(board.get(2, 0).name).toBe("carrier");
  });

  it(`
    should have a receiveAttack function that takes a pair of coordinates, 
    determines whether or not the attack hit a ship and then sends the ‘hit’ function to the correct ship, 
    or records the coordinates of the missed shot.
    `, () => {
    board.place("destroyer", "row", 0, 1);
    expect(board.receiveAttack(0, 1)).toBe("hit");

    expect(board.receiveAttack(1, 1)).toBe("miss");
    expect(board.misses).toContain("1,1");
  });

  it("should keep track of missed attacks so they can display them properly.", () => {
    expect(board.receiveAttack(1, 1)).toBe("miss");
    expect(board.misses).toContain("1,1");

    expect(board.receiveAttack(9, 9)).toBe("miss");
    expect(board.misses).toContain("9,9");
  });

  it("should be able to report whether or not all of their ships have been sunk.", () => {
    // When board had no ships
    expect(board.allSunk()).toBe(false);

    // Creates an object of ship objects
    const ships = Object.fromEntries(
      Object.values(Gameboard.VALID_SHIPS).map(([name, length]) => [
        name,
        new Ship(name, length),
      ]),
    );

    board.place(ships.carrier.name, "row", 0, 0);
    board.place(ships.battleship.name, "row", 1, 0);
    board.place(ships.cruiser.name, "row", 2, 0);
    board.place(ships.submarine.name, "row", 3, 0);
    board.place(ships.destroyer.name, "row", 4, 0);

    const attackCord = [
      [5, 0, 0],
      [4, 1, 0],
      [3, 2, 0],
      [3, 3, 0],
      [2, 4, 0],
    ];

    attackCord.forEach(([times, x, y]) => {
      for (let i = 0; i < times; i++) {
        board.receiveAttack(x, y);
      }
    });

    // When board has ships and all have be hit completely
    expect(board.allSunk()).toBe(true);
  });
});
