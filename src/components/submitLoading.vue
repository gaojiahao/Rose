<template>
  <div class="loading-container" v-show="submit">
    <div class="loading-wrapper">
      <spinner class="loading-animation" type="circles" size="34"></spinner>
    </div>
  </div>
</template>

<script>
  import {Spinner} from 'vux'

  export default {
    name: "loading",
    props: {
      submit: {
        type: Boolean,
        default: false
      }
    },
    components: {Spinner},
    data() {
      return {}
    }
  }
</script>

<style lang="scss" scoped>
  %center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);

    // position: fixed;
    // display: table;
    // z-index: 5000;
    // width: 80%;
    // max-width: 300px;
    // top: 0;
    // right: 0;
    // bottom: 0;
    // left: 0;
    // margin: auto;
    // background-color: #FFFFFF;
    // text-align: center;
    // border-radius: 3px;
    // overflow: hidden;
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