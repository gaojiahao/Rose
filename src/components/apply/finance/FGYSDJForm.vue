<template>
  <div class="pages fgysqk-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 往来信息 -->
        <pop-dealer-list request="1" :default-value="dealerInfo" @sel-item="selDealer">
          <template slot="other">
            <div class="amt-dealer">
              <span class="amt-dealer-item">本次申请: {{applicationAmount}}</span>
              <!-- <span class="amt-dealer-item">本次支付后余额: {{differenceAmount}}</span> -->
            </div>
            <!-- <x-input class="amt-copy" title="本次支付" text-align='right' placeholder='请填写'
                     @on-blur="checkAmt('tdAmountCopy1')"
                     @on-focus="getFocus($event)" type='number' v-model.number='dealerInfo.tdAmountCopy1'></x-input> -->
          </template>
        </pop-dealer-list>

        <!-- 采购列表 -->
        <div class="materiel_list">
          <div class="order-info" @click="showOrder = true" v-if="!orderList.length">
            <div class="title">定金明细</div>
            <div class="mode">请选择定金明细</div>
            <span class="iconfont icon-youjiantou r-arrow"></span>
          </div>
          <template v-else>
            <div class="title">定金明细</div>
            <div class="order-detail" :class="{'vux-1px-t': index !== 0}" v-for="(item, index) in orderList"
                 :key="index">
              <div class="detail-item top">
                <span class="info-item">{{item.transCode}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">总金额: {{item.thenAmntBal}}</span>
                <span class="info-item">采购定金: {{item.amount}}</span>
              </div>
              <cell title="已付定金" text-align='right' :value="item.amnted"></cell>
              <cell text-align='right' :value="item.deposit">
                <template slot="title">
                  <span class="required">待付定金</span>
                </template>
              </cell>
              <x-input text-align='right' placeholder='请填写'  type='number' @on-blur="checkAmt(item, 'tdAmount')"
                       @on-focus="getFocus($event)" v-model.number='item.tdAmount'>
                <template slot="label">
                  <span class="required">本次申请</span>
                </template>
              </x-input>
            </div>
          </template>
        </div>
        <!-- 新增更多 按钮 -->
        <div class="handle_part vx-1px-t" v-if="orderList.length">
          <span class="add_more" v-if="orderList.length" @click="addOrder">新增更多</span>
        </div>

        <!-- 资金信息 -->
        <!-- <pop-cash-list request="1" :default-value="cashInfo" @sel-item="selCash">
          <template slot="other">
            <x-input class="amt-cash" title="支付金额" text-align='right' placeholder='请填写' type='number'
                     @on-blur="checkAmt('tdAmount')" @on-focus="getFocus($event)"
                     v-model.number='cashInfo.tdAmount'></x-input>
          </template>
        </pop-cash-list> -->

        <div class="materiel_list">
          <group title="其他信息" class="costGroup">
            <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
          </group>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
        <!-- 采购单信息 -->
        <pop-earnest-money-list :show="showOrder" :params="dealerParams" :default-value="orderList"
                                @sel-item="selOrder" v-model="showOrder"></pop-earnest-money-list>
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
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/finance/PopDealerList'
  import PopCashList from 'components/Popup/finance/PopCashList'
  import PopEarnestMoneyList from 'components/Popup/finance/PopEarnestMoneyList'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {accAdd, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'FGYSDJ_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, Popup,
      XInput, XTextarea,
      PopupPicker, RPicker, PopBaseinfo,
      PopDealerList, PopCashList, PopEarnestMoneyList,
    },
    data() {
      return {
        listId: '7d172485-8726-4e42-b29d-ec2a716bf062',
        biReferenceId: '',
        selectedCost: [],
        costIndex: 0,
        transCode: '',
        formData: {
          biComment: '',
          biProcessStatus: ''
        },
        dealerInfo: {},
        showOrder: false,
        dealerParams: {},
        orderList: [],
        cashInfo: {
          fundName_cashOutCode: '',
          cashOutCode: '',
          cashType_cashOutCode: '',
          thenAmntBal: 0
        },
        numMap: {},
      }
    },
    computed: {
      // 本次申请
      applicationAmount() {
        let total = 0;
        this.orderList.forEach(item => {
          if (item.tdAmount) {
            total = accAdd(total, item.tdAmount);
          }
        });
        return toFixed(total)
      },
      // 本次支付后余额
      differenceAmount() {
        let total = this.dealerInfo.amntBal || 0;
            total = accAdd(total, this.applicationAmount)
        // total = accSub(total, this.applicationAmount);
        // if (this.dealerInfo.tdAmountCopy1) {
        //   total = accAdd(total, this.dealerInfo.tdAmountCopy1)
        // }
        return toFixed(total);
      },
    },
    methods: {
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择供应商';
        }
        if (!warn && !this.orderList.length) {
          warn = '请选择定金明细'
        }
        // if (!warn) {
        //   this.orderList.every(item => {
        //     if (!item.transCode) {
        //       warn = '请选择协议号';
        //       return false
        //     }
        //     if (!item.tdAmount) {
        //       warn = '请输入待付定金';
        //       return false
        //     }
        //     dataSet.push({
        //       tdId: item.tdId || '',
        //       transMatchedCode: item.transCode,
        //       thenTotalAmntBal: item.thenAmntBal,
        //       differenceAmountCopy1: item.amount,
        //       thenAlreadyAmnt: item.amnted,
        //       thenAmntBalCopy2: item.deposit,
        //       applicationAmount: item.tdAmount,
        //       tdAmountCopy1: item.tdAmount,
        //       dealerDebit: this.dealerInfo.dealerCode,
        //     });
        //     return true
        //   });
        // }
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }
        this.orderList.forEach(item => {
          dataSet.push({
            tdId: item.tdId || '',
            transMatchedCode: item.transCode,
            thenTotalAmntBal: item.thenAmntBal,
            differenceAmountCopy1: item.amount,
            thenAlreadyAmnt: item.amnted,
            thenAmntBalCopy2: item.deposit,
            applicationAmount: item.tdAmount,
            tdAmountCopy1: item.tdAmount,
            dealerDebit: this.dealerInfo.dealerCode,
          });
        })
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveAndStartWf;
            let wfPara = {
              [this.processCode]: {
                businessKey: this.businessKey,
                createdBy: JSON.stringify(this.formData.handler),
                '本次支付': this.applicationAmount,
              }
            };
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
              drDealerLabel: this.dealerInfo.dealerLabelName,
              applicationAmount: this.applicationAmount,
              tdAmountCopy1: this.applicationAmount,
              differenceAmount: this.differenceAmount,
            };
            let outputDataSet = {
              // fundName_cashOutCode: this.cashInfo.fundName,
              // cashOutCode: this.cashInfo.fundCode,
              // cashType_cashOutCode: this.cashInfo.fundType,
              // thenAmntBal: this.cashInfo.thenAmntBal,
              // tdAmount: this.cashInfo.tdAmount,
              ...this.cashInfo,
              tdAmount: this.applicationAmount,

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
                  thenAmntBalCopy1: this.dealerInfo.amntBal,
                  // tdAmountCopy1: this.dealerInfo.tdAmountCopy1,
                  // differenceAmount: this.differenceAmount,
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
          // 定金明细
          orderDataSet.forEach(item => {
            item.transCode = item.transMatchedCode;
            item.thenAmntBal = item.thenTotalAmntBal;
            item.amount = item.differenceAmountCopy1,
            item.amnted = item.thenAlreadyAmnt,
            item.deposit = item.thenAmntBalCopy2;
            item.tdAmount = item.applicationAmount;
          });
          this.dealerInfo = {
            ...dealerInfo,
            nickname: dealerInfo.dealerName_dealerDebit,
            dealerCode: dealerInfo.dealerDebit,
            dealerLabelName: dealerInfo.drDealerLabel,
            amntBal: formData.inPut.thenAmntBalCopy1,
            // tdAmountCopy1: formData.inPut.tdAmountCopy1,
          };
          this.cashInfo = {
            ...cashInfo,
            // fundName: cashInfo.fundName_cashOutCode,
            // fundCode: cashInfo.cashOutCode,
            // fundType: cashInfo.cashType_cashOutCode,
          };
          this.orderList = orderDataSet;
          this.$loading.hide();
        })
      },
      // TODO 保存草稿数据
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
      // TODO 获取关联数据
      getRelationData() {
      },
      // TODO 选中供应商
      selDealer(item) {
        this.dealerInfo = {...item};
        this.dealerParams = {
          dealerCode: item.dealerCode,
        }
      },
      // TODO 选中采购明细
      selOrder(val) {
        let sels = JSON.parse(val);
        sels.map(item => {
          let {tdAmount = item.deposit} = this.numMap[item.transCode] || {};
          item.tdAmount = tdAmount;
        })
        this.numMap = {};
        this.orderList = sels;
      },
      // TODO 选中资金
      selCash(val) {
        this.cashInfo = {...val};
      },
      // TODO 新增
      addOrder() {
        for (let item of this.orderList) {
          // 存储已输入的价格
          this.numMap[item.transCode] = {...item};
        }
        this.showOrder = true;
      },
      // TODO 保留两位小数
      checkAmt(item, key) {
        switch (item) {
          case 'tdAmountCopy1':
            this.dealerInfo.tdAmountCopy1 = toFixed(this.dealerInfo.tdAmountCopy1);
            break;
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
  @import './../../scss/bizApply.scss';

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
    .amt-copy, .amt-cash {
      padding: .1rem 0 0;
      font-size: .14rem;
      &:before {
        display: none;
      }
    }
  }

  .costGroup {
    /deep/ > .vux-no-group-title {
      margin-top: 0.08rem;
    }
    /deep/ > .weui-cells:after {
      border-bottom: none;
    }
    .vux-cell-box {
      /deep/ > .weui-cell {
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

  /deep/ > .weui-cells__title {
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
    width: 95%;
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
</style>
