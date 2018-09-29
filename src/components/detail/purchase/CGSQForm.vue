<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :matter-list="orderInfo.order.dataSet"></matter-list>
      <!-- 金额合计栏 -->
      <price-total :count="count" noAmt noTaxAmt></price-total>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// 请求 引入
import { isMyflow, getSOList, getWorkFlow, getListId } from 'service/detailService'
import { commitTask, saveAndCommitTask } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/detailCommon'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import MatterList from 'components/detail/commonPart/MatterList'
//公共方法引入
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd.js'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '',
    }
  },
  components: {
    workFlow, RAction,PriceTotal,MatterList
  },
  mixins: [common],
  methods: {
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
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
        this.submitInfo = JSON.parse(JSON.stringify(data));
        // http200时提示报错信息
        if (data.success === false) {
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
              onHide:()=>{
              this.$router.back();
            }
          })
          return;
        }
        // 获取合计
        let {dataSet} = data.formData.order;
        dataSet.forEach(item=>{
          item.tdAmount = accMul(item.tdQty,item.price)
          this.count = accAdd(this.count,item.tdAmount);
          item.inventoryPic = item.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();

        })
        this.orderInfo = data.formData;
        this.workFlowInfoHandler();
      })

    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
</style>
