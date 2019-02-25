<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus=false></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo"
                         :default-contact="contactInfo" :dealer-params="dealerParams" dealerTitle="供应商"></pop-dealer-list>
        <!-- 结算方式 -->
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="[]"
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="consumables" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !consumableList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
     <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="checkList.length === consumableList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
  // vux插件引入
  import {XTextarea, Datetime, dateFormat, Cell, XInput, Group} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getObjInvMoreUnitByInvCode} from 'service/materService'
  import {
    saveAndStartWf,
    getBaseInfoData,
    saveAndCommitTask,
    commitTask,
    getDictByType,
    submitAndCalc
  } from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopMatterList from 'components/Popup/PopMatterListTest'
  import PopOrderList from 'components/Popup/PopOrderList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopCashList from 'components/Popup/finance/PopCashList'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import RNumber from 'components/RNumber'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RDropdown from 'components/RDropdown'
  import OpButton from 'components/apply/commonPart/OpButton'
  import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
  // 公共方法
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'DZYHPCGYSYZF_DATA';

  export default {
    name: 'ApplyDZYHPCGYSYZFForm',
    data() {
      return {
        orderList: {},
        showDealerPop: false, // 是否显示供应商的popup
        dealerInfo: {}, // 供应商客户信息
        contactInfo: {},
        formData: {
          biId: '',
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        taxRate: 0.16, // 税率
        numMap: {}, // 用于记录订单物料的数量
        transCode: '',
        formViewUniqueId: 'fed81800-4c34-44a9-b517-c3fd9f2ab57d', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
        showMaterielPop: false,
        tmpItems: {}, // 选中的订单
        matter: {},
        showMatterPop: false,
        modifyIndex: null,
        modifyKey: null,
        filterList: [
          {
            name: '物料名称',
            value: 'inventoryName',
          },{
            name: '采购订单号',
            value: 'transCode',
          },
        ],
        cashInfo: {},
        cashParams: {
          fundType: '银行存款',
        },
        consumables: {},
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写数量'
          },
        ],
        selItems: {}
      }
    },
    computed: {
      // 基于 orderList 此处重组 consumableList 数据
      consumableList() {
        let arr = [];
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            arr.push(item);
          }
        }
        return arr;
      },
      // 将要删除的物料对象selItems转成一维素组
      checkList() {
        let newArr = [].concat.apply([],Object.values(this.selItems));
        return newArr
      },
    },
    watch:{
      //修改的物料
      consumables:{
        handler(val){
          this.simpleCalcMatter(val)
        },
        deep:true
      },
      consumableList: {
        handler(val) {
          let tdAmount = 0, taxAmount = 0;
          for (let item of val) {
            this.simpleCalcMatter(item);
            tdAmount = toFixed(accAdd(tdAmount, item.tdAmount));
            taxAmount = toFixed(accAdd(taxAmount, item.taxAmount));
          }
          this.tdAmount = tdAmount;
          this.taxAmount = taxAmount;
        },
        deep: true
      }
    },
    mixins: [applyCommon],
    components: {
      XTextarea, Datetime, PopOrderList, RNumber, XInput, Group,
      PopDealerList, PopMatterList, PopSingleSelect, PopMatter, RPicker, PopBaseinfo,
      Cell, RDropdown, PopCashList, DealerOtherPart, OpButton, ApplyMatterPart
    },
    methods: {
      // 修改经办人信息
      selItem(val) {
        this.formData = {
          ...this.formData,
          ...val,
        };
        if(this.matterParams.data.groupId != null){
          this.matterParams.data.groupId = val.handlerUnit;
        }
      },
      // TODO 选中的供应商
      selDealer(val) {
        let [sel] = JSON.parse(val);
        let day = 24 * 3600 * 1000;
        let {pamentDays} = sel;
        let accountExpirationDate = pamentDays ? dateFormat(Date.now() + accMul(pamentDays, day), 'YYYY-MM-DD') : '';
        this.dealerInfo = {
          ...sel,
          dealerName_dealerCodeCredit: sel.dealerName,
          accountExpirationDate: accountExpirationDate,
          crDealerPaymentTerm: sel.paymentTerm,
          daysOfAccount: sel.pamentDays
        };
        if(this.matterParams.data && this.matterParams.data.dealerCode != null) {
          console.log('触发了')
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode
          this.orderList = {};
        }
      },
      // TODO 选择联系人
      selContact(val) {
        this.contactInfo = {...val};
      },
      // TODO 显示物料修改的pop
      getMatterModify(item, index, key) {
        this.consumables = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        let orderList = JSON.parse(JSON.stringify(this.orderList));
        sels.forEach(item => {
          let orderListKey = item.transCode ? item.transCode : 'noCode';
          item.tdQty = item.qtyBal || '';
          item.taxRate = this.taxRate;
          // 如果有销售合同号
          if(item.transCode){
            if (!orderList[orderListKey]) {
              orderList[orderListKey] = [];
            }
            orderList[orderListKey].push(item);
          }
          else {
            if(!orderList['noCode']) {
              orderList['noCode'] = []
            }
            orderList['noCode'].push(item);

          }
        });
        this.orderList = orderList;
      },
      // TODO 更新修改后的物料信息
      selConfirm(val) {
        let modMatter = JSON.parse(val);
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
      },
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 显示物料修改的pop
      getMatterModify(item, index, key) {
        this.consumables = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // 展开可删除状态
      showDelete(){
        this.matterModifyClass = ! this.matterModifyClass;
        this.selItems = {};
      },
      // 选择要删除的物料
      delClick(sItem, index, key) {
        if(this.selItems[key]){
          let arr = this.selItems[key];
          let delIndex = arr.findIndex(item => item === index);
          if (delIndex !== -1) {
            arr.splice(delIndex, 1);
            if(!arr.length) delete this.selItems[key]
            return;
          }
          arr.push(index);
        }
        else{
          this.$set(this.selItems, key, [index])
        }
         
      },
      // 判断是否展示选中图标
      showSelIcon(sItem, index) {
        return this.selItems[sItem.transCode] && this.selItems[sItem.transCode].length
              && this.selItems[sItem.transCode].findIndex(item => item === index) !== -1;
      },
      // 全选
      checkAll() {
        // 要删除的物料数量等于当前物料数量
        if(this.checkList.length === this.consumableList.length){
          this.selItems = {};
          return
        }
        let obj = {};
        for(let key in this.orderList){
          this.orderList[key].foeEach((item, index) => {
            if(!obj[item.transCode]){
              obj[item.transCode] = [];
            }
            obj[item.transCode].push(index)
          })
        }
        this.selItems = obj;
      },
      // 删除选中的
      deleteCheckd() {
        this.$vux.confirm.show({
          content: '确认删除?',
          // 确定回调
          onConfirm: () => {
            for(let key in this.selItems){
              var newIndexs =   this.selItems[key].map((val, idx) => {return val - idx})
              // 将orderList中对应交易号的物料列表按照selItems中的索引删除
              newIndexs.forEach((sItem, sIndex) => {
                this.orderList[key].splice(sItem, 1)
                if(!this.orderList[key].length){
                  delete this.orderList[key]
                }  
              }) 
            }
            this.selItems = {};
            this.matterModifyClass = false;
          }
        })
      },
      // TODO 新增更多订单
      addMatter() {
        this.showMaterielPop = !this.showMaterielPop;
      },
      // TODO 提价订单
      submitOrder() {
         /** 
       * @warn    提示文字
       * @dateSet   提交数据
       * 
       * @dealerConfig  <往来部分> 配置
       * @dealerInfo  <往来部分> 信息
       * 
       */ 
      
      let warn = '', dataSet = [], 
          isSubmitOk = this.isSubmitOk,
          dealerInfo = this.dealerInfo, 
          dealerConfig = this.dealerConfig;
      
        // 校验 <往来部分> 必填字段
        warn = this.verifyData(dealerConfig, dealerInfo);

        // 校验 <物料部分> 必填字段 同时动态组装dateSet
        if(!warn) {
          // 校验 是否已选择 <物料部分>
          let [ matterPart = {} ] = this.submitMatterField;
          if(!Object.keys(this.orderList).length) warn = `请选择${matterPart.text}`;

          // 动态组装 dataSet
          for (let items of Object.values(this.orderList)) {
            for (let item of items) {
              let oItem = {};
              for(let sItem of this.submitMatterField){
                let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
                if(sItem.text){
                  if(!sItem.hidden && !sItem.allowBlank && !val && val !== undefined){
                    warn = `${sItem.text}不为空`
                    break;
                  }
                  oItem[sItem.fieldCode] = val !== undefined ? val : '';
                } 
              }
              dataSet.push(oItem);
            }
          }
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveAndStartWf;
            let formData = {};
            let wfPara = {
              [this.processCode]: {
                businessKey: this.businessKey,
                createdBy: ''
              }
            };

            formData = {
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              creator: this.transCode ? this.formData.handler : '',
              modifer: this.transCode ? this.formData.handler : '',
              dealerCreditContactPersonName: this.contactInfo.dealerName || '', // 联系人姓名
              dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '', // 联系人手机
              containerInWarehouseManager: null,
              inPut: {
                dealerCodeCredit: this.dealerInfo.dealerCode, // 供应商编码
                crDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 供应商页签
                crDealerPaymentTerm: this.dealerInfo.paymentTerm,
                daysOfAccount: this.dealerInfo.pamentDays, // 账期天数
                accountExpirationDate: this.dealerInfo.accountExpirationDate, // 账期到期日
                containerCode: '',
                dataSet,
              },
              outPut: {
                crDealerLabel: this.dealerInfo.dealerLabelName || '供应商',
                dataSet: [{
                  fundName_cashOutCode: this.cashInfo.fundName || '',
                  cashOutCode: this.cashInfo.fundCode || '',
                  cashType_cashOutCode: this.cashInfo.fundType || '',
                  thenAmntBalCopy1: this.cashInfo.amntBal || 0,
                  tdAmountCopy1: this.tdAmount,
                }],
              },
            };
            // 重新提交
            if (this.transCode) {
              operation = saveAndCommitTask;
              wfPara = {
                businessKey: this.transCode,
                createdBy: this.formData.handler,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ''
              };
            }
            let submitData = {
              listId: this.listId,
              biComment: '',
              biReferenceId: this.biReferenceId,
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify(wfPara)
            };
            // 新增
            if (!this.transCode) {
              delete submitData.biReferenceId
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
        })
      },
      // TODO 获取详情
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
          let {inPut, dealerDebit, outPut} = formData;
          let {dataSet = []} = inPut;
          let orderList = {};
          for (let item of dataSet) {
            item = {
              ...item,
              transCode: item.transMatchedCode,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.transObjCode,
              specification: item.specification_transObjCode,
              processing: item.tdProcessing,
              keepingDays: item.keepingDays_transObjCode,
              qtyed: item.thenLockQty,
              qtyBal: item.thenQtyBal,
              qty: item.thenTotalQtyBal,
            };
            this.getMoreUnit(item);
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          }
          // 供应商信息
          this.dealerInfo = {
            ... inPut,
            creatorName: formData.dealerCreditContactPersonName, // 客户名
            dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerCode: inPut.dealerCodeCredit, // 客户编码
            dealerLabelName: inPut.crDealerLabel, // 关系标签
            province: inPut.province_dealerCodeCredit, // 省份
            city: inPut.city_dealerCodeCredit, // 城市
            county: inPut.county_dealerCodeCredit, // 地区
            address: inPut.address_dealerCodeCredit, // 详细地址
            paymentTerm: inPut.crDealerPaymentTerm,
            pamentDays: inPut.daysOfAccount,
            accountExpirationDate: inPut.accountExpirationDate || ''
          };
          for(let item of outPut.dataSet){
            this.cashInfo = {
              fundName: item.fundName_cashOutCode,
              fundCode: item.cashOutCode,
              fundType: item.cashType_cashOutCode,
              amntBal: item.thenAmntBalCopy1,
            }
          }
          this.contactInfo = {
            dealerName: formData.dealerCreditContactPersonName,
            dealerMobilePhone: formData.dealerCreditContactInformation,
          };
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
            creator: formData.creator,
            biId: formData.biId,
            biComment: formData.biComment,
          };
          // 物料列表请求参数
          if(this.matterParams.data && this.matterParams.data.dealerCode != null) {
            this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
          }
          if(this.matterParams.data && this.matterParams.data.groupId != null) {
            this.matterParams.data.groupId = this.formData.handlerUnit;
          }
          this.biReferenceId = formData.biReferenceId;
          this.orderList = orderList;
          this.$loading.hide();
        })
      },
      // TODO 是否保存草稿
      hasDraftData() {
        if (!this.consumableList.length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            matter: this.orderList,
            dealer: this.dealerInfo,
            formData: this.formData,
            contactInfo: this.contactInfo,
            cashInfo: this.cashInfo,
          }
        };
      },
      // TODO 获取关联数据
      getRelationData() {
        let {uniqueId} = this.$route.query;
        return getSOList({
          formViewUniqueId: uniqueId,
          transCode: this.relationKey
        }).then(data => {
          let {success = true, formData = {}, attachment = []} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          // this.attachment = attachment;
          // 获取合计
          let {order, dealerDebit} = formData;
          let {dataSet = []} = order;
          dataSet = dataSet.map(item => {
            return {
              ...item,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.inventoryCode_transObjCode,
              specification: item.specification_transObjCode,
              processing: item.tdProcessing || '商品',
              measureUnit: item.measureUnit_transObjCode,
              transCode: this.relationKey,
              qtyBal: item.tdQty,
              tdQty: '',
            };
          });

          //供应商信息展示
          this.dealerInfo = {
            creatorName: formData.dealerDebitContactPersonName,
            dealerMobilePhone: formData.dealerDebitContactInformation,
            dealerCode: formData.order.dealerDebit,
            dealerSubclass: formData.order.drAccountSub,
            dealerName: formData.order.dealerName_dealerDebit,
            province: formData.order.province_dealerDebit,
            city: formData.order.city_dealerDebit,
            county: formData.order.county_dealerDebit,
            address: formData.order.address_dealerDebit
          };
          this.orderList = {
            [this.relationKey]: dataSet,
          };
          this.$loading.hide();
        })
      },
      // TODO 获取物料的辅助计量
      getMoreUnit(item) {
        let {inventoryCode} = item;
        return getObjInvMoreUnitByInvCode(inventoryCode).then(({tableContent = []}) => {
          item.showDrop = false;
          tableContent.forEach(unit => {
            unit.name = unit.invSubUnitName;
            unit.value = unit.invSubUnitName;
          });
          item.moreUnitList = tableContent;
        });
      },
      // TODO 点击辅助计量栏
      moreUnitClick(item) {
        item.showDrop = !item.showDrop;
      },
      // TODO 选中辅助计量
      moreUnitSelected(val) {
        this.consumables.assMeasureUnit = val.invSubUnitName;
        this.consumables.assistQty = val.invSubUnitMulti;
      },
      // TODO 选中资金
      selCash(item) {
        this.cashInfo = item;
      },
      // TODO 组装orderList
      assembleOrder(arr) {
        let orderList = {};
        arr.forEach(item => {
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          this.getMoreUnit(item);
          orderList[item.transCode].push(item);
        });
        this.orderList = orderList;
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.orderList = draft.matter;
        this.dealerInfo = draft.dealer;
        this.formData = draft.formData;
        this.contactInfo = draft.contactInfo;
        this.cashInfo = draft.cashInfo;
        if(this.matterParams.data && this.matterParams.data.dealerCode != null){
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
        }
        if(this.matterParams.data && this.matterParams.data.groupId != null) {
          this.matterParams.data.groupId = this.formData.handlerUnit;
        }
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  .pages {
    /deep/ .vux-no-group-title {
      margin-top: 0;
    }
    /deep/ .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
      }
    }
    .cell-item {
      margin: 0 auto;
      padding: .05rem .1rem;
      width: 95%;
      background-color: #fff;
      box-sizing: border-box;
      /deep/ .vux-label {
        color: #757575;
        font-size: .14rem;
      }
    }
  }

  .edit_matter {
    .r-dropdown {
      width: 1rem;
      /deep/ .r-dropdown-value {
        justify-content: flex-end;
        font-size: .14rem;
      }
      /deep/ .r-dropdown-list {
        text-align: left;
      }
    }
  }
</style>
