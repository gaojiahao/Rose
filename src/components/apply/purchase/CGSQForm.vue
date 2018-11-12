<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
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
              <div class="each_mater" :class="{'vux-1px-b' : index < matterList.length - 1}"
                  v-for="(oItem, key, index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">物料需求计划号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{'mater_delete' : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item,index,key)" :show-delete="matterModifyClass"
                              @click.native="delClick(index,item)">
                    <template slot="info" slot-scope="{item}">
                      <!-- 物料属性和单位 -->
                      <div class="mater_more">
                        <span class="processing">属性：{{item.processing}}</span>
                        <span class='unit'>单位：{{item.measureUnit}}</span>
                        <span class='qty' >全部需求：{{item.allQty}}</span>
                        <span class='qty'>已做需求：{{item.qtyed}}</span>
                        <!-- <span class='qty'>待做需求： {{item.tdQty}}</span> -->
                        <span v-show="item.promDeliTime">计划需求日期：{{item.promDeliTime}}</span>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other' v-if="item.price && item.tdQty">                      
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                        <div>
                          <r-number :num="item.tdQty"
                                    :checkAmt='checkAmt' v-model="item.tdQty"></r-number>
                        </div>                     
                      </div>
                    </template>
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="modifyMatter(item,index,key)" v-show="(item.price && item.tdQty) &&!matterModifyClass">
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
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                          :default-value="matterList" get-list-method="getPurchaseInNeeds"
                          ref="matter"></pop-matter-list>
        </div>
        <!-- 物料编辑pop -->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' 
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="modify" slot-scope="{modifyMatter}">
            <cell title="全部需求" v-model="modifyMatter.allQty" text-align="right"></cell>
            <cell title="已做需求" v-model="modifyMatter.qtyed" text-align="right"></cell>
            <x-input title="待做需求" type="number"  v-model.number='modifyMatter.tdQty' text-align="right" 
              @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入">
            </x-input>
            <x-input title="估计价格" type="number"  v-model.number='modifyMatter.price' text-align="right" 
              @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入"></x-input>
            
            <datetime title="计划需求日期" v-model="modifyMatter.promDeliTime" 
                      placeholder="请选择" ></datetime>
            <cell title="估计金额" :value="'￥' + modifyMatter.noTaxAmount"></cell>
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
        <span class="total_price">
          <span style="fontSize:.14rem">￥</span>{{tdAmount | numberComma(3)}}
        </span>
        <span class="total-num">[数量: {{totalNum}}]</span>
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
import { Group, XInput, XTextarea, Datetime, Cell } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getBaseInfoData, saveAndStartWf, saveAndCommitTask, submitAndCalc } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件 引入
import PopMatterList from 'components/Popup/PopMatterList'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RNumber from 'components/RNumber'
// 方法 引入
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
import { toFixed } from '@/plugins/calc'
const DRAFT_KEY = 'CGSQ_DATA';

export default {
  data () {
    return {
      listId: '43ccbc27-bbb5-4cfb-997b-6d3823f1c03e',
      orderList: {},  
      matterList: [], // 物料列表
      showMaterielPop: false, // 是否显示物料的popup
      formData: {
        biId: '',
        biComment: ''
      },
      applyComment: '',
      numMap: {},
      matterParams: {
        processing: '成品,商品,服务,原料,半成品'
      },
      modifyKey: '',
    }
  },
  components: {
    XTextarea, Group, XInput, Datetime, Cell, RNumber,
    PopMatter,  PopMatterList, 
  },
  computed: {
    // 订单物料总数量
    totalNum () {
      let total = 0;
      this.matterList.forEach(item => {
        total = accAdd(total, item.tdQty);
      });
      return Number(total);
    },
    // 订单总金额
    tdAmount () {
      let total = 0;
      this.matterList.forEach(item => {
        total = accAdd(total, accMul(item.tdQty, item.price))
      });
      return parseFloat(total.toFixed(2));
    }
  },
  mixins: [common],
  methods: {
    // TODO 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      let orderList = {};
      sels.map(item => {
        let key = `${item.transCode}_${item.inventoryCode}`;
        let defaultPromDeliTime = item.processingStartDate ? item.processingStartDate.split(" ")[0] : '';
        let {tdQty = '', price = '', promDeliTime = defaultPromDeliTime} = this.numMap[key] || {};
        item.tdQty = tdQty;
        item.price = price;
        item.promDeliTime = promDeliTime;
        if (!orderList[item.transCode]) {
          orderList[item.transCode] = [];
        }
        orderList[item.transCode].push(item);
      })
      this.numMap = {};
      this.matterList = sels;
      this.orderList = orderList;
    },
    // 显示物料修改的pop
    modifyMatter (item, index, key) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // 选择默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
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
    // 滑动删除
    delClick (index, sItem) {
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
    showSelIcon (sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
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
    addMatter () {
      for (let item of this.matterList) {
        // 存储已输入的价格
        this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
      }
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 提价订单
    submitOrder (){
      let warn = '',
          dataSet = [];
      if (this.matterList.length === 0) {
        warn = '请选择物料';
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
          // 设置提交参数
          dataSet.push({
            tdId: item.tdId || '',
            transMatchedCode: item.transCode, // 物料需求计划单号
            transObjCode: item.inventoryCode, // 物料编码
            tdProcessing: item.processing , // 加工属性
            assMeasureUnit: item.assMeasureUnit ||'个', // 辅助计量
            assMeasureScale: item.assMeasureScale || null, // 与主计量单位倍数
            assistQty: item.assistQty || 0, // 辅计数量
            productDemandQty: item.allQty, // 全部需求
            thenLockQty: item.qtyed, // 已做需求
            tdQty: item.tdQty, // 待做需求
            price: item.price, // 单价
            tdAmount: accMul(item.price, item.tdQty), // 合计
            promDeliTime: item.promDeliTime, // 计划需求日期
            comment : '', // 说明
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
            [this.processCode]: {businessKey: "PAPP", createdBy: ""}
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
        this.applyComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        this.attachment = data.attachment;
        let {formData} = data;
        formData.order.dataSet.map(item=>{
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
          }
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
          this.matterList.push(item);
        })
        // 基本信息
        this.formData = {
          handler: formData.handler,
          handlerName: formData.handlerName,
          handlerRole: formData.handlerRole,
          handlerRoleName: formData.handlerRoleName,
          handlerUnit: formData.handlerUnit,
          handlerUnitName: formData.handlerUnitName,
          creator: formData.creator,
          modifer: formData.modifer,
          biId: formData.biId,
          biComment: formData.biComment,
        }
        this.$loading.hide();
      })
    },
    // TODO 是否保存草稿
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
