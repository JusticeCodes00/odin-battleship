import { Player } from "../models/Player.js";
import { Gameboard } from "../models/Gameboard.js";

describe("Player", () => {
  let player = new Player();

  it("should have two types of players ‘real’ players and ‘computer’ players.", () => {
    expect(player.type).toBe("human");

    player = new Player("computer");

    expect(player.type).toBe("computer");
  });

  it("should throw if invalid player type is passed during declaration", () => {
    expect(() => new Player("wrong type")).toThrow(
      "Player type must be either 'human' or 'computer'",
    );
  });

  it("should contain its own gameboard", () => {
    expect(player.gameboard).toBeDefined();
    expect(player.gameboard instanceof Gameboard).toBe(true);
  });
});
