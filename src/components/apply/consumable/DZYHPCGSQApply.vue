<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="consumableList" :default-value="[]"
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="consumables" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="info" slot-scope="{item}">
            <div class='mater_other' v-if="item.price && item.tdQty">
              <div class='mater_price'>
                <span class="symbol">￥</span>{{item.price}}
              </div>
              <r-number :num="item.tdQty" v-model="item.tdQty"></r-number>
            </div>
          </template>
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !consumableList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="selItems.length === consumableList.length" @on-submit="save" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux组件引入
import { XTextarea } from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {submitAndCalc, saveAndStartWf, getDictByType, saveAndCommitTask} from 'service/commonService'
// mixins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import UploadFile from 'components/upload/UploadFile'
import OpButton from 'components/apply/commonPart/OpButton'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 方法引入
import {toFixed} from '@/plugins/calc'
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

const DRAFT_KEY = 'DZYHPCGSQ_DATA';

export default {
  data() {
    return {
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        }
      ],
      listId: '4472a646-f2c8-4a07-bad6-4c01f0b9292f',
      transCode: '',
      formData: {},
      consumables: {}, // 当前要编辑的物料
      consumableList: [], // 物料列表
      showMaterielPop: false, // 是否显示物料的popup
    }
  },
  components: {
    XTextarea, RNumber, UploadFile,
    PopBaseinfo, ApplyMatterPart, OpButton
  },
  mixins: [ApplyCommon],
  watch:{
    //修改的物料
    consumables:{
      handler(val){
        this.simpleCalcMatter(val)
      },
      deep:true
    },
    consumableList: {
      handler(val) {
        let tdAmount = 0, taxAmount = 0;
        for (let item of val) {
          this.simpleCalcMatter(item);
          tdAmount = toFixed(accAdd(tdAmount, item.tdAmount));
          taxAmount = toFixed(accAdd(taxAmount, item.taxAmount));
        }
        this.tdAmount = tdAmount;
        this.taxAmount = taxAmount;
      },
      deep: true
    }
  },
  methods: {
    // 显示物料修改的pop
    getMatterModify(item, index, key) {
      this.consumables = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // 展开可删除状态
    showDelete(){
      this.matterModifyClass = ! this.matterModifyClass;
      this.selItems = [];
    },
    // 选择要删除的物料
    delClick(sItem, index) {
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
    // 全选
    checkAll() {
      if (this.selItems.length === this.consumableList.length) {
        this.selItems = [];
        return
      }
      this.selItems = this.consumableList.map((item, index) => index);
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          let selItems = this.selItems;
          // 没被删除的
          let remainder = this.consumableList.filter((item, index) => !selItems.includes(index)); 
          this.consumableList = remainder;
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })
    },
    // 更新修改后的物料信息
    selConfirm(val){
      let modMatter = JSON.parse(val);
      this.$set(this.consumableList, this.modifyIndex, modMatter);
    },
    // 点击增加更多物料
    addMatter() {
      this.showMaterielPop = !this.showMaterielPop
    },
    // 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      sels.forEach(item => {
        item.price = '';
        item.tdQty = '';
      });
      this.consumableList = [...this.consumableList, ...sels];
    },
    // 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 提交
    save() {
      /**
       * @warn 提示文字
       * @dataSet 组装提交的物料数据
       * 
       */
      let warn = '', dataSet = [];
      if (!this.consumableList.length){
        warn = '请选择物料'
      }
      // 动态组装 dataSet
      for (let item of this.consumableList) {
        let oItem = {};
        for (let sItem of this.submitMatterField){
          let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
          if (!sItem.hidden && !sItem.allowBlank && !val && val !== undefined){
            if (sItem.text) warn = `${sItem.text}不为空`;
            break;
          }
          oItem[sItem.fieldCode] = val !== null ? val : null;
        }
        dataSet.push(oItem);
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
          let formData = {
            creator: this.formData.handler,
            ...this.formData,
            modifer: this.formData.handler,
            handlerEntity: this.entity.dealerName,
            order: {
              dataSet
            }
          };
          let submitData = {
            listId: this.listId,
            biComment: '',
            formData: JSON.stringify(formData),
            wfPara: JSON.stringify({
              [this.processCode]: {
                businessKey: this.businessKey,
                createdBy: formData.creator,
              }
            }),
          };
          // 若为重新提交，则修改提交参数
          if (this.transCode) {
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
            submitData.wfPara = JSON.stringify({
              businessKey: this.transCode,
              createdBy: formData.creator,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ''
            });
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
    // 获取详情
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
        let consumableList = [];
        this.attachment = attachment;
        // 获取合计
        let {order} = formData;
        let {dataSet = []} = order;
        for (let item of dataSet) {
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing,
            measureUnit: item.measureUnit_transObjCode,
            inventoryColor: item.inventoryColor_transObjCode,
          };
          consumableList.push(item);
        }
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
        this.biReferenceId = formData.biReferenceId;
        this.consumableList = consumableList;
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData() {
      if (!this.consumableList.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          matter: this.consumableList,
          formData: this.formData
        }
      };
    },
    // 检查本次申请和估计价格，并计算估计金额
    checkAmt(item) {
      let {tdQty, price} = item;
      tdQty = Math.abs(toFixed(tdQty));
      price = Math.abs(toFixed(price));
      if (tdQty) {
        item.tdQty = tdQty;
        item.tdAmount = toFixed(accMul(tdQty, price));
      }
      if (price) {
        item.price = price;
        item.tdAmount = toFixed(accMul(tdQty, price));
      }
    },
  },
  created() {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      this.consumableList = JSON.parse(data).matter;
      this.formData = JSON.parse(data).formData;
      sessionStorage.removeItem(DRAFT_KEY)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

</style>
