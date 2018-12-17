<template>
  <div class="pages sj-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 往来信息-->
        <div class="materiel_list">
          <div class="mater_list">
            <div class="each_mater">
              <div class="userInp_mode">
                <div class="title">往来明细</div>
                <group class="SJ_group" @group-title-margin-top="0">
                  <!-- 商机标题 -->
                  <cell title="往来名称" v-model="dealerInfo.dealerName" text-align='right'>
                    <template slot="title">
                      <span class="required">往来名称</span>
                    </template>
                  </cell>
                  <cell title="往来编码" v-model="dealerInfo.dealerCodeCredit" text-align='right'>
                    <template slot="title">
                      <span class="required">往来编码</span>
                    </template>
                  </cell>
                  <cell title="往来关系标签" v-model="dealerInfo.crDealerLabel" text-align='right'>
                    <template slot="title">
                      <span class="required">往来关系标签</span>
                    </template>
                  </cell>
                  <popup-picker title="类型" :data="currentType" v-model="dealerInfo.applicationType"
                                placeholder="请选择">
                    <template slot="title">
                      <span class="required">类型</span>
                    </template>
                  </popup-picker>
                  <cell title="信用额度" v-model="dealerInfo.tdCreditLine" text-align='right'></cell>
                  <cell title="往来余额" v-model="dealerInfo.thenAmntBalCopy1" text-align='right'></cell>
                  <x-input type="number" text-align='right' placeholder='请填写'
                           @on-blur="checkAmt(dealerInfo.thenTotalAmntBal)" @on-focus="getFocus"
                           v-model.number="dealerInfo.thenTotalAmntBal">
                    <span class="required" slot="label">申请金额</span>
                  </x-input>
                  <!--<template v-if="transCode">
                    <cell title="本次支付" v-model="dealerInfo.tdAmountCopy1" text-align='right'></cell>
                    <cell title="本次支付后余额" v-model="dealerInfo.differenceAmount" text-align='right'></cell>
                  </template>-->
                  <x-input title="事由" text-align='right' placeholder='请填写'
                           v-model="dealerInfo.expCause"></x-input>
                </group>
              </div>
            </div>
          </div>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
      </div>
    </div>
    <div class='btn-no-amt vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="btn-item stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</div>
      <div class="btn-item" @click="submitOrder">提交</div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {
    Cell, Popup, TransferDom,
    Group, XInput, CellBox, Datetime,
    XTextarea, numberComma, dateFormat,
    PopupRadio, AlertModule, PopupPicker
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask, getDictByType} from 'service/commonService'
  import {getEmployeeBal} from 'service/costService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopFundList from 'components/Popup/PopFundList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'JKYBYJ_DATA';

  export default {
    data() {
      return {
        listId: '418bd0e9-1dce-4e01-aa5a-3d4cd80e87d4',
        showCostPop: false, // 是否显示客户的popup
        dealerInfo: {
          dealerName: '', // 往来名称
          dealerCodeCredit: '', // 用户编码
          crDealerLabel: '', // 关系标签
          applicationType: [], // 类型
          tdCreditLine: '', // 信用额度
          thenAmntBalCopy1: '', // 往来余额
          thenTotalAmntBal: '', // 申请金额
          tdAmountCopy1: '', // 本次支付
          differenceAmount: '', // 本次支付后余额
          expCause: '', // 事由
        },
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
        currentType: [['借款', '备用金']],
        selectedCost: []
      }
    },
    computed: {
      creatorName() {
        return this.formData.userCode
      },
    },
    watch: {
      creatorName(val) {
        this.getEmployeeBal()
      }
    },
    directives: {TransferDom},
    components: {
      Cell, Popup, Group, XInput, PopupPicker,
      Datetime, XTextarea,
      RPicker, PopFundList, PopBaseinfo
    },
    mixins: [common],
    filters: {numberComma},
    methods: {
      // 获取当前往来用户的往来余额
      getEmployeeBal() {
        let filter = [
          {
            operator: "eq",
            value: this.formData.userCode,
            property: "dealerCode"
          }
        ]
        getEmployeeBal(JSON.stringify(filter)).then(({tableContent = []}) => {
          let [data = {}] = tableContent;
          this.dealerInfo = {
            ...this.dealerInfo,
            dealerName: data.nickname, // 往来名称
            dealerCodeCredit: data.dealerCode, // 用户编码
            crDealerLabel: data.dealerLabelName, // 关系标签
            tdCreditLine: data.tdCreditLine, // 信用额度
            thenAmntBalCopy1: data.amntBal, // 往来余额
          }
        })
      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dealerInfo = this.dealerInfo;
        if (!dealerInfo.applicationType.length) {
          warn = '请选择类型';
        }
        if (!warn && !dealerInfo.thenTotalAmntBal && dealerInfo.thenTotalAmntBal !== 0) {
          warn = '请输入申请金额';
        }
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
                dataSet: [{
                  tdIdCopy1: dealerInfo.tdIdCopy1 || '',
                  dealerCodeCredit: dealerInfo.dealerCodeCredit,
                  crDealerLabel: dealerInfo.crDealerLabel,
                  applicationType: dealerInfo.applicationType[0],
                  tdCreditLine: dealerInfo.tdCreditLine,
                  thenAmntBalCopy1: dealerInfo.thenAmntBalCopy1,
                  thenTotalAmntBal: dealerInfo.thenTotalAmntBal,
                  tdAmountCopy1: dealerInfo.tdAmountCopy1,
                  differenceAmount: dealerInfo.differenceAmount,
                  expCause: dealerInfo.expCause,
                }]
              },
              outPut: {
                dataSet: [{
                  tdId: this.cashInfo.tdId || '',
                  cashInCode: this.cashInfo.cashInCode,
                  cashType_cashInCode: this.cashInfo.cashType_cashInCode,
                  thenAmntBal: this.cashInfo.thenAmntBal,
                  tdAmount: this.cashInfo.tdAmount,
                  dealerCodeCredit: dealerInfo.dealerCodeCredit,
                  crDealerLabel: dealerInfo.crDealerLabel,
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
            applicationType: [dealerInfo.applicationType], // 类型
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
            cashInfo: this.contactInfo,
            formData: this.formData
          }
        };
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

  .materiel_list .mater_list .each_mater {
    padding: unset;
  }

  .sj-apply-container {
    .SJ_group {

      /deep/ > .vux-label {
        color: #5077aa;
        font-weight: bold;
      }
      /deep/ > .vux-no-group-title {
        margin-top: 0.08rem;
      }
      /deep/ > .weui-cells {
        font-size: .16rem;
        .vux-tap-active {
          .vux-label {
            color: #5077aa;
            font-weight: bold;
          }
        }
        &:after {
          border-bottom: none;
        }
      }
      .vux-cell-box {
        &:before {
          left: 0;
        }
        /deep/ > .weui-cell {
          padding: 10px 0;
        }
      }
    }
    .weui-cell {
      padding: 10px 0;

      &:before {
        left: 0;
      }
    }

  }
</style>
