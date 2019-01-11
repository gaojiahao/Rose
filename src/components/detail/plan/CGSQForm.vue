<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :order-list='orderList' @on-show-more="onShowMore">
        <template slot="orderTitle" slot-scope="props">
          <span class="order_title">物料需求计划号：</span>
        </template>
      </matter-list>
      <!-- 备注 -->
      <div class="comment-part">
        <price-total :amt="noTaxAmount" :tax-amt="taxAmount" :count="count" v-if="count"></price-total>
        <div class="comment-container">
          <span class="comment_title">备注：</span>
          <span class="comment_value">{{orderInfo.biComment || '无'}}</span>
        </div>
        <!-- 附件 -->
        <upload-file :default-value="attachment" no-upload></upload-file>
      </div>
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
import { isMyflow, getSOList, getWorkFlow, getListId } from 'service/detailService'
import { commitTask, saveAndCommitTask } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/detailCommon'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import MatterList from 'components/detail/commonPart/MatterList'
import MatterItem from 'components/detail/commonPart/MatterItem'
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
    workFlow, RAction,PriceTotal,MatterList,MatterItem
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
              onHide:()=>{
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
          // item.tdAmount = accMul(item.tdQty,item.price)
          this.count = accAdd(this.count,item.tdAmount)
          item.inventoryPic = item.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
          item.transObjCode = item.inventoryCode_transObjCode;
          if (!orderList[item.transMatchedCode]) {
            orderList[item.transMatchedCode] = [];
          }
          orderList[item.transMatchedCode].push(item);
        }
        // this.count = (this.count/100).toFixed(2);
        this.orderList = orderList;
        // 获取合计
        // let {dataSet} = data.formData.order;
        // this.attachment = data.attachment;
        // dataSet.forEach(item=>{
        //   item.tdAmount = accMul(item.tdQty,item.price)
        //   this.count = accAdd(this.count,item.tdAmount);
        //   item.inventoryPic = item.inventoryPic_transObjCode
        //     ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
        //     : this.getDefaultImg();

        // })
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })

    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
</style>
