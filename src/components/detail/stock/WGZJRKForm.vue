<template>
  <div class="detail_wrapper nbjdgg-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <warehouse-content :warehouse="warehouseIn" :warehouse-out="warehouseOut" :warehouseConfig='warehouseConfig'></warehouse-content>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :order-list='orderList' :order-title="orderTitle"></matter-list>
      <!-- bom合计 -->
      <div class="bom_list">
        <bom-list :boms="bomList">
          <template slot="number" slot-scope="{bom}">
            <div class="number-part">
              <span class="main-number">领料需求: {{bom.tdQty}}{{bom.measureUnit}}</span>
              <span class="number-unit">在库余额: {{bom.thenTotalQtyStock}}</span>
            </div>
          </template>
        </bom-list>
      </div>
      <!--原料bom列表-->
      <!-- <bom-pop :show="bomPopShow" :bomInfo="bom" v-model="bomPopShow" class="bom_pop" :is-edit="false">
      </bom-pop> -->
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>
<script>
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'mixins/detailCommon'
  import common from 'mixins/common'
  //公共方法引入
  import {accMul, accAdd} from 'plugins/calc/decimalsAdd'
  // 组件 引入
  import RAction from 'components/public/RAction'
  import workFlow from 'components/public/workFlow'
  import MatterItem from 'components/detail/commonPart/MatterItem'
  import BomList from 'components/detail/commonPart/BomList'
  import FormCell from 'components/detail/commonPart/form-part/FormCell'
  import BomPop from 'components/apply/commonPart/BomPop'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'

  export default {
    data() {
      return {
        count: 0, // 金额合计
        orderInfo: {}, // 表单内容
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
        orderList: {}, // 物料列表
        basicInfo: {}, // 存放基本信息
        DuplicateBoms: [], // 有重复项的bom
        UniqueBom: [], // 合并去重后的bom
        bomPopShow: false, // bom展示
        bom: {}, // bomPop中要展示的bom
        warehouseIn: {}, // 入库仓库详情
        warehouseOut: {}, // 出库仓库详情
        bomList: [],
      }
    },
    mixins: [detailCommon, common],
    components: {
      workFlow, RAction, MatterItem, BomList, FormCell, BomPop, WarehouseContent
    },
    watch: {
      DuplicateBoms: {
        handler(val) {
          var isEqual = (a, b) => a.inventoryCode === b.inventoryCode;
          var getNew = old => old.reduce((acc, cur) => {
            let hasItem = acc.some(e => {
              let temp = isEqual(e, cur);
              if (temp) {
                e.tdQty = accAdd(e.tdQty, cur.tdQty);
              }
              return temp;
            });
            if (!hasItem) acc.push(cur)
            return acc;
          }, []);
          this.UniqueBom = getNew(this.DuplicateBoms);
        }
      }

    },
    methods: {
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      //查看原料
      checkBom(item) {
        this.bom = item;
        this.bomPopShow = true;
      },
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(({success = true, formData = {}, attachment = []}) => {
          // http200时提示报错信息
          if (success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          let orderList = {};
          let {order = {}, outPut = {}} = formData;
          let bomList = outPut.dataSet || [];
          this.attachment = attachment;
          // 获取合计
          let {dataSet = []} = order;
          for (let item of dataSet) {
            item.inventoryPic = item.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
            if (item.boms) {
              for (let bom of item.boms) {
                bom.inventoryCode = bom.transObjCode;
                bom.warehouseName = bom.warehouseName_containerCodeOut;
                bom.warehouseCode = bom.containerCodeOut;
                bom.qtyStock = bom.thenQtyStock;
                // 接口返回的tdQty有误，自己手动计算
                bom.tdQty = accMul(bom.bomQty, item.tdQty, (1 + bom.bomSpecificLoss));
              }
              this.DuplicateBoms = this.DuplicateBoms.concat(JSON.parse(JSON.stringify(item.boms)));
            }

            if (!orderList[item.transMatchedCode]) {
              orderList[item.transMatchedCode] = [];
            }
            orderList[item.transMatchedCode].push(item);
          }
          bomList.forEach(item => {
            item.inventoryCode = item.outPutMatCode;
            item.inventoryName = item.inventoryName_outPutMatCode;
            item.measureUnit = item.measureUnit_outPutMatCode;
          });
          this.warehouseIn = {
            containerCodeOut: order.containerCodeOut,
            warehouseName_containerCodeOut: order.warehouseName_containerCodeOut,
            warehouseAction: '入库',
            warehouseIcon: 'icon-ruku',
            warehouseType_containerCodeOut: order.warehouseType_containerCodeOut,
            warehouseAddress_containerCodeOut: order.warehouseAddress_containerCodeOut,
            containerOutWarehouseManager: formData.containerOutWarehouseManager,
            warehouseName_storehouseOutCode: order.warehouseName_storehouseOutCode,
            storehouseOutCode: order.warehouseCode_storehouseOutCode,
            warehouseType_storehouseOutCode: order.warehouseType_storehouseOutCode,
            warehouseAddress_storehouseOutCode: order.warehouseAddress_storehouseOutCode,
          };
           this.warehouseOut = {
            containerCode: order.containerCode,
            warehouseName_containerCode: order.warehouseName_containerCode,
            warehouseAction: '在制仓库',
            warehouseIcon: 'icon-chuku',
            warehouseType_containerCode: order.warehouseType_containerCode,
            warehouseAddress_containerCode: order.warehouseAddress_containerCode,
            containerInWarehouseManager: formData.containerInWarehouseManager,
            warehouseName_storehouseInCode: order.warehouseName_storehouseInCode,
            storehouseInCode: order.storehouseInCode,
            warehouseType_storehouseInCode: order.warehouseType_storehouseInCode,
            warehouseAddress_storehouseInCode: order.warehouseAddress_storehouseInCode,
          };
          this.orderList = orderList;
          this.bomList = bomList;
          this.orderInfo = formData;
          this.workFlowInfoHandler();
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';

  .nbjdgg-detail-container {
    // 加工订单号
    .order_code {
      display: flex;
      color: #fff;
      font-size: .12rem;
      font-weight: bold;
      > span {
        display: inline-block;
        padding: 0 .04rem;
      }
      .order_title {
        background: #1160aa;
      }
      // 订单号
      .order_num {
        background: #9bb4da;
        border-top-right-radius: .08rem;
      }
    }
    .order_matter {
      .each_cell {
        background-color: #fff;
      }
    }
    .mater_other {
      .mater_num {
        .num {
          color: #111;
          font-size: .14rem;
          font-weight: bold;
          .symbol {
            color: #757575;
          }
        }
      }
    }
    //bom合计
    .bom_list {
      position: relative;
      background: #FFF;
      padding: .06rem .08rem;
      margin-top: 0.1rem;
    }
    .comment-part {
      background: #fff;
      padding: .06rem .08rem;
    }
    .get_bom {
      margin-left: 0.2rem;
      font-size: 0.12rem;
      font-weight: bold;
    }
  }

  .bom_pop {
    .number-part {
      display: flex;
      font-size: .1rem;
      text-align: right;
      flex-direction: column;
      .main-number {
        font-size: .12rem;
        font-weight: bold;
        //  color: #757575;
      }
      .number-unit {
        color: #757575;
      }
    }
  }

</style>
