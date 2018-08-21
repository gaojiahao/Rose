<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd" v-if="orderInfo.dealerDebitContactPersonName">
        <div class="user_info">
          <!-- 联系人 和 电话 -->
          <span class="user_name">{{orderInfo.dealerDebitContactPersonName}}</span>
          <span class="user_tel">{{orderInfo.dealerDebitContactInformation}}</span>
        </div>
        <div class="cp_info">
          <!-- 公司名 -->
          <p class="cp_name">{{orderInfo.dealerName_dealerDebit}}</p>
          <!-- 公司地址 -->
          <p class="cp_ads">
            {{orderInfo.address_dealerDebit}}
          </p>
        </div>
      </div>
      
      <div class="trade_mode mg_auto box_sd">
        <p class="title">当前所在阶段</p>
        <p class="mode group_mar_left">{{orderInfo.currentStage || '暂无'}}</p>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">销售人员</p>
        <p class="mode group_mar_left">{{orderInfo.salesPerson || '暂无'}}</p>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">销售渠道</p>
        <p class="mode group_mar_left">{{orderInfo.salesChannels || '暂无'}}</p>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">有效期至</p>
        <p class="mode group_mar_left">{{orderInfo.validUntil || '暂无'}}</p>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">创建时间</p>
        <p class="mode group_mar_left">{{orderInfo.crtTime || '暂无'}}</p>
      </div>

      <!-- 商机列表 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">商机明细</div>
        <div class="mater_list">
          <div class="each_mater vux-1px-b">
            <div class="each_mater_wrapper">
              <div class="mater_main">
                <!-- 商机基本信息 -->
                <div class="mater_info">
                  <!-- 商机编码、规格 -->
                  <div class="withColor">
                    <!-- 商机编码 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_code">
                        <span class="title">编码</span>
                        <span class="num">{{orderInfo.dealerDebit}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 商机名称 -->
                <div class="mater_name">
                  <span class="title">标题:</span>
                  {{orderInfo.opportunityTitle || '无'}}
                </div>
                <div class='mater_other'>
                  <!-- 商机类型 -->
                  <div class="mater_spec">
                    <span class="title">类型:</span>
                    <span class="content">{{orderInfo.categoryLabels || '无'}}</span>
                  </div>   
                  <!-- 商机内容 -->               
                  <div class='mater_reimb'>
                      <div class="reason">
                        <span class="title">商机内容: </span>
                        <span class="content">{{orderInfo.comment || '无'}}</span>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
          <!-- 预期销售额 -->
          <div class="price_list">
            <div class='title'>预期销售额:</div>
            <div class="num"><span style="fontSize:.12rem;">￥</span>{{orderInfo.tdAmount || 0}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {dateFormat} from 'vux'
  import {getSOList} from 'service/detailService'
  import workFlow from 'components/workFlow'
  import detailCommon from 'components/mixins/detailCommon'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        orderInfo: {},      // 表单内容
        formViewUniqueId: '5446fc51-1d16-489a-ab2b-6b2292bb7be5'
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow,
    },
    methods: {
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          // 获取合计
          let {dataSet} = data.formData.order;
          this.count = this.count / 100;
          data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
          this.orderInfo = data.formData;
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
  .materiel_list
    .mater_list
      .each_mater
        .each_mater_wrapper
          .mater_main {
            width: 100%;
            max-width: inherit;
            margin-left: 0.04rem;
            // .mater_name {
            //   font-size: .18rem;
            // }
          }
  .materiel_list 
    .mater_list 
      .each_mater 
        .each_mater_wrapper 
          .mater_main 
            .mater_info 
              .withColor 
                .mater_code 
                  .num {
                    border-top-right-radius: .08rem;
                  }
</style>
