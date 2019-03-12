<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"
                      :status-data="currentStage" v-model="formData.biProcessStatus"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :default-contact="contactInfo" @sel-dealer="selDealer" :dealer-params="dealerParams"
                         @sel-contact="selContact"></pop-dealer-list>
        <!-- 结算方式 -->
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 仓库-->
        <pop-warehouse-list isRequired :default-value="warehouse" @sel-item="selWarehouse" :default-store="warehouseStoreInfo"
                            @get-store="getStore" :isShowStore="true">
        </pop-warehouse-list>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
                           :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="[]"
                           :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
                           :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
                           :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
                           :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="rNumber" slot-scope="{item}">
            <r-number :num="item.tdQty" :max="Number(item.locationStock)" v-model="item.tdQty"></r-number>
          </template>
        </apply-matter-part>
        <!-- 项目 -->
        <pop-sodl-projectList :value="project" v-model="project"></pop-sodl-projectList>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部按钮 -->
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
import { commitTask, saveAndStartWf, saveAndCommitTask, submitAndCalc, requestData, updateData } from 'service/commonService'
// mixins 引入
import applyCommon from 'components/mixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopDealerList from 'components/Popup/PopDealerList'
import OpButton from 'components/apply/commonPart/OpButton'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import PopSodlProjectList from 'components/Popup/PopSODLProjectList'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 公共方法
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
import { toFixed } from '@/plugins/calc'
import { setTimeout } from 'timers';

const DRAFT_KEY = 'XSCK_DATA';
export default {
  name: 'ApplyXSCKForm',
  mixins: [applyCommon],
  components: {
    XTextarea, RNumber, OpButton, 
    PopBaseinfo, PopDealerList, PopWarehouseList,
    ApplyMatterPart, PopSodlProjectList, DealerOtherPart
  },
  data() {
    return {
      taxRate: 0.16, // 税率
      formViewUniqueId: '346ede09-ac6a-489a-9242-f385932a4443', // 修改时的UniqueId
      warehouse: {  // 选中仓库属性
        warehouseType: '一般部门仓',
        warehouseName: '成品仓',
        warehouseCode: 'FG0001',
      }, 
      taskId: '',
      transCode: '',
      biReferenceId: '',
      numMap: {},                 // 用于记录订单物料的数量和价格
      matter: {},
      project: {},                // 项目
      formData: {},
      orderList: {},              // 订单列表
      dealerInfo: {},             // 客户客户信息
      contactInfo: {},            // 联系人信息
      warehouseStoreInfo: {},     // 库位信息
      actions: [],
      modifyKey: null,
      modifyIndex: null,
      showMatterPop: false,
      submitSuccess: false,       // 是否提交成功
    }
  },
  computed: {
    // 基于 orderList 此处重组 matterList 数据
    matterList: {
      get: function() {
        let arr = [];
        for (let items of Object.values(this.orderList)) {
          for (let mItem of items) {
            if (this.matterEditConfig.editPart) {
              // 此处请求 辅助计量
              for (let cItem of this.matterEditConfig.editPart) {
                if (cItem.fieldCode === 'assMeasureUnit') {
                  let requestParams = {
                    url: cItem.dataSource.data.url,
                    data: {
                      inventoryCode:  mItem.inventoryCode
                    }
                  }
                  requestData(requestParams).then(({tableContent = []}) => {
                    tableContent.forEach(mItem => {
                      mItem.name =  mItem.invSubUnitName;
                      mItem.value =  mItem.invSubUnitName;
                    })
                    cItem.remoteData = tableContent
                  })
                  break;
                }
              }
            }
            arr.push(mItem);
          }
        }
        return arr;
      },
      set: function() {}
    }
  },
  watch:{
    orderListTitle(val) {
      if (val.includes('订单')) {
        this.filterList = [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          },
          {
            name: '订单编码',
            value: 'transCode',
          }
        ]
      }
      else {
         this.filterList = [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          }
        ]
      }
    }
  },
  methods: {
    // 选中的客户
    selDealer(val) {
      let [sel] = JSON.parse(val);
      let day = 24 * 3600 * 1000;
      let {pamentDays} = sel;
      let accountExpirationDate = pamentDays ? dateFormat(Date.now() + accMul(pamentDays, day), 'YYYY-MM-DD') : '';
      this.dealerInfo = {
        ...sel,
        daysOfAccount: sel.pamentDays,
        drDealerPaymentTerm: sel.paymentTerm,
        dealerName_dealerDebit: sel.dealerName,
        accountExpirationDate: accountExpirationDate,
        drDealerLogisticsTerms: sel.dealerLogisticsTerms,
      };
      if (this.matterParams.data && this.matterParams.data.dealerCode != null) {
        this.matterParams.data.dealerCode = this.dealerInfo.dealerCode
        this.matterList = [];
        this.orderList = {};
      }
    },
    selContact(val) {
      this.contactInfo = {...val};
    },
    // 选中仓库
    selWarehouse(val) {
      this.warehouse = JSON.parse(val);
      if (this.matterParams.data && this.matterParams.data.whCode != null) {
        this.matterParams.data.whCode = this.warehouse.warehouseCode;
        this.matterList = [];
        this.orderList = {};
      }
    },
    // 选择的库位
    getStore(val) {
      console.log(val)
      this.warehouseStoreInfo = {...val};
      if (this.matterParams.data && this.matterParams.data.storehouseCode != null) {
        this.matterParams.data.storehouseCode = this.warehouseStoreInfo.warehouseCode;
        this.matterList = [];
        this.orderList = {};
      }
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
      this.matterList.every((item, index) => {
        // 修改matterList，触发合计金额计算
        if (modMatter.transCode === item.transCode && modMatter.inventoryCode === item.inventoryCode) {
          this.$set(this.matterList, index, modMatter);
          return false
        }
        return true
      });
      this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
    },
    // 选择物料，显示物料pop
    addMatter() {
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      let orderList = JSON.parse(JSON.stringify(this.orderList));
      sels.forEach(item => {
        let orderListKey = item.transCode ? item.transCode : 'noCode';
        // 初始化数据
        item.taxRate = this.taxRate;
        // 格式化日期
        for (let key in this.dataIndexMap) {
          if (key === 'promDeliTime') {
            item[key] = dateFormat(item[this.dataIndexMap[key]], 'YYYY-MM-DD') || "";
          }
          else {
            item[key] = item[key] || item[this.dataIndexMap[key]];
          }
        }
        if (!orderList[orderListKey]) {
          orderList[orderListKey] = [];
        }
        orderList[orderListKey].push(item);
      });
      this.matterList = sels;
      this.orderList = orderList;
    },
    // 选择默认图片
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
      if (arr) {
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
      for (let key in this.orderList) {
        this.orderList[key].forEach((item, index) => {
          // 存在交易号时 key等于交易号
          if (item.transCode) {
            if (!selItems[item.transCode]) {
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
              if (!this.orderList[key].length) {
                delete this.orderList[key]
              }
            }
          }
          this.selItems = {};
          this.matterModifyClass = false;
        }
      })
    },
    // 提价订单
    submitOrder() {
      /** 
       * @warn    提示文字
       * @dateSet   提交数据
       * 
       * @dealerConfig  <往来部分> 配置
       * @dealerInfo  <往来部分> 信息
       * @validateMap <仓库 库位> 校验字段
       * 
       */ 
      
      let warn = '', dataSet = [], 
          dealerInfo = this.dealerInfo, 
          dealerConfig = this.dealerConfig;
      let validateMap = [
        {
          key: 'warehouse',
          childKey: 'warehouseCode',
          message: '仓库'
        },
        {
          key: 'warehouseStoreInfo',
          childKey: 'warehouseCode',
          message: '库位'
        }
      ];
      
      // 校验 <往来部分> 必填字段
      warn = this.verifyData(dealerConfig, dealerInfo);

      if (!warn) {
        validateMap.every(item => {
          if (item.childKey && !this[item.key][item.childKey]) {
            warn = `请选择${item.message}`;
            return false
          }
          else if (!this[item.key]) {
            warn = `请选择${item.message}`;
            return false
          }
          return true
        });
      }

      if (!warn && !Object.keys(this.orderList).length) {
        warn = '请选择物料'
      }

      // 组装dataSet
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          let oItem = {};
          for (let sItem of this.submitMatterField) {
            if (!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]) {
              warn = `${sItem.text}不为空`
              break;
            }
            oItem[sItem.fieldCode] = item[sItem.fieldCode] != null ? item[sItem.fieldCode] : null
          }
          dataSet.push(oItem);
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
            modifer: this.transCode ? this.formData.handler : '',
            dealerDebitContactPersonName: this.contactInfo.dealerName || '', // 联系人姓名
            dealerDebitContactInformation: this.contactInfo.dealerMobilePhone || '', // 联系人手机
            containerOutWarehouseManager: this.warehouse.containerOutWarehouseManager || null, // 仓库管理员
            handlerEntity: this.entity.dealerName,
            drDealerLogisticsTerms: this.dealerInfo.dealerLogisticsTerms,
            outPut: {
              dealerDebit: this.dealerInfo.dealerCode, // 客户编码
              drDealerLabel: this.dealerInfo.dealerLabelName || '客户', // 客户页签
              drDealerPaymentTerm: this.dealerInfo.paymentTerm, // 结算方式
              daysOfAccount: this.dealerInfo.pamentDays,
              accountExpirationDate: this.dealerInfo.accountExpirationDate,
              containerCodeOut: this.warehouse.warehouseCode, // 仓库编码
              project: this.project.projectName || null, // 项目
              departmentName: this.formData.handlerUnitName, // 人员所属部门
              storehouseOutCode: this.warehouseStoreInfo.warehouseCode, // 库位编码
              dataSet
            }
          };
          // 重新提交
          if (this.transCode && !this.isModify) {
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
          if (!this.transCode) {
            delete submitData.biReferenceId
          }
          if (!this.processCode.length) { // 无工作流
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
      })
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
        let orderList = {};
        // 获取合计
        let {outPut} = formData;
        let {dataSet = []} = outPut;
        for (let item of dataSet) {
          item.transCode = item.transMatchedCode;
          item.qtyBal = item.thenQtyBal;
          item.qtyStockBal = item.thenQtyStock,
          item.inventoryPic = item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg();
          item.inventoryName = item.inventoryName_outPutMatCode;
          item.inventoryCode = item.outPutMatCode;
          item.specification = item.specification_outPutMatCode;
          item.processing = item.tdProcessing;
          item.qty = item.thenTotalQtyBal;
          item.stockQty = item.thenLockQty;
          item.clientInventoryName = item.dealerInventoryName;
          item.clientInventoryCode = item.dealerInventoryCode;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        }
        this.matterList = dataSet;
        // 客户信息
        this.dealerInfo = {
          creatorName: formData.dealerDebitContactPersonName, // 客户名
          dealerName: outPut.dealerName_dealerDebit, // 公司名
          dealerName_dealerDebit: outPut.dealerName_dealerDebit,
          dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
          dealerCode: outPut.dealerDebit, // 客户编码
          dealerLabelName: outPut.drDealerLabel, // 关系标签
          province: outPut.province_dealerDebit, // 省份
          city: outPut.city_dealerDebit, // 城市
          county: outPut.county_dealerDebit, // 地区
          address: outPut.address_dealerDebit, // 详细地址
          paymentTerm: outPut.drDealerPaymentTerm,
          drDealerPaymentTerm: outPut.drDealerPaymentTerm,
          dealerLogisticsTerms: formData.drDealerLogisticsTerms,
          drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
          pamentDays: outPut.daysOfAccount,
          daysOfAccount: outPut.daysOfAccount,
          accountExpirationDate: outPut.accountExpirationDate,
        };
        this.contactInfo = {
          dealerName: formData.dealerDebitContactPersonName, // 联系人姓名
          dealerMobilePhone: formData.dealerDebitContactInformation, // 联系人手机
        };
        // 仓库信息
        this.warehouse = {
          warehouseCode: outPut.containerCodeOut,
          warehouseName: outPut.warehouseName_containerCodeOut,
          warehouseType: outPut.warehouseType_containerCodeOut,
          warehouseProvince: outPut.warehouseProvince_containerCodeOut,
          warehouseCity: outPut.warehouseCity_containerCodeOut,
          warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
          warehouseAddress: outPut.warehouseAddress_containerCodeOut,
          containerOutWarehouseManager: formData.containerOutWarehouseManager, // 仓库管理员
        };
        this.warehouseStoreInfo = {
          warehouseCode: outPut.storehouseOutCode,
          warehouseName: outPut.warehouseName_storehouseOutCode,
          warehouseType: outPut.warehouseType_storehouseOutCode,
          warehouseProvince: outPut.warehouseProvince_storehouseOutCode,
          warehouseCity: outPut.warehouseCity_storehouseOutCode,
          warehouseDistrict: outPut.warehouseDistrict_storehouseOutCode,
          warehouseAddress: outPut.warehouseAddress_storehouseOutCode,
        };
        if (this.matterParams.data) {
          if (this.matterParams.data.whCode != null) {
            this.matterParams.data.whCode = this.warehouse.warehouseCode
          }
          if (this.matterParams.data.dealerCode != null) {
            this.matterParams.data.dealerCode = this.dealerInfo.dealerCode
          }
          if (this.matterParams.data.storehouseCode != null) {
            this.matterParams.data.storehouseCode = this.warehouseStoreInfo.warehouseCode;
          }
        }
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
          drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
        }
        this.project = {
          projectName: outPut.project
        };
        this.biReferenceId = formData.biReferenceId;
        this.orderList = orderList;
        this.$loading.hide();
      })
    },
    // 保存草稿数据
    hasDraftData() {
      // 是否选择项目
      if (!Object.values(this.orderList).length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          project: this.project,
          formData: this.formData,
          orderList: this.orderList,
          warehouse: this.warehouse,
          dealerInfo: this.dealerInfo,
          contactInfo: this.contactInfo,
          matterParams: this.matterParams,
          warehouseStoreInfo: this.warehouseStoreInfo,
        }
      };
    },
    // 提交字段校验
    checkAmt(item, key, val) {
      let { tdQty, locationStock } = item;

      item[key] = Math.abs(toFixed(val));
      
      if ( tdQty > locationStock ) {
        item.tdQty = locationStock;
      }
    }
  },
  created() {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      let draft = JSON.parse(data);
      this.project = draft.project;
      this.formData = draft.formData;
      this.orderList = draft.orderList;
      this.warehouse = draft.warehouse;
      this.dealerInfo = draft.dealerInfo;
      this.contactInfo = draft.contactInfo;
      this.warehouseStoreInfo = draft.warehouseStoreInfo
    }
  },
  updated() {
    let draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY));

    if (draft && this.matterParams.data) {
      this.matterParams = draft.matterParams;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
</style>
