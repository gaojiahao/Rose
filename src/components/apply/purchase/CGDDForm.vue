<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list  @sel-dealer="selDealer" :defaultValue="dealerInfo" dealer-label-name="供应商"></pop-dealer-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="dealer.drDealerPaymentTerm"
                          v-model="dealer.drDealerPaymentTerm"></pop-single-select>
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
              <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}" 
                  v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                            @click.native="delClick(index,item)">
                  <template slot="info" slot-scope="{item}">
                    <!-- 物料属性和单位 -->
                    <div class="mater_more">
                        <span class="processing">属性：{{item.processing}}</span>
                        <span class='unit'>单位：{{item.measureUnit}}</span>
                        <span class='mater_color'>颜色：{{item.inventoryColor || '无'}}</span>
                        <span class='qty' v-show="item.qtyBal">余额: {{item.qtyBal}}</span>
                        <span v-show="item.taxRate">税率：{{item.taxRate}}</span>
                        <span v-show="item.promDeliTime">预期交货日：{{item.promDeliTime}}</span>
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
                    <div class="edit-part vux-1px-l" @click="modifyMatter(item,index)" v-show="(item.price && item.tdQty) &&!matterModifyClass">
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
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter" :default-value="matterList"
                           get-list-method="getInventory7501" ref="matter"></pop-matter-list>
          </div>
        </div>
         <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' 
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-check-stock="false"></pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount |numberComma(3)}}
        <span class="taxAmount">[含税: ￥{{taxAmount |numberComma(3)}}]</span>
      </span>
      <span class="count_btn" @click="submitOrder">提交订单</span>
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
// vux插件引入
import {XTextarea} from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/PopMatterList'
import PopDealerList from 'components/Popup/PopDealerList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RNumber from 'components/RNumber'
// 方法引入
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
export default {
  components:{
    PopMatterList,PopDealerList,PopSingleSelect,PopMatter,XTextarea,RNumber
  },
  data(){
    return{
      listId : 'dd4d228d-fc01-4038-bf17-df54d8d06eb9',
      matterList:[],                                    // 物料列表
      paymentIndex : 0,
      DealerPaymentTerm : '现付',                        //结算方式
      transMode:[],                                     // 结算方式
      showDealerPop : false,                            // 是否显示供应商的popup
      showTransPop:false,                               // 是否显示结算方式的popup
      showMaterielPop:false,                            // 是否显示物料的popup
      dealerInfo : {},
      formData : {},
      dealer : {
        drDealerPaymentTerm : '现付',  //结算方式
        drDealerLogisticsTerms :'上门', //物流条件
      },
      numMap: {},
      taxRate: 0.16, // 税率
    }
  },
  mixins: [common],
  watch:{
    matterList(val){
      if(val.length){
        let data = {
          CGDD_DATA:{
            matter : this.matterList,
            dealer : this.dealerInfo
          }

        }
        this.$emit('sel-data',data)
      }
    },
    dealerInfo(val){
      if(this.matterList.length){
        let data = {
          CGDD_DATA:{
            matter : this.matterList,
            dealer : this.dealerInfo
          }

        }
        this.$emit('sel-data',data)
      }
    }
  },
  methods:{
    // 获取 结算方式
    getPaymentTerm(){
      return getDictByType('paymentTerm').then(({ tableContent }) => {
        this.transMode = tableContent;
      })
    },    
    //选中的供应商
    selDealer(val){
        this.dealerInfo = JSON.parse(val)[0];
        this.dealer.dealerDebitContactPersonName = this.dealerInfo.creatorName || '';
        this.dealer.dealerDebitContactInformation = this.dealerInfo.dealerMobilePhone;
        this.dealer.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
    },
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      sels.map(item => {
        if (this.numMap[item.inventoryCode]) {
          item.tdQty = this.numMap[item.inventoryCode].tdQty;
          item.price = this.numMap[item.inventoryCode].price;
        } 
        else {
          item.tdQty = '';
          item.price = '';
        }
        item.taxRate = 0.16;
        item.promDeliTime = ''
      })
      this.numMap = {};
      this.matterList = sels;
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
    delClick(index, sItem) {
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
    //全选
    checkAll(){
      if(this.selItems.length === this.matterList.length){
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    //删除选中的
    deleteCheckd(){
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          this.selItems.forEach(item=>{
              let index = this.matterList.findIndex(item2=>item2.inventoryCode === item.inventoryCode);
              if(index >= 0){
                this.matterList.splice(index,1);
              }
            })
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })

    },
    //新增物料
    addMatter() {
        for (let item of this.matterList) {
          // 存储已输入的价格
          this.numMap[item.inventoryCode] = {
            tdQty: item.tdQty,
            price: item.price
          };
        }
        this.showMaterielPop = !this.showMaterielPop;
      },
    //提价订单
    submitOrder(){
      let warn = '';
      let dataSet = [];
      if (!this.dealerInfo.dealerCode) {
        warn = '请选择供应商信息';
      } else if (this.matterList.length === 0) {
        warn = '请选择物料';
      }
      if(!warn) {
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
            tdId : item.tdId || '',
            transObjCode : item.inventoryCode, //物料编码
            tdProcessing : item.processing ,//加工属性
            assMeasureUnit : item.assMeasureUnit ||'个',    //辅助计量
            assMeasureScale :item.assMeasureScale || null,  //与主计量单位倍数
            assistQty : item.assistQty || 0,        //辅计数量
            thenQtyBal : item.qtyBal || 0,//余额
            tdQty : item.tdQty,     //数量
            price : item.price, //单价
            taxRate : taxRate, //税金
            taxAmount :taxAmount, // 税金
            tdAmount: accAdd(accMul(item.price, item.tdQty), taxAmount), // 价税小计
            promDeliTime : item.promDeliTime, //预期交货日
            comment : ''                //说明
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
            [this.processCode]:{businessKey:"PO",createdBy:""}
          }
          if(this.isResubmit){
            wfPara = {
              businessKey:this.transCode,createdBy:this.formData.handler,transCode:this.transCode,result:3,taskId:this.taskId,comment:""
            }
          }
          let submitData = {
            listId: this.listId,
            biComment : this.biComment,
            formData: JSON.stringify({
              ...this.formData,
              ...this.dealer,
              handlerEntity: this.entity.dealerName,
              order: {
                dealerDebit: this.dealerInfo.dealerCode,
                drDealerLabel : this.dealerInfo.dealerLabelName || '渠道商',
                // drAccountSub : this.info.dealerSubclass || '直营店',
                drDealerPaymentTerm : this.dealer.drDealerPaymentTerm,
                dataSet
              }
            }),
            wfPara: JSON.stringify(wfPara)
          }
          //重新提交
          if(this.isResubmit){
            operation = saveAndCommitTask
            submitData.biReferenceId = this.biReferenceId;
          }
          //没有工作流
          if(!this.processCode.length){
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          this.saveData(operation,submitData);
        }
      })
    },
    //获取订单信息用于重新提交
    async getFormData(){
      await getSOList({
        formViewUniqueId : this.uniqueId,
        transCode : this.transCode
      }).then( (data)=>{
        this.listId = data.listId;
        this.biComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        let {formData} = data;
        formData.order.dataSet.map(item=>{
          item = {
            ...item,
            inventoryPic : item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
          }
          this.matterList.push(item);
        })
          //基本信息
          this.formData = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            creator: formData.creator,
            modifer: formData.modifer,
            biComment: formData.biComment //备注
          }
          //供应商信息展示
          this.dealerInfo = {
            creatorName :formData.dealerDebitContactPersonName,
            dealerMobilePhone :formData.dealerDebitContactInformation,
            dealerCode: formData.order.dealerDebit,
            dealerSubclass: formData.order.drAccountSub,
            dealerName: formData.order.dealerName_dealerDebit,
            province: formData.order.province_dealerDebit,
            city: formData.order.city_dealerDebit,
            county: formData.order.county_dealerDebit,
            address: formData.order.address_dealerDebit
          }
          //订单信息
          this.dealer = {
            dealerDebitContactPersonName: formData.dealerDebitContactPersonName, //联系人
            dealerDebitContactInformation: formData.dealerDebitContactInformation,//电话dealerDebitContactPersonName
            drDealerPaymentTerm: formData.order.drDealerPaymentTerm || '现付', //付款
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms || '上门', //物流条件
          },
          this.$loading.hide();
      })
    }
  },
  created(){
    let data = sessionStorage.getItem('CGDD_DATA');
    if(data){
      this.matterList = JSON.parse(data).matter;
      this.dealerInfo = JSON.parse(data).dealer
    }

  },
}
</script>

<style lang='scss' scoped>
@import './../../scss/bizApply';
.pages {
  /deep/ .vux-no-group-title{
    margin-top:0;
  }
    /deep/ .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
        left:0;
      }
    }
  }
</style>

