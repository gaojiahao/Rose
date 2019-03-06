<template>
  <div class="detail_wrapper xsck-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 用户地址和基本信息-->
      <contact-part :contact-info="contactInfo" :configs="dealerConfig"></contact-part>
      <warehouse-content :warehouse-config="warehouseConfig"></warehouse-content>
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
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  //公共方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
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
        count: 0,           // 金额合计
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
        orderInfo: {},      // 表单内容
        orderList: {},      // 物料列表
        warehouse: {},
        basicInfo: {},      // 存放基本信息
        contactInfo: {},    // 客户信息
        warehouseConfig: []
      }
    },
    computed: {
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
      workFlow, RAction, PopWarehouseList, contactPart, PriceTotal, WarehouseContent, ProjectPart, MatterItem, FormCell
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
        }).then(({success = true, formData = {}, attachment = []}) => {
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
          let {dataSet} = inPut;
          for (let item of dataSet) {
            this.count = accAdd(this.count, item.tdAmount)
            item.inventoryPic = item.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
            if (!orderList[item.transMatchedCode]) {
              orderList[item.transMatchedCode] = [];
            }
            orderList[item.transMatchedCode].push(item);
          }
          this.orderList = orderList;
          this.contactInfo = {
            dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerContactPersonName: formData.dealerCreditContactPersonName, // 联系人
            dealerCode: inPut.dealerDebit, // 客户编码
            dealerLabelName: inPut.drDealerLabel, // 关系标签
            province: inPut.province_dealerDebit, // 省份
            city: inPut.city_dealerDebit, // 城市
            county: inPut.county_dealerDebit, // 地区
            address: inPut.address_dealerCodeCredit, // 详细地址
          };
          // 动态获取 仓库字段信息
          for(let key in inPut) {
            if(key.includes('warehouse') || key.includes('storehouse') || key.includes('containerCode')) {
              this.warehouse[key] = inPut[key];
            }
          }
          this.warehouse.containerCode = inPut.containerCode;
          this.orderInfo = {
            ...formData,
            ...inPut,
          };
          this.workFlowInfoHandler();
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
</style>
