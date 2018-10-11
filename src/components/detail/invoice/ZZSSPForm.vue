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
      <!-- 往来联系部分-->
      <contact-part :contact-info="contactInfo" :logistics="false" :payment="false"></contact-part>
      <div class="form_part" v-if="orderInfo.ticketNumber">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-xiangmu"></span><span class="title">发票信息</span>
        </div>
        <div class="form_content" style="margin-bottom:0.1rem;">
          <div class="main_content" >
            <form-cell cellTitle='票号' :cellContent="orderInfo.ticketNumber" textRight></form-cell>
            <form-cell cellTitle='发票类型' :cellContent="orderInfo.invoiceType" textRight></form-cell>
            <form-cell cellTitle='发票金额' showSymbol :cellContent="orderInfo.invoiceAmount | toFixed | numberComma(3)" textRight></form-cell>
            <form-cell cellTitle='发票日期' :cellContent="orderInfo.invoiceDate" textRight></form-cell>
            <form-cell cellTitle='发票内容' :cellContent="orderInfo.invoiceContent" textRight></form-cell>  
          </div>
        </div>
      </div> 
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">开票列表</span>
        </div>
        <div class="form_content" 
            :class="{ 'show_border' : index !== orderInfo.order.dataSet.length - 1}"
            v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
          <div class="main_content" >
            <form-cell cellTitle='实例编码' :cellContent="item.transMatchedCode" textRight></form-cell>
            <form-cell cellTitle='待收票金额' showSymbol :cellContent="item.thenAmntBal | toFixed | numberComma(3)" textRight></form-cell>
            <form-cell cellTitle='本次收票金额' showSymbol :cellContent="item.tdAmount | toFixed | numberComma(3)" textRight></form-cell>
          </div>
        </div>
      </div>
      <div class="price_cell vux-1px-t">
        <span class='title'>合计:</span>
        <span class="num"><span style="fontSize:.12rem;">￥</span>{{count | toFixed | numberComma(3)}}</span>
      </div>               
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions" 
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>   
    </div>
  </div>
</template>

<script>
// vux组件引入
import { dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件引入
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'
//公共方法引入
import {accAdd} from '@/home/pages/maps/decimalsAdd.js'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
      contactInfo:{},
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow,RAction,contactPart
  },
  methods: {
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
              onHide:()=>{
              this.$router.back();
            }
          });
          return;
        }
        // 获取合计
        let {dataSet} = data.formData.order;
        for (let val of dataSet) {
          this.count = accAdd(this.count,val.tdAmount);
        }
        data.formData.invoiceDate = dateFormat(data.formData.invoiceDate, 'YYYY-MM-DD');
        this.orderInfo = data.formData;
        this.getcontactInfo();
        this.workFlowInfoHandler();
      })
    },
    // TODO 生成contactInfo对象
    getcontactInfo(key = 'order') {
      let orderInfo = this.orderInfo;
      let order = orderInfo[key];
      this.contactInfo = {
        dealerName: order.dealerName_dealerCodeCredit, // 公司名
        dealerMobilePhone: orderInfo.dealerDebitContactInformation, // 手机
        dealerCode: order.dealerCodeCredit, // 客户编码
        province: order.province_dealerCodeCreditt, // 省份
        city: order.city_dealerCodeCreditt, // 城市
        county: order.county_dealerCodeCredit, // 地区
        address: order.address_dealerCodeCredit, // 详细地址
      };
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
  .form_part .form_title .iconfont {
    font-size: .14rem;
    margin-right: .04rem;
  }
</style>
