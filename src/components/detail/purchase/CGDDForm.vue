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
      <matter-list :order-list='orderList' :order-title="orderTitle" @on-show-more="onShowMore"></matter-list>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :amt="noTaxAmount" :tax-amt="taxAmount" :count="count"
                  :attachment="attachment"></other-part>
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
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
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


          let orderList = {};
          let {formData = {}, attachment = []} = data;
          let {order = {}, inPut = {}} = formData;
          // 获取合计
          let {dataSet = []} = order;
          let {dataSet: inputDataSet = []} = inPut;
          let [contactInfo = {}] = inputDataSet;
          for (let val of dataSet) {
            this.count = accAdd(this.count, val.tdAmount);
            val.inventoryPic = val.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
            if (!orderList[val.transMatchedCode]) {
              orderList[val.transMatchedCode] = [];
            }
            orderList[val.transMatchedCode].push(val);
          }

          this.contactInfo = {
            creatorName: formData.dealerDebitContactPersonName, // 客户名
            dealerName: contactInfo.dealerName_dealerDebit, // 公司名
            dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
            dealerContactPersonName: formData.dealerDebitContactPersonName, // 联系人
            dealerCode: contactInfo.dealerDebit, // 客户编码
            dealerLabelName: contactInfo.drDealerLabel, // 关系标签
            province: contactInfo.province_dealerDebit, // 省份
            city: contactInfo.city_dealerDebit, // 城市
            county: contactInfo.county_dealerDebit, // 地区
            address: contactInfo.address_dealerDebit, // 详细地址
          };

          this.orderList = orderList;
          this.matterList = dataSet;
          this.attachment = attachment;
          this.orderInfo = {
            ...formData,
            ...order,
            ...contactInfo,
          };
          this.workFlowInfoHandler();
        })
      },
      // TODO 判断往来是否展示预收款和预收到期日
      judgeDealerConfig(configs) {
        let flag = this.orderInfo.drDealerPaymentTerm.includes('预收');
        let showList = ['prepaymentDueDate', 'tdAmountCopy1'];
        configs.forEach(item => {
          // 判断是否为预收，是预收则展示预收款和预收到期日
          if (showList.includes(item.fieldCode)) {
            item.hiddenInRun = !flag;
          }
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
