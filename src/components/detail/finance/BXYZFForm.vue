<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="dealerInfo" :configs="dealerConfig" :showAddress=false></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_content">
        <div class="main_content" v-for="(item, index) in costList" :key="index">
          <div :class="{'vux-1px-t': cIndex > 0}" v-for="(cItem, cIndex) in matterConfig" :key="cIndex">
            <template v-if="cItem.fieldCode === 'tdAmount'">
              <div class="each_info">
                <label>{{cItem.text}}</label>
                <span class="field_value">￥{{item[cItem.fieldCode]}}</span>
              </div>
            </template>
            <template v-else>
              <div class="each_info">
                <label>{{cItem.text}}</label>
                <span class="field_value">{{item[cItem.fieldCode] || "无"}}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- 资金 -->
      <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="4" :params="cashParams"
                     v-if="isCashier" required>
        <template slot="other">
          <form-cell cellTitle='支付金额' showSymbol
                     :cellContent="cashInfo.tdAmountCopy1 | toFixed | numberComma(3)"></form-cell>
        </template>
      </pop-cash-list>
      <!-- 备注 -->
      <div class="comment">
        <form-cell cellTitle='备注' :cellContent="orderInfo.biComment"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle"
                   :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions" :agree-handler="agreeHandler"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {dateFormat, XInput} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  // 组件引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  import PopCashList from 'components/Popup/finance/PopCashList'
  //公共方法引入
  import {accAdd, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
        dealerInfo: {},
        cashInfo: {},
        costList: [],
      }
    },
    computed: {
      // TODO 是否为部门负责人
      isApproval(){
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '7d18cfc2-475f-44c5-ae12-a723d6234253';
      },
      // TODO 是否为会计复核
      isAccounting() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '69c3a187-1816-41cf-a9ec-899e9932940e';
      },
      // TODO 是否为出纳
      isCashier() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '8ea73083-fc91-49f2-97d6-e9923ac9b9e2';
      },
      cashParams() {
        return {
          transCode: this.transCode
        }
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, contactPart, XInput, PopCashList
    },
    methods: {
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          let {success, formData, attachment} = data;
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
          let {dataSet = []} = formData.order;
          this.attachment = attachment;
          this.orderInfo = formData;
          this.dealerInfo = formData.inPut.dataSet[0];
          this.cashInfo = formData.outPut.dataSet[0];
          this.costList = dataSet;

          // 当前审批人为会计时，自动赋值本次支付金额
          if (this.isAccounting) {
            let {thenAmntBal = 0, thenAlreadyAmnt = 0} = this.dealerInfo;
            this.dealerInfo.thenTotalAmntBal = thenAlreadyAmnt;
            // 往来余额 - 本次贷方增加 + 本次支付
            this.dealerInfo.differenceAmount = thenAmntBal;
          }

          this.workFlowInfoHandler();
        })
      },
      // TODO 同意的处理
      agreeHandler() {
        if (this.isApproval || this.isAccounting || this.isCashier) {
          if (this.isCashier && !this.cashInfo.fundCode) {
            this.$vux.alert.show({
              content: '请选择资金账户',
            });
            return true
          }
          let orderInfo = this.orderInfo;
          let dataSet = this.costList.map(item => {
            return {
              tdId: item.tdId,
              expCode: item.expCode,
              expSubject: item.expSubject,
              costType_expCode: item.costType_expCode,
              tdAmount: item.tdAmount,
              expCause: item.expCause,
              taxAmount: item.taxAmount,
              noTaxAmount: item.noTaxAmount,
            };
          });
          let formData = {
            ...orderInfo,
            order: {
              departmentName: orderInfo.order.departmentName,
              dataSet,
            },
          };
          if (this.isCashier) {
            let cashInfo = this.cashInfo;
            formData.outPut = {
              dataSet: [{
                fundName_cashInCode: cashInfo.fundName,
                cashInCode: cashInfo.fundCode,
                cashType_cashInCode: cashInfo.fundType,
                thenAmntBalCopy1: cashInfo.thenAmntBal,
                tdAmountCopy1: cashInfo.tdAmountCopy1,
                tdIdCopy1: cashInfo.tdIdCopy1,
              }],
            }
          }

          this.saveData(formData);
          return true
        }
        return false
      },
      // TODO 计算抵扣后金额
      calcTax(item) {
        let {taxAmount = 0, noTaxAmount = 0} = item;
        if (!taxAmount) {
          taxAmount = 0;
          item.taxAmount = 0;
        }
        item.noTaxAmount = accSub(noTaxAmount, taxAmount);
      },
      // TODO 计算本次报销与支付后余额
      calcPayment(item) {
        let {thenAmntBal = 0, thenAlreadyAmnt = 0, thenTotalAmntBal = 0} = item;
        if (!thenTotalAmntBal) {
          thenTotalAmntBal = 0;
        }
        thenTotalAmntBal = toFixed(thenTotalAmntBal);
        item.thenTotalAmntBal = thenTotalAmntBal;
        item.tdAmount = toFixed(accSub(thenAlreadyAmnt, thenTotalAmntBal));
        item.differenceAmount = toFixed(accAdd(accSub(thenAmntBal, thenAlreadyAmnt), thenTotalAmntBal));
        this.cashInfo.tdAmountCopy1 = thenTotalAmntBal;
      },
      // TODO 选中资金
      selCash(item) {
        this.cashInfo = {
          ...this.cashInfo,
          ...item,
        };
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
</style>
