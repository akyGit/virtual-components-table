<template>
  <div class='GridColRuler'>
    <div
      class='GridColRuler__cell'
      v-for='(cell, i) in colCells'
      :key='i'
    >
      {{ cell.id.split('|')[1] }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridColRuler',
  props: {
    colCells: Array,
  },
};
</script>

<style scoped lang="less" src='./GridColRuler.less' />
