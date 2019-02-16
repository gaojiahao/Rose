<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo"
                         dealerTitle="供应商" :default-contact="contactInfo"
                         :dealer-params="dealerParams"></pop-dealer-list>
        <!--结算方式-->
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
                           :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="rNumber" slot-scope="{item}">
            <r-number :num="item.qualityQty" :max="Number(item.qtyBal)" v-model="item.qualityQty"></r-number>
          </template>
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
  import {Cell, XInput, Datetime, XTextarea, dateFormat, Group} from 'vux'
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
  import PopOrderList from 'components/Popup/PopOrderList'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RNumber from 'components/RNumber'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RDropdown from 'components/RDropdown'
  import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
  import OpButton from 'components/apply/commonPart/OpButton'
  // 公共方法
  import {accAdd, accMul, accDiv, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'CGRK_DATA';

  export default {
    name: 'ApplyCGRKForm',
    data() {
      return {
        orderList: {},
        // matterList: [], // 订单列表
        showDealerPop: false, // 是否显示供应商的popup
        dealerInfo: {}, // 供应商客户信息
        contactInfo: {},
        formData: {
          biId: '',
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        showWarehousePop: false,
        warehouse: {
          warehouseCode: 'MA0001',
          warehouseName: '原料仓',
          warehouseType: '一般部门仓'
        }, // 选中仓库属性
        warehouseStoreInfo: {}, // 库位信息
        taxRate: 0.16, // 税率
        transCode: '',
        formViewUniqueId: 'fed81800-4c34-44a9-b517-c3fd9f2ab57d', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
        matter: {},
        showMatterPop: false,
        modifyIndex: null,
        modifyKey: null,
        filterList: [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          },
          {
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
    mixins: [applyCommon],
    components: {
      Cell, RDropdown, XInput, Group,
      XTextarea, Datetime, PopOrderList, RNumber,
      PopDealerList, PopWarehouseList,
      PopSingleSelect, PopMatter, RPicker, PopBaseinfo, DealerOtherPart,
      ApplyMatterPart, OpButton,
    },
    methods: {
      // TODO 选中的供应商
      selDealer(val) {
        let [sel] = JSON.parse(val);
        let day = 24 * 3600 * 1000;
        let {pamentDays} = sel;
        let accountExpirationDate = pamentDays ? dateFormat(Date.now() + accMul(pamentDays, day), 'YYYY-MM-DD') : '';
        this.dealerInfo = {
          ...sel,
          accountExpirationDate: accountExpirationDate,
          daysOfAccount: pamentDays,
          crDealerPaymentTerm: sel.paymentTerm,
        };
        if (this.matterParams.data && this.matterParams.data.dealerCode != null) {
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode
          this.orderList = {};
        }
      },
      // TODO 选择联系人
      selContact(val) {
        this.contactInfo = {...val};
      },
      // TODO 选中仓库
      selWarehouse(val) {
        this.warehouse = JSON.parse(val);
      },
      // TODO 选择的库位
      getStore(val) {
        this.warehouseStoreInfo = {...val};
      },
      // TODO 显示物料修改的pop
      getMatterModify(item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          let key = `${item.transCode}_${item.inventoryCode}`;
          let orderListKey = item.transCode ? item.transCode : 'noCode';
          let {
            qualityQty = item.qtyBal,
            price = item.price,
            taxRate = item.taxRate,
            validUntil = item.validUntil,
            productionDate = dateFormat(item.productionDate, 'YYYY-MM-DD'),
            thenQtyBal = item.salesOutQty
          } = this.numMap[key] || {};
          item.tdQty = qualityQty; // 合格数
          item.price = price;
          item.qualityQty = qualityQty; // 送货数
          item.samplesQty = 0; // 取样数
          item.checkLossQty = 0; // 检损数
          item.lockQty = qualityQty; // 净入库数
          item.differenceNum = 0; // 退货数，送货数 - 合格数
          item.taxRate = taxRate;
          item.productionDate = productionDate;
          item.validUntil = validUntil;
          item.tdProcessing = item.processing;
          item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
          item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
          item.assMeasureDescription = item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
          if (!orderList[orderListKey]) {
            orderList[orderListKey] = [];
          }
          orderList[orderListKey].push(item);
          // this.getMoreUnit(item);
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
      // TODO 查找数据索引
      findIndex(arr, sItem){
        return arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
      },
      // 选择要删除的物料
      delClick(sItem, index, key) {
        let arr = this.selItems;
        let delIndex = this.findIndex(arr, sItem);
        //若存在重复的 则清除
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
      // 计算有效期
      checkDate(modifyMatter, e) {
        let productionDate = new Date(e).getTime(),
          day = 24 * 3600 * 1000;
        modifyMatter.validUntil = productionDate ? dateFormat(productionDate + accMul(modifyMatter.keepingDays, day), 'YYYY-MM-DD') : '';
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
            childKey: 'crDealerPaymentTerm',
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
        warn = this.validateSubmitVal(validateMap);
        if (!warn && !this.matterList.length) {
          warn = '请选择物料'
        }
        if (!warn) {
          let submitMatterField = this.submitMatterField;
          // 组装dataSet
          for (let items of Object.values(this.orderList)) {
            for (let item of items) {
              let oItem = {};
              for (let sItem of submitMatterField) {
                let val = this.getMatterItemVal(item, sItem);
                if (!sItem.hidden && !sItem.allowBlank && !val) {
                  warn = `${sItem.text}不为空`;
                  break;
                }
                oItem[sItem.fieldCode] = val !== null ? val !== undefined ? val : '' : null;
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
              creator: this.formData.handler,
              modifer: this.formData.handler,
              dealerCreditContactPersonName: this.contactInfo.dealerName || '', // 联系人姓名
              dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '', // 联系人手机
              containerInWarehouseManager: this.warehouse.containerInWarehouseManager || null,
              inPut: {
                dealerCodeCredit: this.dealerInfo.dealerCode, // 供应商编码
                crDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 供应商页签
                crDealerPaymentTerm: this.dealerInfo.crDealerPaymentTerm,
                daysOfAccount: this.dealerInfo.daysOfAccount, // 账期天数
                accountExpirationDate: this.dealerInfo.accountExpirationDate, // 账期到期日
                containerCode: this.warehouse.warehouseCode, // 仓库编码
                storehouseInCode: this.warehouseStoreInfo.warehouseCode, // 库位编码
                dataSet
              }
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
          let {inPut, dealerDebit} = formData;
          let {dataSet = []} = inPut;
          let orderList = {};
          let submitMatterField = this.submitMatterField;
          for (let item of dataSet) {
            for (let sItem of submitMatterField) {
              let key = sItem.displayField || sItem.showFieldCode || sItem.fieldCode;
              // dataIndexMap中noTaxPrice的映射为price，这里需要判断一下
              if (sItem.fieldCode === 'noTaxPrice') {
                key = 'noTaxPrice';
              }
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
          // 供应商信息
          this.dealerInfo = {
            creatorName: formData.dealerCreditContactPersonName, // 客户名
            dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerCode: inPut.dealerCode_dealerCodeCredit, // 客户编码
            dealerLabelName: inPut.crDealerLabel, // 关系标签
            province: inPut.province_dealerCodeCredit, // 省份
            city: inPut.city_dealerCodeCredit, // 城市
            county: inPut.county_dealerCodeCredit, // 地区
            address: inPut.address_dealerCodeCredit, // 详细地址
            accountExpirationDate: inPut.accountExpirationDate,
            crDealerPaymentTerm: inPut.crDealerPaymentTerm,
            daysOfAccount: inPut.daysOfAccount,
          };
          this.contactInfo = {
            dealerName: formData.dealerCreditContactPersonName,
            dealerMobilePhone: formData.dealerCreditContactInformation,
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
            containerInWarehouseManager: inPut.containerInWarehouseManager,
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
          // 物料请求参数
          this.matterParams.data = {
            dealerCode: this.dealerInfo.dealerCode,
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
            orderList: this.orderList,
            dealer: this.dealerInfo,
            warehouse: this.warehouse,
            warehouseStoreInfo: this.warehouseStoreInfo,
            formData: this.formData,
            contactInfo: this.contactInfo,
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
            address: formData.order.address_dealerDebit,
            crDealerPaymentTerm: order.drDealerPaymentTerm,
          };

          // 物料请求参数
          this.matterParams = {
            dealerCode: this.dealerInfo.dealerCode
          };

          this.orderList = {
            [this.relationKey]: dataSet,
          };
          this.$loading.hide();
        })
      },
      // TODO 选中辅助计量
      moreUnitSelected(val) {
        this.matter.assMeasureUnit = val.invSubUnitName;
        this.matter.assistQty = val.invSubUnitMulti;
      },
      // TODO 数字校验
      checkAmt(item, key, val) {
        let {qtyBal} = item;
        val = Math.abs(toFixed(val));
        switch (key) {
          case 'qualityQty':
            if (qtyBal && val > qtyBal) {
              val = qtyBal;
            }
            item.tdQty = val;
            break;
        }
        item[key] = val;
      },
      // TODO 计算物料相关值
      calcMatter(item) {
        let {price = 0, qualityQty = 0, taxRate = 0} = item;
        item.tdQty = qualityQty;
        item.lockQty = qualityQty; // 净入库数
        item.assistQty = toFixed(accDiv(qualityQty, item.assMeasureScale));
        item.noTaxPrice = toFixed(accDiv(price, accAdd(1, taxRate)), 6);
        item.tdAmount = toFixed(accMul(price, item.assistQty));
        item.taxAmount = toFixed(accMul(item.assistQty, taxRate, item.noTaxPrice));
        item.noTaxAmount = toFixed(accSub(item.tdAmount, item.taxAmount));
      },
      // TODO 获取物料当前字段的值
      getMatterItemVal(item, sItem) {
        let valList = ['fieldCode', 'displayField', 'showFieldCode'];
        let val = '';
        valList.every(list => {
          val = item[sItem[list]];
          return !(val || val === 0)
        });
        return val;
      },
      // TODO 校验提交数据
      validateSubmitVal(validateList = []) {
        let warn = '';
        validateList.every(item => {
          if (item.childKey && !this[item.key][item.childKey]) {
            warn = `请选择${item.message}`;
            return false
          } else if (!this[item.key]) {
            warn = `请选择${item.message}`;
            return false
          }
          return true
        });
        return warn;
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.orderList = draft.orderList;
        this.dealerInfo = draft.dealer;
        this.warehouse = draft.warehouse;
        this.warehouseStoreInfo = draft.warehouseStoreInfo;
        this.formData = draft.formData;
        this.contactInfo = draft.contactInfo;
        sessionStorage.removeItem(DRAFT_KEY);
      }

    },
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
</style>
