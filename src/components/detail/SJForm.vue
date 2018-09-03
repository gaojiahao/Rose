<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>   
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow> 
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="contactInfo"></contact-part>
      <div class="materiel_list">
        <div class="title">
          <span class="iconfont icon-mingxi1"></span>
          <span>商机明细</span>
        </div>
        <div class="main_content">
          <div class="each_cell vux-1px-t">
            <span class="cell_name">标题：</span>
            <span class="cell_content">{{orderInfo.opportunityTitle}}</span>
          </div>
          <div class="each_cell vux-1px-t">
            <span class="cell_name">内容：</span>
            <span class="cell_content">{{orderInfo.comment || "无"}}</span>
          </div>
        </div>
      </div>
      <!-- 商机列表 -->
      <!-- <div class="materiel_list">
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
          <div class="price_list">
            <div class='title'>预期销售额:</div>
            <div class="num"><span style="fontSize:.12rem;">￥</span>{{orderInfo.tdAmount | numberComma(3) || 0}}</div>
          </div>
        </div>
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
import contactPart from 'components/detail/commonPart/ContactPart'


export default {
  data() {
    return {
      count: 0,          // 金额合计
      orderInfo: {},      // 表单内容
      contactInfo: {},
      formViewUniqueId: '5446fc51-1d16-489a-ab2b-6b2292bb7be5'
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction,Cell, Group, contactPart
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
        this.getcontactInfo();
        this.workFlowInfoHandler();
      })
    },
    // TODO 生成contactInfo对象
    getcontactInfo(key = 'order') {
      let orderInfo = this.orderInfo;
      this.contactInfo = {
        creatorName: orderInfo.dealerDebitContactPersonName, // 客户名
        dealerName: orderInfo.dealerName_dealerDebit, // 公司名
        dealerMobilePhone: orderInfo.dealerDebitContactInformation, // 手机
        dealerCode: orderInfo.dealerDebit, // 客户编码
        dealerLabelName: orderInfo.drDealerLabel, // 关系标签
        province: orderInfo.province_dealerDebit, // 省份
        city: orderInfo.city_dealerDebit, // 城市
        county: orderInfo.county_dealerDebit, // 地区
        address: orderInfo.address_dealerDebit, // 详细地址
        payment: orderInfo.drDealerPaymentTerm, // 付款方式
        validUntil : orderInfo.validUntil, //有效期
        logistics : orderInfo.drDealerLogisticsTerms,//物流条件

      };
    }
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
  .materiel_list {
    .title {
      padding-bottom: .06rem;
      .iconfont {
        font-size: .14rem;
      }
    }
    .mater_list {
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
