/*
 * File: actions.js
 * Description: actions
 */

import grid from '../gridDataSingleton';
import config from '../etc/config.json';

import {
  CHANGE_GRID_DATA,
} from './mutations';

const actions = {
  async loadNewPartGridData({ commit }, { row, col }) {
    const gridData = await grid.getGridPartWithDelay(
      row, col, config.REAL_SIZE, config.LOAD_DELAY,
    );

    if (gridData) {
      commit({
        type: CHANGE_GRID_DATA,
        gridData,
      });

      return true;
    }

    return false;
  },
};

export default actions;
