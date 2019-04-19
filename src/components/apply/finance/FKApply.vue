<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :statusData = "currentStage" ref='base'></pop-baseinfo>
        <!-- <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker> -->
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" dealer-label-name="客户,原厂供应商,经销供应商,设施供应商,员工"
                          dealerTitle="往来" :defaultValue="dealerInfo" :defaultContact="contactInfo" :dealer-params="dealerParams" :jineData = "this.dealerConfig" ref='dlist'>
        </pop-dealer-list>
        <!-- 费用列表 -->
        <div  v-if = 'this.submitMatterField.length != 0 '>
          <div class="materiel_list" v-for="(item, index) in CostList" :key='index'>
            <group :title='`资金账户${index+1}`' class='costGroup'>
              <cell title="资金账户名称" v-model='item.cashName' is-link @click.native="getCost(index,item)">
                <template slot="title">
                  <span class='required'>资金账户名称
                  </span>
                </template>
              </cell>
              <!-- <cell title="费用编码" :value="item.expCode"></cell> -->
              <cell title="资金账户大类" :value="item.cashType_cashOutCode">
                <template slot="title">
                  <span class='required'>资金账户大类</span>
                </template>
              </cell>
              <cell title="账户余额" :value="item.thenAmntBal">
                <template slot="title">
                  <span class='required'>账户余额</span>
                </template>
              </cell>
              <x-input title="支付金额" text-align='right' placeholder='请填写' @on-focus="getFocus($event)"
                      @on-blur="checkAmt(item)" type='number' v-model.number='item.tdAmount'>
                <template slot="label">
                  <span class='required'>支付金额
                  </span>
                </template>
              </x-input>
            </group>
          </div>
          <!-- 新增更多 按钮 -->
          <div class="add_more">
            您还需要添加新的资金账户?请点击
            <span class='add' @click="addCost">新增</span>
            <em v-show="CostList.length>1">或</em>
            <span class='delete' @click="deleteCost" v-show="CostList.length>1">删除</span>
          </div>
        </div>
        <div class="materiel_list">
          <group title="其他信息" class="costGroup">
            <x-textarea title="备注" v-model="formData.biComment" :max="100" class="fontSize"></x-textarea>
          </group>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!-- 费用popup -->
        <pop-fund-list :show="showCostPop" v-model="showCostPop" @sel-matter="selMatter" :defaultValue='selectedCost'
                       ref="matter"></pop-fund-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}">
      <span class="count_num">
        <!-- <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}} -->
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
  import { getSOList } from 'service/detailService'
  import { submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/common/commonService'
  import { findProjectApproval } from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'mixins/applyCommon'
  // 组件引入
  import PopFundList from 'components/Popup/PopFundList'
  import RPicker from 'components/public/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopDealerList from 'components/Popup/PopDealerList'
  // 方法引入
  import { accAdd, accMul, accSub, accDiv } from 'plugins/calc/decimalsAdd'
  import { toFixed } from '@/plugins/calc'
import { constants } from 'crypto';

  const DRAFT_KEY = 'FK_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, Popup,
      XInput, XTextarea,
      PopFundList, PopupPicker, RPicker, PopBaseinfo, PopDealerList
    },
    data () {
      return {
        listId: '1972f3a4-b29a-4a0e-90a8-85090c0e2d28',
        biComment: '',
        biReferenceId: '',
        showCostPop: false,
        CostList: [ // 费用列表
          {
            cashName: '', // 资金账户名称
            cashOutCode: '', // 资金账户编码
            cashType_cashOutCode: '', // 资金账户大类
            tdAmount: '', // 支付金额
            thenAmntBal: '', //账号余额
          }
        ],
        selectedCost: [],
        costIndex: 0,
        dealer: {},
        transCode: '',
        dealerInfo: {},
        contactInfo: {},
        jineData: {},
        formData: {
          biComment: '',
          biProcessStatus: ''
        },
      }
    },
    computed: {
      // 合计金额
      totalAmount () {
        let total = 0;
        this.CostList.forEach(item => {
          if (item.tdAmount) {
            total = accAdd(total, item.tdAmount);
          }
        });
        return total;
      }
    },
    methods: {
      // 选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
      },
      selContact(val) {
        this.contactInfo = {...val};
      },
      getCost (index, item) {
        this.showCostPop = true;
        this.costIndex = index;
        this.selectedCost = [item];
      },
      // 点击增加费用
      addCost () {
        this.expSubjectList = [];
        this.CostList.push({
          cashName: '', // 资金账户名称
          cashOutCode: '', // 资金账户编码
          cashType_cashOutCode: '', // 资金账户大类
          tdAmount: '', // 支付金额
          thenAmntBal : '' //账号余额
        })
      },
      // 删除费用明细
      deleteCost () {
        this.CostList.pop();
      },
      // 选中费用
      selMatter (val) {
        let sels = val;
        this.CostList[this.costIndex].cashName = sels.fundName;
        this.CostList[this.costIndex].cashOutCode = sels.fundCode;
        this.CostList[this.costIndex].cashType_cashOutCode = sels.fundType;
        this.CostList[this.costIndex].thenAmntBal = sels.thenAmntBal;
      },
      // 提交
      submitOrder () {
        let warn = '';
        let dataSet = [];
        let dataSet2 = [];
        //取申请金额       
        for(let i = 0; this.$refs.dlist.jineData[i]; i++){
          if(this.$refs.dlist.jineData[i].fieldCode == 'applicationAmount') {
            this.dealerInfo.applicationAmount = this.$refs.dlist.jineData[i].applicationAmount
            break;
          }
        };
        console.log('this.dealerInfo',this.dealerInfo);
        if(!this.dealerInfo.dealerCode) {
          warn = '请选择往来列表';
          if (warn) {
            this.$vux.alert.show({
              content: warn,
            });
            return
          }
        }
        if(!this.dealerInfo.applicationAmount) {
          warn = '请填写申请金额';
          if (warn) {
            this.$vux.alert.show({
              content: warn,
            });
            return
          }
        }
        dataSet2.push({
          dealerDebit: this.dealerInfo.dealerCode,
          drDealerLabel: this.dealerInfo.dealerLabelName,
          thenTotalAmntBal: this.dealerInfo.amntBal,
          applicationAmount: this.dealerInfo.applicationAmount,
          thenAlreadyAmnt: '',
          differenceAmount: this.dealerInfo.amntBal,  
        });
        dataSet.push({
          cashOutCode: '', // 费用编码
          cashType_cashOutCode: '', // 费用科目
          dealerDebit: this.dealerInfo.dealerCode,
          drDealerLabel: this.dealerInfo.dealerLabelName,
          thenAmntBal: '',
          tdAmount: '', 
        });
        // this.CostList.every(item => {
        //   if (!item.cashName) {
        //     warn = '请选择资金账户';
        //     return false
        //   }
        //   if (!item.tdAmount) {
        //     warn = '请填写支付金额';
        //     return false
        //   }
        //   dataSet.push({
        //     tdId: item.tdId || '',
        //     cashOutCode: item.cashOutCode, // 费用编码
        //     cashType_cashOutCode: item.cashType_cashOutCode, // 费用科目
        //     tdAmount: item.tdAmount, // 报销金额
        //     dealerDebit: this.dealerInfo.dealerCode,
        //     drDealerLabel: this.dealerInfo.dealerLabelName,
        //     thenAmntBal: '',
        //     tdAmount: '', 
        //   });
        //   return true
        // });
        // if (warn) {
        //   this.$vux.alert.show({
        //     content: warn,
        //   });
        //   return
        // }
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
            console.log(this.dealerInfo)
            this.formData.biProcessStatus = this.$refs.base.biProcessStatus;
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                handlerEntity: this.entity.dealerName,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                order: {
                  dataSet
                },
                outPut: {
                  dataSet: dataSet2
                },
                dealerDebitContactPersonName: this.contactInfo.dealerName || null,
	              dealerDebitContactInformation: this.contactInfo.dealerMobilePhone || null,
              }),
              wfPara: JSON.stringify(wfPara)
            };
            console.log('submitData',submitData);
            
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
      getFormData () {
        return getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.attachment = data.attachment;
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          this.CostList = [];
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
          // 费用明细
          formData.order.dataSet.forEach(item => {
            let obj = {
              cashName: item.fundName_cashOutCode, // 费用名称
              cashOutCode: item.cashOutCode, // 费用编码
              cashType_cashOutCode: item.cashType_cashOutCode,
              tdAmount: item.tdAmount, // 报销金额
              tdId: item.tdId
            }
            this.CostList.push(obj);
          })
          // 往来信息
          this.dealerInfo = {
            creatorName: formData.dealerDebitContactPersonName,
            dealerMobilePhone: formData.dealerDebitContactInformation,
            dealerCode: formData.order.dealerDebit,
            dealerLabelName: formData.order.drDealerLabel,
            dealerName: formData.order.dealerName_dealerDebit,
            province: formData.order.province_dealerDebit,
            city: formData.order.city_dealerDebit,
            county: formData.order.county_dealerDebit,
            address: formData.order.address_dealerDebit
          }
          this.contactInfo = {
            dealerName: formData.dealerDebitContactPersonName,
            dealerMobilePhone: formData.dealerDebitContactInformation
          }
          this.$loading.hide();
          // this.$emit('input', false);
        })
      },
      // 保存草稿数据
      hasDraftData () {
        let isSave = false;
        this.CostList.forEach(item=> {
          if (item.cashName){
            isSave = true;
            return false;
          }
        })
        if (!isSave){
          return false;
        }
        return {
          [DRAFT_KEY]: {
            cost: this.CostList,
            formData: this.formData,
            dealerInfo: this.dealerInfo,
            contactInfo: this.contactInfo,
          }
        };
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.CostList = draft.cost;
        this.formData = draft.formData;
        this.dealerInfo = draft.dealerInfo;
        this.contactInfo = draft.contactInfo;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply.scss';

  .costGroup {
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
    // .weui-cell {
    //   padding: 10px 0;
    //   &:before {
    //     left: 0;
    //   }
    // }
    .required {
      font-size: .14rem;
    }
    .fontSize {
      font-size: .14rem;
    }
  }

  .weui-cells__title {
    padding-left: 0;
    font-size: 0.12rem;
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
