<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo"
                         :defaultContact="contactInfo"></pop-dealer-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="dealerInfo.paymentTerm"
                           v-model="dealerInfo.paymentTerm"></pop-single-select>
        <!-- 物流条款 -->
        <pop-single-select title="物流条款" :data="logisticsTerm" :value="dealerInfo.dealerLogisticsTerms"
                           v-model="dealerInfo.dealerLogisticsTerms"></pop-single-select>
        <cell class="cell-item" title="账期天数" :value="dealerInfo.pamentDays"></cell>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
            <div @click="getMatter" class='no-matter'>
              <div class="title">物料列表</div>
              <div class="required">请选择物料</div>
              <span class="iconfont icon-youjiantou r_arrow"></span>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title" @click="showDelete">
              <div>物料列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{'vux-1px-b' : index < (Object.keys(orderList).length-1)}"
                   v-for="(oItem, key, index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">所属合同</span>
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
                        <span class='unit'>单位: {{item.measureUnit}}</span>
                        <span v-show="item.taxRate">税率：{{item.taxRate || taxRate}}</span>
                      </div>
                      <div class="mater_more">
                        <span>合同数量: {{item.qty}}</span>
                        <span>已下单: {{item.stockQty}}</span>
                        <span>待下单: {{item.qtyBal}}</span>
                      </div>
                      <!-- 库存 -->
                      <div class='mater_more'>
                        <span class='unit' v-show="item.promDeliTime">预期交货日: {{item.promDeliTime}}</span>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other' v-if="item.price && item.tdQty">
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                        <div>
                          <r-number :num="item.tdQty" :max="item.qtyBal"
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
                  <div class='delete_icon' @click="delClick(index, item, key)" v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" :params="matterParams"
                           get-list-method="getSalesOrderNew" @sel-matter="selMatter" :filter-list="filterList"
                           :default-value="matterList" ref="matter">
            <template slot="titleName" slot-scope="props">
              <span class="order-title">销售合同号</span>
            </template>
            <template slot="storage" slot-scope="{item}">
              <div>
                <span>保质期天数: {{item.keepingDays || 0}}</span>
                <span>临保天数: {{item.nearKeepingDays || 0}}</span>
                <span>安全库存: {{item.safeStock || 0}}</span>
              </div>
              <div>
                <span>合同价: ￥{{item.price || 0}}</span>
                <span>合同数量: {{item.qty || 0}}</span>
                <span>已下单数量: {{item.stockQty || 0}}</span>
              </div>
            </template>
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :show-date-time="true">
          <template slot="qtyBal" slot-scope="{modifyMatter}">
            <div>
              <span>交付开始日: {{modifyMatter.dateActivation}}</span>
              <span>交付截止日: {{modifyMatter.executionDate}}</span>
            </div>
            <div>
              <span>合同数量: {{modifyMatter.qty}}</span>
              <span>已下单: {{modifyMatter.stockQty}}</span>
              <span>待下单: {{modifyMatter.qtyBal}}</span>
            </div>
          </template>
          <!-- 输入框title -->
          <template slot="qtyName">
            <span class='required'>本次下单</span>
          </template>
          <template slot="date" slot-scope="{modifyMatter}">
            <datetime title="预期交货日" :start-date="modifyMatter.dateActivation" :end-date="modifyMatter.executionDate"
                      v-model="modifyMatter.promDeliTime" placeholder="请选择">
              <span class='required' slot="title">预期交货日</span>
            </datetime>
          </template>
        </pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
      </div>
    </div>
    <!-- 底部提交确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num"
            :class="{nine_up : tdAmount.length  > 8 ,
          ten_up : tdAmount.length  > 9,
          ele_up : tdAmount.length  > 10}"
      >
        <span class="total_price">
          <span class="symbol">￥</span>{{tdAmount | numberComma(3)}}
        </span>
        <span class="taxAmount">[含税: ￥{{taxAmount | numberComma(3)}}]</span>
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
  import {Popup, TransferDom, Group, Cell, numberComma, Datetime, XInput, XTextarea, dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import RNumber from 'components/RNumber'
  import PopMatterList from 'components/Popup/PopMatterList'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'XSDD_DATA';

  export default {
    data() {
      return {
        listId: 'a4897429-f4f2-44a4-ade7-2fe8dc67c3cf',
        filterList: [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          }, {
            name: '合同号',
            value: 'transCode',
          }
        ],        
        showMatterPop: false,
        showMaterielPop: false, // 是否显示物料的popup
        transMode: [], // 结算方式 数组
        matterList: [], // 物料列表
        logisticsTerm: [], // 物流条款 数组
        numMap: {}, // 用于记录订单物料的数量和价格
        formData: {},
        dealerInfo: {},
        matterParams: {}, // 请求物料的参数
        orderList: {},
        modifyKey: null,
        contactInfo: {},
      }
    },
    directives: {
      TransferDom
    },
    components: {
      XInput, XTextarea, Group, Cell, Popup,
      PopMatter, RNumber, PopMatterList, PopDealerList,
      PopSingleSelect, Datetime, RPicker, PopBaseinfo
    },
    mixins: [common],
    filters: {
      numberComma,
    },
    methods: {
      // 选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.matterParams = {
          dealerCode: this.dealerInfo.dealerCode,
        };
        this.matterList = [];
        this.orderList = {};
      },
      selContact(val) {
        this.contactInfo = {...val};
      },
      // TODO 显示物料修改的pop
      modifyMatter(item, index, key) {
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
      // 获取 结算方式
      getPaymentTerm() {
        return getDictByType('paymentTerm').then(({tableContent}) => {
          this.transMode = tableContent;
        })
      },
      // 获取 物流条款
      getLogisticsTerms() {
        return getDictByType('dealerLogisticsTerms').then(({tableContent}) => {
          this.logisticsTerm = tableContent;
        })
      },
      // 选择物料，显示物料pop
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
          let {
            tdQty = item.qtyBal,
            price = item.price,
            taxRate = this.taxRate,
            promDeliTime = '',
          } = this.numMap[item.inventoryCode] || {};
          item.tdQty = tdQty;
          item.price = price;
          item.taxRate = taxRate;
          item.promDeliTime = promDeliTime;
          item.dateActivation = dateFormat(item.dateActivation, 'YYYY-MM-DD');
          item.executionDate = dateFormat(item.executionDate, 'YYYY-MM-DD');
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        });
        this.numMap = {};
        this.matterList = sels;
        this.orderList = orderList;
      },
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
      delClick(index, sItem, key) {
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
            });
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
      // TODO 新增更多物料
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
        if (!this.dealerInfo.dealerName) {
          this.$vux.alert.show({
            content: '请选择客户'
          })
        }
        else if (!Object.keys(this.orderList).length) {
          this.$vux.alert.show({
            content: '请选择物料'
          })
        }
        else {
          let warn = '',
            dataSet = [];
          for (let items of Object.values(this.orderList)) {
            for (let item of items) {
              if (!item.tdQty) {
                warn = '请填写数量';
                break
              }
              if (!item.price) {
                warn = '请填写单价';
                break
              }
              if (!item.promDeliTime) {
                warn = '请选择预期交货日';
                break
              }
              let taxRate = item.taxRate || this.taxRate;
              let taxAmount = accMul(item.price, item.tdQty, taxRate);
              let obj = {
                tdId: item.tdId || '',
                transMatchedCode: item.transCode,
                inventoryName_transObjCode: item.inventoryName, // 物料名称
                transObjCode: item.inventoryCode, // 物料编码
                tdProcessing: item.processing, // 加工属性
                assMeasureUnit: item.assMeasureUnit || null, // 辅助计量
                assMeasureScale: item.assMeasureScale || null, // 与单位倍数
                assistQty: item.assistQty || 0, // 辅计数量
                dealerInventoryName: item.clientInventoryName,
                dealerInventoryCode: item.clientInventoryCode,
                thenTotalQtyBal: item.qty,
                thenLockQty: item.stockQty,
                thenQtyBal: item.qtyBal,
                tdQty: item.tdQty, // 数量
                price: item.price, // 单价
                taxRate: taxRate, // 税金
                taxAmount: taxAmount, // 税金
                tdAmount: accAdd(accMul(item.price, item.tdQty), taxAmount), // 价税小计
                dateActivation: item.dateActivation, // 交付开始日
                promDeliTime: item.promDeliTime || null, // 预期交货日
                executionDate: item.executionDate, // 交付截止日
                comment: item.comment || '', // 说明
              }
              dataSet.push(obj);
            }
          }
          if (warn) {
            this.$vux.alert.show({
              content: warn
            })
            return
          }
          this.$vux.confirm.show({
            content: '确认提交?',
            // 确定回调
            onConfirm: () => {
              this.$HandleLoad.show();
              let operation = saveAndStartWf; // 默认有工作流
              let wfPara = {
                [this.processCode]: {businessKey: "SO3", createdBy: ""}
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
              let submitData = {
                listId: this.listId,
                biComment: this.formData.biComment,
                formData: JSON.stringify({
                  ...this.formData,
                  handlerEntity: this.entity.dealerName,
                  dealerDebitContactPersonName: this.contactInfo.dealerName,
                  dealerDebitContactInformation: this.contactInfo.dealerMobilePhone,
                  drDealerLogisticsTerms: this.dealerInfo.dealerLogisticsTerms,
                  order: {
                    dealerDebit: this.dealerInfo.dealerCode,
                    drDealerLabel: this.dealerInfo.dealerLabelName,
                    drDealerPaymentTerm: this.dealerInfo.paymentTerm,
                    daysOfAccount: this.dealerInfo.pamentDays,
                    dataSet
                  }
                }),
                wfPara: JSON.stringify(wfPara)
              }
              if (this.isResubmit) { // 重新提交
                operation = saveAndCommitTask;
                submitData.biReferenceId = this.biReferenceId;
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
        }
      },
      // 获取订单信息用于重新提交
      getFormData() {
        return getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          this.attachment = data.attachment;
          let orderList = {};
          let {formData} = data;
          formData.order.dataSet.map(item => {
            item = {
              ...item,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.inventoryCode_transObjCode,
              specification: item.specification_transObjCode,
              processing: item.tdProcessing || '商品',
              measureUnit: item.measureUnit_transObjCode,
              clientInventoryName: item.dealerInventoryName,
              clientInventoryCode: item.dealerInventoryCode,
              qty: item.thenTotalQtyBal,
              stockQty: item.thenLockQty,
              qtyBal: item.thenQtyBal,
              transCode: item.transMatchedCode
            };
            this.matterList.push(item);
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          });
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          this.orderList = orderList;
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
          // 客户信息展示
          this.dealerInfo = {
            creatorName: formData.dealerDebitContactPersonName,
            dealerMobilePhone: formData.dealerDebitContactInformation,
            dealerCode: formData.order.dealerDebit,
            dealerSubclass: formData.order.drAccountSub,
            dealerLabelName: formData.order.drDealerLabel,
            dealerName: formData.order.dealerName_dealerDebit,
            province: formData.order.province_dealerDebit,
            city: formData.order.city_dealerDebit,
            county: formData.order.county_dealerDebit,
            address: formData.order.address_dealerDebit,
            paymentTerm: formData.order.drDealerPaymentTerm, // 结算方式
            dealerLogisticsTerms: formData.drDealerLogisticsTerms, //物流条件
            pamentDays: formData.order.daysOfAccount,
          };
          // 订单信息
          this.contactInfo = {
            dealerName: formData.dealerDebitContactPersonName, //联系人
            dealerMobilePhone: formData.dealerDebitContactInformation,//电话
          };
          // 物料列表请求参数
          this.matterParams = {
            dealerCode: this.dealerInfo.dealerCode,
          };
          this.$loading.hide();
        })
      },
      // TODO 是否保存草稿
      hasDraftData() {
        if (!Object.values(this.orderList).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            matter: this.matterList,
            dealerInfo: this.dealerInfo,
            formData: this.formData,
            contactInfo: this.contactInfo,
            orderList: this.orderList,
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.matterList = draft.matter;
        this.dealerInfo = draft.dealerInfo;
        this.formData = draft.formData;
        this.contactInfo = draft.contactInfo;
        this.orderList = draft.orderList;
        // 物料列表请求参数
        this.matterParams = {
          dealerCode: this.dealerInfo.dealerCode,
        };
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  .vux-1px-b:after,
  .vux-1px-t:before {
    border-color: #e8e8e8;
  }

  .cell-item {
    margin: 0 auto;
    padding: .05rem .1rem;
    width: 95%;
    background-color: #fff;
    box-sizing: border-box;
    &:before {
      display: none;
    }
    /deep/ .vux-label {
      color: #757575;
      font-size: .14rem;
    }
  }

  .comment {
    width: 95%;
    margin: 0 auto;
    background: #fff;
    // margin-top: .1rem;
    padding: .06rem .1rem;
    box-sizing: border-box;

    .weui-cell {
      padding: 0;
    }
  }

  .no_margin {
    margin-top: 0;
  }

  .materiel_list
  .mater_list
  .each_mater_wrapper
  .has_padding {
    padding-right: .38rem;
  }


</style>
