<template>
  <div class="detail_wrapper task_container">
    <div class="basicPart" v-if='orderInfo'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 仓库信息 -->
      <warehouse-content :warehouse-config="warehouseConfig" :warehouse="warehouse"></warehouse-content>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 工单相关信息 -->
      <div class="main-content" :class="{'no_bottom': index === workInfo.length-1}" 
           v-for="(item, index) in workInfo" :key="index">
        <only-word :config="matterConfig" :info="item"></only-word>
      </div>
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'mixins/detailCommon'
// 组件 引入
import { toFixed } from '@/plugins/calc'
import RAction from 'components/public/RAction'
import workFlow from 'components/public/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'
import onlyWord from 'components/detail/commonPart/form-part/onlyWord'
import WarehouseContent from 'components/detail/commonPart/WarehouseContent'

export default {
  data() {
    return {
      workInfo: [],       // 工单内容
      orderInfo: {},      // 表单内容
      warehouse : {},     //仓库信息
      warehouseConfig: []
    }
  },
  mixins: [detailCommon],
  components: {
    RAction, onlyWord, workFlow, 
    contactPart, WarehouseContent
  },
  filters: {
    timeSplit(val) {
      return val ? val.split(' ')[0] : '';
    }
  },
  methods: {
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
        this.attachment = data.attachment;
        let {order = {}} = data.formData;
        data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = data.formData;
        this.workInfo = order.dataSet;
        // this.warehouse = {
        //   ...this.warehouse,
        //   containerCode: order.containerCode,
        //   storehouseInCode: order.storehouseInCode,
        //   warehouseAddress_containerCode: order.warehouseAddress_containerCode,
        //   warehouseAddress_storehouseInCode: order.warehouseAddress_storehouseInCode,
        //   warehouseName_containerCode: order.warehouseName_containerCode,
        //   warehouseName_storehouseInCode: order.warehouseName_storehouseInCode,
        //   warehouseType_containerCode: order.warehouseType_containerCode,
        //   warehouseType_storehouseInCode: order.warehouseType_storehouseInCode,
        //   // warehouseName: order.warehouseName_containerCode,
        //   // warehouseType: order.warehouseType_containerCode,
        //   // warehouseAddress: order.warehouseAddress_containerCode,
        // }
        this.warehouse = {
          containerInWarehouseManager: data.formData.containerInWarehouseManager,
          warehouseName_containerCode : order.warehouseName_containerCode,     
          containerCode : order.containerCode,     
          warehouseType_containerCode : order.warehouseType_containerCode,     
          warehouseAddress_containerCode : order.warehouseAddress_containerCode,     
          containerInWarehouseManager : this.orderInfo.containerInWarehouseManager,                  //仓管员
          warehouseName_storehouseInCode : order.warehouseName_storehouseInCode,                     //库区
          storehouseInCode : order.storehouseInCode,       //库位编码
          warehouseType_storehouseInCode : order.warehouseType_storehouseInCode,     //库位仓库类型
          warehouseAddress_storehouseInCode : order.warehouseAddress_storehouseInCode,    //仓库地址       
        }
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
  .main-content {
    &.no_bottom {
      margin-bottom: 0;
    }
  }
</style>
