<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分-->
      <contact-part :contact-info="contactInfo" :logistics="false" :payment="false"></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_part" v-if="orderInfo.ticketNumber">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-xiangmu"></span><span class="title">发票信息</span>
        </div>
        <div class="form_content" style="margin-bottom:0.1rem;">
          <div class="main_content">
            <form-cell cellTitle='票号' :cellContent="orderInfo.ticketNumber" textRight></form-cell>
            <form-cell cellTitle='发票类型' :cellContent="orderInfo.invoiceType" textRight></form-cell>
            <!--<form-cell cellTitle='发票金额' showSymbol :cellContent="orderInfo.invoiceAmount | toFixed | numberComma(3)" textRight></form-cell>-->
            <form-cell cellTitle='发票日期' :cellContent="orderInfo.invoiceDate" textRight></form-cell>
            <form-cell cellTitle='发票内容' :cellContent="orderInfo.invoiceContent" textRight></form-cell>
          </div>
        </div>
      </div>
      <!-- 物料列表 -->
      <matter-list :order-list="orderList" :noTaxAmount="noTaxAmount" :taxAmount="taxAmount" :count="count">
        <template slot="orderTitle" slot-scope="props">
          <span class="order_title">入库单号</span>
        </template>
        <template slot="matterOther" slot-scope="{item}">
          <div class='mater_other'>
            <div class="mater_attribute">
              <span>入库日期: {{item.purchaseDay}}</span>
            </div>
            <div class='mater_attribute'>
              <span>单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
              <span>本次收票数量: {{item.tdQty | toFixed}}</span>
              <span v-show='item.taxRate'>税率: {{item.taxRate}}</span>
            </div>
            <div class="mater_num">
              <span class="num">入库数量: {{item.thenTotalQtyBal}}</span>
              <span class="num">已收票数量: {{item.thenLockQty}}</span>
              <span class="num">待收票数量: {{item.thenQtyBal}}</span>
            </div>
            <div class='mater_price'>
              <span><span class="symbol">￥</span>{{item.tdAmount | toFixed | numberComma(3)}}</span>
              <span class="num"
                    :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 5 ? 'block' : '')}"
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
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle"
                   :title-style="uploadTitleStyle"></upload-file>
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
  import detailCommon from 'components/mixins/detailCommon'
  // 组件引入
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  //公共方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
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
      workFlow, RAction, contactPart
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
          this.attachment = data.attachment;
          // 获取合计
          let {dataSet} = data.formData.order;
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
          this.count = count;
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
          ...this.contactInfo,
          dealerName: order.dealerName_dealerCodeCredit, // 公司名
          dealerMobilePhone: orderInfo.dealerCreditContactInformation, // 手机
          dealerContactPersonName: orderInfo.dealerCreditContactPersonName,
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
