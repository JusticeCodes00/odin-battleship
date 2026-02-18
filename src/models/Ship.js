export class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
    this.hits = 0;
    this.sunk = false;
  }

  hit = () => {
    if (this.hits === this.length) return this.hits;
    return ++this.hits;
  };

  isSunk = () => {
    this.sunk = true;
    return this.sunk;
  };
}
