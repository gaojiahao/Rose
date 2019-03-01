<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo" :dealer-params="dealerParams"
                         :defaultContact="contact"></pop-dealer-list>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="matterList" :default-value="[]" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="info" slot-scope="{item}">
            <div class="matter_info_item">
              <div class="matter_detail" v-if="item.qtyDownline">
                <span class="matter_item_title">数量下线:</span>
                <span class="matter_item_value">{{item.qtyDownline}}</span>
              </div>
              <div class="matter_detail" v-if="item.qtyOnline">
                <span class="matter_item_title">数量上线:</span>
                <span class="matter_item_value">{{item.qtyOnline}}</span>
              </div>
            </div>      
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
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux组件引入
import { XTextarea } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { updateData, saveAndStartWf, getBaseInfoData, 
         saveAndCommitTask, getDictByType, submitAndCalc } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import PopDealerList from 'components/Popup/PopDealerList'
import OpButton from 'components/apply/commonPart/OpButton'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 方法引入
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'

const DRAFT_KEY = 'XSHT_DATA';
export default {
  data() {
    return {
      listId: '525bee48-d2d4-11e8-b8ca-0279b2c6a380',
      showMatterPop: false,
      showMaterielPop: false, // 是否显示物料的popup
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        }
      ], 
      numMap: {}, // 用于记录订单物料的数量和价格
      contact: {},
      formData: {},
      dealerInfo: {},
      transMode: [], // 结算方式 数组
      matterList: [], // 物料列表
      logisticsTerm: [], // 物流条款 数组
    }
  },
  computed: {
    // 合同总金额
    thenTotalAmntBal() {
      let total = 0;
      this.matterList.forEach(item => {
        let {assistQty, price} = item;
        let tdAmount = accMul(assistQty, price);
        total = accAdd(total, tdAmount);
      });
      return toFixed(total);
    },
  },
  components: {
    XTextarea, 
    OpButton, PopBaseinfo, PopDealerList, ApplyMatterPart
  },
  mixins: [common],
  methods: {
    // 选中的客户
    selDealer(val) {
      let [chosenDealer = {}] = JSON.parse(val);
      // 此处为了校验和提交 重组部分数据
      chosenDealer.daysOfAccount= chosenDealer.pamentDays;
      chosenDealer.drDealerPaymentTerm = chosenDealer.paymentTerm;
      chosenDealer.dealerName_dealerDebit = chosenDealer.dealerName;
      chosenDealer.drDealerLogisticsTerms = chosenDealer.dealerLogisticsTerms;
      
      this.dealerInfo = chosenDealer;

      if(this.matterParams.data && this.matterParams.data.drDealerCode){
        this.matterParams.data.drDealerCode = this.dealerInfo.dealerCode;
        this.matterList = [];
      }
    },
    selContact(val) {
      this.contact = {...val};
    },
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val); 
      let matterList = JSON.parse(JSON.stringify(this.matterList))
      sels.map(item => {
        this.submitMatterField.forEach(sItem => {
          if(sItem.fieldCode !== 'price' && sItem.showFieldCode){
            item[sItem.fieldCode] = item[sItem.fieldCode] || item[sItem.showFieldCode] 
          }
        })
        item.price = '';
        item.taxRate = this.taxRate;
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
        matterList.push(item)
      });
      this.matterList = matterList;
    },
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    addMatter(){
      this.showMaterielPop = !this.showMaterielPop
    },
    // 选择要删除的物料
    delClick(sItem, index, key) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item === index);
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(index);
    },
    // 判断是否展示选中图标
    showSelIcon(sItem, index) {
      return this.selItems.includes(index);
    },
    // 展开可删除状态
    showDelete(){
      this.matterModifyClass = ! this.matterModifyClass;
      this.selItems = [];
    },
    // 全选
    checkAll() {
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = this.matterList.map((item, index) => index);
    },
    // 删除选中的
    deleteCheckd () {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          let orderList = {};
          let selItems = this.selItems;
          // 没被删除的
          let remainder = this.matterList.filter((item, index) => !selItems.includes(index)); 
          this.matterList = remainder;
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })
    },
    checkAmt(item, key, val) {
      item[key] = Math.abs(toFixed(val)); 
    },
    // 提价订单
    submitOrder() {
      let warn = '', dataSet = [], 
          dealerInfo = this.dealerInfo, 
          dealerConfig = this.dealerConfig;
      
      // 校验 <往来部分> 必填字段
      warn = this.verifyData(dealerConfig, dealerInfo);
          
      if (!warn) {
        // 校验 是否已选择 <物料部分>
        if(!this.matterList.length) warn = '请选择物料';
        
        // 动态组装 dataSet
        this.matterList.forEach(item => {
          let oItem = {};
          for(let sItem of this.submitMatterField){
            if(!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]){
              warn = `${sItem.text}不为空`
              break;
            }
            oItem[sItem.fieldCode] = item[sItem.fieldCode] != null ? item[sItem.fieldCode] : null
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
          let operation = saveAndStartWf; // 默认有工作流
          let wfPara = {
            [this.processCode]: {businessKey: this.businessKey, createdBy: ""}
          };
          if (this.isResubmit && !this.isModify) {
            wfPara = {
              businessKey: this.transCode,
              createdBy: this.formData.handler,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ""
            }
          }
          let common = {
            dealerDebit: this.dealerInfo.dealerCode,
            drDealerLabel: this.dealerInfo.dealerLabelName,
          };
          let submitData = {
            listId: this.listId,
            biComment: this.formData.biComment,
            formData: JSON.stringify({
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              dealerDebitContactPersonName: this.contact.dealerName, // 联系人
              dealerDebitContactInformation: this.contact.dealerMobilePhone, // 联系人电话
              drDealerLogisticsTerms: this.dealerInfo.dealerLogisticsTerms,
              order: {
                ...common,
                dataSet
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
          if(this.isModify) {
            operation = updateData;
          }
          this.saveData(operation, submitData);
        }
      })
    },
    // 获取订单信息用于重新提交
    getFormData() {
      return getSOList({
        formViewUniqueId: this.formViewUniqueId,
        transCode: this.transCode
      }).then((data) => {
        this.listId = data.listId;
        this.biComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        this.attachment = data.attachment;
        let {formData} = data;
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
        };
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
        };
        // 订单信息
        this.contact = {
          dealerName: formData.dealerDebitContactPersonName, //联系人
          dealerMobilePhone: formData.dealerDebitContactInformation,//电话
        };
        // 物料列表请求参数
        if(this.matterParams.data && this.matterParams.data.dealerCode != null){
          this.matterParams = {
            ...this.matterParams,
            drDealerCode: this.dealerInfo.dealerCode,
          };
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
          contact: this.contact,
          matterParams: this.matterParams
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
      this.contact = draft.contact;
      this.matterParams = draft.matterParams;
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


</style>
