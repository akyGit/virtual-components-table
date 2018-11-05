/* eslint-disable no-plusplus */

/** Class representing a grid data driver */
class GridData {
  /**
   * Generate key by row and column indexes
   * @static
   * @memberof GridData
   * @param {number} row row index
   * @param {number} col column index
   * @returns {string} generated key
   */
  static getKeyByCoords = (row, col) => `${row}|${col}`

  constructor() {
    this.changedData = {};
  }

  /**
   * Change cell
   * @param {number} row row index
   * @param {number} col col index
   * @param {{ enabled: boolean, number: number, }} data
   */
  changeCell(row, col, { enabled, number }) {
    if (!this.changedData[GridData.getKeyByCoords(row, col)]) {
      this.changedData[GridData.getKeyByCoords(row, col)] = { enabled: false, number: 0 };
    }

    const target = this.changedData[GridData.getKeyByCoords(row, col)];

    if (typeof enabled !== 'undefined') target.enabled = enabled;
    if (typeof number !== 'undefined') target.number = number;
  }

  /**
   * Get part of grid data
   * @param {number} row row index
   * @param {number} col col index
   * @param {number} size size of 2D grid part
   * @returns {array} part of grid data as 2D array
   */
  getGridPart(row = 0, col = 0, size = 20) {
    if (row < 0 || col < 0 || size < 2) return false;

    const { changedData } = this;
    const initialCellData = { enabled: false, number: 0 };

    const result = new Array(size).fill(null)
      .map(() => (
        new Array(size).fill(null)
      ));

    for (let rowOffset = row; rowOffset < size + row; rowOffset++) {
      for (let colOffset = col; colOffset < size + col; colOffset++) {
        const key = GridData.getKeyByCoords(rowOffset, colOffset);

        if (changedData[key]) result[rowOffset - row][colOffset - col] = { ...changedData[key], id: `${rowOffset}|${colOffset}` };
        else result[rowOffset - row][colOffset - col] = { ...initialCellData, id: `${rowOffset}|${colOffset}` };
      }
    }

    return result;
  }

  /**
   * Get part of grid data with some delay
   * @param {number} row row index
   * @param {number} col col index
   * @param {number} size size of 2D grid part
   * @param {number} delay delay in ms
   * @returns {Promise<array>} part of grid data as 2D array
   */
  async getGridPartWithDelay(row = 0, col = 0, size = 20, delay = 500) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const gridPart = this.getGridPart(row, col, size);

          resolve(gridPart);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }
}

export default GridData;
