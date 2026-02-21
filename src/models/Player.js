import { Gameboard } from "../models/Gameboard.js";

export class Player {
  static VALID_TYPES = ["human", "computer"];
  #type;
  #gameboard;

  constructor(type = Player.VALID_TYPES[0]) {
    this.#validateType(type);

    this.#type = type;
    this.#gameboard = new Gameboard();
  }

  get gameboard() {
    return this.#gameboard;
  }

  get type() {
    return this.#type;
  }

  #validateType = (type) => {
    if (!Player.VALID_TYPES.includes(type)) {
      throw new Error(
        `Player type must be either '${Player.VALID_TYPES.join("' or '")}'`,
      );
    }
  };
}
