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
        <!-- 往来联系部分 交易基本信息-->
        <contact-part :contact-info="contactInfo" ></contact-part>
        <!-- 物料列表 -->
        <matter-list :matter-list='orderInfo.order.dataSet' :noTaxAmount="noTaxAmount" 
                     :taxAmount="taxAmount" :count="count">
          <template slot="matterOther" slot-scope="{item}">
            <div class='mater_other'>
              <div class='mater_attribute'>
                <span>单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
                <span>数量: {{item.tdQty | toFixed}}</span>
                <span v-show='item.taxRate'>税率: {{item.taxRate}}</span>
              </div>
              <div class="mater_attribute" v-if="item.promDeliTime">
                <span>预期交货日: {{item.promDeliTime}}</span>
              </div>
              <div class='mater_price'>
                <span><span class="symbol">￥</span>{{item.tdAmount | toFixed | numberComma(3)}}</span>
                <span class="num"
                      :style="{display:(item.tdAmount && item.tdAmount.toString().length > 9 ? 'block' : '')}"
                      v-if="item.taxRate">
                  [金额: ￥{{item.noTaxAmount | toFixed | numberComma(3)}} + 税金: ￥{{item.taxAmount | toFixed | numberComma(3)}}]
                </span>
              </div>
            </div>
          </template>
        </matter-list>
        <!-- 备注 -->
        <div class="comment-part">
          <form-cell :showTopBorder="false" cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
        </div>
        <!-- 上传附件 -->
        <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
        <!-- 审批操作 -->
        <r-action :code="transCode" :task-id="taskId" :actions="actions"
                  :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
      </div>
  </div>
</template>

<script>
// 请求 引入
import { getSOList, } from 'service/detailService'
// mixins 引入
import common from 'components/mixins/detailCommon'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import MatterList from 'components/detail/commonPart/MatterList'
//公共方法引入
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd.js'
import {toFixed} from '@/plugins/calc'
export default {
  data(){
    return{
      count : 0,          // 金额合计
      orderInfo: {},      // 表单内容
      formViewUniqueId : '',
      contactInfo: {}, // 客户、付款方式、物流条款的值
    }
  },
  components:{
    workFlow, RAction,contactPart,PriceTotal,MatterList
  },
  mixins: [common],
  methods:{
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 获取详情
    getOrderList(transCode = ''){
      return getSOList({
        formViewUniqueId : this.formViewUniqueId,
        transCode
      }).then(data => {
        this.submitInfo  = JSON.parse(JSON.stringify(data));
        // http200时提示报错信息
        if(data.success === false){
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
              onHide:()=>{
              this.$router.back();
            }
          })
          return;
        }
        // 获取合计
        let { dataSet } = data.formData.order;
        for(let val of dataSet){
          val.noTaxAmount = accMul(val.price,val.tdQty);
          val.taxAmount = accMul(val.noTaxAmount,val.taxRate);
          val.tdAmount = toFixed(accAdd(val.noTaxAmount,val.taxAmount));
          this.count = accAdd(this.count,val.tdAmount);
          val.inventoryPic = val.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
        }
        this.attachment = data.attachment;
        this.orderInfo = data.formData;
        this.getcontactInfo()
        this.workFlowInfoHandler();
      })
    },
    // TODO 生成contactInfo对象
    getcontactInfo(key = 'order') {
      let orderInfo = this.orderInfo;
      let order = orderInfo[key];
      this.contactInfo = {
        creatorName: order.dealerDebitContactPersonName, // 客户名
        dealerName: order.dealerName_dealerDebit, // 公司名
        dealerMobilePhone: orderInfo.dealerDebitContactInformation, // 手机
        dealerContactPersonName: orderInfo.dealerDebitContactPersonName, // 联系人
        dealerCode: order.dealerDebit, // 客户编码
        dealerLabelName: order.drDealerLabel, // 关系标签
        province: order.province_dealerDebit, // 省份
        city: order.city_dealerDebit, // 城市
        county: order.county_dealerDebit, // 地区
        address: order.address_dealerDebit, // 详细地址
        payment: order.drDealerPaymentTerm, // 付款方式,
        logistics : orderInfo.drDealerLogisticsTerms, //物料方式
      };
    },
  }
}
</script>

<style lang='scss' scoped>
@import './../../scss/bizDetail';
</style>
