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
                         :default-contact="contactInfo" :dealer-params="dealerParams" dealerTitle="供应商"></pop-dealer-list>
        <!-- 结算方式 -->
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
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
                  <matter-item :item="item" @on-modify="getMatterModify(item, index,key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index,item)" :config="matterEditConfig.property">
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
                    <!--<template slot="edit" slot-scope="{item}">
                      <div class='mater_other' @click="getMatterModify(item, index)" v-if="!item.tdQty && !matterModifyClass">
                        <div class="edit-tips">
                          <span class="tips-word">点击进行填写</span>
                        </div>
                      </div>
                    </template>-->
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="getMatterModify(item, index,key)"
                           v-show="(item.price && (item.tdQty || item.tdQty === 0)) &&!matterModifyClass">
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

          <pop-matter-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selMatter"
                           :default-value="matterList" :config="matterPopConfig" :matter-params="matterParams"
                           :orderTitle="matterPopOrderTitle"
                           :filter-list="filterList" ref="matter">
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='consumables' :show-pop="showMatterPop" @sel-confirm='selConfirm' 
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :config="matterEditConfig">
        </pop-matter>

        <!-- 资金 -->
        <!-- <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="3" :params="cashParams" required>
          <template slot="other">
            <cell title="支付金额" :value="tdAmountCopy1"></cell>
          </template>
        </pop-cash-list> -->
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
  import {XTextarea, Datetime, dateFormat, Cell, XInput, Group} from 'vux'
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
  import PopMatterList from 'components/Popup/PopMatterListTest'
  import PopOrderList from 'components/Popup/PopOrderList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopCashList from 'components/Popup/finance/PopCashList'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import RNumber from 'components/RNumber'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RDropdown from 'components/RDropdown'
  // 公共方法
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'DZYHPCGYSYZF_DATA';

  export default {
    name: 'ApplyDZYHPCGYSYZFForm',
    data() {
      return {
        orderList: {},
        matterList: [], // 订单列表
        showDealerPop: false, // 是否显示供应商的popup
        dealerInfo: {}, // 供应商客户信息
        contactInfo: {},
        formData: {
          biId: '',
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        taxRate: 0.16, // 税率
        numMap: {}, // 用于记录订单物料的数量
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
          }, {
            name: '订单号',
            value: 'transCode',
          },
        ],
        cashInfo: {},
        cashParams: {
          fundType: '银行存款',
        },
        consumables: {},
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写数量'
          },
        ]
      }
    },
    computed: {
      // 合计金额
      totalAmount() {
        let total = 0;
        this.matterList.forEach(item => {
          this.simpleCalcMatter(item);
          total = accAdd(total, item.noTaxAmount);
        });
        return Number(total);
      },
      // 税金
      taxAmount() {
        let total = 0;
        this.matterList.forEach(item => {
          total = toFixed(accAdd(total, item.taxAmount));
        });
        return total;
      },
      tdAmount() {
        return parseFloat(accAdd(this.totalAmount, Number(this.taxAmount)).toFixed(2))
      },
      //支付金额
      tdAmountCopy1() {
        let total = 0;
        this.matterList.forEach(item => {
          let taxRate = item.taxRate || this.taxRate;
          let taxAmount = accMul(item.price, item.tdQty, taxRate);
          total = accAdd(total, accAdd(accMul(item.price, item.tdQty), taxAmount));
        });
        return toFixed(total);
      },
    },
    watch:{
      //修改的物料
      consumables:{
        handler(val){
          this.simpleCalcMatter(val)
        },
        deep:true
      }
    },
    mixins: [applyCommon],
    components: {
      XTextarea, Datetime, PopOrderList, RNumber, XInput, Group,
      PopDealerList, PopMatterList, PopSingleSelect, PopMatter, RPicker, PopBaseinfo,
      Cell, RDropdown, PopCashList, DealerOtherPart
    },
    methods: {
      // 修改经办人信息
      selItem(val) {
        this.formData = {
          ...this.formData,
          ...val,
        };
        if(this.matterParams.data.groupId != null){
          this.matterParams.data.groupId = val.handlerUnit;
        }
      },
      // TODO 选中的供应商
      selDealer(val) {
        let [sel] = JSON.parse(val);
        let day = 24 * 3600 * 1000;
        let {pamentDays} = sel;
        let accountExpirationDate = pamentDays ? dateFormat(Date.now() + accMul(pamentDays, day), 'YYYY-MM-DD') : '';
        this.dealerInfo = {
          ...sel,
          accountExpirationDate: accountExpirationDate,
          crDealerPaymentTerm: sel.paymentTerm,
          daysOfAccount: sel.pamentDays
        };
        if(this.matterParams.data && this.matterParams.data.dealerCode != null) {
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode
          this.matterList = [];
          this.orderList = {};
        }
      },
      // TODO 选择联系人
      selContact(val) {
        this.contactInfo = {...val};
      },
      // TODO 显示物料修改的pop
      getMatterModify(item, index, key) {
        this.consumables = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          item.tdQty = item.tdQty || item.qtyBal;
          item.price = item.price || '';
          item.taxRate = item.taxRate || 0.16;
          item.productionDate = item.productionDate || '';
          item.validUntil = item.validUntil || '';
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          this.getMoreUnit(item);
          orderList[item.transCode].push(item);
        });
        this.numMap = {};
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
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if(!this.dealerInfo.dealerCode){
          warn = '请选择供应商'
        }
        if (!warn && !this.dealerInfo.crDealerPaymentTerm) {
          warn = '请选择结算方式'
        }
        if (!warn && !this.matterList.length) {
          warn = '请选择物料'
        }
        if (!warn) {
          // 校验
          this.matterList.every(item => {
            if (!item.tdQty && item.tdQty !== 0) {
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
              expSubject: item.expSubject,
              thenTotalQtyBal: item.qty, // 订单总数
              thenLockQty: item.qtyed, // 已入库数
              thenQtyBal: item.qtyBal || 0, // 待验收
              tdQty: item.tdQty, // 明细发生数
              assMeasureScale: null,
              assistQty: item.assistQty || null, // 辅计数量（明细）
              price: item.price, // 明细单价
              taxRate: taxRate, // 税率
              taxAmount: taxAmount, // 税金
              tdAmount: accAdd(accMul(item.price, item.tdQty), taxAmount), // 明细发生金额
              processingStartDate: item.processingStartDate || null,
              keepingDays_transObjCode: item.keepingDays, // 保质期
              productionDate: item.productionDate || null, // 保质期
              validUntil: item.validUntil || null, // 保质期
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
              creator: this.transCode ? this.formData.handler : '',
              modifer: this.transCode ? this.formData.handler : '',
              dealerCreditContactPersonName: this.contactInfo.dealerName || '', // 联系人姓名
              dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '', // 联系人手机
              containerInWarehouseManager: null,
              inPut: {
                dealerCodeCredit: this.dealerInfo.dealerCode, // 供应商编码
                crDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 供应商页签
                crDealerPaymentTerm: this.dealerInfo.paymentTerm,
                daysOfAccount: this.dealerInfo.pamentDays, // 账期天数
                accountExpirationDate: this.dealerInfo.accountExpirationDate, // 账期到期日
                containerCode: '',
                dataSet,
              },
              outPut: {
                dataSet: [{
                  fundName_cashOutCode: this.cashInfo.fundName,
                  cashOutCode: this.cashInfo.fundCode,
                  cashType_cashOutCode: this.cashInfo.fundType,
                  thenAmntBalCopy1: this.cashInfo.amntBal,
                  tdAmountCopy1: this.tdAmountCopy1,
                }],
              },
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
          let {inPut, dealerDebit, outPut} = formData;
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
            this.getMoreUnit(item);
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
            dealerCode: inPut.dealerCodeCredit, // 客户编码
            dealerLabelName: inPut.crDealerLabel, // 关系标签
            province: inPut.province_dealerCodeCredit, // 省份
            city: inPut.city_dealerCodeCredit, // 城市
            county: inPut.county_dealerCodeCredit, // 地区
            address: inPut.address_dealerCodeCredit, // 详细地址
            paymentTerm: inPut.crDealerPaymentTerm,
            pamentDays: inPut.daysOfAccount,
            accountExpirationDate: inPut.accountExpirationDate || ''
          };
          for(let item of outPut.dataSet){
            this.cashInfo = {
              fundName: item.fundName_cashOutCode,
              fundCode: item.cashOutCode,
              fundType: item.cashType_cashOutCode,
              amntBal: item.thenAmntBalCopy1,
            }
          }
          this.contactInfo = {
            dealerName: formData.dealerCreditContactPersonName,
            dealerMobilePhone: formData.dealerCreditContactInformation,
          };
          // 物料请求参数
          this.matterParams = {
            dealerCode: this.dealerInfo.dealerCode,
            groupId: this.formData.handlerUnit,
          };

          // 基本信息
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };

          this.formData = {
            ...this.formData,
            ...this.handlerDefault,
            creator: formData.creator,
            biId: formData.biId,
            biComment: formData.biComment,
          };
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
            matter: this.matterList,
            dealer: this.dealerInfo,
            formData: this.formData,
            contactInfo: this.contactInfo,
            cashInfo: this.cashInfo,
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
            dealerCode: this.dealerInfo.dealerCode,
            groupId: this.formData.handlerUnit,
          };

          this.matterList = dataSet;
          this.orderList = {
            [this.relationKey]: dataSet,
          };
          this.$loading.hide();
        })
      },
      // TODO 获取物料的辅助计量
      getMoreUnit(item) {
        let {inventoryCode} = item;
        return getObjInvMoreUnitByInvCode(inventoryCode).then(({tableContent = []}) => {
          item.showDrop = false;
          tableContent.forEach(unit => {
            unit.name = unit.invSubUnitName;
            unit.value = unit.invSubUnitName;
          });
          item.moreUnitList = tableContent;
        });
      },
      // TODO 点击辅助计量栏
      moreUnitClick(item) {
        item.showDrop = !item.showDrop;
      },
      // TODO 选中辅助计量
      moreUnitSelected(val) {
        this.consumables.assMeasureUnit = val.invSubUnitName;
        this.consumables.assistQty = val.invSubUnitMulti;
      },
      // TODO 选中资金
      selCash(item) {
        this.cashInfo = item;
      },
      // TODO 组装orderList
      assembleOrder(arr) {
        let orderList = {};
        arr.forEach(item => {
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          this.getMoreUnit(item);
          orderList[item.transCode].push(item);
        });
        this.orderList = orderList;
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.matterList = draft.matter;
        this.dealerInfo = draft.dealer;
        this.formData = draft.formData;
        this.contactInfo = draft.contactInfo;
        this.cashInfo = draft.cashInfo;
        this.matterParams = {
          dealerCode: this.dealerInfo.dealerCode,
          groupId: this.formData.handlerUnit,
        };
        this.assembleOrder(this.matterList);
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
    .cell-item {
      margin: 0 auto;
      padding: .05rem .1rem;
      width: 95%;
      background-color: #fff;
      box-sizing: border-box;
      /deep/ .vux-label {
        color: #757575;
        font-size: .14rem;
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
</style>
