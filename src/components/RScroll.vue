<template>
  <div class="scroll-container" ref="bScroll">
    <div class="scroll-wrapper" :class="{hasRefresh: hasRefresh}">
      <slot></slot>
      <slot name="loadmore">
        <load-more :show-loading="hasNext" :tip="tip" v-show="hasNext || noData"></load-more>
      </slot>
    </div>
    <slot name="refresh">
      <div class="refresh-container" :style="{top: pullDownTop + 'px'}" v-show="hasRefresh">
        <!--<spinner class="icon" type="android"></spinner>-->
        <spinner class="icon" type="android" v-show="!refreshDone"></spinner>
        <div v-show="refreshDone">刷新成功</div>
      </div>
    </slot>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import {Spinner, LoadMore} from 'vux'

  const PULL_DOWN_REFRESH_HEIGHT = 30;
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
        pullDownTop: -PULL_DOWN_REFRESH_HEIGHT,
        hasRefresh: false,
        refreshDone: false, // 是否刷新完成
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
      // TODO 初始化滚动
      _initScroll() {
        let options = {
          probeType: 1,
          ...this.options,
        };
        if (this.options.pullDownRefresh) {
          this.hasRefresh = true;
          options.pullDownRefresh = {
            threshold: 30,
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
            if (!this.hasNext) {
              return
            }
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
      // TODO 刷新
      refresh() {
        this.bScroll && this.bScroll.refresh();
      },
      // TODO 开启滚动
      enable() {
        this.bScroll && this.bScroll.enable();
      },
      // TODO 禁用滚动
      disable() {
        this.bScroll && this.bScroll.disable();
      },
      // TODO 结束下拉刷新
      finishPullDown() {
        return new Promise(resolve => {
          this.resetPullDown();
          this.bScroll.finishPullDown();
          this.refresh();
          // this.refreshDone = true;
          this.enable();
          // setTimeout(() => {
          //   this.refreshDone = false;
          // }, 500);
          resolve();
        })
      },
      // TODO 结束上拉加载
      finishPullUp() {
        return new Promise(resolve => {
          this.bScroll.finishPullUp();
          this.refresh();
          resolve();
        })
      },
      // TODO 滚动到指定位置
      scrollTo({x = 0, y = 0}) {
        this.bScroll.scrollTo(x, y);
      },
      // TODO 重置下拉刷新图标位置
      resetPullDown() {
        if (this.pullDownTop !== -PULL_DOWN_REFRESH_HEIGHT) {
          this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
        }
      },
    },
    created() {
      this._initScroll();
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
      position: absolute;
      top: -30px;
      left: 0;
      width: 100%;
      height: 30px;
      background-color: #fff;
      /*transition: top .4s linear 0s;*/
      text-align: center;
    }
  }
</style>
