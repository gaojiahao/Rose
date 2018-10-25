<template>
  <div class="pages cpxq-list-container" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
        <!--<div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div>-->
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
              <span class="duty_crt_man" :class="item.statusClass" v-show="item.biProcessStatus">{{item.biProcessStatus}}</span>
            </p>
            <p class="duty_time">{{item.crtTime | dateFormat('YYYY-MM-DD')}}</p>
          </div>
          <div class="duty_content">
            <div class="content_title">{{item.demandTitle}}</div>
            <div class="content_step vux-1px-b">
              <div>规划: {{item.demandPlan}}</div>
              <div>信心指数: {{item.timeConfidenceIndex}}</div>
            </div>
          </div>
          <div class="order_count">
            <div class="handle_man" v-if="item.handlerName">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
            </div>
            <div class="handle_man">{{item.authorizedTeam}}</div>
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
            name: '标题',
            value: 'demandTitle',
          },
        ],
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
            { fileId, listId } = this.$route.params;
        // 高亮 点击过的数据
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.listData, index, {...item});
        // 新的路由地址
        let newPath = `${path}/${fileId}/${listId}`;
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
      // 状态区分
      setStatus(item) {
        if(item.processStatus.includes('未启动')){
          item.statusClass = 'duty_fall_c';
        }
        else if(item.processStatus.includes('交付完成')){
          item.statusClass = 'duty_done_c';
        }
      },      
      // TODO 获取用户列表
      getList(noReset = false) {
        let filter = [];
        if (this.activeTab) {
          filter.push({
            operator: 'in',
            value: this.activeTab,
            property: 'status'
          })
        }
        if (this.serachVal) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.serachVal,
              property: this.filterProperty,
            },
          ];
        }
        return getList(2335, {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter)
        }).then(({dataCount = 0, tableContent = []}) => {
          // this.$emit('input', false);
          // tableContent.forEach(item => {
          //   this.setStatus(item);
          // });
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
          //判断最近有无新增数据
          let text = '';
          if (noReset && this.activeIndex === 0) {
            if (this.total) {
              text = dataCount - this.total === 0 ? '暂无新数据' : text = `新增${dataCount - this.total}条数据`;
              this.$vux.toast.show({
                text: text,
                position: 'top',
                width: '50%',
                type: "text",
                time: 700
              })
            }
          }
          //列表总数据缓存
          if (this.activeIndex === 0 && this.page === 1) {
            sessionStorage.setItem(this.applyCode, dataCount);
          }
          this.$loading.hide();
        }).catch(e => {
          this.resetScroll();
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
  .cpxq-list-container {
    .list_wrapper {
      height: calc(100% - 1.2rem);
    } 
  }
</style>
