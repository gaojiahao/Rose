<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_content">
        <div class="main_content" v-for="(item, index) in costList" :key="index">
          <div :class="{'vux-1px-t': cIndex > 0}" v-for="(cItem, cIndex) in matterConfig" :key="cIndex">
            <div class="each_info">
              <label>{{cItem.text}}</label>
              <span class="field_value">{{item[cItem.fieldCode]}}</span>
            </div>
          </div>
        </div> 
      </div>
      <div class="comment">
        <form-cell cellTitle='备注' :cellContent="orderInfo.biComment"></form-cell>
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
  import {dateFormat, XInput} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  // 组件引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  //公共方法引入
  import {accAdd, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
        costList: [],
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, contactPart, XInput, 
    },
    methods: {
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          let {success, formData, attachment} = data;
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
          let {dataSet = []} = formData.order;
          this.attachment = attachment;
          this.orderInfo = formData;
          this.costList = dataSet;
          this.workFlowInfoHandler();
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
  .comment{
    margin: .1rem;
    padding: 0 .1rem;
    background: #fff;
  }
</style>
