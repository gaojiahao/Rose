<template>
  <div class="pages cpxq-list-container" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :view-id="listViewID" ref="sort"></r-sort>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="each_duty" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index"
             @click='goDetail(item, index)'>
          <!-- 订单编号, 时间 -->
           <div class="duty_top">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man" v-if="item.processStatus">{{item.processStatus}}</span>
            </p>
            <span class="duty_status" :class="item.statusClass">{{item.statusName}}</span>
            <i class="iconfont" :class="item.whichIcon"></i>
          </div>
          <div class="duty_content">
            <div class="content_title">{{item.turnoverName}}</div>
            <div class="content_step vux-1px-b">
              <div>部门: {{item.turnoverDepartMent}}</div>
              <div>岗位: {{item.turnoverPost}}</div>
            </div>
          </div>
          <div class="order_count">
            <div class="handle_man" v-if="item.handlerName">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import {getAllUsers} from 'service/Directorys/userService'
  import {getList} from 'service/commonService'
  import listCommon from 'pageMixins/bizListCommon'
  // 映射表引入
  import Apps from '@/home/pages/apps/bizApp/maps/Apps'

  export default {
    name: 'CPXQ_List',
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        filterList: [ // 过滤列表
          {
            name: '经办人',
            value: 'handlerName',
          },{
            name: '交易号',
            value: 'transCode',
          }, {
            name: '员工',
            value: 'profileName',
          },
        ],
        listViewID: 2374
      }
    },
    mixins: [listCommon],
    methods: {
      // TODO 页面跳转
      pathChange(item, index, path) {
        if (this.clickVisited) {
          return
        }
        // 交易号、应用名称等
        let { transCode } = item,
            { name } = this.$route.query,
            { folder, fileName } = this.$route.params;
        // 高亮 点击过的数据
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.listData, index, {...item});
        // 新的路由地址
        let newPath = `${path}/${folder}/${fileName}`;
        // 等待动画结束后跳转
        setTimeout(() => {
          this.clickVisited = false;
          this.$router.push({
            path: newPath,
            query: { name, transCode }
          })
        }, 200)
      },
      // TODO 跳转到详情
      goDetail(item, index) {
        this.pathChange(item, index, `/detail`);
      },
      // TODO 跳转到编辑
      goUserEdit(item, index) {
        this.pathChange(item, index, `/fillform`);
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
  .cpxq-list-container {
    .list_wrapper {
      height: calc(100% - 1.64rem);
      .each_duty{
        overflow: hidden;
      }
      .icon-yishengxiao {
        top: 0;
        right: 10px;
        font-size: .55rem;
        color: #53d397;
        position: absolute;
      }
      .duty_status {
        float: right;
        font-weight: bold;
      }
      .duty_done_c {
        color: #53d397;
        &:before {
          border-right: .04rem solid #53d397;
        }
      }
      .duty_doing_c {
        color: #5077aa;
        &:before {
          border-right: .04rem solid #5077aa;
        }
      }
      .duty_fall_c {
        color: #474a56;
        &:before {
          border-right: .04rem solid #474a56;
        }
      }
    }
  }
</style>
