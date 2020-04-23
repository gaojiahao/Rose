<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop1" height="80%" class="popup-project-list1" @on-show="onShow1" @on-hide="onHide1">
      <div class="trade_pop">
        <div class="title">
          <!-- 搜索栏 -->
          <!-- <r-search @search='searchList' @turn-off="onHide" :isFill='true'></r-search> -->
        </div>
        <!-- 物料列表 -->
        <r-scroll class="project-list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !list.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="each_mater box_sd" v-for="(item, index) in list" :key='index'
               @click.stop="selThis(item,index)">
            <div class="matter_name vux-1px-b">
              <span class="matter_simple">名称</span>
              {{item.name}}
            </div>
            <!-- icon -->
            <x-icon class="selIcon" type="ios-circle-outline" size="20"></x-icon>
            <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="index==rindex"></x-icon>
          </div>
        </r-scroll>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup,} from 'vux'
  import RScroll from 'components/common/RScroll'
  // 请求 引入


  export default {
    name: "PopupIncomeCalcList",
    props: {
      show1: {
        type: Boolean,
        default: false
      },
      // 默认值
      list: {
        type: Array,
        default() {
          return []
        }
      },
    },
    components: {
      Icon, Popup, RScroll,
    },
    data() {
      return {
        showPop1: false,
        hasNext: false, // 是否有下一页
        scrollOptions: { // 滚动配置
          click: true,
          pullUpLoad: true,
        },
        item:{},
        rindex :0,
      }
    },
    watch: {
      show1: {
        handler(val) {
          this.showPop1 = val;
        }
      },
      defaultValue: {
        handler(val) {
          // 默认值改变，重新赋值
          this.setDefaultValue();
        }
      },
    },
    methods: {
      // 弹窗展示时调用
      onShow1() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            // 弹窗展示时刷新滚动，防止无法拖动问题
            this.$refs.bScroll.refresh();
          }
        })
      },
      // 弹窗隐藏时调用
      onHide1() {
        this.showPop1 = false;
        this.$emit('on-sel',this.rindex);  
      },
      // 选择物料
      selThis(sItem, sIndex) {
        this.rindex = sIndex;
        this.showPop1 = false;
        this.$emit('on-sel',sIndex);  
      },
      // 上拉加载
      onPullingUp() {

      },
      // 设置默认值
      setDefaultValue() {

      },
    },
    created() {

    }
  }
</script>

<style scoped lang="scss" scoped>
  // 弹出层
  .popup-project-list1 {
    background: #fff;
    z-index: 502;
    .trade_pop {
      padding: 0 .08rem;
      height: calc(100% - .44rem);
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding: .08rem 0;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
      // 物料列表
      .project-list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .38rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .04rem .04rem 0 .3rem;
        }
        // 每个物料
        .each_mater {
          position: relative;
          padding: .08rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          .matter_name {
            font-size: .16rem;
            font-weight: bold;
            padding-bottom: .04rem;
            
            .matter_simple {
              font-size: .1rem;
              color: #EDE4A3;
              background: #D7030F;
              border-radius: .12rem;
              padding: .01rem .06rem;
              vertical-align: middle;
            }
          }
          .matter_unit {
            color: #757575;
            font-size: .14rem;
          }
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 5px #e8e8e8;
          }
          // 下划线
          .vux-1px-b:after {
            border-bottom: 1px solid #e8e8e8;
          }
          // 选择icon
          .selIcon,
          .isSelIcon {
            top: 50%;
            left: -.3rem;
            position: absolute;
            transform: translate(0, -50%);
          }
          .isSelIcon {
            fill: #D7030F;
          }
        }
      }

    }
    // 底部栏
    .count_mode {
      left: 0;
      bottom: 0;
      width: 100%;
      display: flex;
      height: .44rem;
      position: fixed;
      line-height: .44rem;
      background: #fff;
      .count_num {
        flex: 2.5;
        color: #5077aa;
        font-size: .24rem;
        padding-left: .1rem;
      }
      .count_btn {
        flex: 1.5;
        color: #fff;
        text-align: center;
        background: #5077aa;
      }
    }
  }
</style>
