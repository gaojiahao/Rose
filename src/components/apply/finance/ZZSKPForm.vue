<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :default-contact="contactInfo"
                         @sel-dealer="selDealer" @sel-contact="selContact"></pop-dealer-list>
        <!--发票信息-->
        <div class="materiel_list">
          <div class="title">发票信息</div>
          <group class="SJ_group" @group-title-margin-top="0">
            <x-input title="票号" v-model="invoiceInfo.ticketNumber" text-align="right" placeholder="请填写"
                     @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>票号</span>
              </template>
            </x-input>
            <popup-picker title="发票类型" :data="invoiceType" v-model="invoiceGetType"
                          @on-change=" typeTask($event) " text-align="right" placeholder="请选择">
              <template slot="title">
                <span class='required'>发票类型</span>
              </template>
            </popup-picker>
            <!--<x-input title="发票金额" v-model="invoiceInfo.invoiceAmount" text-align="right" placeholder="请填写" @on-focus="getFocus($event)"></x-input>-->
            <datetime title="发票日期" v-model='invoiceInfo.invoiceDate' text-align="right" placeholder="请选择">
              <template slot="title">
                <span class='required'>发票日期</span>
              </template>
            </datetime>
            <x-input title="发票内容" text-align='right' placeholder='请填写' v-model='invoiceInfo.invoiceContent'
                     @on-focus="getFocus($event)"></x-input>
          </group>
        </div>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
            <div @click="getMatter" class='no-matter'>
              <div class="title">申请单列表</div>
              <div class="required">请选择申请单</div>
              <span class="iconfont icon-youjiantou r_arrow"></span>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title" @click="showDelete">
              <div>申请单列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{'vux-1px-b' : index < (Object.keys(orderList).length-1)}"
                   v-for="(oItem, key, index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">申请单</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item, index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index, item, key)">
                    <template slot-scope="{item}" slot="info">
                      <!-- 物料属性和单位 -->
                      <div class='matter-more'>
                        <span class='unit'>属性: {{item.processing}}</span>
                        <span class='unit'>单位: {{item.measureUnit}}</span>
                        <span class='unit'>辅助计量: {{item.assMeasureUnit}}</span>
                        <span class='mater_color' v-if="item.taxRate">税率: {{item.taxRate}}</span>
                      </div>
                      <div class="mater_more">
                        <span class='unit'>辅助计量说明: {{item.assMeasureDescription || '无'}}</span>
                        <span>待开票数量: {{item.qtyBal}}</span>
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
                           get-list-method="getManyVATBilling" @sel-matter="selMatter"
                           :default-value="matterList" ref="matter">
            <template slot="titleName" slot-scope="props">
              <span class="order-title">申请单</span>
            </template>
            <template slot="storage" slot-scope="{item}">
              <div>
                <span>数量余额: {{item.qtyBal || 0}}</span>
              </div>
            </template>
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' :validateMap="checkFieldList"
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :show-date-time="true">
          <template slot="qtyBal" slot-scope="{modifyMatter}">
            <div>
              <span>待开票数量: {{modifyMatter.qtyBal}}</span>
            </div>
          </template>
          <template slot="modify" slot-scope="{modifyMatter}">
            <group class='mg_auto'>
              <x-input type="number" v-model.number='modifyMatter.tdQty' text-align="right"
                      @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
                <span class='required' slot="label">本次开票数量</span>
              </x-input>
              <cell title="包装数量" :value="modifyMatter.assistQty" disabled></cell>
            </group>
            <group class='mg_auto'>
              <cell title="含税单价" :value="modifyMatter.price" disabled></cell>
              <x-input type="number" v-model.number='modifyMatter.taxRate' text-align="right"
                      @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
                <span class='required' slot="label">税率</span>
              </x-input>
              <cell title="不含税单价" :value="modifyMatter.noTaxPrice" disabled></cell>
            </group>
          </template>
          <!-- <template slot="tdAmountTitle" >
            <span>本次开票金额</span>
          </template> -->
        </pop-matter>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>

    <!-- 底部提交确认栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
  // vux组件引入
  import {
    Cell, Group, XInput, dateFormat,
    XTextarea, Datetime, PopupPicker,
  } from 'vux'
  // 请求 引入
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/PopDealerList'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RNumber from 'components/RNumber'
  import PopMatterList from 'components/Popup/PopMatterList'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import OpButton from 'components/apply/commonPart/OpButton'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'ZZSKP_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, XInput,
      Datetime, XTextarea, PopDealerList, PopupPicker, RPicker, PopBaseinfo,
      RNumber, PopMatterList, PopMatter, OpButton,
    },
    data() {
      return {
        listId: '0cf1a234-04a5-4021-926b-137914878082',
        dealerInfo: {}, //客户信息
        contactInfo: {}, // 联系人信息
        invoiceType: [['普通发票', '专用发票']],
        invoiceGetType: [],
        invoiceInfo: {
          ticketNumber: '', // 票号
          invoiceType: '', // 发票类型
          invoiceAmount: '', // 发票金额
          invoiceDate: '', // 发票日期
          invoiceContent: '', // 发票内容
        },
        invoicePlan: [],
        dealerParams: { //
          dealerCode: ''
        },
        taxRate: 0.16,
        showInvoicePop: false,
        seletedIndex: 0,
        seletedInvoice: [],
        formData: {
          biProcessStatus: '',
          biComment: ''
        },
        formDataComment: '', // 备注
        projectName: '', // 项目名称
        matterList: [],
        orderList: {},
        showMaterielPop: false,
        matterParams: {},
        numMap: {},
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写本次开票数量'
          },
          {
            key: 'taxRate',
            message: '请填写税率'
          },
        ]
      }
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
      // TODO 选中联系人
      selContact(item) {
        this.contactInfo = {...item,}
      },
      // 发票类型选择
      typeTask(e) {
        this.invoiceInfo.invoiceType = e[0];
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
      // 选择物料，显示物料pop
      getMatter() {
        if (!this.dealerInfo.dealerCode) {
          this.$vux.alert.show({
            content: '请选择客户'
          });
          return
        }
        this.showMaterielPop = !this.showMaterielPop;
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          item.tdQty = item.tdQty || item.qtyBal;
          item.taxRate = item.taxRate || 0.16;
          item.purchaseDay = dateFormat(item.calcTime, 'YYYY-MM-DD');
          item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
          item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
          item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
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
        this.showMaterielPop = !this.showMaterielPop;
      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择客户信息';
        }
        let objArr = [
          {tip: 'ticketNumber', msg: '请输入票号'},
          {tip: 'invoiceType', msg: '请选择发票类型'},
          {tip: 'invoiceDate', msg: '请选择发票日期'},
        ];
        if (!warn) {
          objArr.every(item => {
            if (!this.invoiceInfo[item.tip]) {
              warn = item.msg;
              return false;
            }
            return true
          })
        }
        if (!warn && !this.matterList.length) {
          warn = '请选择物料';
        }
        if (!warn) {
          this.matterList.every(item => {
            if (!item.tdQty && item.tdQty !== 0) {
              warn = '请填写本次开票数量';
              return false
            } 
            let taxRate = item.taxRate || this.taxRate;
            let noTaxAmount = accMul(item.price, item.tdQty);
            let taxAmount = accMul(noTaxAmount, taxRate);
            dataSet.push({
              tdId: item.tdId || '',
              transMatchedCode: item.transCode, // 实例编码,
              salesOutCode: item.salesOutCode,
              inventoryName_transObjCode: item.inventoryName,
              transObjCode: item.inventoryCode,
              tdProcessing: item.processing,
              measureUnit_transObjCode: item.measureUnit,
              assMeasureUnit: item.assMeasureUnit || '',
              assMeasureDescription: item.assMeasureDescription || '',
              assMeasureScale: item.assMeasureScale,
              thenQtyBal: item.qtyBal,
              tdQty: item.tdQty,
              assistQty: item.assistQty,
              price: item.price,
              tdAmount: item.tdAmount,
              taxRate: taxRate,
              noTaxPrice: item.noTaxPrice,
              taxAmount: item.taxAmount,
              comment: item.comment, // 说明
            });
            return true
          });
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveAndStartWf;
            let wfPara = {
              [this.processCode]: {businessKey: "VATO", createdBy: JSON.stringify(this.formData.handler)}
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
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                handlerEntity: this.entity.dealerName,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                order: {
                  crDealerLabel: this.dealerInfo.dealerLabelName,
                  dealerCodeCredit: this.dealerInfo.dealerCode,
                  dataSet: dataSet,
                },
                dealerCreditContactPersonName: this.contactInfo.dealerName || null,
                dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '',
                invoiceDate: this.invoiceInfo.invoiceDate,
                ticketNumber: this.invoiceInfo.ticketNumber,
                invoiceType: this.invoiceInfo.invoiceType,
                invoiceContent: this.invoiceInfo.invoiceContent,

              }),
              wfPara: JSON.stringify(wfPara)
            };
            // 重新提交
            if (this.isResubmit) {
              submitData.biReferenceId = this.biReferenceId;
              operation = saveAndCommitTask
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
        });
      },
      // 获取订单信息用于重新提交
      getFormData() {
        return getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.attachment = data.attachment;
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          let {formData} = data;
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
          // 客户信息
          this.dealerInfo = {
            ...this.dealerInfo,
            dealerName: formData.order.dealerName_dealerCodeCredit,
            dealerCode: formData.order.dealerCodeCredit,
            province: formData.order.province_dealerCodeCredit,
            city: formData.order.city_dealerCodeCredit,
            county: formData.order.county_dealerCodeCredit,
            address: formData.order.address_dealerCodeCredit,
            dealerMobilePhone: formData.dealerMobilePhone_dealerCodeCredit,
            dealerLabelName: formData.order.crDealerLabel
          }
          this.contactInfo = {
            dealerName: formData.dealerCreditContactPersonName,
            dealerMobilePhone: formData.dealerCreditContactInformation
          }
          let orderList = {}
          // 发票列表明细
          formData.order.dataSet.forEach(item => {           
            item.transCode = item.transMatchedCode, // 实例编码,
            item.inventoryName = item.inventoryName_transObjCode,
            item.inventoryCode = item.transObjCode,
            item.inventoryPic = item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            item.qtyBal = item.thenQtyBal, 
            item.processing = item.tdProcessing,
            item.measureUnit = item.measureUnit_transObjCode,          
            this.matterList.push(item);
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          })
          this.orderList = orderList
          this.invoiceInfo = {
            ...this.invoiceInfo,
            ticketNumber: formData.ticketNumber, // 票号
            invoiceType: formData.invoiceType, // 发票类型
            invoiceAmount: formData.invoiceAmount, // 发票金额
            invoiceDate: dateFormat(formData.invoiceDate, 'YYYY-MM-DD'), // 发票日期
            invoiceContent: formData.invoiceContent, // 发票内容

          }
          this.invoiceGetType.push(formData.invoiceType);
          this.dealerParams.dealerCode = formData.order.dealerCodeCredit;
          this.$loading.hide();
          // this.$emit('input', false);
        })
      },
      // TODO 保存草稿数据
      hasDraftData() {
        // 是否选择客户
        if (!Object.values(this.dealerInfo).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            invoice: {
              dealer: this.dealerInfo,
              invoiceInfo: this.invoiceInfo,
              contactInfo: this.contactInfo,
              orderList: this.orderList,
            }
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem('ZZSKP_DATA');
      if (data) {
        let draft = JSON.parse(data);
        this.dealerInfo = draft.invoice.dealer;
        this.contactInfo = draft.invoice.contactInfo;
        this.invoiceInfo = draft.invoice.invoiceInfo;
        this.orderList = draft.invoice.orderList;
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            this.matterList.push(item)
          }
        }
        this.dealerParams.dealerCode = this.dealerInfo.dealerCode;
        this.invoiceGetType.push(this.invoiceInfo.invoiceType);
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmjh-apply-container {
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }

  .vux-cell-box:not(:first-child):before {
    left: 0;
  }

  .XMJH_add {
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      color: #fff;
      padding: .01rem .04rem;
      border-radius: .12rem;
      &:nth-child(1) {
        background: #5077aa;
      }
      &:nth-child(3) {
        background: #fc3c3c;
      }
    }
    em {
      font-style: normal;
    }
  }
</style>
