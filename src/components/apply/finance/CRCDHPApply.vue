<template>
  <div class="pages fgysqk-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 往来信息 -->
        <pop-dealer-list dealer-label-name="往来" request="2" :default-value="dealerInfo" @sel-item="selDealer">
          <template slot="other">
            <div class="amt-dealer">
              <span class="amt-dealer-item">本次收汇票: {{thenTotalAmntBal}}</span>
            </div>
          </template>
        </pop-dealer-list>

        <!-- 采购列表 -->
        <div class="materiel_list">
          <div class="order-info" @click="showOrder = true" v-if="!orderList.length">
            <div class="title">汇票明细</div>
            <div class="mode">请选择汇票明细</div>
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
              </div>
              <x-input text-align='right' placeholder='请填写' type='number' @on-blur="checkAmt(item, 'tdAmount')"
                       @on-focus="getFocus($event)" v-model.number='item.tdAmount'>
                <template slot="label">
                  <span class="required">金额</span>
                </template>
              </x-input>
              <datetime v-model='item.draftDate'>
                <template slot="title">
                  <span class='required'>出票日</span>
                </template>
              </datetime>
              <datetime v-model='item.draftDueDate'>
                <template slot="title">
                  <span class='required'>到期日</span>
                </template>
              </datetime>
              <datetime v-model='item.draftSellDate'>
                <template slot="title">
                  <span class='required'>出让日期</span>
                </template>
              </datetime>
              <x-input title="说明" text-align='right' placeholder='请填写' v-model='item.comment'></x-input>
            </div>
          </template>
        </div>
        <!-- 新增更多 按钮 -->
        <div class="handle_part vx-1px-t" v-if="orderList.length">
          <span class="add_more" v-if="orderList.length" @click="addOrder">新增更多</span>
        </div>

        <div class="materiel_list">
          <group title="其他信息" class="costGroup">
            <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
          </group>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!-- 采购单信息 -->
        <pop-money-order-list :show="showOrder" :default-value="orderList"
                              @sel-item="selOrder" v-model="showOrder"></pop-money-order-list>
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
    Cell, Group, XInput, Popup, XTextarea, PopupPicker, Datetime, dateFormat,
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  import {findProjectApproval} from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/finance/PopDealerList'
  import PopMoneyOrderList from 'components/Popup/finance/PopMoneyOrderList'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {accAdd, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'CRCDHP_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, Popup,
      XInput, XTextarea,
      PopupPicker, RPicker, PopBaseinfo,
      PopDealerList, PopMoneyOrderList, Datetime,
    },
    data() {
      return {
        listId: 'bb9ce973-2f62-4707-a54c-7e8605dc99d6',
        biReferenceId: '',
        selectedCost: [],
        costIndex: 0,
        transCode: '',
        formData: {
          biComment: ''
        },
        dealerInfo: {},
        showOrder: false,
        orderList: [],
      }
    },
    computed: {
      // 本次出让汇票
      thenTotalAmntBal() {
        let total = 0;
        this.orderList.forEach(item => {
          if (item.tdAmount) {
            total = accAdd(total, item.tdAmount);
          }
        });
        return toFixed(total)
      },
    },
    methods: {
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        let validateMap = [
          {
            key: 'draftNumber',
            message: '请选择协议号'
          }, {
            key: 'draftType',
            message: '请选择类型'
          }, {
            key: 'accepter',
            message: '请选择承兑人'
          }, {
            key: 'tdAmount',
            message: '请输入金额'
          }, {
            key: 'draftDate',
            message: '请选择出票日'
          }, {
            key: 'draftDueDate',
            message: '请选择到期日'
          }, {
            key: 'draftSellDate',
            message: '请选择出让日期'
          },
        ];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择往来';
        }
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
              tdId: item.tdId || '',
              draftNumber: item.draftNumber,
              draftType: item.draftType,
              accepter: item.accepter,
              tdAmount: item.tdAmount,
              draftDate: item.draftDate,
              draftDueDate: item.draftDueDate,
              draftSellDate: item.draftSellDate,
              comment: item.comment,
            });
            return !warn
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
                order: {
                  dealerName_dealerDebit: this.dealerInfo.nickname,
                  dealerDebit: this.dealerInfo.dealerCode,
                  drDealerLabel: this.dealerInfo.dealerLabelName,
                  thenAmntBal: this.dealerInfo.amntBal,
                  thenTotalAmntBal: this.thenTotalAmntBal,
                  dataSet,
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
          let {order = {}} = formData;
          let {dataSet = []} = order;
          this.dealerInfo = {
            nickname: order.dealerName_dealerDebit,
            dealerCode: order.dealerDebit,
            dealerLabelName: order.drDealerLabel,
            amntBal: order.thenAmntBal,
          };
          this.orderList = dataSet;
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
          }
        };
      },
      // TODO 获取关联数据
      getRelationData() {
      },
      // TODO 选中供应商
      selDealer(item) {
        this.dealerInfo = {...item};
      },
      // TODO 选中采购明细
      selOrder(val) {
        val.forEach(item => {
          item.hasOrigin = true; // 是否有原始的金额
          item.originAmt = item.tdAmount;
          item.draftDate = dateFormat(item.draftDate, 'YYYY-MM-DD');
          item.draftDueDate = dateFormat(item.draftDueDate, 'YYYY-MM-DD');
        });
        this.orderList = val;
      },
      // TODO 新增
      addOrder() {
        this.showOrder = true;
      },
      // TODO 保留两位小数
      checkAmt(item, key) {
        let {hasOrigin = false, originAmt = 0, tdAmount = 0} = item;
        if (hasOrigin && tdAmount > originAmt) {
          tdAmount = originAmt;
        }
        item.tdAmount = Math.abs(toFixed(tdAmount));
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.formData = draft.formData;
        this.dealerInfo = draft.dealerInfo;
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
