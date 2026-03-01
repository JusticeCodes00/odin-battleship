export const renderBoard = (container, board, hits, misses) => {
  container.textContent = "";
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const div = document.createElement("div");
      div.classList.add("cell");

      if (hits.includes(`${i},${j}`)) div.classList.add("hit");
      if (board[i][j][0] != null) div.classList.add("ship");
      if (misses.includes(`${i},${j}`)) div.classList.add("miss");

      div.dataset.cell = "";
      div.dataset.x = i;
      div.dataset.y = j;
      container.append(div);
    }
  }
};

/**
 * Renders the mini fleet grid.
 *
 * @param {HTMLElement} elem - The container element
 * @param {Gameboard} board - The gameboard instance
 * @param {string} playerType - "human" or "computer"
 * @param {Set} placedShips - (optional) Set of ship names that have been placed on the board.
 *                            During placement phase, placed ships are hidden from the mini grid.
 *                            Pass null/undefined during game phase to show all ships normally.
 */
export const renderMiniGrid = (elem, board, playerType, placedShips = null) => {
  elem.textContent = "";
  const ships = Object.values(board.ships);
  const isPlacementPhase = placedShips !== null;

  ships.forEach((ship) => {
    const shipElem = document.createElement("div");
    shipElem.dataset.name = ship.name;
    shipElem.classList.add("ship-map");

    // During placement phase, hide ships that are already on the board
    if (isPlacementPhase && placedShips.has(ship.name)) {
      shipElem.classList.add("ship-map--placed");
    }

    for (let i = 0; i < 5; i++) {
      const innerDiv = document.createElement("div");

      if (ship.hits > i) innerDiv.classList.add("hit");
      if (ship.length > i) innerDiv.classList.add("ship");

      // Hide enemy ship positions, only show hits
      // If (playerType === "computer") innerDiv.classList.remove("ship");

      shipElem.appendChild(innerDiv);
    }

    elem.appendChild(shipElem);
  });
};
