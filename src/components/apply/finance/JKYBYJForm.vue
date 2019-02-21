<template>
  <div class="pages sj-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <!-- 往来信息-->
        <div class="dealer_list">
          <div class="dealer_info">
            <div v-for="(item, index) in fundConfig" :key="index" :class="{'vux-1px-t': index > 0}">
              <!-- 可编辑的字段 -->
              <template v-if="!item.readOnly">
                <!-- 下拉框 -->
                <r-picker :title="item.fieldLabel" :data="item.remoteData" :value="dealerInfo[item.fieldCode]"
                    v-model="dealerInfo[item.fieldCode]" :required="!item.allowBlank"
                    v-if="item.xtype === 'r2Combo'"></r-picker>
                <!-- 输入框（数字） -->
                <div class='each_property ' v-if="item.xtype === 'r2Numberfield' || item.xtype === 'r2Permilfield'">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <input type='number' v-model.number="dealerInfo[item.fieldCode]" placeholder="请输入" class='property_val' 
                         @focus="getFocus($event)" @blur="checkAmt(dealerInfo, item.fieldCode, dealerInfo[item.fieldCode]) "/>
                </div>
                <!-- 输入框（文字） -->
                <div class='each_property' v-if="item.xtype === 'r2Textfield' || item.xtype === 'r2TextArea'">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <input type='text' v-model="dealerInfo[item.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
                </div>
                <!-- 日期 -->
                <div class='each_property' v-if="item.xtype === 'r2Datefield'" @click="getDate(dealerInfo,item)">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <div class='picker'>
                    <span class='mater_nature'>{{dealerInfo[item.fieldCode] || "请选择"}}</span>
                    <span class='icon-right'></span>
                  </div>
                </div>
              </template>
              <!--不可编辑的字段 -->
              <template  v-else>
                <div class='each_property readOnly'>
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <span class='property_val'>{{dealerInfo[item.fieldCode]}}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class='comment'>
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- <op-button :is-modify="matterModifyClass" :hide="btnIsHide" @on-submit="submitOrder" ></op-button> -->
    <div class='btn-no-amt vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="btn-item stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</div>
      <div class="btn-item" @click="submitOrder">提交</div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import { XTextarea, numberComma, dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask, getDictByType} from 'service/commonService'
  import {getEmployeeBal} from 'service/costService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import RPicker from 'components/basicPicker'
  import PopFundList from 'components/Popup/PopFundList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import OpButton from 'components/apply/commonPart/OpButton'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'JKYBYJ_DATA';

  export default {
    data() {
      return {
        listId: '418bd0e9-1dce-4e01-aa5a-3d4cd80e87d4',
        showCostPop: false, // 是否显示客户的popup
        dealerInfo: {},
        formData: {
          biId: '', // 为空
          biComment: '',
          biProcessStatus: ''
        },
        cashInfo: {
          cashName: '',
          cashInCode: '', // 账户编码
          cashType_cashInCode: '', // 账户类型
          thenAmntBal: '', // 账户余额
          tdAmount: '', // 本次支付
        },
        biReferenceId: '',
        selectedCost: []
      }
    },
    computed: {
      creatorName() {
        return this.formData.handlerName
      },
    },
    watch: {
      creatorName(val) {
        this.getEmployeeBal()
      }
    },
    components: {
      XTextarea,
      RPicker, PopFundList, PopBaseinfo, OpButton
    },
    mixins: [common],
    filters: {numberComma},
    methods: {
      // 获取当前往来用户的往来余额
      getEmployeeBal() {
        let filter = [
          {
            operator: "eq",
            value: this.formData.handlerName,
            property: "nickname"
          }
        ]
        getEmployeeBal(JSON.stringify(filter)).then(({tableContent = []}) => {
          let [data = {}] = tableContent;
          this.fundConfig.forEach(item => {
            if((item.displayField && item.displayField !== 'text') || item.showFieldCode){
              this.$set(this.dealerInfo, item.fieldCode, data[item.displayField] || data[item.showFieldCode])
            }
          })
          
        })
      },
      // TODO 提交
      submitOrder() {
        /**
         * @warn 提示文字 
         * @dataSet 组装的提交的数据
         */
        let warn = '';
        let dataSet = [];
        let oItem = {};
        for(let sItem of this.submitMatterField){
          if(!sItem.hiddenInRun && !sItem.allowBlank && !this.dealerInfo[sItem.fieldCode]){
            warn = `${sItem.fieldLabel}不为空`
            break;
          }
          oItem[sItem.fieldCode] = this.dealerInfo[sItem.fieldCode] != null ? this.dealerInfo[sItem.fieldCode] : null
        }
        dataSet.push(oItem);
        // 有必填值为空，或者金额为0，展示错误提示
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
            let formData = {
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              order: {
                dataSet
                // dataSet: [{
                //   tdIdCopy1: dealerInfo.tdIdCopy1 || '',
                //   dealerCodeCredit: dealerInfo.dealerCodeCredit,
                //   crDealerLabel: dealerInfo.crDealerLabel,
                //   applicationType: dealerInfo.applicationType[0],
                //   tdCreditLine: dealerInfo.tdCreditLine,
                //   thenAmntBalCopy1: dealerInfo.thenAmntBalCopy1,
                //   thenTotalAmntBal: dealerInfo.thenTotalAmntBal,
                //   tdAmountCopy1: dealerInfo.tdAmountCopy1,
                //   differenceAmount: dealerInfo.differenceAmount,
                //   expCause: dealerInfo.expCause,
                // }]
              },
              outPut: {
                dataSet: [{
                  tdId: this.cashInfo.tdId || '',
                  cashInCode: this.cashInfo.cashInCode,
                  cashType_cashInCode: this.cashInfo.cashType_cashInCode,
                  thenAmntBal: this.cashInfo.thenAmntBal,
                  tdAmount: this.cashInfo.tdAmount,
                  dealerCodeCreditCopy1: this.dealerInfo.dealerCodeCredit,
                  crDealerLabelCopy1: this.dealerInfo.crDealerLabel,
                }]
              }
            };
            let submitData = {
              listId: this.listId,
              biComment: formData.biComment,
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify({
                [this.processCode]: {
                  businessKey: this.businessKey,
                  createdBy: formData.creator,
                }
              }),
            };
            if (this.isResubmit) {
              operation = saveAndCommitTask;
              submitData.biReferenceId = this.biReferenceId;
              submitData.wfPara = JSON.stringify({
                businessKey: this.transCode,
                createdBy: this.formData.creator || this.formData.handler,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ''
              });
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
      // TODO 获取详情
      getFormData() {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then(data => {
          let {success = true, formData = {}, attachment = []} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          this.attachment = attachment;
          // 获取合计
          let {order, outPut} = formData;
          let [dealerInfo = {}] = order.dataSet;
          let [cashInfo = {}] = outPut.dataSet;
          // 客户信息
          this.dealerInfo = {
            tdIdCopy1: dealerInfo.tdIdCopy1,
            dealerName: dealerInfo.dealerName_dealerCodeCredit, // 往来名称
            dealerCodeCredit: dealerInfo.dealerCodeCredit, // 用户编码
            crDealerLabel: dealerInfo.crDealerLabel, // 关系标签
            applicationType: dealerInfo.applicationType, // 类型
            tdCreditLine: dealerInfo.tdCreditLine, // 信用额度
            thenAmntBalCopy1: dealerInfo.thenAmntBalCopy1, // 往来余额
            thenTotalAmntBal: dealerInfo.thenTotalAmntBal, // 申请金额
            tdAmountCopy1: dealerInfo.tdAmountCopy1, // 本次支付
            differenceAmount: dealerInfo.differenceAmount, // 本次支付后余额
            expCause: dealerInfo.expCause, // 事由
          };
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          this.formData = {
            ...this.formData,
            ...this.handlerDefault,
            biComment: formData.biComment,
            biId: formData.biId,
            biProcessStatus: formData.biProcessStatus,
            creator: formData.creator,
            modifer: formData.modifer,
          }
          this.cashInfo = {
            tdId: cashInfo.tdId,
            cashName: cashInfo.fundName_cashInCode,
            cashInCode: cashInfo.cashInCode, // 账户编码
            cashType_cashInCode: cashInfo.cashType_cashInCode, // 账户类型
            thenAmntBal: cashInfo.thenAmntBal, // 账户余额
            tdAmount: cashInfo.tdAmount, // 本次支付
          }
          this.biReferenceId = formData.biReferenceId;
          this.$loading.hide();
        })
      },
      // TODO 检查金额
      checkAmt() {
        let {thenAmntBalCopy1 = 0, thenTotalAmntBal = 0} = this.dealerInfo;
        let {tdAmount} = this.cashInfo;

        if (!thenTotalAmntBal) {
          thenTotalAmntBal = 0;
        }

        this.dealerInfo.thenAmntBalCopy1 = toFixed(thenAmntBalCopy1);
        this.dealerInfo.thenTotalAmntBal = toFixed(thenTotalAmntBal);
        this.dealerInfo.tdAmountCopy1 = toFixed(thenTotalAmntBal);
        this.dealerInfo.differenceAmount = toFixed(accAdd(thenAmntBalCopy1, thenTotalAmntBal)); // 支付后余额
        this.cashInfo.tdAmount = toFixed(thenTotalAmntBal);
      },
      // TODO 是否保存草稿
      hasDraftData() {
        return {
          [DRAFT_KEY]: {
            dealerInfo: this.dealerInfo,
            cashInfo: this.cashInfo,
            formData: this.formData
          }
        };
      },
      splitConfig(editMatterPop, editMatterPopConfig){
        editMatterPopConfig.editPart = editMatterPop;
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.formData = draft.formData;
        this.dealerInfo = draft.dealerInfo;
        this.cashInfo = draft.cashInfo;
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply.scss';
  /* .btn-no-amt .btn-item.stop{
    flex: 0.5;
  } */
  .dealer_list{
    input {
      border: none;
      outline: none;
      font-size: .14rem;
    }
    .dealer_info {
      background: #fff;
      padding: 0 .15rem;
      &.has_border {
        margin-top: .1rem;
      }
      .cost_title{
        display: flex;
        justify-content: space-between;
        height: .4rem;
        line-height: .4rem;
        label{
          color: #333;
          font-weight: bold;
        }
        span{
          color: red;
        }
      }
    }
  }
  .project_part{
    margin-top: .1rem;
    background: #fff;
    padding: 0 .15rem;
  }
  .fill_wrapper{
    padding-bottom: .1rem;
    font-size: .14rem;
    
  }
  .each-info{
    background-color: #fff;
    padding: 0 .15rem;
  }
  .each_property {
    padding: .18rem 0;
    display: flex;
    justify-content: space-between;
    line-height: .14rem;
    label{
      color: #696969;
    }
    .add{
      color: #3296FA;
    }
    .required {
      color: #3296FA;
      font-weight: bold;
    }
    .property_val {
      text-align: right;
    }
    .readonly {
      color: #999;
    }
    .picker {
      display: flex;
      align-items: center;
      .icon-right{
        width: .08rem;
        height: .14rem;
        margin-left: .1rem;
      }
    }
  }
</style>
