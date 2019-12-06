<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="popup-project-list" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <div class="title">
          <!-- 搜索栏 -->
          <r-search @search='searchList' @turn-off="onHide" :isFill='true'></r-search>
        </div>
        <!-- 物料列表 -->
        <r-scroll class="project-list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="each_mater box_sd" v-for="(item, index) in listData" :key='index'
               @click.stop="selThis(item, index)">
            <div class="matter_name vux-1px-b">
              <span class="matter_simple">名称</span>
              {{item.name}}
            </div>
            <div class="matter_unit" v-if="item.amount">单价: ￥{{item.amount}}</div>
            <div class="matter_unit" v-if="item.num5" >系数: {{item.num5}}</div>
            <!-- icon -->
            <x-icon class="selIcon" type="ios-circle-outline" size="20"></x-icon>
            <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class="count_mode vux-1px-t">
        <span class="count_num"> {{tmpItems.length ? `已选 ${tmpItems.length} 个` : '请选择'}} </span>
        <span class="count_btn" @click="confirm">确定</span>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup,} from 'vux'
  import RScroll from 'components/common/RScroll'
  import RSearch from 'components/common/RSearch'
  // 请求 引入
  import saleRepotService from "service/saleRepotService";

  export default {
    name: "PopupProjectList",
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
    },
    components: {
      Icon, Popup, RScroll, RSearch,
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        tmpItems: [], // 临时存储
        listData: [], // 物料列表
        limit: 10, // 每页条数
        page: 1., // 当前页码
        hasNext: true, // 是否有下一页
        scrollOptions: { // 滚动配置
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
      },
      // 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          return item.value === sItem.value
        });
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.tmpItems, sItem) !== -1;
      },
      // 选择物料
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
      // 确定选择物料
      confirm() {
        let sels = [];
        this.showPop = false;
        this.tmpItems.sort((a, b) => a['trans_detail_uncalc.bankCharge'] - b['trans_detail_uncalc.bankCharge']);
        this.selItems = [...this.tmpItems];
        // 触发父组件选中事件
        this.$emit('on-sel', JSON.parse(JSON.stringify(this.selItems)));
      },
      // 获取物料列表
      getList() {
        let filter = [{"operator":"like","value":"0","property":"trans_detail_uncalc.var1"}];
        //成品,商品,服务
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'trans_detail_uncalc.transObjCode',
            },
          ];
        }
        return saleRepotService.saleRepotList({
          page: this.page,
          limit: this.limit,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({tableContent = [], dataCount = 0}) => {
          let none = [{
            name: '无',
            value: '无',
            taxAmount: '',
            amount: 0,
            num5: 0,
            qty: '',
            num1: '',
            'trans_detail_uncalc.price':'0'
          }];
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? [...none, ...tableContent] : [...this.listData, ...tableContent];
          tableContent.forEach(item => {
            item.name = item["trans_detail_uncalc.transObjCode"];
            item.value = item["trans_detail_uncalc.transObjCode"];
            item.taxAmount = item["trans_detail_uncalc.qty"];
            item.amount = item["trans_detail_uncalc.price"];
            item.num5 = item["trans_detail_uncalc.num5"];
            item.qty = '';
          });
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getList();
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
        this.page++;
        this.getList();
      },
      // 设置默认值
      setDefaultValue() {
        this.tmpItems = [...this.defaultValue];
        this.selItems = [...this.defaultValue];
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
  .popup-project-list {
    background: #fff;
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
