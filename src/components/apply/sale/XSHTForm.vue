<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo" :dealer-params="dealerParams"
                         :defaultContact="contact"></pop-dealer-list>
        <!-- <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part> -->
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="matterList" :default-value="matterList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
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
import {Popup, Group, Cell, numberComma, Datetime, XInput, XTextarea} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc} from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopMatterList from 'components/Popup/PopMatterListTest'
import PopDealerList from 'components/Popup/PopDealerList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
import PopMatter from 'components/apply/commonPart/MatterPop'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import RPicker from 'components/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
import OpButton from 'components/apply/commonPart/OpButton'
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
      transMode: [], // 结算方式 数组
      matterList: [], // 物料列表
      logisticsTerm: [], // 物流条款 数组
      numMap: {}, // 用于记录订单物料的数量和价格
      contact: {},
      formData: {},
      dealerInfo: {
        validUntil: '',
        advancePaymentDueDate: '',
      },
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
    XInput, XTextarea, Group, Cell, Popup, OpButton,
    PopMatter, RNumber, PopMatterList, PopDealerList,
    PopSingleSelect, Datetime, RPicker, PopBaseinfo, DealerOtherPart, ApplyMatterPart
  },
  mixins: [common],
  filters: {
    numberComma,
  },
  methods: {
    // 选中的客户
    selDealer(val) {
      let sel = JSON.parse(val)[0];
      this.dealerInfo = {
        ...this.dealerInfo,
        ...sel,
      };
      this.dealerInfo.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
      this.dealerInfo.daysOfAccount= this.dealerInfo.pamentDays;
      this.dealerInfo.drDealerLogisticsTerms = this.dealerInfo.dealerLogisticsTerms;
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
      sels.map(item => {
        this.submitMatterField.forEach(sItem => {
          if(sItem.fieldCode !== 'price' && sItem.showFieldCode){
            item[sItem.fieldCode] = item[sItem.fieldCode] || item[sItem.showFieldCode] 
          }
        })
        item.price = item.price || '';
        item.taxRate = item.taxRate || 0.16;
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
      });
      this.matterList = sels;
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
    // 滑动删除
    delClick(sItem, index) {
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
    checkAmt(item) {
      let {tdQty, tdAmountCopy1} = item;
      if (tdQty) {
        item.tdQty = Math.abs(toFixed(tdQty));
      }
      if (tdAmountCopy1) {
        item.tdAmountCopy1 = Math.abs(toFixed(tdAmountCopy1));
      }
    },
    // 提价订单
    submitOrder() {
      let warn = '',
          dataSet = [];
      // 表单校验字段
      let verifyField = [
        /*
         * key -> 第一层校验字段
         * childKey -> 第二层校验字段 （非必填，如果只有一层，此处可以为空）
        */ 
        {
          key: 'dealerInfo',
          childKey: 'dealerName',
          message: '请选择客户'
        },      
        {
          key: 'matterList',
          childKey: 'length',
          message: '请选择物料'
        }, 
      ]
      if (!warn) {
        // 校验 最外层表单必填项
        verifyField.every( item => {
          if(item.childKey && !this[item.key][item.childKey]) {
            warn = item.message;
            return false;
          }
          else if(!this[item.key]) {
            warn = item.message;
            return false;
          }  
          return true;
        })
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
          this.saveData(operation, submitData);
        }
      })
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
