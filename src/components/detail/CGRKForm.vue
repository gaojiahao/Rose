<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
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
            <div class='contacts_part'>
              <contact-part :contact-info="dealerInfo" :hasClass="false" :logistics="false"></contact-part>
              <warehouse-content class="vux-1px-t" :warehouse="warehouse"></warehouse-content>
            </div>
            <!-- 物料列表 -->
            <div class="materiel_list">
              <div class="title">
                <span class="iconfont icon-Shape"></span>物料列表
              </div>
              <div class="mater_list">
                <div class="each_mater" 
                  :class="{'vux-1px-b' : index !==  orderInfo.inPut.dataSet.length - 1}"
                  v-for="(item, index) in orderInfo.inPut.dataSet" 
                  :key='index'>
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
            <!-- 金额明细 -->
            <price-total :amt="noTaxAmount" :tax-amt="taxAmount" :count="count"></price-total>
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
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopRelatedList from 'components/Popup/PopRelatedList'
import contactPart from 'components/detail/commonPart/ContactPart'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
//公共方法引入
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd.js'
export default {
  data() {
    return {
      count: 0,           // 金额合计
      comment: '',        // 审批备注
      orderInfo: {},      // 表单内容
      warehouse: {},      // 入库仓库
      formViewUniqueId: 'e76a8c6f-05cc-45ee-ba93-299fe6751856'
    }
  },
  computed:{
    // 合计金额
    noTaxAmount() {
      let total = 0;
      this.orderInfo.inPut.dataSet.forEach(item => {
        total = accAdd(total, item.noTaxAmount);
      });
      return total;
    },
    // 税金
    taxAmount() {
      let total = 0;
      this.orderInfo.inPut.dataSet.forEach(item => {
        total = accAdd(total, item.taxAmount);
      });
      return total;
    },
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction, PopWarehouseList,PopRelatedList,PriceTotal,contactPart,WarehouseContent
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
        let {inPut} = formData;
        let {dataSet} = inPut;
        for (let val of dataSet) {
          val.noTaxAmount = accMul(val.price,val.tdQty);
          val.taxAmount = accMul(val.noTaxAmount,val.taxRate);
          val.tdAmount = accAdd(val.noTaxAmount,val.taxAmount);
          this.count = accAdd(this.count,val.tdAmount);
          val.inventoryPic = val.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
        }
        this.dealerInfo = {
          creatorName: formData.dealerCreditContactPersonName, // 客户名
          dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
          dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
          dealerCode: inPut.dealerCode_dealerCodeCredit, // 客户编码
          dealerLabelName: inPut.crDealerLabel, // 关系标签
          province: inPut.province_dealerCodeCredit, // 省份
          city: inPut.city_dealerCodeCredit, // 城市
          county: inPut.county_dealerCodeCredit, // 地区
          address: inPut.address_dealerCodeCredit, // 详细地址
          payment :  inPut.crDealerPaymentTerm,//结算方式
        };
        // 入库
        this.warehouse = {
          warehouseCode: inPut.containerCode,
          warehouseName: inPut.warehouseName_containerCode,
          warehouseType: inPut.warehouseType_containerCode,
          warehouseProvince: inPut.warehouseProvince_containerCode,
          warehouseCity: inPut.warehouseCity_containerCode,
          warehouseDistrict: inPut.warehouseDistrict_containerCode,
          warehouseAddress: inPut.warehouseAddress_containerCode,
          containerInWarehouseManager: inPut.containerInWarehouseManager,
        };
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })
    },
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

