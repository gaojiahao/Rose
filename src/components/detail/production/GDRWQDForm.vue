<template>
  <div class="detail_wrapper gdrwqd-detail-container">
    <div class="basicPart" v-if='orderInfo'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 仓库信息 -->
      <div class="warehouse_part">
        <warehouse-content :warehouse="warehouse"></warehouse-content>
      </div>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_content">
        <div class="form_title">
          <span class="iconfont icon-mingxi1"></span>
          <span>工单信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='工序名称' :cellContent="workInfo.procedureName_proPointCode"></form-cell>
          <form-cell cellTitle='工序编码' :cellContent="workInfo.proPointCode"></form-cell>
          <form-cell cellTitle='工序待验收' :cellContent="`${workInfo.thenQtyStock}`"></form-cell>
          <form-cell cellTitle='工序待启动' :cellContent="`${workInfo.thenQtyBal}`"></form-cell>
          <form-cell cellTitle='启动数量' :cellContent="`${workInfo.tdQty}`"></form-cell>
          <form-cell cellTitle='工人' :cellContent="workInfo.dealerName_dealerDebit"></form-cell>
          <form-cell cellTitle='设施' :cellContent="workInfo.facilityName_facilityObjCode"></form-cell>
          <form-cell cellTitle='物料名称' :cellContent="workInfo.inventoryName_transObjCode"></form-cell>
          <form-cell cellTitle='物料编码' :cellContent="workInfo.transObjCode"></form-cell>
          <form-cell cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
        </div>
      </div>
      <div class="bom_list" v-show="bomList.length">
        <bom-list :boms="bomList">
          <template slot-scope="{bom}" slot="specification">
            <div class="content-unit">
              <span>型号规格: {{bom.specification_outPutMatCode}}</span>
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
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle"
                   :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {Cell, Group, dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  // 组件 引入
  import {toFixed} from '@/plugins/calc'
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  import BomList from 'components/detail/commonPart/BomList'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'

  export default {
    data() {
      return {
        workInfo: {},       // 工单内容
        orderInfo: {},      // 表单内容
        bomList: [],
        warehouse: {},
      }
    },
    mixins: [detailCommon],
    components: {
      Cell, Group, RAction, workFlow, contactPart,
      BomList, WarehouseContent,
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
          let {outPut = {}} = formData;
          let {dataSet = []} = outPut;
          this.warehouse = {
            warehouseName: outPut.warehouseName_containerCode,
            warehouseType: outPut.warehouseType_containerCode,
            warehouseAddress: outPut.warehouseAddress_containerCode,
          };
          // 设置bom列表
          dataSet.forEach(item => {
            item.inventoryName = item.inventoryName_outPutMatCode;
            item.inventoryCode = item.outPutMatCode;
          });
          this.bomList = dataSet;

          this.attachment = attachment;
          this.orderInfo = formData;
          this.workInfo = formData.order.dataSet[0];
          this.workFlowInfoHandler();
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .gdrwqd-detail-container {
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
    //bom合计
    .bom_list{
      position: relative;
      background: #FFF;
      padding: .06rem .08rem;
      margin-top:0.1rem;
    }
    .comment-part {
      background: #fff;
      padding: .06rem .08rem;
    }
  }
</style>
