<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 仓库信息 -->
      <warehouse-content :warehouse="warehouseIn" :warehouse-out="warehouseOut" :warehouseConfig="warehouseConfig"></warehouse-content>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName"
                 :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :matter-list="matterList" @on-show-more="onShowMore"></matter-list>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
      <!-- 物料详情 -->
      <pop-matter-detail :show="showMatterDetail" :item="matterDetail" v-model="showMatterDetail"></pop-matter-detail>
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
        orderInfo: {},
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

          let {formData = {}, attachment = []} = data;
          let {inPut = {}} = formData;
          let {dataSet} = inPut;
          for (let val of dataSet) {
            val.inventoryPic = val.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
          }
          // 入库
          this.warehouseIn = { 
            containerCodeOut: inPut.containerCodeOut,
            warehouseName_containerCodeOut: `${inPut.warehouseName_containerCodeOut}`,
            warehouseAction: '入库',
            warehouseIcon: 'icon-ruku',
            warehouseType_containerCodeOut: inPut.warehouseType_containerCodeOut,
            warehouseProvince: inPut.warehouseProvince_containerCodeOut,
            warehouseCity: inPut.warehouseCity_containerCodeOut,
            warehouseDistrict: inPut.warehouseDistrict_containerCodeOut,
            warehouseAddress_containerCodeOut: inPut.warehouseAddress_containerCodeOut,
            containerOutWarehouseManager: formData.containerOutWarehouseManager,
            warehouseName_storehouseOutCode: inPut.warehouseName_storehouseOutCode,
            storehouseOutCode: inPut.storehouseOutCode,
            warehouseType_storehouseOutCode: inPut.warehouseType_storehouseOutCode,
            warehouseAddress_storehouseOutCode: inPut.warehouseAddress_storehouseOutCode,
          };
          // 出库
          this.warehouseOut = {
            containerCode: inPut.containerCode,
            warehouseName_containerCode: `${inPut.warehouseName_containerCode}`,
            warehouseAction: '出库',
            warehouseIcon: 'icon-chuku',
            warehouseType_containerCode: inPut.warehouseType_containerCode,
            warehouseProvince: inPut.warehouseProvince_containerCode,
            warehouseCity: inPut.warehouseCity_containerCode,
            warehouseDistrict: inPut.warehouseDistrict_containerCode,
            warehouseAddress_containerCode: inPut.warehouseAddress_containerCode,
            containerInWarehouseManager: formData.containerInWarehouseManager,
            warehouseName_storehouseInCode: inPut.warehouseName_storehouseInCode,
            storehouseInCode: inPut.storehouseInCode,
            warehouseType_storehouseInCode: inPut.warehouseType_storehouseInCode,
            warehouseAddress_storehouseInCode: inPut.warehouseAddress_storehouseInCode,
          };
          this.attachment = attachment
          this.matterList = inPut.dataSet;
          this.orderInfo = formData;
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
