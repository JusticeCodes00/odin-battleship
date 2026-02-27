import { Ship } from "../models/Ship.js";

describe("Ship", () => {
  const carrier = new Ship("carrier", 5);

  it("should have a hit function that  increases the number of hits in a ship ", () => {
    carrier.hit();
    expect(carrier.hits).toBe(1);
    carrier.hit();
    expect(carrier.hits).toBe(2);
  });

  it("should have an isSunk function that calculates whether a ship is considered sunk based on its length and the number of hits it has received.", () => {
    for (let i = 0; i < 5; i++) {
      carrier.hit();
    }
    expect(carrier.isSunk()).toBe(true);
  });
});
