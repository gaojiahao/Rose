<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 基本信息 -->
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :default-contact="contactInfo"
                         @sel-dealer="selDealer" @sel-contact="selContact" :dealer-params="dealerParams"></pop-dealer-list>
        <dealer-other-part :dealer-config="baseinfoExtConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 其他信息部分 -->
        <other-config-part :other-config=otherConfig :other-info=otherInfo v-model="otherInfo"></other-config-part>
        <!-- 物料选择 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
                           :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" 
                           :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
                           :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
                           :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
                           :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
        </apply-matter-part>
        <!-- 备注 -->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <!-- 附件 -->
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部提交确认栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="checkList.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux组件引入
import { XTextarea, dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { submitAndCalc, saveAndStartWf, saveAndCommitTask, updateData } from 'service/commonService'
// mixins 引入
import ApplyCommon from 'mixins/applyCommon'
// 组件引入
import OpButton from 'components/apply/commonPart/OpButton'
import PopDealerList from 'components/Popup/PopDealerList'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
import OtherConfigPart from 'components/apply/commonPart/otherConfigPart'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
// 方法引入
import { toFixed } from '@/plugins/calc'
import { accAdd, accMul } from 'plugins/calc/decimalsAdd'

const DRAFT_KEY = 'ZZSKP_DATA';
export default {
  mixins: [ApplyCommon],
  components: {
    XTextarea, OpButton,
    PopBaseinfo, PopDealerList, 
    ApplyMatterPart, OtherConfigPart, DealerOtherPart
  },
  data() {
    return {
      numMap: {},
      formData: {},
      orderList: {},
      otherInfo: {},
      dealerInfo: {}, //客户信息
      contactInfo: {}, // 联系人信息
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        }, {
          name: '申请单',
          value: 'transCode',
        }
      ]
    }
  },
  computed: {
    matterList() {
      let arr = [];
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          arr.push(item);
        }
      }
      return arr;
    },
  },
  methods: {
    // 选中的客户
    selDealer(val) {
      let dealerInfo = JSON.parse(val)[0];
      // 重新选择客户之后 初始化 <物料列表>
      if (this.matterParams.data && this.matterParams.data.dealerCode !== null){
        this.orderList = {};
        this.matterParams.data.dealerCode = dealerInfo.dealerCode;
      }
      // 此处为做校验 重组一份数据
      this.dealerInfo = {
        dealerName_dealerCodeCredit: dealerInfo.dealerName,
        ...dealerInfo
      }
    },
    // 选中联系人
    selContact(item) {
      this.contactInfo = {...item,}
    },
    // 显示物料修改的pop
    getMatterModify(item, index, key) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // 更新修改后的物料信息
    selConfirm(val) {
      let modMatter = JSON.parse(val);
      this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
    },
    // 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      let orderList = JSON.parse(JSON.stringify(this.orderList));
      sels.forEach(item => {
        item.tdQty = item.tdQty || item.qtyBal;
        item.taxRate = item.taxRate || 0.16;
        item.purchaseDay = dateFormat(item.calcTime, 'YYYY-MM-DD') || item.purchaseDay;
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
        if (!orderList[item.transCode]) {
          orderList[item.transCode] = [];
        }
        orderList[item.transCode].push(item);
      });
      this.numMap = {};
      this.orderList = orderList;
    },
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 选择要删除的物料
    delClick(sItem, index, key) {
      let arr = this.selItems[key];
      if (arr){
        let delIndex = arr.findIndex(item => item === index);
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          if (!arr.length) delete this.selItems[key];
          return;
        }
        arr.push(index);
      }
      else {
        this.$set(this.selItems, key, [index])
      }
    },
    // 删除的选中状态
    showSelIcon(sItem, index) {
      if (sItem.transCode) {
        return this.selItems[sItem.transCode] && this.selItems[sItem.transCode].findIndex(item => item === index) !== -1;
      }
      else {
        return this.checkList.includes(index);
      }
    },
    // 全选
    checkAll() {
      // 如果已全部选中 则清除所有选中状态
      if (this.checkList.length === this.matterList.length) {
        this.selItems = {};
        return
      }
      // 针对物料列表中的数据进行处理
      let selItems = {};
      for (let key in this.orderList){
        this.orderList[key].forEach((item, index) => {
          // 存在交易号时 key等于交易号
          if (item.transCode) {
            if (!selItems[item.transCode]){
              selItems[item.transCode] = [];
            }
            selItems[item.transCode].push(index)
          }
          // 不存在时 key为 'noCode'
          else {
            if (!selItems['noCode']) {
              selItems['noCode'] = []
            }
            selItems['noCode'].push(index);
          }
        })
      }
      this.selItems = selItems;
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          /** 
           *  @selItems {String} 被选中删除的物料对象（当有交易号时 key为交易号 反之 key为noCode）
           *  @checkList {Array} 被选中删除的物料数组 (存储被删除物料的下标)
           *  @matterList {Array} 物料列表
           */ 

          // 被选中删除的物料
          let selItems = this.selItems, checkList = this.checkList;
          
          for (let key in this.selItems) {
            // 当没有对应的交易单号
            if (key === 'noCode') {
              let orderList = {};
              let remainder = this.matterList.filter((item, index) => !checkList.includes(index));
              remainder.forEach(item => {
                if (!orderList[key]) {
                  orderList[key] = []
                }
                orderList[key].push(item);
              });
              this.orderList = orderList;
            }
            // 当存在对应的交易单号
            else {
              // 将orderList中对应交易号的物料 按照selItems中的索引删除
              let newIndexs = this.selItems[key].map((val, idx) => val - idx);              
              newIndexs.forEach((sItem, sIndex) => {
                this.orderList[key].splice(sItem, 1);
              }) 
              if (!this.orderList[key].length){
                delete this.orderList[key]
              }
            }
          }
          this.selItems = {};
          this.matterModifyClass = false;
        }
      })
    },
    // 新增更多物料
    addMatter() {
      this.showMaterielPop = !this.showMaterielPop;
    },
    
    // 提交
    submitOrder() {
      /** 
       * @warn    提示文字
       * @dateSet   提交数据
       * 
       * @baseinfoExtConfig  <往来部分> 配置
       * @otherConfig   <其他部分> 配置
       * 
       * @otherInfo   <其他部分> 信息
       * @dealerInfo  <往来部分> 信息
       * 
       */ 
      
      let warn = '', dataSet = [],
          otherInfo = this.otherInfo,
          dealerInfo = this.dealerInfo, 
          otherConfig = this.otherConfig,
          baseinfoExtConfig = this.baseinfoExtConfig;

      // 校验 <往来部分> 必填字段
      warn = this.verifyData(baseinfoExtConfig, dealerInfo);

      // 校验 <其他部分> 必填字段
      if (!warn) warn = this.verifyData(otherConfig, otherInfo);

      // 校验 <物料部分> 必填字段 同时动态组装dateSet
      if (!warn) {
        // 校验 是否已选择 <物料部分>
        let [ matterPart = {} ] = this.submitMatterField;
        if (!Object.keys(this.orderList).length) warn = `请选择${matterPart.text}`;

        // 动态组装 dataSet
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            let oItem = {};
            for (let sItem of this.submitMatterField){
              // 校验 <物料必填> 字段
              let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
              if (!sItem.hidden && !sItem.allowBlank && !val && val !== undefined){
                if (sItem.text) warn = `${sItem.text}不为空`;
                break;
              }
              oItem[sItem.fieldCode] = val !== null ? val : null;
            }
            dataSet.push(oItem);
          }
        }
      }
      if (warn) {
        this.$vux.alert.show({
          content: warn,
        });
        return;
      }
      // 提交数据
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let operation = saveAndStartWf;
          let wfPara = {
            [this.processCode]: {
              businessKey: this.businessKey, 
              createdBy: JSON.stringify(this.formData.handler)
            }
          }
          if (this.isResubmit && !this.isModify) {
            wfPara = {
              businessKey: this.transCode,
              createdBy: this.formData.handler,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ""
            }
          }
          // 组装提交数据
          let submitData = {
            listId: this.listId,
            biComment: '',
            formData: JSON.stringify({
              ...this.formData,
              ...this.otherInfo,  // 发票日期、票号、发票类型...
              handlerEntity: this.entity.dealerName,
              creator: this.transCode ? this.formData.handler : '',
              modifer: this.transCode ? this.formData.handler : '',
              dealerCreditContactPersonName: this.contactInfo.dealerName || null,
              dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '',
              order: {
                dataSet,
                dealerCodeCredit: this.dealerInfo.dealerCode,
                crDealerLabel: this.dealerInfo.dealerLabelName,
                expectedCollectionDate: this.dealerInfo.expectedCollectionDate
              },
            }),
            wfPara: JSON.stringify(wfPara)
          };
          // 重新提交
          if (this.isResubmit) {
            operation = saveAndCommitTask
            submitData.biReferenceId = this.biReferenceId;
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
    // 获取订单信息用于重新提交
    getFormData() {
      return getSOList({
        formViewUniqueId: this.formViewUniqueId,
        transCode: this.transCode
      }).then((data) => {
        let { formData } = data, 
            otherConfig = this.otherConfig;
        let orderList = {};

        this.listId = data.listId;
        this.biComment = data.biComment;
        this.attachment = data.attachment;
        this.biReferenceId = data.biReferenceId;
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
          biId: formData.biId,
          creator: formData.creator,
          modifer: formData.modifer,
          biComment: formData.biComment,
          biProcessStatus: formData.biProcessStatus,
        }

        // 客户信息
        this.dealerInfo = {
          ...this.dealerInfo,
          city: formData.order.city_dealerCodeCredit,
          dealerCode: formData.order.dealerCodeCredit,
          dealerLabelName: formData.order.crDealerLabel,
          county: formData.order.county_dealerCodeCredit,
          address: formData.order.address_dealerCodeCredit,
          province: formData.order.province_dealerCodeCredit,
          dealerName: formData.order.dealerName_dealerCodeCredit,
          expectedCollectionDate: formData.order.expectedCollectionDate,
          dealerMobilePhone: formData.dealerMobilePhone_dealerCodeCredit,
          dealerName_dealerCodeCredit: formData.order.dealerName_dealerCodeCredit,
        }
        // 联系人
        this.contactInfo = {
          dealerName: formData.dealerCreditContactPersonName,
          dealerMobilePhone: formData.dealerCreditContactInformation
        }

        // 发票列表明细
        formData.order.dataSet.forEach(item => {
          item.transCode = item.transMatchedCode, // 实例编码,
          item.inventoryName = item.inventoryName_transObjCode,
          item.inventoryCode = item.transObjCode,
          item.inventoryPic = item.inventoryPic_transObjCode 
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` 
            : this.getDefaultImg(),
          item.qtyBal = item.thenQtyBal,
          item.processing = item.tdProcessing,
          item.measureUnit = item.measureUnit_transObjCode;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        })
        this.orderList = orderList;

        // 获取 发票相关信息
        for (let each of otherConfig) {
          for (let key in formData) {
            if (each.fieldCode === key) {
              this.$set(this.otherInfo, key, formData[key])
            }
          }
        }
        // 获取 往来、物料列表 请求参数
        this.dealerParams.dealerCode = formData.order.dealerCodeCredit;
        this.matterParams.data.dealerCode = formData.order.dealerCodeCredit
        // 关闭动画
        this.$loading.hide();
      })
    },
    // 保存草稿数据
    hasDraftData() {
      // 是否选择客户
      if (!Object.values(this.dealerInfo).length) return;
      return {
        [DRAFT_KEY]: {
          invoice: {
            dealer: this.dealerInfo,
            otherInfo: this.otherInfo,
            orderList: this.orderList,
            contactInfo: this.contactInfo,
          }
        }
      };
    },
  },
  updated() {
    // *重新提交*页面 不需要清除缓存
    if (this.transCode) return;
    // 若存在缓存 此处对页面进行赋值
    let draft = JSON.parse(sessionStorage.getItem('ZZSKP_DATA'));
    if (draft && this.matterParams.data) {
      this.dealerInfo = draft.invoice.dealer;
      this.otherInfo = draft.invoice.otherInfo;
      this.orderList = draft.invoice.orderList;
      this.contactInfo = draft.invoice.contactInfo;
      this.matterParams.data.dealerCode = draft.invoice.dealer.dealerCode;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply';
</style>
