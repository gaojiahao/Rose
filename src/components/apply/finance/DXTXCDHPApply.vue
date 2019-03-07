<template>
  <div class="pages fgysqk-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 采购列表 -->
        <div class="materiel_list">
          <div class="order-info" @click="showOrder = true" v-if="!orderList.length">
            <div class="title">汇票明细</div>
            <div class="mode required">请选择汇票明细</div>
            <span class="iconfont icon-youjiantou r-arrow"></span>
          </div>
          <template v-else>
            <div class="title">汇票明细</div>
            <div class="order-detail" :class="{'vux-1px-t': index !== 0}" v-for="(item, index) in orderList"
                 :key="index">
              <div class="detail-item top">
                <span class="info-item">{{item.draftNumber}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">类型: {{item.draftType}}</span>
                <span class="info-item">承兑人: {{item.accepter}}</span>
                <span class="info-item">金额: {{item.tdAmount | numberComma}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">出票日: {{item.draftDate}}</span>
                <span class="info-item">到期日: {{item.draftDueDate}}</span>
              </div>
              <datetime v-model='item.cashingDiscountDate'>
                <template slot="title">
                  <span class='required'>兑现贴现日</span>
                </template>
              </datetime>
              <x-input text-align='right' placeholder='请填写' type='number' @on-blur="checkAmt(item, index)"
                       @on-focus="getFocus($event)" v-model.number='item.discount'>
                <template slot="label">
                  <span class="required">贴息</span>
                </template>
              </x-input>
              <cell :value="item.thenAmntBal">
                <template slot="title">
                  <span class="required">现后余额</span>
                </template>
              </cell>
              <x-input title="说明" text-align='right' placeholder='请填写' v-model='item.comment'></x-input>
            </div>
          </template>
        </div>
        <!-- 新增更多 按钮 -->
        <div class="handle_part vx-1px-t" v-if="orderList.length">
          <span class="add_more" v-if="orderList.length" @click="addOrder">新增更多</span>
        </div>
        <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="2" :required="true">
          <template slot="other">
            <cell title="收款金额" :value="tdAmount"></cell>
          </template>
        </pop-cash-list>
        <div class="materiel_list">
          <group title="其他信息" class="costGroup">
            <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
          </group>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!-- 采购单信息 -->
        <pop-money-order-list :show="showOrder" :default-value="orderList" @sel-item="selOrder" request="1"
                              v-model="showOrder" get-list-method="getCashDiscount">
          <template slot="amount" slot-scope="{item}">
            <span>金额: {{item.amntTbMatched | numberComma}}</span>
          </template>
        </pop-money-order-list>
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
    Cell, Group, XInput, Popup, XTextarea, PopupPicker, Datetime, dateFormat, numberComma
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  import {findProjectApproval} from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import PopMoneyOrderList from 'components/Popup/finance/PopMoneyOrderList'
   import PopCashList from 'components/Popup/finance/PopCashList'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {accAdd, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'DXTXCDHP_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, Popup,
      XInput, XTextarea,
      PopupPicker, RPicker, PopBaseinfo,
       PopMoneyOrderList, Datetime, PopCashList
    },
    data() {
      return {
        listId: 'bb9ce973-2f62-4707-a54c-7e8605dc99d6',
        biReferenceId: '',
        selectedCost: [],
        costIndex: 0,
        transCode: '',
        formData: {
          biComment: '',
          biProcessStatus: ''
        },
        showOrder: false,
        orderList: [],
        cashInfo: {},

      }
    },
    computed: {
      // 本次收款金额
      tdAmount() {
        let total = 0;
        this.orderList.forEach(item => {
          if (item.thenAmntBal) {
            total = accAdd(total, item.thenAmntBal);
          }
        });
        return toFixed(total)
      },
    },
    filters:{
      numberComma, dateFormat
    },
    methods: {
      // 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        let validateMap = [

          {
            key: 'cashingDiscountDate',
            message: '请选择兑现贴现日'
          },
        ];
        // if (!this.dealerInfo.dealerCode) {
        //   warn = '请选择往来';
        // }
        if (!warn && !this.orderList.length) {
          warn = '请选择汇票明细'
        }
        if (!warn) {
          this.orderList.every(item => {
            validateMap.every(vItem => {
              if (!item[vItem.key] && item[vItem.key] !== 0) {
                warn = vItem.message;
              }
              return !warn
            });
            dataSet.push({
              tdId: item.tdId || null,
              draftNumber: item.draftNumber,
              draftType: item.draftType,
              accepter: item.accepter,
              tdAmount: item.tdAmount,
              draftDate: item.draftDate,
              draftDueDate: item.draftDueDate,
              cashingDiscountDate: item.cashingDiscountDate,
              discount: item.discount,
              thenAmntBal: item.thenAmntBal,
              comment: item.comment || '',
            });
            return !warn
          });
        }
        if (!warn && !this.cashInfo.fundName){
          warn = '请选择资金账户'
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
            let submitData = {
              listId: this.listId,
              biComment: this.formData.biComment,
              formData: JSON.stringify({
                ...this.formData,
                handlerEntity: this.entity.dealerName,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                inPut:{
                  dataSet: [{
                    fundName_cashInCode: this.cashInfo.fundName,
                    cashInCode: this.cashInfo.fundCode,
                    cashType_cashInCode: this.cashInfo.fundType,
                    thenAmntBal: this.cashInfo.amntBal,
                    tdAmount: this.tdAmount
                  }]
                },
                order: {
                  dataSet,
                },
                deposit: null,
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
          let {order = {}, inPut = {}} = formData;
          let {dataSet = []} = order;
          this.cashInfo = {
            fundName: inPut.dataSet[0].fundName_cashInCode,
            fundCode: inPut.dataSet[0].cashInCode,
            fundType: inPut.dataSet[0].cashType_cashInCode,
            tdAmount: inPut.dataSet[0].tdAmount,
            amntBal: inPut.dataSet[0].thenAmntBal
          }
          this.orderList = dataSet;
          this.$loading.hide();
        })
      },
      // 保存草稿数据
      hasDraftData() {
        // 是否选择项目
        if (!this.orderList.dealerCode) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            formData: this.formData,
            cashInfo: this.cashInfo,
            orderList: this.orderList,
          }
        };
      },
      // 获取关联数据
      getRelationData() {
      },
      // 选中采购明细
      selOrder(val) {
        val.forEach(item => {
          item.draftDate = dateFormat(item.draftDate, 'YYYY-MM-DD');
          item.draftDueDate = dateFormat(item.draftDueDate, 'YYYY-MM-DD');
          item.tdAmount = item.amntTbMatched;
        });
        this.orderList = val;
        this.orderList.forEach(item => {
          if (!item.discount){
            item.discount = 0;
          }
          item.thenAmntBal = Number(accSub(item.tdAmount, item.discount))
        })
      },
      // 新增
      addOrder() {
        this.showOrder = true;
      },
      // 选中资金
      selCash(val) {
        this.cashInfo = {...val};
      },
      // 保留两位小数
      checkAmt(item, index) {
        let {discount = 0} = item;
        item.discount = Math.abs(toFixed(discount));
        item.thenAmntBal = Number(accSub(item.amntTbMatched, item.discount));
        this.$set(this.orderList,index,{...item})
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.formData = draft.formData;
        this.cashInfo = draft.cashInfo;
        this.orderList = draft.orderList;
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
