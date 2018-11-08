<template>
  <div class="detail_wrapper task_container">
    <div class="basicPart" v-if='orderInfo'>
      <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <div class='contacts_part' v-show="warehouse.warehouseName">
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
          <form-cell cellTitle='工序可派工' :cellContent="workInfo.thenQtyBal"></form-cell>
          <form-cell cellTitle='派工数量' :cellContent="workInfo.tdQty"></form-cell>
          <form-cell cellTitle='工人' :cellContent="workInfo.dealerName_dealerDebit"></form-cell>
          <form-cell cellTitle='设施' :cellContent="workInfo.facilityName_facilityObjCode || '无'"></form-cell>
          <form-cell cellTitle='工艺路线名称' :cellContent="workInfo.technicsName_proFlowCode || '无'"></form-cell>
          <form-cell cellTitle='工艺路线编码' :cellContent="workInfo.proFlowCode || '无'"></form-cell>
          <form-cell cellTitle='物料名称' :cellContent="workInfo.inventoryName_transObjCode || '无'"></form-cell>
          <form-cell cellTitle='物料编码' :cellContent="workInfo.transObjCode || '无'"></form-cell>
        </div>
      </div>
      <!-- 物料 -->
      <div class="form_content" :class="{'has_margin' : bomList.length}">
        <div class="main_content">
          <bom-list :boms="bomList">
            <template slot-scope="{bom}" slot="specification">
              <div class="content-unit">
                <span>型号规格：{{bom.specification}}</span>
              </div>
            </template>
            <template slot-scope="{bom}" slot="number">
              <div class="number-part">
                <span class="main-number">数量: {{bom.tdQty || 0}}{{bom.measureUnit}}</span>
                <span class="number-unit">库存余额: {{bom.thenQtyStock}}</span>
                <span class="number-unit">bom数量: {{bom.bomQty}}</span>
              </div>
            </template>
          </bom-list>
          <form-cell cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
        </div>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
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
      workInfo: {},       // 工单内容
      orderInfo: {},      // 表单内容
      warehouse : {},     //仓库信息
      bomList: [],        //bom信息
    }
  },
  mixins: [detailCommon],
  components: {
    Cell, Group, RAction, workFlow, contactPart,WarehouseContent,BomList
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
        let {order = {},outPut = {}} = data.formData;
        data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = data.formData;
        this.workInfo = order.dataSet[0];
        this.warehouse = {
          ...this.warehouse,
          warehouseName: outPut.warehouseName_containerCode, 
          warehouseType: outPut.warehouseType_containerCode,
          warehouseAddress: outPut.warehouseAddress_containerCode,
        }
        outPut.dataSet && outPut.dataSet.forEach(item=>{
          this.bomList.push({
            ...item,
            inventoryCode : item.outPutMatCode,
            inventoryName : item.inventoryName_outPutMatCode,
            measureUnit : item.measureUnit_outPutMatCode,
            specification : item.specification_outPutMatCode,
          })
        })
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
  .task_container{
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
    .contacts_part {
      margin-bottom: .1rem;
      padding: 0 .1rem;
      width: 100%;
      background: #fff;
      box-sizing: border-box;
    }
  }
</style>
