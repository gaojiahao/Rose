<template>
  <div class="detail_wrapper">
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
            <contract-part :contract-info="contractInfo" :logistics="false"></contract-part>
            <!-- 物料列表 -->
            <div class="materiel_list">
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
                          <span class="num">单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
                          <span class='num'>数量: {{item.tdQty}}</span>
                          <span>税率: {{item.taxRate}}</span>
                        </div>
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.tdAmount | toFixed | numberComma(3)}}
                          <span class="num"
                                :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 7 ? 'block' : '')}">
                                    [金额: <span class="symbol">￥</span>{{item.noTaxAmount | toFixed | numberComma(3)}} +
                                      税金: <span class="symbol">￥</span>{{item.taxAmount | toFixed | numberComma(3)}}]
                                  </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 金额明细 -->
                <div class="price_detail">
                  <div class="price_list">
                    <div class='title'>金额</div>
                    <div class="num"><span class="symbol">￥</span>{{noTaxAmount | toFixed | numberComma(3)}}</div>
                  </div>
                  <div class="price_list">
                    <div class='title'>税金</div>
                    <div class="num"><span class="symbol">￥</span>{{taxAmount | toFixed | numberComma(3)}}</div>
                  </div>
                  <!-- 金额合计栏 -->
                  <div class="price_count vux-1px-t">
                    <span class='title'>合计：</span>
                    <span class="num"><span class="symbol">￥</span>{{count | toFixed | numberComma(3)}}</span>
                  </div>
                </div>
                <price-total :amt="noTaxAmount" :tax-amt="taxAmount" :count="count"></price-total>
              </div>
            </div>
            <!-- 审批操作 -->
            <r-action :code="transCode" :task-id="taskId" :actions="actions" @on-submit-success="submitSuccessCallback"></r-action>
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
// 请求 引入
import {isMyflow, getSOList, getListId} from 'service/detailService'
// mixins 引入
import common from 'components/mixins/detailCommon'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PopRelatedList from 'components/Popup/PopRelatedList'
import ContractPart from 'components/detail/ContractPart'
import PriceTotal from 'components/detail/PriceTotal'
//公共方法引入
import {accAdd} from '@/home/pages/maps/decimalsAdd.js'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      orderInfo: {},      // 表单内容
      formViewUniqueId: '',
      contractInfo: {}, // 客户、付款方式、物流条款的值
    }
  },
  components: {
    workFlow, RAction, PopRelatedList, ContractPart, PriceTotal,
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
        this.getContractInfo();
        this.workFlowInfoHandler();
      })
    },
    // TODO 生成contractInfo对象
    getContractInfo(key = 'order') {
      let orderInfo = this.orderInfo;
      let order = orderInfo[key];
      this.contractInfo = {
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
      };
    },
  },
  created() {
  }
}
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';
</style>
