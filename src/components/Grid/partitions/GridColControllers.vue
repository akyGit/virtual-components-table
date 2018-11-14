<template>
  <div class='GridColControllers'>
    <div class='GridColControllers__left'>
      <button @click='goToColumnMin'>&#x226a;</button>
      <button @click='goToColumnPrev'>&#x25c0;</button>
    </div>
    <div class='GridColControllers__goTo'>
      <span>Row: </span>
      <input type='number' v-model='row' @keypress='onlyNumber' />
      <span>Col: </span>
      <input type='number' v-model='col' @keypress='onlyNumber' />
      <button @click='handleGoTo'>Go</button>
    </div>
    <div class='GridColControllers__right'>
      <button @click='goToColumnNext'>&#x25b6;</button>
      <button @click='goToColumnMax'>&#x226b;</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridColControllers',
  props: {
    goToColumnPrev: Function,
    goToColumnNext: Function,
    goToColumnMin: Function,
    goToColumnMax: Function,
    onGoTo: Function,
  },

  data() {
    return {
      row: 0,
      col: 0,
    };
  },

  methods: {
    handleGoTo() {
      this.onGoTo(this.row, this.col);
    },

    onlyNumber(e) {
      if ((e.keyCode < 48 || e.keyCode > 57)) {
        e.preventDefault();
      }
    },
  },
};
</script>

<style scoped lang="less" src='./GridColControllers.less' />
