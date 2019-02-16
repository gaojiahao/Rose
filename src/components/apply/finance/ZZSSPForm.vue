<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :default-contact="contactInfo" dealerTitle="供应商"
                         :dealer-params="dealerParams" @sel-dealer="selDealer" @sel-contact="selContact"></pop-dealer-list>
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 发票信息 -->
        <other-config-part :other-config=otherConfig :other-info=otherInfo v-model="otherInfo"></other-config-part>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="[]"
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
        </apply-matter-part>
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部提交确认栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux组件引入
import { XTextarea, dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/commonService'
// mixins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import OpButton from 'components/apply/commonPart/OpButton'
import PopDealerList from 'components/Popup/PopDealerList'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
import OtherConfigPart from 'components/apply/commonPart/otherConfigPart'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
// 方法引入
import { toFixed } from '@/plugins/calc'
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'

const DRAFT_KEY = 'ZZSSP_DATA';
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
      if(this.matterParams.data && this.matterParams.data.dealerCode !== null){
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
      // this.matterList = sels;
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
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item === index);
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(index);
    },
    // 判断是否展示选中图标
    showSelIcon(sItem, index) {
      return this.selItems.includes(index);
    },
    // 全选
    checkAll() {
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = this.matterList.map((item, index) => index);
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          let orderList = {};
          let selItems = this.selItems;
          // 根据选择下标 筛选出没被删除的 放回orderList
          let remainder = this.matterList.filter((item, index) => !selItems.includes(index)); 
          remainder.forEach(item => {
            let orderListKey = item.transCode;
            if (!orderList[orderListKey]) {
              orderList[orderListKey] = []
            }
            orderList[orderListKey].push(item);
          });
          this.selItems = [];
          this.orderList = orderList;
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
       * @dealerConfig  <往来部分> 配置
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
          dealerConfig = this.dealerConfig;

      // 校验 <往来部分> 必填字段
      warn = this.verifyData(dealerConfig, dealerInfo);

      // 校验 <其他部分> 必填字段
      if(!warn) warn = this.verifyData(otherConfig, otherInfo);

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
              // 校验 <物料必填> 字段
              let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
              if(!sItem.hidden && !sItem.allowBlank && !val && val !== undefined){
                warn = `${sItem.text}不为空`;
                break;
              }
              oItem[sItem.fieldCode] = val !== null ? val : null;
            }
            dataSet.push(oItem);
          }
        }
      }
      if(warn) {
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
          // this.matterList.push(item);
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        })
        this.orderList = orderList;

        // 获取 发票相关信息
        for(let each of otherConfig) {
          for(let key in formData) {
            if(each.fieldCode === key) {
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
            contactInfo: this.contactInfo,
            orderList: this.orderList,
          }
        }
      };
    },
  },
  updated() {
    let data = sessionStorage.getItem('ZZSSP_DATA');
    // 若存在缓存 此处对页面进行赋值
    if (data) {
      let draft = JSON.parse(data);
      this.dealerInfo = draft.invoice.dealer;
      this.otherInfo = draft.invoice.otherInfo;
      this.orderList = draft.invoice.orderList;
      this.contactInfo = draft.invoice.contactInfo;
      this.matterParams.data.dealerCode = draft.invoice.dealer.dealerCode;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
// export default {
//   mixins: [ApplyCommon],
//   components: {
//     XTextarea, OpButton,
//     PopBaseinfo, PopDealerList, 
//     ApplyMatterPart, OtherConfigPart, DealerOtherPart
//   },
//   data() {
//     return {
//       numMap: {},
//       formData: {},
//       orderList: {},
//       otherInfo: {},
//       dealerInfo: {}, //客户信息
//       contactInfo: {}, // 联系人信息
//       filterList: [
//         {
//           name: '物料名称',
//           value: 'inventoryName',
//         }, {
//           name: '物料编码',
//           value: 'inventoryCode',
//         }, {
//           name: '入库单',
//           value: 'transCode',
//         }
//       ]
//     }
//   },
//   computed: {
//     matterList() {
//       let arr = [];
//       for (let items of Object.values(this.orderList)) {
//         for (let item of items) {
//           arr.push(item);
//         }
//       }
//       return arr;
//     },
//   },
//   methods: {
//     // 选中的客户
//     selDealer(val) {
//       this.dealerInfo = JSON.parse(val)[0];
//       if(this.matterParams.data && this.matterParams.data.dealerCode != null){
//         this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
//         this.matterList = [];
//         this.orderList = {};
//       }      
//     },
//     // TODO 选中联系人
//     selContact(item) {
//       this.contactInfo = {...item,}
//     },
//     // 发票类型选择
//     typeTask(e) {
//       this.invoiceInfo.invoiceType = e[0];
//     },
//     // TODO 显示物料修改的pop
//     getMatterModify(item, index, key) {
//       this.matter = JSON.parse(JSON.stringify(item));
//       this.showMatterPop = true;
//       this.modifyIndex = index;
//       this.modifyKey = key;
//     },
//     // TODO 更新修改后的物料信息
//     selConfirm(val) {
//       let modMatter = JSON.parse(val);
//       this.matterList.every((item, index) => {
//         // 修改matterList，触发合计金额计算
//         if (modMatter.transCode === item.transCode && modMatter.inventoryCode === item.inventoryCode) {
//           this.$set(this.matterList, index, modMatter);
//           return false
//         }
//         return true
//       });
//       this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
//     },
//     // 选择物料，显示物料pop
//     getMatter() {
//       if (!this.dealerInfo.dealerCode) {
//         this.$vux.alert.show({
//           content: '请选择供应商'
//         });
//         return
//       }
//       this.showMaterielPop = !this.showMaterielPop;
//     },
//     // TODO 选中物料项
//     selMatter(val) {
//       let sels = JSON.parse(val);
//       let orderList = {};
//       sels.forEach(item => {
//         item.tdQty = item.tdQty || item.qtyBal;
//         item.taxRate = item.taxRate || 0.16;
//         item.purchaseDay = dateFormat(item.calcTime, 'YYYY-MM-DD') || item.purchaseDay;
//         item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
//         item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
//         item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
//         if (!orderList[item.transCode]) {
//           orderList[item.transCode] = [];
//         }
//         orderList[item.transCode].push(item);
//       });
//       this.matterList = sels;
//       this.orderList = orderList;
//     },
//     //选择默认图片
//     getDefaultImg(item) {
//       let url = require('assets/wl_default03.png');
//       if (item) {
//         item.inventoryPic = url;
//       }
//       return url
//     },
//     // 选择要删除的物料
//     delClick(index, sItem, key) {
//       let arr = this.selItems;
//       let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
//       //若存在重复的 则清除
//       if (delIndex !== -1) {
//         arr.splice(delIndex, 1);
//         return;
//       }
//       arr.push(sItem);
//     },
//     // TODO 判断是否展示选中图标
//     showSelIcon(sItem) {
//       return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
//     },
//     // 全选
//     checkAll() {
//       if (this.selItems.length === this.matterList.length) {
//         this.selItems = [];
//         return
//       }
//       this.selItems = JSON.parse(JSON.stringify(this.matterList));
//     },
//     // 删除选中的
//     deleteCheckd() {
//       this.$vux.confirm.show({
//         content: '确认删除?',
//         // 确定回调
//         onConfirm: () => {
//           let newArr = [];
//           let keys = Object.keys(this.orderList);
//           keys.forEach(item => {
//             newArr = newArr.concat(this.orderList[item]);
//           });
//           this.selItems.forEach(SItem => {
//             newArr.forEach(OItem => {
//               if (OItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
//                 let delArr = this.orderList[OItem.transCode];
//                 let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
//                 if (delIndex >= 0) {
//                   this.$refs.matter.delSelItem(delArr[delIndex]);
//                   delArr.splice(delIndex, 1);
//                 }
//                 if (!delArr.length) {
//                   delete this.orderList[OItem.transCode];
//                 }
//               }
//             });
//             this.matterList.forEach((item, index) => {
//               if (item.inventoryCode === SItem.inventoryCode) {
//                 this.matterList.splice(index, 1);
//                 index--;
//               }
//             })
//           });
//           this.selItems = [];
//           this.matterModifyClass = false;
//         }
//       })
//     },
//     // TODO 新增更多物料
//     addMatter() {
//       this.showMaterielPop = !this.showMaterielPop;
//     },
//     // TODO 提交
//     submitOrder() {
//       let warn = '';
//       let dataSet = [];
//       if (!this.dealerInfo.dealerCode) {
//         warn = '请选择供应商信息';
//       }
//       let objArr = [
//         {tip: 'ticketNumber', msg: '请输入票号'},
//         {tip: 'invoiceType', msg: '请选择发票类型'},
//         {tip: 'invoiceDate', msg: '请选择发票日期'},
//       ];
//       if (!warn) {
//         objArr.every(item => {
//           if (!this.invoiceInfo[item.tip]) {
//             warn = item.msg;
//             return false;
//           }
//           return true
//         })
//       }
//       if (!warn && !this.matterList.length) {
//         warn = '请选择物料';
//       }
//       if (!warn) {
//         this.matterList.every(item => {
//           if (!item.tdQty && item.tdQty !== 0) {
//             warn = '请填写本次收票数量';
//             return false
//           }
//           let taxRate = item.taxRate || this.taxRate;
//           dataSet.push({
//             tdId: item.tdId || '',
//             orderCode: item.orderCode, // 实例编码,
//             transMatchedCode: item.transCode, // 实例编码,
//             purchaseDay: item.purchaseDay,
//             transObjCode: item.inventoryCode,
//             tdProcessing: item.processing,
//             assMeasureUnit: item.assMeasureUnit,
//             assMeasureScale: item.assMeasureScale,
//             assMeasureDescription: item.assMeasureDescription,
//             thenTotalQtyBal: item.qty,
//             thenLockQty: item.stockQty,
//             thenQtyBal: item.qtyBal,
//             tdQty: item.tdQty,
//             assistQty: item.assistQty,
//             price: item.price,
//             tdAmount: item.tdAmount,
//             taxRate: item.taxRate,
//             noTaxPrice: item.noTaxPrice,
//             taxAmount: item.taxAmount,
//             noTaxAmount: item.noTaxAmount, // 本次开票金额,
//             comment: item.comment || '', // 说明
//           });
//           return true
//         });
//       }
//       if (warn) {
//         this.$vux.alert.show({
//           content: warn,
//         });
//         return
//       }
//       this.$vux.confirm.show({
//         content: '确认提交?',
//         // 确定回调
//         onConfirm: () => {
//           this.$HandleLoad.show();
//           let operation = saveAndStartWf;
//           let wfPara = {
//             [this.processCode]: {businessKey: this.businessKey, createdBy: JSON.stringify(this.formData.handler)}
//           }
//           if (this.isResubmit) {
//             wfPara = {
//               businessKey: this.transCode,
//               createdBy: this.formData.handler,
//               transCode: this.transCode,
//               result: 3,
//               taskId: this.taskId,
//               comment: ""
//             }
//           }
//           let submitData = {
//             listId: this.listId,
//             biComment: '',
//             formData: JSON.stringify({
//               ...this.formData,
//               handlerEntity: this.entity.dealerName,
//               creator: this.formData.handler,
//               modifer: this.formData.handler,
//               order: {
//                 dealerCodeCredit: this.dealerInfo.dealerCode,
//                 crDealerLabel: this.dealerInfo.dealerLabelName,
//                 crDealerPaymentTerm: this.dealerInfo.paymentTerm || null,
//                 pamentDays_dealerCodeCredit: this.dealerInfo.pamentDays || null,
//                 expectedPaymentDate: this.dealerInfo.expectedPaymentDate || null,
//                 dataSet: dataSet,
//               },
//               dealerCreditContactPersonName: this.contactInfo.dealerName || null,
//               dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '',
//               invoiceDate: this.invoiceInfo.invoiceDate,
//               ticketNumber: this.invoiceInfo.ticketNumber,
//               invoiceType: this.invoiceInfo.invoiceType,
//               invoiceContent: this.invoiceInfo.invoiceContent,
//             }),
//             wfPara: JSON.stringify(wfPara)
//           };
//           // 重新提交
//           if (this.isResubmit) {
//             submitData.biReferenceId = this.biReferenceId;
//             operation = saveAndCommitTask
//           }
//           // 无工作流
//           if (!this.processCode.length) {
//             operation = submitAndCalc;
//             delete submitData.wfPara;
//             delete submitData.biReferenceId;
//           }
//           if (this.biReferenceId) {
//             submitData.biReferenceId = this.biReferenceId
//           }
//           this.saveData(operation, submitData);
//         }
//       });
//     },
//     // 获取订单信息用于重新提交
//     getFormData() {
//       return getSOList({
//         formViewUniqueId: this.uniqueId,
//         transCode: this.transCode
//       }).then((data) => {
//         this.attachment = data.attachment;
//         this.listId = data.listId;
//         this.biComment = data.biComment;
//         this.biReferenceId = data.biReferenceId;
//         let {formData} = data;
//         this.handlerDefault = {
//           handler: formData.handler,
//           handlerName: formData.handlerName,
//           handlerUnit: formData.handlerUnit,
//           handlerUnitName: formData.handlerUnitName,
//           handlerRole: formData.handlerRole,
//           handlerRoleName: formData.handlerRoleName,
//         };
//         // 基本信息
//         this.formData = {
//           ...this.formData,
//           ...this.handlerDefault,
//           biComment: formData.biComment,
//           biId: formData.biId,
//           biProcessStatus: formData.biProcessStatus,
//           creator: formData.creator,
//           modifer: formData.modifer,
//         }
//         // 客户信息
//         this.dealerInfo = {
//           ...this.dealerInfo,
//           dealerName: formData.order.dealerName_dealerCodeCredit,
//           dealerCode: formData.order.dealerCodeCredit,
//           province: formData.order.province_dealerCodeCredit,
//           city: formData.order.city_dealerCodeCredit,
//           county: formData.order.county_dealerCodeCredit,
//           address: formData.order.address_dealerCodeCredit,
//           dealerMobilePhone: formData.order.dealerMobilePhone_dealerCodeCredit,
//           paymentTerm: formData.order.crDealerPaymentTerm || '无',
//           pamentDays: formData.order.pamentDays_dealerCodeCredit,
//           expectedPaymentDate: formData.order.expectedPaymentDate,
//           dealerLabelName: formData.order.crDealerLabel
//         }
//         let orderList = {};
//         // 发票列表明细
//         formData.order.dataSet.forEach(item => {
//           let obj = {
//             ...item,
//             transCode: item.transMatchedCode, //实例编码,
//             inventoryName: item.inventoryName_transObjCode,
//             inventoryCode: item.transObjCode,
//             inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
//             processing: item.tdProcessing,
//             qty: item.thenTotalQtyBal,
//             stockQty: item.thenLockQty,
//             qtyBal: item.thenQtyBal,
//           };
//           if (!orderList[item.transMatchedCode]) {
//             orderList[item.transMatchedCode] = [];
//           }
//           orderList[item.transMatchedCode].push(obj);
//           this.matterList.push(obj);
//         });
//         this.orderList = orderList;
//         // 发票信息
//         this.invoiceInfo = {
//           ...this.invoiceInfo,
//           ticketNumber: formData.ticketNumber,
//           invoiceType: formData.invoiceType,
//           invoiceDate: dateFormat(formData.invoiceDate, 'YYYY-MM-DD'),
//           invoiceContent: formData.invoiceContent,
//         };
//         this.contactInfo = {
//           dealerName: formData.dealerCreditContactPersonName,
//           dealerMobilePhone: formData.dealerCreditContactInformation,
//         };
//         this.invoiceGetType.push(formData.invoiceType);
//         this.matterParams = {
//           dealerCode: formData.order.dealerCodeCredit,
//         };
//         this.$loading.hide();
//         // this.$emit('input', false);
//       })
//     },
//     // TODO 保存草稿数据
//     hasDraftData() {
//       // 是否选择供应商
//       if (!Object.values(this.dealerInfo).length) {
//         return false
//       }
//       return {
//         [DRAFT_KEY]: {
//           invoice: {
//             dealer: this.dealerInfo,
//             invoiceInfo: this.invoiceInfo,
//             contactInfo: this.contactInfo,
//             orderList: this.orderList,
//           }
//         }
//       };
//     },
//   },
//   created() {
//     let data = sessionStorage.getItem('ZZSSP_DATA');
//     if (data) {
//       let draft = JSON.parse(data);
//       this.dealerInfo = draft.invoice.dealer;
//       this.invoiceInfo = draft.invoice.invoiceInfo;
//       this.contactInfo = draft.invoice.contactInfo;
//       this.orderList = draft.invoice.orderList;
//       for (let items of Object.values(this.orderList)) {
//         for (let item of items) {
//           this.matterList.push(item)
//         }
//       }
//       this.matterParams = {
//         dealerCode: this.dealerInfo.dealerCodeCredit,
//       };
//       this.invoiceGetType.push(this.invoiceInfo.invoiceType);
//       sessionStorage.removeItem(DRAFT_KEY);
//     }
//   },
// }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmjh-apply-container {
    .cell-item {
      margin: 0 auto;
      padding: .05rem .1rem;
      width: 95%;
      background-color: #fff;
      box-sizing: border-box;
      color: #757575;
      font-size: .14rem;
      &:before {
        display: none;
      }
    }
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
