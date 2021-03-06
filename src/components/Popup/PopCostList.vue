<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <m-search @search='searchList'></m-search>
        <!-- 费用列表 -->
        <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !costList.length" @on-pulling-up="onPullingUp"
                   ref="bScroll">
          <div class="each_mater box_sd" :class="{selected: showSelIcon(item)}" v-for="(item, index) in costList" :key='index'
               @click.stop="selThis(item, index)">
            <div class="mater_main">
              <div class="cost_name">{{item.costName}}</div>
              <div class="cost_type">{{item.costType}}</div>
              <div class="cost_subject">{{item.costSubject}}</div>
            </div>
          </div>
        </r-scroll>
      </div>
    </popup>
  </div>
</template>

<script>
import {Icon, Popup, LoadMore} from 'vux'
import { getProjectCostByGroupId, getCostByGroupId } from 'service/costService'
import {requestData} from 'service/commonService'
import RScroll from 'plugins/scroll/RScroll'
import MSearch from 'components/search/search'
export default {
  name: "costList",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    // 默认值
    defaultValue: {
      type: Array,
      default() {
        return []
      }
    },
    groupId: {
      type: Number,
      default: 990713
    },
    getListMethod: {
      type: String,
      default: 'getCostByGroupId'
    },
    costParams: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: {
    Icon, Popup, LoadMore, RScroll,MSearch
  },
  data() {
    return {
      showPop: false,
      srhInpTx: '', // 搜索框内容
      selItems: [], // 哪些被选中了
      tmpItems: [],
      costList: [],
      limit: 10,
      page: 1.,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullUpLoad: true,
      },
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
        // 默认值改变，重新赋值
        this.setDefaultValue();
      }
    },
    groupId(){
      this.costList();
    },
    // 请求 参数
    costParams: {
      handler(val) {
        // 为避免触发重复请求 此处设置监听
        let Parmsdata = val.data, isRequest = false;
        for (let [key, item] of Object.entries(Parmsdata)) {
          if (item) {
            isRequest = true
          }
          else {
            isRequest = false;
            break;
          }
        }
        isRequest && this.getCostList() 
      },
      deep: true
    }
  },
  methods: {
    // 弹窗展示时调用
    onShow() {
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
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
    // 判断是否展示选中图标
    showSelIcon(sItem) {
      let flag = false;
      this.selItems && this.selItems.every(item => {
        if (sItem.costCode === item.costCode) {
          flag = true;
          return false;
        }
        return true;
      });
      return flag;
    },
    // 选择物料
    selThis(sItem, sIndex) {
      this.showPop = false;
      this.selItems = [sItem];
      this.$emit('sel-matter',this.selItems[0]);
    },
    // 设置默认值
    setDefaultValue() {
      this.tmpItems = [...this.defaultValue];
      this.selItems = [...this.defaultValue];
    },
    // 获取物料列表
    getCostList() {
      let filter = [];
      if (this.srhInpTx) {
        filter = [
          ...filter,
          {
            operator: 'like',
            value: this.srhInpTx,
            property: 'costName'
          },
        ];
      }
      let data = {
        limit: this.limit,
        page: this.page,
        start: (this.page - 1) * this.limit,
        filter: JSON.stringify(filter),
        ...this.costParams.data,
      }
        return requestData({
        url: this.costParams.url,
        data
      }).then(({dataCount = 0, tableContent = []}) => {
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.costList = this.page === 1 ? tableContent : [...this.costList, ...tableContent];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      })
    },
    // 搜索物料
    searchList({val = ''}) {
      this.srhInpTx = val;
      this.costList = [];
      this.page = 1;
      this.hasNext = true;
      this.$refs.bScroll.scrollTo(0, 0);
      this.getCostList();
    },
    // 上拉加载
    onPullingUp() {
      this.page++;
      this.getCostList();
    },
  },
  created() {
    this.setDefaultValue();
    this.getCostList();
  }
}
</script>

<style scoped lang="scss">
  .symbol {
    font-size: .1rem;
  }
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      height: 100%;
      // 顶部
      .title {
        height: 100%;
        font-size: .2rem;
        position: relative;
        padding-top: 0.08rem;
        // 搜索
        .search_part {
          width: 100%;
          display: flex;
          height: .3rem;
          line-height: .3rem;
          position: relative;
          // 搜索输入框
          .srh_inp {
            flex: 5;
            outline: none;
            border: none;
            color: #2D2D2D;
            font-size: .16rem;
            padding: 0 .3rem 0 .4rem;
            background: #F3F1F2;
            border-top-left-radius: .3rem;
            border-bottom-left-radius: .3rem;
          }
          // 取消 按钮
          .pop_cancel {
            flex: 1;
            color: #fff;
            font-size: .14rem;
            text-align: center;
            background: #fc3c3c;
            border-top-right-radius: .3rem;
            border-bottom-right-radius: .3rem;
          }
          // 搜索icon
          .serach_icon {
            top: 50%;
            left: 10px;
            fill: #2D2D2D;
            position: absolute;
            transform: translate(0, -50%);
          }
          // 清除icon
          .clear_icon {
            top: 50%;
            right: 14%;
            width: .3rem;
            height: .3rem;
            z-index: 100;
            display: block;
            font-size: .12rem;
            line-height: .3rem;
            text-align: center;
            position: absolute;
            transform: translate(0, -50%);
          }
        }
        // 关闭icon
        .close_icon {
          top: 50%;
          right: -2%;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
      // 物料列表
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .38rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .14rem .15rem 0;
        }
        // 每个物料
        .each_mater {
          position: relative;
          display: flex;
          padding: 0.1rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          border-radius: .04rem;
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          &.selected {
            border: 1px solid #3296FA;
          }
          // 物料主体
          .mater_main {
            font-size: .14rem;
            font-weight: bold;
            padding-left: .04rem;
            display: inline-block;
            box-sizing: border-box;
            // 物料名称
            .cost_name {
              overflow: hidden;
              color: #5077aa;
              max-height: .46rem;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
            }
            // 物料信息
            .cost_type {
              color: #757575;
            }
            .cost_subject {
              color: #111;
            }
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
            fill: #5077aa;
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
