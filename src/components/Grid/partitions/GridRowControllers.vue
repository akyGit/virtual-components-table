<template>
  <div class='GridRowControllers'>
    <div class='GridRowControllers__up'>
      <button @click='goToRowMin' class='GridRowControllers__rotated'>&#x226a;</button>
      <button @click='goToRowPrev'>&#x25b2;</button>
    </div>
    <div class='GridRowControllers__down'>
      <button @click='goToRowNext'>&#x25bc;</button>
      <button @click='goToRowMax' class='GridRowControllers__rotated'>&#x226b;</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridRowControllers',
  props: {
    goToRowPrev: Function,
    goToRowNext: Function,
    goToRowMin: Function,
    goToRowMax: Function,
  },
};
</script>

<style scoped lang="less" src='./GridRowControllers.less' />
