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

      <GridColRuler
        :colCells='colRulerCells'
        :simplified='scrolling'
      />

      <GridRowRuler
        :rowCells='rowRulerCells'
        :simplified='scrolling'
      />

      <div class='Grid__colScrollBar'>
        <GridScrollBar
          :value='scrollCol'
          :maxValue='40000'
          :delay='300'
          :onScroll='onScrollCol'
          :onScrollDelay='onScrollColDelay'
          :onScrollStart='onScrollStart'
          :onScrollContinue='onScrollContinue'
        />
      </div>

      <div class='Grid__rowScrollBar'>
        <GridScrollBar
          :value='scrollRow'
          :maxValue='40000'
          :delay='300'
          :onScroll='onScrollRow'
          :onScrollDelay='onScrollRowDelay'
          :onScrollStart='onScrollStart'
          vertical
        />
      </div>

      <table :class="{ 'Grid__table': true, 'Grid__table--disabled': scrolling }">
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
              @keypress='onlyNumber'
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
import { mapState, mapMutations, mapActions } from 'vuex';
import GridRowControllers from './partitions/GridRowControllers';
import GridColControllers from './partitions/GridColControllers';
import GridRowRuler from './partitions/GridRowRuler';
import GridColRuler from './partitions/GridColRuler';
import GridScrollBar from './partitions/GridScrollBar';
import GridData from '../../utils/GridData';
import config from '../../etc/config.json';
import * as Mutations from '../../store/mutations';

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
    GridScrollBar,
  },

  data() {
    return {
      changed: 0,
      windowWidth: 0,
      windowHeight: 0,
      scrolling: false,
      scrollCol: 0,
      scrollRow: 0,
      passRecalculate: false,
    };
  },

  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  computed: {
    colRulerCells() {
      return this.scrolling
        ? new Array(this.visibleCol).fill(null).map((c, i) => this.scrollCol + i)
        : this.visibleGridData[0];
    },

    rowRulerCells() {
      return this.scrolling
        ? new Array(this.visibleRow).fill(null).map((c, i) => this.scrollRow + i)
        : this.visibleGridData.map(row => row[0])
    },

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

    ...mapState([
      'row',
      'col',
      'rowOffset',
      'colOffset',
      'gridData',
      'tempData',
    ]),
  },

  methods: {
    /* controls */
    goToColumnPrev() {
      if (((this.colOffset + this.col) - 1) >= 0) {
        this.changeColOffset({ colOffset: this.colOffset - 1 });
        this.scrollCol = this.colOffset + this.col;
      }
    },

    goToColumnNext() {
      if ((this.colOffset + this.col) < (maxSize - this.visibleCol)) {
        this.changeColOffset({ colOffset: this.colOffset + 1 });
        this.scrollCol = this.colOffset + this.col;
      }
    },

    async goToColumnMin() {
      this.colBound = true;
      this.scrollCol = 0;
      await this.loadNewPartGridData({ row: this.row, col: 0 });
      this.changeColOffset({ colOffset: 0 });
      this.changeCol({ col: 0 });

    },

    async goToColumnMax() {
      const nx = maxSize - realSize;

      this.colBound = true;
      this.scrollCol = maxSize;
      await this.loadNewPartGridData({ row: this.row, col: nx });
      this.changeColOffset({ colOffset: realSize - this.visibleCol });
      this.changeCol({ col: nx });
    },

    goToRowPrev() {
      if (((this.rowOffset + this.row) - 1) >= 0) {
        this.changeRowOffset({ rowOffset: this.rowOffset - 1 });
        this.scrollRow = this.rowOffset + this.row;
      }
    },

    goToRowNext() {
      if (((this.rowOffset + this.row) + 1) < (maxSize - this.visibleRow)) {
        this.changeRowOffset({ rowOffset: this.rowOffset + 1 });
        this.scrollRow = this.rowOffset + this.row;
      }
    },

    async goToRowMin() {
      this.rowBound = true;
      this.scrollRow = 0;
      await this.loadNewPartGridData({ row: 0, col: this.col });
      this.changeRowOffset({ rowOffset: 0 });
      this.changeRow({ row: 0});
    },

    async goToRowMax() {
      const ny = maxSize - realSize;

      this.rowBound = true;
      this.scrollRow = maxSize;
      await this.loadNewPartGridData({ row: ny, col: this.col });
      this.changeRowOffset({ rowOffset: realSize - this.visibleRow });
      this.changeRow({ row: ny });
    },

    /* grid data change handlers */
    changeNumber(id, number) {
      let value = parseInt(number, 10);

      this.changed += 1;
      this.changeNumberTempData({ id, number: value });
    },

    changeEnabled(id, enabled) {
      this.changed += 1;
      this.changeEnabledTempData({ id, enabled });
    },

    onlyNumber(e) {
      if ((e.keyCode < 48 || e.keyCode > 57)) {
        e.preventDefault();
      }
    },

    /* scrolling handlers */
    async onScrollColDelay(value) {
      const col = parseInt(value, 10);

      await this.handleGoTo(this.row + this.rowOffset, col);
      this.scrolling = false;
    },

    async onScrollRowDelay(value) {
      const row = parseInt(value, 10);

      await this.handleGoTo(row, this.col + this.colOffset);
      this.scrolling = false;
    },

    onScrollStart() {
      this.scrolling = true;
    },

    onScrollContinue() {
      this.scrolling = true;
    },

    onScrollCol(value) {
      this.scrollCol = parseInt(value, 10);
    },

    onScrollRow(value) {
      this.scrollRow = parseInt(value, 10);
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
    async handleSave() {
      // print changes
      console.log('Changes:');
      Object.keys(this.tempData).forEach((key) => {
        const row = parseInt(key.split('|')[0], 10);
        const col = parseInt(key.split('|')[1], 10);

        this.changeCell({ row, col, data: this.tempData[key] });
        console.log(`row/col(${row}/${col}) - ${JSON.stringify(this.tempData[key])}`);
      });

      // update info from data driver
      this.scrolling = true;
      await this.loadNewPartGridData({ row: this.row, col: this.col });

      this.scrolling = false;
      this.clearTempData();
      this.changed = 0;
    },

    /* go to direct row/col */
    async handleGoTo(row = 0, col = 0) {
      this.scrolling = true;
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

      const newRowOffset = Math.round(realSize - this.visibleRow);
      const newColOffset = Math.round(realSize - this.visibleCol);

      this.passRecalculate = true;

      let newRow = parsedRow < gap ? 0 : parsedRow - gap;
      let newCol = parsedCol < gap ? 0 : parsedCol - gap;

      if (rowChanged) newRow = parsedRow;
      if (colChanged) newCol = parsedCol;

      await this.loadNewPartGridData({ row: newRow, col: newCol });
      this.scrolling = false;

      this.changeRow({ row: newRow });
      this.changeCol({ col: newCol });

      if (rowChanged) this.changeRowOffset({ rowOffset: newRowOffset });
      else this.changeRowOffset({ rowOffset: parsedRow < gap ? parsedRow : gap });

      if (colChanged) this.changeColOffset({ colOffset: newColOffset });
      else this.changeColOffset({ colOffset: parsedCol < gap ? parsedCol : gap });

      this.scrollRow = this.row + this.rowOffset;
      this.scrollCol = this.col + this.colOffset;
    },

    ...mapMutations({
      changeRow:             Mutations.CHANGE_ROW,
      changeCol:             Mutations.CHANGE_COL,
      changeRowOffset:       Mutations.CHANGE_ROW_OFFSET,
      changeColOffset:       Mutations.CHANGE_COL_OFFSET,
      clearTempData:         Mutations.CLEAR_TEMP_DATA,
      changeNumberTempData:  Mutations.CHANGE_NUMBER_TEMP_DATA,
      changeEnabledTempData: Mutations.CHANGE_ENABLED_TEMP_DATA,
    }),

    ...mapActions([
      'loadNewPartGridData',
      'changeCell',
    ])
  },

  watch: {
    // handle possible loading new part of data during change column
    colOffset: throttle(async function (newValue, oldValue) {
      const maxBound = maxSize - realSize;
      const ndx = Math.round((realSize - this.visibleCol) / 2);
      const isMinBound = (newValue + this.col) - (ndx) < 0;
      const isMaxBound = (newValue + this.col) - (ndx) > maxBound;

      const shouldBeCorrected = !this.colBound && !this.passRecalculate && (
        (newValue + this.visibleCol) > (realSize - gap) // right gap
        || ((newValue < oldValue) && (newValue < gap)) // left gap
      );

      if (this.colBound && !isMinBound && !isMaxBound) this.colBound = false;
      if (this.passRecalculate) this.passRecalculate = false;

      if (shouldBeCorrected) {
        this.colBound = isMinBound || isMaxBound;

        const col = isMinBound ? 0 : (
          isMaxBound
            ? maxBound
            : (newValue + this.col) - (ndx)
        );

        const loaded = await this.loadNewPartGridData({ row: this.row, col });

        if (loaded) {
          const colOffset = isMinBound
            ? (newValue + this.col) : (
              isMaxBound
                ? newValue + this.col - col
                : ndx
            );

          this.changeColOffset({ colOffset });
          this.changeCol({ col });
        }
      }
    }, 500),

    // handle possible loading new part of data during change row
    rowOffset: throttle(async function (newValue, oldValue) {
      const maxBound = maxSize - realSize;
      const ndy = Math.round((realSize - this.visibleRow) / 2);
      const isMinBound = (newValue + this.row) - (ndy) < 0;
      const isMaxBound = (newValue + this.row) - (ndy) > maxBound;

      const shouldBeCorrected = !this.rowBound && !this.passRecalculate && (
        (newValue + this.visibleRow) > (realSize - gap) // right gap
        || ((newValue < oldValue) && (newValue < gap)) // left gap
      );

      if (this.rowBound && !isMinBound && !isMaxBound) this.rowBound = false;
      if (this.passRecalculate) this.passRecalculate = false;

      if (shouldBeCorrected) {
        this.rowBound = isMinBound || isMaxBound;
        this.shouldRecalculate = true;

        const row = isMinBound ? 0 : (
          isMaxBound
            ? maxBound
            : (newValue + this.row) - (ndy)
        );

        const loaded = await this.loadNewPartGridData({ row, col: this.col });

        if (loaded) {
          const rowOffset = isMinBound
            ? (newValue + this.row) : (
              isMaxBound
                ? newValue + this.row - row
                : ndy
            );

          this.changeRowOffset({ rowOffset });
          this.changeRow({ row });
        }
      }
    }, 500),
  },
};
</script>

<style scoped lang="less" src='./Grid.less' />
