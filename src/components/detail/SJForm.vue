<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo'>
      <div class="form_top vux-1px-b">
        <div class="basic_info">
          <!-- 订单编码栏 -->
          <div class="serial_bar vux-1px-b">
            <div>
              <span class="iconfont icon-dingdan1"></span>
              <span class="l_size_name">{{workFlowInfo.transCode && workFlowInfo.transCode.replace(/_/g,'')}}</span>
            </div>
            <p class="work_status" :class="workFlowInfo.dyClass">{{workFlowInfo.biStatus}}</p>
          </div>
          <div class="cp_info">
            <p class="l_size_name vux-1px-b">{{orderInfo.dealerName_dealerDebit}}</p>
            <p class="m_size_name">{{orderInfo.address_dealerDebit}}</p>
            <p class="s_size_name">{{orderInfo.dealerDebitContactInformation}}</p>
          </div>
        </div>
        <!-- 工作流 -->
        <!-- <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                  :no-status="orderInfo.biStatus"></work-flow> -->
      </div>
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd">
        <div class="user_info">
          <!-- 公司名 -->
          <span class="user_name">{{orderInfo.dealerName_dealerDebit}}</span>
        </div>
        <div class="cp_info">
          <span class="user_tel">{{orderInfo.dealerDebitContactInformation}}</span>
          <!-- 公司地址 -->
          <p class="cp_ads">
            {{orderInfo.address_dealerDebit}}
          </p>
        </div>
      </div>
      <!-- <div class="trade_mode mg_auto box_sd">
        <p class="title">创建时间</p>
        <p class="mode group_mar_left">{{orderInfo.crtTime || '暂无'}}</p>
      </div> -->

      <!-- 商机列表 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">商机明细</div>
        <div class="mater_list">
          <div class="each_mater vux-1px-b">
            <div class="each_mater_wrapper">
              <div class="mater_main">
                <group label-width="1rem">
                    <cell title='商机标题' align-items="flex-start"  :value='orderInfo.opportunityTitle'></cell>
                    <cell title='当前所在阶段' :value='orderInfo.currentStage'></cell>
                    <cell title='商机内容' align-items="flex-start" value-align="right" :value='orderInfo.comment || "无"'></cell>
                    <cell title='销售人员' :value='orderInfo.salesPerson' v-if="orderInfo.salesPerson"></cell>
                    <cell title='销售渠道' :value='orderInfo.salesChannels' v-if="orderInfo.salesChannels"></cell>
                    <cell title='有效期至' :value='orderInfo.validUntil' v-if="orderInfo.validUntil"></cell>
                    <cell title='创建时间' :value='orderInfo.crtTime'></cell>
                </group>
              </div>
            </div>
          </div>
          <!-- 预期销售额 -->
          <div class="price_list">
            <div class='title'>预期销售额:</div>
            <div class="num"><span style="fontSize:.12rem;">￥</span>{{orderInfo.tdAmount | numberComma(3) || 0}}</div>
          </div>
        </div>
      </div>
      <!-- <div class="materiel_list mg_auto box_sd">
        <div class="title">商机其他</div>
      </div> -->
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { Cell, Group,dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import { toFixed } from '@/plugins/calc'
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'

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
    workFlow, RAction,Cell, Group
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
        // let {dataSet} = data.formData.order;
        this.count = this.count / 100;
        data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
        data.formData.tdAmount = toFixed(data.formData.tdAmount);
        this.orderInfo = data.formData;
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';
  .xsbj-detail-container{
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }
  .xsbj-detail-container {
    .price_type {
      margin-top: .04rem;
      color: #757575;
      font-size: .12rem;
    }
  }
  .materiel_list
    .mater_list
      .each_mater {
        padding: unset;
        .each_mater_wrapper
          .mater_main {
            width: 100%;
            max-width: inherit;
            margin-left: inherit;
            .mater_title {
              font-size: .18rem;
            }
            .mater_other {
              margin-top: -.04rem;
            }
            .mater_spec {
              margin-right: .04rem;
              .content {
                font-size: .12rem;
              }
            }
            .mater_reimb {
              margin-top: .04rem;
            }
          }
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
