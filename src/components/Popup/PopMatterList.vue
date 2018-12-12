<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <div class="title">
          <!-- 搜索栏 -->
          <m-search :filterList="filterList" @search='searchList' @turn-off="onHide" :isFill='true'></m-search>
        </div>
        <!-- 物料列表 -->
        <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !matterList.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="each_mater box_sd" v-for="(item, index) in matterList" :key='index'
               @click.stop="selThis(item, index)">
            <div class="order-code" v-if="item.transCode && !item.transCode.includes(',') && isShowCode">
              <slot name='titleName'>
                <span class="order-title">单号</span>
              </slot>
              <span class="order-num">{{item.transCode}}</span>
            </div>
            <div class="order-matter">
              <div class="mater_img">
                <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
              </div>
              <div class="mater_main ">
                <!-- 物料名称 -->
                <div class="mater_name">
                  {{item.inventoryName}}
                </div>
                <!-- 物料基本信息 -->
                <div class="mater_info">
                  <!-- 物料编码、规格 -->
                  <div class="withColor">
                    <!-- 物料编码 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_code">
                        <span class="title">编码</span>
                        <span class="num">{{item.inventoryCode}}</span>
                      </div>
                    </div>
                    <!-- 物料规格 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_spec">
                        <span class="title">规格</span>
                        <span class="num">{{item.specification || '无'}}</span>
                      </div>
                    </div>
                  </div>
                  <!-- 物料分类、材质 -->
                  <div class="withoutColor">
                    <!-- 基本信息插槽 -->
                    <slot name='attribute' :item="item">
                      <div class="mater_classify">
                        <span class="type">属性: {{item.processing}}</span>
                        <span class="father">大类: {{item.inventoryType || '无'}}</span>
                        <span class="child">子类: {{item.inventorySubclass || '无'}}</span>
                      </div>
                      <div class="mater_material">
                        <span class="unit">单位: {{item.measureUnit}}</span>
                        <span class="color">颜色: {{item.inventoryColor || '无'}}</span>
                        <span class="spec">材质: {{item.material || '无'}}</span>
                      </div>
                    </slot>
                    <!-- 其他信息插槽 -->
                    <slot name="storage" :item="item">
                      <div class="mater_material" v-if="item.qtyBal !== undefined">
                        <span class="spec">余额: {{item.qtyBal}}</span>
                      </div>
                      <div class="mater_material" v-if="item.allQty">
                        <span class="spec">待做需求: {{item.qtyBalance}}</span>
                      </div>
                    </slot>                  
                  </div>
                </div>
              </div>
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
  import {Icon, Popup, dateFormat} from 'vux'
  import {getList} from 'service/commonService'
  import {
    getObjInventoryByProcessing,
    getSumInvBalance,
    getObjInventory,
    getInventory7501,
    getInventory7502,
    getCKTHCKList,
    getPurchaseInNeeds,
    getKCPDList,
    getLowValueConsumPurchaseOrder,
    getLowPriceConsumableInWarehouse,
    getProductPriceAllInventory,
    getSalesContract,
    getInventoryToProcessing,
    getSalesOrderNew,
  } from 'service/materService'
  import RScroll from 'components/RScroll'
  import MSearch from 'components/search'

  export default {
    name: "PopMatterList",
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
      // 用于请求的key名，用于区分不同的接口
      getListMethod: {
        type: String,
        default: 'getMatList'
      },
      // 请求的传参，本地库存调拨请求数据时会传入
      params: {
        type: Object,
        default() {
          return {}
        }
      },
      isShowCode: {
        type: Boolean,
        default: true
      },
      // 是否检验可用库存，是，当库存为零，该物料不能被选中
      isShowStock: { 
        type: Boolean,
        default: false 
      },
      filterList: {
        type: Array,
        default() {
          return [ // 过滤列表
            {
              name: '物料名称',
              value: 'inventoryName',
            }, {
              name: '物料编码',
              value: 'inventoryCode',
            },
          ]
        }
      }
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
          click: true,
          pullUpLoad: true,
        },
        filterProperty: '', // 过滤的key
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
          this[this.getListMethod]();
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
          let isSameTransCode = true;
          if (item.transCode) {
            isSameTransCode = item.transCode === sItem.transCode;
          }
          return isSameTransCode && item.inventoryCode === sItem.inventoryCode
        });
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.tmpItems, sItem) !== -1;
      },
      // TODO 选择物料
      selThis(sItem, sIndex) {
        // 校验库存
        if (this.isShowStock && sItem.qtyStockBal=== 0) {
          this.$vux.alert.show({
            content: '当前订单库存为0，请选择其他订单'
          });
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
      // TODO 确定选择物料
      cfmMater() {
        let sels = [];
        this.showPop = false;
        this.tmpItems.sort((a, b) => b.effectiveTime - a.effectiveTime);
        this.selItems = [...this.tmpItems];
        // 触发父组件选中事件
        this.$emit('sel-matter', JSON.stringify(this.selItems));
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 获取物料列表
      getMatList() {
        let filter = [];
        //成品,商品,服务
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getObjInventoryByProcessing({
          processing: '成品,商品,服务',
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }).then(this.dataHandler);
      },
      // TODO 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.resetCondition();
        this[this.getListMethod]();
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
        this[this.getListMethod]();
      },
      // TODO 设置默认值
      setDefaultValue() {
        this.tmpItems = [...this.defaultValue];
        this.selItems = [...this.defaultValue];
      },
      // TODO 获取物料列表(采购入库、采购协议)
      getObjInventory() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getObjInventory({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      // TODO 出库仓库现有物料请求
      getSumInvBalance() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getSumInvBalance({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          calcRelCode: 1406,
          ...this.params,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      // TODO 获取物料列表(采购订单)
      getInventory7501() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        let {relationKey = ''} = this.$route.query;
        if (relationKey) {
          filter = [
            {
              operator: 'eq',
              value: relationKey,
              property: 'transCode'
            }
          ]
        }
        return getInventory7501({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          ...this.params,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      // TODO 获取物料列表(采购入库)
      getInventory7502() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getInventory7502({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          ...this.params,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      // TODO 获取物料列表(采购退货出库)
      getCKTHCKList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getCKTHCKList({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          ...this.params,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      //获取采购申请物料列表
      getPurchaseInNeeds() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getPurchaseInNeeds({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          tableContent.forEach(item => {
            item.inventoryPic = item.inventoryPic ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400` : this.getDefaultImg();
            item.inventoryCode = item.matCode;
            item.inventoryName = item.invName;
          });
          let {relationKey = ''} = this.$route.query;
          if (relationKey) {
            this.selItems = [...tableContent];
            this.$emit('sel-matter', JSON.stringify(this.selItems));
          }
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.matterList = this.page === 1 ? tableContent : [...this.matterList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })

        });
      },
      // TODO 获取物料列表(库存盘点)
      getKCPDList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getKCPDList({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          ...this.params,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      // TODO 获取物料列表(低值易耗品采购订单)
      getLowValueConsumPurchaseOrder() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getLowValueConsumPurchaseOrder({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          ...this.params,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      // TODO 获取物料列表(低值易耗品采购低值易耗品采购验收与支付)
      getLowPriceConsumableInWarehouse() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getLowPriceConsumableInWarehouse({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          ...this.params,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      // 获取产品价格的物料列表
      getProductPriceAllInventory() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getProductPriceAllInventory({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(this.dataHandler);
      },
      // TODO 获取销售合同的物料列表
      getSalesContract() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getSalesContract({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }).then(this.dataHandler);
      },
      // TODO 获取销售订单预测的物料列表
      getInventoryToProcessing() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getInventoryToProcessing({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }).then(this.dataHandler);
      },
      // TODO 获取产品销售订单的物料列表
      getSalesOrderNew() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getSalesOrderNew({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }).then(this.dataHandler);
      },
      // TODO 共用的数据处理方法
      dataHandler({dataCount = 0, tableContent = []}) {
        tableContent.forEach(item => {
          item.inventoryPic = item.inventoryPic ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400` : this.getDefaultImg();
        });
        let {relationKey = ''} = this.$route.query;
        if (relationKey) {
          this.selItems = [...tableContent];
          this.$emit('sel-matter', JSON.stringify(this.selItems));
        }
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.matterList = this.page === 1 ? tableContent : [...this.matterList, ...tableContent];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      },
      // TODO 初始化条件
      resetCondition() {
        this.matterList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
      },
    },
    created() {
      this.setDefaultValue();
      // 请求物料
      this[this.getListMethod]();
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
          .order-code {
            display: flex;
            color: #fff;
            font-size: .12rem;
            span {
              display: inline-block;
              padding: 0 .04rem;
            }
            .order-title {
              background: #455d7a;
            }
            .order-num {
              background: #c93d1b;
              border-top-right-radius: .08rem;
            }
          }
          .order-matter {
            display: flex;
            margin-top: .1rem;
          }
          // 物料图片
          .mater_img {
            display: inline-block;
            width: .75rem;
            height: .75rem;
            img {
              width: 100%;
              max-height: 100%;
              border-radius: .04rem;
            }
          }
          // 物料主体
          .mater_main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 物料名称
            .mater_name {
              color: #111;
              overflow: hidden;
              font-size: .12rem;
              font-weight: bold;
              max-height: .46rem;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
              // 每个物料的索引
              .whiNum {
                color: #fff;
                font-size: .1rem;
                padding: 0 .04rem;
                display: inline-block;
                background: #ea5455;
                border-radius: .04rem;
                vertical-align: middle;
                margin: -.02rem .04rem 0 0;
              }
            }
            // 物料信息
            .mater_info {
              color: #757575;
              font-size: .12rem;
              word-break: break-all;
              // 有颜色包裹的
              .withColor {
                margin-top: .04rem;
                // 物料编码
                .mater_code {
                  display: flex;
                  .title,
                  .num {
                    font-size: .1rem;
                    display: inline-block;
                    padding: .01rem .04rem;
                  }
                  .title {
                    color: #fff;
                    background: #3f72af;
                    border-top-left-radius: .04rem;
                    border-bottom-left-radius: .04rem;
                  }
                  .num {
                    color: #111;
                    max-width: .85rem;
                    overflow: hidden;
                    white-space: nowrap;
                    background: #dbe2ef;
                    box-sizing: border-box;
                    text-overflow: ellipsis;
                    border-top-right-radius: .04rem;
                    border-bottom-right-radius: .04rem;
                  }
                }
                // 规格
                .mater_spec {
                  @extend .mater_code;
                  margin-left: .1rem;
                  .title {
                    color: #fff;
                    background: #537791;
                  }
                  .num {
                    color: #fff;
                    max-width: .6rem;
                    background: #ff7f50;
                  }
                }
              }
              // 没颜色包裹的
              .withoutColor {
                // 物料分类
                .mater_classify {
                  font-size: .1rem;
                  margin-top: .02rem;
                  .type,
                  .father {
                    margin-right: .04rem;
                  }
                }
                // 物料颜色 材质
                .mater_material {
                  font-size: .1rem;
                  .unit,
                  .color {
                    margin-right: .06rem;
                  }
                }
              }
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
