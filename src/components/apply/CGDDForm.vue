<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 用户地址和基本信息-->
        <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
          <div v-if='dealerInfo.dealerCode'>
            <div class="user_info">
              <span class="user_name">{{dealerInfo.dealerName || ''}}</span>
            </div>
            <div class="cp_info">
              <span class="user_tel" v-if="dealerInfo.dealerMobilePhone">{{dealerInfo.dealerMobilePhone}}</span>
              <span class="user_tel" v-if="dealerInfo.dealerPhone">{{dealerInfo.dealerPhone}}</span>
              <p class="cp_ads">
                {{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}</p>
            </div>
          </div>
          <div v-else>
            <div class="title">供应商列表</div>
            <div class="mode">请选择供应商</div>
          </div>
          <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
        </div>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="dealer.drDealerPaymentTerm"
                          v-model="dealer.drDealerPaymentTerm"></pop-single-select>
        <!-- 物料列表 -->
        <div class="materiel_list mg_auto box_sd">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">物料列表</div>
              <div class="tips">请选择物料</div>
              <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
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
              <div class="each_mater" :class="{mater_delete : matterModifyClass}" v-for="(item, index) in matterList" :key='index'>
                <div class="each_mater_wrapper" @click="delClick(index,item)">
                  <div class="mater_img">
                    <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                  </div>
                  <div class="mater_main">
                    <!-- 物料名称 -->
                    <div class="mater_name">
                      <span class="whiNum">No.{{index + 1}}</span>
                      {{item.inventoryName}}
                    </div>
                    <!-- 物料基本信息 -->
                    <div class="mater_info">
                      <!-- 物料编码、规格 -->
                      <div class="withColor">
                        <!-- 物料编码 -->
                        <div class="ForInline" style="display:inline-block">
                          <div class="mater_code">
                            <span class="title">编码</span>
                            <span class="num">{{item.inventoryCode}}</span>
                          </div>
                        </div>
                        <!-- 物料规格 -->
                        <div class="ForInline" style="display:inline-block">
                          <div class="mater_spec">
                            <span class="title">规格</span>
                            <span class="num">{{item.specification || '无'}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- 物料属性，单位 -->
                    <div class='mater_more'>
                      <span class='processing'>属性: {{item.processing}}</span>
                      <span class='measureUnit'>计量单位: {{item.measureUnit}}</span>
                      <span class='qty' v-show="item.qtyBal">余额: {{item.qtyBal}}</span>
                      <span v-show='item.inventoryColor' class='mater_color'>颜色: {{item.inventoryColor}}</span>  
                    </div>
                  </div>
                  <div class='delete_icon' v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div>
                <!-- 物料输入内容 -->
                <div class="userInp_mode">
                  <group>
                    <x-input type="number" title="单价" text-align='right' placeholder='请填写'
                             @on-blur="checkAmt(item)" v-model.number="item.price"></x-input>
                  </group>
                  <group>
                    <x-input type="number" title="数量" text-align='right' placeholder='请填写'
                             @on-blur="checkAmt(item)" v-model.number="item.tdQty"></x-input>
                  </group>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length">
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 供应商popup -->
          <pop-dealer-list :show="showDealerPop" v-model="showDealerPop" @closePop='showDealerPop = !showDealerPop'
                          @sel-dealer="selDealer" dealer-label-name="供应商">
          </pop-dealer-list  ref="matter">
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter" :default-value="matterList"
                           get-list-method="getInventory7501" ref="matter"></pop-matter-list>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" v-if="!matterModifyClass">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount |numberComma(3)}}
        <span class="taxAmount">[含税: ￥{{taxAmount |numberComma(3)}}]</span>
      </span>
      <span class="count_btn" @click="submitOrder">提交订单</span>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" v-else>
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
import {Popup, Swipeout, SwipeoutItem, SwipeoutButton,TransferDom,Group,XInput} from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getBaseInfoData,saveAndStartWf,saveAndCommitTask,submitAndCalc } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/PopMatterList'
import PopDealerList from 'components/Popup/PopDealerList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
// 方法引入
import {toFixed} from '@/plugins/calc'

export default {
  directives: { TransferDom },
  components:{
    Popup, Swipeout, SwipeoutItem,
    SwipeoutButton,PopMatterList,PopDealerList,PopSingleSelect,Group,XInput
  },
  data(){
    return{
      listId : 'dd4d228d-fc01-4038-bf17-df54d8d06eb9',
      matterList:[],                                  // 物料列表
      paymentIndex : 0,
      DealerPaymentTerm : '现付',                        //结算方式
      transMode:['现付','预付','账期','票据'],          // 结算方式
      showDealerPop : false,                          // 是否显示供应商的popup
      showTransPop:false,                            // 是否显示结算方式的popup
      showMaterielPop:false,                         // 是否显示物料的popup
      dealerInfo : {},
      formData : {},
      dealer : {
        drDealerPaymentTerm : '现付',  //结算方式
        drDealerLogisticsTerms :'上门', //物流条件
        biComment : '' //备注
      },
      numMap: {},
      taxRate: 0.16, // 税率
    }
  },
  mixins: [common],
  watch:{
    matterList(val){
      console.log(val.length);
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
    // 选择地址
    goSetAds(){
      this.$router.push({ path:'/adress'});
    },
    //选择结算方式
    getPayment(item,i){
      this.DealerPaymentTerm = item;
      this.paymentIndex = i;

    },
    submitPayment(){
      this.dealer.drDealerPaymentTerm = this.DealerPaymentTerm;
      this.showTransPop = false;
    },
    //选中的供应商
    selDealer(val){
        this.dealerInfo = JSON.parse(val)[0];
        this.dealer.dealerDebitContactPersonName = this.dealerInfo.creatorName || '';
        this.dealer.dealerDebitContactInformation = this.dealerInfo.dealerMobilePhone;
        // this.getMatPrice();
    },
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      sels.map(item => {
        if (this.numMap[item.inventoryCode]) {
          item.tdQty = this.numMap[item.inventoryCode].tdQty;
          item.price = this.numMap[item.inventoryCode].price;
        } else {
          item.tdQty = '';
          item.price = '';
        }
      })
      this.numMap = {};
      this.matterList = sels;
      // this.getMatPrice();
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
    //数量--
    subNum(item,i){
     if(item.tdQty === 1) return
      item.tdQty--;
      this.$set(this.matterList, i, item);
    },
    //数量++
    plusNum(item,i){
      item.tdQty++;
      this.$set(this.matterList, i, item);
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
      if(!this.dealerInfo.dealerCode){
        this.$vux.alert.show({
          content : '请选择供应商信息'
        })
      }
      else if(this.matterList.length === 0){
        this.$vux.alert.show({
          content : '请选择物料'
        })
      }
      else{
         this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let dataSet = [];
            let operation = saveAndStartWf;
            this.matterList.map(item=>{
              dataSet.push({
                tdId : item.tdId || '',
                // inventoryName_transObjCode : item.inventoryName || item.inventoryName_transObjCode, //物料名称
                transObjCode : item.inventoryCode, //物料编码
                assMeasureUnit : item.assMeasureUnit ||'个',    //辅助计量
                assMeasureScale :item.assMeasureScale || null,  //与主计量单位倍数
                tdQty : item.tdQty,     //数量
                assistQty : item.assistQty || 0,        //辅计数量
                thenQtyBal : item.thenQtyBal || 0,//余额
                tdProcessing : item.processing ,//加工属性
                price : item.price, //单价
                taxRate : item.taxRate || 0.16,              //税率
                taxAmount : item.price*item.tdQty*0.16,           //税金
                tdAmount : item.price*item.tdQty*(100+16)/100,           //价税小计
                promDeliTime : null, //预期交货日
                comment : ''                //说明
              })
            })
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
            //console.log(submitData);
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
      }
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
            biComment: formData.biComment //备注
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
@import './../scss/bizApply';
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

