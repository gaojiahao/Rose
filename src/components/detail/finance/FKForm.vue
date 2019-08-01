<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part-other :contact-info="contactInfo" :configs="otherConfig"></contact-part-other>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <div class="form_part" v-if ='this.matterConfig.length != 0 &&  isEditAdmout'>
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">账户列表</span>
        </div>
        <div class="form_content"
            :class="{ 'show_border' : index !== orderInfo.order.dataSet.length - 1}"
            v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
          <div class="main_content" >
              <form-cell cellTitle='资金账户名称' :cellContent="item.fundName_cashOutCode" :showTopBorder=false></form-cell>
              <form-cell cellTitle='资金账户大类' :cellContent="item.cashType_cashOutCode"></form-cell>
              <form-cell cellTitle='账户余额' showSymbol :cellContent="item.thenAmntBal | toFixed | numberComma(3)"></form-cell>
              <form-cell cellTitle='支付金额' showSymbol :cellContent="item.tdAmount | toFixed | numberComma(3)"></form-cell>
          </div>
        </div>
      </div>
      <!-- 资金账户可编辑-->
      <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="4" :params="cashParams"
                     v-show="matterConfig.length &&  !isEditAdmout" required>
        <template slot="other">
          <div class='each_property vux-1px-t'>
            <label>支付金额</label>
            <input type='number' v-model.number="cashInfo.tdAmount" placeholder="请输入" class='property_val' @blur="checkAmt(cashInfo, 'tdAmount', cashInfo.tdAmount)"/>
          </div>
        </template>
      </pop-cash-list>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      
      <r-action :code="transCode" :task-id="taskId" :actions="actions" :agree-handler="agreeHandler"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'mixins/detailCommon'
// 组件引入
// 组件 引入
import RAction from 'components/public/RAction'
import workFlow from 'components/public/workFlow'
import contactPartOther from 'components/detail/commonPart/ContactPartOther'
import PopCashList from 'components/Popup/finance/PopCashList'
//公共方法引入
import {accAdd,accSub} from 'plugins/calc/decimalsAdd'
import {toFixed} from '@/plugins/calc'
import { constants } from 'crypto';
export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
      contactInfo: {}, // 客户、付款方式、物流条款的值
      cashInfo: {},
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction, contactPartOther , PopCashList
  },
  computed: {
    // 是否为会计复核
    isAccounting() {
      let {viewId = ''} = this.currentWL;
      return this.isMyTask && viewId === 'c5308aa2-5f52-4d77-a935-8738ae009b88';
    },
    // 是否为出纳
    isCashier() {
      let {viewId = ''} = this.currentWL;
      return this.isMyTask && viewId === 'cc27ce28-1385-420c-8b59-6d823a427853';
    },
    cashParams() {
      return {
        transCode: this.transCode
      }
    },
    // 判断纸巾账户的支付金额是否可编辑
    isEditAdmout() {
      let isEdit = false;
      this.matterConfig.forEach(item => {
        if (item.fieldCode === "fundName_cashOutCode"){
          isEdit = item.readOnly;
        }
      })
      // if (!isEdit){
      //   this.cashInfo = {
      //     ...this.cashInfo,
      //     fundCode: this.cashInfo.fundCode || this.cashInfo.cashInCode,
      //     fundType: this.cashInfo.fundType || this.cashInfo.cashType_cashInCode,
      //     fundName: this.cashInfo.fundName || this.cashInfo.fundName_cashInCode,
      //     thenAmntBal: this.cashInfo.thenAmntBal || this.cashInfo.thenAmntBalCopy1,
      //   }
      // }
      return isEdit
    }
  },
  methods: {
    checkAmt(item, key, val) {
      this.cashInfo.tdAmount = Math.abs(toFixed(val)); 
      this.contactInfo.thenAlreadyAmnt = this.cashInfo.tdAmount;
      this.contactInfo.differenceAmount = toFixed(accAdd(this.contactInfo.thenTotalAmntBal,this.cashInfo.tdAmount))
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
              onHide:() => {
              this.$router.back();
            }
          });
          return;
        }
        this.attachment = data.attachment;
        // 获取合计
        let {dataSet} = data.formData.order;
        for (let val of dataSet) {
          this.count = accAdd(this.count,val.tdAmount);
        }
        data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = data.formData;
        let {outPut,order} = this.orderInfo;
        // this.contactInfo = {
        //   creatorName:outPut.dataSet[0].dealerDebitContactPersonName, // 客户名
        //   dealerName: outPut.dataSet[0].dealerName_dealerDebit, // 公司名
        //   dealerMobilePhone: this.orderInfo.dealerDebitContactInformation, // 手机
        //   dealerContactPersonName: this.orderInfo.dealerDebitContactPersonName, // 联系人
        //   dealerCode:  outPut.dataSet[0].dealerDebit, // 客户编码
        //   dealerLabelName: outPut.dataSet[0].dealerName_dealerDebit, // 关系标签
        //   province:outPut.dataSet[0].province_dealerDebit, // 省份
        //   city: outPut.dataSet[0].city_dealerDebit, // 城市
        //   county: outPut.dataSet[0].county_dealerDebit, // 地区
        //   address: outPut.dataSet[0].address_dealerDebit, // 详细地址
        //   thenTotalAmntBal: outPut.dataSet[0].thenTotalAmntBal, // 往来余额
        //   applicationAmount: outPut.dataSet[0].applicationAmount, // 申请金额
        // };
        this.contactInfo = {
          creatorName:outPut.dataSet[0].dealerDebitContactPersonName, // 客户名
          dealerName_dealerDebit: outPut.dataSet[0].dealerName_dealerDebit, // 公司名
          dealerDebitContactInformation: this.orderInfo.dealerDebitContactInformation, // 手机
          dealerDebitContactPersonName: this.orderInfo.dealerDebitContactPersonName, // 联系人
          dealerDebit:  outPut.dataSet[0].dealerDebit, // 客户编码
          drDealerLabel: this.orderInfo.order.dataSet[0].drDealerLabel, // 关系标签
          province:outPut.dataSet[0].province_dealerDebit, // 省份
          city: outPut.dataSet[0].city_dealerDebit, // 城市
          county: outPut.dataSet[0].county_dealerDebit, // 地区
          address_dealerDebit: outPut.dataSet[0].address_dealerDebit, // 详细地址
          thenTotalAmntBal: outPut.dataSet[0].thenTotalAmntBal, // 往来余额
          differenceAmount: accAdd(outPut.dataSet[0].thenTotalAmntBal,(outPut.dataSet[0].thenAlreadyAmnt || 0)), 
          thenAlreadyAmnt: outPut.dataSet[0].thenAlreadyAmnt || 0,
          applicationAmount: outPut.dataSet[0].applicationAmount, // 申请金额
          tdId: order.dataSet[0].tdId,
          tdId2: outPut.dataSet[0].tdId,
        };
        this.cashInfo = this.orderInfo.order.dataSet[0];
        this.cashInfo = {
          fundCode : this.orderInfo.order.dataSet[0].cashOutCode,
          fundName : this.orderInfo.order.dataSet[0].fundName_cashOutCode,
          fundType : this.orderInfo.order.dataSet[0].cashType_cashOutCode,
          thenAmntBal : this.orderInfo.order.dataSet[0].thenAmntBal,
          fundName_cashInCode : this.orderInfo.order.dataSet[0].cashOutCode,
          cashInCode : this.orderInfo.order.dataSet[0].cashOutCode,
          thenAmntBalCopy1 : this.orderInfo.order.dataSet[0].thenAmntBal,
          cashType_cashInCode : this.orderInfo.order.dataSet[0].cashType_cashOutCode,
          tdId : this.orderInfo.order.dataSet[0].tdId,
          tdAmount : this.orderInfo.order.dataSet[0].tdAmount,
        }
        this.workFlowInfoHandler();
      })
    },
    // 同意的处理
    agreeHandler() {
      if (this.isAccounting || this.isCashier) {
        if (this.isCashier && !this.cashInfo.cashInCode) {
          this.$vux.alert.show({
            content: '请选择资金账户',
          });
          return true
        }
        let orderInfo = this.orderInfo;
        let dataSet = {
          tdId: this.contactInfo.tdId || '',
          cashOutCode: this.cashInfo.fundCode,
          cashType_cashOutCode: this.cashInfo.cashType_cashInCode,
          dealerDebit: this.contactInfo.dealerDebit,
          drDealerLabel: this.contactInfo.drDealerLabel,
          thenAmntBal: this.cashInfo.thenAmntBal,
          tdAmount: this.cashInfo.tdAmount,
        };
        let formData = {
          ...orderInfo,
          order: {
            dataSet: [{
              ...dataSet
            }],
          },
        };
        if (this.otherConfig.length) {
          formData.outPut = {
            dataSet: [{
              dealerDebit: this.contactInfo.dealerDebit,
              drDealerLabel: this.contactInfo.drDealerLabel,
              thenTotalAmntBal: this.contactInfo.thenTotalAmntBal,
              applicationAmount: this.contactInfo.applicationAmount,
              thenAlreadyAmnt: this.contactInfo.thenAlreadyAmnt,
              differenceAmount: this.contactInfo.differenceAmount,
              tdId: this.contactInfo.tdId2,
            }],
          }
        }
        // return 0;
        this.saveData(formData);
        return true
      }
      return false
    },
    // 选中资金
    selCash(item) {
      // this.cashInfo = {
      //   ...this.cashInfo,
      //   ...item,
      // };
      this.cashInfo.fundCode = item.fundCode;
      this.cashInfo.fundName = item.fundName;
      this.cashInfo.fundType = item.fundType;
      this.cashInfo.thenAmntBal = item.thenAmntBal;
      this.cashInfo.fundName_cashInCode = item.fundName;
      this.cashInfo.cashInCode = item.fundCode;
      this.cashInfo.thenAmntBalCopy1 = item.thenAmntBal;
      this.cashInfo.cashType_cashInCode = item.fundType;
      this.cashInfo.tdId = item.colId;
    },
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
  .form_part .form_title .iconfont {
    font-size: .14rem;
    margin-right: .04rem;
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
