<template>
  <div class="detail_wrapper cpxq-detail-container">
    <div class="basicPart">
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来信息 -->
      <contact-part :contact-info="contactInfo" v-if="contactInfo.dealerName"></contact-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 需求信息 -->
      <only-word :config="otherConfig" :info="orderInfo"></only-word>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
      <!-- 附件 -->
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
import detailCommon from 'mixins/detailCommon'
// 组件 引入
import workFlow from 'components/public/workFlow'
import RAction from 'components/public/RAction'
import MatterList from 'components/detail/commonPart/MatterList'
import contactPart from 'components/detail/commonPart/ContactPart'
import onlyWord from 'components/detail/commonPart/form-part/onlyWord'
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
    RAction, workFlow, onlyWord,
    contactPart, MatterList
  },
  methods: {
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
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
        this.contactInfo = {
          dealerName: formData.dealerName_productDealerCode, // 公司名
          dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
          dealerContactPersonName: formData.dealerDebitContactPersonName, // 联系人
        }
        this.workFlowInfoHandler();
      })
    },
    // 跳转到编辑页面
    goEdit() {
      // 交易号、应用名称等
      let { name,folder, fileName } = this.$route.query;
      this.$router.push({
        path: `/fillform/0/${fileName}`,
        query: {
          name,
          folder, fileName,
          transCode: this.transCode
        }
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
</style>
