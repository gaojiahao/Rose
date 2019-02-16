<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"
                      :status-data="currentStage" v-model="formData.biProcessStatus" :showStatus="false"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo"  :dealer-params="dealerParams"
                         dealerTitle="供应商" :default-contact="contactInfo" @sel-contact="selContact"></pop-dealer-list>
        <!-- 结算方式 -->
        <!-- <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part> -->
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="matterList" :default-value="matterList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="info" slot-scope="{item}">
            <div class='mater_other' v-if="item.price">
              <div class='mater_price'>
                <span class="symbol">￥</span>{{item.price}}
              </div>
            </div>
          </template>
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
              :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
              @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
  // vux插件引入
  import {XTextarea, dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import PopDealerList from 'components/Popup/PopDealerList'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
  import OpButton from 'components/apply/commonPart/OpButton'
  // 方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'CGXY_DATA';

  export default {
    components: {
      XTextarea, 
      PopDealerList, PopBaseinfo, DealerOtherPart, ApplyMatterPart, OpButton
      
    },
    data() {
      return {
        numMap: {},
        formData: { // 表单提交内容
          creator: '',
          modifer: '',
          biId: '',
          biComment: '',
          biProcessStatus: ''
        },
        dealerInfo: {},
        matterList: [], // 物料列表
        showMaterielPop: false, // 是否显示物料的popup
        contactInfo: {},
        filterList: [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          }
        ], 
      }
    },
    mixins: [common],
    methods: {
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
          item.price = item.price || '';
          item.taxRate = item.taxRate || 0.16;
          item.validUntil = item.validUntil || ''; // 有效日期
          item.expiryDate = item.expiryDate || ''; // 失效日期
        })
        this.matterList = sels;
      },
      // 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 选择要删除的物料
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
      // 校验数字
      checkAmt(item, key, val) {
        item[key] = Math.abs(toFixed(val)); 
      },
      // TODO 新增更多物料
      addMatter() {
        this.showMaterielPop = !this.showMaterielPop;
      },
      // 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择供应商信息';
        } 
        if (!warn) {
          // 校验
          this.matterList.forEach(item => {
            let oItem = {};
            for(let sItem of this.submitMatterField){
              if(!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode] && !item[sItem.showFieldCode]) {
                warn = `${sItem.text}不为空`
                break;
              }
              oItem[sItem.fieldCode] = item[sItem.fieldCode] || item[sItem.showFieldCode] || null;
            }
            dataSet.push(oItem);
            
          });
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
            handler: formData.handler || formData.creator,
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
            paymentTerm: formData.order.drDealerPaymentTerm || '', // 结算方式
          }
          this.contactInfo = {
            dealerName: formData.dealerDebitContactPersonName,
            dealerMobilePhone: formData.dealerDebitContactInformation,
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
          }
        };
      },
      // 将物料配置拆分成属性和可编辑部分
      splitConfig(editMatterPop, editMatterPopConfig){
        for(let [index, item] of Object.entries(editMatterPop)) {
          if(!item.readOnly) {
            editMatterPopConfig.property = editMatterPop.slice(0, index);
            editMatterPopConfig.editPart = editMatterPop.slice(index);
            break;
          }
        }

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

