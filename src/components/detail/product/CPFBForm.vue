<template>
  <div class="detail_wrapper cpxq-detail-container">
    <div class="basicPart">
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="product">
        <div class="title">
          <div>
            <span class="iconfont icon-mingxi1"></span>
            <span>产品信息</span>
          </div>
          <!-- <div @click="goEdit">
            <i class="iconfont icon-bianji1"></i>
            <span>编辑</span>
          </div> -->
        </div>
        <form-cell cellTitle="标题" :cellContent="orderInfo.launchTitle"></form-cell>
        <form-cell cellTitle="描述" :cellContent="orderInfo.launchDescribe"></form-cell>
        <form-cell cellTitle="类型" :cellContent="orderInfo.launchType"></form-cell>
        <form-cell cellTitle="备注" :cellContent="orderInfo.biComment"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux 组件引入
import {dateFormat} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import workFlow from 'components/workFlow'
import RAction from 'components/RAction'
import contactPart from 'components/detail/commonPart/ContactPart'
import MatterList from 'components/detail/commonPart/MatterList'
export default {
  data() {
    return {
      orderInfo: {},      // 表单内容
      formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
      contactInfo: {}, // 客户、付款方式、物流条款的值
      uploadStyle: {
        width: '100%',
        padding :'0.06rem 0.1rem'

      }
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow, RAction, contactPart, MatterList
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
      }).then(({success = true, formData = {}, attachment = []}) => {
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
        this.attachment = attachment;
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })
    },
    // TODO 跳转到编辑页面
    goEdit() {
      // 交易号、应用名称等
      let { fileId, listId } = this.$route.params,
          { name } = this.$route.query;
      this.$router.push({
        path: `/fillform/${fileId}/${listId}`,
        query: {
          name,
          transCode: this.transCode
        }
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .cpxq-detail-container {
    .product {
      margin-bottom: .1rem;
      padding: 0 .1rem;
      width: 100%;
      background-color: #fff;
      box-sizing: border-box;
      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: .04rem 0;
        font-size: .16rem;
        font-weight: bold;
        .icon-mingxi1 {
          font-size: .14rem;
        }
      }
      .icon-bianji1 {
        font-size: .14rem;
        font-weight: normal;
      }
    }
  }
</style>
