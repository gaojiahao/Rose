<template>
  <div class="loadding" v-show="show">
    <spinner type='dots' size='50px'></spinner>
  </div>
</template>

<script>
  import {Spinner} from 'vux'

  export default {
    name: "Loading",
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    components: {Spinner}
  }
</script>

<style scoped lang="scss">
  .loadding { //加载动画
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index: 100;
    .vux-spinner {
      position: absolute;
      left: 50%;
      top: 50%;
      margin-top: -25px;
      margin-left: -25px;
    }
  }
</style>
