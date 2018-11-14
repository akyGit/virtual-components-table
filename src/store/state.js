/*
 * File: state.js
 * Description: initial app state data
*/

import grid from '../gridDataSingleton';
import config from '../etc/config.json';

const state = {
  row: 0,
  col: 0,
  rowOffset: 0,
  colOffset: 0,
  gridData: grid.getGridPart(0, 0, config.REAL_SIZE),
  tempData: {},
};

export default state;
