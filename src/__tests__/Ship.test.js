import { Ship } from "../models/Ship.js";

describe("Ship", () => {
  let len = 5;
  const carrier = new Ship("carrier", len);

  it("should record hits correctly", () => {
    carrier.hit();
    expect(carrier.hits).toBe(1);
    carrier.hit();
    expect(carrier.hits).toBe(2);
  });

  it("should sink when hits is equal to length", () => {
    for (let i = 0; i < len; i++) {
      carrier.hit();
    }
    expect(carrier.isSunk()).toBe(true);
  });
});
