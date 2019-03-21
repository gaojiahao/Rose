<template>
  <div class="scroll-container" ref="bScroll">
    <div class="scroll-wrapper" :class="{hasRefresh: hasRefresh}" ref="scrollWrapper">
      <slot></slot>
      <slot name="loadmore">
        <load-more :show-loading="hasNext" :tip="tip" v-show="hasNext || noData"></load-more>
      </slot>
    </div>
    <slot name="refresh" v-if="options.pullDownRefresh">
      <div class="refresh-container" :style="{top: pullDownTop + 'px'}" v-show="hasRefresh">
        <spinner class="icon" type="crescent" v-show="!refreshDone"></spinner>
        <div class="tips">{{-pullDownTop > 30 ? '下拉刷新' : '释放刷新'}}</div>
      </div>
    </slot>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import {Spinner, LoadMore} from 'vux'
  const PULL_DOWN_REFRESH_HEIGHT = 70;
  export default {
    name: "RScroll",
    components: {
      Spinner, LoadMore,
    },
    props: {
      // 是否有下一页
      hasNext: {
        type: Boolean,
        default: false
      },
      noData: {
        type: Boolean,
        default: false
      },
      options: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    data() {
      return {
        bScroll: null,
        hasRefresh: false,
        refreshDone: false, // 是否刷新完成
        pullDownTop: -PULL_DOWN_REFRESH_HEIGHT,
      }
    },
    computed: {
      tip() {
        let tip = '加载中';
        if (!this.hasNext) {
          tip = '暂无数据'
        }
        return tip;
      }
    },
    methods: {
      // 初始化滚动
      _initScroll() {
        let options = {
          click: true,
          probeType: 1,
          ...this.options,
        };
        if (this.options.pullDownRefresh) {
          this.hasRefresh = true;
          options.pullDownRefresh = {
            threshold: 40,
            stop: PULL_DOWN_REFRESH_HEIGHT
          }
        }
        if (this.options.pullUpLoad) {
          options.pullUpLoad = {
            threshold: 20
          }
        }
        this.$nextTick(() => {
          this.bScroll = new BScroll(this.$refs.bScroll, options);
          // 绑定滚动加载事件
          this.bScroll.on('pullingUp', () => {
            if (!this.hasNext) return;
            this.$emit('on-pulling-up');
          });
          // 绑定下拉刷新事件
          this.bScroll.on('pullingDown', () => {
            this.disable();
            this.refreshDone = false;
            this.$emit('on-pulling-down');
          });
          // 下拉的时候展示下拉刷新的图标
          this.bScroll.on('scroll', ({x, y}) => {
            if (y > 0) {
              if (y > PULL_DOWN_REFRESH_HEIGHT) {
                this.pullDownTop = 0;
              } else {
                this.pullDownTop = y - PULL_DOWN_REFRESH_HEIGHT;
              }
            } else {
              this.resetPullDown();
            }
          })
        })
      },
      // 刷新
      refresh() {
        this.bScroll && this.bScroll.refresh();
      },
      // 开启滚动
      enable() {
        this.bScroll && this.bScroll.enable();
      },
      // 禁用滚动
      disable() {
        this.bScroll && this.bScroll.disable();
      },
      // 结束下拉刷新
      finishPullDown() {
        return new Promise(resolve => {
          this.resetPullDown();
          this.bScroll.finishPullDown();
          this.enable();
          this.refresh();
          resolve();
        })
      },
      // 结束上拉加载
      finishPullUp() {
        return new Promise(resolve => {
          this.bScroll.finishPullUp();
          this.refresh();
          resolve();
        })
      },
      // 滚动到指定位置
      scrollTo(x, y) {
        this.bScroll && this.bScroll.scrollTo(x, y, 400);
      },
      // 重置下拉刷新图标位置
      resetPullDown() {
        if (this.pullDownTop !== -PULL_DOWN_REFRESH_HEIGHT) {
          this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
        }
      },
      // 销毁better-scroll
      destroy() {
        this.bScroll.destroy();
        this.bScroll = null;
      },
    },
    created() {
      this._initScroll();
    },
    beforeDestroy() {
      if (this.bScroll) {
        this.destroy();
      }
    },
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  .scroll-container {
    overflow: hidden;
    .scroll-wrapper {
      overflow: hidden;
      &.hasRefresh {
        min-height: calc(100% + 1px);
      }
    }
    .refresh-container {
      width: 100%;
      margin: .2rem 0;
      position: absolute;
      text-align: center;
      font-size: .1rem;
      color: #757575;
      .vux-spinner {
        fill: #366CAC;
        stroke: #366CAC;
      }
      .tips {
        margin-top: .04rem;
      }
    }
  }
  .weui-toast.vux-toast-top {
    top: 18px;
  }
  .weui-toast {
    background: rgba(17, 17, 17, 0.5);
  }
</style>