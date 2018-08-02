<template>
  <div class="pages">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd">
        <div class="user_info">
          <span class="user_name">{{orderInfo.dealerCreditContactPersonName}}</span>
          <span class="user_tel">{{orderInfo.dealerCreditContactInformation}}</span>
        </div>
        <div class="cp_info">
          <p class="cp_name">{{orderInfo.inPut.dealerName_dealerCodeCredit}}</p>
          <p class="cp_ads"></p>
        </div>
      </div>
      <div class="or_ads mg_auto box_sd">
        <div class="title">仓库</div>
        <div class="user_info">
          <span class="user_name">{{orderInfo.inPut.warehouseName_containerCode}}</span>
          <span class="user_tel">{{orderInfo.inPut.warehouseType_containerCode}}</span>
        </div>
        <div class="cp_info">
          <p class="cp_name"></p>
          <p class="cp_ads"></p>
        </div>
      </div>
      <!-- 结算方式 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">结算方式</p>
        <p class="mode">{{orderInfo.crDealerPaymentTerm || '无'}}</p>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">创建时间</p>
        <p class="mode">{{orderInfo.crtTime || '暂无'}}</p>
      </div>
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">物料列表</div>
        <div class="mater_list">
          <div class="each_mater vux-1px-b" v-for="(item, index) in orderInfo.inPut.dataSet" :key='index'>
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
                              [金额: ￥{{item.noTaxAmount | numberComma(3)}} + 税金: ￥{{item.taxAmount | numberComma(3)}}]
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
      <r-action :code="transCode" :task-id="taskId" :actions="actions"></r-action>
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
        formViewUniqueId: 'e76a8c6f-05cc-45ee-ba93-299fe6751856',
        defaulImg: require('assets/avatar.png'),   // 默认图片1
        defaulImg2: require('assets/io.jpg'),       // 默认图片2
        comment: '',//审批备注
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
        }).then(data => {
          this.submitInfo = JSON.parse(JSON.stringify(data));
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          // 获取合计
          let {dataSet} = data.formData.inPut;
          for (let val of dataSet) {
            this.count += val.tdAmount;
            val.inventoryPic = val.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}` : this.getDefaultImg();
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

