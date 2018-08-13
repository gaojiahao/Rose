<template>
  <div class="loading-container" v-show="submit">
    <div class="loading-wrapper">
      <spinner class="loading-animation" type="dots" size="2em"></spinner>
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
  }

  .loading-container {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    .loading-wrapper {
      @extend %center;
      z-index: 100;
      width: 3.5em;
      min-height: 3.5em;
      background: rgba(17, 17, 17, 0.7);
      border-radius: 5px;
      .loading-animation {
        @extend %center;
        fill: #fff;
        stroke: #fff;
      }
    }
  }
</style>