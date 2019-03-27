<template>
  <div class="loadding" v-show="show">
    <spinner type='ripple' size='50px'></spinner>
  </div>
</template>

<script>
  import {Spinner} from 'vux'

  export default {
    name: "Loading",
    data(){
      return{
        show : false
      }
    },
    components: {Spinner}
  }
</script>

<style scoped lang="scss">
  .loadding { //加载动画
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    background: #fff;
    z-index: 100;
    .vux-spinner {
      top: 50%;
      left: 50%;
      fill: #366CAC;
      stroke: #366CAC;
      position: absolute;
      transform: translate(-50%, -50%);
    }
  }
</style>
