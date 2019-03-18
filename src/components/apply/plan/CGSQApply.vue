<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"
                      :status-data="currentStage" v-model="formData.biProcessStatus" :showStatus="false">
        </pop-baseinfo>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
                           :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" 
                           :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
                           :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
                           :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
                           :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="info" slot-scope="{item}">
            <div class='mater_other' v-if="item.tdQty">
              <span>
                本次申请: <span class="mater_price">{{item.tdQty}}</span>
              </span>
            </div>
          </template>
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="checkList.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux插件 引入
import { XTextarea, dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/common/commonService'
// mixins 引入
import common from 'mixins/applyCommon'
// 组件 引入
import OpButton from 'components/apply/commonPart/OpButton'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 方法 引入
import { accAdd, accMul } from 'plugins/calc/decimalsAdd'
import { toFixed } from '@/plugins/calc'
import dateCount from '@/plugins/dateCount'
const DRAFT_KEY = 'CGSQ_DATA';

export default {
  data () {
    return {
      selItems: {},
      orderList: {},
      showMaterielPop: false, // 是否显示物料的popup
      formData: {
        biId: '',
        biComment: ''
      },
      modifyKey: '',
      filterList: [
        {
          name: '物料名称',
          value: 'invName',
        }, {
          name: '物料编码',
          value: 'matCode',
        },
        {
          name: '交易号',
          value: 'transCode'
        }
      ],
      checkFieldList: [
        {
          key: 'tdQty',
          message: '请填写本次申请数量'
        },
      ]
    }
  },
  components: {
    XTextarea,
    PopBaseinfo, ApplyMatterPart, OpButton
  },
  filters: {
    dateFormat
  },
  computed: {
    // 订单物料总数量
    totalNum() {
      let total = 0;
      this.matterList.forEach(item => {
        total = accAdd(total, item.tdQty);
      });
      return Number(total);
    },
    // 基于 orderList 此处重组 matterList 数据
    matterList() {
      let arr = [];
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          arr.push(item);
        }
      }
      return arr;
    },
  },
  watch: {
    matterList: {
      handler(list) {
        for (let item of list) {
          /**
           * 此处计算下单截止日
           * @shippingTime 下单截止日
           * @promDeliTime 到货截止日
           * @tdLeadTime 采购提前期
           * 算法：下单截止日 =  “到货截止日期” 减去 “采购提前期”（如果有周末则要减去周末）
           *  
           * */
          if (!item.tdLeadTime){
            item.shippingTime = item.promDeliTime
          }
          else if (!item.promDeliTime){
            item.shippingTime = ''
          }
          else {
            let promDeliTime = new Date(Date.parse(item.promDeliTime.replace(/-/g, "/")));
            let preShippingTime = new Date(promDeliTime.getTime() - (item.tdLeadTime)*24*60*60*1000);
            item.shippingTime = dateFormat(dateCount(preShippingTime, promDeliTime), 'YYYY-MM-DD');
          } 
          // 因包装数量要为整数，先根据当前的申请数量计算包装数量，如有小数向上取整后，再反算本次申请数量
          if (JSON.stringify(item.assistQty).includes('.')){
            item.assistQty = Math.ceil(item.assistQty);
            item.tdQty = accMul(item.assistQty, item.assMeasureScale)
          }
          
        }
      }
    }
  },
  mixins: [common],
  methods: {
    // 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      let orderList = JSON.parse(JSON.stringify(this.orderList));
      sels.map(item => {
        let orderListKey = item.transCode ? item.transCode : 'noCode';
        for (let key in this.dataIndexMap) {
          // 格式化日期
          if (key === 'promDeliTime' || key === 'shippingTime') {
            item[key] = dateFormat(item[this.dataIndexMap[key]], 'YYYY-MM-DD') || "";
          }
          else {
            item[key] = item[key] || item[this.dataIndexMap[key]];
          }
        }
        item.tdQty = item.tdQty || Math.max(item.qtyBalance, item.moq);
        if (!orderList[orderListKey]) {
          orderList[orderListKey] = [];
        }
        orderList[orderListKey].push(item);
      })
      this.orderList = orderList;
    },
    // 显示物料修改的pop
    getMatterModify (item, index, key) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // 选择默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 提交字段校验
    checkAmt(item, key, val) {
      item[key] = Math.abs(toFixed(val)); 
      let min = Math.max(item.thenQtyBal, item.moq)
      if (key === 'tdQty'){
        // 因包装数量要为整数，先根据当前的申请数量计算包装数量，如有小数向上取整后，再反算本次申请数量
        item.assistQty = Math.ceil(item.assistQty);
        item.tdQty = accMul(item.assistQty, item.assMeasureScale)
      }
    },
    // 物料修改确定
    selConfirm (val) {
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
    // 选择要删除的物料
    delClick(sItem, index, key) {
      let arr = this.selItems[key];
      if (arr){
        let delIndex = arr.findIndex(item => item === index);
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          if (!arr.length) delete this.selItems[key];
          return;
        }
        arr.push(index);
      }
      else {
        this.$set(this.selItems, key, [index])
      }
    },
    // 删除的选中状态
    showSelIcon(sItem, index) {
      if (sItem.transCode) {
        return this.selItems[sItem.transCode] && this.selItems[sItem.transCode].findIndex(item => item === index) !== -1;
      }
      else {
        return this.checkList.includes(index);
      }
    },
    // 全选
    checkAll() {
      // 如果已全部选中 则清除所有选中状态
      if (this.checkList.length === this.matterList.length) {
        this.selItems = {};
        return
      }
      // 针对物料列表中的数据进行处理
      let selItems = {};
      for (let key in this.orderList){
        this.orderList[key].forEach((item, index) => {
          // 存在交易号时 key等于交易号
          if (item.transCode) {
            if (!selItems[item.transCode]){
              selItems[item.transCode] = [];
            }
            selItems[item.transCode].push(index)
          }
          // 不存在时 key为 'noCode'
          else {
            if (!selItems['noCode']) {
              selItems['noCode'] = []
            }
            selItems['noCode'].push(index);
          }
        })
      }
      this.selItems = selItems;
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          /** 
           *  @selItems {String} 被选中删除的物料对象（当有交易号时 key为交易号 反之 key为noCode）
           *  @checkList {Array} 被选中删除的物料数组 (存储被删除物料的下标)
           *  @matterList {Array} 物料列表
           */ 

          // 被选中删除的物料
          let selItems = this.selItems, checkList = this.checkList;
          
          for (let key in this.selItems) {
            // 当没有对应的交易单号
            if (key === 'noCode') {
              let orderList = {};
              let remainder = this.matterList.filter((item, index) => !checkList.includes(index));
              remainder.forEach(item => {
                if (!orderList[key]) {
                  orderList[key] = []
                }
                orderList[key].push(item);
              });
              this.orderList = orderList;
            }
            // 当存在对应的交易单号
            else {
              // 将orderList中对应交易号的物料 按照selItems中的索引删除
              let newIndexs = this.selItems[key].map((val, idx) => val - idx);              
              newIndexs.forEach((sItem, sIndex) => {
                this.orderList[key].splice(sItem, 1);
              }) 
              if (!this.orderList[key].length){
                delete this.orderList[key]
              }
            }
          }
          this.selItems = {};
          this.matterModifyClass = false;
        }
      })
    },
    // 新增物料
    addMatter () {
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 提价订单
    submitOrder (){
      let warn = '',
          dataSet = [];
      if (!this.matterList.length) {
        warn = '请选择物料';
      }
      if (!warn) {
        // 校验 是否已选择 <物料部分>
        if (!this.matterList.length) warn = '请选择物料';
        
        // 检验必填字段，组装要提交的dataSet
        for (let item of this.matterList) {
          let oItem = {};
          for (let sItem of this.submitMatterField){
            if (!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]){
              warn = `${sItem.text}不为空`
              break;
            }
            oItem[sItem.fieldCode] = item[sItem.fieldCode] != null ? item[sItem.fieldCode] : null
          }
          dataSet.push(oItem);
        }
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
          let submitData = {
            listId: this.listId,
            biComment: this.biComment,
            formData: JSON.stringify({
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              order: {
                dataSet
              }
            }),
            wfPara: JSON.stringify(wfPara)
          }
          // 重新提交
          if (this.isResubmit) {
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
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
          this.saveData(operation,submitData);
        }
      })
    },
    // 获取订单信息用于重新提交
    async getFormData () {
      await getSOList({
        formViewUniqueId: this.uniqueId,
        transCode: this.transCode
      }).then( (data) => {
        this.listId = data.listId;
        this.biReferenceId = data.biReferenceId;
        this.attachment = data.attachment;
        let {formData} = data;
        let orderList = {};
        let dataSet = [];
        dataSet = formData.order.dataSet.map(item => {
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
            inventoryType: item.inventoryType_transObjCode,
            inventorySubclass: item.inventorySubclass_transObjCode,
            allQty: item.productDemandQty,
            qtyed: item.thenLockQty,
            qtyBalance: item.thenQtyBal,
            transCode: item.transMatchedCode,
          }
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
          return item;
        });
        this.orderList = orderList;
        this.matterList = dataSet;
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
          ...this.handlerDefault,
          creator: formData.creator,
          modifer: formData.modifer,
          biId: formData.biId,
          biComment: formData.biComment,
          biProcessStatus: formData.biProcessStatus,
        }
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData () {
      if (!Object.values(this.orderList).length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          orderList: this.orderList,
          formData: this.formData,
        }
      };
    },
  },
  created () {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      this.orderList = JSON.parse(data).orderList;
      this.formData = JSON.parse(data).formData;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
</script>

<style lang='scss' scoped>
@import '~scss/biz-app/bizApply';

.pages {
  /deep/ .vux-no-group-title{
    margin-top: 0;
  }
    /deep/ .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
      }
    }
}
.mater_others {
  .mater_type,
  .mater_price {
    height: .18rem;
    line-height: .18rem;
  }
  span {
    font-size: .1rem;
    color: #757575;
    margin-right: 0.04rem;
  }
}
</style>
