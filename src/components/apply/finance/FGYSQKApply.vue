<template>
  <div class="pages fgysqk-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :statusData = "currentStage"></pop-baseinfo>
        <pop-dealer-list :default-value="dealerInfo" @sel-item="selDealer">
          <template slot="other">
            <div class="amt-dealer">
              <span class="amt-dealer-item">申请金额: {{applicationAmount | numberComma(3)}}</span>
            </div>
          </template>
        </pop-dealer-list>
        <!-- 欠款明细 -->
        <div class="materiel_list">
          <div class="order-info" @click="showOrder = true" v-if="!orderList.length">
            <div class="title">欠款明细</div>
            <div class="required">请选择欠款明细</div>
            <span class="iconfont icon-youjiantou r-arrow"></span>
          </div>
          <template v-else>
            <div class="order-detail" :class="{'vux-1px-t': index !== 0}" v-for="(item, index) in orderList"
                 :key="index">
              <div class="title">收票明细{{index+1}}<span class="iconfont icon-shanchu1" @click="deleteCost(sIndex)"></span></div>
              <div class="detail-item top">
                <span class="info-item">收票号:{{item.popiCode}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">往来关系: {{item.crDealerLabel}}</span>
                <span class="info-item">价税合计: {{item.thenTotalAmntBal | numberComma(3)}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">预期付款日: {{item.expectedPaymentDate}}</span>
                <span class="info-item">已核销: {{item.thenAlreadyAmnt | numberComma(3)}}</span>
                <span class="info-item">待核销: {{item.thenAmntBal | numberComma(3)}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item"
                      v-if="item.daysOfAccount || item.daysOfAccount === 0">账期天数: {{item.daysOfAccount}}</span>
                <span class="info-item" v-if="item.ageOfAging || item.ageOfAging === 0">账龄天数: {{item.ageOfAging}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item" >账期剩余天数: {{item.accountRemaingDays || -1}}</span>
                <span class="info-item">已收票: {{item.invoicing | numberComma(3)}}</span>
                <span class="info-item">待收票: {{item.pendingTicket || item.invoiced | numberComma(3)}}</span>
              </div>
              <x-input class="required" title="本次申请" text-align='right' placeholder='请填写' @on-blur="checkAmt(item, 'applicationAmount')"
                       @on-focus="getFocus($event)" type='number' v-model.number='item.applicationAmount'></x-input>
            </div>
          </template>
        </div>
        <!-- 新增更多 按钮 -->
        <div class="handle_part vx-1px-t" v-if="orderList.length">
          <span class="add_more" v-if="orderList.length" @click="addOrder">新增更多</span>
        </div>

        <!-- 资金信息 -->
        <!-- <pop-cash-list :default-value="cashInfo" @sel-item="selCash">
          <template slot="other">
            <x-input class="amt-cash" title="本次支付" text-align='right' placeholder='请填写' type='number'
                     @on-blur="checkAmt('tdAmount')" @on-focus="getFocus($event)" v-model.number='cashInfo.tdAmount'></x-input>
          </template>
        </pop-cash-list> -->

        <!-- <div class="materiel_list">
          <group title="备注" class="costGroup">
            <x-textarea title="" v-model="formData.biComment" :max="100"></x-textarea>
          </group>
        </div> -->
        <div class='comment'>
          <p class="commit-label vux-1px-b">备注</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!-- 采购单信息 -->
        <pop-order-list :show="showOrder" :params="dealerParams" :default-value="orderList"
                        @sel-item="selOrder" v-model="showOrder"></pop-order-list>
      </div>
    </div>
    <div class='btn-no-amt vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="btn-item stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</div>
      <div class="btn-item" @click="submitOrder">提交</div>
    </div>
  </div>
</template>

<script>
  // vux插件引入
  import {
    Cell, Group, XInput,
    Popup, XTextarea, PopupPicker
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  import {findProjectApproval} from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'mixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/finance/PopDealerList'
  import PopCashList from 'components/Popup/finance/PopCashList'
  import PopOrderList from 'components/Popup/finance/PopOrderList'
  import RPicker from 'components/public/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {accAdd,accSub} from 'plugins/calc/decimalsAdd'
  import {toFixed} from '@/plugins/calc'
import { constants } from 'crypto';

  const DRAFT_KEY = 'FGYSQK_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, Popup,
      XInput, XTextarea,
      PopupPicker, RPicker, PopBaseinfo,
      PopDealerList, PopCashList, PopOrderList,
    },
    data() {
      return {
        listId: 'c930267f-66fd-4927-983b-0216ef9449b3',
        biReferenceId: '',
        selectedCost: [],
        costIndex: 0,
        transCode: '',
        formData: {
          biComment: ''
        },
        dealerInfo: {},
        showOrder: false,
        dealerParams: {},
        orderList: [],
        cashInfo: {},
      }
    },
    computed: {
      // 申请金额
      applicationAmount() {
        let total = 0;
        this.orderList.forEach(item => {
          if (item.applicationAmount) {
            total = accAdd(total, item.applicationAmount);
          }
        });
        return toFixed(total)
      },
      // 本次支付
      tdAmountCopy1() {
        let total = 0;
        this.orderList.forEach(item => {
          if (item.tdAmount) {
            item.differenceAmount = accAdd(item.thenAmntBal, item.tdAmount);
            total = accAdd(total, item.tdAmount);
          }
        });
        return toFixed(total)
      },
      // 本次支付后余额
      differenceAmount() {
        let total = 0;
        if (this.dealerInfo.amntBal) {
          total = accAdd(this.tdAmountCopy1, this.dealerInfo.amntBal)
        }
        return toFixed(total);
      },
    },
    methods: {
      // 删除费用明细
      deleteCost(index) {
        this.orderList.splice(index, 1);
      },
      // 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择供应商';
        }
        if (!warn && !this.orderList.length) {
          warn = '请选择欠款明细'
        }
        if (!warn) {
          this.orderList.every(item => {
            if (!item.popiCode) {
              warn = '请选择收票号';
              return false
            }
            item.tdAmount = item.applicationAmount;
            item.differenceAmount = toFixed(accSub(item.thenAmntBal, item.tdAmount));
            dataSet.push({
              // tdId: item.tdId || '',
              transMatchedCode: item.popiCode,
              orderCode: item.poCode,
              drDealerLabel: item.crDealerLabel,
              thenTotalAmntBal: item.thenTotalAmntBal,
              dealerDebit: this.dealerInfo.dealerCode,
              thenAlreadyAmnt: item.thenAlreadyAmnt,
              thenAmntBal: item.thenAmntBal,
              expectedPaymentDate: item.expectedPaymentDate,
              accountExpirationDate: item.accountExpirationDate,
              daysOfAccount: item.daysOfAccount,
              ageOfAging: item.ageOfAging,
              accountRemaingDays: item.accountRemaingDays ? item.accountRemaingDays : -1,
              invoiced: item.invoicing,
              pendingTicket: item.invoiced,
              applicationAmount: item.applicationAmount,
              tdAmount: item.tdAmount,
              differenceAmount: item.differenceAmount,
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
              [this.processCode]: {businessKey: this.businessKey, createdBy: JSON.stringify(this.formData.handler)}
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
            let inputDataSet = {
              dealerName_dealerDebit: this.dealerInfo.nickname,
              dealerDebit: this.dealerInfo.dealerCode,
              // drDealerLabel: this.dealerInfo.dealerLabelName,
              thenAmntBalCopy1: this.dealerInfo.amntBal,
              applicationAmount: this.applicationAmount,
              tdAmountCopy1: this.tdAmountCopy1,
              differenceAmount: this.differenceAmount,
            };
            let outputDataSet = {
              fundName_cashOutCode: this.cashInfo.fundName,
              cashOutCode: this.cashInfo.fundCode,
              cashType_cashOutCode: this.cashInfo.fundType,
              thenAmntBal: this.cashInfo.thenAmntBal,
              tdAmount: this.applicationAmount,
              dealerDebitCopy1: this.dealerInfo.dealerCode,
              drDealerLabelCopy1: this.dealerInfo.dealerLabelName,
            };
            if (this.transCode) {
              inputDataSet.tdIdCopy1 = this.dealerInfo.tdIdCopy1;
              outputDataSet.tdId = this.cashInfo.tdId;
            }
            let submitData = {
              listId: this.listId,
              biComment: this.formData.biComment,
              formData: JSON.stringify({
                ...this.formData,
                handlerEntity: this.entity.dealerName,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                inPut: {
                  dataSet: [inputDataSet],
                },
                order: {
                  dataSet
                },
                outPut: {
                  dataSet: [outputDataSet],
                },
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
          let {attachment = [], listId = '', biComment = '', biReferenceId = '', formData = {}} = data;
          this.attachment = attachment;
          this.listId = listId;
          this.biReferenceId = biReferenceId;
          // 基本信息
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
          };
          let {dataSet: orderDataSet = []} = formData.order;
          let {dataSet: inputDataSet = []} = formData.inPut;
          let {dataSet: outputDataSet = []} = formData.outPut;
          let [dealerInfo = {}] = inputDataSet;
          let [cashInfo = {}] = outputDataSet;
          // 采购明细
          orderDataSet.forEach(item => {
            item.popiCode = item.transMatchedCode;
            item.poCode = item.orderCode;
            item.invoicing = item.invoiced;
            item.crDealerLabel = item.drDealerLabel;
          });
          this.dealerInfo = {
            ...dealerInfo,
            nickname: dealerInfo.dealerName_dealerDebit,
            dealerCode: dealerInfo.dealerDebit,
            dealerLabelName: dealerInfo.drDealerLabel,
            amntBal: dealerInfo.thenAmntBalCopy1,
          };
          this.cashInfo = {
            ...cashInfo,
            fundName: cashInfo.fundName_cashOutCode,
            fundCode: cashInfo.cashOutCode,
            fundType: cashInfo.cashType_cashOutCode,
          };
          this.orderList = orderDataSet;
          this.$loading.hide();
        })
      },
      // 保存草稿数据
      hasDraftData() {
        // 是否选择项目
        if (!this.dealerInfo.dealerCode) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            formData: this.formData,
            dealerInfo: this.dealerInfo,
            orderList: this.orderList,
            cashInfo: this.cashInfo,
          }
        };
      },
      // 获取关联数据
      getRelationData() {
      },
      // 选中供应商
      selDealer(item) {
        this.dealerInfo = {...item};
        this.dealerParams = {
          dealerCode: item.dealerCode,
        }
      },
      // 选中采购明细
      selOrder(val) {
        this.orderList = JSON.parse(val);
      },
      // 选中资金
      selCash(val) {
        this.cashInfo = {...val};
      },
      // 新增
      addOrder() {
        this.showOrder = true;
      },
      // 保留两位小数
      checkAmt(item, key) {
        switch (item) {
          case 'tdAmount':
            this.cashInfo.tdAmount = toFixed(this.cashInfo.tdAmount);
            break;
          default:
            item[key] = toFixed(item[key]);
            break;
        }
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.formData = draft.formData;
        this.dealerInfo = draft.dealerInfo;
        this.orderList = draft.orderList;
        this.cashInfo = draft.cashInfo;
        this.dealerParams = {dealerCode: this.dealerInfo.dealerCode}
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply.scss';

  .fgysqk-apply-container {
    .amt-dealer {
      display: flex;
      flex-wrap: wrap;
      margin-top: .1rem;
      color: #757575;
      font-size: .14rem;
      .amt-dealer-item {
        margin-right: .1rem;
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .amt-cash {
      padding: .1rem 0 0;
      font-size: .14rem;
      &:before {
        display: none;
      }
    }
  }

  .costGroup {
    .weui-cells__title {
      padding-left: 0;
      font-size: 0.12rem;
    }
    .vux-no-group-title {
      margin-top: 0.08rem;
    }
    .weui-cells:after {
      border-bottom: none;
    }
    .vux-cell-box {
      .weui-cell {
        padding: 10px 0;
      }
      &:before {
        left: 0;
      }

    }
    .weui-cell {
      padding: 10px 0;
      &:before {
        left: 0;
      }
    }
  }

  .weui-cells__title {
    padding-left: 0;
    font-size: 0.12rem;
  }

  .order-info {
    position: relative;
    .title {
      font-size: .12rem;
    }
    .r-arrow {
      position: absolute;
      top: 50%;
      right: -1%;
      font-weight: bold;
      transform: translate(0, -50%);
    }
  }

  // 新增更多
  .handle_part {
    margin: 0 auto;
    //width: 95%;
    text-align: center;
    position: relative;
    background-color: #fff;
    .add_more {
      display: inline-block;
      width: 1rem;
      color: #fff;
      height: .24rem;
      font-size: .12rem;
      text-align: center;
      line-height: .24rem;
      margin: 0 auto .1rem;
      padding: 0;
      border-radius: .4rem;
      background: #5077aa;
      box-shadow: 0 2px 5px #5077aa;
      box-sizing: border-box;
    }
    .symbol {
      left: 50%;
      bottom: 25%;
      color: #757575;
      font-size: .12rem;
      position: absolute;
      transform: translate(-50%, 0);
    }
    .stop {
      margin-right: .24rem;
      background: #ea5455;
      box-shadow: 0 2px 5px #ea5455;
    }
  }

  .order-detail {
    margin-bottom: .1rem;
    &:first-child {
      padding-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
    .title {
      span{
          color: red;
          float: right;
        }
    }
    .detail-item {
      display: flex;
      flex-wrap: wrap;
      color: #757575;
      font-size: .12rem;
      &.top {
        color: #000;
        font-size: .14rem;
      }
    }
    .info-item {
      margin-right: .05rem;
    }
    .weui-cell {
      padding: 10px 0;
      font-size: .14rem;
      &:before {
        left: 0;
      }
    }
  }
  .materiel_list {
    //width: 95%;
    //margin: .1rem auto;
    background: #fff;
    margin-top: 0.1rem;
    box-sizing: border-box;
    padding: .06rem .1rem;
    .title {
      color: #757575;
      font-size: .12rem;
      .required {
        color: required;
        font-weight: bold;
      }
    }
  }
</style>
