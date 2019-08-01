<template>
  <!--任务日志列表-->
  <div class="task_container">
      <div class="task_list" v-if="$route.name !== 'TASKLOG'">
        <div class="task_list_sum">
            <span>总工时：<b>{{ logHours }}</b></span>
            <span :style="{marginLeft:'15px'}">总成本：<b>{{ logCosts }}</b></span>
        </div>
        <r-scroll
            class="pop-list-container"
            :options="scrollOptions"
            :has-next="hasNext"
            :no-data="!hasNext && !logList.length"
            @on-pulling-up="onPullingUp"
            @on-pulling-down="onPullingDown"
            ref="bScroll">
          <div class="task_list_content">
              <div class="list_container" v-for="(list,index) of logList" :key="index">
                  <div class="list_left">
                      <img :src="list.photo" @error="getDefaultImg(list)">
                  </div>
                  <div class="list_right">
                      <div class="list_right_title">
                          <check-icon 
                              type="plain" 
                              @click.native="handlerChangeLogStatus(list)" 
                              :value.sync="list.logStatus==='已办'?true:false">
                          </check-icon>
                          <b>{{ list.logTitle }}</b>
                      </div>
                      <div class="list_right_detail">
                          <b class="detail_name">{{ list.handlerName?list.handlerName:'未知' }}</b>
                          <span class="detail_date">{{ list.taskDate }}</span>
                          <span class="detail_hour">{{ list.logDeclarationHours }}小时</span>
                          <span class="detail_type">{{ list.logType }}</span>
                      </div>
                      <div class="list_right_comment">
                          {{ list.comment }}
                      </div>
                  </div>
              </div>
              <div class="empty_data" v-if="logList.length===0">
                <span class="icon icon-empty"></span>
              </div>
          </div>
        </r-scroll>
      </div>
      <div class="task_footer" v-if="$route.name !== 'TASKLOG'">
        <x-button plain  @click.native="addTaskLog">
          <span slot="default">
            <span class="icon icon-add"></span>
            新增
          </span>
        </x-button>
      </div>
      <router-view></router-view>
  </div>
  
</template>

<script>
import { CheckIcon, numberComma, XButton } from 'vux'

import RScroll from 'plugins/scroll/RScroll'

import { getTaskLogList, updateLogStatus } from 'service/projectService'
export default {
  data() {
    return {
      logHours: 0,
      logCosts: 0,
      logStatus: true,
      hasNext: true,
      pageSize: 10,
      currentPage: 1,
      total: 0,
      logList: [],
      scrollOptions: {
        click: true,
        pullUpLoad: true,
        pullDownRefresh: true
      },
    }
  },
  components: { CheckIcon, XButton, RScroll },
  watch: {
    $route(to, from) {
        this.getLogList();
    }
  },
  methods: {
    getLogList(isDown) {
        this.$loading.show();
        getTaskLogList(this.$route.query.transCode,this.currentPage,this.pageSize).then(res => {
            this.total = res.dataCount;
            this.hasNext = res.dataCount > (this.currentPage - 1) * this.pageSize + res.tableContent.length;
            this.logList = this.currentPage === 1 ? res.tableContent : [...this.logList,...res.tableContent];
            this.logCosts = res.logCosts && numberComma(res.logCosts);
            this.logHours = res.logHours;
            this.$loading.hide();
            if(isDown){
              let text = "";
              if (this.total) {
                text = res.dataCount - this.total === 0 ? '暂无新数据' : text = `新增${res.dataCount - this.total}条数据`;
                this.$vux.toast.show({
                  text: text,
                  position: 'top',
                  width: '50%',
                  type: "text",
                  time: 700
                })
              }
              this.$nextTick(() => {
                this.$refs.bScroll.finishPullDown().then(() => {
                  this.$refs.bScroll.finishPullUp();
                });
              })
            }
        })
    },
    // 上拉加载
    onPullingUp() {
      this.currentPage++;
      this.getLogList();
    },
    // 下拉刷新
    onPullingDown() {
      this.currentPage = 1;
      this.getLogList(true);
    },
    /**
   * 更新日志状态
   */
    handlerChangeLogStatus(log){
      log.logStatus === '已办' ? log.logStatus = '待办' : log.logStatus = '已办';
      if(new Date(log.taskDate) > new Date() && log.logStatus === '已办'){
        this.$vux.confirm.show({
            title: '提示',
            content: '如果更新为已办，日志的日期将自动更新为今天!',
            onConfirm : () => {
                this.handlerUpdateLogStatus(log);
            }
        })
      }else{
        this.handlerUpdateLogStatus(log);
      }
    },
    handlerUpdateLogStatus(log){
      let { taskDate } = log;
      if(log.logStatus === '已办' && new Date(log.taskDate) > new Date()){
        taskDate = this.formatDate(new Date());
      }
      updateLogStatus(log.jobLogId,log.transCode,log.logStatus,taskDate).then(res=>{
        if(res.success){
          this.$vux.toast.text(res.message);
        }else{
          this.$vux.alert.show({
            title: "错误",
            content: res.message
          });
        }
      })
    },
    //添加任务日志
    addTaskLog() {
      this.$router.replace({
        path: '/taskLog/add',
        name: 'TASKLOG',
        params: {
          transCode: this.$route.query.transCode,
          listId: this.$route.query.listId
        }
      })
    },
    // 获取 默认图片
    getDefaultImg(item) {
        let url = require("assets/ava02.png");
        item && (item.photo = url);
        return url;
    },
      //格式化日期方法
    formatDate(currentDate) {
      let date = new Date(currentDate),
          year = date.getFullYear(),
          month = date.getMonth() + 1,
          day = date.getDate();
      if (month >= 1 && month <= 9) {
        month = `0${month}`;
      }
      if (day >= 1 && day <= 9) {
        day = `0${day}`;
      }

      return `${year}-${month}-${day}`;
    }
  },
  created() {
      this.getLogList();
  }
}
</script>

<style lang='scss' scoped>
  .task_list{
      padding: .1rem .1rem;
      background-color: #fff;
      margin: .1rem;
      height: 100%;
      .pop-list-container{
        height: calc(100% - 100px);
        box-sizing: border-box;
        position: relative;
      }
      &_sum{
          border-bottom: 1px solid #e8e8e8;
          padding: .05rem;
      }
      &_content{
          box-sizing: border-box;
          .empty_data{
            text-align: center;
            padding: 1rem 0rem;
            .icon {
              display: inline-block;
              width: .2rem;
              height: .19rem;
            }
            .icon-empty {
              width: 1rem;
              height: 1rem;
            }
          }
          .list_container{
              display: flex;
              padding-bottom: .1rem;
              .list_left{
                  flex: 1;
                  width: 0.5rem;
                  height: 0.5rem;
                  margin-right: 0.12rem;
                  margin-top: .05rem;
                  display: inline-block;
                  img {
                    border-radius: 50%;
                    width: 90%;
                    height: 100%;
                  }
              }
              .list_right{
                  flex: 5;
                  margin-top: .08rem;
                  &_detail{
                      padding: .08rem 0rem;
                      .detail_name{
                        color: #999;
                      }
                      span{
                        margin-left: .05rem;
                        color: #999;
                      }
                  }
                  &_comment{
                      color: #999;
                  }
              }
          }
          .list_container:last-child{
              border: none;
          }
      }
  }
  .task_footer{
    background-color: #fff;
    position: fixed;
    bottom: 0;
    width: 90%;
    padding: .1rem;
    margin: .1rem .1rem 0rem .1rem;
    .icon-add{
      width: .2rem;
      height: .2rem;
      display: inline-block;
      margin-bottom: -.03rem;
      margin-right: .05rem;
    }
    .weui-btn_plain-default{
      color: #4CA3FB;
      border: 1px solid #4CA3FB;
    }
  }
  .task_container{
    z-index: 1;
    height: 100%;
    overflow: auto;
    position:relative;
    bottom: .7rem;
    top: 0rem;
    background: #f8f8f8;
    -webkit-overflow-scrolling: touch;
  }
</style>
