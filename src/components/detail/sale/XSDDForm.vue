<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="contactInfo" :configs="dealerConfig"></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :order-list="orderList" :order-title="orderTitle" @on-show-more="onShowMore"></matter-list>
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
  import {getSOList,} from 'service/detailService'
  // mixins 引入
  import common from 'mixins/detailCommon'
  // 组件 引入
  import RAction from 'components/public/RAction'
  import workFlow from 'components/public/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  import PriceTotal from 'components/detail/commonPart/PriceTotal'
  import MatterList from 'components/detail/commonPart/MatterList'
  //公共方法引入
  import {accAdd, accMul} from 'plugins/calc/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '',
        orderInfo: {},      // 表单内容
        orderList: {},
        contactInfo: {}, // 客户、付款方式、物流条款的值
      }
    },
    computed: {
      // 是否含预收
      hasAdvance() {
        let {payment} = this.contactInfo;
        return payment && payment.includes('预收')
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
          let {attachment = [], formData = {}} = data;
          let {inPut = {}, order = {}} = formData;
          let [dealerInfo = {}] = inPut.dataSet;
          // 获取合计
          let {dataSet} = formData.order;
          for (let item of dataSet) {
            this.count = accAdd(this.count, item.tdAmount);
            item.inventoryPic = item.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
            if (!orderList[item.transMatchedCode]) {
              orderList[item.transMatchedCode] = [];
            }
            orderList[item.transMatchedCode].push(item);
          }
          this.orderList = orderList;
          this.attachment = attachment;
          this.orderInfo = {
            ...dealerInfo,
            ...formData,
            ...order,
          };
          this.contactInfo = {
            creatorName: dealerInfo.dealerDebitContactPersonName, // 客户名
            dealerName: inPut.dealerName_dealerDebit, // 公司名
            dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
            dealerContactPersonName: formData.dealerDebitContactPersonName, // 联系人
            dealerCode: dealerInfo.dealerDebit, // 客户编码
            crDealerLabel: dealerInfo.drDealerLabel, // 关系标签
            province: dealerInfo.province_dealerDebit, // 省份
            city: dealerInfo.city_dealerDebit, // 城市
            county: dealerInfo.county_dealerDebit, // 地区
            address: inPut.address_dealerDebit, // 详细地址
            advancePaymentDueDate: formData.inPut.dataSet[0].advancePaymentDueDate,
            tdAmountCopy1: formData.inPut.dataSet[0].tdAmountCopy1,
          };
          console.log('this.contactInfo',this.contactInfo)
          this.workFlowInfoHandler();
        })
      },
      // 判断往来是否展示预收款和预收到期日
      judgeDealerConfig(configs) {
        let flag = this.orderInfo.drDealerPaymentTerm.includes('预收');
        let showList = ['advancePaymentDueDate', 'tdAmountCopy1'];
        configs.forEach(item => {
          // 判断是否为预收，是预收则展示预收款和预收到期日
          if (showList.includes(item.fieldCode)) {
            item.hiddenInRun = !flag;
          }
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
</style>
