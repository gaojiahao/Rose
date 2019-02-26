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
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="matterList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="getMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
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
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num">
        <span class="total_price">
          <span style="fontSize:.14rem">合计: </span>{{totalNum}}
        </span>
      </span>
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : btnIsHide}" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline' v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='delete_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
// vux插件 引入
import { Group, XInput, XTextarea, Datetime, Cell, dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getBaseInfoData, saveAndStartWf, saveAndCommitTask, submitAndCalc } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件 引入
import PopMatterList from 'components/Popup/PopMatterListTest'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RNumber from 'components/RNumber'
import RPicker from 'components/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
import OpButton from 'components/apply/commonPart/OpButton'
// 方法 引入
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
import { toFixed } from '@/plugins/calc'
import dateCount from '@/plugins/dateCount'
const DRAFT_KEY = 'CGSQ_DATA';

export default {
  data () {
    return {
      orderList: {},
      matterList: [], // 物料列表
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
    XTextarea, Group, XInput, Datetime, Cell, RNumber,
    PopMatter,  PopMatterList, RPicker, PopBaseinfo, ApplyMatterPart, OpButton
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
    }
  },
  watch: {
    matterList: {
      handler(list) {
        for(let item of list) {
          /*
           * 此处计算下单截止日
           * shippingTime => 下单截止日
           * promDeliTime => 到货截止日
           * tdLeadTime => 采购提前期
           * 算法：
           * 下单截止日 =  “到货截止日期” 减去 “采购提前期”（如果有周末则要减去周末）
           *  
           * */
          if(!item.tdLeadTime){
            item.shippingTime = item.promDeliTime
          }
          else if(!item.promDeliTime){
            item.shippingTime = ''
          }
          else {
            let promDeliTime = new Date(Date.parse(item.promDeliTime.replace(/-/g, "/")));
            let preShippingTime = new Date(promDeliTime.getTime() - (item.tdLeadTime)*24*60*60*1000);
            item.shippingTime = dateFormat(dateCount(preShippingTime, promDeliTime), 'YYYY-MM-DD');
          } 
          // 因包装数量要为整数，先根据当前的申请数量计算包装数量，如有小数向上取整后，再反算本次申请数量
          if(JSON.stringify(item.assistQty).includes('.')){
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
      let orderList = {};
      sels.map(item => {
        for(let key in this.dataIndexMap){
          // 格式化日期
          if(key === 'promDeliTime' || key === 'shippingTime'){
            item[key] = dateFormat(item[this.dataIndexMap[key]], 'YYYY-MM-DD') || "";
          }
          else{
            item[key] = item[key] || item[this.dataIndexMap[key]];
          }
          
        }
        item.tdQty = item.tdQty || Math.max(item.qtyBalance, item.moq);
        // item.promDeliTime = item.processingStartDate;
        // item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        // item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        // item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
        if(!orderList[item.transCode]) {
          orderList[item.transCode] = [];
        }
        orderList[item.transCode].push(item);
      })
      this.matterList = sels;
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
      if(key === 'tdQty'){
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
    delClick (sItem, index) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
      // 若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // 判断是否展示选中图标
    showSelIcon (sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
    },
    // 全选
    checkAll (){
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    // 删除选中的
    deleteCheckd (){
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
    // 新增物料
    getMatter () {
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
        // 检验必填字段，组装要提交的dataSet
        for (let item of this.matterList) {
          let oItem = {};
          for(let sItem of this.submitMatterField){
            if(!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]){
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
      }).then( (data)=>{
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
      for(let key in this.orderList) {
        this.orderList[key].forEach(item => {
          this.matterList.push(item)
        })
      }
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
</script>

<style lang='scss' scoped>
@import './../../scss/bizApply';

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
