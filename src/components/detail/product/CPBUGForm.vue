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
      <div class="form_content">
        <div class="main_content">
          <div class="vux-1px-b" v-for="(item, index) in otherConfig" :key="index">
            <div class="each_info">
              <label>{{item.fieldLabel}}</label>
              <span class="field_value">{{orderInfo[item.fieldCode]}}</span>
            </div>
          </div>
          <div class="each_info">
            <label>备注</label>
            <span class="field_value">{{orderInfo.biComment || "无"}}</span>
          </div>
        </div>
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
    // TODO 跳转到编辑页面
    goEdit() {
      // 交易号、应用名称等
      let { folder, fileName } = this.$route.params,
          { name } = this.$route.query;
      this.$router.push({
        path: `/fillform/${folder}/${fileName}`,
        query: {
          name,
          transCode: this.transCode
        }
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
</style>
