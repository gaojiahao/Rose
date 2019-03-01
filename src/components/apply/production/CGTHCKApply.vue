<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo" :dealer-params="dealerParams"
                         dealerTitle="供应商" @sel-contact="selContact" :defaultContact="contactInfo"></pop-dealer-list>
        <!-- 结算方式 -->
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo"
                           v-model="dealerInfo"></dealer-other-part>
        <!-- 仓库-->
        <pop-warehouse-list isRequired :default-value="warehouse" @sel-item="selWarehouse"
                            :default-store="warehouseStoreInfo" @get-store="getStore"
                            is-show-store></pop-warehouse-list>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop"
                           :show-matter-pop="showMatterPop" :filter-list="filterList" :actions="actions"
                           :btnInfo="btnInfo" :matter-list="orderList" :default-value="matterList"
                           :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig"
                           :order-list-title="orderListTitle" :matter-params="matterParams" :add-matter-fn="addMatter"
                           :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
                           :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify"
                           :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
                           :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm"
                           :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify" :maxField="'storehouseQtyBal'">
        </apply-matter-part>

        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部操作栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
  // vux插件引入
  import {XTextarea, XInput, Cell, Group} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {
    saveAndStartWf,
    getBaseInfoData,
    saveAndCommitTask,
    commitTask,
    getDictByType,
    submitAndCalc,
    updateData
  } from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import RNumber from 'components/RNumber'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
  import OpButton from 'components/apply/commonPart/OpButton'
  // 公共方法
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'CGTHCK_DATA';

  export default {
    data() {
      return {
        orderList: {},
        showDealerPop: false, // 是否显示供应商的popup
        dealerInfo: {}, // 供应商客户信息
        formData: {
          biId: '',
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        showWarehousePop: false,
        warehouse: {
          warehouseType: '一般部门仓',
          warehouseName: '原料仓',
          warehouseCode: 'MA0001',
        }, // 选中仓库属性
        warehouseStoreInfo: {}, // 库位信息
        transCode: '',
        biReferenceId: '',
        actions: [],
        taskId: '',
        showMaterielPop: false,
        showMatterPop: false,
        modifyIndex: null,
        modifyKey: null,
        selItems: [],
        contactInfo: {},
        filterList: [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          }, {
            name: '订单号',
            value: 'transCode',
          },
        ],
        numMap: {},
      }
    },
    computed: {
      // TODO 将orderList转为数组
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
    components: {
      XTextarea, XInput, RNumber, Cell, Group,
      PopDealerList, PopWarehouseList,  PopSingleSelect, PopMatter, RPicker, PopBaseinfo, DealerOtherPart,
      ApplyMatterPart, OpButton,
    },
    mixins: [applyCommon],
    methods: {
      // TODO 选中的供应商
      selDealer(val) {
        let [sel] = JSON.parse(val);
        this.dealerInfo = sel;
        this.dealerInfo.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
        if (this.matterParams.data && this.matterParams.data.dealerCode != null) {
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode
          this.orderList = {};
        }
      },
      selContact(val) {
        this.contactInfo = {...val};
      },
      // TODO 选中仓库
      selWarehouse(val) {
        this.warehouse = JSON.parse(val);
        if (this.matterParams.data.whCode != null) {
          this.matterParams.data.whCode = this.warehouse.warehouseCode;
          this.orderList = {};
        }
      },
      // TODO 选择的库位
      getStore(val) {
        this.warehouseStoreInfo = {...val};
        if (this.matterParams.data && this.matterParams.data.storehouseCode != null) {
          this.matterParams.data.storehouseCode = this.warehouseStoreInfo.warehouseCode;
          this.orderList = {};
        }
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          let key = `${item.transCode}_${item.inventoryCode}`;
          let orderListKey = item.transCode ? item.transCode : 'noCode';
          let {
            tdQty = '',
            price = item.price,
            taxRate = item.taxRate || this.taxRate,
          } = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.price = price;
          item.taxRate = taxRate;
          item.tdProcessing = item.processing;
          item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
          item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
          item.assMeasureDescription = item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
          if (!orderList[orderListKey]) {
            orderList[orderListKey] = [];
          }
          orderList[orderListKey].push(item);
        });
        this.orderList = orderList;
      },
      // TODO 显示物料修改的pop
      getMatterModify(item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
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
      // TODO 查找数据索引
      findIndex(arr, sItem){
        return arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
      },
      // 选择要删除的物料
      delClick(sItem, index, key) {
        let arr = this.selItems;
        let delIndex = this.findIndex(arr, sItem);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.selItems, sItem) !== -1;
      },
      // 全选
      checkAll() {
        if (this.selItems.length === this.matterList.length) {
          this.selItems = [];
          return
        }
        this.selItems = JSON.parse(JSON.stringify(this.matterList));
      },
      // 删除选中的
      deleteCheckd() {
        this.$vux.confirm.show({
          content: '确认删除?',
          // 确定回调
          onConfirm: () => {
            let orderList = {};
            let remainder = this.matterList.filter((item, index) => this.findIndex(this.selItems, item) === -1); // 没被删除的
            remainder.forEach(item => {
              let orderListKey = item.transCode ? item.transCode : 'noCode';
              if (!orderList[orderListKey]) {
                orderList[orderListKey] = []
              }
              orderList[orderListKey].push(item);
            });
            this.orderList = orderList;
            this.selItems = [];
            this.matterModifyClass = false;
          }
        })
      },
      // TODO 新增更多订单
      addMatter() {
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            // 存储已输入的价格
            this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
          }
        }
        this.showMaterielPop = !this.showMaterielPop;
      },
      // TODO 检查金额，取正数、保留两位小数
      checkAmt(item, key, val) {
        let {storehouseQtyBal} = item;
        val = Math.abs(toFixed(val));
        switch (key) {
          case 'tdQty':
            if (storehouseQtyBal && val > storehouseQtyBal) {
              val = storehouseQtyBal;
            }
            break;
        }
        item[key] = val;
      },
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        let validateMap = [
          {
            key: 'dealerInfo',
            childKey: 'dealerCode',
            message: '供应商信息'
          }, {
            key: 'dealerInfo',
            childKey: 'drDealerPaymentTerm',
            message: '结算方式'
          }, {
            key: 'warehouse',
            message: '仓库'
          }, {
            key: 'warehouseStoreInfo',
            childKey: 'warehouseCode',
            message: '库位'
          },
        ];
        let submitMatterField = this.submitMatterField;
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
        if (!warn && !Object.keys(this.orderList).length) {
          warn = '请选择物料'
        }
        // 组装dataSet
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            let oItem = {};
            for (let sItem of submitMatterField) {
              let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
              if (!sItem.hidden && !sItem.allowBlank && !val) {
                if(sItem.text) warn = `${sItem.text}不为空`;
                break;
              }
              oItem[sItem.fieldCode] = val !== null ? val !== undefined ? val : '' : null;
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
                createdBy: this.formData.handler
              }
            };
            formData = {
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              creator: this.transCode ? this.formData.handler : '',
              modifer: this.transCode ? this.formData.handler : '',
              dealerDebitContactPersonName: this.contactInfo.dealerName || '', // 联系人姓名
              dealerDebitContactInformation: this.contactInfo.dealerMobilePhone || '', // 联系人手机
              containerOutWarehouseManager: this.warehouse.containerInWarehouseManager || null,
              outPut: {
                dealerDebit: this.dealerInfo.dealerCode, // 供应商编码
                drDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 供应商页签
                drDealerPaymentTerm: this.dealerInfo.drDealerPaymentTerm,
                containerCodeOut: this.warehouse.warehouseCode, // 仓库编码
                storehouseOutCode: this.warehouseStoreInfo.warehouseCode, // 仓库编码
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
              submitData.biReferenceId = this.biReferenceId;
            }
            if(this.isModify) {
              operation = updateData;
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
          let orderList = {};
          // 获取合计
          let {outPut, dealerDebit} = formData;
          let {dataSet = []} = outPut;
          let submitMatterField = this.submitMatterField;
          for (let item of dataSet) {
            let orderListKey = item.orderCode ? item.orderCode : 'noCode';
            for (let sItem of submitMatterField) {
              let key = sItem.displayField || sItem.showFieldCode || sItem.fieldCode;
              item[key] = item[sItem.fieldCode];
            }
            item.inventoryPic = item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg();
            item.processing = item.tdProcessing;
            item.inventoryName = item.inventoryName_outPutMatCode;
            item.specification = item.specification_outPutMatCode;
            item.measureUnit = item.measureUnit_outPutMatCode;
            delete item.orderCode; // 去除orderCode，否则物料列表组件会选不上
            if (!orderList[orderListKey]) {
              orderList[orderListKey] = [];
            }
            orderList[orderListKey].push(item);
          }
          // 供应商信息
          this.dealerInfo = {
            creatorName: formData.dealerName_dealerDebit, // 客户名
            dealerName: outPut.dealerName_dealerDebit, // 公司名
            dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
            dealerDebitContactPersonName: formData.dealerDebitContactPersonName, // 联系人
            dealerCode: outPut.dealerDebit, // 客户编码
            paymentTerm: outPut.drDealerPaymentTerm,
            drDealerPaymentTerm: outPut.drDealerPaymentTerm,
            dealerLabelName: outPut.drDealerLabel, // 关系标签
            province: outPut.province_dealerDebit, // 省份
            city: outPut.city_dealerDebit, // 城市
            county: outPut.county_dealerDebit, // 地区
            address: outPut.address_dealerDebit, // 详细地址
          };
          // 供应商联系人信息
          this.contactInfo = {
            dealerName: formData.dealerDebitContactPersonName,
            dealerMobilePhone: formData.dealerDebitContactInformation
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
            containerInWarehouseManager: outPut.containerInWarehouseManagerOut,
          };
          this.warehouseStoreInfo = {
            warehouseCode: outPut.storehouseOutCode,
            warehouseName: outPut.warehouseName_storehouseOutCode,
            warehouseType: outPut.warehouseType_containerCodeOut,
            warehouseProvince: outPut.warehouseProvince_containerCodeOut,
            warehouseCity: outPut.warehouseCity_containerCodeOut,
            warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
            warehouseAddress: outPut.warehouseAddress_containerCodeOut,
          };
          // 物料请求参数
          this.matterParams.data = {
            dealerCode: this.dealerInfo.dealerCode,
            whCode: this.warehouse.warehouseCode,
            storehouseCode: this.warehouseStoreInfo.warehouseCode,
          };
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
          this.biReferenceId = formData.biReferenceId;
          this.orderList = orderList;
          this.$loading.hide();
        })
      },
      // TODO 是否保存草稿
      hasDraftData() {
        if (!this.matterList.length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            dealer: this.dealerInfo,
            contactInfo: this.contactInfo,
            warehouse: this.warehouse,
            warehouseStoreInfo: this.warehouseStoreInfo,
            formData: this.formData,
            orderList: this.orderList,
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
          // 获取合计
          let {inPut} = formData;
          let {dataSet = []} = inPut;
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
          // 供应商信息
          this.dealerInfo = {
            creatorName: formData.dealerCreditContactPersonName, // 客户名
            dealerName: outPut.dealerName_dealerCodeCredit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerCode: outPut.dealerCode_dealerCodeCredit, // 客户编码
            dealerLabelName: outPut.crDealerLabel, // 关系标签
            province: outPut.province_dealerCodeCredit, // 省份
            city: outPut.city_dealerCodeCredit, // 城市
            county: outPut.county_dealerCodeCredit, // 地区
            address: outPut.address_dealerCodeCredit, // 详细地址
          };
          // 物料请求参数
          this.matterParams = {
            dealerCode: this.dealerInfo.dealerCode
          };

          this.orderList = {
            [this.relationKey]: dataSet,
          };
          this.DealerPaymentTerm = formData.drDealerPaymentTerm || '现付';
          this.$loading.hide();
        })
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.orderList = draft.orderList;
        this.dealerInfo = draft.dealer;
        this.contactInfo = draft.contactInfo;
        this.warehouse = draft.warehouse;
        this.warehouseStoreInfo = draft.warehouseStoreInfo;
        this.formData = draft.formData;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
</style>
