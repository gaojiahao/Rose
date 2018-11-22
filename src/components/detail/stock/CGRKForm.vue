<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
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
      <div class='contacts_part'>
        <contact-part :contact-info="dealerInfo" :hasClass="false" :logistics="false"></contact-part>
        <warehouse-content class="vux-1px-t" :warehouse="warehouse"></warehouse-content>
      </div>
      <!-- 物料列表 -->
      <matter-list :order-list='orderList' :noTaxAmount="noTaxAmount" 
                   :taxAmount="taxAmount" :count="count">
         <template slot="matterOther" slot-scope="{item}">
           <div class='mater_other'>
              <div class='mater_num'>
                <!--<span class="num" v-if="item.promDeliTime">采购计划到货日: {{item.promDeliTime}}</span>-->
                <span class="num" v-if="item.productionDate">生产日期: {{item.productionDate}}</span>
                <span class="num" v-if="item.validUntil">有效日期: {{item.validUntil}}</span>
              </div>
              <div class='mater_num'>
                <!--<span v-if="item.keepingDays_transObjCode || item.keepingDays_transObjCode === 0">保质期天数: {{item.keepingDays_transObjCode}}</span>-->
              </div>
              <div class='mater_num'>
                <span class="num">单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
                <span class='num'>数量: {{item.tdQty | toFixed}}</span>
                <span v-show='item.taxRate'>税率: {{item.taxRate}}</span>
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
      <div class="comment-part">
        <form-cell :showTopBorder="false" cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import contactPart from 'components/detail/commonPart/ContactPart'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
import MatterList from 'components/detail/commonPart/MatterList'
import MatterItem from 'components/detail/commonPart/MatterItem'
import FormCell from 'components/detail/commonPart/FormCell'
//公共方法引入
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd.js'
import {toFixed} from '@/plugins/calc'
export default {
  data() {
    return {
      count: 0,           // 金额合计
      comment: '',        // 审批备注
      orderInfo: {},      // 表单内容
      warehouse: {},      // 入库仓库
      formViewUniqueId: 'e76a8c6f-05cc-45ee-ba93-299fe6751856',
      orderList: {}, // 物料列表
    }
  },
  computed:{
    // 合计金额
    noTaxAmount() {
      let total = 0;
      this.orderInfo.inPut.dataSet.forEach(item => {
        total = accAdd(total, item.noTaxAmount);
      });
      return total;
    },
    // 税金
    taxAmount() {
      let total = 0;
      this.orderInfo.inPut.dataSet.forEach(item => {
        total = accAdd(total, item.taxAmount);
      });
      return total;
    },
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction, PopWarehouseList,PriceTotal,contactPart,WarehouseContent,MatterList,MatterItem,FormCell
  },
  methods: {
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
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
      }).then(({success = true, formData = {},attachment = []}) => {
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
        let orderList = {};
        let {inPut = {}} = formData;
        this.attachment = attachment;
        // 获取合计
        let {dataSet} = formData.inPut;
        for (let item of dataSet) {
          item.noTaxAmount = accMul(item.price,item.tdQty);
          item.taxAmount = accMul(item.noTaxAmount,item.taxRate);
          item.tdAmount = toFixed(accAdd(item.noTaxAmount,item.taxAmount));
          this.count = accAdd(this.count,item.tdAmount)
          item.inventoryPic = item.inventoryPic_outPutMatCode
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400`
            : this.getDefaultImg();
          if (!orderList[item.transMatchedCode]) {
            orderList[item.transMatchedCode] = [];
          }
          orderList[item.transMatchedCode].push(item);
        }
        this.orderList = orderList;
        this.dealerInfo = {
          creatorName: formData.dealerCreditContactPersonName, // 客户名
          dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
          dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
          dealerCode: inPut.dealerCode_dealerCodeCredit, // 客户编码
          dealerLabelName: inPut.crDealerLabel, // 关系标签
          province: inPut.province_dealerCodeCredit, // 省份
          city: inPut.city_dealerCodeCredit, // 城市
          county: inPut.county_dealerCodeCredit, // 地区
          address: inPut.address_dealerCodeCredit, // 详细地址
          payment :  inPut.crDealerPaymentTerm,//结算方式
        };
        // 入库
        this.warehouse = {
          warehouseCode: inPut.containerCode,
          warehouseName: inPut.warehouseName_containerCode,
          warehouseType: inPut.warehouseType_containerCode,
          warehouseProvince: inPut.warehouseProvince_containerCode,
          warehouseCity: inPut.warehouseCity_containerCode,
          warehouseDistrict: inPut.warehouseDistrict_containerCode,
          warehouseAddress: inPut.warehouseAddress_containerCode,
          containerInWarehouseManager: inPut.containerInWarehouseManager,
        };
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .order_code {
    display: flex;
    color: #fff;
    font-size: .12rem;
    font-weight: bold;
    > span {
      display: inline-block;
      padding: 0 .04rem;
    }
    .order_title {
      background: #1160aa;
    }
    // 订单号
    .order_num {
      background: #9bb4da;
      border-top-right-radius: .08rem;
    }
  }
  // 一般金额
  .mater_price {
    color: #ea5455;
    font-weight: bold;
    font-size: .14rem;
    line-height: 0.2rem;
    margin-top: .04rem;
    display: inline-block;
    .symbol {
      font-size: .12rem;
    }
    .num {
      font-size: .1rem;
      color: #757575;
    }
  }
  // 单价 数量 税率 等
  .mater_num {
    color: #757575;
    font-size: 0.1rem;
    span {
      display: inline-block;
    }
    .num {
      margin-right: 0.04rem;
    }
  }

  .contacts_part {
    margin-bottom: .1rem;
    padding: .06rem .1rem 0;
    width: 100%;
    background: #fff;
    box-sizing: border-box;
  }
</style>

