<template>
  <div class='GridRowRuler'>
    <div
      class='GridRowRuler__cell'
      v-for='(cell, i) in cells'
      :key='i'
    >
      {{ cell }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridRowRuler',
  props: {
    rowCells: {
      type: Array,
      default() {
        return [];
      },
    },
    simplified: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    cells() {
      return this.simplified
        ? this.rowCells
        : this.rowCells.map(cell => cell.id.split('|')[0]);
    },
  },
};
</script>

<style scoped lang="less" src='./GridRowRuler.less' />
