<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :statusData = "currentStage"></pop-baseinfo>
        <!-- <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker> -->
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" dealer-label-name="客户,原厂供应商,经销供应商,设施供应商,投资者,银行,其他"
                        dealerTitle="往来" :defaultValue="dealerInfo" :defaultContact="contact" :dealer-params="dealerParams">
        </pop-dealer-list>
        <!-- 收款信息 -->
        <div class="materiel_list" style=" margin-top:-0.2rem;">
          <group class='costGroup'>
            <div v-for="(item, index) in dealerConfig" :key='index'>
              <r-picker :title="item.fieldLabel" @on-change="changePayment" :data="item.remoteData" mode="3" placeholder="请选择" :value="dealerInfo.paymentTerm"
                  v-model="dealerInfo.paymentTerm" v-if = "item.fieldCode =='crDealerPaymentTerm' "></r-picker>
              <!-- <r-picker class="vux-1px-b"  @on-change="changePayment" :title="item.fieldLabel" :data="item.remoteData" 
              :value="dealerInfo.paymentTerm" v-model="dealerInfo.paymentTerm" v-if = "item.fieldCode =='crDealerPaymentTerm' "></r-picker> -->
              <cell :title="item.fieldLabel" :value="dealerInfo.amntBal" v-else-if="item.fieldCode =='thenTotalAmntBal'">
                <template slot="title">
                  <span class='default'>{{ item.fieldLabel }}</span>
                </template>
              </cell>
              <cell :title="item.fieldLabel" :value="totalAmount" v-else-if="item.fieldCode =='thenAlreadyAmnt'">
                <template slot="title">
                  <span class='required'>{{ item.fieldLabel }}</span>
                </template>
              </cell>
              <cell :title="item.fieldLabel" :value="differenceAmount" v-else-if="item.fieldCode =='differenceAmount'">
                <template slot="title">
                  <span class='default'>{{ item.fieldLabel }}</span>
                </template>
              </cell>
            </div>
          </group>
        </div>
        <!-- 费用列表 -->
        <div class="materiel_list" v-for="(item, index) in CostList" :key='index'>
          <group :title='`资金账户${index+1}`' class='costGroup'>
            <cell title="资金账户名称" v-model='item.cashName' is-link @click.native="getCost(index,item)">
              <template slot="title">
                <span class='required'>资金账户名称
                </span>
              </template>
            </cell>
            <!-- <cell title="费用编码" :value="item.expCode"></cell> -->
            <cell title="资金账户大类" :value="item.cashType_cashInCode">
              <template slot="title">
                <span class='required'>资金账户大类</span>
              </template>
            </cell>
            <cell title="余额" :value="item.thenAmntBal">
              <template slot="title">
                <span class='default'>余额</span>
              </template>
            </cell>
            <x-input title="收款金额" text-align='right' placeholder='请填写' @on-focus="getFocus($event)"
                     @on-blur="checkAmt(item)" type='number' v-model.number='item.tdAmount'>
              <template slot="label">
                <span class='required'>收款金额
                </span>
              </template>
            </x-input>
            <x-input title="手续费" text-align='right' placeholder='请填写' @on-focus="getFocus($event)"
                     @on-blur="checkAmt(item)" type='number' v-model.number='item.brokerage'>
              <template slot="label">
                <span class='default'>手续费
                </span>
              </template>
            </x-input>
            <x-input title="净收款金额" text-align='right'
                     @on-blur="checkAmt(item)" type='number' v-model.number='item.bookValue' disabled>
              <template slot="label">
                <span class='default'>净收款金额
                </span>
              </template>
            </x-input>
            <!-- <cell title="净收款金额" :value="item.bookValue">
              <template slot="title">
                <span class='default'>净收款金额</span>
              </template>
            </cell> -->
          </group>
        </div>
        <!-- 新增更多 按钮 -->
        <div class="add_more">
          您还需要添加新的资金账户?请点击
          <span class='add' @click="addCost">新增</span>
          <em v-show="CostList.length>1">或</em>
          <span class='delete' @click="deleteCost" v-show="CostList.length>1">删除</span>
        </div>
        <!-- 项目信息 -->
        <div class="project_part">
          <div v-for="(dItem,dIndex) in baseinfoExtConfig" :key="dIndex" class="project_part_content">
            <template v-if="!dItem.readOnly">
              <div class="each_info vux-1px-b" @click="showPop = true">
                <div class="title">{{dItem.fieldLabel}}</div>
                <div class="mode">
                  <span class="mode_content">{{project[dItem.fieldCode]}}</span>
                  <span class="icon-right"></span>
                </div>
              </div>
            </template>
            <!-- 可编辑的字段 -->
            <!-- <template v-if="!dItem.readOnly">
              <r-picker :title="dItem.fieldLabel" :data="dItem.remoteData" :value="project[dItem.fieldCode]"
                      v-model="project[dItem.fieldCode]" :required="!dItem.allowBlank"
                      v-if="dItem.xtype === 'r2Selector'"></r-picker>
            </template> -->
            <!--不可编辑的字段 -->
            <template  v-else>
              <div class='each_property vux-1px-t readOnly'>
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <span class='property_val'>{{project[dItem.fieldCode]}}</span>
              </div>
            </template>
          </div>
        </div>
        <div class="materiel_list">
          <group title="" class="costGroup">
            <x-textarea title="备注" v-model="formData.biComment" :max="100" class="fontSize"></x-textarea>
          </group>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!-- 费用popup -->
        <pop-fund-list :show="showCostPop" v-model="showCostPop" @sel-matter="selMatter" :defaultValue='selectedCost'
                       ref="matter"></pop-fund-list>
        <!-- 项目pop -->
        <div v-transfer-dom>
          <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
            <div class="trade_pop">
              <!-- <d-search @search="searchList" @turn-off="onHide"></d-search> -->
              <!-- 经理列表 -->
              <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                        :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
                <div v-for="(item, index) in baseinfoExtConfig" :key='index'>
                  <div class="pop-mater-list-item" v-for="(k, index) in item.remoteData" :key='index'>
                    <div class="pop-list-main " @click.stop="selThis(k, index)">
                      <div class="pop-list-info">
                        <!-- 名字 -->
                        <div class="user_name" >{{k.value}}</div>
                        <!-- 用户id -->
                        <div class="user_code">{{k.projectManagerName}}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </r-scroll>
            </div>
          </popup>
        </div>
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
  import { getSOList } from 'service/detailService'
  import { submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/commonService'
  import { findProjectApproval } from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'mixins/applyCommon'
  // 组件引入
  import PopFundList from 'components/Popup/PopFundList'
  import RPicker from 'components/public/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopDealerList from 'components/Popup/PopDealerList'
  import RScroll from 'plugins/scroll/RScroll'
  import DSearch from 'components/search/search'
  // 方法引入
  import { accAdd, accMul, accSub, accDiv } from 'plugins/calc/decimalsAdd'
  import { toFixed } from '@/plugins/calc'
  import { constants } from 'crypto';

  const DRAFT_KEY = 'SK_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, Popup,
      XInput, XTextarea,
      PopFundList, PopupPicker, RPicker, PopBaseinfo, PopDealerList,RScroll,DSearch
    },
    data () {
      return {
        listId: 'b6b97d33-5d8e-4942-b978-09103d06f188',
        biComment: '',
        biReferenceId: '',
        showCostPop: false,
        showPaymentTerm: false,
        CostList: [ // 费用列表
          {
            cashName: '', // 资金账户名称
            cashInCode: '', // 资金账户编码
            cashType_cashInCode: '', // 资金账户大类
            tdAmount: '', // 支付金额
            brokerage: '',
            bookValue: '',
          }
        ],
        selectedCost: [],
        costIndex: 0,
        transCode: '',
        dealerInfo: {},
        contact: {},
        formData: {
          biComment: '',
          biProcessStatus: ''
        },
        project: {},
        showPop: false,
        page: 1,
        limit: 50,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
      }
    },
    computed: {
      // 合计金额
      totalAmount () {
        let total = 0;
        this.dealerInfo.totalAmount = 0;
        this.CostList.forEach(item => {
          if (item.tdAmount) {
            total = accAdd(total, item.tdAmount);
          }
        });
        return total;
      },
      // 本次支付后余额
      differenceAmount() {
        let total = 0;
        if (this.dealerInfo.amntBal) {
          total = accAdd(this.totalAmount, this.dealerInfo.amntBal)
        }
        return toFixed(total);
      },
    },
    watch: {
      project: {
        handler(val) {
          // 修改项目名称，获取对应的项目类型
          if (val.project) {
            for (let item of this.baseinfoExtConfig) {
             if (item.fieldCode === 'project'){
               for (let dItem of item.remoteData){
                 if (dItem.name === val.project){
                    this.project.projectType_project = dItem.PROJECT_TYPE;
                    this.project.dealerName_projectManager = dItem.projectManagerName;
                    this.project.expectStartDate_project = dItem.expectStartDate;
                    this.project.expectEndDate_project = dItem.expectEndDate;
                    this.project.projectAddress_project = dItem.address;
                    this.project.budgetIncome_project = dItem.budgetIncome;
                    this.project.tdProjectId_project = dItem.projectApprovalId;
                    this.matterParams.data.project = dItem.projectApprovalId;
                    this.costList = [{}];
                    this.showPop = false;
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
      // 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            this.$refs.bScroll.refresh();
          }
        })
      },
      // 弹窗隐藏时调用
      onHide() {
        this.showPop = false;
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getlistUsers();
      },
      // 搜索 项目
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getlistUsers();
      },
       // 选择 项目
      selThis(sItem, sIndex) {
        this.project.project = sItem.name;
        this.project.projectType_project = sItem.projectType;
        this.project.dealerName_projectManager = sItem.projectManagerName;
        this.project.expectStartDate_project = sItem.expectStartDate;
        this.project.expectEndDate_project = sItem.expectEndDate;
        this.project.projectAddress_project = sItem.address;
        this.project.budgetIncome_project = sItem.budgetIncome;
        this.project.tdProjectId_project = sItem.projectApprovalId;
        this.isSetInitial = true;
        this.showPop = false;
        this.selItems = sItem;
      },
      // 请求 项目列表
      getlistUsers() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'nickname',
            }
          ];
        }
        ;
        return listUsers({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 选择 支付方式
      changePayment(val) {
        for(let i= 0; i < this.dealerConfig.length; i++) {
          if(this.dealerConfig[i].fieldCode == "crDealerPaymentTerm") {
            for(let k= 0; k < this.dealerConfig[i].remoteData.length; k++) {
              if(this.dealerConfig[i].remoteData[k].value == val) {
                this.dealerInfo.paymentTerm = this.dealerConfig[i].remoteData[k].name;
                break;
              }
            }
            break;
          }
        }
      },
      // 选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
      },
      selContact(val) {
        this.contact = {...val};
      },
      getCost (index, item) {
        this.showCostPop = true;
        this.costIndex = index;
        this.selectedCost = [item];
      },
      getPaymentTerm (index, item) {
        this.showPaymentTerm = true;
        //this.costIndex = index;
        //this.selectedCost = [item];
      },
      checkAmt(item) {
        item.tdAmount = Math.abs(toFixed(item.tdAmount)); 
        item.bookValue = toFixed(accSub(item.tdAmount,item.brokerage));
      },
      // 点击增加费用
      addCost () {
        this.expSubjectList = [];
        this.CostList.push({
          cashName: '', // 资金账户名称
          cashInCode: '', // 资金账户编码
          cashType_cashInCode: '', // 资金账户大类
          tdAmount: '', // 支付金额
          brokerage: '',
          bookValue: '',
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
        this.CostList[this.costIndex].cashInCode = sels.fundCode;
        this.CostList[this.costIndex].cashType_cashInCode = sels.fundType;
        this.CostList[this.costIndex].thenAmntBal = sels.thenAmntBal;
        this.CostList[this.costIndex].tdAmount = 0;
        this.CostList[this.costIndex].brokerage = 0;
        this.CostList[this.costIndex].bookValue = 0;
      },
      // 提交
      submitOrder () {
        let warn = '';
        let dataSet = [];
        this.CostList.every(item => {
          if (!item.cashName) {
            warn = '请选择资金账户';
            return false
          }
          if (!item.tdAmount) {
            warn = '请填写支付金额';
            return false
          }
          dataSet.push({
            tdId: item.tdId || '',
            cashInCode: item.cashInCode, // 费用编码
            cashType_cashInCode: item.cashType_cashInCode, // 费用科目
            thenAmntBal: item.thenAmntBal,
            tdAmount: item.tdAmount, // 报销金额
            brokerage: item.brokerage,
            bookValue: item.bookValue,
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
            let wfPara = {
              [this.processCode]: {businessKey: this.businessKey, createdBy: JSON.stringify(this.formData.handler), dealerCode:this.dealerInfo.dealerCode ,receiptType : '其他'}
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
                order: {
                  dealerCodeCredit: this.dealerInfo.dealerCode,
                  crDealerLabel: this.dealerInfo.dealerLabelName,
                  crDealerPaymentTerm: this.dealerInfo.paymentTerm,
                  thenTotalAmntBal: this.dealerInfo.amntBal,
                  thenAlreadyAmnt: this.totalAmount,
                  differenceAmount: this.differenceAmount,
                  receiptType: '其他',//收款类型
                  project: this.project.project,
                  tdProjectId_project: this.project.tdProjectId_project,
                  dealerName_projectManager: this.project.dealerName_projectManager,
                  expectStartDate_project: this.project.expectStartDate_project,
                  expectEndDate_project: this.project.expectEndDate_project,
                  projectAddress_project: this.project.projectAddress_project,
                  budgetIncome_project: this.project.budgetIncome_project,
                  dataSet:dataSet,
                },
                dealerCreditContactPersonName: this.contact.dealerName || null,
	              dealerCreditContactInformation: this.contact.dealerMobilePhone || null,
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
              cashName: item.fundName_cashInCode, // 费用名称
              cashInCode: item.cashInCode, // 费用编码
              cashType_cashInCode: item.cashType_cashInCode,
              tdAmount: item.tdAmount, // 报销金额
              tdId: item.tdId
            }
            this.CostList.push(obj);
          })
          // 往来信息
          this.dealerInfo = {
            creatorName: formData.dealerCreditContactPersonName,
            dealerMobilePhone: formData.dealerCreditContactInformation,
            dealerCode: formData.order.dealerCodeCredit,
            dealerLabelName: formData.order.crDealerLabel,
            dealerName: formData.order.dealerName_dealerCodeCredit,
            province: formData.order.province_dealerDebit,
            city: formData.order.city_dealerDebit,
            county: formData.order.county_dealerDebit,
            address: formData.order.address_dealerCodeCredit
          }
          this.contact = {
            dealerName: formData.dealerCreditContactPersonName,
            dealerMobilePhone: formData.dealerCreditContactInformation
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
            contact: this.contact,
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
        this.contact = draft.contact;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply.scss';
  @import '~@/scss/color';

  .costGroup {
    .vux-no-group-title {
      margin-top: 0.08rem;
    }
    .weui-cells:after {
      border-bottom: none;
    }
    .r-picker {
      width: 100%;
      padding: 10px 15px;
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
    .default {
      color: #696969;
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
  .fontSize {
    font-size: .14rem;
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
  .project_part {
    margin-bottom: .1rem;
    padding: 0 .15rem;
    background: #fff;
    color: #333;
    font-size: .14rem;
    .project_part_content {
      .each_info {
        height: .5rem;
        line-height: .5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .title {
          color: #696969;
          &.required {
            font-weight: bold;
            color: $main_color;
          }
        }
        .mode {
          display: flex;
          align-items: center;
          .icon-right {
            width: .08rem;
            height: .14rem;
            margin-left: .1rem;
          }
        }
      }
    }
  }
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      height: 100%;
      overflow: hidden;
      // 顶部
      .title {
        position: relative;
        margin: .08rem 0;
        font-size: .2rem;
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      // 列表容器
      .pop-list-container {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /deep/ .scroll-wrapper {
          padding: .05rem .15rem 0;
        }
        // 列表项
        .pop-mater-list-item {
          position: relative;
          display: flex;
          padding: .15rem;
          margin-bottom: .2rem;
          border-radius: .04rem;
          color: #333;
          box-sizing: border-box;
          border-radius: .04rem;
          box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
          &.selected {
            border: 1px solid $main_color;
          }
          // 列表主体
          .pop-list-main {
            flex: 1;
            box-sizing: border-box;
            display: flex;
            //头像
            .user-photo {
              width: .4rem;
              height: .4rem;
              margin-right: .12rem;
              img {
                border-radius: 50%;
                width: 100%;
                height: 100%;
              }
            }
            .user_name {
              line-height: .16rem;
              font-size: .16rem;
              font-weight: 600;
              margin-top: .04rem;
            }
            .user_code {
              margin-top: .06rem;
              line-height: .12rem;
              color: #999;
              font-size: .12rem;
            }
          }
        }
      }

    }
  }
</style>
