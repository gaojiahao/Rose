<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo"
                         :default-contact="contactInfo" dealer-label-name="设施供应商"></pop-dealer-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="dealerInfo.paymentTerm" isRequired
                           v-model="dealerInfo.paymentTerm"></pop-single-select>

        <cell class="cell-item" title="账期天数" :value="dealerInfo.pamentDays"></cell>

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
                  <span class="order_title">申请号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item,index,key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index,item)" :class="{'vux-1px-b' : index < oItem.length-1}">
                    <template slot="info" slot-scope="{item}">
                      <div class="mater_more">
                        <span class='unit'>类型：{{item.facilityType || '无'}}</span>
                        <span class="unit">大类：{{item.facilityBigType}}</span>
                        <span class='qty'>子类: {{item.facilitySubclass}}</span>
                      </div>
                      <div class="mater_more">
                        <span class='unit'>单位：{{item.facilitySpecification || '无'}}</span>
                        <span v-show="item.taxRate">税率：{{item.taxRate}}</span>
                        <span class='qty' v-show="item.qtyBal">待下单: {{item.qtyBal}}</span>
                      </div>
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
                      <div class='mater_other' @click="modifyMatter(item,index)" v-if="!item.tdQty && !matterModifyClass">
                        <div class="edit-tips">
                          <span class="tips-word">点击进行填写</span>
                        </div>
                      </div>
                    </template>-->
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="modifyMatter(item,index,key)"
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

          <pop-facility-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selMatter"
                             :default-value="matterList" request="1" ref="matter">
          </pop-facility-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide">
          <template slot="qtyBal" slot-scope="{modifyMatter}">
            <span>待下单: {{modifyMatter.qtyBal}}</span>
          </template>
        </pop-matter>

        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
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
  import {XTextarea, Datetime, dateFormat, Cell} from 'vux'
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
  import PopMatterList from 'components/Popup/PopMatterList'
  import PopFacilityList from 'components/Popup/equipment/PopFacilityList'
  import PopOrderList from 'components/Popup/PopOrderList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopCashList from 'components/Popup/finance/PopCashList'
  import RNumber from 'components/RNumber'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RDropdown from 'components/RDropdown'
  // 公共方法
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'SBCGDD_DATA';

  export default {
    name: 'ApplySBCGDDForm',
    data() {
      return {
        listId: 'fac37727-d2d4-11e8-b8ca-0279b2c6a380',
        srhInpTx: '', // 搜索框内容
        orderList: {},
        matterList: [], // 订单列表
        transMode: ['现付', '预付', '账期', '票据'], // 结算方式
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
            name: '交易号',
            value: 'transCode',
          }, {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'facilityCode',
          },
        ],
        cashParams: {
          fundType: '银行存款',
        }
      }
    },
    computed: {
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
    mixins: [applyCommon],
    components: {
      XTextarea, Datetime, PopOrderList, RNumber,
      PopDealerList, PopMatterList, PopSingleSelect, PopMatter, RPicker, PopBaseinfo,
      Cell, RDropdown, PopCashList, PopFacilityList,
    },
    methods: {
      // 修改经办人信息
      selItem(val) {
        this.formData = {
          ...this.formData,
          ...val,
        };
      },
      // 获取 结算方式
      getPaymentTerm() {
        return getDictByType('paymentTerm').then(({tableContent}) => {
          this.transMode = tableContent;
        })
      },
      // TODO 选中的供应商
      selDealer(val) {
        let [sel] = JSON.parse(val);
        this.dealerInfo = {
          ...sel,
        };
      },
      // TODO 选择联系人
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
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          let key = `${item.transCode}_${item.facilityCode}`;
          let {
            tdQty = '', price = '', taxRate = 0.16,
          } = this.numMap[key] || {};
          item.tdQty = tdQty;
          if (price.length) {
            item.price = price;
          }
          item.taxRate = taxRate;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
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
          if (modMatter.transCode === item.transCode && modMatter.facilityCode === item.facilityCode) {
            this.$set(this.matterList, index, modMatter);
            return false
          }
          return true
        });
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
      },
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
      delClick(index, sItem) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.facilityCode === sItem.facilityCode);
        //若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.facilityCode === sItem.facilityCode) !== -1;
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
                if (OItem.facilityCode === SItem.facilityCode && OItem.transCode === SItem.transCode) {
                  let delArr = this.orderList[OItem.transCode];
                  let delIndex = delArr.findIndex(item => item.facilityCode === OItem.facilityCode);
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
                if (item.facilityCode === SItem.facilityCode) {
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
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            // 存储已输入的价格
            this.numMap[`${item.transCode}_${item.facilityCode}`] = {...item};
          }
        }
        this.showOrderPop = !this.showOrderPop;
      },
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        let validateMap = [
          {
            key: 'dealerInfo',
            message: '供应商信息'
          },
        ];
        validateMap.every(item => {
          if (!this[item.key]) {
            warn = `请选择${item.message}`;
            return false
          }
          return true
        });
        if (!warn && !this.dealerInfo.paymentTerm) {
          warn = '请选择结算方式'
        }
        if (!warn && !this.matterList.length) {
          warn = '请选择物料'
        }
        if (!warn) {
          // 校验
          this.matterList.every(item => {
            if (!item.price) {
              warn = '单价不能为空';
              return false
            }
            if (!item.tdQty && item.tdQty !== 0) {
              warn = '数量不能为空';
              return false
            }
            // 设置提交参数
            let taxRate = item.taxRate || this.taxRate;
            let taxAmount = accMul(item.price, item.tdQty, taxRate);
            let oItem = {
              transMatchedCode: item.transCode,
              facilityObjCode: item.facilityCode, // 物料编码
              facilityName_facilityObjCode: item.facilityName, // 设施名称
              facilityType: item.facilityType,
              thenQtyBal: item.qtyBal || 0, // 待验收
              tdQty: item.tdQty, // 明细发生数
              price: item.price, // 明细单价
              taxRate: taxRate, // 税率
              taxAmount: taxAmount, // 税金
              tdAmount: accAdd(accMul(item.price, item.tdQty), taxAmount), // 明细发生金额
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
                businessKey: 'POPI',
                createdBy: ''
              }
            };

            formData = {
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              creator: this.transCode ? this.formData.handler : '',
              modifer: this.transCode ? this.formData.handler : '',
              dealerDebitContactPersonName: this.contactInfo.dealerName || '', // 联系人姓名
              dealerDebitContactInformation: this.contactInfo.dealerMobilePhone || '', // 联系人手机
              order: {
                dealerDebit: this.dealerInfo.dealerCode, // 供应商编码
                drDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 供应商页签
                crDealerPaymentTerm: this.dealerInfo.paymentTerm,
                daysOfAccount: this.dealerInfo.pamentDays, // 账期天数
                dataSet,
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
          let {order, dealerDebit} = formData;
          let {dataSet = []} = order;
          let orderList = {};
          let matterList = [];
          for (let item of dataSet) {
            item = {
              ...item,
              transCode: item.transMatchedCode,
              inventoryPic: item.inventoryPic_facilityObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_facilityObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_facilityObjCode,
              facilityCode: item.facilityObjCode,
              specification: item.specification_facilityObjCode,
              processing: item.tdProcessing,
              keepingDays: item.keepingDays_facilityObjCode,
              qtyed: item.thenLockQty,
              qtyBal: item.thenQtyBal,
              qty: item.thenTotalQtyBal,
            };
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            matterList.push(item);
            orderList[item.transCode].push(item);
          }
          // 供应商信息
          this.dealerInfo = {
            creatorName: formData.dealerCreditContactPersonName, // 客户名
            dealerName: order.dealerName_dealerDebit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerCode: order.dealerCode_dealerDebit, // 客户编码
            dealerLabelName: order.drDealerLabel, // 关系标签
            province: order.province_dealerDebit, // 省份
            city: order.city_dealerDebit, // 城市
            county: order.county_dealerDebit, // 地区
            address: order.address_dealerDebit, // 详细地址
            paymentTerm: order.crDealerPaymentTerm,
          };
          this.contactInfo = {
            dealerName: formData.dealerCreditContactPersonName,
            dealerMobilePhone: formData.dealerCreditContactInformation,
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
              inventoryPic: item.inventoryPic_facilityObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_facilityObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_facilityObjCode,
              facilityCode: item.inventoryCode_facilityObjCode,
              specification: item.specification_facilityObjCode,
              measureUnit: item.measureUnit_facilityObjCode,
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

          this.matterList = dataSet;
          this.orderList = {
            [this.relationKey]: dataSet,
          };
          this.$loading.hide();
        })
      },
      // TODO 点击辅助计量栏
      moreUnitClick(item) {
        item.showDrop = !item.showDrop;
      },
      // TODO 选中辅助计量
      moreUnitSelected(val) {
        this.matter.assMeasureUnit = val.invSubUnitName;
        this.matter.assistQty = val.invSubUnitMulti;
      },
      // TODO 组装orderList
      assembleOrder(arr) {
        let orderList = {};
        arr.forEach(item => {
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
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
