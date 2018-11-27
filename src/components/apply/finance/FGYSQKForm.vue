<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 往来信息 -->
        <pop-dealer-list :default-value="dealerInfo" @sel-item="selDealer"></pop-dealer-list>
        <!-- 资金信息 -->
        <pop-cash-list :default-value="cashInfo" @sel-item="selCash"></pop-cash-list>
        <!-- 费用列表 -->

        <div class="materiel_list">
          <div class="order-info" @click="showOrder = true" v-if="!orderList.length">
            <div class="title">采购明细</div>
            <div class="mode">请选择采购明细</div>
            <span class="iconfont icon-youjiantou r-arrow"></span>
          </div>
          <template v-else>
            <div class="title">采购明细</div>
            <div class="order-detail" v-for="(item, index) in orderList" :key="index">
              <div class="detail-item top">
                <span class="info-item">{{item.popiCode}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">采购订单号: {{item.poCode}}</span>
                <span class="info-item">价税合计: {{item.thenTotalAmntBal}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">已核销: {{item.thenAlreadyAmnt}}</span>
                <span class="info-item">待核销: {{item.thenAmntBal}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item" v-if="item.accountExpirationDate || item.accountExpirationDate === 0">账期到期日: {{item.accountExpirationDate}}</span>
                <span class="info-item"
                      v-if="item.daysOfAccount || item.daysOfAccount === 0">账期天数: {{item.daysOfAccount}}</span>
                <span class="info-item" v-if="item.ageOfAging || item.ageOfAging === 0">账龄天数: {{item.ageOfAging}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item" v-if="item.accountRemaingDays || item.accountRemaingDays === 0">账期剩余天数: {{item.accountRemaingDays}}</span>
                <span class="info-item">已收票: {{item.invoicing}}</span>
                <span class="info-item">待收票: {{item.invoiced}}</span>
              </div>
              <x-input class="" title="本次申请支付" text-align='right' placeholder='请填写' @on-blur="checkAmt(item)"
                       type='number'
                       v-model.number='item.applicationAmount'></x-input>
              <x-input title="本次支付" text-align='right' placeholder='请填写' @on-blur="checkAmt(item)" type='number'
                       v-model.number='item.tdAmount'></x-input>
              <cell title="本次支付后余额" :value="item.differenceAmount"></cell>
            </div>
          </template>
        </div>
        <!-- 新增更多 按钮 -->
        <div class="handle_part vx-1px-t" v-if="orderList.length">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
          <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
          <span class="add_more" v-if="orderList.length" @click="addOrder">新增更多</span>
        </div>
        <div class="materiel_list">
          <group title="其他信息" class="costGroup">
            <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
          </group>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
        <!-- 采购单信息 -->
        <pop-order-list :show="showOrder" :params="dealerParams" :default-value="orderList"
                        @sel-item="selOrder" v-model="showOrder"></pop-order-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}}
      </span>
      <span class="count_btn stop" @click="stopOrder"
            v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn" @click="submitOrder">提交</span>
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
  import PopOrderList from 'components/Popup/finance/PopOrderList'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {accAdd} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

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
        biComment: '',
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
      // 合计金额
      totalAmount() {
        let total = 0;
        this.orderList.forEach(item => {
          if (item.tdAmount) {
            total = accAdd(total, item.tdAmount);
          }
        });
        return total;
      },

      applicationAmount() {
        return 0
      },
      tdAmountCopy1() {
        return 0
      },
      differenceAmount() {
        return 0
      },
    },
    methods: {
      getOrder(index, item) {
        this.showOrder = true;
        this.costIndex = index;
        this.selectedCost = [item];
      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.orderList.length) {
          warn = '请选择采购订单'
        }
        this.orderList.every(item => {
          if (!item.popiCode) {
            warn = '请选择费用名称';
            return false
          }
          let sItem = {
            tdId: item.tdId || '',
            ...item,
            pendingTicket: item.invoiced,
            invoiced: item.invoicing,
          };
          dataSet.push(sItem);
          return true
        });
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择项目';
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
              [this.processCode]: {businessKey: "FGQK", createdBy: JSON.stringify(this.formData.handler)}
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
                inPut: {
                  dataSet: [{
                    dealerName_dealerDebit: this.dealerInfo.nickname,
                    dealerDebit: this.dealerInfo.dealerCode,
                    drDealerLabel: this.dealerInfo.dealerLabelName,
                    thenAmntBalCopy1: this.dealerInfo.amntBal,
                    applicationAmount: this.applicationAmount,
                    tdAmountCopy1: this.tdAmountCopy1,
                    differenceAmount: this.differenceAmount,
                  }],
                },
                order: {
                  dataSet
                },
                outPut: {
                  dataSet: [{
                    fundName_cashOutCode: this.cashInfo.fundName,
                    cashOutCode: this.cashInfo.fundCode,
                    cashType_cashOutCode: this.cashInfo.fundType,
                    thenAmntBal: this.cashInfo.thenAmntBal,
                    tdAmount: this.cashInfo.tdAmount,
                  }],
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
          this.attachment = data.attachment;
          this.listId = data.listId;
          console.log(data);
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          let {formData} = data;
          // 基本信息
          this.formData = {
            ...this.formData,
            creator: formData.creator,
            modifer: formData.modifer,
            biComment: formData.biComment,
          };
          // 费用明细
          formData.order.dataSet.forEach(item => {
            let obj = {
              tdId: item.tdId || '',
            }
          });
          this.$loading.hide();
          // this.$emit('input', false);
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
        this.orderList = JSON.parse(val);
      },
      // TODO 选中资金
      selCash(val) {
        this.cashInfo = {...val};
      },
      // TODO 新增
      addOrder() {
        this.showOrder = true;
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.formData = draft.formData;
        this.dealerInfo = draft.dealerInfo;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply.scss';

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
    width: 100%;
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
      padding: .05rem 0;
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
