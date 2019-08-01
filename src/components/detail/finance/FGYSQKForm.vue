<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目信息 -->
      <project-part :project-info="orderInfo.order"></project-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">供应商详情</span>
        </div>
        <div class="form_content" v-for="(item, index) in orderInfo.inPut.dataSet" :key='index'>
          <div class="main_content">
            <form-cell cellTitle='供应商名称' :cellContent="item.dealerName_dealerDebit" :showTopBorder=false></form-cell>
            <form-cell cellTitle='供应商编码' :cellContent="item.dealerCode_dealerDebit"></form-cell>
            <!-- <form-cell cellTitle='往来关系标签' :cellContent="item.drDealerLabel"></form-cell> -->
            <form-cell cellTitle='往来余额' :cellContent="item.thenAmntBalCopy1 | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='申请金额' :cellContent="item.applicationAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付' :cellContent="item.tdAmountCopy1 | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付后余额' :cellContent="item.differenceAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
          </div>
        </div>
      </div>
      <!-- 采购费用列表 -->
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">收票列表</span>
        </div>
        <div class="form_content"
             :class="{ 'show_border' : index !== orderInfo.order.dataSet.length - 1}"
             v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
          <div class="main_content">
            <form-cell cellTitle='收票号' :cellContent="item.transMatchedCode" :showTopBorder=false></form-cell>
            <!-- <form-cell cellTitle='采购订单号' :cellContent="item.orderCode"></form-cell> -->
            <form-cell cellTitle='关系标签' :cellContent="item.drDealerLabel"></form-cell>
            <form-cell cellTitle='价税合计' :cellContent="item.thenTotalAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='已核销' :cellContent="item.thenAlreadyAmnt | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='待核销' :cellContent="item.thenAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='预期付款日' :cellContent="item.expectedPaymentDate"></form-cell>
            <form-cell cellTitle='账期天数' :cellContent="`${item.daysOfAccount}`"></form-cell>
            <form-cell cellTitle='帐龄天数' :cellContent="`${item.ageOfAging}`"></form-cell>
            <form-cell cellTitle='账期剩余天数' :cellContent="`${item.accountRemaingDays}`"></form-cell>
            <form-cell cellTitle='已收票' :cellContent="item.invoiced | toFixed | numberComma(3)" showSymbol></form-cell>
            <form-cell cellTitle='待收票' :cellContent="item.pendingTicket | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次申请支付' :cellContent="item.applicationAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付' :cellContent="item.tdAmount | toFixed | numberComma(3)" showSymbol></form-cell>
            <form-cell cellTitle='本次支付后余额' :cellContent="item.differenceAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
          </div>
        </div>
      </div>
       <!-- 资金账户可编辑-->
      <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="4" :params="cashParams"
                     v-show="otherConfig.length &&  !isEditAdmout" required>
        <template slot="other">
          <div class='each_property vux-1px-t'>
            <label>支付金额</label>
            <input type='number' v-model.number="cashInfo.tdAmountCopy1" class='property_val' />
          </div>
        </template>
      </pop-cash-list>
      <!-- 资金账户不可编辑 -->
      <div class="form_content" v-show="otherConfig.length &&  isEditAdmout">
        <div class="main_content">
          <div :class="{'vux-1px-t': cIndex > 0}" v-for="(cItem, cIndex) in otherConfig" :key="cIndex">
            <template v-if="cItem.xtype === 'r2Permilfield'">
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">￥{{cashInfo[cItem.fieldCode] | numberComma}}</span>
              </div>
            </template>
            <template v-else>
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">{{cashInfo[cItem.fieldCode] || "无"}}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- <div class="form_part">
        <div v-for="(item,index) in this.config" :key = 'index'>
          <div class="form_content" v-if = 'item.name ==="outPut" && !(item.hiddenInRun) '>
            <div class="main_content" v-for="(cell,index) in item.items" :key = 'index'>
              <form-cell :cellTitle="cell.fieldLabel" :cellContent="orderInfo.order.dataSet[0][cell.fieldCode]" v-if='!cell.hiddenInRun'></form-cell>
            </div>
          </div>
        </div>
      </div> -->
      <!-- 资金列表 -->
      <!-- <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">供资金详情</span>
        </div>
        <div class="form_content" v-for="(item, index) in orderInfo.outPut.dataSet" :key='index'>
          <div class="main_content">
            <form-cell cellTitle='资金账户' :cellContent="item.fundName_cashOutCode" :showTopBorder=false></form-cell>
            <form-cell cellTitle='资金编码' :cellContent="item.cashOutCode"></form-cell>
            <form-cell cellTitle='资金账户类型' :cellContent="item.cashType_cashOutCode"></form-cell>
            <form-cell cellTitle='账户余额' :cellContent="item.thenAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付' :cellContent="item.tdAmount | toFixed | numberComma(3)" showSymbol></form-cell>
          </div>
        </div>
      </div> -->
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
  import {dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'mixins/detailCommon'
  // 组件引入
  import RAction from 'components/public/RAction'
  import workFlow from 'components/public/workFlow'
  import ProjectPart from 'components/detail/commonPart/Project'
  import PopCashList from 'components/Popup/finance/PopCashList'
  //公共方法引入
  import {accAdd} from 'plugins/calc/decimalsAdd'
  import FormCell from 'components/detail/commonPart/form-part/FormCell'
  import {toFixed} from '@/plugins/calc'
import { constants } from 'crypto';

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
        cashInfo: {},
        dealerInfo: {},
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, ProjectPart,FormCell,PopCashList
    },
    computed: {
      // 付供应商欠款（审批）
      isApproval(){
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'c2b5dea5-9ce0-4d38-83ea-393a53e82081';
      },
      // 付供应商欠款（会计审批）
      isAccounting() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'f3b0157d-ab23-43ad-b06b-772b4771cf3c';
      },
      // 付供应商欠款（出纳审批）
      isCashier() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '7d4bc781-8dc7-443d-90d0-171968ec9f23';
      },
      // 判断纸巾账户的支付金额是否可编辑
      isEditAdmout() {
        let isEdit = false;
        this.otherConfig.forEach(item => {
          if (item.fieldCode === "fundName_cashOutCode"){
           isEdit = item.readOnly;
          }
        })
        if (!isEdit){
          this.cashInfo = {
            ...this.cashInfo,
            fundCode: this.cashInfo.fundCode || this.cashInfo.cashInCode,
            fundType: this.cashInfo.fundType || this.cashInfo.cashType_cashInCode,
            fundName: this.cashInfo.fundName || this.cashInfo.fundName_cashInCode,
            thenAmntBal: this.cashInfo.thenAmntBal || this.cashInfo.thenAmntBalCopy1,
            tdAmountCopy1 :  Math.abs(toFixed(this.orderInfo.inPut.dataSet[0].tdAmountCopy1)),
          }
        }
        return isEdit
      },
      cashParams() {
        return {
          transCode: this.transCode
        }
      },
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
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          this.attachment = data.attachment;
          // 获取合计
          let {dataSet} = data.formData.order;
          for (let val of dataSet) {
            this.count = accAdd(this.count, val.tdAmount);
          }
          data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
          this.orderInfo = data.formData;
          this.cashInfo = this.orderInfo.outPut.dataSet[0];
          // 当前审批人为会计时，自动赋值本次支付金额
          if (this.isCashier) {
            let {thenAmntBal = 0, thenAlreadyAmnt = 0} = this.dealerInfo;
            this.dealerInfo.thenTotalAmntBal = thenAlreadyAmnt;
            // 往来余额 - 本次贷方增加 + 本次支付
            this.dealerInfo.differenceAmount = thenAmntBal;
          }
          this.workFlowInfoHandler();
        })
      },
      // 选中资金
      selCash(item) {
        this.cashInfo.fundName_cashInCode = item.fundName;
        this.cashInfo.cashInCode = item.fundCode;
        this.cashInfo.thenAmntBalCopy1 = item.thenAmntBal;
        this.cashInfo.cashType_cashInCode = item.fundType;
        this.cashInfo.tdAmountCopy1 =  Math.abs(toFixed(this.orderInfo.inPut.dataSet[0].tdAmountCopy1));
      },
      // 同意的处理
      agreeHandler() {
        if (this.isApproval || this.isAccounting || this.isCashier) {
          if (this.isCashier && !this.cashInfo.cashInCode) {
            this.$vux.alert.show({
              content: '请选择资金账户',
            });
            return true
          }
          let orderInfo = this.orderInfo;
          let formData = {
            ...orderInfo,
          };
          if (this.otherConfig.length) {
            let cashInfo = this.cashInfo;
            formData.outPut = {
              dataSet: [{
                fundName_cashOutCode: cashInfo.fundName_cashInCode || cashInfo.fundName_cashOutCode,
                cashOutCode: cashInfo.cashInCode || cashInfo.fundCode_cashOutCode,
                cashType_cashOutCode: cashInfo.cashType_cashInCode || cashInfo.cashType_cashOutCode,
                thenAmntBal: cashInfo.thenAmntBalCopy1 || cashInfo.thenAmntBal,
                tdAmount: cashInfo.tdAmount,
                dealerDebitCopy1: orderInfo.inPut.dataSet[0].dealerCode_dealerDebit,
                drDealerLabelCopy1 : orderInfo.inPut.dataSet[0].drDealerLabel,
              }],
            }
          }
          this.saveData(formData);
          return true
        }
        return false
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';

  .form_part {
    margin-bottom: .1rem;
    .form_title .iconfont {
      margin-right: .04rem;
      font-size: .14rem;
    }
    .main_content {
      margin-bottom: 0;
    }
  }
  .each_property {
    padding: .18rem 0;
    display: flex;
    justify-content: space-between;
    line-height: .14rem;
    input{  
      border: none;
      outline: none;
      font-size: .14rem;
    }
    label{
      color: #696969;
    }
    .property_val {
      text-align: right;
    }
  }
</style>
