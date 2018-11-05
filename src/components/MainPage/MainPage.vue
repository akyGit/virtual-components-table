<template>
  <div
    id='MainPage'
    class='MainPage'
  >
    <Grid />
  </div>
</template>

<script>
import Grid from '../Grid';

export default {
  name: 'MainPage',
  components: {
    Grid,
  },
};
</script>

<style scoped lang="less" src='./MainPage.less' />
