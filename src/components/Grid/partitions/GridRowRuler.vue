<template>
  <div class='GridRowRuler'>
    <div
      class='GridRowRuler__cell'
      v-for='(cell, i) in rowCells'
      :key='i'
    >
      {{ cell.id.split('|')[0] }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridRowRuler',
  props: {
    rowCells: Array,
  },
};
</script>

<style scoped lang="less" src='./GridRowRuler.less' />
