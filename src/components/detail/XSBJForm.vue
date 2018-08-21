<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd">
        <div class="user_info">
          <span class="user_name">{{dealerInfo.creatorName}}</span>
          <span class="user_tel">{{dealerInfo.dealerMobilePhone}}</span>
        </div>
        <div class="cp_info">
          <p class="cp_name">{{dealerInfo.dealerName}}</p>
          <p class="cp_ads">
            {{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}</p>
        </div>
      </div>
      <!-- 结算方式 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">结算方式</p>
        <p class="mode">{{orderInfo.order.drDealerPaymentTerm || '无'}}</p>
      </div>
      <!-- 物流条款 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">物流条款</p>
        <p class="mode">{{orderInfo.drDealerLogisticsTerms || '无'}}</p>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">创建时间</p>
        <p class="mode">{{orderInfo.crtTime || '暂无'}}</p>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">有效期至</p>
        <p class="mode">{{orderInfo.validUntil || '暂无'}}</p>
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
                  <div class='mater_price'>
                    <span class="symbol">￥</span>{{item.price | numberComma(3)}}
                    <span class="num">[类型: {{item.priceType || '无'}}]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux 组件引入
import { dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import workFlow from 'components/workFlow'
import RAction from 'components/RAction'
export default {
  data() {
    return {
      orderInfo: {},      // 表单内容
      formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
      dealerInfo: {},
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction,
  },
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
      }).then(({success = true, formData = {}}) => {
        // http200时提示报错信息
        if (success === false) {
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
            onHide: () => {
              this.$router.back();
            }
          });
          return;
        }
        let {order} = formData;
        // 获取合计
        let {dataSet} = order;
        for (let val of dataSet) {
          val.inventoryPic = val.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
        }
        // 客户信息
        this.dealerInfo = {
          creatorName: formData.dealerDebitContactPersonName || '', // 客户名
          dealerName: order.dealerName_dealerDebit || '', // 公司名
          dealerMobilePhone: formData.dealerDebitContactInformation || '', // 手机
          dealerCode: order.dealerDebit || '', // 客户编码
          dealerLabelName: order.drDealerLabel || '客户', // 关系标签
          province: order.province_dealerDebit || '', // 省份
          city: order.city_dealerDebit || '', // 城市
          county: order.county_dealerDebit || '', // 地区
          address: order.address_dealerDebit || '', // 详细地址
        };
        formData.validUntil = dateFormat(formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';

  .xsbj-detail-container {
    .price_type {
      margin-top: .04rem;
      color: #757575;
      font-size: .12rem;
    }
  }
</style>
