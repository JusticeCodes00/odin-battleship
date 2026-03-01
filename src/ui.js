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

export const renderMiniGrid = (elem, board, playerType) => {
  elem.textContent = "";
  const ships = Object.values(board.ships);

  ships.map((ship) => {
    const shipElem = document.createElement("div");
    shipElem.dataset.name = ship.name;
    shipElem.classList.add("ship-map");

    for (let i = 0; i < 5; i++) {
      const innerDiv = document.createElement("div");

      if (ship.hits > i) innerDiv.classList.add("hit");

      if (ship.length > i) innerDiv.classList.add("ship");

      shipElem.appendChild(innerDiv);
    }
    elem.appendChild(shipElem);
  });
};
