<template>
  <div class='GridColRuler'>
    <div
      class='GridColRuler__cell'
      v-for='(cell, i) in cells'
      :key='i'
    >
      {{ cell }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridColRuler',
  props: {
    colCells: {
      type: Array,
      default() {
        return [];
      },
    },
    simplified: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cells() {
      return this.simplified
        ? this.colCells
        : this.colCells.map(cell => cell.id.split('|')[1]);
    }
  }
};
</script>

<style scoped lang="less" src='./GridColRuler.less' />
