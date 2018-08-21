<template>
    <div class="detail_wrapper">
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
              <p class="mode">{{orderInfo.order.drDealerPaymentTerm || '无'}}</p>
            </div>
            <!-- 物流条款 -->
            <div class="trade_mode mg_auto box_sd" @click="showLogPop = !showLogPop">
              <p class="title">物流条款</p>
              <p class="mode">{{orderInfo.drDealerLogisticsTerms || '无'}}</p>
            </div>
            <div class="trade_mode mg_auto box_sd">
              <p class="title">创建时间</p>
              <p class="mode">{{orderInfo.crtTime || '暂无'}}</p>
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
                          {{item.inventoryName_transObjCode || '该物料未获取到名称，请检查物料信息。'}}
                        </div>
                        <!-- 物料基本信息 -->
                        <div class="mater_info">
                            <!-- 物料编码、规格 -->
                          <div class="withColor">
                            <!-- 物料编码 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_code">
                                <span class="title">编码</span>
                                <span class="num">{{item.transObjCode || '无'}}</span>
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
          <r-action :code="transCode" :task-id="taskId" :actions="actions" @on-submit-success="submitSuccessCallback"></r-action>
        </div>
    </div>
</template>

<script>
import { getSOList, } from 'service/detailService.js'
import common from 'components/mixins/detailCommon.js'
import workFlow from 'components/workFlow.vue'
import RAction from 'components/RAction'

export default {
  data(){
    return{
      count : 0,          // 金额合计
      orderInfo: {},      // 表单内容
      formViewUniqueId : ''
    }
  },
  components:{
    workFlow, RAction,
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
    // 获取详情
    getOrderList(transCode = ''){
      return getSOList({
        formViewUniqueId : this.formViewUniqueId,
        transCode
      }).then(data => {
        this.submitInfo  = JSON.parse(JSON.stringify(data));
        // http200时提示报错信息
        if(data.success === false){
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
              onHide:()=>{
              this.$router.back();
            }
          })
          return;
        }
        // 获取合计
        let { dataSet } = data.formData.order;
        for(let val of dataSet){
          this.count += val.tdAmount*100;
          val.inventoryPic = val.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
        }
        this.count = (this.count/100).toFixed(2);
        this.orderInfo = data.formData;
        this.workFlowInfoHandler();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
@import './../scss/bizDetail';
</style>
