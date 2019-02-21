<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
      <!-- 任务信息 -->
      <div class="form_content">
        <div class="main_content">
          <div class="vux-1px-b" v-for="(item, index) in otherConfig" :key="index">
            <template v-if="item.id.includes('Datefield')">
              <div class="each_info">
                <label>{{item.fieldLabel}}</label>
                <span class="field_value">{{projectTask[item.fieldCode] || '无' | timeSplit}}</span>
              </div>
            </template>
            <template v-else>
              <div class="each_info">
                <label>{{item.fieldLabel}}</label>
                <span class="field_value">{{projectTask[item.fieldCode] || '无'}}</span>
              </div>
            </template> 
          </div>
        </div>
      </div>
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>

    </div>
  </div>
</template>

<script>
// vux组件引入
import { Cell, Group, dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { findProjectTask } from 'service/projectService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
import common from '@/mixins/common'
// 组件 引入
import RPicker from 'components/RPicker'
export default {
  data() {
    return {
      projectTask: {},
      comment: {},
    }
  },
  mixins: [detailCommon, common],
  components: {
    Group,
    Cell,
    RPicker,
  },
  filters: {
    timeSplit(val) {
      return val ? val.split(' ')[0] : '';
    }
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
      return findProjectTask(transCode).then(({formData = {},attachment = []}) => {
        this.jsonData = formData;
        this.attachment = attachment;
        this.comment = formData.comment;
        this.projectTask = {
          ...formData.projectPlanTask,
          ...formData.projectApproval,
          // deadline: this.changeDate(projectTask.deadline),
          // actualCompleteTime: this.changeDate(projectTask.actualCompleteTime),
        };
        this.orderInfo = {
          ...formData.baseinfo,
          biStatus: '已生效'
        };
      })
    },
  },
  created() {
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .xmrw-detail-container {
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
</style>
