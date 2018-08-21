<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">报销人</p>
        <p class="mode">{{orderInfo.creatorName }}</p>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">创建时间</p>
        <p class="mode">{{orderInfo.crtTime}}</p>
      </div>
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">费用列表</div>
        <div class="mater_list">
          <div class="each_mater vux-1px-b" v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
            <div class="each_mater_wrapper">
              <div class="mater_main">
                <!-- 物料名称 -->
                <div class="mater_name">
                  <span class="whiNum">#{{index + 1}}</span>
                  {{item.costName_expCode}}
                </div>
                <!-- 物料基本信息 -->
                <div class="mater_info">
                  <!-- 物料编码、规格 -->
                  <div class="withColor">
                    <!-- 物料编码 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_code">
                        <span class="title">编码</span>
                        <span class="num">{{item.expCode}}</span>
                      </div>
                    </div>
                    <!-- 物料规格 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_spec">
                        <span class="title">类型</span>
                        <span class="num">{{item.costType_expCode || '无'}}</span>
                      </div>
                    </div>
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_sub">
                        <span class="title">科目</span>
                        <span class="num">{{item.expSubject || '无'}}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class='mater_other'>
                  <div class='mater_reimb'>
                    <!-- 报销金额 -->
                    <div class="price">
                      <span class="title">报销金额: </span>
                      <span class="content">
                        <span style="fontSize:.12rem;">￥</span>{{item.tdAmount | numberComma(3)}}
                      </span>
                    </div>
                    <!-- 报销事由 -->
                    <div class="reason">
                      <span class="title">报销事由: </span>
                      <span class="content">{{item.expCause}}</span>
                    </div>
                  </div>
                </div>

                <div class='mater_other'>
                </div>
              </div>
            </div>
          </div>
          <!-- 金额合计栏 -->
          <div class="price_list">
            <div class='title'><span>合计</span></div>
            <div class="num"><span style="fontSize:.12rem;">￥</span>{{count | numberComma(3)}}</div>
          </div>
        </div>
      </div>
      <!-- 审批操作 -->
    </div>
  </div>
</template>

<script>
// vux组件引入
import { dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件引入
import workFlow from 'components/workFlow'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      orderInfo: {},      // 表单内容
      formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70'
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow,
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
              onHide:()=>{
              this.$router.back();
            }
          });
          return;
        }
        // 获取合计
        let {dataSet} = data.formData.order;
        for (let val of dataSet) {
          this.count += val.tdAmount * 100;
        }
        this.count = this.count / 100;
        data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = data.formData;
        this.workFlowInfoHandler();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';
  .materiel_list
    .mater_list
      .each_mater
        .each_mater_wrapper
          .mater_main {
            width: 100%;
            max-width: inherit;
          }
</style>
