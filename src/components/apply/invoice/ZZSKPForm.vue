<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo"></pop-dealer-list>
        <!--发票信息-->
        <div class="materiel_list">
          <div class="title">发票信息</div>
          <group class="SJ_group" @group-title-margin-top="0">
            <x-input title="票号" v-model="invoiceInfo.ticketNumber" text-align="right" placeholder="请填写" @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>票号</span>
              </template>
            </x-input>
            <popup-picker title="发票类型" :data="invoiceType" v-model="invoiceGetType"
                          @on-change=" typeTask($event) " text-align="right" placeholder="请选择">
              <template slot="title">
                <span class='required'>发票类型</span>
              </template>
            </popup-picker>
            <x-input title="发票金额" v-model="invoiceInfo.invoiceAmount" text-align="right" placeholder="请填写" @on-focus="getFocus($event)"></x-input>
            <datetime title="发票日期" v-model='invoiceInfo.invoiceDate' text-align="right" placeholder="请选择">
              <template slot="title">
                <span class='required'>发票日期</span>
              </template>
            </datetime>
          </group>
        </div>
        <!-- 任务计划列表 -->
        <div class="materiel_list" v-for="(item,index) in invoiceList" :key="index">
          <div class="title">开票明细</div>
          <group class='costGroup' @group-title-margin-top="0">
            <cell title="实例编码" v-model='item.transMatchedCode' is-link @click.native="getCost(index,item)" placeholder="请选择">
              <template slot="title">
                <span class='required'>实例编码
                </span>
              </template>
            </cell>
            <cell title="待开票金额" v-model='item.thenAmntBal'></cell>
            <x-input title="本次开票金额" text-align='right' placeholder='请填写' type='number' v-model.number='item.tdAmount'
                     @on-blur="checkAmt(item)" @on-focus="getFocus($event)" >
              <template slot="label">
                <span class='required'>本次开票金额
                </span>
              </template>
            </x-input>
            <x-input type="text" title="说明" text-align='right' placeholder='请填写'v-model="item.comment"></x-input>
          </group>
        </div>
        <!-- 新增 -->
        <div class="XMJH_add">
          <div>您还需要添加新的明细? 请点击
            <span @click="addInvoice">添加</span>
            <em v-if="invoiceList.length>1">或</em>
            <span @click="deleteInvoice" v-if="invoiceList.length>1"> 删除</span>
          </div>
        </div>
        <!--开票列表-->
        <pop-invoice-list :show="showInvoicePop" v-model="showInvoicePop" @sel-matter="selInvoice" :defaultValue='seletedInvoice'
                          :params="dealerParams" ref="matter"></pop-invoice-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t' :class="{btn_hide : btnIsHide}">
      <div class="cfm_btn" @click="submitOrder">提交</div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {
    Cell, Group, XInput,dateFormat,
    XTextarea, Datetime, PopupPicker
  } from 'vux'
  // 请求 引入
 import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
 import {getSOList} from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
 import PopDealerList from 'components/Popup/PopDealerList'
 import PopInvoiceList from 'components/Popup/PopInvoiceList'
  // 方法引入
  import {toFixed} from '@/plugins/calc'

  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, XInput,
      Datetime, XTextarea, PopDealerList, PopupPicker,PopInvoiceList
    },
    data() {
      return {
        listId: '1aba0d26-a479-47f7-b755-03f5036dee98',
        dealerInfo: {}, //客户信息
        invoiceType: [['普通发票', '专用发票']],
        invoiceGetType: [],
        invoiceInfo: {
          ticketNumber: '',//票号
          invoiceType: '',//发票类型
          invoiceAmount: '',//发票金额
          invoiceDate: '',//发票日期
          invoiceContent: '',//发票内容
        },
        invoicePlan: [],
        dealerParams:{ //
          dealerCode : ''
        },
        invoiceList : [
          {
            comment: "" ,//说明
            thenAmntBal: "",//代开票金额
            tdAmount : '' ,//本次开票金额
            transMatchedCode: "请选择",//实例编码
            
          }
        ],
        showInvoicePop : false,
        seletedIndex :0,
        seletedInvoice : [],
        formData: {},
        formDataComment: '',//备注
        projectName: '', // 项目名称
      }
    },
    watch:{
      invoiceList:{
        handler(val){
          let data = {
            ZZSKP_DATA : {
              invoice : {
                dealer : this.dealerInfo,
                invoiceInfo : this.invoiceInfo,
                list : this.invoiceList
              }
            }
          }
          this.$emit('sel-data',data);
        },
        deep:true
      }
    },    
    methods: {
      //选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.dealerParams.dealerCode = this.dealerInfo.dealerCode;
      },
      //发票类型选择
      typeTask(e) {
        this.invoiceInfo.invoiceType = e[0];
      },
      //展示实例列表
      getCost(index,item){
        this.showInvoicePop = true;
        this.seletedIndex = index;
        this.seletedInvoice = [];
        this.invoiceList.forEach(item=>{
          this.seletedInvoice.push(item);
        })
      },
      // TODO 点击增加明细
      addInvoice() {
        this.invoiceList.push({
          comment: "" ,//说明
          thenAmntBal: "",//代开票金额
          tdAmount : '' ,//本次开票金额
          transMatchedCode: "",//实例编码
        })
      },
      //删除明细
      deleteInvoice(){
        this.invoiceList.pop();
      },
      // TODO 选中费用
      selInvoice(val) {
        let sels = val;
        this.invoiceList[this.seletedIndex].transMatchedCode = sels.transCode;
        this.invoiceList[this.seletedIndex].thenAmntBal = sels.amntBal;
      },
      //检验金额
      checkAmt(item){
        if(item.tdAmount > item.thenAmntBal){
          item.tdAmount = item.thenAmntBal;
        }
        item.tdAmount = Math.abs(toFixed(item.tdAmount));
      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择客户信息';
        }
        let objArr = [
          {tip: 'ticketNumber', msg: '请输入票号'},
          {tip: 'invoiceType', msg: '请选择发票类型'},
          {tip: 'invoiceDate', msg: '请选择发票日期'},
        ];
        if(!warn){
          objArr.every(item=>{
            if(!this.invoiceInfo[item.tip]){
              warn = item.msg;
              return false;
            }
            return true
          })
        }
        if(!warn){
          this.invoiceList.every(item => {
            if(!item.transMatchedCode){
              warn = '请选择实例';
              return false
            }
            if(!item.tdAmount){
              warn = '请输入本次开票金额';
              return false
            }
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
              [this.processCode]: {businessKey: "VATO", createdBy: JSON.stringify(this.formData.handler)}
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
                  crDealerLabel: '客户',                               
                  dealerCodeCredit : this.dealerInfo.dealerCode,
                  dataSet : this.invoiceList
                },
                dealerCreditContactPersonName: null,
                dealerCreditContactInformation: "",
                invoiceDate: this.invoiceInfo.invoiceDate,
                ticketNumber: this.invoiceInfo.ticketNumber,
                invoiceType: this.invoiceInfo.invoiceType,
                invoiceAmount: this.invoiceInfo.invoiceAmount || 0,
                invoiceContent: this.invoiceInfo.invoiceContent,

              }),
              wfPara: JSON.stringify(wfPara)
            };
            //重新提交
            if (this.isResubmit) {
              submitData.biReferenceId = this.biReferenceId;
              operation = saveAndCommitTask
            }
            //无工作流
            if(!this.processCode.length){
              operation = submitAndCalc;
              delete submitData.wfPara;
              delete submitData.biReferenceId;
            }
            this.saveData(operation, submitData);
          }
        });
      },
      //获取订单信息用于重新提交
      getFormData() {
        return getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          this.invoiceList = [];
          let {formData} = data;
          //基本信息
          this.formData = {
            ...this.formData,
            creator: formData.creator,
            modifer: formData.modifer,
            biComment :formData.biComment,

          }
          //客户信息
          this.dealerInfo = {
            ...this.dealerInfo,
            dealerName : formData.order.dealerName_dealerCodeCredit,
            dealerCode : formData.order.dealerCodeCredit,
            province : formData.order.province_dealerCodeCredit,
            city : formData.order.city_dealerCodeCredit,
            county : formData.order.county_dealerCodeCredit,
            address : formData.order.address_dealerCodeCredit,
            dealerMobilePhone : formData.order.dealerMobilePhone_dealerCodeCredit

          }
          //发票列表明细
          formData.order.dataSet.forEach(item=>{
            let obj = {
              comment: item.comment ,//说明
              thenAmntBal: item.thenAmntBal,//代开票金额
              tdAmount : item.tdAmount ,//本次开票金额
              transMatchedCode: item.transMatchedCode,//实例编码
              tdId : item.tdId,
              
            }
            this.invoiceList.push(obj);
          })
          this.invoiceInfo = {
            ...this.invoiceInfo,
            ticketNumber: formData.ticketNumber,//票号
            invoiceType: formData.invoiceType,//发票类型
            invoiceAmount: formData.invoiceAmount,//发票金额
            invoiceDate: dateFormat(formData.invoiceDate, 'YYYY-MM-DD'),//发票日期
            invoiceContent: formData.invoiceContent,//发票内容

          }
          this.invoiceGetType.push(formData.invoiceType);
          this.dealerParams.dealerCode = formData.order.dealerCodeCredit;
          this.$loading.hide();
          // this.$emit('input', false);
        })
      }
    },
    created() {
      let data = sessionStorage.getItem('ZZSKP_DATA');
      if(data){
        this.invoiceList = JSON.parse(data).invoice.list;
        this.dealerInfo = JSON.parse(data).invoice.dealer;
        this.invoiceInfo = JSON.parse(data).invoice.invoiceInfo;
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmjh-apply-container {
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }

  .vux-cell-box:not(:first-child):before {
    left: 0;
  }

  .XMJH_add {
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      color: #fff;
      padding: .01rem .04rem;
      border-radius: .12rem;
      &:nth-child(1) {
        background: #5077aa;
      }
      &:nth-child(3) {
        background: #fc3c3c;
      }
    }
    em {
      font-style: normal;
    }
  }
</style>
