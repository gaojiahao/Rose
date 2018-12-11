<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :dealer-label-name="'供应商'" :default-contact="contactInfo"
                         :params="dealerParams" @sel-dealer="selDealer" @sel-contact="selContact"></pop-dealer-list>
        <cell class="cell-item" title="结算方式" :value="dealerInfo.paymentTerm"></cell>
        <!--发票信息-->
        <div class="materiel_list">
          <div class="title">发票信息</div>
          <group class="SJ_group" @group-title-margin-top="0">
            <x-input title="票号" v-model="invoiceInfo.ticketNumber" text-align="right" placeholder="请填写" @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>票号</span>
              </template>
            </x-input>
            <popup-picker title="发票类型" :data="invoiceType" v-model="invoiceGetType" placeholder="请选择"
                          @on-change=" typeTask($event) " text-align="right">
              <template slot="title">
                <span class='required'>发票类型</span>
              </template>
            </popup-picker>
            <datetime title="发票日期" v-model='invoiceInfo.invoiceDate' text-align="right" placeholder="请选择">
              <template slot="title">
                <span class='required'>发票日期</span>
              </template>
            </datetime>
            <x-input title="发票内容" text-align='right' placeholder='请填写' v-model='invoiceInfo.invoiceContent'
                     @on-focus="getFocus($event)"></x-input>
          </group>
        </div>
        <!-- 任务计划列表 -->
        <div class="materiel_list" v-for="(item,index) in invoiceList" :key="index">
          <div class="title">收票明细</div>
          <group class='costGroup' @group-title-margin-top="0">
            <cell v-model="item.transCode || '请选择'" is-link @click.native="getCost(index,item)">
              <span class='required' slot="title">采购订单</span>
            </cell>
            <cell title="入库日期" v-model='item.purchaseDay'></cell>
            <cell title="物料名称" v-model='item.inventoryName'>
              <span class='required' slot="title">物料名称</span>
            </cell>
            <cell title="物料编码" v-model='item.inventoryCode'>
              <span class='required' slot="title">物料编码</span>
            </cell>
            <cell title="入库数量" v-model='item.qty'></cell>
            <cell title="已收票数量" v-model='item.stockQty'></cell>
            <cell title="待收票数量" v-model='item.qtyBal'>
              <span class='required' slot="title">待收票数量</span>
            </cell>
            <cell title="单价" v-model='item.price'>
              <span class='required' slot="title">单价</span>
            </cell>
            <x-input title="本次收票数量" text-align='right' placeholder='请填写' type='number' v-model.number='item.tdQty'
                     @on-blur="checkQty(item, index)" @on-focus="getFocus($event)">
              <span class='required' slot="label">本次收票数量</span>
            </x-input>
            <cell title="本次收票金额" v-model='item.noTaxAmount'>
              <span class='required' slot="title">金额</span>
            </cell>
            <x-input title="税率" text-align='right' placeholder='请填写' type='number' v-model.number='item.taxRate'
                     @on-focus="getFocus($event)">
              <span class='required' slot="label">税率</span>
            </x-input>
            <cell title="税金" v-model='item.taxAmount'>
              <span class='required' slot="title">税金</span>
            </cell>
            <cell title="税价小计" v-model='item.tdAmount'>
              <span class='required' slot="title">税价小计</span>
            </cell>
            <x-input type="text" title="说明" text-align='right' placeholder="请填写" @on-focus="getFocus($event)"
                     v-model="item.comment"></x-input>
          </group>
        </div>
        <!-- 新增 -->
        <div class="XMJH_add">
          <div>您还需要添加新的明细? 请点击
            <span @click="addInvoice">添加</span>
            <em v-if="invoiceList.length>1">或</em>
            <span @click="deleteInvoice" v-if="invoiceList.length>1"> 删除</span>
          </div>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
        <!--收票列表-->
        <pop-invoice-list :show="showInvoicePop" v-model="showInvoicePop" @sel-matter="selInvoice" :defaultValue='seletedInvoice'
                        :params="invoiceParams"  :getListMethod="false" ref="matter"></pop-invoice-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}">
      <span class="count_num">
        <span class="total_price">
          <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}}
        </span>
        <!-- <span class="total-num">[代收票金额: {{thenAmntBal}}]</span> -->
      </span>
      <span class="count_btn stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</span>
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {
    Cell, Group, XInput, dateFormat,
    XTextarea, Datetime, PopupPicker
  } from 'vux'
  // 请求 引入
  import { submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/commonService'
  import { getSOList } from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopInvoiceList from 'components/Popup/PopInvoiceList'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import { toFixed } from '@/plugins/calc'
  import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'ZZSSP_DATA';
  // 收票明细项
  const INVOICE_LIST_ITEM = {
    transCode: '', //实例编码,
    inventoryName: '',
    inventoryCode: '',
    qtyBal: '',
    price: '',
    tdQty: '',
    taxRate: '',
    taxAmount: '', // 税金
    tdAmount: '', // 税价小计
    comment: "", //说明
  };
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, XInput,
      Datetime, XTextarea, PopDealerList, PopupPicker, PopInvoiceList, RPicker, PopBaseinfo
    },
    data () {
      return {
        listId: '1759f423-9f1a-4a67-b68a-86773fe469c8',
        dealerInfo: {}, // 客户信息
        contactInfo: {}, // 联系人信息
        invoiceType: [['普通发票', '专用发票']],
        invoiceGetType: [],
        invoiceInfo: {
          ticketNumber: '', // 票号
          invoiceType: '', // 发票类型
          invoiceDate: '', // 发票日期
          invoiceContent: '', // 发票内容
        },
        invoiceParams: {
          dealerCode: ''
        },
        taxRate: 0.16,
        invoiceList: [{...INVOICE_LIST_ITEM}],
        showInvoicePop: false,
        seletedIndex: 0,
        seletedInvoice: [],
        formData: {
          biComment: ''
        },
        dealerParams: {
          dealerLabelName: '原厂供应商,经销供应商,设施供应商',
        }
      }
    },
     computed: {
      // 合计金额
      totalAmount () {
        let Amount = 0;
        this.invoiceList.forEach(item => {
          if (!item.tdQty && item.tdQty !== 0) {
            item.noTaxAmount = '';
            item.taxAmount = '';
            item.tdAmount = '';
            return
          }
          item.noTaxAmount = toFixed(accMul(item.tdQty, item.price));
          item.taxAmount = toFixed(accMul(item.noTaxAmount, item.taxRate));
          item.tdAmount = toFixed(accAdd(item.noTaxAmount, item.taxAmount));
          if (item.tdAmount) {
            Amount = accAdd(Amount, item.tdAmount);
          }
        });
        return Amount;
      },
    },
    methods: {
      // 选中的客户
      selDealer (val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.invoiceParams.dealerCode = this.dealerInfo.dealerCode;
        this.invoiceList = [{...INVOICE_LIST_ITEM}];
      },
      // TODO 选中联系人
      selContact(item) {
        this.contactInfo = {...item,}
      },
      // 发票类型选择
      typeTask (e) {
        this.invoiceInfo.invoiceType = e[0];
      },
      // 展示实例列表
      getCost (index,item) {
        this.showInvoicePop = true;
        this.seletedIndex = index;
        this.seletedInvoice = [];
        this.invoiceList.forEach(item=>{
          this.seletedInvoice.push(item);
        })
      },
      // TODO 点击增加明细
      addInvoice () {
        this.invoiceList.push({...INVOICE_LIST_ITEM})
      },
      // 删除明细
      deleteInvoice (val) {
        this.invoiceList.pop();
      },
      // TODO 选中费用
      selInvoice (val) {
        let sels = val;
        this.$set(this.invoiceList, this.seletedIndex, {
          ...this.invoiceList[this.seletedIndex],
          ...sels,
          taxRate: this.taxRate,
          tdQty: sels.qtyBal,
          price: toFixed(sels.price),
          purchaseDay: dateFormat(sels.calcTime, 'YYYY-MM-DD'),
        });
      },
      // TODO 校验数量
      checkQty(item, index) {
        if (!item.tdQty && item.tdQty !== 0) {
          return
        }
        if (item.tdQty > item.qtyBal) {
          item.tdQty = item.qtyBal;
        }
        this.$set(this.invoiceList, index, {
          ...item,
          tdQty: Math.abs(toFixed(item.tdQty)),
        })
      },
      // TODO 提交
      submitOrder () {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择客户信息';
        }
        let objArr = [
          {tip: 'ticketNumber', msg: '请输入票号'},
          {tip: 'invoiceType', msg: '请选择发票类型'},
          {tip: 'invoiceDate', msg: '请选择发票日期'},
        ];
        if (!warn) {
          objArr.every(item=>{
            if (!this.invoiceInfo[item.tip]) {
              warn = item.msg;
              return false;
            }
            return true
          })
        }
        if (!warn) {
          this.invoiceList.every(item => {
            if (!item.transCode) {
              warn = '请选择采购订单';
              return false
            } else if (!item.tdQty && item.tdQty !== 0) {
              warn = '请填写本次收票数量';
              return false
            } else if (!item.taxRate && item.taxRate !== 0) {
              warn = '请填写税率';
              return false
            }
            dataSet.push({
              tdId: item.tdId || '',
              orderCode: item.transCode, // 实例编码,
              transMatchedCode: item.transCode, // 实例编码,
              purchaseDay: item.purchaseDay,
              transObjCode: item.inventoryCode,
              thenTotalQtyBal: item.qty,
              thenLockQty: item.stockQty,
              thenQtyBal: item.qtyBal,
              price: item.price,
              tdQty: item.tdQty,
              noTaxAmount: item.noTaxAmount,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              tdAmount: item.tdAmount, // 本次开票金额,
              comment: item.comment || '', // 说明
            });
            return true
          });
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveAndStartWf;
            let wfPara = {
              [this.processCode]: {businessKey: "VATI", createdBy: JSON.stringify(this.formData.handler)}
            }
            if (this.isResubmit) {
              wfPara = {
                businessKey: this.transCode,
                createdBy: this.formData.handler,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ""
              }
            }
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                handlerEntity: this.entity.dealerName,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                order: {
                  dealerCodeCredit: this.dealerInfo.dealerCode,
                  crDealerLabel: this.dealerInfo.dealerLabelName,
                  crDealerPaymentTerm: this.dealerInfo.paymentTerm || null,
                  pamentDays_dealerCodeCredit: this.dealerInfo.pamentDays || null,
                  dataSet: dataSet,
                },
                dealerCreditContactPersonName: this.contactInfo.dealerName || null,
                dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '',
                invoiceDate: this.invoiceInfo.invoiceDate,
                ticketNumber: this.invoiceInfo.ticketNumber,
                invoiceType: this.invoiceInfo.invoiceType,
                invoiceContent: this.invoiceInfo.invoiceContent,
              }),
              wfPara: JSON.stringify(wfPara)
            };
            // 重新提交
            if (this.isResubmit) {
              submitData.biReferenceId = this.biReferenceId;
              operation = saveAndCommitTask
            }
            // 无工作流
            if (!this.processCode.length) {
              operation = submitAndCalc;
              delete submitData.wfPara;
              delete submitData.biReferenceId;
            }
            if (this.biReferenceId) {
              submitData.biReferenceId = this.biReferenceId
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // 获取订单信息用于重新提交
      getFormData () {
        return getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.attachment = data.attachment;
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          this.invoiceList = [];
          let {formData} = data;
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          // 基本信息
          this.formData = {
            ...this.formData,
            ...this.handlerDefault,
            biComment: formData.biComment,
            biId: formData.biId,
            biProcessStatus: formData.biProcessStatus,
            creator: formData.creator,
            modifer: formData.modifer,
          }
          // 客户信息
          this.dealerInfo = {
            ...this.dealerInfo,
            dealerName: formData.order.dealerName_dealerCodeCredit,
            dealerCode: formData.order.dealerCodeCredit,
            province: formData.order.province_dealerCodeCredit,
            city: formData.order.city_dealerCodeCredit,
            county: formData.order.county_dealerCodeCredit,
            address: formData.order.address_dealerCodeCredit,
            dealerMobilePhone: formData.order.dealerMobilePhone_dealerCodeCredit
          }
          // 发票列表明细
          formData.order.dataSet.forEach(item=>{
            let obj = {
              ...item,
              transCode: item.transMatchedCode, //实例编码,
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.inventoryCode_transObjCode,
              qty: item.thenTotalQtyBal,
              stockQty: item.thenLockQty,
              qtyBal: item.thenQtyBal,
            };
            this.invoiceList.push(obj);
          })
          // 发票信息
          this.invoiceInfo = {
            ...this.invoiceInfo,
            ticketNumber: formData.ticketNumber,
            invoiceType: formData.invoiceType,
            invoiceDate: dateFormat(formData.invoiceDate, 'YYYY-MM-DD'),
            invoiceContent: formData.invoiceContent,
          };
          this.contactInfo = {
            dealerName: formData.dealerCreditContactPersonName,
            dealerMobilePhone: formData.dealerCreditContactInformation,
          };
          this.invoiceGetType.push(formData.invoiceType);
          this.invoiceParams.dealerCode = formData.order.dealerCodeCredit;
          this.$loading.hide();
          // this.$emit('input', false);
        })
      },
      // TODO 保存草稿数据
      hasDraftData () {
        // 是否选择供应商
        if (!Object.values(this.dealerInfo).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            invoice: {
              dealer: this.dealerInfo,
              invoiceInfo: this.invoiceInfo,
              list: this.invoiceList,
              contactInfo: this.contactInfo,
            }
          }
        };
      },
    },
    created () {
      let data = sessionStorage.getItem('ZZSSP_DATA');
      if (data) {
        let draft = JSON.parse(data);
        this.invoiceList = draft.invoice.list;
        this.dealerInfo = draft.invoice.dealer;
        this.invoiceInfo = draft.invoice.invoiceInfo;
        this.contactInfo = draft.invoice.contactInfo;
        this.invoiceParams.dealerCode = this.dealerInfo.dealerCode;
        this.invoiceGetType.push(this.invoiceInfo.invoiceType);
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmjh-apply-container {
    .cell-item {
      margin: 0 auto;
      padding: .05rem .1rem;
      width: 95%;
      background-color: #fff;
      box-sizing: border-box;
      &:before {
        display: none;
      }
      /deep/ .vux-label {
        color: #757575;
        font-size: .14rem;
      }
    }
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }

  .vux-cell-box:not(:first-child):before {
    left: 0;
  }

  .XMJH_add {
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      color: #fff;
      padding: .01rem .04rem;
      border-radius: .12rem;
      &:nth-child(1) {
        background: #5077aa;
      }
      &:nth-child(3) {
        background: #fc3c3c;
      }
    }
    em {
      font-style: normal;
    }
  }
</style>
