export class Ship {
  #length;

  constructor(name, length) {
    this.name = name;
    this.#length = length;
    this.hits = 0;
    this.sunk = false;
  }

  get length() {
    return this.#length;
  }

  hit = () => {
    if (this.sunk) return;

    this.hits++;
    if (this.hits === this.length) {
      this.sunk = true;
    }
  };

  isSunk = () => {
    return this.sunk;
  };
}
