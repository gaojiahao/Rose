<template>
  <div class="pages sj-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 费用明细-->
        <div class="materiel_list" v-for="(item, index) in CostList" :key='index'>
          <div class="title">{{`费用明细${index+1}`}}</div>
          <group class="SJ_group" @group-title-margin-top="0">
            <cell title="费用名称" v-model='item.exptName' is-link @click.native="getCost(index,item)">
              <span class='required' slot="title">费用名称</span>
            </cell>
            <cell title="费用编码" v-model="item.expCode"></cell>
            <cell title="费用科目" v-model="item.expSubject">
              <span class='required' slot="title">费用科目</span>
            </cell>
            <cell title="费用类型" v-model="item.costType"></cell>
            <x-input title="申请金额" text-align='right' placeholder='请填写' @on-focus="getFocus($event)"
                     @on-blur="checkAmt(item)" type='number' v-model.number='item.tdAmount'>
              <span class='required' slot="label">申请金额</span>
            </x-input>
            <x-input title="报销事由" text-align='right' placeholder='请填写' v-model='item.expCause'></x-input>
          </group>
        </div>
        <div class="add_more">
          您还需要添加新的报销?请点击
          <span class='add' @click="addCost">新增</span>
          <em v-show="CostList.length>1">或</em>
          <span class='delete' @click="deleteCost" v-show="CostList.length>1">删除</span>
        </div>
        <pop-cost-list :show="showCostPop" v-model="showCostPop" @sel-matter="selMatter" :defaultValue='selectedCost'
                       getListMethod="getProjectCostByGroupId"
                       :group-id="Number(formData.handlerUnit)" ref="matter"></pop-cost-list>
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
  import {Cell, Group, XInput, XTextarea} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  import {getEmployeeBal} from 'service/costService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopFundList from 'components/Popup/PopFundList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopCostList from 'components/Popup/PopCostList'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  import {accAdd, accSub} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'BXYZF_DATA';
  const COST_DETAIL = {
    exptName: '', // 费用名称
    expCode: '', // 费用编码
    expSubject: '', // 费用科目
    costType: '', // 费用类型
    tdAmount: 0, //申请金额
    taxAmount: 0, // 税金
    noTaxAmount: 0, // 不含税金额
  };

  export default {
    data() {
      return {
        listId: '080147c6-05ea-4ae7-9390-49e8e0379a11',
        dealerInfo: {
          dealerName_dealerCodeCredit: '', // 往来名称
          dealerCodeCredit: '', // 用户编码
          crDealerLabel: '', // 关系标签
          tdCreditLine: '', // 信用额度
          thenAmntBal: '', // 往来余额
          thenAlreadyAmnt: 0, // 本次贷方增加
          thenTotalAmntBal: 0, // 本次支付
          differenceAmount: 0, // 本次报销与支付后余额
          // tdAmount: 0, // 差异金额
        },
        formData: {
          biId: '', // 为空
          biComment: '',
          biProcessStatus: ''
        },
        cashInfo: {
          fundName_cashInCode: '',
          cashInCode: '', // 账户编码
          cashType_cashInCode: '', // 账户类型
          thenAmntBalCopy1: '', // 账户余额
          tdAmountCopy1: '', // 支付金额
        },
        CostList: [{...COST_DETAIL}],
        biReferenceId: '',
        showCostPop: false, // 费用的Pop
        costIndex: 0,
        selectedCost: [],
        showFundPop: false, // 账户的Pop
        selectedFund: []
      }
    },
    components: {
      Cell, Group, XInput, XTextarea,
      RPicker, PopFundList, PopBaseinfo, PopCostList
    },
    mixins: [common],
    computed: {
      creatorName() {
        return this.formData.userCode
      },
      // 本次报销与支付后余额
      differenceAmount() {
        let total = 0,
          subAmount = accSub(this.dealerInfo.thenAmntBal, this.dealerInfo.thenAlreadyAmnt);
        total = accAdd(subAmount, this.dealerInfo.thenTotalAmntBal);
        return toFixed(total);
      },
      // 往来差异金额
      tdAmount() {
        // let total = accSub(this.dealerInfo.thenAlreadyAmnt, this.cashInfo.tdAmountCopy1);
        let {thenAlreadyAmnt = 0, thenTotalAmntBal = 0} = this.dealerInfo;
        let total = accSub(thenAlreadyAmnt, thenTotalAmntBal);
        return toFixed(total);
      },
    },
    watch: {
      creatorName(val) {
        this.getEmployeeBal()
      },
      CostList: {
        handler(val) {
          let total = 0;
          val.forEach(item => {
            item.noTaxAmount = toFixed(accSub(item.tdAmount, item.taxAmount))
            total = accAdd(total, item.tdAmount)
          })
          this.dealerInfo.thenAlreadyAmnt = toFixed(total);
        },
        deep: true,
      },
      dealerInfo: {
        handler(val) {
          this.cashInfo.tdAmountCopy1 = val.thenTotalAmntBal
        },
        deep: true
      },
      cashInfo: {
        handler(val) {
          // 支付金额大于账户余额
          if (val.thenAmntBalCopy1 && val.tdAmountCopy1 > val.thenAmntBalCopy1) {
            val.tdAmountCopy1 = val.thenAmntBalCopy1;
          }
        },
        deep: true
      }
    },
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
            dealerName_dealerCodeCredit: data.nickname, // 往来名称
            dealerCodeCredit: data.dealerCode, // 用户编码
            crDealerLabel: data.dealerLabelName, // 关系标签
            tdCreditLine: data.tdCreditLine, // 信用额度
            thenAmntBal: data.amntBal, // 往来余额
          }
        })
      },
      getCost(index, item) {
        this.showCostPop = true;
        this.costIndex = index;
        this.selectedCost = [item];
      },
      // TODO 点击增加费用
      addCost() {
        this.CostList.push({...COST_DETAIL})
      },
      // 删除费用明细
      deleteCost() {
        this.CostList.pop();
      },
      // TODO 选中费用
      selMatter(val) {
        let sels = val;
        this.CostList[this.costIndex].exptName = sels.costName;
        this.CostList[this.costIndex].expCode = sels.costCode;
        this.CostList[this.costIndex].expSubject = sels.costSubject;
        this.CostList[this.costIndex].costType = sels.costType;
        this.CostList[this.costIndex].expCause = '';
      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        this.CostList.every(item => {
          if (!item.exptName) {
            warn = '请选择费用名称';
            return false
          }
          if (!item.tdAmount) {
            warn = '请填写申请金额';
            return false
          }
          dataSet.push({
            tdId: item.tdId || '',
            expCode: item.expCode, // 费用编码
            expSubject: item.expSubject, // 费用科目
            tdAmount: item.tdAmount, // 申请金额
            taxAmount: item.taxAmount, // 税金
            noTaxAmount: item.noTaxAmount, // 不含税金额
            expCause: item.expCause, // 报销事由
          });
          return true
        });
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
              inPut: {
                dataSet: [{
                  ...this.dealerInfo,
                  differenceAmount: this.differenceAmount,
                  tdAmount: this.tdAmount, // 差异金额
                  tdId: this.dealerInfo.tdId || '',
                }]
              },
              order: {
                departmentName: this.formData.handlerUnitName,
                dataSet,
              },
              outPut: {
                dataSet: [{
                  ...this.cashInfo,
                  tdIdCopy1: this.cashInfo.tdIdCopy1 || ''
                }]
              }
            };
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify({
                [this.processCode]: {
                  businessKey: 'FZFY',
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
          let {order, outPut, inPut} = formData,
            dealerInfo = inPut.dataSet[0],
            cashInfo = outPut.dataSet[0];
          // 客户信息
          this.dealerInfo = {
            dealerName_dealerCodeCredit: dealerInfo.dealerName_dealerCodeCredit, // 往来名称
            dealerCodeCredit: dealerInfo.dealerCodeCredit, // 用户编码
            crDealerLabel: dealerInfo.crDealerLabel, // 关系标签
            tdCreditLine: dealerInfo.tdCreditLine, // 信用额度
            thenAmntBal: dealerInfo.thenAmntBal, // 往来余额
            thenAlreadyAmnt: dealerInfo.thenAlreadyAmnt,
            thenTotalAmntBal: dealerInfo.thenTotalAmntBal, // 本次支付
            differenceAmount: dealerInfo.differenceAmount,
            tdAmount: dealerInfo.tdAmount,
            tdId: dealerInfo.tdId,
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
            ...this.handlerDefault,
            biComment: formData.biComment,
            biId: formData.biId,
            biProcessStatus: formData.biProcessStatus,
            creator: formData.creator,
            modifer: formData.modifer,
          };
          this.cashInfo = {
            fundName_cashInCode: cashInfo.fundName_cashInCode,
            cashInCode: cashInfo.cashInCode, // 账户编码
            cashType_cashInCode: cashInfo.cashType_cashInCode, // 账户类型
            thenAmntBalCopy1: cashInfo.thenAmntBalCopy1, // 账户余额
            tdAmountCopy1: cashInfo.tdAmountCopy1, // 本次支付
            tdIdCopy1: cashInfo.tdIdCopy1
          }
          this.CostList = [];
          order.dataSet.forEach(item => {
            this.CostList.push({
              tdId: item.tdId,
              exptName: item.costName_expCode, // 费用名称
              expCode: item.expCode, // 费用编码
              expSubject: item.expSubject, // 费用科目
              costType: item.costType_expCode, // 费用类型
              tdAmount: item.tdAmount, //申请金额
              taxAmount: item.taxAmount, // 税金
              noTaxAmount: item.noTaxAmount, // 不含税金额
            })
          })
          this.biReferenceId = formData.biReferenceId;
          this.$loading.hide();
        })
      },
      // TODO 检查金额
      checkAmt(item) {
        let {tdAmount, taxAmount} = item,
          {tdCreditLine, thenTotalAmntBal} = this.dealerInfo,
          {tdAmountCopy1} = this.cashInfo;
        if (tdAmount) {
          item.tdAmount = Math.abs(toFixed(tdAmount));
        }
        if (taxAmount) {
          item.taxAmount = Math.abs(toFixed(taxAmount));
        }
        if (tdCreditLine) {
          this.dealerInfo.tdCreditLine = Math.abs(toFixed(tdCreditLine));
        }
        if (thenTotalAmntBal) {
          this.dealerInfo.thenTotalAmntBal = Math.abs(toFixed(thenTotalAmntBal));
        }
        if (tdAmountCopy1) {
          this.cashInfo.tdAmountCopy1 = Math.abs(toFixed(tdAmountCopy1));
        }
      },
      // TODO 是否保存草稿
      hasDraftData() {
        return {
          [DRAFT_KEY]: {
            dealerInfo: this.dealerInfo,
            cashInfo: this.contactInfo,
            costList: this.costList,
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
        this.costList = draft.costList;
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

      /deep/ .vux-no-group-title {
        margin-top: 0.08rem;
      }
      /deep/ .weui-cells {
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
        /deep/ .weui-cell {
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

  .add_more {
    width: 100%;
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      margin: 0 5px;
      color: #fff;
      padding: .01rem .06rem;
      border-radius: .12rem;
    }
    .add {
      background: #5077aa;
    }
    .delete {
      background: red;
    }
    em {
      font-style: normal;
    }
  }
</style>
