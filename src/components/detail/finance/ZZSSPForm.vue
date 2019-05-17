<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分-->
      <contact-part :contact-info="contactInfo" :configs="dealerConfig"></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 发票等部分 -->
      <only-word :config="otherConfig" :info="orderInfo"></only-word>
      <!-- 物料列表 -->
      <matter-list :order-list="orderList" :order-title="orderTitle"></matter-list>
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
// vux组件引入
import {dateFormat} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
// mixins 引入
import detailCommon from 'mixins/detailCommon'
// 组件 引入
import RAction from 'components/public/RAction'
import workFlow from 'components/public/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'
import onlyWord from 'components/detail/commonPart/form-part/onlyWord'
//公共方法引入
import {accAdd, accMul} from 'plugins/calc/decimalsAdd'
import {toFixed} from '@/plugins/calc'

export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
      contactInfo: {},
      orderList: {},
    }
  },
  mixins: [detailCommon],
  components: {
    onlyWord, workFlow, RAction, contactPart
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
      }).then(data => {
        // http200时提示报错信息
        if (data.success === false) {
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
            onHide: () => {
              this.$router.back();
            }
          });
          return;
        }
        let {attachment = [], formData = {}} = data;
        let {order = {}} = formData;
        // 获取合计
        let {dataSet} = formData.order;
        let count = 0;
        let orderList = {};
        for (let item of dataSet) {
          item.inventoryPic = item.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
          count = accAdd(count, item.tdAmount);
          if (!orderList[item.transMatchedCode]) {
            orderList[item.transMatchedCode] = [];
          }
          this.orderList = orderList;
          orderList[item.transMatchedCode].push(item);
        }

        this.contactInfo = {
          dealerName: order.dealerName_dealerCodeCredit, // 公司名
          dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
          dealerContactPersonName: formData.dealerCreditContactPersonName,
          dealerCode: order.dealerCodeCredit, // 客户编码
          province: order.province_dealerCodeCreditt, // 省份
          city: order.city_dealerCodeCreditt, // 城市
          county: order.county_dealerCodeCredit, // 地区
          address: order.address_dealerCodeCredit, // 详细地址
        };
        this.attachment = attachment;
        this.count = count;
        formData.invoiceDate = dateFormat(formData.invoiceDate, 'YYYY-MM-DD');
        this.orderInfo = {
          ...formData,
          ...order,
        };
        this.workFlowInfoHandler();
      })
    },
    // 判断往来是否展示预收款和预收到期日
    judgeDealerConfig(configs) {
      let flag = this.orderInfo.crDealerPaymentTerm.includes('账期');
      let showList = ['pamentDays_dealerCodeCredit'];
      configs.forEach(item => {
        // 判断是否为账期，是账期则展示账期天数
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

  .form_part .form_title .iconfont {
    font-size: .14rem;
    margin-right: .04rem;
  }
</style>
