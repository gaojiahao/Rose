<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>

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
        contactInfo: {}, // 客户、付款方式、物流条款的值
        orderList: {},
        matterList: []
      }
    },
    computed: {
      // 合计金额
      noTaxAmount() {
        let total = 0;
        this.matterList.forEach(item => {
          total = accAdd(total, item.noTaxAmount);
        });
        return total;
      },
      // 税金
      taxAmount() {
        let total = 0;
        this.matterList.forEach(item => {
          total = accAdd(total, item.taxAmount);
        });
        return total;
      },
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
          let {attachment = [], formData = {}} = data;
          let {inPut = {}} = formData;
          // 获取合计
          let orderList = {};
          let {dataSet} = inPut;
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
            dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerContactPersonName: formData.dealerCreditContactPersonName, // 联系人
            dealerCode: inPut.dealerCodeCredit, // 客户编码
            dealerLabelName: inPut.crDealerLabel, // 关系标签
            province: inPut.province_dealerCodeCredit, // 省份
            city: inPut.city_dealerCodeCredit, // 城市
            county: inPut.county_dealerCodeCredit, // 地区
            address: inPut.address_dealerCodeCredit, // 详细地址
          };
          this.attachment = attachment;
          this.matterList = dataSet;
          this.orderList = orderList;
          this.orderInfo = {
            ...formData,
            ...inPut,
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
  @import '~scss/biz-app/bizDetail';

  .other {
    padding-bottom: .06rem;
    .title {
      font-weight: bold;
      font-size: .14rem;
    }
    .mode {
      color: #454545;
    }
  }
</style>
