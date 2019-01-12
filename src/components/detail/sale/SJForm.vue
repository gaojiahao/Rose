<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="contactInfo"></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>

      <div class="message-container">
        <header class="message-header">
          <div class="message_header_wrapper">
            <div class="text">商机信息</div>
            <div class="spell">shangjixinxi</div>
          </div>
        </header>
        <div class="message-content">
          <div class="message_content_item">
            <span class="title">标题：</span>
            <span class="content">{{orderInfo.opportunityTitle}}</span>
          </div>
          <div class="message_content_item">
            <span class="title">内容：</span>
            <span class="content">{{orderInfo.comment || '无'}}</span>
          </div>
          <div class="message_content_item">
            <span class="title">有效期至：</span>
            <span class="content">{{orderInfo.validUntil || '无'}}</span>
          </div>
          <div class="message_content_item">
            <span class="title">销售人员：</span>
            <span class="content">{{orderInfo.salesPerson || '无'}}</span>
          </div>
          <div class="message_content_item">
            <span class="title">销售渠道：</span>
            <span class="content">{{orderInfo.salesChannels || '无'}}</span>
          </div>
          <div class="message_content_item">
            <span class="title">分类标签：</span>
            <span class="content">{{orderInfo.categoryLabels || '无'}}</span>
          </div>
          <div class="message_content_item">
            <span class="title">备注：</span>
            <span class="content">{{orderInfo.biComment || '无'}}</span>
          </div>
          <div class="message_content_item amt">
            <span class="title">预期销售额：</span>
            <span class="content">￥{{orderInfo.tdAmount | numberComma(3) || 0}}</span>
          </div>
        </div>
      </div>

      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle"
                   :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {Cell, Group, dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  // 组件 引入
  import {toFixed} from '@/plugins/calc'
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
      Cell, Group, RAction, workFlow, contactPart
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
          this.attachment = data.attachment;
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
          dealerContactPersonName: orderInfo.dealerDebitContactPersonName, // 联系人
          dealerCode: orderInfo.dealerDebit, // 客户编码
          dealerLabelName: orderInfo.drDealerLabel, // 关系标签
          province: orderInfo.province_dealerDebit, // 省份
          city: orderInfo.city_dealerDebit, // 城市
          county: orderInfo.county_dealerDebit, // 地区
          address: orderInfo.address_dealerDebit, // 详细地址
          payment: orderInfo.drDealerPaymentTerm, // 付款方式
          validUntil: orderInfo.validUntil, //有效期
          logistics: orderInfo.drDealerLogisticsTerms,//物流条件

        };
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .xsbj-detail-container {
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
    /* 商机列表 */
    .message-container {
      margin-top: .1rem;
      padding: .15rem .2rem .25rem .25rem;
      background-color: #fff;
      color: #333;
    }
    .message-header {
      display: flex;
      justify-content: center;
      font-size: .16rem;
      .message_header_wrapper {
        position: relative;
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: .1rem;
          z-index: 1;
          display: inline-block;
          width: .15rem;
          height: .04rem;
          background-color: #fbd302;
        }
      }
      %bgHeader {
        content: '';
        position: absolute;
        z-index: 1;
        display: inline-block;
        border-radius: 50%;
        background-color: rgba(251,211,2,0.12);
      }
      .text {
        position: relative;
        margin-top: .1rem;
        &:before {
          @extend %bgHeader;
          top: .06rem;
          left: -.1rem;
          width: .26rem;
          height: .26rem;
        }
        &:after {
          @extend %bgHeader;
          top: 0;
          right: 0;
          width: .08rem;
          height: .11rem;
        }
      }
      .spell {
        line-height: .14rem;
        color: #696969;
        font-size: .14rem;
      }
    }
    .message-content {
      margin-top: .2rem;
      line-height: .2rem;
      .message_content_item {
        display: flex;
        font-size: .14rem;
        & + .message_content_item {
          margin-top: .15rem;
        }
        &.amt {
          color: #fa7138;
          .title {
            color: #fa7138;
          }
        }
      }
      .title {
        color: #999;
      }
      .content {
        flex: 1;
      }
    }
  }

</style>
