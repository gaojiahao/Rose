<template>
  <div class="r-popover-container" @click="showPopover" ref="popover">
    <div class="r-popover" v-show="show">
      <slot name="content"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "RPopover",
    data() {
      return {
        show: false,
      }
    },
    methods: {
      showPopover() {
        this.show = !this.show;
      },
    },
    created(){
    },
  }
</script>

<style scoped lang="scss">
  .r-popover-container {
    position: relative;
    .r-popover {
      position: absolute;
      top: calc(-100% - .12rem);
      left: 50%;
      z-index: 5;
      padding: .02rem .08rem;
      border-radius: 3px;
      background-color: #35495e;
      color: #fff;
      transform: translate(-50%, 0);
      &:after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        z-index: 4;
        display: block;
        border: .08rem solid transparent;
        border-top-color: #35495e;
        transform: translate(-50%, -1px);
      }
    }
  }
</style>
