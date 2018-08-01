<template>
    <div class="pages">
        <div class="basicPart" v-if='orderInfo && orderInfo.order'>
            <!-- 工作流 -->
          <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                     :no-status="orderInfo.biStatus"></work-flow>
            <!-- 用户地址和基本信息-->
            <div class="or_ads mg_auto box_sd">
              <div class="user_info">
                <span class="user_name">{{orderInfo.dealerDebitContactPersonName}}</span>
                <span class="user_tel">{{orderInfo.dealerDebitContactInformation}}</span>
              </div>
              <div class="cp_info">
                <p class="cp_name">{{orderInfo.order.dealerName_dealerDebit}}</p>
                <p class="cp_ads">{{orderInfo.order.province_dealerDebit}}{{orderInfo.order.city_dealerDebit}}{{orderInfo.order.county_dealerDebit}}{{orderInfo.order.address_dealerDebit}}</p>
              </div>
            </div>
            <!-- 结算方式 -->
            <div class="trade_mode mg_auto box_sd">
              <p class="title">结算方式</p>
              <p class="mode">{{orderInfo.drDealerPaymentTerm || '无'}}</p>
            </div>
            <!-- 物流条款 -->
            <div class="trade_mode mg_auto box_sd" @click="showLogPop = !showLogPop">
              <p class="title">物流条款</p>
              <p class="mode">{{orderInfo.drDealerLogisticsTerms || '无'}}</p>
            </div>
            <!-- 物料列表 -->
            <div class="materiel_list mg_auto box_sd">
              <div class="title">物料列表</div>
                <div class="mater_list">
                  <div class="each_mater vux-1px-b" v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
                    <div class="each_mater_wrapper">
                      <div class="mater_img">
                        <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                      </div>
                      <div class="mater_main">
                        <!-- 物料名称 -->
                        <div class="mater_name">
                          {{item.inventoryName_transObjCode}}
                        </div>
                        <!-- 物料基本信息 -->
                        <div class="mater_info">
                            <!-- 物料编码、规格 -->
                          <div class="withColor">
                            <!-- 物料编码 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_code">
                                <span class="title">编码</span>
                                <span class="num">{{item.transObjCode}}</span>
                              </div>
                            </div>
                            <!-- 物料规格 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_spec">
                                <span class="title">规格</span>
                                <span class="num">{{item.specification_transObjCode || '无'}}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- 物料数量和价格 -->
                        <div class='mater_other'>
                          <div class='mater_num'>
                            <span class="num">单价: ￥{{item.price | numberComma(3)}}</span>
                            <span class='num'>数量: {{item.tdQty}}</span>
                            <span>税率: {{item.taxRate}}</span>
                          </div>
                          <div class='mater_price'>
                            ￥{{item.tdAmount | numberComma(3)}}
                            <span class="num"
                                  :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 7 ? 'block' : '')}">
                              [金额: ￥{{item.price* item.tdQty| numberComma(3)}} + 税金: ￥{{item.taxAmount | numberComma(3)}}]
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 金额合计栏 -->
                  <div class="price_list">
                    <div class='title' >合计<span style="fontSize:.12rem;">(含税)</span></div>
                    <div class="num"><span style="fontSize:.12rem;">￥</span>{{count | numberComma(3)}}</div>
                  </div>
                </div>
            </div>
            <!-- 审批操作 -->
            <div class="handle_btn" v-if="isMyTask || (cancelStatus && cancelStatus1)">
              <span class='reject' @click="cancel()" v-if='cancelStatus && cancelStatus1'>撤回</span>
              <span class="reject" v-if='nodeName.indexOf("disagree")>=0 && (!cancelStatus ||!cancelStatus1)' @click="reject">拒绝</span>
              <span class="agree" v-if='nodeName.indexOf("agree")>=0' @click="agree">同意</span>
            </div>
        </div>
    </div>
</template>

<script>
import { numberComma } from 'vux'
import { getSOList, } from 'service/detailService.js'
import common from 'components/mixins/detailCommon.js'
import workFlow from 'components/workFlow.vue'
export default {
  data(){
    return{
      count : 0,          // 金额合计
      orderInfo: {},      // 表单内容
      formViewUniqueId : '',
      defaulImg: require('assets/avatar.png'),   // 默认图片1
      defaulImg2: require('assets/io.jpg'),       // 默认图片2
    }
  },
  components:{
    workFlow
  },
  filters:{
    numberComma
  },
  mixins: [common],
  methods:{
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    reject(){
      this.taskReject();

    },
    agree(){
      this.taskAgree();
    },
    cancel(){
      this.taskCancel();
    },
    // 获取详情
    async getOrderList(transCode = ''){
        await getSOList({
          formViewUniqueId : this.formViewUniqueId,
          transCode
        }).then(data => {
          this.submitInfo  = JSON.parse(JSON.stringify(data));
          // http200时提示报错信息
          if(data.success === false){
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            })
            return;
          }
          // 获取合计
          let { dataSet } = data.formData.order;
          for(let val of dataSet){
            this.count += val.tdAmount*100;
            val.inventoryPic = val.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}` : this.getDefaultImg();
          }
          this.count = this.count/100;
          this.orderInfo = data.formData;
          this.workFlowInfoHandler();
        })

    },
  },
  created(){
  }
}
</script>

<style lang='scss' scoped>
@import './../scss/bizDetail';
</style>
