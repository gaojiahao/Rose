<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
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
        <div class="form_content">
          <div class="main_content">
            <form-cell cellTitle='供应商名称' :cellContent="dealerInfo.dealerName_dealerDebit"
                       :showTopBorder=false></form-cell>
            <form-cell cellTitle='供应商编码' :cellContent="dealerInfo.dealerDebit"></form-cell>
            <form-cell cellTitle='往来关系标签' :cellContent="dealerInfo.drDealerLabel"></form-cell>
            <form-cell cellTitle='往来余额' :cellContent="dealerInfo.thenAmntBalCopy1 | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次申请' :cellContent="dealerInfo.applicationAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付' :cellContent="dealerInfo.tdAmountCopy1 | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付后余额' :cellContent="dealerInfo.differenceAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
          </div>
        </div>
      </div>
      <!-- 采购费用列表 -->
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">定金列表</span>
        </div>
        <div class="form_content" :class="{ 'show_border' : index !== listData.length - 1}"
             v-for="(item, index) in listData" :key='index'>
          <div class="main_content">
            <form-cell cellTitle='协议号' :cellContent="item.transMatchedCode" :showTopBorder=false></form-cell>
            <form-cell cellTitle='总金额' :cellContent="item.thenTotalAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='采购定金' :cellContent="item.differenceAmountCopy1 | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='已付定金' :cellContent="item.thenAlreadyAmnt | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='待付定金' :cellContent="item.thenAmntBalCopy2 | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次申请' :cellContent="item.applicationAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <x-input type="number" title="本次支付" :value="dealerInfo.tdAmountCopy1" text-align="right"
                     @on-focus="getFocus" @on-blur="calcPayment(dealerInfo)" v-model.number="dealerInfo.tdAmountCopy1"
                     v-if="isAccount"></x-input>
            <form-cell cellTitle='本次支付' :cellContent="item.tdAmountCopy1 | toFixed | numberComma(3)"
                       showSymbol v-else></form-cell>
          </div>
        </div>
      </div>
      <!-- 资金 -->
      <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="1" :params="cashParams"
                     v-if="isCashier" required>
        <template slot="other">
          <form-cell cellTitle='本次支付' :cellContent="cashInfo.tdAmount | toFixed | numberComma(3)"
                     showSymbol></form-cell>
        </template>
      </pop-cash-list>
      <!-- 资金列表 -->
      <div class="form_part" v-else-if="!isApproval && !isAccount">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">供资金详情</span>
        </div>
        <div class="form_content">
          <div class="main_content">
            <form-cell cellTitle='资金账户' :cellContent="cashInfo.fundName_cashOutCode" :showTopBorder=false></form-cell>
            <form-cell cellTitle='资金编码' :cellContent="cashInfo.cashOutCode"></form-cell>
            <form-cell cellTitle='资金账户类型' :cellContent="cashInfo.cashType_cashOutCode"></form-cell>
            <form-cell cellTitle='账户余额' :cellContent="cashInfo.thenAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='支付金额' :cellContent="cashInfo.tdAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
          </div>
        </div>
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
  import ProjectPart from 'components/detail/commonPart/Project'
  import PopCashList from 'components/Popup/finance/PopCashList'
  //公共方法引入
  import {accAdd} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
        dealerInfo: {},
        listData: [],
        cashInfo: {},
      }
    },
    computed: {
      // 是否为采购总监、财务经理/总监、总经理
      isApproval() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '71c8f876-0617-4ff9-8a39-f9f99b14125d';
      },
      // 是否为出纳
      isCashier() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '00690810-7eaf-4bef-931b-a72eb5093f88';
      },
      // 是否为会计
      isAccount() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'b00796ff-5986-4cdd-8ae4-fb202ff79af1';
      },
      cashParams() {
        return {
          transCode: this.transCode
        }
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, ProjectPart, PopCashList, XInput
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
          let {attachment, formData} = data;
          let {inPut = {}} = formData;
          let [dealerInfo = {}] = inPut.dataSet;
          this.attachment = attachment;
          this.dealerInfo = {
            ...dealerInfo,
            ...inPut,
          };
          // 获取合计
          let {dataSet} = formData.order;
          for (let val of dataSet) {
            if (val.tdAmount) {
              this.count = accAdd(this.count, val.tdAmount);
            }
          }
          this.listData = dataSet;
          this.orderInfo = formData;
          this.cashInfo = data.formData.outPut.dataSet[0];
          this.workFlowInfoHandler();
        })
      },
      // 同意的处理
      agreeHandler() {
        if (this.isApproval || this.isCashier || this.isAccount) {
          if (this.isCashier && !this.cashInfo.fundCode) {
            this.$vux.alert.show({
              content: '请选择资金账户',
            });
            return true
          }
          let orderInfo = this.orderInfo;
          let dealerInfo = this.dealerInfo;
          let cashInfo = this.cashInfo;
          let dataSet = this.listData.map(item => {
            return {
              tdIdCopy1: item.tdIdCopy1,
              transMatchedCode: item.transMatchedCode,
              thenTotalAmntBal: item.thenTotalAmntBal,
              differenceAmountCopy1: item.differenceAmountCopy1,
              thenAlreadyAmnt: item.thenAlreadyAmnt,
              thenAmntBalCopy2: item.thenAmntBalCopy2,
              applicationAmount: item.applicationAmount,
              tdAmountCopy1: item.tdAmountCopy1,
              dealerDebit: item.dealerDebit,
            };
          });
          let formData = {
            ...orderInfo,
            order: {
              dataSet,
            },
            outPut: {
              dataSet: [{
                fundName_cashOutCode: cashInfo.fundName || cashInfo.fundName_cashOutCode,
                cashOutCode: cashInfo.fundCode || cashInfo.cashOutCode,
                cashType_cashOutCode: cashInfo.fundType || cashInfo.cashType_cashOutCode,
                thenAmntBal: cashInfo.thenAmntBal,
                tdAmount: cashInfo.tdAmount,
                tdId: cashInfo.tdId,
              }],
            },
          };
          let wfPara = {'本次支付': dealerInfo.tdAmountCopy1};
          this.saveData(formData, wfPara);
        }
        return true
      },
      // 选中资金
      selCash(item) {
        this.cashInfo = {
          ...this.cashInfo,
          ...item,
        };
      },
      // 计算支付后余额
      calcPayment(item) {
        let {thenAmntBalCopy1 = 0, tdAmountCopy1 = 0} = item;
        if (!tdAmountCopy1) {
          tdAmountCopy1 = 0;
        }
        tdAmountCopy1 = toFixed(tdAmountCopy1);
        item.tdAmountCopy1 = tdAmountCopy1;
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .detail_wrapper {
    .pop_dealer_list {
      width: 100%;
    }
  }

  .form_content {
    .main_content {
      /deep/ .weui-cell {
        padding: .08rem 0;
        &:before {
          left: 0;
        }
      }
      /deep/ .weui-label {
        color: #757575;
        font-size: .14rem;
      }
    }
  }

  .form_part {
    margin-bottom: .1rem;
    .form_title .iconfont {
      margin-right: .04rem;
      font-size: .14rem;
    }
  }
</style>
