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
        <!-- 物料列表 -->
        <matter-list :matter-list="orderInfo.order.dataSet" :order-remarks="orderInfo.biComment">
          <div class='mater_other' slot="matterOther" slot-scope="{item}">
            <div class='mater_left'>
              <span class="units">
                计量单位: {{item.measureUnit_transObjCode}}
              </span>
            </div>
            <div class="mater_num">
              <span class='num'>数量: {{item.tdQty}}</span>
            </div>
          </div>
        </matter-list>
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
          val.tdAmount = accAdd(val.noTaxAmount,val.taxAmount);
          this.count = accAdd(this.count,val.tdAmount);
          val.inventoryPic = val.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
        }
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
  .matter_item {
    .mater_other {
      .mater_left {
        color: #757575;
        font-size: .1rem;
        .units {
          margin-right: .04rem;
        }
      }
      .mater_num {
        .num {
          color: #111;
          font-size: .14rem;
          font-weight: bold;
        }
      }
    }
  }
</style>
