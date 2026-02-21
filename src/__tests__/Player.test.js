import { Player } from "../models/Player.js";

describe("Player", () => {
  let player = new Player();

  it("should be of two types 'human' and 'computer'.", () => {
    expect(player.type).toBe("human");

    player = new Player("computer");

    expect(player.type).toBe("computer");
  });

  it("should throw if invalid player type is passed during declaration", () => {
    expect(() => new Player("wrong type")).toThrow(
      "Player type must be either 'human' or 'computer'",
    );
  });

  it("should have a gameboard", () => {
    expect(player.gameboard).toBeDefined();
  });
});
