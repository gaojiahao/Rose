<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo" dealer-label-name="原厂供应商,经销供应商"
                         dealerTitle="供应商" :default-contact="contactInfo" @sel-contact="selContact"></pop-dealer-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="dealerInfo.paymentTerm"
                           v-model="dealerInfo.paymentTerm"></pop-single-select>
        <div class="other_info">
          <div class="title">账期天数</div>
          <div class="mode">{{dealerInfo.pamentDays}}</div>
        </div>
        <!-- 物流条款 -->
        <pop-single-select title="物流条款" :data="logisticsTerm" :value="dealerInfo.dealerLogisticsTerms"
                           v-model="dealerInfo.dealerLogisticsTerms"></pop-single-select>
        <div class="other_info">
          <div class="title">协议总金额</div>
          <div class="mode">{{tdAmount | numberComma}}</div>
        </div>
        <r-date title="协议开始日" :value="inPut.executionDate" v-model="inPut.executionDate"></r-date>
        <r-date title="协议到期日" :value="inPut.validUntil" v-model="inPut.validUntil"></r-date>
        <x-input class="tdAmount" type="number" title="预付款" :value="inPut.tdAmountCopy1" text-align="right"
                 placeholder="请填写预付款" v-model="inPut.tdAmountCopy1"></x-input>
        <r-date title="预付到期日" :value="inPut.prepaymentDueDate" v-model="inPut.prepaymentDueDate"></r-date>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">物料列表</div>
              <div class="required">请选择物料</div>
              <i class="iconfont icon-youjiantou r_arrow"></i>
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
              <div class="each_mater"
                   :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}"
                   v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                             @click.native="delClick(item,index)">
                  <template slot="info" slot-scope="{item}">
                    <!-- 物料属性和单位 -->
                    <div class='matter-more'>
                      <span class='unit'>属性: {{item.processing}}</span>
                      <span class='unit'>主计量: {{item.measureUnit}}</span>
                      <span class='unit'>辅助计量: {{item.assMeasureUnit}}</span>
                      <span class='mater_color' v-if="item.taxRate">税率: {{item.taxRate}}</span>
                    </div>
                    <div class="mater_more">
                      <span class='unit'>辅助计量说明: {{item.assMeasureDescription || '无'}}</span>
                    </div>
                    <!-- 物料数量和价格 -->
                    <div class='mater_other' v-if="item.price && item.tdQty">
                      <div class='mater_price'>
                        <span class="symbol">￥</span>{{item.price}}
                      </div>
                      <div>
                        <r-number :num="item.tdQty" :checkAmt='checkAmt' v-model="item.tdQty"></r-number>
                      </div>
                    </div>
                  </template>
                  <template slot="editPart" slot-scope="{item}">
                    <div class="edit-part vux-1px-l"
                         @click="modifyMatter(item, index)"
                         v-show="(item.price && item.tdQty) && !matterModifyClass">
                      <span class='iconfont icon-bianji1'></span>
                    </div>
                  </template>
                </matter-item>
                <div class='delete_icon' @click="delClick(item,index)" v-if='matterModifyClass'>
                  <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                  <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
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
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                           :default-value="matterList" :params="matterParams" get-list-method="getInventoryToProcessing"
                           ref="matter" :isShowCode="false"></pop-matter-list>

        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-check-stock="false"></pop-matter>
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
        <span style="fontSize:.14rem">￥</span>{{tdAmount |numberComma(3)}}
        <span class="taxAmount">[含税: ￥{{taxAmount |numberComma(3)}}]</span>
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
  import {XTextarea, dateFormat, Datetime, XInput} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import PopMatterList from 'components/Popup/PopMatterList'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RNumber from 'components/RNumber'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RDate from 'components/RDate'
  // 方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'CGXY_DATA';

  export default {
    components: {
      XTextarea, RNumber, Datetime,
      PopMatterList, PopDealerList, PopSingleSelect, PopMatter, RPicker, PopBaseinfo,
      RDate, XInput,
    },
    data() {
      return {
        listId: '67ff01b1-52bc-4e01-9650-214dc6e5e8f9',
        taxRate: 0.16, // 税率
        numMap: {},
        order: {
          // executionDate: '', // 执行日期
          // validUntil: '', //截止日期
        },
        inPut: {
          tdAmountCopy1: '',
          executionDate: '', // 执行日期
          validUntil: '', // 截止日期
          thenTotalAmntBal: '',
          prepaymentDueDate: ''
        },
        formData: { // 表单提交内容
          creator: '',
          modifer: '',
          biId: '',
          biComment: '',
        },
        logisticsTerm: [], // 物流条款 数组
        dealerInfo: {},
        transMode: [], // 结算方式
        matterList: [], // 物料列表
        showTransPop: false, // 是否显示结算方式的popup
        showMaterielPop: false, // 是否显示物料的popup
        showDealerPop: false, // 是否显示供应商的popup
        contactInfo: {},
        matterParams: {
          processing: '原料',
        },
      }
    },
    mixins: [common],
    methods: {
      // 获取结算方式
      getPaymentTerm() {
        return getDictByType('paymentTerm').then(({tableContent}) => {
          this.transMode = tableContent;
        })
      },
      // 选中的供应商
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
      },
      // 选中联系人
      selContact(val) {
        this.contactInfo = {...val};
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        sels.map(item => {
          let defaultTime = item.processingStartDate ? dateFormat(item.processingStartDate, 'YYYY-MM-DD') : '';
          let {tdQty = '', price = '', taxRate = 0.16, processingStartDate = defaultTime} = this.numMap[item.inventoryCode] || {};
          item.tdQty = tdQty;
          item.price = price;
          item.taxRate = taxRate;
          item.processingStartDate = processingStartDate;
          item.assMeasureUnit = item.invSubUnitName || null; // 辅助计量
          item.assMeasureScale = item.invSubUnitMulti || null; // 与单位倍数
          item.assMeasureDescription =  item.invSubUnitComment || null; // 辅助计量说明
        })
        this.numMap = {};
        this.matterList = sels;
      },
      // 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
      delClick(sItem, index) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
        // 若存在重复的 则清除
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
            this.selItems.forEach(item => {
              let index = this.matterList.findIndex(item2 => item2.inventoryCode === item.inventoryCode);
              if (index >= 0) {
                this.matterList.splice(index, 1);
              }
            })
            this.selItems = [];
            this.matterModifyClass = false;
          }
        })

      },
      // TODO 新增更多物料
      addMatter() {
        for (let item of this.matterList) {
          // 存储已输入的价格
          this.numMap[item.inventoryCode] = {...item};
        }
        this.showMaterielPop = !this.showMaterielPop;
      },
      // 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择供应商信息';
        } else if (this.matterList.length === 0) {
          warn = '请选择物料';
        }
        else if(!this.inPut.executionDate){
          warn = '请选择协议开始日'
        }
        else if(!this.inPut.validUntil){
          warn = '请选择协议到期日'
        }
        if (!warn) {
          // 校验
          this.matterList.every(item => {
            if (!item.price) {
              warn = '单价不能为空';
              return false
            }
            if (!item.tdQty) {
              warn = '数量不能为空';
              return false
            }
            let taxRate = item.taxRate;
            let taxAmount = accMul(item.price, item.tdQty, taxRate);
            // 设置提交参数
            dataSet.push({
              tdId: item.tdId || '',
              inventoryName_transObjCode: item.inventoryName, // 物料名称
              transObjCode: item.inventoryCode, // 物料编码
              executionDate: this.inPut.executionDate,
              validUntil: this.inPut.validUntil,
              tdProcessing: item.processing,// 加工属性
              assMeasureUnit: item.assMeasureUnit,
              assMeasureDescription: item.assMeasureDescription,
              assMeasureScale: item.assMeasureScale,
              tdQty: item.tdQty, // 数量
              assistQty: item.assistQty,
              price: item.price, // 单价
              tdAmount: item.tdAmount,
              taxRate: taxRate, // 税金
              noTaxPrice: item.noTaxPrice,
              taxAmount: taxAmount, // 税金
              comment: item.comment || '' // 说明
            });
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
            let dealerInfo = this.dealerInfo;
            let submitData = {
              listId: this.listId,
              biComment: this.biComment,
              formData: JSON.stringify({
                ...this.formData,
                handlerEntity: this.entity.dealerName,
                dealerDebitContactPersonName: this.contactInfo.dealerName || null,
                dealerDebitContactInformation: this.contactInfo.dealerMobilePhone || '',
                drDealerLogisticsTerms: dealerInfo.dealerLogisticsTerms,
                inPut: {
                  dealerDebit: dealerInfo.dealerCode,
                  drDealerLabel: dealerInfo.dealerLabelName,
                  daysOfAccount: dealerInfo.pamentDays,
                  dataSet: [{
                    ...this.inPut,
                    thenTotalAmntBal: this.tdAmount,
                  }]
                },
                order: {
                  dealerDebit: this.dealerInfo.dealerCode,
                  drDealerLabel: this.dealerInfo.dealerLabelName || '',  // 往来关系标签
                  drDealerPaymentTerm: this.dealerInfo.paymentTerm,  // 结算方式
                  dataSet,
                },
              }),
              wfPara: JSON.stringify(wfPara)
            }
            // 重新提交
            if (this.isResubmit) {
              operation = saveAndCommitTask
              submitData.biReferenceId = this.biReferenceId;
            }
            // 没有工作流
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
      // 获取订单信息用于重新提交
      async getFormData() {
        await getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          let {formData} = data;
          this.attachment = data.attachment
          formData.order.dataSet.map(item => {
            item = {
              ...item,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.transObjCode,
              specification: item.specification_transObjCode,
              processing: item.tdProcessing || '商品',
              measureUnit: item.measureUnit_transObjCode,
            }
            this.matterList.push(item);
          })
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
          // 供应商信息展示
          this.dealerInfo = {
            creatorName: formData.dealerDebitContactPersonName,
            dealerMobilePhone: formData.dealerDebitContactInformation,
            dealerCode: formData.order.dealerDebit,
            dealerName: formData.order.dealerName_dealerDebit,
            province: formData.order.province_dealerDebit,
            city: formData.order.city_dealerDebit,
            county: formData.order.county_dealerDebit,
            address: formData.order.address_dealerDebit,
            dealerLogisticsTerms: formData.drDealerLogisticsTerms,
            pamentDays: formData.inPut.daysOfAccount,
            paymentTerm: formData.order.drDealerPaymentTerm || '', // 结算方式
          }
          this.contactInfo = {
            dealerName: formData.dealerDebitContactPersonName,
            dealerMobilePhone: formData.dealerDebitContactInformation,
          }
          this.inPut = {
            tdAmountCopy1: formData.inPut.dataSet[0].tdAmountCopy1,
            executionDate: formData.inPut.dataSet[0].executionDate, // 执行日期
            validUntil: formData.inPut.dataSet[0].validUntil, // 截止日期
            thenTotalAmntBal: formData.inPut.dataSet[0].thenTotalAmntBal,
            prepaymentDueDate: formData.inPut.dataSet[0].prepaymentDueDate
          }
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
            dealerInfo: this.dealerInfo,
            formData: this.formData,
            contactInfo: this.contactInfo,
            inPut: this.inPut
          }
        };
      },
      // TODO 获取关联数据
      getRelationData() {
      },
      // 获取 物流条款
      getLogisticsTerms() {
        return getDictByType('dealerLogisticsTerms').then(({tableContent}) => {
          this.logisticsTerm = tableContent;
        })
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
        this.inPut = draft.inPut;
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
        left: 0;
      }
    }
    .tdAmount {
      margin: 0 auto;
      padding: .07rem .1rem;
      width: 95%;
      background-color: #fff;
      color: #757575;
      font-size: .14rem;
      box-sizing: border-box;
      &:before {
        display: none;
      }
      /deep/ .weui-input {
        color: #111;
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
  }
</style>

