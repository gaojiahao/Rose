<template>
  <div class="pages">
    <div class="basicPart">
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
        <div v-if='info.dealerName'>
          <div class="user_info" v-if="info.creatorName">
            <span class="user_name">{{info.creatorName || ''}}</span>
            <span class="user_tel">{{info.dealerMobilePhone}}</span>
          </div>
          <div class="cp_info">
            <p class="cp_name">{{info.dealerName}}</p>
            <p class="cp_ads">{{info.province}}{{info.city}}{{info.county}}{{info.address}}</p>
          </div>
        </div>
        <div v-else>
            <div class="title">往来列表</div>
            <div class="mode">请选择往来</div>           
        </div>
        <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
      </div>
       <!-- 结算方式 -->
      <pop-single-select title="结算方式" :data="transMode" :value="dealer.drDealerPaymentTerm"
                         v-model="dealer.drDealerPaymentTerm"></pop-single-select>
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <!-- 没有选择物料 -->
        <template v-if="!materList.length">
          <div @click="showMaterielPop = !showMaterielPop">
            <div class="title">物料列表</div>
            <div class="tips">请选择物料</div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
          </div>
        </template>
        <!-- 已经选择了物料 -->
        <template v-else>
          <div class="title">物料列表</div>
          <div class="mater_list">
            <div class="each_mater vux-1px-b" v-for="(item, index) in materList" :key='index'>
              <swipeout>
                <swipeout-item>
                  <div slot="right-menu">
                    <swipeout-button @click.native="delClick(index,item)" type="warn">删除</swipeout-button>
                  </div>
                  <div class="each_mater_wrapper" slot="content">
                    <div class="mater_img">
                      <img :src="item.inventoryPic || item.inventoryPic_transObjCode" alt="mater_img" @error="getDefaultImg(item)">
                    </div>
                    <div class="mater_main">
                      <!-- 物料名称 -->
                      <div class="mater_name">
                        <span class="whiNum">No.{{index + 1}}</span>
                        {{item.inventoryName || item.inventoryName_transObjCode}}
                      </div>
                      <!-- 物料基本信息 -->
                      <div class="mater_info">
                        <!-- 物料编码、规格 -->
                        <div class="withColor">
                          <!-- 物料编码 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_code">
                              <span class="title">编码</span>
                              <span class="num">{{item.inventoryCode || item.transObjCode}}</span>
                            </div>
                          </div>
                          <!-- 物料规格 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_spec">
                              <span class="title">规格</span>
                              <span class="num">{{item.specification || item.specification_transObjCode || '无'}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other'>
                        <div class='mater_price'>
                          ￥{{item.price}}
                          <span class='unit' v-if='item.measureUnit'>/{{item.measureUnit}}</span>
                        </div>
                        <div class='mater_num'>
                          <span class='handle' @click="subNum(item,index)" :class='{sub : item.tdQty<=1}'>-</span>
                          <input class='num' type='number' :value='item.tdQty' @input='getNum(item,index,$event)'/>
                          <span class='handle plus' @click='plusNum(item,index)'>+</span>
                        </div>
                          
                      </div>
                    </div>
                  </div>
                </swipeout-item>
              </swipeout>
            </div>
          </div>
        </template>
        <!-- 新增更多 按钮 -->
        <div class="add_more" v-if="materList.length && !isResubmit" @click="showMaterielPop = !showMaterielPop">新增更多物料</div>
        <!-- 往来popup -->
        <pop-dealer-list :show="showDealerPop" v-model="showDealerPop" @sel-dealer="selDealer" :dealerLabelName="'2168'">
        </pop-dealer-list  ref="matter">
        <!-- 物料popup -->
        <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                         ref="matter"></pop-matter-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{count}}
        <span class='taxAmount'>[含税: ￥{{count*0.16}}]</span>
      </span>
      <span class="count_btn stop" @click="stopOrder" v-if='btnInfo.isMyTask === 1 && btnInfo.actions && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn" @click="submitOrder">提交订单</span>
    </div>
  </div>
</template>

<script>
import {Popup, Swipeout, SwipeoutItem, SwipeoutButton,TransferDom } from 'vux'
import PopMatterList from 'components/PopMatterList'
import PopDealerList from 'components/PopDealerList'
import PopSingleSelect from 'components/PopSingleSelect'
import {getBaseInfoData,saveAndStartWf,saveAndCommitTask} from 'service/commonService' 
import { getSOList} from 'service/detailService.js'
import common from 'components/mixins/applyCommon.js'
export default {
  directives: {
    TransferDom
  },
  components:{
    Popup,Swipeout, SwipeoutItem, SwipeoutButton,PopMatterList,PopDealerList,PopSingleSelect
  },
  data(){
    return{
      listId : 'dd4d228d-fc01-4038-bf17-df54d8d06eb9',
      materList:[],                                  // 物料列表
      paymentIndex : 0,
      DealerPaymentTerm : '现付',                        //结算方式      
      transMode:['现付','预付','账期','票据'],          // 结算方式
      showDealerPop : false,                          // 是否显示往来的popup
      showTransPop:false,                            // 是否显示结算方式的popup
      showMaterielPop:false,                         // 是否显示物料的popup
      info : {},
      count : 0 ,   // 总价
      formData : {},
      dealer : {
        drDealerPaymentTerm : '现付',  //结算方式
        drDealerLogisticsTerms :'上门', //物流条件
        biComment : '' //备注
      }     
    }
  },
  mixins: [common],
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
    //选中的往来
    selDealer(val){
      this.info = JSON.parse(val)[0];
      this.dealer.dealerDebitContactPersonName = this.info.creatorName || '';
      this.dealer.dealerDebitContactInformation = this.info.dealerMobilePhone;

    },
    // TODO 选中物料项
    selMatter(val) {
      this.count = 0;
      let sels = JSON.parse(val);
        sels.map(item=>{
          if(this.materList.length>0){
            this.materList.map(item1=>{
               console.log(item1.inventoryCode);
              if(item.inventoryCode ===  item1.inventoryCode){
                item.tdQty = item1.tdQty;
                item.price  = item1.price;
              }
              else{
                item.tdQty = 1;
                item.price = 90;
              }              
            })
          }
          else{
            item.tdQty = 1;
            item.price = 90;  
          }   
        })
      this.materList = sels;
      this.materList.map(item=>{
        this.count += item.price * item.tdQty;
      })
    },
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
          item.inventoryPic_transObjCode = url;
        }
        return url
    },
    // 滑动删除
    delClick(index,item){
      let arr = this.materList;
      let total = item.tdQty*item.price;
      this.count -= total;
      arr.splice(index, 1);
    },
    //数量--
    subNum(item,i){
      let oldNum = item.tdQty;
      item.tdQty--;
      if(item.tdQty<=0){
        item.tdQty = 1;
      }
      let total = item.price*(oldNum-item.tdQty);
      this.count -= total;
      this.$set(this.materList, i, item);
    },
    //数量++
    plusNum(item,i){
      let oldNum = item.tdQty;
      item.tdQty++;
      let total = item.price*(item.tdQty-oldNum);
      this.count += total;
      this.$set(this.materList, i, item);
      
    },
    //修改数量
    getNum(item,i,e){
      let oldNum = item.tdQty;
      item.tdQty = Number(e.target.value);
      let total = item.tdQty*item.price;
      this.count = this.count - item.price*oldNum + total;
    },
    //提价订单
    submitOrder(){
      if(!this.info.dealerName){
        this.$vux.alert.show({
          content : '请选择往来信息'
        })
      }
      else if(this.materList.length === 0){
        this.$vux.alert.show({
          content : '请选择物料'
        })
      }
      else{
         this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            let dataSet = [];
            this.materList.map(item=>{
              dataSet.push({
                tdId : item.tdId || '',
                // inventoryName_transObjCode : item.inventoryName || item.inventoryName_transObjCode, //物料名称
                transObjCode : item.inventoryCode || item.transObjCode, //物料编码
                assMeasureUnit : item.assMeasureUnit ||'个',    //辅助计量
                assMeasureScale :item.assMeasureScale || null,  //与主计量单位倍数
                tdQty : item.tdQty,     //数量
                assistQty : item.assistQty || 0,        //辅计数量
                price : item.price, //单价
                taxRate : item.taxRate || 0.16,              //税率
                taxAmount : item.price*item.tdQty*0.16,           //税金
                tdAmount : item.price*item.tdQty*(100+16)/100,           //价税小计
                promDeliTime : null, //预期交货日
                comment : ''                //说明
              })
            })
            let wfPara = {
              "PROC_1802_0005":{businessKey:"PO",createdBy:""}
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
                order: {
                  dealerDebit: this.info.dealerCode,
                  drDealerLabel : this.info.dealerLabelName || '渠道商',
                  // drAccountSub : this.info.dealerSubclass || '直营店',
                  dataSet
                }
              }),
              wfPara: JSON.stringify(wfPara)
            }
            //console.log(submitData);
            if(this.isResubmit){
              submitData.biReferenceId = this.biReferenceId;
              this.saveData(saveAndCommitTask,submitData);
              return
            }
            this.saveData(saveAndStartWf,submitData);
          }
         })        
      }      
    },
    // TODO 获取用户基本信息
    getBaseInfoData() {
      getBaseInfoData().then(data => {
        this.formData = {...data};
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
          item.inventoryPic_transObjCode = item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}` : this.getDefaultImg();
          this.count += item.noTaxAmount*100
        })
        this.count = this.count/100;
        //基本信息
        this.formData = {
          handler: formData.handler,
          handlerName : formData.handlerName,
          handlerRole : formData.handlerRole,
          handlerRoleName : formData.handlerRoleName,
          handlerUnit : formData.handlerUnit,
          handlerUnitName : formData.handlerUnitName,
          creator : formData.creator,
          modifer : formData.modifer,

        }
        //往来信息展示
        this.info = {
          dealerCode : formData.order.dealerDebit,
          dealerSubclass : formData.order.drAccountSub,
          dealerName :  formData.order.dealerName_dealerDebit,
          province : formData.order.province_dealerDebit,
          city : formData.order.city_dealerDebit, 
          county :  formData.order.county_dealerDebit,
          address : formData.order.address_dealerDebit    
        }
        //订单信息
        this.dealer = {
          dealerDebitContactPersonName:  formData.dealerDebitContactPersonName, //联系人
          dealerDebitContactInformation : formData.dealerDebitContactInformation,//电话
          drDealerPaymentTerm : formData.drDealerPaymentTerm || '现付', //付款 
          drDealerLogisticsTerms :formData.drDealerLogisticsTerms || '上门', //物流条件
          biComment : formData.biComment //备注
        },
        this.materList = data.formData.order.dataSet;
      })

      
    }
  },
  created(){
    
  }
}
</script>

<style lang='scss' scoped>
@import './../scss/bizApply';
</style>

