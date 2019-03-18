<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"
                      :status-data="currentStage" v-model="formData.biProcessStatus"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :default-contact="contactInfo" @sel-dealer="selDealer"
                         :dealer-params="dealerParams" @sel-contact="selContact"></pop-dealer-list>
        <!-- 仓库、库位-->
        <pop-warehouse-list isRequired :default-value="warehouse" @sel-item="selWarehouse"
                            :default-store="warehouseStoreInfo"
                            @get-store="getStore" is-show-store></pop-warehouse-list>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
                           :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" 
                           :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
                           :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
                           :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
                           :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="rNumber" slot-scope="{item}">
            <r-number :num="item.tdQty" :max="Number(item.thenQtyBal)" v-model="item.tdQty"></r-number>
          </template>
        </apply-matter-part>
        <!-- 项目 -->
        <pop-project-list :defaultValue="project" @sel-project="selProject"></pop-project-list>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部操作栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="checkList.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux组件引入
import { dateFormat, XTextarea } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { updateData, saveAndStartWf, saveAndCommitTask } from 'service/common/commonService'
// mixins 引入
import applyCommon from 'mixins/applyCommon'
// 组件引入
import RNumber from 'components/public/RNumber'
import PopDealerList from 'components/Popup/PopDealerList'
import OpButton from 'components/apply/commonPart/OpButton'
import PopProjectList from 'components/Popup/PopProjectList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 公共方法
import {accAdd, accMul} from 'plugins/calc/decimalsAdd'
import {toFixed} from '@/plugins/calc'

const DRAFT_KEY = 'XSTH_DATA';
export default {
  name: 'ApplyXSTHForm',
  mixins: [applyCommon],
  components: {
    XTextarea,
    RNumber, OpButton, PopBaseinfo, PopDealerList, 
    PopProjectList, PopWarehouseList, DealerOtherPart, ApplyMatterPart
  },
  data() {
    return {
      taxRate: 0.16, // 税率
      formViewUniqueId: '37d1a36b-826f-4c2c-88cb-5188eb8c32cb', // 修改时的UniqueId
      warehouse: {  // 选中仓库属性
        warehouseType: '一般部门仓',
        warehouseName: '不良品仓',
        warehouseCode: 'BL0001',
      }, 
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        }, {
          name: '销售出库单',
          value: 'transCode',
        }
      ],
      taskId: '',
      transCode: '',
      biReferenceId: '',
      matter: {},
      numMap: {},   // 用于记录订单物料的数量和价格
      project: {}, // 项目
      formData: {},
      orderList: {}, // 订单列表
      dealerInfo: {}, // 客户客户信息
      contactInfo: {},
      warehouseStoreInfo: {}, // 库位信息
      actions: [],
      modifyKey: null,
      modifyIndex: null,
      showMatterPop: false,
      showMaterielPop: false, // 是否显示物料的popup
    }
  },
  computed: {
    // 基于 orderList 此处重组 matterList 数据
    matterList: {
      get: function() {
        let arr = [];
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            arr.push(item);
          }
        }
        return arr;
      },
      set: function() {}
    }
  },
  methods: {
    // 选中的客户
    selDealer(val) {
      let [sel] = JSON.parse(val);
      this.dealerInfo = {
        ...sel,
        daysOfAccount: sel.pamentDays,
        drDealerPaymentTerm: sel.paymentTerm,
        drDealerLogisticsTerms: sel.dealerLogisticsTerms,
      };
      this.dealerInfo.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
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
    },
    // 选择的库位
    getStore(val) {
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
    getMatter() {
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      let orderList = JSON.parse(JSON.stringify(this.orderList));
      sels.forEach(item => {
        let key = `${item.transCode}_${item.inventoryCode}`;
        let orderListKey = item.transCode ? item.transCode : 'noCode';
        let {
          tdQty = '',
          taxRate = item.taxRate,
          price = item.salesOutPrice,
          thenQtyBal = item.salesOutQty,
          promDeliTime = dateFormat(item.promDeliTime, 'YYYY-MM-DD'),
        } = this.numMap[key] || {};
        item.thenQtyBal = thenQtyBal;
        item.tdQty = tdQty;
        item.price = price;
        item.taxRate = taxRate;
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription = item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
        if (!orderList[orderListKey]) {
          orderList[orderListKey] = [];
        }
        orderList[orderListKey].push(item);
      });
      this.numMap = {};
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
    // 新增更多订单
    addMatter() {
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          // 存储已输入的价格
          this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
        }
      }
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 提价订单
    submitOrder() {
      let warn = '';
      let dataSet = [];
      let validateMap = [
        {
          key: 'dealerInfo',
          childKey: 'dealerCode',
          message: '客户'
        },
        {
          key: 'warehouse',
          message: '仓库'
        },
        {
          key: 'warehouseStoreInfo',
          childKey: 'warehouseCode',
          message: '库位'
        }
      ];
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
      let submitMatterField = this.submitMatterField;
      // 组装dataSet
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          let oItem = {};
          for (let sItem of submitMatterField) {
            let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
            if (!sItem.hidden && !sItem.allowBlank && !val) {
              if (sItem.text) warn = `${sItem.text}不为空`;
              break;
            }
            oItem[sItem.fieldCode] = val !== null
                                      ? val !== undefined
                                          ? val
                                          : ''
                                      : null;
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
            dealerCreditContactPersonName: this.contactInfo.dealerName || '', // 联系人姓名
            dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '', // 联系人手机
            containerInWarehouseManager: this.warehouse.containerOutWarehouseManager || null, // 仓库管理员
            handlerEntity: this.entity.dealerName,
            inPut: {
              dealerCodeCredit: this.dealerInfo.dealerCode, // 客户编码
              crDealerLabel: this.dealerInfo.dealerLabelName || '客户', // 客户页签
              containerCode: this.warehouse.warehouseCode, // 仓库编码
              storehouseInCode: this.warehouseStoreInfo.warehouseCode,
              project: this.project.PROJECT_NAME, // 项目
              departmentName: this.formData.handlerUnitName, // 人员所属部门
              dataSet,
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
        let {inPut = {}} = formData;
        let {dataSet = []} = inPut;
        let submitMatterField = this.submitMatterField;
        for (let item of dataSet) {
          for (let sItem of submitMatterField) {
            let key = sItem.displayField || sItem.showFieldCode || sItem.fieldCode;
            item[key] = item[sItem.fieldCode];
          }
          let orderListKey = item.transCode ? item.transCode : 'noCode';
          item.inventoryPic = item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg();
          item.specification = item.specification_transObjCode;
          item.measureUnit = item.measureUnit_transObjCode;
          if (!orderList[orderListKey]) {
            orderList[orderListKey] = [];
          }
          orderList[orderListKey].push(item);
        }
        this.matterList = dataSet;
        // 客户信息
        this.dealerInfo = {
          dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
          dealerCode: inPut.dealerCodeCredit, // 客户编码
          dealerLabelName: inPut.crDealerLabel, // 关系标签
          province: inPut.province_dealerCodeCredit, // 省份
          city: inPut.city_dealerCodeCredit, // 城市
          county: inPut.county_dealerCodeCredit, // 地区
          address: inPut.address_dealerCodeCredit, // 详细地址
        };
        this.contactInfo = {
          dealerName: formData.dealerCreditContactPersonName, // 联系人姓名
          dealerMobilePhone: formData.dealerCreditContactInformation, // 联系人手机
        };
        // 仓库信息
        this.warehouse = {
          warehouseCode: inPut.containerCode,
          warehouseName: inPut.warehouseName_containerCode,
          warehouseType: inPut.warehouseType_containerCode,
          warehouseProvince: inPut.warehouseProvince_containerCode,
          warehouseCity: inPut.warehouseCity_containerCode,
          warehouseDistrict: inPut.warehouseDistrict_containerCode,
          warehouseAddress: inPut.warehouseAddress_containerCode,
          containerOutWarehouseManager: formData.containerOutWarehouseManager, // 仓库管理员
        };
        this.warehouseStoreInfo = {
          warehouseCode: inPut.storehouseInCode,
          warehouseName: inPut.warehouseName_storehouseInCode,
          warehouseType: inPut.warehouseType_storehouseInCode,
          warehouseProvince: inPut.warehouseProvince_storehouseInCode,
          warehouseCity: inPut.warehouseCity_storehouseInCode,
          warehouseDistrict: inPut.warehouseDistrict_storehouseInCode,
          warehouseAddress: inPut.warehouseAddress_storehouseInCode,
        };
        // 订单请求参数
        this.orderParams = {
          dealerCode: this.dealerInfo.dealerCode,
          whCode: this.warehouse.warehouseCode,
        };
        this.handlerDefault = {
          handler: formData.handler,
          handlerName: formData.handlerName,
          handlerUnit: formData.handlerUnit,
          handlerUnitName: formData.handlerUnitName,
          handlerRole: formData.handlerRole,
          handlerRoleName: formData.handlerRoleName,
        };
        this.matterParams.data = {
          dealerCode: this.dealerInfo.dealerCode,
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
          PROJECT_NAME: inPut.project,
          PROJECT_TYPE: inPut.projectType_project,
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
    // 获取关联数据
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
        // 获取合计
        let {order} = formData;
        //供应商信息展示
        this.dealerInfo = {
          city: formData.order.city_dealerDebit,
          dealerCode: formData.order.dealerDebit,
          county: formData.order.county_dealerDebit,
          address: formData.order.address_dealerDebit,
          dealerSubclass: formData.order.drAccountSub,
          province: formData.order.province_dealerDebit,
          paymentTerm: formData.order.drDealerPaymentTerm,
          dealerName: formData.order.dealerName_dealerDebit,
          creatorName: formData.dealerDebitContactPersonName,
          dealerMobilePhone: formData.dealerDebitContactInformation,
        }
        // 物料请求参数
        this.orderParams = {
          dealerCode: this.dealerInfo.dealerCode
        };
        this.$loading.hide();
      })
    },
    // 选中项目
    selProject(item) {
      this.project = {...item};
    },
    // 数字校验
    checkAmt(item) {
      let {thenQtyBal, tdQty, price, taxRate} = item;
      if (price) {
        item.price = Math.abs(toFixed(price));
      }
      if (taxRate) {
        item.taxRate = Math.abs(toFixed(taxRate));
      }
      tdQty = Math.abs(toFixed(tdQty));
      // 退货数量大于可退货数量
      if (thenQtyBal < tdQty) {
        tdQty = thenQtyBal;
      }
      item.tdQty = tdQty;
    },
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
      this.warehouseStoreInfo = draft.warehouseStoreInfo;
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
  @import '~scss/biz-app/bizApply';
</style>
