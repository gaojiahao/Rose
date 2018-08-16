<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <!-- 预算明细 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">预算明细</p>
        <group>
          <cell title="预算收入" :value="approval.budgetIncome"></cell>
          <cell title="预算成本" :value="approval.budgetCapital"></cell>
          <cell title="预算费用" :value="approval.budgetCost"></cell>
          <cell title="预算利润" :value="approval.budgetProfit"></cell>
          <cell title="预算利润率" :value="approval.budgetProfitMargin"></cell>
          <cell title="预算开始日期" :value="approval.expectStartDate | timeSplit"></cell>
          <cell title="预算截至日期" :value="approval.expectEndDate | timeSplit"></cell>
        </group>
      </div>

      <!-- 项目明细 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">项目明细</div>
        <div class="mater_list">
          <div class="each_mater">
            <div class="each_mater_wrapper ">
              <div class="mater_main">
                <!-- 项目名称 -->
                <div class="mater_name">
                  <span class="whiNum">项目名称</span>
                 {{approval.projectName}}
                </div>
                <!-- 项目基本信息 -->
                <div class="mater_info">
                  <div class="withColor">
                    <!-- 项目类型 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_code">
                        <span class="title">项目类型</span>
                        <span class="num">{{approval.projectType}}</span>
                      </div>
                    </div>
                    <!-- 项目经理 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_spec">
                        <span class="title">项目经理</span>
                        <span class="num">{{approval.projectManager}}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class='mater_other'>
                  <div class='mater_reimb'>
                    <!-- 手机号码 -->
                     <div class="price">
                      <span class="title">手机号码: </span>
                      <span class="content">
                        {{approval.phoneNumber}}
                      </span>
                    </div>
                    <!-- 项目说明 -->
                    <div class="reason">
                      <span class="title">项目说明: </span>
                      <span class="content">
                        {{approval.comment}}
                      </span>
                    </div>
                    <!-- 项目备注 -->
                    <div class="reason">
                      <span class="title">项目备注: </span>
                      <span class="content">
                        {{comment.biComment || '无'}}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import {Group, Cell, dateFormat,} from 'vux'
  import {getSOList,} from 'service/detailService'
  import detailCommon from 'components/mixins/detailCommon'
  import {findProjectTask,findProjectApproval} from 'service/projectService'

  export default {
    data() {
      return {
        approval:'',
        comment:'',
      }
    },
    filters:{
      timeSplit(val){
        return val?val.split(' ')[0]:'';
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
        return findProjectApproval(transCode).then(({formData = {}}) => {
          this.approval = formData.approval;
          this.comment = formData.comment;
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
  .materiel_list .mater_list .each_mater .each_mater_wrapper .mater_main{
    margin-left: 0;
  }
</style>
