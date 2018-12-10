<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :default-contact="contactInfo"
                         @sel-dealer="selDealer" @sel-contact="selContact"></pop-dealer-list>
        <!-- 开票明细 -->
        <div class="materiel_list" v-for="(item,index) in invoiceList" :key="index">
          <div class="title">开票明细</div>
          <group class='costGroup' @group-title-margin-top="0">
            <cell v-model="item.transCode || '请选择'" is-link @click.native="getCost(index,item)">
              <template slot="title">
                <span class='required'>出库单</span>
              </template>
            </cell>
            <cell v-model='item.inventoryName'>
              <template slot="title">
                <span class='required'>物料名称</span>
              </template>
            </cell>
            <cell v-model='item.inventoryCode'>
              <template slot="title">
                <span class='required'>物料编码</span>
              </template>
            </cell>
            <cell v-model='item.qtyBal'>
              <template slot="title">
                <span class='required'>待申请数量</span>
              </template>
            </cell>
            <cell v-model='item.price'>
              <template slot="title">
                <span class='required'>单价</span>
              </template>
            </cell>
            <x-input text-align='right' placeholder='请填写' type='number' v-model.number='item.tdQty'
                     @on-blur="checkQty(item, index)" @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>本次申请数量</span>
              </template>
            </x-input>
            <cell v-model='item.noTaxAmount'>
              <template slot="title">
                <span class='required'>金额</span>
              </template>
            </cell>
            <x-input text-align='right' placeholder='请填写' type='number' v-model.number='item.taxRate'
                     @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>税率</span>
              </template>
            </x-input>
            <cell v-model='item.taxAmount'>
              <template slot="title">
                <span class='required'>税金</span>
              </template>
            </cell>
            <cell v-model='item.tdAmount'>
              <template slot="title">
                <span class='required'>税价小计</span>
              </template>
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
        <!--开票列表-->
        <pop-invoice-list :show="showInvoicePop" v-model="showInvoicePop" @sel-matter="selInvoice"
                          :defaultValue='seletedInvoice' :params="dealerParams"></pop-invoice-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}">
      <span class="count_num">
        <span class="total_price">
          <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}}
        </span>
        <!-- <span class="total-num">[代开票金额: {{thenAmntBal}}]</span> -->
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
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopInvoiceList from 'components/Popup/invoice/PopInvoiceList'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'KPSQ_DATA';
  // 开票明细项
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
    data() {
      return {
        listId: 'ebd2225c-9354-4df9-bded-8631e3cac4ac',
        dealerInfo: {}, //客户信息
        contactInfo: {}, // 联系人信息
        invoiceType: [['普通发票', '专用发票']],
        invoiceGetType: [],
        invoicePlan: [],
        dealerParams: { //
          dealerCode: ''
        },
        taxRate: 0.16,
        invoiceList: [{...INVOICE_LIST_ITEM}],
        showInvoicePop: false,
        seletedIndex: 0,
        seletedInvoice: [],
        formData: {
          biProcessStatus: '',
          biComment: ''
        },
        formDataComment: '', // 备注
        projectName: '', // 项目名称
      }
    },
    computed: {
      // 合计金额
      totalAmount() {
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
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.dealerParams.dealerCode = this.dealerInfo.dealerCode;
        this.invoiceList = [{...INVOICE_LIST_ITEM}];
      },
      // TODO 选中联系人
      selContact(item) {
        this.contactInfo = {...item,}
      },
      // 展示实例列表
      getCost(index, item) {
        let selected = this.invoiceList[index];
        this.showInvoicePop = true;
        this.seletedIndex = index;
        this.seletedInvoice = selected ? [selected] : [];
      },
      // TODO 点击增加明细
      addInvoice() {
        this.invoiceList.push({...INVOICE_LIST_ITEM})
      },
      // 删除明细
      deleteInvoice() {
        this.invoiceList.pop();
      },
      // TODO 选中出库单
      selInvoice(sels) {
        this.$set(this.invoiceList, this.seletedIndex, {
          ...this.invoiceList[this.seletedIndex],
          ...sels,
          price: toFixed(sels.price),
          taxRate: this.taxRate,
        });
      },
      // TODO 校验数量
      checkQty(item, index) {
        if (item.tdQty > item.qtyBal) {
          item.tdQty = item.qtyBal;
        }
        this.$set(this.invoiceList, index, {
          ...item,
          tdQty: Math.abs(toFixed(item.tdQty)),
        })
      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择客户信息';
        }
        if (!warn) {
          this.invoiceList.every(item => {
            if (!item.transCode) {
              warn = '请选择出库单';
              return false
            } else if (!item.tdQty && item.tdQty !== 0) {
              warn = '请填写本次申请数量';
              return false
            } else if (!item.taxRate && item.taxRate !== 0) {
              warn = '请填写税率';
              return false
            }
            dataSet.push({
              tdId: item.tdId || '',
              transMatchedCode: item.transCode, // 实例编码,
              inventoryName_transObjCode: item.inventoryName,
              transObjCode: item.inventoryCode,
              thenQtyBal: item.qtyBal,
              price: item.price,
              tdQty: item.tdQty,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              tdAmount: item.tdAmount, // 本次开票金额,
              comment: item.comment, // 说明
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
              [this.processCode]: {businessKey: "VATO", createdBy: JSON.stringify(this.formData.handler)}
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
                  crDealerLabel: '客户',
                  dealerCodeCredit: this.dealerInfo.dealerCode,
                  dataSet: dataSet,
                },
                dealerCreditContactPersonName: this.contactInfo.dealerName || null,
                dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '',
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
      getFormData() {
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
          formData.order.dataSet.forEach(item => {
            let obj = {
              ...item,
              transCode: item.transCode, // 实例编码,
              inventoryName: item.inventoryName,
              inventoryCode: item.inventoryCode,
              qtyBal: item.thenQtyBal,
            }
            this.invoiceList.push(obj);
          })
          this.invoiceGetType.push(formData.invoiceType);
          this.dealerParams.dealerCode = formData.order.dealerCodeCredit;
          this.$loading.hide();
          // this.$emit('input', false);
        })
      },
      // TODO 保存草稿数据
      hasDraftData() {
        // 是否选择客户
        if (!Object.values(this.dealerInfo).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            handlerDefault: this.handlerDefault,
            dealer: this.dealerInfo,
            list: this.invoiceList,
            contactInfo: this.contactInfo,
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.handlerDefault = draft.handlerDefault;
        this.dealerInfo = draft.dealer;
        this.invoiceList = draft.list;
        this.contactInfo = draft.contactInfo;
        this.dealerParams.dealerCode = this.dealerInfo.dealerCode;
        // sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmjh-apply-container {
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
