<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.outPut'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 仓库信息 -->
      <warehouse-content :warehouse="warehouseIn"  :warehouse-out="warehouseOut"></warehouse-content>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName"
                  :is-my-task="isMyTask"
                  :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :matter-list="matterList" ></matter-list>
      <other-part :other-info="orderInfo" :amt="noTaxAmount" :tax-amt="taxAmount" :count="count"
                  :attachment="attachment"></other-part>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // 请求 引入
  import {getSOList,} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'mixins/detailCommon'
  // 组件引入
  import RAction from 'components/public/RAction'
  import workFlow from 'components/public/workFlow'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
  import MatterList from 'components/detail/commonPart/MatterList'

  export default {
    data() {
      return {
        warehouseIn: {}, // 入库仓库详情
        warehouseOut: {}, // 出库仓库详情
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513'
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow,
      PopWarehouseList,
      RAction,
      WarehouseContent,
      MatterList,
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
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          let {attachment = [], formData = {}} = data;
          let {outPut = {}} = formData;
          let {dataSet} = outPut;
          this.attachment = attachment;
          for (let val of dataSet) {
            val.inventoryName_transObjCode = val.inventoryName_outPutMatCode;
            val.transObjCode = val.outPutMatCode;
            val.specification = val.specification_outPutMatCode;
            val.inventoryPic = val.inventoryPic_outPutMatCode
              ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_outPutMatCode}&width=400&height=400`
              : this.getDefaultImg();
          }
          // 入库
          this.warehouseIn = {
            warehouseCode: outPut.containerCode,
            warehouseName: `${outPut.warehouseName_containerCode}`,
            warehouseAction: '入库',
            warehouseIcon: 'icon-ruku',
            warehouseType: outPut.warehouseType_containerCode,
            warehouseProvince: outPut.warehouseProvince_containerCode,
            warehouseCity: outPut.warehouseCity_containerCode,
            warehouseDistrict: outPut.warehouseDistrict_containerCode,
            warehouseAddress: outPut.warehouseAddress_containerCode,
          };
          // 出库
          this.warehouseOut = {
            warehouseCode: outPut.containerCodeOut,
            warehouseName: `${outPut.warehouseName_containerCodeOut}`,
            warehouseAction: '出库',
            warehouseIcon: 'icon-chuku',
            warehouseType: outPut.warehouseType_containerCodeOut,
            warehouseProvince: outPut.warehouseProvince_containerCodeOut,
            warehouseCity: outPut.warehouseCity_containerCodeOut,
            warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
            warehouseAddress: outPut.warehouseAddress_containerCodeOut,
          };
          this.matterList = dataSet;
          this.orderInfo = {
            ...formData,
          };
          this.workFlowInfoHandler();
        })
      },
    },
    created() {
    }
  }
</script>
<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
  .mater_other {
    .mater_left {
      color: #757575;
      font-size: .12rem;
      .units {
        margin-right: .04rem;
      }
    }
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
</style>
