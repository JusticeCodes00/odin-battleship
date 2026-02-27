import { Gameboard } from "../models/Gameboard.js";

export class Player {
  static VALID_TYPES = ["human", "computer"];

  constructor(type = Player.VALID_TYPES[0]) {
    this.#validateType(type);

    this.type = type;
    this.gameboard = new Gameboard();
  }

  #validateType = (type) => {
    if (!Player.VALID_TYPES.includes(type)) {
      throw new Error(
        `Player type must be either '${Player.VALID_TYPES.join("' or '")}'`,
      );
    }
  };
}
