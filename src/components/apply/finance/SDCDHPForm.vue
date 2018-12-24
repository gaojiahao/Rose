<template>
  <div class="pages fgysqk-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 往来信息 -->
        <pop-dealer-list dealer-label-name="往来" request="3" :default-value="dealerInfo" :params="dealerParams"
                         @sel-item="selDealer">
          <template slot="other">
            <div class="amt-dealer">
              <span class="amt-dealer-item">本次收汇票: {{thenTotalAmntBal | numberComma(3)}}</span>
            </div>
          </template>
        </pop-dealer-list>

        <!-- 采购列表 -->
        <div class="materiel_list">
          <div class="title">汇票明细</div>
          <div class="order-detail" :class="{'vux-1px-t': index !== 0}" v-for="(item, index) in orderList"
               :key="index">
            <x-input text-align='right' placeholder='请填写' v-model='item.draftNumber'>
              <template slot="label">
                <span class="required">汇票号</span>
              </template>
            </x-input>
            <r-picker class="vux-1px-t" title="类型" :data="draftTypeList" mode="4" placeholder="请选择类型" :hasBorder="false"
                      v-model="item.draftType" required></r-picker>
            <x-input text-align='right' placeholder='请填写' v-model='item.accepter'>
              <template slot="label">
                <span class="required">承兑人</span>
              </template>
            </x-input>
            <x-input text-align='right' placeholder='请填写' type='number' @on-blur="checkAmt(item, 'tdAmount')"
                     @on-focus="getFocus($event)" v-model.number='item.tdAmount'>
              <template slot="label">
                <span class="required">金额</span>
              </template>
            </x-input>
            <datetime v-model='item.draftDate' placeholder="请选择出票日">
              <template slot="title">
                <span class='required'>出票日</span>
              </template>
            </datetime>
            <datetime v-model='item.draftDueDate' placeholder="请选择到期日">
              <template slot="title">
                <span class='required'>到期日</span>
              </template>
            </datetime>
            <x-input title="说明" text-align='right' placeholder='请填写' v-model='item.comment'></x-input>
          </div>
        </div>
        <!-- 新增更多 按钮 -->
        <div class="add_more">
          您还需要添加新的汇票?请点击
          <span class='add' @click="addOrder">新增</span>
          <em v-show="orderList.length>1">或</em>
          <span class='delete' @click="deleteOrder" v-show="orderList.length>1">删除</span>
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

  const DRAFT_KEY = 'SDCDHP_DATA';
  const MONEY_ORDER = {
    draftNumber: '',
    draftType: '',
    accepter: '',
    tdAmount: '',
    draftDate: '',
    draftDueDate: '',
    comment: '',
  };
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
        listId: '1745ffdd-1b6a-4fe5-9c5b-6e5394bd4faf',
        biReferenceId: '',
        selectedCost: [],
        costIndex: 0,
        transCode: '',
        formData: {
          biComment: ''
        },
        dealerInfo: {},
        showOrder: false,
        orderList: [{...MONEY_ORDER}],
        dealerParams: {
          dealerLabelName: '客户'
        },
        draftTypeList: ['银行承兑', '商业承兑'],
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
            message: '请输入汇票号'
          }, {
            key: 'draftType',
            message: '请选择类型'
          }, {
            key: 'accepter',
            message: '请输入承兑人'
          }, {
            key: 'tdAmount',
            message: '请输入金额'
          }, {
            key: 'draftDate',
            message: '请选择出票日'
          }, {
            key: 'draftDueDate',
            message: '请选择到期日'
          },
        ];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择往来';
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
              [this.processCode]: {businessKey: "RAAB", createdBy: JSON.stringify(this.formData.handler)}
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
                  dealerName_dealerCodeCredit: this.dealerInfo.dealerName,
                  dealerCodeCredit: this.dealerInfo.dealerCode,
                  crDealerLabel: this.dealerInfo.dealerLabelName,
                  thenAmntBalCopy2: this.dealerInfo.amntBal,
                  thenAlreadyAmnt: this.thenTotalAmntBal,
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
            dealerName: order.dealerName_dealerCodeCredit,
            dealerCode: order.dealerCodeCredit,
            dealerLabelName: order.crDealerLabel,
            amntBal: order.thenAmntBalCopy2,
            thenTotalAmntBal: order.thenAlreadyAmnt,
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
          item.draftDate = dateFormat(item.draftDate, 'YYYY-MM-DD');
          item.draftDueDate = dateFormat(item.draftDueDate, 'YYYY-MM-DD');
        });
        this.orderList = val;
      },
      // TODO 新增
      addOrder() {
        this.orderList.push({...MONEY_ORDER});
      },
      // TODO 删除
      deleteOrder() {
        this.orderList.pop();
      },
      // TODO 保留两位小数
      checkAmt(item, key) {
        switch (item) {
          case 'tdAmountCopy1':
            this.dealerInfo.tdAmountCopy1 = toFixed(this.dealerInfo.tdAmountCopy1);
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

  .order-detail {
    margin-bottom: .1rem;
    &:first-child {
      padding-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
    /deep/ .r-picker.r-picker-4 {
      padding: .05rem 0;
      .mode {
        padding-right: .2rem;
      }
      .r_arrow {
        right: 0;
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
