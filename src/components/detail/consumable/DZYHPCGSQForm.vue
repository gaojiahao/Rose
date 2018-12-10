<template>
  <div class="detail_wrapper xsbj-detail-container">
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
      <matter-list :matter-list="orderInfo.order.dataSet" :count="count">
        <!-- 调拨数量 -->
        <div class="mater_other" slot="matterOther" slot-scope="{item}">
          <div class="mater_attribute">
            <span>属性: {{item.tdProcessing}}</span>
            <span>计量单位: {{item.measureUnit_transObjCode}}</span>
          </div>
          <div class="mater_attribute">
            <span>本次申请: {{item.tdQty}}</span>
            <span>估计价格: {{item.price}}</span>
          </div>
          <div class="mater_price">
            <span class="diff_num">
              ￥{{item.tdAmount | toFixed}}
            </span>
          </div>
        </div>
      </matter-list>
      <div class="comment-part">
        <form-cell :showTopBorder="false" cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux 组件引入
import { dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import workFlow from 'components/workFlow'
import RAction from 'components/RAction'
import contactPart from 'components/detail/commonPart/ContactPart'
import MatterList from 'components/detail/commonPart/MatterList'
import UploadFile from 'components/upload/UploadFile'
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd.js'
export default {
  data() {
    return {
      orderInfo: {},      // 表单内容
      formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
      attachment: [],
      count: 0,
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction, contactPart, MatterList, UploadFile,
  },
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
      }).then(({success = true, formData = {}, attachment = []}) => {
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
        let {order} = formData;
        // 获取合计
        let {dataSet} = order;
        for (let val of dataSet) {
          this.count = accAdd(this.count,val.tdAmount);
          val.inventoryPic = val.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
        }
        this.attachment = attachment;
        formData.validUntil = dateFormat(formData.validUntil, 'YYYY-MM-DD');
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
