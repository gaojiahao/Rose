<template>
  <div class="detail_wrapper task_container">
    <div class="basicPart" v-if='orderInfo'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <warehouse-content :warehouse-config="warehouseConfig"></warehouse-content>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_content">
        <div class="main_content" :class="{'no_bottom': index === workInfo.length-1}" v-for="(item, index) in workInfo" :key="index">
          <div class="vux-1px-b" v-for="(cItem, cIndex) in matterConfig" :key="cIndex">
            <template v-if="cItem.editorType === 'r2Datefield'">
              <div class="each_info">
                <label>{{cItem.text}}</label>
                <span class="field_value">{{item[cItem.fieldCode] | timeSplit}}</span>
              </div>
            </template>
            <template v-else>
              <div class="each_info">
                <label>{{cItem.text}}</label>
                <span class="field_value">{{item[cItem.fieldCode]}}</span>
              </div>
            </template> 
          </div>
        </div>
        <div class="main_content">
          <div class="each_info">
            <label>备注</label>
            <span class="field_value">{{orderInfo.biComment || '无'}}</span>
          </div>
        </div>
      </div>
      <other-part :other-info="orderInfo" :attachment="attachment" :showComment='false'></other-part>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { Cell, Group,dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import { toFixed } from '@/plugins/calc'
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'
import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
import BomList from 'components/detail/commonPart/BomList'


export default {
  data() {
    return {
      workInfo: [],       // 工单内容
      orderInfo: {},      // 表单内容
      warehouse : {},     //仓库信息
      bomList: [],        //bom信息
      warehouseConfig: []
    }
  },
  mixins: [detailCommon],
  components: {
    Cell, Group, RAction, workFlow, contactPart,WarehouseContent,BomList
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
        this.warehouse = {
          ...this.warehouse,
          containerCode: order.containerCode,
          storehouseInCode: order.storehouseInCode,
          warehouseAddress_containerCode: order.warehouseAddress_containerCode,
          warehouseAddress_storehouseInCode: order.warehouseAddress_storehouseInCode,
          warehouseName_containerCode: order.warehouseName_containerCode,
          warehouseName_storehouseInCode: order.warehouseName_storehouseInCode,
          warehouseType_containerCode: order.warehouseType_containerCode,
          warehouseType_storehouseInCode: order.warehouseType_storehouseInCode,
          // warehouseName: order.warehouseName_containerCode,
          // warehouseType: order.warehouseType_containerCode,
          // warehouseAddress: order.warehouseAddress_containerCode,
        }
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
  .main_content {
    &.no_bottom {
      margin-bottom: 0;
    }
  }
</style>
