<template>
  <div class="detail_wrapper xsck-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.outPut'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 用户地址和基本信息-->
      <contact-part :contact-info="dealerInfo" :configs="dealerConfig"></contact-part>
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
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
//公共方法引入
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd'
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
      warehouseConfig: [], // 仓库相关配置
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
        };
        // 动态获取 仓库字段信息
        for (let key in outPut) {
          if (key.includes('warehouse') || key.includes('storehouse') || key.includes('containerCode')) {
            this.warehouse[key] = outPut[key];
          }
        }
        this.orderInfo = {
          ...formData,
          ...outPut,
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
