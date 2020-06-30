<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-03-25 10:56:56
 * @LastEditors: Gabriel.gaojiahao
 * @LastEditTime: 2019-12-11 17:06:41
 -->
<template>
  <div class="loadding" v-show="show">
    <spinner type='ripple' size='50px'></spinner>
  </div>
</template>

<script>
  import {Spinner} from 'vux'

  export default {
    name: "Loading2",
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
    z-index: 9999;
    background: rgba(0, 0, 0, 0.1);
    .vux-spinner {
      top: 50%;
      left: 50%;
      @include loading_fill_color();
      @include loading_stroke_color();
      position: absolute;
      transform: translate(-50%, -50%);
    }
  }
</style>
