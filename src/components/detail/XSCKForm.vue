<template>
  <div class="pages">
    <div class="basicPart" v-if='orderInfo && orderInfo.outPut'>
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
      <div class="or_ads mg_auto box_sd">
        <div class="title">仓库</div>
        <div class="user_info">
          <span class="user_name">{{warehouse.warehouseName}}</span>
          <span class="user_tel">{{warehouse.warehouseType}}</span>
        </div>
        <div class="cp_info">
          <p class="cp_name"></p>
          <p class="cp_ads">
            {{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}{{warehouse.warehouseAddress}}
          </p>
        </div>
      </div>
      <!-- 结算方式 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">结算方式</p>
        <p class="mode">{{orderInfo.drDealerPaymentTerm || '无'}}</p>
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
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">物料列表</div>
        <div class="mater_list">
          <div class="each_mater vux-1px-b" v-for="(oItem, key) in orderList" :key='key'>
            <div class="each_mater_wrapper">
              <div class="order_code">
                <span class="order_title">所属订单</span>
                <span class="order_num">{{key.replace(/_/g,'')}}</span>
              </div>
              <!-- 物料信息 -->
              <div class="order_matter" v-for="(item, index) in oItem" :key="index">
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
                          <span class="num">{{item.inventoryCode_outPutMatCode}}</span>
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
                              [金额: ￥{{item.noTaxAmount | numberComma(3)}} + 税金: ￥{{item.taxAmount | numberComma(3)}}]
                            </span>
                    </div>
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
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  import {numberComma} from 'vux'
  import {getSOList,} from 'service/detailService'
  import workFlow from 'components/workFlow'
  import detailCommon from 'components/mixins/detailCommon'
  import RAction from 'components/RAction'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        orderInfo: {},      // 表单内容
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
        defaulImg: require('assets/avatar.png'),   // 默认图片1
        defaulImg2: require('assets/io.jpg'),       // 默认图片2
        orderList: {}, // 物料列表
        warehouse: {},
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction,
    },
    filters: {
      numberComma
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
               onHide:()=>{
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
            this.count += item.tdAmount;
            item.inventoryPic = item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg();
            if (!orderList[item.transMatchedCode]) {
              orderList[item.transMatchedCode] = [];
            }
            orderList[item.transMatchedCode].push(item);
          }
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
          };
          this.warehouse = {
            warehouseCode: outPut.containerCodeOut,
            warehouseName: outPut.warehouseName_containerCodeOut,
            warehouseRelType: outPut.warehouseType_containerCodeOut,
            warehouseProvince: outPut.warehouseProvince_containerCodeOut,
            warehouseCity: outPut.warehouseCity_containerCodeOut,
            warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
            warehouseAddress: outPut.warehouseAddress_containerCodeOut,
          };
          this.orderInfo = formData;
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
