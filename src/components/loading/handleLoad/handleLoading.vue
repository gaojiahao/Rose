<template>
  <div class="loading-container" v-show="show">
    <div class="loading-wrapper">
      <spinner class="loading-animation" type="circles" size="34"></spinner>
    </div>
  </div>
</template>

<script>
  import {Spinner} from 'vux'

  export default {
    name: "loading",
    data(){
      return{
        show :true
      }
    },
    components: {Spinner},

  }
</script>

<style lang="scss" scoped>
  %center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
  }
  .loading-container {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    position: fixed;
    .loading-wrapper {
      @extend %center;
      z-index: 100;
      width: 100%;
      height: 100%;
      background: rgba(250, 250, 250, 0.7);
      .loading-animation {
        @extend %center;
        fill: #366CAC;
        stroke: #366CAC;
      }
    }
  }
</style>