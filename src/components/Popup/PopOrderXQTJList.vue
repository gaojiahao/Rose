<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <r-search :filterList="filterList" @search='searchList' @turn-off="onHide" :isFill='true'></r-search>
        <!-- 物料列表 -->
        <r-scroll class="order-list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="order-item" v-for="(item, index) in listData" :key='index'
               @click.stop="selThis(item, index)">
            <div class="order-code">
              <span class="order-title">交易号</span>
              <span class="order-num">{{item.transCode}}</span>
            </div>
            <div class="order-top">
              <span class="order-top-item" v-if="item.orderCode">订单号: {{item.orderCode}}</span>
              <span class="order-top-item" v-if="item.warehouseName">仓库: {{item.warehouseName}}</span>
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
                    <!-- 物料分类 -->
                    <div class="mater_classify">
                      <span class="type">属性: {{item.processing}}</span>
                      <span class="father">大类: {{item.inventoryType || "无"}}</span>
                      <span class="child">子类: {{item.inventorySubclass || "无"}}</span>
                    </div>
                    <!-- 物料材质等 -->
                    <div class="mater_material">
                      <!-- <span class="color">颜色: {{item.inventoryColor || '无'}}</span>
                      <span class="spec">材质: {{item.material || '无'}}</span> -->
                      <slot name="qtyBal" :item="item">
                      </slot>
                    </div>
                    <slot name="qtyStock" :item="item">
                      <div class="mater-balance">余额: {{item.qtyBal}}{{item.measureUnit}}</div>
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
        <span class="count_btn" @click="selConfirm">确定</span>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup} from 'vux'
  import RScroll from 'plugins/scroll/RScroll'
  import {getSalesOrderList} from 'service/listService'
  import {getXQTJList} from 'service/materService'
  import RSearch from 'components/search/search'

  export default {
    name: "PopOrderXQTJList",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      listMethod: {
        type: String,
        default: 'getDemandAdjustment'
      },
      params: {
        type: Object,
        default() {
          return {}
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
        tmpItems: [],
        listData: [],
        limit: 100,
        page: 1.,
        hasNext: true,
        scrollOptions: {
          click: true,
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
          }, {
            name: '交易号',
            value: 'transCode'
          }
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
          this.setDefaultValue();
        }
      },
      params: {
        handler() {
          this.getList();
        }
      },
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
      // 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          let isSameOrderCode = true;
          let isSameColId = true;
          if (item.orderCode) {
            isSameOrderCode = item.orderCode === sItem.orderCode;
          }
          if (item.colId) {
            isSameColId = item.colId === sItem.colId;
          }
          return isSameOrderCode && isSameColId && item.transCode === sItem.transCode && item.inventoryCode === sItem.inventoryCode
        });
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.tmpItems, sItem) !== -1;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        let validateMap = ['getInProcessingOrder', 'getInProcessingStorage'];
        if (validateMap.includes(this.listMethod) && !sItem.orderCode) {
          this.$vux.alert.show({
            content: '当前订单号不存在，不可选择'
          });
          return
        }
        // 加工入库需要对物料的库存进行校验
        if (sItem.qtyBal && sItem.qtyStock <= 0){
          this.$vux.alert.show({
            content: '当前库存为0，不可选择'
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
      // 确定选择订单
      selConfirm() {
        let sels = [];
        // 返回上层
        this.showPop = false;
        // 设置选中项的顺序和列表顺序一致
        this.tmpItems.sort((a, b) => b.effectiveTime - a.effectiveTime);
        this.selItems = [...this.tmpItems];
        this.$emit('sel-matter', JSON.stringify(this.selItems));
      },
      // 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 获取订单列表
      getList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            }];
        }
        let {relationKey = ''} = this.$route.query;
        if (relationKey){
          filter = [
            {
              operator: 'eq',
              value: relationKey,
              property: 'transCode'
            }
          ]
        }
        return getXQTJList({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }, this.listMethod).then(({dataCount = 0, tableContent = []}) => {
          tableContent.forEach(item => {
            item.inventoryPic = item.inventoryPic ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400` : this.getDefaultImg();
          });
          if (relationKey){
            this.selItems = [...tableContent];
            this.$emit('sel-matter', JSON.stringify(this.selItems));
          }
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 重置列表条件
      resetCondition() {
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
      },
      // 搜索订单
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.resetCondition();
        this.getList();
      },
      // 清空搜索条件
      clearList() {
        this.srhInpTx = '';
        this.resetCondition();
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
      // 清空选择项
      clearSel() {
        this.selItems = [];
        this.tmpItems = [];
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      // 设置默认值
      setDefaultValue() {
        let tmp = [];
        for (let items of Object.values(this.defaultValue)) {
          tmp = [...tmp, ...items];
        }
        this.tmpItems = [...tmp];
        this.selItems = [...tmp];
      },
    },
    created() {
      this.showPop = this.show;
      this.setDefaultValue();
      this.getList();
    }
  }
</script>

<style scoped lang="scss">
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      
      height: calc(100% - .44rem);
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
      // 订单列表
      .order-list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .38rem);
        /* 仓库/订单号 */
        .order-top {
          color: #757575;
          font-size: .12rem;
        }
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .14rem .04rem 0 .3rem;
        }
        // 每个物料
        .order-item {
          position: relative;
          display: flex;
          flex-direction: column;
          margin-bottom: .2rem;
          padding: 0.08rem;
          box-shadow: 0 0 8px #e8e8e8;
          box-sizing: border-box;
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

                padding: 0 .04rem;
                font-size: .1rem;
                display: inline-block;
                background: #ea5455;
                vertical-align: middle;
                margin: -.02rem .04rem 0 0;
              }
            }
            // 物料信息
            .mater_info {
              color: #757575;
              font-size: .12rem;
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
                  }
                  .num {
                    color: #111;
                    max-width: .85rem;
                    overflow: hidden;
                    white-space: nowrap;
                    background: #dbe2ef;
                    box-sizing: border-box;
                    text-overflow: ellipsis;
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
                // 余额
                .mater-balance {
                  font-size: .14rem;
                  font-weight: bold;
                  color: #454545;
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
