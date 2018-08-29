<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 用户地址和基本信息-->
        <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
          <div v-if='dealerInfo.dealerName'>
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
            <div class="title">客户列表</div>
            <div class="mode">请选择客户</div>
          </div>
          <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
        </div>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="dealer.drDealerPaymentTerm"
                          v-model="dealer.drDealerPaymentTerm"></pop-single-select>
        <!-- 物流条款 -->
        <pop-single-select title="物流条款" :data="logisticsTerm" :value="dealer.drDealerLogisticsTerms"
                          v-model="dealer.drDealerLogisticsTerms"></pop-single-select>
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
            <div class="title">物料列表</div>
            <div class="mater_list">
              <div class="each_mater vux-1px-b" v-for="(item, index) in matterList" :key='index'>
                <swipeout>
                  <swipeout-item>
                    <div slot="right-menu">
                      <swipeout-button @click.native="delClick(index,item)" type="warn">删除</swipeout-button>
                    </div>
                    <div class="each_mater_wrapper" slot="content">
                      <div class="mater_img">
                        <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                      </div>
                      <div class="mater_main">
                        <!-- 物料名称 -->
                        <div class="mater_name">
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
                            <span class="symbol">￥</span>{{item.price}}
                          </div>
                          <div class='mater_num'>
                            <span class='handle' @click="subNum(item,index)" :class='{disabled : item.tdQty<=1}'>-</span>
                            <input class='num' type='number' v-model.number='item.tdQty'/>
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
          <div class="handle_part" v-if="matterList.length">
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 客户popup -->
          <pop-dealer-list :show="showDealerPop" v-model="showDealerPop"
                          @sel-dealer="selDealer">
          </pop-dealer-list  ref="matter">
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop"
                          @sel-matter="selMatter" :default-value="matterList" ref="matter"></pop-matter-list>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num"
          :class="{nine_up : tdAmount.length  > 8 ,
          ten_up : tdAmount.length  > 9,
          ele_up : tdAmount.length  > 10}"
          >
        <span class="total_price">
          <span class="symbol">￥</span>{{tdAmount | numberComma(3)}}
        </span>

        <span class="taxAmount">[含税: ￥{{taxAmount | numberComma(3)}}]</span>
      </span>
      <!-- <span class="count_btn stop" @click="stopOrder"
            v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span> -->
      <span class="count_btn" @click="submitOrder">提交订单</span>
    </div>
  </div>
</template>

<script>
// vux组件引入
import {Popup, Swipeout, SwipeoutItem, SwipeoutButton, TransferDom} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {getBaseInfoData, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/PopMatterList'
import PopDealerList from 'components/Popup/PopDealerList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
  export default {
    directives: {
      TransferDom
    },
    components: {
      Popup, Swipeout, SwipeoutItem, SwipeoutButton, PopMatterList, PopDealerList, PopSingleSelect
    },
    data() {
      return {
        listId: 'a4897429-f4f2-44a4-ade7-2fe8dc67c3cf',
        matterList: [],                                  // 物料列表
        paymentIndex: 0,
        logisticsIndex: 0,
        DealerPaymentTerm: '现付',                        //结算方式
        DealerLogisticsTerms: '上门',                      //物流方式
        deliveryDate: '',                               // 预计交付日
        assistUnit: '请选择',                           // 辅助计量显示值
        assistUnitList: ['A', 'B', 'C'],               // 辅助计量列表
        transMode: ['现付', '预付', '账期', '票据'],          // 结算方式
        logisticsTerm: ['上门', '自提', '离岸', '到港'],      // 物流条款
        showDealerPop: false,                          // 是否显示客户的popup
        showLogPop: false,                              // 是否显示物流条款的popup
        showTransPop: false,                            // 是否显示结算方式的popup
        showMaterielPop: false,                         // 是否显示物料的popup
        dealerInfo: {},
        formData: {},
        dealer: {
          drDealerPaymentTerm: '现付',  //结算方式
          drDealerLogisticsTerms: '上门', //物流条件
          biComment: '' //备注
        },
        numMap: {}, // 用于记录订单物料的数量和价格
        taxRate: 0.16, // 税率
      }
    },
    mixins: [common],
    watch:{
      matterList(val){
        let data = {
          XSDD_DATA:{
            matter : this.matterList,
            dealer : this.dealerInfo
          }
        }
        this.$emit('sel-data',data)
      },
      dealerInfo(val){
        if(this.matterList.length){
          let data = {
            XSDD_DATA:{
              matter : this.matterList,
              dealer : this.dealerInfo
            }
          }
          this.$emit('sel-data',data)
        }
      }
    },
    methods: {
      // 选择地址
      goSetAds() {
        this.$router.push({path: '/adress'});
      },
      //选择结算方式
      getPayment(item, i) {
        this.DealerPaymentTerm = item;
        this.paymentIndex = i;

      },
      submitPayment() {
        this.dealer.drDealerPaymentTerm = this.DealerPaymentTerm;
        this.showTransPop = false;
      },
      //选择物流方式
      getLogistics(item, i) {
        this.DealerLogisticsTerms = item;
        this.logisticsIndex = i;
      },
      submitLogistics() {
        this.dealer.drDealerLogisticsTerms = this.DealerLogisticsTerms;
        this.showLogPop = false;
      },
      //选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.dealer.dealerDebitContactPersonName = this.dealerInfo.creatorName || '';
        this.dealer.dealerDebitContactInformation = this.dealerInfo.dealerMobilePhone;
        this.getMatPrice();
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        sels.map(item => {
          if (this.numMap[item.inventoryCode]) {
            item.tdQty = this.numMap[item.inventoryCode].tdQty;
            item.price = this.numMap[item.inventoryCode].price;
          } else {
            item.tdQty = 1;
            item.price = 90;
          }
        })
        this.numMap = {};
        this.matterList = sels;
        this.getMatPrice();
      },
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
      delClick(index, item) {
        let arr = this.matterList;
        let total = item.tdQty * item.price;
        arr.splice(index, 1);
      },
      // 数量减少
      subNum(item, i) {
        if(item.tdQty === 1) return;
        item.tdQty--;
        this.$set(this.matterList, i, item);
      },
      // 数量增加
      plusNum(item, i) {
        item.tdQty++;
        this.$set(this.matterList, i, item);
      },
      // TODO 新增更多物料
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
      submitOrder() {
        if (!this.dealerInfo.dealerName) {
          this.$vux.alert.show({
            content: '请选择客户信息'
          })
        }
        else if (this.matterList.length === 0) {
          this.$vux.alert.show({
            content: '请选择物料'
          })
        }
        else {
          this.$vux.confirm.show({
            content: '确认提交?',
            // 确定回调
            onConfirm: () => {
              let dataSet = [];
              // console.log(this.matterList);
              // return false;
              this.matterList.map(item => {
                dataSet.push({
                  tdId: item.tdId || '',
                  inventoryName_transObjCode: item.inventoryName || item.inventoryName_transObjCode, //物料名称
                  transObjCode: item.inventoryCode || item.transObjCode, //物料编码
                  assMeasureUnit: item.assMeasureUnit || '个',    //辅助计量
                  assMeasureScale: item.assMeasureScale || null,  //与主计量单位倍数
                  tdProcessing : item.processing || item.tdProcessing,//加工属性
                  tdQty: item.tdQty,     //数量
                  assistQty: item.assistQty || 0,        //辅计数量
                  price: item.price, //单价
                  taxRate: item.taxRate || 0.16,              //税率
                  taxAmount: item.price * item.tdQty * 0.16,           //税金
                  tdAmount: item.price * item.tdQty * (100 + 16) / 100,           //价税小计
                  promDeliTime: null, //预期交货日
                  comment: ''                //说明
                })
              })
              let wfPara = {
                [this.processCode]: {businessKey: "SO", createdBy: ""}
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
                  ...this.dealer,
                  handlerEntity: this.entity.dealerName,
                  order: {
                    dealerDebit: this.dealerInfo.dealerCode,
                    drDealerLabel: this.dealerInfo.dealerLabelName || '渠道商',
                    drDealerPaymentTerm : this.dealer.drDealerPaymentTerm,
                    dataSet
                  }
                }),
                wfPara: JSON.stringify(wfPara)
              }
              if (this.isResubmit) {
                submitData.biReferenceId = this.biReferenceId;
                this.saveData(saveAndCommitTask, submitData);
                return
              }
              this.saveData(saveAndStartWf, submitData);
            }
          })
        }
      },
      //获取订单信息用于重新提交
     getFormData() {
       return getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          let {formData} = data;
          formData.order.dataSet.map(item => {
            item.inventoryPic = item.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
            item.inventoryCode = item.inventoryCode_transObjCode;
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
          //客户信息展示
          this.dealerInfo = {
            creatorName:formData.dealerDebitContactPersonName,
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
            dealerDebitContactInformation: formData.dealerDebitContactInformation,//电话
            drDealerPaymentTerm: formData.order.drDealerPaymentTerm || '现付', //付款
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms || '上门', //物流条件
            biComment: formData.biComment //备注
          },
            this.matterList = data.formData.order.dataSet;
            this.$emit('input', false);
        })
      }
    },
    created(){
      let data = sessionStorage.getItem('XSDD_DATA');
      if(data){
        this.matterList = JSON.parse(data).matter;
        this.dealerInfo = JSON.parse(data).dealer;
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizApply';
</style>
