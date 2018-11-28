<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <div class="title">
          <!-- 搜索栏 -->
          <m-search @search='searchList' @turn-off="onHide" :isFill='true'></m-search>
        </div>
        <!-- 物料列表 -->
        <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !matterList.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="each_mater box_sd" v-for="(item, index) in matterList" :key='index'
               @click.stop="selThis(item, index)">
            <div class="pop-info top">
              <span class="info-item">{{item.transCode}}</span>
            </div>
            <div class="pop-info">
              <span class="info-item">采购定金: {{item.thenAmntBal}}</span>
              <span class="info-item">总金额: {{item.deposit}}</span>
            </div>
            <!-- icon -->
            <x-icon class="selIcon" type="ios-circle-outline" size="20"></x-icon>
            <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class="count_mode vux-1px-t">
        <span class="count_num"> {{tmpItems.length ? `已选 ${tmpItems.length} 个` : '请选择'}} </span>
        <span class="count_btn" @click="cfmMater">确定</span>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup} from 'vux'
  import {getPurchaseAgreementDeposit} from 'service/costService'
  import RScroll from 'components/RScroll'
  import MSearch from 'components/search'

  export default {
    name: "PopEarnestMoneyList",
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
      // 请求的传参，本地库存调拨请求数据时会传入
      params: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    components: {
      Icon, Popup, RScroll, MSearch
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        tmpItems: [], // 临时存储
        matterList: [], // 物料列表
        limit: 100, // 每页条数
        page: 1., // 当前页码
        hasNext: true, // 是否有下一页
        scrollOptions: { // 滚动配置
          pullUpLoad: true,
        },
        filterProperty: '', // 过滤的key
        filterList: [ // 过滤列表
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          },
        ],
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
      params: {
        handler() {
          this.resetCondition();
          // 参数改变，重新请求接口
          this.getList();
        }
      }
    },
    methods: {
      // TODO 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            // 弹窗展示时刷新滚动，防止无法拖动问题
            this.$refs.bScroll.refresh();
          }
        })
      },
      // TODO 弹窗隐藏时调用
      onHide() {
        this.tmpItems = [...this.selItems];
        this.$emit('input', false);
      },
      // TODO 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          return item.transCode === sItem.transCode
        });
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.tmpItems, sItem) !== -1;
      },
      // TODO 选择物料
      selThis(sItem, sIndex) {
        let arr = this.tmpItems;
        let delIndex = this.findIndex(arr, sItem);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 确定选择物料
      cfmMater() {
        let sels = [];
        this.showPop = false;
        this.tmpItems.sort((a, b) => b.effectiveTime - a.effectiveTime);
        this.selItems = [...this.tmpItems];
        // 触发父组件选中事件
        this.$emit('sel-item', JSON.stringify(this.selItems));
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.resetCondition();
        this.getList();
      },
      // TODO 删除选中项
      delSelItem(dItem) {
        let delIndex = this.findIndex(this.selItems, dItem);
        if (delIndex !== -1) {
          this.selItems.splice(delIndex, 1);
        }
        this.tmpItems = [...this.selItems];
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      // TODO 设置默认值
      setDefaultValue() {
        this.tmpItems = [...this.defaultValue];
        this.selItems = [...this.defaultValue];
      },
      // TODO 初始化条件
      resetCondition() {
        this.matterList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
      },
      getList() {
        let filter = [];
        //成品,商品,服务
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'transCode',
            },
          ];
        }
        return getPurchaseAgreementDeposit({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.matterList = this.page === 1 ? tableContent : [...this.matterList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
    },
    created() {
      this.setDefaultValue();
      // 请求物料
      this.getList();
    }
  }
</script>

<style scoped lang="scss">
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      height: calc(100% - .44rem);
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding: .08rem 0;
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
          padding: .04rem .04rem 0 .3rem;
        }
        // 每个物料
        .each_mater {
          position: relative;
          // display: flex;
          padding: 0.08rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          .pop-info {
            display: flex;
            flex-wrap: wrap;
            color: #757575;
            font-size: .12rem;
            &.top {
              color: #000;
              font-size: .14rem;
            }
          }
          .info-item {
            margin-right: .05rem;
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
