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
      <div class="trade_mode mg_auto box_sd" @click="showTransPop = !showTransPop">
        <p class="title">结算方式</p>
        <p class="mode">{{dealer.drDealerPaymentTerm}}</p>
        <span class="iconfont icon-gengduo"></span>
        <!-- 结算popup -->
        <div v-transfer-dom >
          <popup v-model="showTransPop" height="70%" id="trade_pop_part">
            <div class="trade_pop">
              <div class="title">结算方式<x-icon class="close_icon" type="ios-close-empty" size="30" @click="showTransPop = !showTransPop"></x-icon></div>
              <span class="each_mode "
              :class='{choiced : index===paymentIndex}' 
              v-for="(item, index) in transMode" 
              :key="index" 
              @click='getPayment(item,index)'>{{item}}</span>
            </div>
            <div class="cfm_btn" @click="submitPayment">确定</div>
          </popup>
        </div>
      </div>
      <!-- 物流条款 -->
      <!-- <div class="trade_mode mg_auto box_sd" @click="showLogPop = !showLogPop">
        <p class="title">物流条款</p>
        <p class="mode">{{dealer.drDealerLogisticsTerms}}</p>
        <span class="iconfont icon-gengduo"></span> -->
        <!-- 结算popup -->
        <!-- <div v-transfer-dom >
          <popup v-model="showLogPop" height="60%" id="trade_pop_part">
            <div class="trade_pop">
              <div class="title">物流条款<x-icon class="close_icon" type="ios-close-empty" size="30" @click="showLogPop = !showLogPop"></x-icon></div>
              <span class="each_mode"
              :class='{choiced : index===logisticsIndex}' 
               v-for="(item, index) in logisticsTerm" 
               :key="index" 
               @click='getLogistics(item,index)'>
               {{item}}</span>
            </div>
            <div class="cfm_btn" @click="submitLogistics">确定</div>
          </popup>
        </div>
      </div> -->
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
        <pop-dealer-list :show="showDealerPop" v-model="showDealerPop" @sel-dealer="selDealer" :dealerLabelName="'供应商'">
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
import { Icon, Cell, Popup, Group, XInput, Datetime, PopupRadio, Swipeout, SwipeoutItem, SwipeoutButton,AlertModule,TransferDom } from 'vux'
import dealerService from 'service/dealerService.js'
import PopMatterList from 'components/PopMatterList'
import PopDealerList from 'components/PopDealerList'
import {getBaseInfoData,saveAndStartWf,saveAndCommitTask} from 'service/commonService' 
import { getSOList} from 'service/detailService.js'
import common from 'components/mixins/applyCommon.js'
export default {
  directives: {
    TransferDom
  },
  components:{
    Icon, Cell, Popup, Group, XInput, Datetime, PopupRadio, Swipeout, SwipeoutItem, SwipeoutButton,PopMatterList,PopDealerList
  },
  data(){
    return{
      listId : 'dd4d228d-fc01-4038-bf17-df54d8d06eb9',
      materList:[],                                  // 物料列表
      paymentIndex : 0,
      logisticsIndex : 0,
      DealerPaymentTerm : '现付',                        //结算方式
      DealerLogisticsTerms : '上门',                      //物流方式
      deliveryDate:'',                               // 预计交付日       
      assistUnit: '请选择',                           // 辅助计量显示值
      assistUnitList: ['A', 'B', 'C'],               // 辅助计量列表
      transMode:['现付','预付','账期','票据'],          // 结算方式
      logisticsTerm:['上门','自提','离岸','到港'],      // 物流条款
      showDealerPop : false,                          // 是否显示往来的popup
      showLogPop:false,                              // 是否显示物流条款的popup
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
      let url = require('assets/mater01.jpg');
      if (item) {
        item.inventoryPic = url;
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
                  // drDealerLabel : this.info.dealerLabelName || '客户',
                  drAccountSub : this.info.dealerSubclass || '直营店',
                  dataSet
                }
              }),
              wfPara: JSON.stringify(wfPara)
            }
            console.log(submitData);
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
    async getOrderInfo(transCode){
      await this.getListId(transCode);
      await this.getUniqueId(transCode);
      console.log(this.uniqueId);
      await getSOList({
        formViewUniqueId : this.uniqueId,
        transCode
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
    let {transCode} = this.$route.query;
    if(transCode.includes('_')){
      this.isResubmit  = true;
      this.transCode = transCode;
      this.getOrderInfo(transCode);
    }
    else{
      this.getBaseInfoData();
    }
  }
}
</script>

<style lang='scss' scoped>
// 居中
.mg_auto {
  width: 95%;
  margin: 10px auto;
}
// 阴影
.box_sd {
  box-sizing: border-box;
  box-shadow: 0 0 8px #e8e8e8;
}
.basicPart {
  overflow: auto;
  height: 93%;
}
// 地址栏
.or_ads {
  position: relative;
  padding: .06rem .4rem .06rem .08rem;
  .title {
    color: #757575;
    font-weight: 200;
    font-size: .12rem;
  }
  .mode {
    color: #111;
    font-weight: 500;
  }
  .r_arrow {
    top: 50%;
    right: .04rem;
    position: absolute;
    transform: translate(0, -50%);
  }
  // 用户信息
  .user_info {
    color: #111;
    font-size: .2rem;
    font-weight: 500;
    // 用户姓名
    .user_name {
      margin-right: .08rem;
    }
    // 用户电话
    .user_tel {
      font-family: sans-serif, -apple-system-font;
    }
  }
  // 公司信息
  .cp_info {
    .cp_name {
      color: #111;
      font-weight: 500;
    }
    .cp_ads {
      font-weight: 200;
      color: #757575;
    }
  }
}
// 结算方式
.trade_mode {
  position: relative;
  padding: .06rem .08rem;
  .icon-gengduo {
    top: 50%;
    right: .1rem;
    font-size: .24rem;
    position: absolute;
    transform: translate(0, -50%);
  }
  .title {
    color: #757575;
    font-weight: 200;
    font-size: .12rem;
  }
  .mode {
    color: #111;
    font-weight: 500;
  }
}
// 物料列表
.materiel_list {
  position: relative;
  padding: .06rem .08rem;
  .title {
    color: #757575;
    font-weight: 200;
    font-size: .12rem;
  }
  .tips {
    color: #111;
    font-weight: 500;
  }
  // 右箭头
  .r_arrow {
    top: 50%;
    right: .04rem;
    position: absolute;
    transform: translate(0, -50%);
  }
  // 物料列表
  .mater_list {
    width: 100%;
    box-sizing: border-box;
    .vux-1px-b:after {
      border-bottom: 1px solid #e8e8e8;
    }
    // 每个物料
    .each_mater {
      padding: 0.08rem;
      position: relative;
      margin-bottom: .2rem;
      box-sizing: border-box;
      .each_mater_wrapper {
        position: relative;
        display: flex;
        // 物料图片
        .mater_img {
          display: inline-block;
          width: .75rem;
          height: .75rem;
          img {
            width: 100%;
            max-height: 100%;
          }
        }
        // 物料主体
        .mater_main {
          flex: 1;
          padding-left: .1rem;
          box-sizing: border-box;
          display: inline-block;
          // 物料名称
          .mater_name {
            color: #111;
            overflow: hidden;
            font-size: .14rem;
            font-weight: bold;
            max-height: .46rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            // 每个物料的索引
            .whiNum {
              color: #fff;
              font-weight: 200;
              padding: 0 .1rem;
              font-size: .1rem;
              display: inline-block;
              background: #ea5455;
              vertical-align: middle;
              margin: -.01rem .04rem 0 0;
            }
          }
          // 物料信息
          .mater_info {
            color: #757575;
            font-size: .12rem;
            // 有颜色包裹的
            .withColor {
              // 物料编码
              .mater_code {
                display: flex;
                .title,
                .num {
                  font-size: .1rem;
                  display: inline-block;
                  padding: .01rem .04rem;
                }
                .title {
                  color: #fff;
                  background: #3f72af;
                }
                .num {
                  color: #111;
                  max-width: .9rem;
                  overflow: hidden;
                  white-space: nowrap;
                  background: #dbe2ef;
                  text-overflow: ellipsis;
                }
              }
              // 规格
              .mater_spec {
                @extend .mater_code;
                margin-left: .1rem;
                .title {
                  color: #fff;
                  background: #537791;
                }
                .num {
                  color: #fff;
                  max-width: .6rem;
                  overflow: hidden;
                  white-space: nowrap;
                  background: #ff7f50;
                  text-overflow: ellipsis;
                }
              }
            }
            // 没颜色包裹的
            .withoutColor {
              // 物料分类
              .mater_classify {
                // color: #111;
                // font-weight: bold;
                font-size: .14rem;
                margin-top: .04rem;
                .father {
                  margin-right: .1rem;
                }
              }
              // 物料颜色 材质
              .mater_material {
                font-size: .12rem;
                margin-top: .1rem;
                .unit,
                .color {
                  margin-right: .06rem;
                }
              }
            }
          }
          //物料价格，数量
          .mater_other{
            margin-top:0.08rem;
            align-items: center;
            .mater_price{
              display: inline-block;
              font-weight: bold;
              font-size:0.16rem;
              line-height: 0.2rem;
              color:#ea5455;
              margin-right:0.9rem;
            }
            .mater_num{
              display: flex;
              // justify-content: flex-start;
              float: right;
              input{
                border:none;
                outline: none;
              }
              .handle{
                display: inline-block;
                width:0.2rem;
                height:0.2rem;
                text-align: center;
                line-height: 0.2rem;
                font-size: .18rem;
              }
              .sub {
                color: #eee;
              }
              .plus {
                vertical-align: middle;
                margin-top: -.01rem;
              }
              .num{
                width:0.4rem;
                height:0.2rem;
                background: #e8e8e8;
                text-align: center;
                line-height: 0.2rem;
                font-size:0.12rem;
                border-radius: 0 !important;
              }
            }
          }
        }
        // 下划线
        .vux-1px-b:after {
          border-bottom: 1px solid #e8e8e8;
        }
      }
    }
  }
  // 新增更多
  .add_more {
    width: 1rem;
    color: #fff;
    height: .24rem;
    font-size: .12rem;
    text-align: center;
    line-height: .24rem;
    margin: 0 auto .1rem;
    border-radius: .4rem;
    background: #5077aa;
    box-shadow: 0 2px 5px #5077aa;
  }
}
#trade_pop_part {
  background: #fff;
  .trade_pop {
    padding: 0 .08rem;
    // 顶部
    .title {
      font-size: .2rem;
      position: relative;
      padding: 0.08rem 0 .14rem;
      // 搜索
      .search_part {
        width: 100%;
        display: flex;
        height: .3rem;
        line-height: .3rem;
        position: relative;
        // 搜索输入框
        .srh_inp {
          flex: 5;
          outline:none;
          border: none;
          color: #2D2D2D;
          font-size: .16rem;
          padding: 0 .3rem 0 .4rem;
          background: #F3F1F2;
          border-top-left-radius: .3rem;
          border-bottom-left-radius: .3rem;
        }
        // 取消 按钮
        .pop_cancel {
          flex: 1;
          color: #fff;
          font-size: .14rem;
          text-align: center;
          background: #fc3c3c;
          border-top-right-radius: .3rem;
          border-bottom-right-radius: .3rem;
        }
        // 搜索icon
        .serach_icon {
          top: 50%;
          left: 10px;
          fill: #2D2D2D;
          position: absolute;
          transform: translate(0, -50%);
        }
        // 清除icon
        .clear_icon {
          top: 50%;
          right: 14%;
          width: .3rem;
          height: .3rem;
          z-index: 100;
          display: block;
          font-size: .12rem;
          line-height: .3rem;
          text-align: center;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      // 关闭icon
      .close_icon {
        top: 50%;
        right: -2%;
        position: absolute;
        transform: translate(0, -50%);
      }
    }
    .each_mode {
      margin-right: .1rem;
      display: inline-block;
      padding: .04rem .2rem;
      border:1px solid #C7C7C7;
      border-radius: 40px;
    }
    .choiced{
      background: #5077aa;
      color:#fff;
    }
    .vux-1px:before {
      border-radius: 40px;
    }

  }
  // 确定
  .cfm_btn {
    left: 50%;
    bottom: 5%;
    width: 2.8rem;
    color: #fff;
    height: .44rem;
    line-height: .44rem;
    position: absolute;
    text-align: center;
    background: #5077aa;
    border-radius: .4rem;
    transform: translate(-50%,0);
    box-shadow: 0 2px 12px #5077aa;
  }
}

// 底部栏
.count_mode {
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  height: .44rem;
  position: fixed;
  line-height: .44rem;
  background: #fff;
  .count_num {
    flex: 2.5;
    color: #5077aa;
    font-size: .24rem;
    padding-left: .1rem;
    .taxAmount{
      color:#757575;
      font-size:.1rem;
      display: inline-block;
    }
  }
  .count_btn {
    flex: 1.5;
    color: #fff;
    text-align: center;
    background: #5077aa;
  }
  .stop{
    background: #ea5455;
  }
}
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}

</style>
