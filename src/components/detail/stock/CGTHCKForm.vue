<template>
  <div class="detail_wrapper xsck-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.outPut'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目 -->
      <project-part :project-info="orderInfo.outPut"></project-part>
      <!-- 用户地址和基本信息-->
      <div >
        <contact-part :contact-info="dealerInfo" :hasClass='false' :logistics="false" :payment="false"></contact-part>
        <warehouse-content class="vux-1px-t" :warehouse="warehouse"></warehouse-content>
      </div>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
       <matter-list :order-list='orderList' :noTaxAmount="noTaxAmount" 
                     :taxAmount="taxAmount" :count="count">
          <template slot="orderTitle" slot-scope="props">
            <span class="order_title">订单号</span>
          </template>
          <template slot="matterOther" slot-scope="{item}">
            <div class='mater_other'>
              <div class='mater_attribute'>
                <span>单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
                <span>退货数量: {{item.tdQty | toFixed}}</span>
                <span>税率: {{item.taxRate}}</span>
              </div>
              <div class="mater_num">
                <span class="num">可退货数量: {{item.thenQtyBal}}</span>
                <span class="num">可用库存: {{item.thenQtyStock}}</span>
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
      <div class="comment-part">
        <form-cell :isTopBorder="false" cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
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
//公共方法引入
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd.js'
import {toFixed} from '@/plugins/calc'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import contactPart from 'components/detail/commonPart/ContactPart'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
import ProjectPart from 'components/detail/commonPart/Project'
import MatterItem from 'components/detail/commonPart/MatterItem'
import FormCell from 'components/detail/commonPart/FormCell'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      orderInfo: {},      // 表单内容
      formViewUniqueId: '',
      orderList: {}, // 物料列表
      warehouse: {},
      dealerInfo: {}, // 客户信息
      basicInfo :{},//存放基本信息
    }
  },
  computed:{
    // 合计金额
    noTaxAmount() {
      let total = 0;
      this.orderInfo.outPut.dataSet.forEach(item => {
        total = accAdd(total, item.noTaxAmount);
      });
      return total;
    },
    // 税金
    taxAmount() {
      let total = 0;
      this.orderInfo.outPut.dataSet.forEach(item => {
        total = accAdd(total, item.taxAmount);
      });
      return total;
    },
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction, PopWarehouseList,contactPart,PriceTotal,WarehouseContent,ProjectPart,MatterItem,FormCell
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
        let {outPut = {}} = formData;
        this.attachment = attachment;
        // 获取合计
        let {dataSet} = formData.outPut;
        for (let item of dataSet) {
          this.count = accAdd(this.count,item.tdAmount)
          item.inventoryPic = item.inventoryPic_outPutMatCode
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400`
            : this.getDefaultImg();
          item.inventoryName_transObjCode = item.inventoryName_outPutMatCode;
          item.transObjCode = item.outPutMatCode;
          if (!orderList[item.orderCode]) {
            orderList[item.orderCode] = [];
          }
          orderList[item.orderCode].push(item);
        }
        this.orderList = orderList;
        this.dealerInfo = {
          creatorName: formData.dealerDebitContactPersonName, // 客户名
          dealerName: outPut.dealerName_dealerDebit, // 公司名
          dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
          dealerContactPersonName: formData.dealerDebitContactPersonName, // 联系人
          dealerCode: outPut.dealerDebit, // 客户编码
          dealerLabelName: outPut.drDealerLabel, // 关系标签
          province: outPut.province_dealerDebit, // 省份
          city: outPut.city_dealerDebit, // 城市
          county: outPut.county_dealerDebit, // 地区
          address: outPut.address_dealerDebit, // 详细地址
          payment: outPut.drDealerPaymentTerm, // 付款方式
          logistics: formData.drDealerLogisticsTerms,//物流方式
        };
        this.warehouse = {
          warehouseCode: outPut.containerCodeOut,
          warehouseName: outPut.warehouseName_containerCodeOut,
          warehouseType: outPut.warehouseType_containerCodeOut,
          warehouseProvince: outPut.warehouseProvince_containerCodeOut,
          warehouseCity: outPut.warehouseCity_containerCodeOut,
          warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
          warehouseAddress: outPut.warehouseAddress_containerCodeOut,
        };
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .xsck-detail-container {
    // 所属订单
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
  }
</style>
