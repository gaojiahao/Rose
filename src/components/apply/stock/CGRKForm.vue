<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo"
                         dealerTitle="供应商" :default-contact="contactInfo" :dealer-params="dealerParams"></pop-dealer-list>
        <!--结算方式-->
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 仓库-->
        <pop-warehouse-list isRequired title="入库仓库" :default-value="warehouse"
                            @sel-item="selWarehouse"></pop-warehouse-list>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
            <div @click="showOrderPop = !showOrderPop">
              <div class="title">{{orderListTitle}}列表</div>
              <div class="required">请选择{{orderListTitle}}</div>
              <i class="iconfont icon-youjiantou r_arrow"></i>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title" @click="showDelete">
              <div>{{orderListTitle}}列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{'vux-1px-b' : index < (Object.keys(orderList).length-1)}"
                   v-for="(oItem, key, index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">{{orderListTitle}}</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item, index,key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index,item)"  :config="matterEditConfig.property">
                    <template slot="info" slot-scope="{item}">
                      <!-- 物料数量和价格 -->
                      <div class='mater_other' v-if="item.price && item.tdQty">
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                        <div>
                          <r-number :num="item.tdQty"
                                    :checkAmt='checkAmt' v-model="item.tdQty" :max="item.qtyBal"></r-number>
                        </div>
                      </div>
                    </template>
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="modifyMatter(item, index,key)"
                           v-show="(item.price && item.tdQty) &&!matterModifyClass">
                        <span class='iconfont icon-bianji1'></span>
                      </div>
                    </template>
                  </matter-item>
                  <div class='delete_icon' @click="delClick(index,item)" v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" @click="addOrder">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selMatter" :default-value="matterList" 
                           :filter-list="filterList" :params="matterParams" :config="matterPopConfig" :matter-params="matterParams"
                           :orderTitle="matterPopOrderTitle" ref="matter">
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :config="matterEditConfig">
        </pop-matter>
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
  // vux插件引入
  import { Cell, XInput, Datetime, XTextarea, dateFormat, Group } from 'vux'
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
  import PopDealerList from 'components/Popup/PopDealerListTest'
  import PopMatterList from 'components/Popup/PopMatterListTest'
  import PopOrderList from 'components/Popup/PopOrderList'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RNumber from 'components/RNumber'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RDropdown from 'components/RDropdown'
  // 公共方法
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'CGRK_DATA';

  export default {
    name: 'ApplyCGRKForm',
    data() {
      return {
        orderList: {},
        matterList: [], // 订单列表
        DealerPaymentTerm: '现付', // 结算方式
        showDealerPop: false, // 是否显示供应商的popup
        dealerInfo: {}, // 供应商客户信息
        contactInfo: {},
        crDealerPaymentTerm: '现付', // 结算方式
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
        taxRate: 0.16, // 税率
        transCode: '',
        formViewUniqueId: 'fed81800-4c34-44a9-b517-c3fd9f2ab57d', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
        showOrderPop: false,
        tmpItems: {}, // 选中的订单
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
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写本次收票数量'
          },
          {
            key: 'price',
            message: '请填写含税单价'
          },
          {
            key: 'taxRate',
            message: '请填写税率'
          },
          {
            key: 'productionDate',
            message: '请选择生产日期'
          },
        ]
      }
    },
    mixins: [applyCommon],
    components: {
      Cell, RDropdown, XInput, Group,
      XTextarea, Datetime, PopOrderList, RNumber,
      PopDealerList, PopWarehouseList, PopMatterList,
      PopSingleSelect, PopMatter, RPicker, PopBaseinfo, DealerOtherPart
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
          drDealerPaymentTerm: sel.paymentTerm
        };
        if(this.matterParams.data && this.matterParams.data.dealerCode != null) {
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode
          this.matterList = [];
          this.orderList = {};
        }
        this.crDealerPaymentTerm = this.dealerInfo.paymentTerm;
      },
      // TODO 选择联系人
      selContact(val) {
        this.contactInfo = {...val};
      },
      // TODO 选中仓库
      selWarehouse(val) {
        this.warehouse = JSON.parse(val);
      },
      // TODO 显示物料修改的pop
      modifyMatter(item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        console.log(sels);
        let orderList = {};
        sels.forEach(item => {
          item.tdQty = item.tdQty || item.qtyBal;
          item.qualityQty = item.qualityQty || item.qtyBal;
          item.taxRate = item.taxRate || 0.16;
          item.productionDate = item.productionDate || '';
          item.validUntil = item.validUntil || '';
          item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
          item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
          item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          // this.getMoreUnit(item);
          orderList[item.transCode].push(item);
        });
        this.matterList = sels;
        this.orderList = orderList;
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
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
      delClick(index, sItem) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
        //若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
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
                    this.$refs.matter.delSelItem(delArr[delIndex]);
                    delArr.splice(delIndex, 1);
                  }
                  if (!delArr.length) {
                    delete this.orderList[OItem.transCode];
                  }
                }
              })
              this.matterList.forEach((item, index) => {
                if (item.inventoryCode === SItem.inventoryCode) {
                  this.matterList.splice(index, 1);
                  index--;
                }
              })
            })
            this.selItems = [];
            this.matterModifyClass = false;
          }
        })

      },
      // TODO 新增更多订单
      addOrder() {
        this.showOrderPop = !this.showOrderPop;
      },
      // 计算有效期
      checkDate(modifyMatter,e){
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
            message: '供应商信息'
          }, {
            key: 'crDealerPaymentTerm',
            message: '结算方式'
          }, {
            key: 'warehouse',
            message: '仓库'
          },
        ];
        validateMap.every(item => {
          if (!this[item.key]) {
            warn = `请选择${item.message}`;
            return false
          }
          return true
        });
        if (!warn && !this.matterList.length) {
          warn = '请选择物料'
        }
        if (!warn) {
          // 校验
          this.matterList.every(item => {
            if (!item.price) {
              warn = '含税单价不能为空';
              return false
            }
            if (!item.tdQty) {
              warn = '数量不能为空';
              return false
            }
            // 设置提交参数
            let taxRate = item.taxRate || this.taxRate;
            let taxAmount = accMul(item.price, item.tdQty, taxRate);
            let oItem = {
              transMatchedCode: item.transCode,
              transObjCode: item.inventoryCode, // 物料编码
              tdProcessing: item.processing, // 加工属性
              assMeasureUnit: item.assMeasureUnit !== undefined ? item.assMeasureUnit : null, // 辅助计量（明细）
              assMeasureScale: item.assMeasureScale || null,
              assMeasureDescription: item.assMeasureDescription || '',
              thenTotalQtyBal: item.qty, // 订单总数
              thenLockQty: item.qtyed, // 已入库数
              thenQtyBal: item.qtyBal || 0, // 待验收
              qualityQty: item.tdQty,
              tdQty: item.tdQty, // 明细发生数
              assistQty: item.assistQty || 0, // 辅计数量（明细）
              price: item.price, // 明细单价
              taxRate: item.taxRate, // 税率
              tdAmount: item.tdAmount, // 明细发生金额
              noTaxPrice: item.noTaxPrice,
              taxAmount: item.taxAmount, // 税金
              processingStartDate: item.processingStartDate || null,
              keepingDays_transObjCode: item.keepingDays, // 保质期
              productionDate: item.productionDate, // 保质期
              validUntil: item.validUntil, // 保质期
              comment: item.comment || '', // 说明
            };
            if (this.transCode) {
              oItem.tdId = item.tdId || null;
            }
            dataSet.push(oItem);
            return true
          })
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
                crDealerPaymentTerm: this.crDealerPaymentTerm,
                daysOfAccount: this.dealerInfo.pamentDays, // 账期天数
                accountExpirationDate: this.dealerInfo.accountExpirationDate, // 账期到期日
                containerCode: this.warehouse.warehouseCode, // 仓库编码
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
          let matterList = [];
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
            // this.getMoreUnit(item);
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            matterList.push(item);
            orderList[item.transCode].push(item);
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
          // 物料请求参数
          this.matterParams = {
            dealerCode: this.dealerInfo.dealerCode
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
          this.crDealerPaymentTerm = inPut.crDealerPaymentTerm;
          this.DealerPaymentTerm = formData.crDealerPaymentTerm || '现付';
          this.biReferenceId = formData.biReferenceId;
          this.matterList = matterList;
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
            address: formData.order.address_dealerDebit
          };

          // 物料请求参数
          this.matterParams = {
            dealerCode: this.dealerInfo.dealerCode
          };

          this.matterList = dataSet;
          this.orderList = {
            [this.relationKey]: dataSet,
          };
          this.crDealerPaymentTerm = order.drDealerPaymentTerm;
          this.DealerPaymentTerm = formData.drDealerPaymentTerm || '现付';
          this.$loading.hide();
        })
      },
      // TODO 获取物料的辅助计量
      // getMoreUnit(item) {
      //   let {inventoryCode} = item;
      //   return getObjInvMoreUnitByInvCode(inventoryCode).then(({tableContent = []}) => {
      //     item.showDrop = false;
      //     tableContent.forEach(unit => {
      //       unit.name = unit.invSubUnitName;
      //       unit.value = unit.invSubUnitName;
      //     });
      //     item.moreUnitList = tableContent;
      //   });
      // },
      // TODO 点击辅助计量栏
      // moreUnitClick(item) {
      //   item.showDrop = !item.showDrop;
      // },
      // TODO 选中辅助计量
      moreUnitSelected(val) {
        this.matter.assMeasureUnit = val.invSubUnitName;
        this.matter.assistQty = val.invSubUnitMulti;
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
        this.dealerInfo = draft.dealer;
        this.warehouse = draft.warehouse;
        this.formData = draft.formData;
        this.contactInfo = draft.contactInfo;
        this.crDealerPaymentTerm = this.dealerInfo.paymentTerm;
        this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
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
  .other_info{
    width: 95%;
    margin: 0 auto;
    background: #fff;
    box-sizing: border-box;
    padding: .08rem .1rem;
    display: flex;
    font-size: .14rem;
    align-items: center;
    justify-content: space-between;
    .title{
      color: #757575;
    }
    .mode{
      color: #111;
      font-weight: 500;
    }
  }
</style>
