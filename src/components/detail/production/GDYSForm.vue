<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 仓库信息 -->
      <warehouse-content :warehouse-config="warehouseConfig" :warehouse='warehouse'></warehouse-content>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 工单相关信息 -->
      <only-word :config="fundConfig" :info="workInfo"></only-word>
      <!-- bom列表 -->
      <div class="bom_list" v-show="bomList.length">
        <bom-list :boms="bomList">
          <template slot-scope="{bom}" slot="specification">
            <div class="content-unit" v-show="bom.specification_outPutMatCode">
              <span>产品规格: {{bom.specification_outPutMatCode}}</span>
            </div>
          </template>
          <template slot-scope="{bom}" slot="number">
            <div class="number-part">
              <span class="main-number">数量: {{bom.tdQty}}{{bom.measureUnit_outPutMatCode}}</span>
              <span class="number-unit">bom数量: {{bom.bomQty}}</span>
              <span class="number-unit">损耗率: {{bom.bomSpecificLoss}}</span>
            </div>
          </template>
        </bom-list>
      </div>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
      <!-- 附件 -->
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'mixins/detailCommon'
// 组件 引入
import { toFixed } from '@/plugins/calc'
import RAction from 'components/public/RAction'
import workFlow from 'components/public/workFlow'
import BomList from 'components/detail/commonPart/BomList'
import contactPart from 'components/detail/commonPart/ContactPart'
import onlyWord from 'components/detail/commonPart/form-part/onlyWord'
import WarehouseContent from 'components/detail/commonPart/WarehouseContent'

export default {
  data() {
    return {
      workInfo: {},       // 工单内容
      orderInfo: {},      // 表单内容
      warehouse: {},
      bomList: [],
      warehouseConfig: []
    }
  },
  mixins: [detailCommon],
  components: {
    RAction, workFlow, BomList,
    onlyWord, contactPart, WarehouseContent,
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
      }).then(({success = true, attachment = [], formData = {}}) => {
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
        let {order = {}, outPut = {}} = formData;
        let {dataSet = []} = outPut;
        // this.warehouse = {
        //   ...this.warehouse,
        //   containerCode: order.containerCode,
        //   storehouseInCode: order.storehouseInCode,
        //   warehouseInType: order.warehouseInType,
        //   warehouseAddress_containerCode: order.warehouseAddress_containerCode,
        //   warehouseAddress_storehouseInCode: order.warehouseAddress_storehouseInCode,
        //   warehouseName_containerCode: order.warehouseName_containerCode,
        //   warehouseName_storehouseInCode: order.warehouseName_storehouseInCode,
        //   warehouseType_containerCode: order.warehouseType_containerCode,
        //   warehouseType_storehouseInCode: order.warehouseType_storehouseInCode,
        //   containerInWarehouseManager: formData.containerInWarehouseManager,
        // }
        // 设置bom列表
        dataSet.forEach(item => {
          item.inventoryName = item.inventoryName_outPutMatCode;
          item.inventoryCode = item.outPutMatCode;
          item.bomQty = toFixed(item.bomQty)
        });
        this.bomList = dataSet;

        this.attachment = attachment;
        this.orderInfo = formData;
        this.workInfo = formData.order.dataSet[0];
        this.workInfo.whether = formData.order.dataSet[0].whether == 1 ? '是':'否'
        this.warehouse = {
          warehouseName_containerCode : order.warehouseName_containerCode,     
          containerCode : order.containerCode,     
          warehouseInType : order.warehouseInType,     
          warehouseAddress_containerCode : order.warehouseAddress_containerCode,     
          containerInWarehouseManager : formData.containerInWarehouseManager,                  //仓管员
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
  .xsbj-detail-container{
    .main_content {
      &.no_bottom {
        margin-bottom: 0;
      }
    }
    //bom合计
    .bom_list{
      position: relative;
      background: #FFF;
      padding: .06rem .15rem;
      margin:0.1rem;
    }
    .comment-part {
      background: #fff;
      padding: .06rem .08rem;
    }
  }
</style>
