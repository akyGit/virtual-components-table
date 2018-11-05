<template>
  <div class='Grid'>
    <div class='Grid__container'>

      <div class='Grid__saveButton'>
        <button @click='handleSave' v-if='changed'>Save me</button>
      </div>

      <GridColControllers
        :goToColumnPrev='goToColumnPrev'
        :goToColumnNext='goToColumnNext'
        :goToColumnMin='goToColumnMin'
        :goToColumnMax='goToColumnMax'
        :onGoTo='handleGoTo'
      />

      <GridRowControllers
        :goToRowPrev='goToRowPrev'
        :goToRowNext='goToRowNext'
        :goToRowMin='goToRowMin'
        :goToRowMax='goToRowMax'
      />

      <GridColRuler :colCells='visibleGridData[0]' />
      <GridRowRuler :rowCells='visibleGridData.map(row => row[0])' />

      <table class='Grid__table'>
        <tr
          class='Grid__table__row'
          v-for='(row, rowIndex) in visibleGridData'
          :key='rowIndex'
        >
          <td
            class='Grid__table__row__cell'
            v-for='(cell, columnIndex) in row'
            :key='`${rowIndex}|${columnIndex}`'
          >
            <div class='Grid__table__row__cell__checkbox'>
              <input
                class='Grid__table__row__cell__checkbox__enabled'
                type='checkbox'
                :checked='cell.enabled'
                @change='changeEnabled(cell.id, $event.target.checked)'
              />
            </div>
            <input
              class='Grid__table__row__cell__number'
              type='number'
              :value='cell.number'
              :disabled='cell.enabled'
              @input='changeNumber(cell.id, $event.target.value)'
            />
          </td>
        </tr>
      </table>

    </div>
  </div>
</template>

<script>
import throttle from 'lodash/throttle';
import GridRowControllers from './partitions/GridRowControllers';
import GridColControllers from './partitions/GridColControllers';
import GridRowRuler from './partitions/GridRowRuler';
import GridColRuler from './partitions/GridColRuler';
import GridData from '../../utils/GridData';
import config from '../../etc/config.json';

const gap = config.GAP;
const realSize = config.REAL_SIZE;
const maxSize = config.GRID_SIZE;

export default {
  name: 'Grid',

  components: {
    GridRowControllers,
    GridColControllers,
    GridRowRuler,
    GridColRuler,
  },

  data() {
    return {
      row: 0,
      col: 0,
      rowOffset: 0,
      colOffset: 0,
      gridData: [],
      tempData: {},
      changed: 0,
      windowWidth: 0,
      windowHeight: 0,
      shouldRecalculate: true,
    };
  },

  mounted() {
    this.init();

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  computed: {
    visibleRow() {
      // columns controllers (20) and columns ruler height (20) - 40
      // height of grid cell                                    - 30
      return Math.floor((this.windowHeight - 40) / 30);
    },

    visibleCol() {
      // rows controllers (30) and rows ruler width (60) - 90
      // width of grid cell                              - 80
      return Math.floor((this.windowWidth - 90) / 80);
    },

    visibleGridData() {
      const data = this.gridData
        .slice(this.rowOffset, this.rowOffset + this.visibleRow)
        .map(row => row.slice(this.colOffset, this.colOffset + this.visibleCol));

      if (this.changed) {
        const changedKeys = Object.keys(this.tempData);

        return data.map((r, i) => r.map((c, j) => {
          const { id } = data[i][j];

          if (changedKeys.includes(`${id}`)) {
            return {
              ...data[i][j],
              ...this.tempData[id],
            };
          }

          return data[i][j];
        }));
      }

      return data;
    },
  },

  methods: {
    // init first part of data
    init() {
      const grid = new GridData();

      const data = grid.getGridPart(0, 0, realSize);
      this.gridData = data;
      this.grid = grid;
    },

    /* controls */
    goToColumnPrev() {
      if (((this.colOffset + this.col) - 1) >= 0) this.colOffset -= 1;
    },

    goToColumnNext() {
      if ((this.colOffset + this.col) < (maxSize - this.visibleCol)) this.colOffset += 1;
    },

    goToColumnMin() {
      this.gridData = this.grid.getGridPart(this.row, 0, realSize);
      this.colOffset = 0;
      this.col = 0;
      this.colBound = true;
    },

    goToColumnMax() {
      const nx = maxSize - realSize;

      this.gridData = this.grid.getGridPart(this.row, nx, realSize);
      this.colOffset = realSize - this.visibleCol;
      this.col = nx;
      this.colBound = true;
    },

    goToRowPrev() {
      if (((this.rowOffset + this.row) - 1) >= 0) this.rowOffset -= 1;
    },

    goToRowNext() {
      if (((this.rowOffset + this.row) + 1) < (maxSize - this.visibleRow)) this.rowOffset += 1;
    },

    goToRowMin() {
      this.gridData = this.grid.getGridPart(0, this.col, realSize);
      this.rowOffset = 0;
      this.row = 0;
      this.rowBound = true;
    },

    goToRowMax() {
      const ny = maxSize - realSize;

      this.gridData = this.grid.getGridPart(ny, this.col, realSize);
      this.rowOffset = realSize - this.visibleRow;
      this.row = ny;
      this.rowBound = true;
    },

    /* grid data change handlers */
    changeNumber(id, number) {
      this.changed += 1;

      if (this.tempData[id]) this.tempData[id].number = number;
      else this.tempData[id] = { number };
    },

    changeEnabled(id, enabled) {
      this.changed += 1;

      if (this.tempData[id]) this.tempData[id].enabled = enabled;
      else this.tempData[id] = { enabled };
    },

    /* resize event handler */
    handleResize: throttle(function () {
      if (Math.abs(this.windowWidth - document.documentElement.clientWidth) > 75) {
        this.windowWidth = document.documentElement.clientWidth;
      }

      if (Math.abs(this.windowHeight - document.documentElement.clientHeight) > 15) {
        this.windowHeight = document.documentElement.clientHeight;
      }
    }, 300),

    /* save data handler */
    handleSave() {
      // print changes
      console.log('Changes:');
      Object.keys(this.tempData).forEach((key) => {
        const row = parseInt(key.split('|')[0], 10);
        const col = parseInt(key.split('|')[1], 10);

        this.grid.changeCell(row, col, this.tempData[key]);
        console.log(`row/col(${row}/${col}) - ${JSON.stringify(this.tempData[key])}`);
      });

      // update info from data driver
      const data = this.grid.getGridPart(this.row, this.col, realSize);

      this.gridData = data;
      this.tempData = {};
      this.changed = 0;
    },

    /* go to direct row/col */
    async handleGoTo(row = 0, col = 0) {
      const maxRowBound = maxSize - this.visibleRow;
      const maxColBound = maxSize - this.visibleCol;

      let rowChanged = false;
      let colChanged = false;

      let parsedRow = parseInt(row, 10) || 0;
      let parsedCol = parseInt(col, 10) || 0;

      if (parsedRow < 0) parsedRow = 0;
      if (parsedCol < 0) parsedCol = 0;

      if (parsedRow > maxRowBound) { parsedRow = maxSize - realSize; rowChanged = true; }
      if (parsedCol > maxColBound) { parsedCol = maxSize - realSize; colChanged = true; }

      const ndy = Math.round(realSize - this.visibleRow);
      const ndx = Math.round(realSize - this.visibleCol);

      this.shouldRecalculate = false;

      this.gridData = await this.grid.getGridPartWithDelay(parsedRow, parsedCol, realSize, 500);
      this.row = parsedRow;
      this.col = parsedCol;

      if (rowChanged) this.rowOffset = ndy;
      else this.rowOffset = 0;

      if (colChanged) this.colOffset = ndx;
      else this.colOffset = 0;
    },
  },

  watch: {
    // handle possible loading new part of data during change column
    colOffset: throttle(async function (newValue, oldValue) {
      const maxBound = maxSize - realSize;
      const ndx = Math.round((realSize - this.visibleCol) / 2);
      const isMinBound = (newValue + this.col) - (ndx) < 0;
      const isMaxBound = (newValue + this.col) - (ndx) > maxBound;

      const shouldBeCorrected = !this.colBound && this.shouldRecalculate && (
        (newValue + this.visibleCol) > (realSize - gap) // right gap
        || ((newValue < oldValue) && (newValue < gap)) // left gap
      );

      if (this.colBound && !isMinBound && !isMaxBound) this.colBound = false;

      if (shouldBeCorrected) {
        this.colBound = isMinBound || isMaxBound;

        const col = isMinBound ? 0 : (
          isMaxBound
            ? maxBound
            : (newValue + this.col) - (ndx)
        );

        const data = await this.grid.getGridPartWithDelay(this.y, col, realSize, 500);

        if (data) {
          this.colOffset = isMinBound
            ? (newValue + this.col) : (
              isMaxBound
                ? newValue + this.col - col
                : ndx
            );
          this.col = col;
          this.gridData = data;
        }
      }
    }, 500),

    // handle possible loading new part of data during change row
    rowOffset: throttle(async function (newValue, oldValue) {
      const maxBound = maxSize - realSize;
      const ndy = Math.round((realSize - this.visibleRow) / 2);
      const isMinBound = (newValue + this.row) - (ndy) < 0;
      const isMaxBound = (newValue + this.row) - (ndy) > maxBound;

      const shouldBeCorrected = !this.rowBound && this.shouldRecalculate && (
        (newValue + this.visibleRow) > (realSize - gap) // right gap
        || ((newValue < oldValue) && (newValue < gap)) // left gap
      );

      if (this.rowBound && !isMinBound && !isMaxBound) this.rowBound = false;

      if (shouldBeCorrected) {
        this.rowBound = isMinBound || isMaxBound;

        const row = isMinBound ? 0 : (
          isMaxBound
            ? maxBound
            : (newValue + this.row) - (ndy)
        );

        const data = await this.grid.getGridPartWithDelay(row, this.x, realSize, 500);

        if (data) {
          this.rowOffset = isMinBound
            ? (newValue + this.row) : (
              isMaxBound
                ? newValue + this.row - row
                : ndy
            );
          this.row = row;
          this.gridData = data;
        }
      }
    }, 500),
  },
};
</script>

<style scoped lang="less" src='./Grid.less' />
