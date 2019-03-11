<template>
  <div class="detail_wrapper gdrwqd-detail-container">
    <div class="basicPart" v-if='orderInfo'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 仓库信息 -->
      <warehouse-content :warehouse-config="warehouseConfig"></warehouse-content>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_content">
        <div class="main_content no_bottom">
          <div class="vux-1px-b" v-for="(cItem, cIndex) in fundConfig" :key="cIndex">
            <template v-if="cItem.editorType === 'r2Datefield'">
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">{{workInfo[cItem.fieldCode] | timeSplit}}</span>
              </div>
            </template>
            <template v-else>
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">{{workInfo[cItem.fieldCode]}}</span>
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
      <div class="bom_list" v-show="bomList.length">
        <bom-list :boms="bomList">
          <template slot-scope="{bom}" slot="specification">
            <div class="content-unit">
              <span>型号规格: {{bom.specification_outPutMatCode}}</span>
            </div>
          </template>
          <template slot-scope="{bom}" slot="number">
            <div class="number-part">
              <span class="main-number">数量: {{bom.tdQtyCopy1}}{{bom.measureUnit_outPutMatCode}}</span>
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
        warehouseConfig: []
      }
    },
    mixins: [detailCommon],
    components: {
      Cell, Group, RAction, workFlow, contactPart,
      BomList, WarehouseContent,
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
          let {outPut = {}} = formData;
          let {dataSet = []} = outPut;
          this.warehouse = {
            warehouseName_containerCode: outPut.warehouseName_containerCode,
            warehouseType_containerCode: outPut.warehouseType_containerCode,
            warehouseAddress_containerCode: outPut.warehouseAddress_containerCode,
            containerCode: outPut.containerCode,
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
    .main_content {
      &.no_bottom {
        margin-bottom: 0;
      }
    }
    //bom合计
    .bom_list{
      position: relative;
      background: #FFF;
      padding: .06rem .1rem;
      margin: .1rem;
    }
    .comment-part {
      background: #fff;
      padding: .06rem .08rem;
    }
  }
</style>
