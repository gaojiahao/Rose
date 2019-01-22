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
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="matterList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="getMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
        </apply-matter-part>
        <!-- 项目 -->
        <pop-sodl-projectList :value="project" v-model="project"></pop-sodl-projectList>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount | numberComma}}
        <span class="taxAmount">[含税: ￥{{taxAmount | numberComma}}]</span>
      </span>
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : btnIsHide}" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline'
                v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='delete_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import { XTextarea, dateFormat } from 'vux'
  // 请求 引入
  import { getSOList } from 'service/detailService'
  import { commitTask, saveAndStartWf, saveAndCommitTask, submitAndCalc, requestData } from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopSodlProjectList from 'components/Popup/PopSODLProjectList'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
  // 公共方法
  import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
  import { toFixed } from '@/plugins/calc'

  const DRAFT_KEY = 'XSCK_DATA';
  export default {
    name: 'ApplyXSCKForm',
    mixins: [applyCommon],
    components: {
      XTextarea, PopBaseinfo, PopDealerList, PopWarehouseList,
      ApplyMatterPart, PopSodlProjectList, DealerOtherPart
    },
    data() {
      return {
        taxRate: 0.16, // 税率
        formViewUniqueId: '346ede09-ac6a-489a-9242-f385932a4443', // 修改时的UniqueId
        modifyKey: null,
        modifyIndex: null,
        showMatterPop: false,
        submitSuccess: false,       // 是否提交成功
        warehouse: {  // 选中仓库属性
          warehouseType: '一般部门仓',
          warehouseName: '成品仓',
          warehouseCode: 'FG0001',
        }, 
        taskId: '',
        transCode: '',
        biReferenceId: '',
        actions: [],
        matterList: [], // 物料列表，用于计算金额、请求单价
        numMap: {},                 // 用于记录订单物料的数量和价格
        matter: {},
        project: {},                // 项目
        orderList: {},              // 订单列表
        dealerInfo: {},             // 客户客户信息
        contactInfo: {},            // 联系人信息
        warehouseStoreInfo: {},     // 库位信息
        formData: {
          drDealerLogisticsTerms: '', // 物流条件
          biComment: '', // 备注
        },
      }
    },
    methods: {
      // TODO 选中的客户
      selDealer(val) {
        let [sel] = JSON.parse(val);
        let day = 24 * 3600 * 1000;
        let {pamentDays} = sel;
        let accountExpirationDate = pamentDays ? dateFormat(Date.now() + accMul(pamentDays, day), 'YYYY-MM-DD') : '';
        this.dealerInfo = {
          ...sel,
          accountExpirationDate: accountExpirationDate,
          daysOfAccount: sel.pamentDays,
          drDealerPaymentTerm: sel.paymentTerm,
          drDealerLogisticsTerms: sel.dealerLogisticsTerms,
        };
        if(this.matterParams.data && this.matterParams.data.dealerCode != null) {
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
        if(this.matterParams.data && this.matterParams.data.whCode != null) {
          this.matterParams.data.whCode = this.warehouse.warehouseCode;
          this.matterList = [];
          this.orderList = {};
        }
      },
      // 选择的库位
      getStore(val){
        console.log(val)
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
          // 请求物料辅助计量的数据
          for(let cItem of this.matterEditConfig.editPart){
            if(cItem.fieldCode === 'assMeasureUnit'){
              let requestParams = {
                url: cItem.dataSource.data.url,
                data: {
                  inventoryCode:  item.inventoryCode
                }
              }
              requestData(requestParams).then(({tableContent = []}) => {
                tableContent.forEach(mItem => {
                  mItem.name =  mItem.invSubUnitName;
                  mItem.value =  mItem.invSubUnitName;
                })
                cItem.remoteData = tableContent
              })
              break
            }
          }
          for(let key in this.dataIndexMap){
            // 格式化日期
            if(key === 'promDeliTime'){
              item[key] = dateFormat(item[this.dataIndexMap[key]], 'YYYY-MM-DD') || "";
            }
            else{
              item[key] = item[key] || item[this.dataIndexMap[key]];
            }
            
          }
          if(item.transCode){
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
            console.log(orderList)
          }
          else {
            if(!orderList['noCode']) {
              orderList['noCode'] = []
            }
            orderList['noCode'].push(item);

          }
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
        let delIndex = null;
        if(sItem.transCode){
          delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
        }
        else{
          delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
        }
        //若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        if(sItem.transCode){
          return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
        }
        else{
          return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
        }
        
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
            });
            this.selItems.forEach(SItem => {
              newArr.forEach(OItem => {
                if(SItem.transCode){
                  if (OItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
                    let delArr = this.orderList[OItem.transCode];
                    let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
                    if (delIndex >= 0) {
                      delArr.splice(delIndex, 1);
                    }
                    if (!delArr.length) {
                      delete this.orderList[OItem.transCode];
                    }
                  }
                }
                else{
                  if (OItem.inventoryCode === SItem.inventoryCode) {
                    let delArr = this.orderList['noCode'];
                    let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
                    if (delIndex >= 0) {
                      delArr.splice(delIndex, 1);
                    }
                    if (!delArr.length) {
                      delete this.orderList['noCode'];
                    }
                  }

                }
              });
              this.matterList.forEach((item, index) => {
                if(item.transCode){
                  if(item.transCode === SItem.transCode && item.inventoryCode === SItem.inventoryCode){
                    this.matterList.splice(index, 1);
                    index--;
                  }
                }
                else{
                  if (item.inventoryCode === SItem.inventoryCode) {
                    this.matterList.splice(index, 1);
                    index--;
                  }
                }
                
              })
            });
            this.selItems = [];
            this.matterModifyClass = false;
          }
        })

      },
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        let validateMap = [
          {
            key: 'dealerInfo',
            childKey: 'dealerCode',
            message: '客户信息'
          },
          {
            key: 'dealerInfo',
            childKey: 'paymentTerm',
            message: '结算方式'
          },
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
        if (!warn) {
          validateMap.every(item => {
            if (item.childKey && !this[item.key][item.childKey]) {
              warn = `请选择${item.message}`;
              return false
            }
            else if(!this[item.key]) {
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
            for(let sItem of this.submitMatterField){
              if(!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]){
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
        console.log(dataSet)
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
          if(this.matterParams.data){
            if(this.matterParams.data.dealerCode != null) {
              this.matterParams.data.dealerCode = this.dealerInfo.dealerCode
            }
            if(this.matterParams.data.storehouseCode != null){
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
            dealerInfo: this.dealerInfo,
            contactInfo: this.contactInfo,
            formData: this.formData,
            project: this.project,
            warehouseStoreInfo: this.warehouseStoreInfo,
            matterParams: this.matterParams
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
          // let {dataSet = []} = order;
          // dataSet = dataSet.map(item => {
          //   return {
          //     ...item,
          //     inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
          //     inventoryName: item.inventoryName_transObjCode,
          //     inventoryCode: item.inventoryCode_transObjCode,
          //     specification: item.specification_transObjCode,
          //     processing: item.tdProcessing || '商品',
          //     measureUnit: item.measureUnit_transObjCode,
          //     transCode: this.relationKey,
          //     qtyBal: item.tdQty,
          //     tdQty: '',
          //     qtyStockBal: 0,

          //   };
          // });

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
      // 提交字段校验
      checkAmt(item, key, val) {
        console.log('item:', item);
        let { thenQtyStock } = item;
        item[key] = Math.abs(toFixed(val));
        
      }
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
        this.dealerInfo = draft.dealerInfo;
        this.contactInfo = draft.contactInfo;
        this.formData = draft.formData;
        this.warehouseStoreInfo = draft.warehouseStoreInfo
        this.project = draft.project;
        this.matterParams = draft.matterParams;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
  // .cell-item {
  //   margin: 0 auto;
  //   padding: .05rem .1rem;
  //   width: 95%;
  //   background-color: #fff;
  //   box-sizing: border-box;
  //   &:before {
  //     display: none;
  //   }
  //   /deep/ .vux-label {
  //     color: #757575;
  //     font-size: .14rem;
  //   }
  // }

  // 所属订单
  // .order_code {
  //   display: flex;
  //   color: #fff;
  //   font-size: .12rem;
  //   > span {
  //     display: inline-block;
  //     padding: 0 .04rem;
  //   }
  //   .order_title {
  //     background: #455d7a;
  //   }
  //   .order_num {
  //     background: #c93d1b;
  //   }
  // }

  // .materiel_list .mater_list .each_mater_wrapper {
  //   flex-direction: column;
  // }

  // .materiel_list .mater_list .each_mater_wrapper .mater_main {
  //   padding-right: .38rem;
  // }
</style>
