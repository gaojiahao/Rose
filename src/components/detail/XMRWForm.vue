<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <div class="trade_mode mg_auto box_sd">
        <p class="title">项目名称</p>
        <p class="mode">{{projectTask.projectName}}</p>
      </div>
      <!-- 实际情况 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">实际情况</p>
        <group>
          <cell title="实际完成日期" :value="projectTask.actualCompleteTime"></cell>
          <cell title="实际工时" :value="projectTask.actualCompleteTime"></cell>
        </group>
      </div>
    </div>
  </div>
</template>

<script>
  import {Group, Cell, dateFormat,} from 'vux'
  import {getSOList,} from 'service/detailService'
  import detailCommon from 'components/mixins/detailCommon'
  import {findProjectTask} from 'service/projectService'

  export default {
    data() {
      return {
        projectTask: {}
      }
    },
    mixins: [detailCommon],
    components: {
      Group,
      Cell,
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
        return findProjectTask(transCode).then(({formData = {}}) => {
          let {projectTask} = formData;
          this.projectTask = {
            ...projectTask,
            actualCompleteTime: dateFormat(projectTask.actualCompleteTime, 'YYYY-MM-DD')
          };
        })
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';

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
