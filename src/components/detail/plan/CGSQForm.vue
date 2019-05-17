<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :order-list='orderList' :order-title="orderTitle"></matter-list>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// 请求 引入
import { isMyflow, getSOList, getWorkFlow, getListId } from 'service/detailService'
import { commitTask, saveAndCommitTask } from 'service/common/commonService'
// mixins 引入
import common from 'mixins/detailCommon'
// 组件 引入
import RAction from 'components/public/RAction'
import workFlow from 'components/public/workFlow'
import MatterList from 'components/detail/commonPart/MatterList'
//公共方法引入
import {accAdd,accMul} from 'plugins/calc/decimalsAdd'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '',
    }
  },
  components: {
    RAction, workFlow, MatterList
  },
  mixins: [common],
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
      }).then(({success = true, formData = {},attachment = []}) => {
        // http200时提示报错信息
        if (success === false) {
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
              onHide:() => {
              this.$router.back();
            }
          })
          return;
        }
        let orderList = {};
        let {order = {}} = formData;
        this.attachment = attachment;
        // 获取合计
        let {dataSet} = formData.order;
        for (let item of dataSet) {
          this.count = accAdd(this.count,item.tdAmount);
          item.inventoryPic = item.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
          item.transObjCode = item.inventoryCode_transObjCode;
          if (!orderList[item.transMatchedCode]) {
            orderList[item.transMatchedCode] = [];
          }
          orderList[item.transMatchedCode].push(item);
        }
        this.orderList = orderList;
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })

    },
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
</style>
