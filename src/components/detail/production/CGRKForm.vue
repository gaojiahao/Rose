<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="dealerInfo" :configs="dealerConfig"></contact-part>
      <warehouse-content :warehouse-config="warehouseConfig"></warehouse-content>
      <!-- 物料列表 -->
      <matter-list :order-list='orderList' :order-title="orderTitle" @on-show-more="onShowMore"></matter-list>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :amt="noTaxAmount" :tax-amt="taxAmount" :count="count"
                  :attachment="attachment"></other-part>
      <!-- 物料详情 -->
      <pop-matter-detail :show="showMatterDetail" :item="matterDetail" :btn-is-hide="btnIsHide"
                         :check-amt="checkAmt" @on-confirm="onDetailConfirm"
                         v-model="showMatterDetail"></pop-matter-detail>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions" :agree-handler="agreeHandler"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // 请求 引入
  import {getSOList} from 'service/detailService'
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
  //公共方法引入
  import {accAdd, accMul, accDiv, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0, // 税价小计
        comment: '',        // 审批备注
        orderInfo: {},      // 表单内容
        warehouse: {},      // 入库仓库
        formViewUniqueId: 'e76a8c6f-05cc-45ee-ba93-299fe6751856',
        orderList: {}, // 物料列表
        warehouseConfig: [], // 仓库相关配置
        defaultFormData: {},
      }
    },
    computed: {
      // 将orderList转为数组
      mergeMatterList() {
        let arr = [];
        let count = 0;
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            count = accAdd(count, item.tdAmount);
            arr.push(item);
          }
        }
        this.count = count;
        return arr;
      },
      // 合计金额
      noTaxAmount() {
        let total = 0;
        this.mergeMatterList.forEach(item => {
          total = accAdd(total, item.noTaxAmount);
        });
        return total;
      },
      // 税金
      taxAmount() {
        let total = 0;
        this.mergeMatterList.forEach(item => {
          total = accAdd(total, item.taxAmount);
        });
        return total;
      },
      // 税价小计
      /*count(){
        let total = 0;
        this.mergeMatterList.forEach(item => {
          total = accAdd(total, item.tdAmount);
        });
        return total;
      },*/
      // 是否为IQC
      isIQC() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'b7301952-5fcd-46ec-b627-274cc262e9fc';
      },
      // 是否为仓库统计员
      isWarehouseStatistician() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'cb960bb4-df2f-4d94-94bc-1f684568bb6d';
      },
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, PopWarehouseList, PriceTotal, contactPart, WarehouseContent, MatterList, MatterItem,
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
          let {dataSet} = formData.inPut;
          for (let item of dataSet) {
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
            dealerContactPersonName: formData.dealerCreditContactPersonName, // 联系人
            dealerCode: inPut.dealerCode_dealerCodeCredit, // 客户编码
            dealerLabelName: inPut.crDealerLabel, // 关系标签
            province: inPut.province_dealerCodeCredit, // 省份
            city: inPut.city_dealerCodeCredit, // 城市
            county: inPut.county_dealerCodeCredit, // 地区
            address: inPut.address_dealerCodeCredit, // 详细地址
            daysOfAccount: inPut.daysOfAccount,
            crDealerPaymentTerm: inPut.crDealerPaymentTerm,
            accountExpirationDate: inPut.accountExpirationDate,
          };
          // 动态获取 仓库字段信息
          for (let key in inPut) {
            if (key.includes('warehouse') || key.includes('storehouse') || key.includes('containerCode')) {
              this.warehouse[key] = inPut[key];
            }
          }
          this.defaultFormData = {
            ...formData,
          };
          this.orderInfo = {
            ...formData,
            ...inPut,
          };
          this.workFlowInfoHandler();
        })
      },
      // 数字校验
      checkAmt(item, key, val) {
        val = Math.abs(toFixed(val));
        let {qualityQty, samplesQty} = item;
        switch (key) {
          case 'samplesQty':
            if (val > qualityQty) {
              val = qualityQty;
            }
            break;
          case 'tdQty':
            if (val > qualityQty) {
              val = qualityQty;
            }
            item[key] = val;
            this.calcMatter(item);
            return;
          case 'taxRate':
            item[key] = val;
            this.calcMatter(item);
            return;
          case 'checkLossQty':
            // 检损数要小于取样数
            if (val > samplesQty) {
              val = samplesQty;
            }
            item[key] = val;
            this.calcMatter(item);
            return;
        }
        item[key] = val;
      },
      // 计算物料相关值
      calcMatter(item) {
        let {price = 0, noTaxPrice = 0, qualityQty = 0, tdQty = 0, checkLossQty = 0, taxRate = 0} = item;
        let assistQty = toFixed(accDiv(tdQty, item.assMeasureScale));
        let tdAmount = toFixed(accMul(price, assistQty));
        let taxAmount = toFixed(accMul(assistQty, taxRate, noTaxPrice));

        item.assistQty = toFixed(accDiv(tdQty, item.assMeasureScale)); // [tdQty]/[assMeasureScale]
        item.lockQty = toFixed(accSub(tdQty, checkLossQty)); // [tdQty]-[checkLossQty]
        item.differenceNum = toFixed(accSub(qualityQty, tdQty)); // [qualityQty]-[tdQty]
        item.tdAmount = tdAmount;
        item.taxAmount = taxAmount;
        item.noTaxAmount = toFixed(accSub(tdAmount, taxAmount));

        this.setMatterConfig([item]);
        this.matterDetail = item;
      },
      // 确认修改
      onDetailConfirm(item) {
        this.$set(this.orderList[this.matterDetailKey], this.matterDetailIndex, item);
      },
      // 同意的处理
      agreeHandler() {
        // IQC可以修改物料参数
        if (this.isIQC) {
          let dealerInfo = this.dealerInfo;
          let warehouse = this.warehouse;
          let dataSet = [];
          let submitMatterField = this.submitMatterField;
          let formData = {
            ...this.defaultFormData,
          };
          for (let items of Object.values(this.orderList)) {
            for (let item of items) {
              let oItem = {};
              for (let sItem of submitMatterField) {
                oItem[sItem.fieldCode] = item[sItem.fieldCode];
              }
              dataSet.push(oItem);
            }
          }
          formData.inPut = {
            dealerCodeCredit: dealerInfo.dealerCode,
            crDealerLabel: dealerInfo.dealerLabelName,
            crDealerPaymentTerm: dealerInfo.crDealerPaymentTerm,
            daysOfAccount: dealerInfo.daysOfAccount,
            accountExpirationDate: dealerInfo.accountExpirationDate,
            containerCode: warehouse.warehouseCode_containerCode,
            storehouseInCode: warehouse.storehouseInCode,
            dataSet,
          };
          this.saveData(formData);
        }
        return !this.isWarehouseStatistician
      },
    },
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
</style>

