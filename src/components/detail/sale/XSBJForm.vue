<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="contactInfo" :configs="dealerConfig"></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :matter-list="matterList"></matter-list>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :amt="noTaxAmount" :tax-amt="taxAmount" :count="count"
                  :attachment="attachment"></other-part>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux 组件引入
import {dateFormat} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
// mixins 引入
import detailCommon from 'mixins/detailCommon'
// 组件 引入
import workFlow from 'components/public/workFlow'
import RAction from 'components/public/RAction'
import contactPart from 'components/detail/commonPart/ContactPart'
import MatterList from 'components/detail/commonPart/MatterList'
import UploadFile from 'components/upload/UploadFile'
//公共方法引入
import {accAdd, accMul} from 'plugins/calc/decimalsAdd'

export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
      orderInfo: {},      // 表单内容
      contactInfo: {}, // 客户、付款方式、物流条款的值
      attachment: [],
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction, contactPart, MatterList, UploadFile,
  },
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
          this.count = accAdd(this.count, val.tdAmount);
          val.inventoryPic = val.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
        }

        this.contactInfo = {
          creatorName: formData.dealerDebitContactPersonName, // 客户名
          dealerName: order.dealerName_dealerDebit, // 公司名
          dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
          dealerContactPersonName: formData.dealerDebitContactPersonName, // 联系人
          dealerCode: order.dealerDebit, // 客户编码
          dealerLabelName: order.drDealerLabel, // 关系标签
          province: order.province_dealerDebit, // 省份
          city: order.city_dealerDebit, // 城市
          county: order.county_dealerDebit, // 地区
          address: order.address_dealerDebit, // 详细地址
        };
        this.attachment = attachment;
        this.matterList = dataSet;
        formData.validUntil = dateFormat(order.validUntil, 'YYYY-MM-DD');
        this.orderInfo = {
          ...formData,
          ...order,
        };
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
</style>
