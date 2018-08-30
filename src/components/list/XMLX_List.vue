<template>
  <div class="pages xmlx-list-container" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search="searchList"></searchIcon>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="each_duty" v-for="(item, index) in listData" :key="index" @click='goDetail(item.transCode)'>
          <!-- 订单编号, 时间 -->
          <div class="duty_top">
            <p class="duty_code">{{item.transCode}}</p>
            <p class="duty_time">{{item.effectiveTime | dateFormat('YYYY-MM-DD')}}</p>
          </div>
          <div class="project_name">
            {{item.projectName}}
          </div>
          <!-- 项目立项经办人 -->
          <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增一个项目立项</div>
    </div>
  </div>
</template>

<script>
  import {getList} from 'service/commonService'
  import listCommon from './../mixins/bizListCommon'

  export default {
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
      }
    },
    mixins: [listCommon],
    methods: {
      goDetail(transCode) {
        let {code} = this.$route.params;
        this.$router.push({
          path: `/detail/${code}`,
          query: {
            transCode: transCode
          }
        })
      },
      getList(noReset = false) {
        let filter = [];

        if (this.serachVal) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.serachVal,
              property: 'transCode',
              attendedOperation: 'or'
            },
            {
              operator: 'like',
              value: this.serachVal,
              property: 'handlerName',
            }
          ];
        }

        return getList(2301, {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter)
        }).then(({dataCount = 0, tableContent = []}) => {
          this.$emit('input', false);
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
          this.$loading.hide();
        }).catch(e => {
          this.resetScroll();
        })
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizList';

  .xmlx-list-container {
    .list_wrapper {
      height: calc(100% - .4rem);
    }
    .project_name {
      padding: 0 .1rem;
      line-height: .24rem;
    }
  }
</style>
