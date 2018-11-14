/*
 * File: mutations.js
 * Description: mutations
 */

import Vue from 'vue';

export const CHANGE_ROW = 'CHANGE_ROW';
export const CHANGE_COL = 'CHANGE_COL';
export const CHANGE_ROW_OFFSET = 'CHANGE_ROW_OFFSET';
export const CHANGE_COL_OFFSET = 'CHANGE_COL_OFFSET';
export const CHANGE_GRID_DATA = 'CHANGE_GRID_DATA';
export const CLEAR_TEMP_DATA = 'CLEAR_TEMP_DATA';
export const CHANGE_NUMBER_TEMP_DATA = 'CHANGE_NUMBER_TEMP_DATA';
export const CHANGE_ENABLED_TEMP_DATA = 'CHANGE_ENABLED_TEMP_DATA';

const mutations = {
  [CHANGE_ROW](state, payload) {
    state.row = payload.row;
  },
  [CHANGE_COL](state, payload) {
    state.col = payload.col;
  },
  [CHANGE_ROW_OFFSET](state, payload) {
    state.rowOffset = payload.rowOffset;
  },
  [CHANGE_COL_OFFSET](state, payload) {
    state.colOffset = payload.colOffset;
  },
  [CHANGE_GRID_DATA](state, payload) {
    state.gridData = payload.gridData;
  },
  [CLEAR_TEMP_DATA](state) {
    state.tempData = {};
  },
  [CHANGE_NUMBER_TEMP_DATA](state, payload) {
    const { id, number } = payload;

    if (state.tempData[id]) state.tempData[id] = { ...state.tempData[id], number };
    else Vue.set(state.tempData, id, { number });
  },
  [CHANGE_ENABLED_TEMP_DATA](state, payload) {
    const { id, enabled } = payload;

    if (state.tempData[id]) state.tempData[id] = { ...state.tempData[id], enabled };
    else Vue.set(state.tempData, id, { enabled });
  },
};

export default mutations;
