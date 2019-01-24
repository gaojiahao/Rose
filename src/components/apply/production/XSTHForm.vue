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
            <r-number :num="item.tdQty" :max="Number(item.thenQtyBal)" v-model="item.tdQty"></r-number>
          </template>
        </apply-matter-part>
        <!-- 项目 -->
        <pop-project-list :defaultValue="project" @sel-project="selProject"></pop-project-list>
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
  // vux组件引入
  import {
    Icon, Cell, Popup, Group, XInput, XTextarea, TransferDom, dateFormat, Datetime,
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {
    commitTask,
    saveAndStartWf,
    getBaseInfoData,
    saveAndCommitTask,
    submitAndCalc
  } from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import RAction from 'components/RAction'
  import RNumber from 'components/RNumber'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopOrderList from 'components/Popup/PopOrderList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import PopMatterList from 'components/Popup/PopMatterListTest'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import PopEntityList from 'components/Popup/PopEntityList'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
  import OpButton from 'components/apply/commonPart/OpButton'
  import PopProjectList from 'components/Popup/PopProjectList'
  // 公共方法
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'XSTH_DATA';
  export default {
    name: 'ApplyXSTHForm',
    mixins: [applyCommon],
    directives: {TransferDom},
    components: {
      Icon, Cell, Popup, Group, XTextarea,
      XInput, RAction, RNumber,
      PopOrderList, PopDealerList,
      PopSingleSelect, PopWarehouseList,
      PopEntityList, PopMatter,
      Datetime, RPicker, PopBaseinfo, PopMatterList, DealerOtherPart,
      ApplyMatterPart, OpButton, PopProjectList,
    },
    data() {
      return {
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
        orderList: {}, // 订单列表
        showMaterielPop: false, // 是否显示物料的popup
        dealerInfo: {}, // 客户客户信息
        formData: {
          drDealerLogisticsTerms: '', // 物流条件
          biComment: '', // 备注
        },
        submitSuccess: false, // 是否提交成功
        warehouse: {
          warehouseType: '一般部门仓',
          warehouseName: '不良品仓',
          warehouseCode: 'BL0001',
        }, // 选中仓库属性
        warehouseStoreInfo: {}, // 库位信息
        taxRate: 0.16, // 税率
        numMap: {}, // 用于记录订单物料的数量和价格
        transCode: '',
        formViewUniqueId: '37d1a36b-826f-4c2c-88cb-5188eb8c32cb', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
        matterList: [], // 物料列表，用于计算金额、请求单价
        project: {}, // 项目
        tmpItems: {},//选中的订单
        matter: {},
        showMatterPop: false,
        modifyIndex: null,
        modifyKey: null,
        contactInfo: {},
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写本次出库数量'
          }, {
            key: 'price',
            message: '请填写单价'
          }, {
            key: 'taxRate',
            message: '请填写税率'
          },
        ],
        showProjectPop: false,
      }
    },
    methods: {
      // TODO 选中的客户
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
      // TODO 选中仓库
      selWarehouse(val) {
        this.warehouse = JSON.parse(val);
      },
      // TODO 选择的库位
      getStore(val) {
        this.warehouseStoreInfo = {...val};
        if(this.matterParams.data && this.matterParams.data.storehouseCode != null) {
          this.matterParams.data.storehouseCode = this.warehouseStoreInfo.warehouseCode;
          this.matterList = [];
          this.orderList = {};
        }
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
      // TODO 选择物料，显示物料pop
      getMatter() {
        if (!this.dealerInfo.dealerCode) {
          this.$vux.alert.show({
            content: '请选择客户'
          })
          return
        }
        this.showMaterielPop = !this.showMaterielPop;
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
            price = item.salesOutPrice,
            taxRate = item.taxRate,
            promDeliTime = dateFormat(item.promDeliTime, 'YYYY-MM-DD'),
            thenQtyBal = item.salesOutQty
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
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
      delClick(sItem, index, key) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
        //若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
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
            let newArr = [];
            let keys = Object.keys(this.orderList);
            keys.forEach(item => {
              newArr = newArr.concat(this.orderList[item]);
            })
            this.selItems.forEach(SItem => {
              newArr.forEach(OItem => {
                if (OItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
                  let delArr = this.orderList[OItem.transCode];
                  let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
                  if (delIndex >= 0) {
                    // this.$refs.order.delSelItem(delArr[delIndex]);
                    delArr.splice(delIndex, 1);
                  }
                  if (!delArr.length) {
                    delete this.orderList[OItem.transCode];
                  }
                }
              });
              this.matterList.forEach((item, index) => {
                if (item.inventoryCode === SItem.inventoryCode) {
                  this.matterList.splice(index, 1);
                  index--;
                }
              })
            });
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
      // TODO 提价订单
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
                warn = `${sItem.text}不为空`;
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
              // modifer: this.transCode ? this.formData.handler : '',
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
            // item.transCode = item.transMatchedCode;
            item.inventoryPic = item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg();
            // item.inventoryName = item.inventoryName_transObjCode;
            // item.inventoryCode = item.inventoryCode_transObjCode;
            // item.processing = item.tdProcessing;
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
      // TODO 保存草稿数据
      hasDraftData() {
        // 是否选择项目
        if (!Object.values(this.orderList).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            orderList: this.orderList,
            warehouse: this.warehouse,
            warehouseStoreInfo: this.warehouseStoreInfo,
            dealerInfo: this.dealerInfo,
            contactInfo: this.contactInfo,
            formData: this.formData,
            warehouseStoreInfo: this.warehouseStoreInfo,
            project: this.project,
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
          let {order} = formData;
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
            paymentTerm: formData.order.drDealerPaymentTerm,
          }
          // 物料请求参数
          this.orderParams = {
            dealerCode: this.dealerInfo.dealerCode
          };

          // this.matterList = dataSet;
          // this.orderList = {
          //   [this.relationKey]: dataSet,
          // };
          this.$loading.hide();
        })
      },
      // TODO 选中项目
      selProject(item) {
        this.project = {...item};
      },
      // TODO 数字校验
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
        this.orderList = draft.orderList;
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            this.matterList.push(item)
          }
        }
        this.warehouse = draft.warehouse;
        this.warehouseStoreInfo = draft.warehouseStoreInfo;
        this.dealerInfo = draft.dealerInfo;
        this.contactInfo = draft.contactInfo;
        this.formData = draft.formData;
        this.warehouseStoreInfo = draft.warehouseStoreInfo;
        this.project = draft.project;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
</style>
