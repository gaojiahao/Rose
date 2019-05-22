<template>
  <div class="pages sj-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false" ref='baseChild' ></pop-baseinfo>
        <div class="project_part">
          <div :class="{'vux-1px-t': dIndex>0}" v-for="(dItem,dIndex) in baseinfoExtConfig" :key="dIndex">
            <!-- 可编辑的字段 -->
            <template v-if="!dItem.readOnly">
              <!-- 下拉框 -->
              <r-picker :title="dItem.fieldLabel" :data="dItem.remoteData" :value="project[dItem.fieldCode]"
                      v-model="project[dItem.fieldCode]" :required="!dItem.allowBlank"
                      v-if="dItem.xtype === 'r2Selector'"></r-picker>
            </template>
            <!--不可编辑的字段 -->
            <template  v-else>
              <div class='each_property readOnly'>
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <span class='property_val'>{{project[dItem.fieldCode]}}</span>
              </div>
            </template>
          </div>
        </div>
        <!-- 费用明细-->
        <div class="cost_list">
          <div class="cost_item" :class="{'has_border' : sIndex > 0}" v-for="(sItem, sIndex) in costList" :key="sIndex">
            <div class="cost_title vux-1px-b" v-show="costList.length > 1">
              <label>费用{{sIndex+1}}</label>
              <span class="iconfont icon-shanchu1" @click="deleteCost(sIndex)"></span>
            </div>
            <div v-for="(dItem,dIndex) in matterEditConfig.editPart" :key="dIndex" :class="{'vux-1px-b': dIndex < matterEditConfig.editPart.length-1}">
              <!-- 可编辑的字段 -->
              <template v-if="!dItem.readOnly">
                <!-- 下拉框Plus -->
                <div class='each_property' v-if="dItem.editorType === 'r2SelectorPlus'" @click="getCost(sItem,sIndex)">
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <div class='picker'>
                    <span class='mater_nature'>{{sItem[dItem.fieldCode] || "请选择"}}</span>
                    <span class='icon-right'></span>
                  </div>
                </div>
                <pop-fybx-list :show="showCostPop" v-model="showCostPop" @sel-matter="selMatter" :defaultValue='selectedCost'
                       :matter-params="glParams" ref="matter"></pop-fybx-list>
                <!-- 下拉框 -->
                <div class='each_property' v-if="dItem.editorType === 'r2Selector'" @click="getDep(sItem,sIndex)">
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <div class='picker'>
                    <span class='mater_nature'>{{sItem[dItem.fieldCode] || "请选择"}}</span>
                    <span class='icon-right'></span>
                  </div>
                </div>
                 <pop-department-list :show="showDepPop" v-model="showDepPop" @sel-dep="selDep" :defaultValue='selectedDep'
                       :dep-params="matterParams" ref="dep"></pop-department-list>
                <!-- 输入框（数字） -->
                <div class='each_property ' v-if="dItem.editorType === 'r2Numberfield'">
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <input type='number' v-model.number="sItem[dItem.fieldCode]" placeholder="请输入" class='property_val' 
                         @focus="getFocus($event)" @blur="checkAmt(sItem, dItem.fieldCode, sItem[dItem.fieldCode]) "/>
                </div>
                <!-- 输入框（文字） -->
                <div class='each_property' v-if="dItem.editorType === 'r2Textfield'">
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <input type='text' v-model="sItem[dItem.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
                </div>
                <!-- 日期 -->
                <div class='each_property' v-if="dItem.editorType === 'r2Datefield'" @click="getDate(sItem,dItem)">
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <div class='picker'>
                    <span class='mater_nature'>{{sItem[dItem.fieldCode] || "请选择"}}</span>
                    <span class='icon-right'></span>
                  </div>
                </div>
              </template>
              <!--不可编辑的字段 -->
              <template  v-else>
                <div class='each_property readOnly'>
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <span class='property_val'>{{sItem[dItem.fieldCode]}}</span>
                </div>
              </template>
            </div>
          </div>
          <div class="vux-1px-t" :class="[this.actions.includes('stop') ? 'resubmit-part' : 'sumbit-part']">
            <div class="add_more" @click="addCost">
              <span class="icon-add"></span>
              <span class="add_text">新增报销</span>
            </div>
            <span class="add_more stop" v-if="this.actions.includes('stop')" @click="stopOrder">终止提交</span>
          </div>
        </div>
        <!-- <pop-cost-list :show="showCostPop" v-model="showCostPop" @sel-matter="selMatter" :defaultValue='selectedCost'
                       :cost-params="matterParams" ref="matter"></pop-cost-list> -->
        <div class='comment'>
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" 
               @on-submit="submitOrder" ></op-button>
  </div>
</template>

<script>
  // vux组件引入
  import {Cell, Group, XInput, XTextarea} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask, updateData} from 'service/common/commonService'
  import {getEmployeeBal} from 'service/costService'
  // mixins 引入
  import common from 'mixins/applyCommon'
  // 组件引入
  import RPicker from 'components/public/basicPicker'
  import PopFundList from 'components/Popup/PopFundList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopFybxList from 'components/Popup/PopFybxList'
  import PopDepartmentList from 'components/Popup/PopDepartmentList'
  import OpButton from 'components/apply/commonPart/OpButton'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  import {accAdd, accSub} from 'plugins/calc/decimalsAdd'
  import { constants } from 'crypto';

  const DRAFT_KEY = 'BXYZF_DATA';
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
          tdAmount: 0, // 差异金额
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
        costList: [{}],
        depList: [{}],
        biReferenceId: '',
        showCostPop: false, // 费用的Pop
        showDepPop: false, // 组织的Pop
        selectedCost: [],
        selectedDep: [],
        costIndex: null,
        depIndex: null,
        showFundPop: false, // 账户的Pop
        selectedFund: [],
        project: {},
      }
    },
    components: {
      Cell, Group, XInput, XTextarea,
      RPicker, PopFundList, PopBaseinfo, PopFybxList, OpButton, PopDepartmentList
    },
    mixins: [common],
    computed: {
      departId() {
        return this.formData.handlerUnit;
      },
      creatorName() {
        return this.formData.handlerName
      },
      glParams() {
        return {
          groupId:  this.formData.handlerUnit,
          project:  this.project.tdProjectId_project
        }
      },
      // 本次报销与支付后余额
      differenceAmount() {
        let total = 0,
          subAmount = accSub(this.dealerInfo.thenAmntBal, this.dealerInfo.thenAlreadyAmnt);
        total = accAdd(subAmount, this.dealerInfo.thenTotalAmntBal);
        return toFixed(total);
      },
    },
    watch: {
      creatorName(newVal, oldVal) {
        if (oldVal){
          this.costList = [{}]
        }
        this.getEmployeeBal()
      },
      costList: {
        handler(val) {
          let total = 0;
          val.forEach(item => {
            if (item.tdAmount){
              item.taxAmount = 0;
              item.noTaxAmount = toFixed(accSub(item.tdAmount, item.taxAmount))
              total = accAdd(total, item.tdAmount)
            }  
          })
          this.tdAmount = toFixed(total)
          this.dealerInfo.thenAlreadyAmnt = toFixed(total);
          this.dealerInfo.thenTotalAmntBal = toFixed(total);
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
      },
      // 此处监听 经办组织id
      departId: {
        handler(newVal, oldVal){
          if (this.matterParams.data){
            this.matterParams.data.groupId = newVal;
          }
          if (oldVal){
            //this.costList = [{}]
            for(let i=0; i < this.costList.length; i++) {
              this.costList[i].departmentName =  this.$refs.baseChild.group || this.handlerDefault.handlerUnitName
            }
          }
          for(let i=0; i < this.costList.length; i++) {
            this.costList[i].departmentName =  this.$refs.baseChild.group || this.handlerDefault.handlerUnitName
          }
          this.matterParams.data.groupId = newVal;
        }     
      },
      project: {
        handler(newVal, oldVal) {
          // 修改项目名称，获取对应的项目类型
          if (newVal.project&&(newVal.project!=oldVal.project)&&(JSON.stringify(oldVal) !=='{}')) {
            for (let item of this.baseinfoExtConfig) {
             if (item.fieldCode === 'project'){
               for (let dItem of item.remoteData){
                 if (dItem.name === newVal.project){
                    this.project.projectType_project = dItem.PROJECT_TYPE;
                    this.project.dealerName_projectManager = dItem.projectManagerName;
                    this.project.expectStartDate_project = dItem.expectStartDate;
                    this.project.expectEndDate_project = dItem.expectEndDate;
                    this.project.projectAddress_project = dItem.address;
                    this.project.budgetIncome_project = dItem.budgetIncome;
                    this.project.tdProjectId_project = dItem.projectApprovalId;
                    this.matterParams.data.project = dItem.projectApprovalId;
                    this.costList = [{}];
                    for(let i=0; i < this.costList.length; i++) {
                      this.costList[i].departmentName =  this.$refs.baseChild.group || this.handlerDefault.handlerUnitName
                    }
                   break
                 }
               }
               break
             }
           }
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
            value: this.formData.handlerName,
            property: "nickname"
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
      // 点击增加费用
      addCost() {
        this.costList.push({departmentName :  this.$refs.baseChild.group || this.handlerDefault.handlerUnitName})
      },
      // 删除费用明细
      deleteCost(index) {
        this.costList.splice(index, 1);
      },
      getCost(item, index) {
        this.showCostPop = true;
        this.costIndex = index;
        if (!item.costName_expCode){
          this.selectedCost = [];
          return
        }
        this.selectedCost = [item];
      },
      getDep(item, index) {
        this.showDepPop = true;
        this.depIndex = index;
        // if (!item.costName_expCode){
        //   this.selectedCost = [];
        //   return
        // }
        this.selectedDep = [item];
      },
      // 选中费用
      selMatter(val) {
        this.selectedCost.push(val)
        let obj = {
          ...this.costList[this.costIndex],
          ...val,
          costName_expCode: val.costName,
          expCode: val.costCode,
          costType_expCode: val.costType,
          expSubject: val.costSubject
        }
        this.$set(this.costList, this.costIndex , {...obj})
      },
      // 选中组织
      selDep(val) {
        this.selectedDep.push(val)
        let obj = {
          departmentName: val.GROUP_NAME
        }
        this.$set(this.costList, this.depIndex , {...obj})
      },
      // 校验数字
      checkAmt(item, key, val) {
        item[key] = Math.abs(toFixed(val)); 
      },
      // 提交
      submitOrder() {
        /**
         * @warn 提示文字 
         * @dataSet 组装的提交的数据
         */
        let warn = '';
        let dataSet = [];
        for (let item of this.costList) {
          let oItem = {};
          for (let sItem of this.submitMatterField){
            if (!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]){
              warn = `${sItem.text}不为空`
              break;
            }
            if(sItem.fieldCode != 'project' && sItem.fieldCode != 'tdProjectId_project' && sItem.fieldCode != 'dealerName_projectManager' && sItem.fieldCode != 'expectStartDate_project' && 
               sItem.fieldCode != 'expectEndDate_project' && sItem.fieldCode != 'projectAddress_project' && sItem.fieldCode != 'budgetIncome_project') {
              oItem[sItem.fieldCode] = item[sItem.fieldCode] != null ? item[sItem.fieldCode] : null
            }
          }
          dataSet.push(oItem);
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
            let formData = {
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              inPut: {
                dataSet: [{
                  ...this.dealerInfo,
                  differenceAmount: this.differenceAmount,
                  tdId: this.dealerInfo.tdId || '',
                }]
              },
              order: {
                project: this.project.project,
                tdProjectId_project: this.project.tdProjectId_project,
                projectType_project: this.project.PROJECT_TYPE,
                dealerName_projectManager: this.project.dealerName_projectManager,
                expectStartDate_project: this.project.expectStartDate_project,
                expectEndDate_project: this.project.expectEndDate_project,
                projectAddress_project: this.project.projectAddress_project,
                budgetIncome_project: this.project.budgetIncome_project,
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
                  businessKey: this.businessKey,
                  createdBy: formData.creator,
                }
              }),
            };
            if (this.isResubmit && !this.isModify) {
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
            if (this.isModify) {
              operation = updateData;
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // 获取详情
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
          this.costList = [];
          order.dataSet.forEach(item => {
            this.costList.push({
              ...item,
              tdId: item.tdId,
              costName: item.costName_expCode, // 费用名称
              costCode: item.expCode, // 费用编码
              costSubject: item.expSubject, // 费用科目
              costType: item.costType_expCode, // 费用类型
            })
          })
          if (this.matterParams.data && this.matterParams.data.groupId != null) {
            this.matterParams.data.groupId = this.formData.handlerUnit;
          }
          this.project = {
            project: order.project,
            projectType_project: order.projectType_project,
            dealerName_projectManager: order.dealerName_projectManager,
            expectStartDate_project: order.departmentName,
            expectEndDate_project: order.expectEndDate_project,
            projectAddress_project: order.expectStartDate_project,
            budgetIncome_project: order.projectAddress_project
          }
          this.biReferenceId = formData.biReferenceId;
          this.$loading.hide();
        })
      },
      // 是否保存草稿
      hasDraftData() {
        return {
          [DRAFT_KEY]: {
            dealerInfo: this.dealerInfo,
            cashInfo: this.cashInfo,
            costList: this.costList,
            formData: this.formData,
            project: this.project
          }
        };
      },
      // 选择日期
      getDate(sItem, dItem){
        this.$vux.datetime.show({
          value: '', // 其他参数同 props
          confirmText: '确认',
          cancelText: '取消',
          onConfirm: (val)=> {
            if (sItem[dItem.fieldCode] == null){
              this.$set(sItem, dItem.fieldCode, val)
              return
            }
            sItem[dItem.fieldCode] = val;
          },
        })
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
        this.costList = draft.costList;
        this.project = draft.project;
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply.scss';
  .vux-1px-b:after{
    border-color: #e8e8e8;
  }
  
  .cost_list{
    margin-top: .1rem;
    input {
      border: none;
      outline: none;
      font-size: .14rem;
    }
    .cost_item {
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
   // 新增更多
  .sumbit-part {
    width: 100%;
    display: flex;
    text-align: center;
    position: relative;
    background: #fff;
    .add_more {
      display: flex;
      color: #3296FA;
      font-weight: bold;
      text-align: center;
      align-items: center;
      margin: .1rem auto;
      // margin: 0 auto .2rem;
      border-radius: .15rem;
      padding: .06rem .08rem;
      border: 1px solid #3296FA;
      .icon-add {
        width: .14rem;
        height: .14rem;
        box-sizing: border-box;
        margin: .015rem .05rem 0 0;
      }
      .add_text {
        font-size: .12rem;
        line-height: .12rem;
      }
    }
    .symbol {
      left: 50%;
      bottom: 25%;
      color: #757575;
      font-size: .12rem;
      position: absolute;
      transform: translate(-50%, 0);
    }
    .native {
      margin-right: .24rem;
      background: #ea5455;
      box-shadow: 0 2px 5px #ea5455;
    }

  }
  .resubmit-part {
    display: flex;
    padding: .1rem .15rem;
    background: #fff;
    font-size: .12rem;
    text-align: center;
    position: relative;
    justify-content: flex-end;
    .add_more {
      color: #FFF;
      font-weight: bold;
      text-align: center;
      background: #3296FA;
      border-radius: .04rem;
      padding: .08rem .04rem;
      &.stop {
        color: #a1a1a1;
        background: #dfdfdf;
      }
      & + .add_more {
        margin-left: .1rem;
      }
    }
  }

</style>
