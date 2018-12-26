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
      // TODO popover点击事件
      showPopover() {
        // 点击的元素已展示时不抛出点击事件
        if (!this.show) {
          this.$emit('on-click');
        }
        this.show = !this.show;
      },
      // TODO 隐藏popover
      hidePopover() {
        this.show = false;
      },
      // TODO 判断点击是否为popover
      clickOutside(e) {
        // 若点击不在表情容器内，且不为表情的展示图标，则隐藏表情包
        if (!this.$refs.popover.contains(e.target)) {
          this.show = false;
        }
      },
    },
    created() {
      this.$nextTick(() => {
        document.addEventListener('click', this.clickOutside);
      })
    },
    beforeDestroy() {
      document.removeEventListener('click', this.clickOutside);
    }
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
