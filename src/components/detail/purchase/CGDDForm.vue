<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="contactInfo" :configs="dealerConfig"></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :matter-list='matterList' @on-show-more="onShowMore"></matter-list>
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
  import {isMyflow, getSOList, getListId} from 'service/detailService'
  // mixins 引入
  import common from 'components/mixins/detailCommon'
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  import PriceTotal from 'components/detail/commonPart/PriceTotal'
  import MatterList from 'components/detail/commonPart/MatterList'
  //公共方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd.js'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '',
        contactInfo: {}, // 客户、付款方式、物流条款的值
      }
    },
    components: {
      workFlow, RAction, contactPart, PriceTotal, MatterList
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
        }).then(data => {
          this.submitInfo = JSON.parse(JSON.stringify(data));
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            })
            return;
          }
          let {formData = {}, attachment = []} = data;
          let {order = {}} = formData;
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
            dealerName: order.dataSet[0].dealerName_dealerDebit, // 公司名
            dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
            dealerContactPersonName: formData.dealerDebitContactPersonName, // 联系人
            dealerCode: order.dataSet[0].dealerDebit, // 客户编码
            dealerLabelName: order.dataSet[0].drDealerLabel, // 关系标签
            province: order.dataSet[0].province_dealerDebit, // 省份
            city: order.dataSet[0].city_dealerDebit, // 城市
            county: order.dataSet[0].county_dealerDebit, // 地区
            address: order.dataSet[0].address_dealerDebit, // 详细地址
          };
          this.matterList = order.dataSet
          this.attachment = attachment;
          this.orderInfo = {
            ...formData,
            ...order,
          };
          this.workFlowInfoHandler();
        })
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
</style>
