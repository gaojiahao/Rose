<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd">
        <div class="user_info">
          <span class="user_name">{{orderInfo.order.dealerName_dealerDebit}}</span>
        </div>
        <div class="cp_info">
          <span class="user_tel">{{orderInfo.dealerDebitContactInformation}}</span>
          <p class="cp_ads">{{orderInfo.order.province_dealerDebit}}{{orderInfo.order.city_dealerDebit}}{{orderInfo.order.county_dealerDebit}}{{orderInfo.order.address_dealerDebit}}</p>
        </div>
      </div>
      <!-- 结算方式 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">结算方式</p>
        <p class="mode">{{orderInfo.order.drDealerPaymentTerm || '无'}}</p>
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
                    <span class="symbol">￥</span>{{item.tdAmount | numberComma(3)}}
                    <span class="num"
                          :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 7 ? 'block' : '')}">
                              [金额: <span class="symbol">￥</span>{{item.noTaxAmount | numberComma(3)}} +
                                税金: <span class="symbol">￥</span>{{item.taxAmount | numberComma(3)}}]
                            </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 金额合计栏 -->
          <div class="price_list">
            <div class='title'>合计<span style="fontSize:.12rem;">(含税)</span></div>
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
// 请求 引入
import {isMyflow, getSOList, getListId} from 'service/detailService'
// mixins 引入
import common from 'components/mixins/detailCommon'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
//公共方法引入
import {accAdd} from '@/home/pages/maps/decimalsAdd.js'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      orderInfo: {},      // 表单内容
      formViewUniqueId: ''
    }
  },
  components: {
    workFlow, RAction,
  },
  mixins: [common],
  methods: {
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 获取详情
    getOrderList(transCode = '') {
      return getSOList({
        formViewUniqueId: this.formViewUniqueId,
        transCode
      }).then(data => {
        this.submitInfo = JSON.parse(JSON.stringify(data));
        // http200时提示报错信息
        if (data.success === false) {
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
              onHide:()=>{
              this.$router.back();
            }
          })
          return;
        }
        // 获取合计
        let {dataSet} = data.formData.order;
        for (let val of dataSet) {
          this.count = accAdd(this.count,val.tdAmount);
          val.inventoryPic = val.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
        }
        this.orderInfo = data.formData;
        this.workFlowInfoHandler();
      })

    },
  },
  created() {
  }
}
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';
</style>
