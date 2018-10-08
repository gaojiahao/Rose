<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon  @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="client_ads vux-1px-b" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index" @click='goDetail(item, index)'>
          <div class="job_info ">
            <div class="job_name">{{item.name}}
             <span class="job_status" :class="item.borderClass">{{item.changeStatus}}</span>
            </div>
            <div class="job_type">{{item.changeType}}</div>
          </div>
          <span class="iconfont icon-bianji" @click.stop="goEditJob(item, index)"></span>
        </div>
      </r-scroll>
    </div>
    <div class=" vux-1px-t btn ">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
import listCommon from 'pageMixins/bizListCommon'
import {getJobList} from 'service//Directorys/jobService'
export default {
  data() {
    return {
      listStatus: [
        {name: '全部', status: ''},
        {name: '管理类', status: 'M'},
        {name: '营销类', status: 'Y'},
        {name: '技术类', status: 'J'},
        {name: '专业类', status: 'Z'},
        {name: '操作类', status: 'C'},
      ],
      biStatus:'',
      filterList: [ // 过滤列表
        {
          name: '职位名称',
          value: 'name',
        }
      ],
    }
  },
  mixins: [listCommon],
  methods:{
    //获取销售订单数据
    getList(noReset = false) {
      let filter = [];
      if(this.activeTab.length){
        filter = [{operator: "in", value: this.activeTab, property: "type"}];
      }
      if(this.serachVal){
        filter = [
          ...filter,
          {
            operator: "like",
            value: this.serachVal,
            property: this.filterProperty,
          },
        ];
        if(this.activeTab.length){
          filter[0].attendedOperation = "and";
        }
      }
      return getJobList({
        limit: this.limit,
        page: this.page,
        start: (this.page - 1) * this.limit,
        filter: JSON.stringify(filter),
        sort: JSON.stringify([{ property:"crtTime", direction:"DESC" }])
      }).then(({dataCount = 0, tableContent = []}) => {
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        tableContent.forEach(item => {
          this.setStatus(item);
          switch (item.type) {
            case 'Y':
              item.changeType = '营销类';
              break;
            case 'Z':
              item.changeType = '专业类';
              break;
            case 'J':
              item.changeType = '技术类';
              break;
            case 'C':
              item.changeType = '操作类';
              break;
            case 'M':
              item.changeType = '管理类';
              break;
            
          }
          switch (item.status) {
            case 1:
              item.changeStatus = '使用中';
              item.borderClass = "using"
              break;
            case 2:
              item.changeStatus = '未使用';
              item.borderClass = "no_use"
              break;
            case 3:
              item.changeStatus = '草稿';
              item.borderClass = "draft"
              break;
            case -1:
              item.changeStatus = '停用';
              item.borderClass = "stop_use"
              break;
          }
        });
        this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
        if (!noReset) {
          this.$nextTick(() => {
            this.resetScroll();
          })
        }
        //判断最近有无新增数据
        let text = '';
        if(noReset && this.activeIndex === 0){
          if(this.total){
            text = dataCount - this.total === 0 ? '暂无新数据' : text = `新增${dataCount-this.total}条数据`;
            this.$vux.toast.show({
              text: text,
              position:'top',
              width:'50%',
              type:"text",
              time : 700
            })
          }
        }
        //列表总数据缓存
        if(this.activeIndex === 0 && this.page === 1){
          sessionStorage.setItem(this.applyCode,dataCount);
        }
        this.$loading.hide();
      }).catch(e => {
        this.resetScroll();
      })
    },
    goNextPage(item, index, path) {
      if (this.clickVisited) {
        return
      }
      // 交易号、应用名称等
      let { name } = this.$route.query,
          { fileId, listId } = this.$route.params;
      // 高亮点击的列表
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.listData, index, {...item});
      // 新的路由地址
      let newPath = `${path}/${fileId}/${listId}`;
      setTimeout(() => {
        this.clickVisited = false;
        this.$router.push({
          path : newPath,
          query : { name, id: item.id }
        });
      }, 200);
    },
    goDetail(item, index) {
      this.goNextPage(item, index, '/detail')
    },
    goEditJob(item, index) {
      this.goNextPage(item, index, '/fillform')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./../../scss/bizList.scss";
.client_ads {
      position: relative;
      padding: .06rem .4rem .06rem .08rem;
      transition: background-color 200ms linear;
      &.visited {
        background-color: $list_visited;
      }
      // 编辑
      .icon-bianji {
        right: 0;
        top: 50%;
        width: .35rem;
        display: block;
        font-size: .24rem;
        text-align: center;
        position: absolute;
        transform: translate(0, -50%);
      }
      // 公司信息
      .job_info {
        font-size: .14rem;
        .job_name {
          color: #111;
          font-weight: bold;
          .job_status{
            color:#757575;
            font-size:0.11rem;
            margin-left:0.02rem;
            font-weight: normal;
            padding: 0 0.03rem;
          }
          //使用中
          // .using{
          //   color:#1296db;
          //   border-color: #1296db;
          // }
          // //未使用
          // .no_use{
          //   color:#1afa29;
          //   border-color: #1afa29;
          // }
          // //停用
          // .stop_use{
          //   color:#d81e06;
          //   border-color:#d81e06;
          // }
          // //草稿
          // .draft{
          //   color:#757575;
          // }
        }
        .job_type{
          color:#5077aa;    
        }
      }
      .edit_part {
        top: 0;
        right: 0;
        width: .3rem;
        height: 100%;
        position: absolute;
        background: #4F90F9;
      }
    }

</style>

