<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <div class="swiper-container">
        <!-- 如果需要分页器 -->
        <div class="swiper-pagination" v-if='HasValRealted'></div>
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
              <span>其他应用里存在与本条相关联的数据，快去看看</span>
              <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
            </div>

            <!-- 经办信息 （订单、主体等） -->
            <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
            <!-- 工作流 -->
            <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                      :no-status="orderInfo.biStatus"></work-flow>
            <!-- 往来联系部分 交易基本信息-->
            <contact-part :contact-info="contactInfo" validUntil></contact-part>
            <!-- 物料列表 -->
            <matter-list :matter-list="orderInfo.order.dataSet" class="vux-1px-b"></matter-list>
            <!-- 审批操作 -->
            <r-action :code="transCode" :task-id="taskId" :actions="actions"
                      @on-submit-success="submitSuccessCallback"></r-action>
          </div>
          <div class="swiper-slide" v-if='HasValRealted'>
            <div class="big_title">
              <p class="vux-1px-b">相关实例</p>
            </div>
            <div class="relevant_list">
              <div class="each_app vux-1px-b" v-for='(item,index) in RelatedAppList' :key="index" @click="getRelatedData(item)">
                <div class="app_info">
                  <div class="title">业务应用</div>
                  <div class="app_name">
                    <span>{{item.listName}}</span>
                  </div>
                  <div class="msg_num">
                    {{item.itemCount}}
                    <span class="msg_tx">关联</span>
                  </div>
                  <div class="r_arrow" v-if='item.itemCount>0'>
                    <x-icon type="ios-arrow-right" size="20" ></x-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <pop-related-list :show='showPop' :listId='listId' :filter='filtersData' v-model='showPop' @reload-page='reloadPage'></pop-related-list>
      </div>
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
import PopRelatedList from 'components/Popup/PopRelatedList'
import contactPart from 'components/detail/commonPart/ContactPart'
import MatterList from 'components/detail/commonPart/MatterList'
export default {
  data() {
    return {
      orderInfo: {},      // 表单内容
      formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
      contactInfo: {}, // 客户、付款方式、物流条款的值
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction,PopRelatedList,contactPart,MatterList
  },
  methods: {
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
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
        formData.validUntil = dateFormat(formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = formData;
        this.getcontactInfo();
        this.workFlowInfoHandler();
      })
    },
    // TODO 生成contactInfo对象
    getcontactInfo(key = 'order') {
      let orderInfo = this.orderInfo;
      let order = orderInfo[key];
      this.contactInfo = {
        creatorName: orderInfo.dealerDebitContactPersonName, // 客户名
        dealerName: order.dealerName_dealerDebit, // 公司名
        dealerMobilePhone: orderInfo.dealerDebitContactInformation, // 手机
        dealerCode: order.dealerDebit, // 客户编码
        dealerLabelName: order.drDealerLabel, // 关系标签
        province: order.province_dealerDebit, // 省份
        city: order.city_dealerDebit, // 城市
        county: order.county_dealerDebit, // 地区
        address: order.address_dealerDebit, // 详细地址
        payment: order.drDealerPaymentTerm, // 付款方式
        validUntil : orderInfo.validUntil, //有效期
        logistics : orderInfo.drDealerLogisticsTerms,//物流条件
      };
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
