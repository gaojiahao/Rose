<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.outPut'>
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
              <!-- 项目 -->
              <div class="other_info">
                <div class="info_title vux-1px-b"><span class="iconfont icon-xiangmu"></span>项目信息</div>
                <div class="info_content">
                  <div class="each_info">
                    <span class="title">项目名称：</span>
                    <span class="content">{{orderInfo.outPut.project || '无'}}</span>
                  </div>
                  <div class="each_info">
                    <span class="title">项目类型：</span>
                    <span class="content">{{orderInfo.outPut.projectType_project || '无'}}</span>
                  </div>
                  
                </div>
              </div>              
              <!-- 工作流 -->
              <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                        :no-status="orderInfo.biStatus"></work-flow>
              <!-- 用户地址和基本信息-->
              <div class='contacts_part'>
                <contact-part :contact-info="dealerInfo" :hasClass='false'></contact-part>
                <warehouse-content class="vux-1px-t" :warehouse="warehouse"></warehouse-content>
              </div>
              <!-- 物料列表 -->
              <div class="materiel_list">
                <div class="title">
                  <span class="iconfont icon-Shape"></span>物料列表
                </div>
                <div class="mater_list">
                  <div class="each_mater" 
                      v-for="(oItem, key) in orderList" :key='key'>
                    <div class="order_code">
                      <span class="order_title">所属订单</span>
                      <span class="order_num">{{key.replace(/_/g,'')}}</span>
                    </div>
                    <div class="each_mater_wrapper">
                      <!-- 物料信息 -->
                      <div class="order_matter" v-for="(item, index) in oItem" :key="index"
                      :class="{'vux-1px-b' : index !==  oItem.length - 1}">
                        <div class="mater_img">
                          <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                        </div>
                        <div class="mater_main">
                          <!-- 物料名称 -->
                          <div class="mater_name">
                            {{item.inventoryName_outPutMatCode}}
                          </div>
                          <!-- 物料基本信息 -->
                          <div class="mater_info">
                            <!-- 物料编码、规格 -->
                            <div class="withColor">
                              <!-- 物料编码 -->
                              <div class="ForInline" style="display:inline-block">
                                <div class="mater_code">
                                  <span class="title">编码</span>
                                  <span class="num">{{item.inventoryCode_outPutMatCode || '无'}}</span>
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
                              ￥{{item.tdAmount | toFixed | numberComma(3)}}
                              <span class="num"
                                    :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 4 ? 'block' : '')}">
                                      [金额: ￥{{item.noTaxAmount | toFixed | numberComma(3)}} + 税金: ￥{{item.taxAmount | toFixed | numberComma(3)}}]
                                    </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>             
                </div>
              </div>
              <!-- 金额合计 -->
              <price-total :amt="noTaxAmount" :tax-amt="taxAmount" :count="count"></price-total>
              <!-- 审批操作 -->
              <r-action :code="transCode" :task-id="taskId" :actions="actions"
                        @on-submit-success="submitSuccessCallback"></r-action>
            </div>
            <div class="swiper-slide" v-if='HasValRealted'>
              <div class='related_apply'>
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
        </div>
        <pop-related-list :show='showPop' :listId='listId' :filter='filtersData' v-model='showPop' @reload-page='reloadPage'></pop-related-list>
      </div>
    </div>
  </div>
</template>
<script>
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
//公共方法引入
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd.js'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopRelatedList from 'components/Popup/PopRelatedList'
import contactPart from 'components/detail/commonPart/ContactPart'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      orderInfo: {},      // 表单内容
      formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
      orderList: {}, // 物料列表
      warehouse: {},
      dealerInfo: {}, // 客户信息
      basicInfo :{},//存放基本信息
    }
  },
  computed:{
    // 合计金额
    noTaxAmount() {
      let total = 0;
      this.orderInfo.outPut.dataSet.forEach(item => {
        total = accAdd(total, item.noTaxAmount);
      });
      return total;
    },
    // 税金
    taxAmount() {
      let total = 0;
      this.orderInfo.outPut.dataSet.forEach(item => {
        total = accAdd(total, item.taxAmount);
      });
      return total;
    },
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction, PopWarehouseList,PopRelatedList,contactPart,PriceTotal,WarehouseContent
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
        let orderList = {};
        let {outPut = {}} = formData;
        // 获取合计
        let {dataSet} = formData.outPut;
        for (let item of dataSet) {
          item.noTaxAmount = accMul(item.price,item.tdQty);
          item.taxAmount = accMul(item.noTaxAmount,item.taxRate);
          item.tdAmount = accAdd(item.noTaxAmount,item.taxAmount);
          this.count = accAdd(this.count,item.tdAmount)
          // this.count += item.tdAmount *100;
          item.inventoryPic = item.inventoryPic_outPutMatCode
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400`
            : this.getDefaultImg();
          if (!orderList[item.transMatchedCode]) {
            orderList[item.transMatchedCode] = [];
          }
          orderList[item.transMatchedCode].push(item);
        }
        // this.count = (this.count/100).toFixed(2);
        this.orderList = orderList;
        this.dealerInfo = {
          creatorName: formData.dealerDebitContactPersonName, // 客户名
          dealerName: outPut.dealerName_dealerDebit, // 公司名
          dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
          dealerCode: outPut.dealerDebit, // 客户编码
          dealerLabelName: outPut.drDealerLabel, // 关系标签
          province: outPut.province_dealerDebit, // 省份
          city: outPut.city_dealerDebit, // 城市
          county: outPut.county_dealerDebit, // 地区
          address: outPut.address_dealerDebit, // 详细地址
          payment: outPut.drDealerPaymentTerm, // 付款方式
          logistics: formData.drDealerLogisticsTerms,//物流方式
        };
        this.warehouse = {
          warehouseCode: outPut.containerCodeOut,
          warehouseName: outPut.warehouseName_containerCodeOut,
          warehouseType: outPut.warehouseType_containerCodeOut,
          warehouseProvince: outPut.warehouseProvince_containerCodeOut,
          warehouseCity: outPut.warehouseCity_containerCodeOut,
          warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
          warehouseAddress: outPut.warehouseAddress_containerCodeOut,
        };
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';
  .contacts_part {
    margin-bottom: .1rem;
    padding: .06rem .1rem 0;
    width: 100%;
    background: #fff;
    box-sizing: border-box;
  }
</style>
