<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 经办主体 -->
        <!-- <pop-entity-list :value="entity" v-model="entity"></pop-entity-list> -->
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo"></pop-dealer-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="drDealerPaymentTerm"
                           v-model="drDealerPaymentTerm"></pop-single-select>
        <!-- 物流条款 -->
        <pop-single-select title="物流条款" :data="logisticsTerm" :value="formData.drDealerLogisticsTerms"
                           v-model="formData.drDealerLogisticsTerms"></pop-single-select>
        <!-- 仓库-->
        <pop-warehouse-list isRequired :default-value="warehouse" @sel-item="selWarehouse"></pop-warehouse-list>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
            <div @click="showOrderPop = !showOrderPop">
              <div class="title">订单列表</div>
              <div class="required">请选择订单</div>
              <i class="iconfont icon-youjiantou r_arrow"></i>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title" @click="showDelete">
              <div>订单列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{'vux-1px-b' : index < (Object.keys(orderList).length-1)}"
                   v-for="(oItem, key, index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">所属订单</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item, index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index, item, key)">
                    <template slot-scope="{item}" slot="info">
                      <!-- 物料属性和单位 -->
                      <div class='mater_more'>
                        <span class='unit'>属性: {{item.processing}}</span>
                        <span class='mater_color'>颜色: {{item.inventoryColor || "无"}}</span>
                        <span class='unit'>计量单位: {{item.measureUnit}}</span>
                        <span v-show="item.taxRate">税率：{{item.taxRate || taxRate}}</span>
                      </div>
                      <!-- 库存 -->
                      <div class='mater_more' v-if="item.promDeliTime">
                        <span class='unit'>预期交货日: {{item.promDeliTime}}</span>
                      </div>
                      <div class='mater_more'>
                        <span class='qty'>可用库存: {{item.qtyStockBal}}</span>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other' v-if="item.price && item.tdQty">
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                        <div>
                          <r-number :num="item.tdQty" :max="item.qtyStockBal"
                                    :checkAmt='checkAmt' v-model="item.tdQty"></r-number>
                        </div>
                      </div>
                    </template>
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="modifyMatter(item, index, key)"
                           v-show="(item.price && item.tdQty) &&!matterModifyClass">
                        <span class='iconfont icon-bianji1'></span>
                      </div>
                    </template>
                  </matter-item>
                  <div class='delete_icon' @click="delClick(index,item, key)" v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="Object.keys(orderList).length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" @click="addOrder">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-order-list :show="showOrderPop" :params="orderParams" v-model="showOrderPop" @sel-matter="selOrder"
                          :default-value="orderList" ref="order"></pop-order-list>
        </div>
        <!-- 项目 -->
        <pop-sodl-projectList :value="project" v-model="project"></pop-sodl-projectList>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop"
                    @sel-confirm='selConfirm' v-model='showMatterPop' :btn-is-hide="btnIsHide">
          <template slot="qtyBal" slot-scope="{modifyMatter}">
            <span>待交付数量:{{modifyMatter.qtyBal}}</span>
          </template>
          <template slot="materStock" slot-scope="{modifyMatter}">
            <span>可用库存:{{modifyMatter.qtyStockBal}}</span>
          </template>
          <template slot="date" slot-scope="{modifyMatter}">
            <datetime title="预期交货日" v-model="modifyMatter.promDeliTime" placeholder="请选择"></datetime>
          </template>
        </pop-matter>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount | numberComma}}
        <span class="taxAmount">[含税: ￥{{taxAmount | numberComma}}]</span>
      </span>
      <!-- <span class="count_btn stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</span> -->
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
  import {
    Icon, Cell, Popup, Group, XInput, XTextarea, TransferDom, dateFormat, Datetime,
  } from 'vux'
  // 请求 引入
  import { getSOList } from 'service/detailService'
  import {
    commitTask,
    saveAndStartWf,
    getBaseInfoData,
    saveAndCommitTask,
    getDictByType,
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
  import PopSodlProjectList from 'components/Popup/PopSODLProjectList'
  import PopEntityList from 'components/Popup/PopEntityList'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 公共方法
  import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
  import { toFixed } from '@/plugins/calc'

  const DRAFT_KEY = 'XSCK_DATA';
  export default {
    name: 'ApplyXSCKForm',
    mixins: [applyCommon],
    directives: {TransferDom},
    components: {
      Icon, Cell, Popup, Group, XTextarea,
      XInput, RAction, RNumber,
      PopOrderList, PopDealerList,
      PopSingleSelect, PopWarehouseList,
      PopSodlProjectList, PopEntityList, PopMatter,
      Datetime, RPicker, PopBaseinfo
    },
    data () {
      return {
        listId: 'a1e8592f-63c2-4a31-ba22-9d654484db1d',
        orderList: {}, // 订单列表
        transMode: [], // 结算方式
        logisticsTerm: [], // 物流条款
        showDealerPop: false, // 是否显示客户的popup
        showOrderPop: false, // 是否显示物料的popup
        dealerInfo: null, // 客户客户信息
        drDealerPaymentTerm: '现付', // 结算方式
        formData: {
          drDealerLogisticsTerms: '上门', // 物流条件
          biComment: '', // 备注
        },
        submitSuccess: false, // 是否提交成功
        warehouse: null, // 选中仓库属性
        taxRate: 0.16, // 税率
        numMap: {}, // 用于记录订单物料的数量和价格
        orderParams: { // 订单列表查询参数
          dealerCode: '',
          whCode: '',
        },
        transCode: '',
        formViewUniqueId: '346ede09-ac6a-489a-9242-f385932a4443', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
        matterList: [], // 物料列表，用于计算金额、请求单价
        project: {}, // 项目
        entity: {}, // 经办主体
        tmpItems: {},//选中的订单
        matter: {},
        showMatterPop: false,
        modifyIndex: null,
        modifyKey: null,
      }
    },
    methods: {
      // 获取 结算方式
      getPaymentTerm () {
        return getDictByType('paymentTerm').then(({tableContent}) => {
          this.transMode = tableContent;
        })
      },
      // 获取 物流条款
      getLogisticsTerms () {
        return getDictByType('dealerLogisticsTerms').then(({tableContent}) => {
          this.logisticsTerm = tableContent;
        })
      },
      // TODO 选中的客户
      selDealer (val) {
        let [sel] = JSON.parse(val);
        this.dealerInfo = sel;
        this.orderParams = {
          ...this.orderParams,
          dealerCode: sel.dealerCode
        };
        this.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
        this.orderList = {};
        this.$refs.order.clearSel();
        this.getMatPrice();
      },
      // TODO 选中仓库
      selWarehouse (val) {
        this.warehouse = JSON.parse(val);
        this.orderParams = {
          ...this.orderParams,
          whCode: this.warehouse.warehouseCode
        };
        this.orderList = {};
        this.$refs.order.clearSel();
      },
      // TODO 显示物料修改的pop
      modifyMatter (item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // TODO 更新修改后的物料信息
      selConfirm (val) {
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
      getMatter () {
        if (!this.dealerInfo.dealerCode) {
          this.$vux.alert.show({
            content: '请选择客户'
          })
          return
        }
        this.showMaterielPop = !this.showMaterielPop;
      },
      // TODO 选中物料项
      selOrder (val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          let key = `${item.transCode}_${item.inventoryCode}`;
          let {tdQty = '', price = '', taxRate = 0.16, promDeliTime = dateFormat(item.promDeliTime, 'YYYY-MM-DD')} = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.price = price || item.quotedPrice;
          item.taxRate = taxRate;
          item.promDeliTime = promDeliTime;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        });
        this.numMap = {};
        this.matterList = sels;
        this.orderList = orderList;
        this.getMatPrice();
      },
      // TODO 选择默认图片
      getDefaultImg (item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
      delClick (index, sItem, key) {
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
      showSelIcon (sItem) {
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
      },
      // 全选
      checkAll () {
        if (this.selItems.length === this.matterList.length) {
          this.selItems = [];
          return
        }
        this.selItems = JSON.parse(JSON.stringify(this.matterList));
      },
      // 删除选中的
      deleteCheckd () {
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
                    this.$refs.order.delSelItem(delArr[delIndex]);
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
      addOrder () {
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            // 存储已输入的价格
            this.numMap[`${item.transCode}_${item.inventoryCode}`] = {
              tdQty: item.tdQty,
              price: item.price,
              taxRate: item.taxRate,
              promDeliTime: item.promDeliTime,
            };
          }
        }
        this.showOrderPop = !this.showOrderPop;
      },
      // TODO 提价订单
      submitOrder () {
        let warn = '';
        let dataSet = [];
        let validateMap = [
          {
            key: 'dealerInfo',
            message: '客户信息'
          },
          {
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
        if (!warn && !Object.keys(this.orderList).length) {
          warn = '请选择物料'
        }
        // 组装dataSet
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            if (!item.tdQty) {
              warn = '请填写数量'
              break
            }
            if (!item.price) {
              warn = '请填写单价'
              break
            }
            let taxRate = item.taxRate || this.taxRate;
            let taxAmount = accMul(item.price, item.tdQty, taxRate);
            let oItem = {
              transMatchedCode: item.transCode, // 明细被核销交易号
              orderCode: item.transCode, // 销售订单号（明细）
              outPutMatCode: item.inventoryCode, // 输出物料
              orderProCode: item.inventoryCode, // 销售订单产品编码（明细）
              assMeasureUnit: item.assMeasureUnit !== undefined ? item.assMeasureUnit : null, // 辅助计量（明细）
              assMeasureScale: item.assMeasureScale !== undefined ? item.assMeasureScale : null, // 与主计量单位倍数
              tdQty: item.tdQty, // 明细发生数
              assistQty: item.assistQty || 0, // 辅计数量（明细）
              thenQtyStock: item.qtyStockBal, // 当时可用库存
              thenQtyBal: item.qtyBal, // 待交付数量
              tdProcessing: item.processing, // 加工属性
              price: item.price, // 明细单价
              taxRate: taxRate, // 税率
              taxAmount: taxAmount, // 税金
              tdAmount: accAdd(accMul(item.price, item.tdQty), taxAmount), // 明细发生金额
              promDeliTime: item.promDeliTime || '', // 承诺交付时间
              comment: item.comment || '', // 说明
            };
            if (this.transCode) {
              oItem.tdId = item.tdId || '';
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
                businessKey: 'SODL',
                createdBy: ''
              }
            };
            formData = {
              ...this.formData,
              modifer: this.transCode ? this.formData.handler : '',
              dealerDebitContactPersonName: this.dealerInfo.creatorName || '', // 联系人姓名
              dealerDebitContactInformation: this.dealerInfo.dealerMobilePhone || '', // 联系人手机
              containerOutWarehouseManager: this.warehouse.containerOutWarehouseManager || null, // 仓库管理员
              handlerEntity: this.entity.dealerName,
              outPut: {
                dealerDebit: this.dealerInfo.dealerCode, // 客户编码
                drDealerLabel: this.dealerInfo.dealerLabelName || '客户', // 客户页签
                containerCodeOut: this.warehouse.warehouseCode, // 仓库编码
                drDealerPaymentTerm: this.drDealerPaymentTerm || '现付', // 结算方式
                project: this.project.projectName, // 项目
                departmentName: this.formData.handlerUnitName, // 人员所属部门
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
      getFormData () {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then(data => {
          let {success = true, formData = {},attachment = []} = data;
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
            item = {
              ...item,
              transCode: item.transMatchedCode,
              qtyBal: item.thenQtyBal,
              qtyStockBal: item.thenQtyStock,
              inventoryPic: item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_outPutMatCode,
              inventoryCode: item.outPutMatCode,
              specification: item.specification_outPutMatCode,
              processing: item.tdProcessing
            };
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
          // 订单请求参数
          this.orderParams = {
            dealerCode: this.dealerInfo.dealerCode,
            whCode: this.warehouse.warehouseCode,
          };
          this.formData = {
            ...this.formData,
            creator: formData.creator,
            biComment: formData.biComment,
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
          };
          this.drDealerPaymentTerm = outPut.drDealerPaymentTerm;
          this.entity = {
            dealerName: formData.handlerEntity
          };
          this.project = {
            projectName: outPut.project
          };
          this.biReferenceId = formData.biReferenceId;
          this.orderList = orderList;
          this.$loading.hide();
        })
      },
      // TODO 保存草稿数据
      hasDraftData () {
        // 是否选择项目
        if (!Object.values(this.orderList).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            orderList: this.orderList,
            warehouse: this.warehouse,
            dealerInfo: this.dealerInfo,
            drDealerPaymentTerm: this.drDealerPaymentTerm,
            formData: this.formData,
            project: this.project,
          }
        };
      },
      // TODO 获取关联数据
      getRelationData () {
        let {uniqueId} = this.$route.query;
        return getSOList({
          formViewUniqueId: uniqueId,
          transCode: this.relationKey
        }).then(data => {
          let {success = true, formData = {},attachment = []} = data;
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
            creatorName :formData.dealerDebitContactPersonName,
            dealerMobilePhone :formData.dealerDebitContactInformation,
            dealerCode: formData.order.dealerDebit,
            dealerSubclass: formData.order.drAccountSub,
            dealerName: formData.order.dealerName_dealerDebit,
            province: formData.order.province_dealerDebit,
            city: formData.order.city_dealerDebit,
            county: formData.order.county_dealerDebit,
            address: formData.order.address_dealerDebit
          }
          // 物料请求参数
          this.orderParams = {
            dealerCode: this.dealerInfo.dealerCode
          };

          // this.matterList = dataSet;
          // this.orderList = {
          //   [this.relationKey]: dataSet,
          // };
          this.crDealerPaymentTerm = order.drDealerPaymentTerm;
          this.DealerPaymentTerm = formData.drDealerPaymentTerm || '现付';
          this.$loading.hide();
        })
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.orderList = draft.orderList;
        this.warehouse = draft.warehouse;
        this.dealerInfo = draft.dealerInfo;
        this.drDealerPaymentTerm = draft.drDealerPaymentTerm;
        this.formData = draft.formData;
        this.project = draft.project;
        // 订单请求参数
        this.orderParams = {
          dealerCode: this.dealerInfo.dealerCode,
          whCode: this.warehouse.warehouseCode,
        };
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  // 所属订单
  .order_code {
    display: flex;
    color: #fff;
    font-size: .12rem;
    > span {
      display: inline-block;
      padding: 0 .04rem;
    }
    .order_title {
      background: #455d7a;
    }
    .order_num {
      background: #c93d1b;
    }
  }

  .materiel_list .mater_list .each_mater_wrapper {
    flex-direction: column;
  }

  .materiel_list .mater_list .each_mater_wrapper .mater_main {
    padding-right: .38rem;
  }
</style>
