<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup class="r-popup-container" :class="{multipart: multipart}" v-model="showPop" height="80%" @on-show="onShow"
           @on-hide="onHide">
      <div class="r-popup-top">
        <r-search :filterList="filterList" @search='searchList' @turn-off="onHide" :isFill='true'></r-search>
        <!-- 物料列表 -->
        <r-scroll class="r-popup-list" :options="options" :has-next="hasNext"
                  :no-data="!hasNext && !data.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="r-popup-item box_sd"  :class="{selected : showSelIcon(item)}" v-for="(item, index) in data" :key='index'
               @click.stop="selThis(item, index)">
            <slot name="pop-item" :item="item" :index="index"></slot>
            <!-- icon -->
            <x-icon class="selIcon" type="ios-circle-outline" size="20" v-if="multipart"></x-icon>
            <!-- <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon> -->
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class="count_mode vux-1px-t" v-if="multipart">
        <span class="count_num"> {{tmpItems.length ? `已选 ${tmpItems.length} 个` : '请选择'}} </span>
        <span class="count_btn" @click="cfmMater">确定</span>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup} from 'vux'
  import RScroll from 'plugins/scroll/RScroll'
  import RSearch from 'components/search/search'

  export default {
    name: "RPopup",
    props: {
      data: {
        type: Array,
        default() {
          return []
        }
      },
      show: {
        type: Boolean,
        default: false
      },
      // 默认值
      defaultValue: {
        type: [Array, Object],
        default() {
          return {}
        }
      },
      // 请求的传参，本地库存调拨请求数据时会传入
      filterList: {
        type: Array,
        default() {
          return []
        }
      },
      // 是否多选
      multipart: {
        type: Boolean,
        default: false
      },
      // 是否为提交页面
      isFill: {
        type: Boolean,
        default: true
      },
      // 滚动配置
      options: {
        type: Object,
        default() {
          return {
            pullUpLoad: true,
          }
        }
      },
      // 是否有下一页
      hasNext: {
        type: Boolean,
        default: true
      },
      judgeKeys: {
        type: Array,
        default() {
          return []
        }
      }
    },
    components: {
      Icon, Popup, RScroll, RSearch
    },
    data() {
      return {
        showPop: false,
        selItems: [], // 哪些被选中了
        tmpItems: [], // 临时存储
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
      defaultValue: {
        handler(val) {
          if (this.multipart) {
            // 默认值改变，重新赋值
            this.tmpItems = [...this.defaultValue];
            this.selItems = [...this.defaultValue];
          } else {
            // 默认值改变，重新赋值
            this.tmpItems = [{...this.defaultValue}];
            this.selItems = [{...this.defaultValue}];
          }
        },
        immediate: true
      },
      data: {
        handler(val) {
          this.finishPullUp();
        },
        immediate: true
      },
    },
    methods: {
      // 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            // 弹窗展示时刷新滚动，防止无法拖动问题
            this.$refs.bScroll.refresh();
          }
        })
      },
      // 弹窗隐藏时调用
      onHide() {
        this.tmpItems = [...this.selItems];
        this.$emit('input', false);
        // 组件传值 传回给search组件 强制关闭下拉框
        this.$event.$emit('shut-down-filter', false);
      },
      // 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          let flag = false;
          this.judgeKeys.every(key => {
            if (item[key]) {
              flag = item[key] === sItem[key];
            }
            return flag
          });
          return flag
        });
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.tmpItems, sItem) !== -1;
      },
      // 选中单个项
      selThis(sItem, sIndex) {
        if (!this.multipart) {
          this.showPop = false;
          this.selItems = [{...sItem}];
          this.tmpItems = [{...sItem}];
          this.$emit('on-select', {...sItem});
          return
        }
        let arr = this.tmpItems;
        let delIndex = this.findIndex(arr, sItem);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // 确定选择物料
      cfmMater() {
        let sels = [];
        this.showPop = false;
        // this.tmpItems.sort((a, b) => b.effectiveTime - a.effectiveTime);
        this.selItems = [...this.tmpItems];
        // 触发父组件选中事件
        this.$emit('on-select', JSON.parse(JSON.stringify(this.selItems)));
      },
      // 搜索物料
      searchList(val) {
        this.$refs.bScroll.scrollTo(0, 0);
        this.$emit('on-search', val);
      },
      // 删除选中项
      delSelItem(dItem) {
        let delIndex = this.findIndex(this.selItems, dItem);
        if (delIndex !== -1) {
          this.selItems.splice(delIndex, 1);
        }
        this.tmpItems = [...this.selItems];
      },
      // 上拉加载
      onPullingUp() {
        this.$emit('on-pulling-up')
      },
      // 上拉加载结束
      finishPullUp() {
        if (this.$refs.bScroll) {
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        }
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  // 弹出层
  .r-popup-container {
    background: #fff;
    &.multipart {
      .r-popup-top {
        height: calc(100% - .44rem);
      }
    }
    .r-popup-top {
      height: 100%;
      // 顶部
      .title {
        height: 100%;
        font-size: .2rem;
        position: relative;
        padding: .08rem 0;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
      // 物料列表
      .r-popup-list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .14rem .15rem 0;
        }
        /deep/ .vux-loadmore {
          position: relative;
          left: -.15rem;
        }
        // 每个物料
        .r-popup-item {
          position: relative;
          margin-bottom: .2rem;
          padding: 0.08rem;
          box-shadow: 0 0 8px #e8e8e8;
          box-sizing: border-box;
          // 选择icon
          .selIcon,
          .isSelIcon {
            top: 50%;
            left: -.3rem;
            position: absolute;
            transform: translate(0, -50%);
          }
          .isSelIcon {
            fill: #5077aa;
          }
          &.selected {
            border: 1px solid #3296FA;
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
