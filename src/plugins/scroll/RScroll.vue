<template>
  <div class="scroll-wrapper" ref="scrollWrapper">
    <div class="scroll-content" :class="{hasRefresh: hasRefresh}" ref="scrollContent">
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
    <div class="el-fade-in">
      <div class="page-component-up" @click="scrollToTop" v-show="toTopShow">
        <span class="icon icon-scroll-top"></span>
      </div>
    </div>
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
      disableToTop:{
        type:Boolean,
        default:false
      },
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
      hideToast:{
        default:false
      }
    },
    data() {
      return {
        bScroll: null,
        hasRefresh: false,
        refreshDone: false, // 是否刷新完成
        pullDownTop: -PULL_DOWN_REFRESH_HEIGHT,
        xScrollValue: 0,
        yScrollValue: 0,
        toTopShow: false,
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
    watch:{
      yScrollValue: {
        handler(val) {
          if(Math.abs(val) > 1000 && this.disableToTop===false)
            this.toTopShow = true;
          else if (Math.abs(val) < 1000) 
            this.toTopShow = false;
          if(val === this.bScroll.maxScrollY) {
            if (this.hideToast != true)this.$vux.toast.text('已到底部！', 'bottom')
          }
        } 
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
          if(this.$refs.scrollWrapper == null)return;
          this.bScroll = new BScroll(this.$refs.scrollWrapper, options);
          // 绑定滚动加载事件
          this.bScroll.on('pullingUp', () => {
            if (!this.hasNext) return;
            this.$emit('on-pulling-up');
          });
          // 绑定下拉刷新事件
          // this.bScroll.on('pullingDown', () => {
          //   this.disable();
          //   this.refreshDone = false;
          //   this.$emit('on-pulling-down');
          // });
          // 下拉的时候展示下拉刷新的图标
          this.bScroll.on('scroll', ({x, y}) => {
            this.yScrollValue = y;
            this.$emit('search-box-show',false);
            if (y > 0) {
              if (y > PULL_DOWN_REFRESH_HEIGHT) {
                this.pullDownTop = 0;
              } else {
                this.pullDownTop = y - PULL_DOWN_REFRESH_HEIGHT;
              }
            } else {
              this.resetPullDown();
            }
          });
          this.bScroll.on('touchEnd',(pos) =>{  //下拉刷新
            this.resetPullDown();
            if(pos.y > 30){
                setTimeout(()=>{
                    this.$emit('on-pulling-down');
                    this.$emit('search-box-show',true);
                },100)
            } 
          });
          this.$parent.scroller = this.bScroll;
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
          this.bScroll && this.bScroll.finishPullUp();
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
        this.$emit('search-box-show',true);
        if (this.pullDownTop !== -PULL_DOWN_REFRESH_HEIGHT) {
          this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
        }
      },
      // 销毁better-scroll
      destroy() {
        this.bScroll.destroy();
        this.bScroll = null;
      },
      //滚动到顶部
      scrollToTop() {
        this.$nextTick(() => {
          this.bScroll.scrollTo(0, 0, 400);
          this.resetPullDown();
        })
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
  .scroll-wrapper { 
     overflow: hidden;
    .scroll-content {
       touch-action: none;
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
        @include loading_fill_color();
        @include loading_stroke_color();
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
  .page-component-up{
    /* background-color: #409eff; */
  position: fixed;
  right: .1rem;
  bottom: .8rem;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
  -webkit-transition: .3s;
  -o-transition: .3s;
  transition: .3s;
  /* -webkit-box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5); */
  /* box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5); */
  z-index: 200;
  span {
    width: 40px;
    height: 40px;
    display: inline-block;
  }
  .el-icon-caret-top{
    color: #fff;
    display: block;
    line-height: 40px;
    text-align: center;
    font-size: 18px;
  }
  p{
    display: none;
    text-align: center;
    color: #fff;
  }
  &:hover{
    opacity: .8;
  }
}
</style>
