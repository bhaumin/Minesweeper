class Game {
  constructor(rows, cols) {
    if (rows > 26 || cols > 26) {
      throw new Error("Rows and Columns should be less than or equal to 26");
    }

    this.separator = "\t";
    this.newline = "\n";
    this.maskChar = ".";
    this.blankChar = "";
    this.mineChar = "*";
    // Between 1 to 30
    this.mineProbabilityPercent = 10;
    this.numOfRows = rows;
    this.numOfCols = cols;
    this.intMatrix = new Array(rows);
    this.extMatrix = new Array(rows);
    this.mineLocations = [];
    this.cellsOpenedCount = 0;
    this.steppedOnMine = false;
    this.gameOver = false;

    for (let i = 0; i < this.extMatrix.length; i++) {
      this.intMatrix[i] = new Array(cols).fill(null);
      this.extMatrix[i] = new Array(cols).fill(this.maskChar);
    }
  }

  openCell(cellId) {
    const cell = this.getCellFromId(cellId);
    if (!cell) {
      return false;
    }

    if (this.cellsOpenedCount === 0) {
      // Only on first open
      this.populateInternalMatrixWithMines(cell);
      // this.printIntMatrix();
    }

    const [r, c] = cell;

    this.extMatrix[r][c] = this.intMatrix[r][c];
    this.cellsOpenedCount++;

    if (this.intMatrix[r][c] === this.mineChar) {
      this.gameOver = true;
      this.steppedOnMine = true;
      this.openAllUnopenedCells();
    } else if (this.intMatrix[r][c] === this.blankChar) {
      this.openAdjacentCells(r, c);
    }

    if ((this.numOfRows * this.numOfCols) - this.mineLocations.length === this.cellsOpenedCount) {
      this.gameOver = true;
      this.openAllUnopenedCells();
    }

    return true;
  }

  // TODO: optimize, cell repitions
  openAdjacentCells(row, col) {
    const adjCells = this.getAdjacentCells(row, col);

    while (adjCells.length > 0) {
      const cell = adjCells.shift();
      const [r, c] = cell;

      if (this.extMatrix[r][c] === this.maskChar) {
        this.extMatrix[r][c] = this.intMatrix[r][c];
        this.cellsOpenedCount++;

        if (this.intMatrix[r][c] === this.blankChar) {
          adjCells.push(...this.getAdjacentCells(r, c, true));
        }
      }
    }
  }

  populateInternalMatrixWithMines(excludeCell) {
    const [r, c] = excludeCell;
    for (let row = 0; row < this.numOfRows; row++) {
      for (let col = 0; col < this.numOfCols; col++) {
        if (r === row && c === col) {
          continue;
        }

        const randomInt = 1 + Math.floor(Math.random() * 100);
        if (randomInt <= this.mineProbabilityPercent) {
          this.intMatrix[row][col] = this.mineChar;
          this.mineLocations.push([row, col]);
        }
      }
    }

    this.updateInternalMatrixWithMineCounts();
  }

  updateInternalMatrixWithMineCounts() {
    for (let row = 0; row < this.numOfRows; row++) {
      for (let col = 0; col < this.numOfCols; col++) {
        if (this.intMatrix[row][col] === this.mineChar) {
          continue;
        }
        const count = this.countAdjacentMines(row, col);
        this.intMatrix[row][col] = count > 0 ? count : this.blankChar;
      }
    }
  }

  countAdjacentMines(row, col) {
    let count = 0;
    const adjCells = this.getAdjacentCells(row, col);

    for (let cell of adjCells) {
      const [r, c] = cell;
      if (this.intMatrix[r][c] === this.mineChar) {
        count++;
      }
    }

    return count;
  }

  getAdjacentCells(row, col, unopened = false) {
    const adjCells = [];

    const startRow = row > 0 ? row-1 : row;
    const startCol = col > 0 ? col-1 : col;
    const endRow = row < this.numOfRows-1 ? row+1 : row;
    const endCol = col < this.numOfCols-1 ? col+1 : col;

    for (let currRow = startRow; currRow <= endRow; currRow++) {
      for (let currCol = startCol; currCol <= endCol; currCol++) {
        if (currRow === row && currCol === col) {
          // same cell, not adjacent, so skip
          continue;
        }

        if (!unopened || this.extMatrix[currRow][currCol] === this.maskChar) {
          adjCells.push([currRow, currCol]);
        }
      }
    }

    return adjCells;
  }

  openAllUnopenedCells() {
    for (let row = 0; row < this.numOfRows; row++) {
      for (let col = 0; col < this.numOfCols; col++) {
        if (this.extMatrix[row][col] === this.maskChar) {
          this.extMatrix[row][col] = this.intMatrix[row][col];
        }
      }
    }
  }

  getCellFromId(cellId) {
    try {
      const colLabel = cellId.slice(0, 1);
      const rowNum = parseInt(cellId.slice(1)) - 1;
      const colNum = this.getColumnNum(colLabel);

      if (rowNum < 0 || rowNum >= this.numOfRows || colNum < 0 || colNum >= this.numOfCols) {
        throw new Error("Selected cell is out of bounds");
      }

      return [rowNum, colNum];

    } catch (err) {
      // console.log(err);
      return null;
    }
  }

  getColumnNum(label) {
    const codeForA = "A".charCodeAt(0);
    const labelCode = label.charCodeAt(0);
    return labelCode - codeForA;
  }

  getColumnLabel(col) {
    const codeForA = "A".charCodeAt(0);
    return String.fromCharCode(codeForA + col);
  }

  printColumnLabels() {
    let columnLabelsContent = this.separator + "|";
    for (let i=0; i < this.numOfCols; i++) {
      columnLabelsContent += this.separator + this.getColumnLabel(i);
    }

    console.log(columnLabelsContent);
  }

  printIntMatrix() {
    this.printMatrix(this.intMatrix);
  }

  printExtMatrix() {
    this.printMatrix(this.extMatrix);
  }

  printMatrix(matrix) {
    this.printColumnLabels();
    console.log(this.separator + "|");
    console.log("-".repeat(8) + "|" + "-".repeat(this.numOfCols*8 + 4));
    console.log(this.separator + "|");

    let rowContent = "";
    for (let i = 0; i < matrix.length; i++) {
      rowContent += (i+1) + this.separator + "|" + this.separator + matrix[i].join(this.separator) + this.newline;
      rowContent += this.separator + "|" + this.newline;
    }

    console.log(rowContent);
  }

}

module.exports = Game;
