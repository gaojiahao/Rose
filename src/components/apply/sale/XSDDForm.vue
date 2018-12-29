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
                         :defaultContact="contactInfo"></pop-dealer-list>
        <div v-for="(item,index) in dealerConfig" :key="index">
          <!-- 结算方式, 物流条款 -->
          <pop-single-select title="结算方式" :data="item.rometeData" :value="dealerInfo[item.fieldCode]"
                            v-model="dealerInfo[item.fieldCode]" v-if="!item.hiddenInRun && item.xtype === 'r2Combo' "></pop-single-select>
          <div class="mg_auto no_top">
            <div class="cell-item" v-if="!item.hiddenInRun && item.xtype === 'r2Numberfield'">
              <div class="title">{{item.fieldLabel}}</div>
              <div class="mode">
                <span class="mode_content">{{dealerInfo[item.fieldCode]|| "无"}}</span>
              </div>
            </div>
            <x-input class="cell-item" type="number" text-align='right' placeholder='请填写'
                    v-model.number='dealerInfo[item.fieldCode]' @on-blur="checkAmt(dealerInfo)" v-if="!item.hiddenInRun && item.xtype === 'r2Permilfield'">
              <span slot="label">{{item.fieldLabel}}</span>
            </x-input>
            <datetime class="cell-item" :title="item.fieldLabel" v-model="dealerInfo[item.fieldCode]" placeholder="请选择" 
                      v-if="!item.hiddenInRun && item.xtype === 'r2Datefield'">
              <span slot="title">{{item.fieldLabel}}</span>
            </datetime>
          </div>
        </div>
        <!-- 结算方式 -->
        <!-- <pop-single-select title="结算方式" :data="transMode" :value="dealerInfo.paymentTerm"
                           v-model="dealerInfo.paymentTerm"></pop-single-select> -->
        <!-- 物流条款 -->
        <!-- <pop-single-select title="物流条款" :data="logisticsTerm" :value="dealerInfo.dealerLogisticsTerms"
                           v-model="dealerInfo.dealerLogisticsTerms"></pop-single-select> -->
        <!-- <div class="mg_auto no_top">
          <div class="cell-item">
            <div class="title">账期天数</div>
            <div class="mode">
              <span class="mode_content">{{dealerInfo.pamentDays || "无"}}</span>
            </div>
          </div>
          <x-input class="cell-item" type="number" text-align='right' placeholder='请填写'
                   v-model.number='dealerInfo.tdAmountCopy1' v-show="hasAdvance" @on-blur="checkAmt(dealerInfo)">
            <span slot="label">预收款</span>
          </x-input>
          <div class="cell-item" @click="dateSelect('advancePaymentDueDate')" v-show="hasAdvance">
            <div class="title">预收到期日</div>
            <div class="mode">
              <span class="mode_content">{{dealerInfo.advancePaymentDueDate || '请选择'}}</span>
              <span class="iconfont icon-shenglve"></span>
            </div>
          </div>
        </div> -->
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
                  <span class="order_title">销售合同号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item, index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index, item, key)" :config="matterEditConfig.property">
                    <template slot-scope="{item}" slot="info">
                      <!-- 物料属性和单位 -->
                      <!-- <div class='matter-more'>
                        <span class='unit'>属性: {{item.processing}}</span>
                        <span class='unit'>单位: {{item.measureUnit}}</span>
                        <span class='unit'>辅助计量: {{item.assMeasureUnit}}</span>
                        <span class='mater_color' v-if="item.taxRate">税率: {{item.taxRate}}</span>
                      </div>
                      <div class="mater_more">
                        <span>合同数量: {{item.qty}}</span>
                        <span>已下单: {{item.stockQty}}</span>
                        <span>待下单: {{item.qtyBal}}</span>
                      </div> -->
                      <!-- 库存 -->
                      <!-- <div class='mater_more'>
                        <span class='unit'>辅助计量说明: {{item.assMeasureDescription}}</span>
                        <span class='unit' v-show="item.promDeliTime">预期交货日: {{item.promDeliTime}}</span>
                      </div> -->
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
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" :params="matterParams" :config="matterPopConfig"
                           :requestApi="requestApi" @sel-matter="selMatter" :filter-list="filterList" :orderTitle="orderTitle"
                           :default-value="matterList" ref="matter">
            <!-- <template slot="titleName" slot-scope="props">
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
            </template> -->
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :validate-map="validateMap" :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :show-date-time="true" :config="matterEditConfig">
          <!-- <template slot="qtyBal" slot-scope="{modifyMatter}">
            <div>
              <span>交付开始日: {{modifyMatter.dateActivation}}</span>
              <span>交付截止日: {{modifyMatter.executionDate}}</span>
            </div>
            <div>
              <span>合同数量: {{modifyMatter.qty}}</span>
              <span>已下单: {{modifyMatter.stockQty}}</span>
              <span>待下单: {{modifyMatter.qtyBal}}</span>
            </div>
          </template> -->
          <!-- 输入框title -->
          <!-- <template slot="qtyName">
            <span class='required'>本次下单</span>
          </template>
          <template slot="date" slot-scope="{modifyMatter}">
            <datetime title="预期交货日" :start-date="modifyMatter.dateActivation" :end-date="modifyMatter.executionDate"
                      v-model="modifyMatter.promDeliTime" placeholder="请选择">
              <span class='required' slot="title">预期交货日</span>
            </datetime>
            <cell disabled title="交付开始日" :value="modifyMatter.dateActivation"></cell>
            <cell disabled title="交付截止日" :value="modifyMatter.executionDate"></cell>
          </template> -->
        </pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
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
  import {getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc, getFormConfig, requestData} from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import RNumber from 'components/RNumber'
  import PopMatterList from 'components/Popup/PopMatterListTest'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {accAdd, accMul, accDiv, accSub} from '@/home/pages/maps/decimalsAdd'
  import { toFixed } from '@/plugins/calc'
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
        validateMap: [
          {
            key: 'tdQty',
            message: '请填写数量'
          },
          {
            key: 'price',
            message: '请填写单价'
          },
          {
            key: 'promDeliTime',
            message: '请选择预期交货日'
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
        viewId: '58b8e704-b589-4480-8abb-5a85d6c28ea7',
        dealerConfig: [],
        matterConifg: [],
        matterPopConfig: [],
        orderTitle: '',
        matterEditConfig: {},
        requestApi: ''
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
    computed: {
      // 是否含预收
      hasAdvance() {
        let { paymentTerm } = this.dealerInfo;
        return paymentTerm && paymentTerm.includes('预收');
      }
    },
    watch: {
      dealerInfo: {
        handler(val){
          let { drDealerPaymentTerm } = this.dealerInfo;          
          this.dealerConfig.forEach(item => {
            if(item.fieldLabel === '预收款' || item.fieldLabel === '预收到期日'){
              if(drDealerPaymentTerm && drDealerPaymentTerm.includes('预收')) {
                item.hiddenInRun = false
                return
              }
              item.hiddenInRun = true
            }
          })
        },
        deep: true
        
      }

    },
    methods: {
      // 选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.dealerInfo.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
        this.dealerInfo.daysOfAccount= this.dealerInfo.pamentDays;
        this.dealerInfo.drDealerLogisticsTerms = this.dealerInfo.dealerLogisticsTerms;
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
      // getPaymentTerm() {
      //   return getDictByType('paymentTerm').then(({tableContent}) => {
      //     this.transMode = tableContent;
      //   })
      // },
      // 获取 物流条款
      // getLogisticsTerms() {
      //   return getDictByType('dealerLogisticsTerms').then(({tableContent}) => {
      //     this.logisticsTerm = tableContent;
      //   })
      // },
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
      checkAmt(item) {
        let {tdQty, tdAmountCopy1} = item;
        if(tdQty) {
          item.tdQty = Math.abs(toFixed(tdQty));
        }
        if(tdAmountCopy1) {
          item.tdAmountCopy1 = Math.abs(toFixed(tdAmountCopy1));
        }
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
          } = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
          item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
          item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
          // item.assistQty = toFixed(accDiv(item.tdQty, item.invSubUnitMulti));
          // item.noTaxPrice = toFixed(accDiv(item.price, accAdd(1, taxRate)));
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
      // TODO 展示时间选择器
      dateSelect(key = '') {
        this.$vux.datetime.show({
          confirmText: '确定',
          cancelText: '取消',
          value: this.dealerInfo[key],
          onConfirm: (value) => {
            this.$set(this.dealerInfo, key, value)
          }
        })
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
              let taxAmount = toFixed(accMul(item.assistQty, taxRate, item.noTaxPrice));
              let obj = {
                tdId: item.tdId || '',
                transMatchedCode: item.transCode,
                inventoryName_transObjCode: item.inventoryName, // 物料名称
                transObjCode: item.inventoryCode, // 物料编码
                tdProcessing: item.processing, // 加工属性
                assMeasureUnit: item.assMeasureUnit || null, // 辅助计量
                assMeasureDescription: item.assMeasureDescription || null,
                assMeasureScale: item.assMeasureScale || null, // 与单位倍数
                dealerInventoryName: item.clientInventoryName,
                dealerInventoryCode: item.clientInventoryCode,
                thenTotalQtyBal: item.qty,
                thenLockQty: item.stockQty,
                thenQtyBal: item.qtyBal,
                tdQty: item.tdQty, // 数量
                assistQty: item.assistQty || 0, // 辅计数量
                price: item.price, // 单价
                tdAmount: toFixed(accMul(item.price, item.assistQty)), // 价税小计
                taxRate: taxRate, // 税金
                noTaxPrice: item.noTaxPrice,
                taxAmount: taxAmount, // 税金
                noTaxAmount: accSub(item.tdAmount, item.taxAmount),
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
                [this.processCode]: {businessKey: this.businessKey, createdBy: ""}
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
                  dealerDebitContactPersonName: this.contactInfo.dealerName || '',
                  dealerDebitContactInformation: this.contactInfo.dealerMobilePhone || '',
                  drDealerLogisticsTerms: this.dealerInfo.dealerLogisticsTerms,
                  order: {
                    dealerDebit: this.dealerInfo.dealerCode,
                    drDealerLabel: this.dealerInfo.dealerLabelName,
                    drDealerPaymentTerm: this.dealerInfo.paymentTerm,
                    daysOfAccount: this.dealerInfo.pamentDays,
                    dataSet
                  },
                  inPut: {
                    dataSet: [{
                      dealerDebit: this.dealerInfo.dealerCode,
                      drDealerLabel: this.dealerInfo.dealerLabelName,
                      tdAmountCopy1: this.dealerInfo.tdAmountCopy1,
                      advancePaymentDueDate: this.dealerInfo.advancePaymentDueDate,
                    }]
                  },
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
          let {order = {}} = formData;
          // let [dealerInfo = {}] = order.dataSet;
          order.dataSet.map(item => {
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
              transCode: item.transMatchedCode,
              invSubUnitMulti: item.assMeasureScale,
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
          let dealer = formData.order.dataSet[0]
          // 客户信息展示
          this.dealerInfo = {
            dealerMobilePhone: formData.dealerDebitContactInformation,
            dealerCode: dealer.dealerDebit,
            dealerLabelName: dealer.drDealerLabel,
            dealerName: formData.order.dealerName_dealerDebit,
            province: formData.order.province_dealerDebit,
            city: formData.order.city_dealerDebit,
            county: formData.order.county_dealerDebit,
            address: formData.order.address_dealerDebit,
            paymentTerm: formData.order.drDealerPaymentTerm, // 结算方式
            dealerLogisticsTerms: formData.drDealerLogisticsTerms, //物流条件
            pamentDays: formData.order.daysOfAccount,
            tdAmountCopy1: dealer.tdAmountCopy1,
            advancePaymentDueDate: dealer.advancePaymentDueDate,
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
            dealerInfo: this.dealerInfo,
            formData: this.formData,
            contactInfo: this.contactInfo,
            orderList: this.orderList,
          }
        };
      },
    },
    created() {
      getFormConfig(this.viewId).then(({config = {}}) => {
        console.log(config)
        let dealerConfig = config[0].items;
        let matterConfig = config[1].items;
        // 处理往来配置里面的接口请求
        dealerConfig.forEach(item => {
          if(item.dataSource && item.dataSource.type === 'remoteData') {
            let url = item.dataSource.data.url;
            let params = item.dataSource.data.params;
            let key = Object.keys(params)[0];
            let data = {};
            data[key] = params[key].value;
            requestData({url,data}).then(data => {
              item.rometeData = data.tableContent
            })
          }
        })
        this.dealerConfig = dealerConfig;
        let eidtMatterPopConfig = {
          property: [],
          editPart: []
        }
        let eidtMatterPop = []
        // 处理物料配置
        matterConfig.forEach((item,index) => {
          if(item.dataSource && item.dataSource.type === 'remoteData') {
            this.requestApi = item.dataSource.data.url;
            let params = item.dataSource.data.params;
            let data = {}
            let keys = Object.keys(params);
            keys.forEach(item => {
              this.matterParams[item] = ''
              if(item === 'dealerCode'){
                data[item] = this.dealerInfo[item]
              }  
            })
          }
          // 组合matterPop配置
          // matterPop需要隐藏的物料的字段
          if(item.editorType === 'r2Selector'){
            let hiddenField = JSON.parse(JSON.stringify(item.dataSource.data.hFields));
            hiddenField.unshift('transCode','inventoryName', 'inventoryCode', 'specification');
            let matterPopField = JSON.parse(JSON.stringify(item.proertyContext.dataSourceCols));
            // 循环删除要隐藏的字段
            hiddenField.forEach(hItem => {
              matterPopField.forEach((item,index) => {
                if(item.k === 'transCode'){
                  this.orderTitle = item.v;
                }
                if(item.k === hItem) {
                  matterPopField.splice(index, 1)
                  index --;
                  return false
                }
              })
            })
            // console.log(matterPopField)
            this.matterPopConfig = matterPopField;
          }
          // 组合物料编辑的matterPop的配置
          if(!item.hidden){
            if(item.dataSource && item.dataSource.type === 'formData'){
              item.showFieldCode = item.dataSource.data.valueField[1];
            }
            if(item.valueField !== "transCode" && item.showFieldCode !== 'inventoryName' && item.showFieldCode !== 'inventoryCode' && item.showFieldCode !== 'specification'){
              eidtMatterPop.push(item);
            }
          }
        })
        // console.log(eidtMatterPop);
        // 将配置拆分为属性和可编辑的部分
        eidtMatterPop.length && eidtMatterPop.forEach((item,index) => {
          if(item.fieldCode === 'tdQty'){
            eidtMatterPopConfig.property = eidtMatterPop.slice(0, index);
            eidtMatterPopConfig.editPart = eidtMatterPop.slice(index)
          }
          
        })
        // console.log(eidtMatterPopConfig)
        this.matterEditConfig = eidtMatterPopConfig;
      })
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.dealerInfo = draft.dealerInfo;
        this.formData = draft.formData;
        this.contactInfo = draft.contactInfo;
        this.orderList = draft.orderList;
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            this.matterList.push(item)
          }
        }
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
  //有效期
  .no_top {
    margin-top: 0;
    // margin-bottom: 0.1rem;
    background: #fff;
  }
  .cell-item {
    background: #fff;
    box-sizing: border-box;
    padding: .02rem .1rem;
    display: flex;
    font-size: .14rem;
    align-items: center;
    justify-content: space-between;
    height: .36rem;
    line-height: .32rem;
    /deep/ .weui-cell__hd{
      color: #757575;
    }
    &:before {
      display: none;
    }
    .title {
      color: #757575;
      &.required {
        color: #5077aa;
      }
    }
    .mode {
      color: #111;
      font-weight: 500;
      display: flex;
      align-items: center;
      .mode_content {
        margin-right: .06rem;
      }
      .icon-shenglve {
        font-size: .2rem;
        color: #707070;
      }
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
