<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="contactInfo"></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <div class="form_part" v-if = 'this.matterConfig.length != 0 '>
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
                     v-show="otherConfig.length &&  !isEditAdmout" required>
        <template slot="other">
          <div class='each_property vux-1px-t'>
            <label>支付金额</label>
            <input type='number' v-model.number="cashInfo.tdAmountCopy1" placeholder="请输入" class='property_val' @blur="checkAmt(cashInfo, 'tdAmountCopy1', cashInfo.tdAmountCopy1)"/>
          </div>
        </template>
      </pop-cash-list>
      <!-- <div class="materiel_list" v-for="(item, index) in this.matterConfig[1].items" :key='index'>
          <group :title='`资金账户${index+1}`' class='costGroup'>
            <cell title="资金账户名称" v-model='item.cashName' is-link @click.native="getCost(index,item)">
              <template slot="title">
                <span class='required'>资金账户名称
                </span>
              </template>
            </cell>
            <cell title="资金账户大类" :value="item.cashType_cashOutCode">
              <template slot="title">
                <span class='required'>资金账户大类</span>
              </template>
            </cell>
            <cell title="账户余额" :value="item.thenAmntBal">
              <template slot="title">
                <span class='required'>账户余额</span>
              </template>
            </cell>
            <x-input title="支付金额" text-align='right' placeholder='请填写' @on-focus="getFocus($event)"
                    @on-blur="checkAmt(item)" type='number' v-model.number='item.tdAmount'>
              <template slot="label">
                <span class='required'>支付金额
                </span>
              </template>
            </x-input>
          </group>
        </div> -->
      <!-- <div class="price_cell vux-1px-t">
        <div class="price_title">
          <span>报销人: </span>
          <span class="people_name">{{orderInfo.creatorName }}</span>
        </div>
        <div>
          <span class='title'>合计:</span>
          <span class="num"><span style="fontSize:.12rem;">￥</span>{{count | toFixed | numberComma(3)}}</span>
        </div>
      </div> -->
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
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
import contactPart from 'components/detail/commonPart/ContactPart'
import PopCashList from 'components/Popup/finance/PopCashList'
//公共方法引入
import {accAdd} from 'plugins/calc/decimalsAdd'
import {toFixed} from '@/plugins/calc'
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
    workFlow, RAction, contactPart , PopCashList
  },
  computed: {
    cashParams() {
      return {
        transCode: this.transCode
      }
    },
    // 判断纸巾账户的支付金额是否可编辑
    isEditAdmout() {
      let isEdit = false;

      this.otherConfig.forEach(item => {
        if (item.fieldCode === "fundName_cashInCode"){
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
        }
      }
      return isEdit
    }
  },
  methods: {
    checkAmt(item, key, val) {
      item[key] = Math.abs(toFixed(val)); 
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
        let {outPut} = this.orderInfo;
        this.contactInfo = {
          creatorName:outPut.dataSet[0].dealerDebitContactPersonName, // 客户名
          dealerName: outPut.dataSet[0].dealerName_dealerDebit, // 公司名
          dealerMobilePhone: this.orderInfo.dealerDebitContactInformation, // 手机
          dealerContactPersonName: this.orderInfo.dealerDebitContactPersonName, // 联系人
          dealerCode:  outPut.dataSet[0].dealerDebit, // 客户编码
          dealerLabelName: outPut.dataSet[0].dealerName_dealerDebit, // 关系标签
          province:outPut.dataSet[0].province_dealerDebit, // 省份
          city: outPut.dataSet[0].city_dealerDebit, // 城市
          county: outPut.dataSet[0].county_dealerDebit, // 地区
          address: outPut.dataSet[0].address_dealerDebit, // 详细地址
          thenTotalAmntBal: outPut.dataSet[0].thenTotalAmntBal, // 往来余额
          applicationAmount: outPut.dataSet[0].applicationAmount, // 申请金额
        };
        this.workFlowInfoHandler();
      })
    },
    // 选中资金
    selCash(item) {
      // this.cashInfo = {
      //   ...this.cashInfo,
      //   ...item,
      // };
      this.cashInfo.fundName_cashInCode = item.fundName;
      this.cashInfo.cashInCode = item.fundCode;
      this.cashInfo.thenAmntBalCopy1 = item.thenAmntBal;
      this.cashInfo.cashType_cashInCode = item.fundType;
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
