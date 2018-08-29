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
        show : true
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
      top: 50%;
      left: 50%;
      position: absolute;
      fill: #366CAC;
      stroke: #366CAC;
      transform: translate(-50%, -50%);
    }
  }
</style>
