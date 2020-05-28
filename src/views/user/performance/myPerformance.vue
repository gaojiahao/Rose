<template>

<div class="page-hasTab me">
    <div class="page-navigation">
        <div class="nav-hd">
            我
        </div>
    </div>
      <RScroll 
          class="page-body-hasNav" 
          :options="scrollOptions"
          :has-next="hasNext"
          :no-data="false"
      >
      <div class="my-performance">
      <div class="my-info" >
        <div class="my-info-entity" >
          <div>{{ currentUser.entityName}}</div>
          <img  :src="getDefaultImg()" />
        </div>

        <div class="my-info-job">
           <p class="my-info-job-nickname">{{ currentUser.name }}</p>
            <p class="my-info-job-jobs">{{ roles.join(',') }}</p>
        </div>
      </div>

      <group>
        <div class="time-study vux-1px-b" >
          <div>工时统计</div>
        <div class="time-study-btns" @click="onTimeChange">
            <div id="week"
            :class="{'btn-color':isCurrentBtn==='week'}">
            本周
          </div>
          <div 
             
            id="month"
            :class="{'btn-color':isCurrentBtn==='month'}">
            本月
          </div>
          <div 
             
            id="year"
            :class="{'btn-color':isCurrentBtn==='year'}">
            本季度
          </div>
        </div>
        </div>
       <div class="log-lours" id="logHours"></div>
      </group>
      </div>
        <group>
              <cell title="今日绩效"  :value="todayPerformance" :is-loading="todayPerformance==undefined" is-link @click.native="onDayPerformanceClick"  />
              <cell title="今年累计绩效"  :value="yearPerformance" :is-loading="yearPerformance==undefined"  is-link @click.native="onYearPerformanceClick" />
          </group>
          <group>
              <!-- <cell title="主题设置" is-link link="/themesetting" /> -->
              <cell title="退出登录"  @click.native="loginOut" />
          </group>
      </RScroll>
  </div>
    
</template>

<script>
import { XButton,numberComma,dateFormat } from 'vux'
import { getMyJobLogCountInfo,
         getTodayPerformance,
         getYearPerformance } 
from "@/service/myPerformanceService";
import { initWebContext } from 'service/commonService'
import { Group, Cell } from 'vux'
import tokenService from "service/tokenService";
import RScroll from "plugins/scroll/RScroll";
const echarts = require('echarts');
export default {
    name:"MyPerformance",
    components:{
       XButton,
          Cell,
        Group,
        RScroll
    },
    data(){
        return {
            scrollOptions:{
                click: true,
                pullUpLoad: false,//上拉刷新
                pullDownRefresh: false //下拉刷新
            },
            hasNext:false,
           isCurrentBtn: "week",
           time: "本周",
           todayPerformance: undefined,
           yearPerformance: undefined,
           Xdata: [],
           Ydata: [],
           currentUser: {},
           roles: []
        }
    },
    methods:{
        // 获取默认图片
        getDefaultImg() {
          let url = require('assets/contact_default02.png');
          if(this.currentUser.photo){
            url = this.currentUser.photo
          }
          return url;
        },
        onTimeChange() {
          let currentId = event.target.id;
          if(this.isCurrentBtn === currentId) return;
          this.isCurrentBtn = currentId;
          this.time = event.target && event.target.innerText;
          this.getMyLog();
        },
        createLogHoursTrend() {
          let myChart = echarts.init(document.getElementById('logHours'));
          myChart.setOption({
              title: {
                text: ""
              },
              tooltip: {},
              xAxis: {
                  type: 'category',
                  data: this.Xdata
              },
              yAxis: {
                type: 'value'
              },
              series: [{
                  type: 'line',
                  data: this.Ydata
              }]
          });
        },
        onDayPerformanceClick() {
          let today = dateFormat(new Date(), 'YYYY-MM-DD');
          this.$router.push({
            path: "/user/dayPerformance/" + today
          })
        },
        onYearPerformanceClick() {
          let year = dateFormat(new Date(), 'YYYY');
          this.$router.push({
            path: "/user/yearPerformance/" + year
          })
        },
        getMyLog() {
          this.Xdata = [];
          this.Ydata = [];
          getMyJobLogCountInfo(this.time).then(res => {
            res.tableContent.forEach(log => {
              this.Xdata.push(log.taskDate);
              this.Ydata.push(log.logDeclarationHours);
              this.createLogHoursTrend();
            })
          })
        },
        getDayPerformances() {
          getTodayPerformance().then(res => {
            if(res.tableContent[0] && res.tableContent[0].amount){
              this.todayPerformance = numberComma(res.tableContent[0].amount.toFixed(2));
            }else{
              this.todayPerformance = 0;
            }
          })
        },
        getYearPerformances() {
          getYearPerformance().then(res => {
            if(res.tableContent[0] && res.tableContent[0].amount){
              this.yearPerformance = numberComma(res.tableContent[0].amount.toFixed(2));
            }else{
              this.yearPerformance= 0;
            }
          })
        },
         loginOut(){
            tokenService.clean();
            this.$router.replace('/login');
        }
    },
    mounted(){
        this.getMyLog()
    },
    created() {
      this.getDayPerformances()
      this.getYearPerformances()
      initWebContext().then((WebContext) => {
          this.currentUser = WebContext.currentUser
          this.currentUser.isSysRoleList.forEach(item => {
            this.roles.push(item.name)
          })
      })
    }
}
</script>

<style lang="less" scoped>
  .my-performance {
    // height: 100%;
    // width: 100%;
    // position: relative;
    .log-lours {
      
        height: 3rem;
        background-color: white;
        width: 100%;
    }
    .time-study{
     
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      padding: .10rem .0;
      width: 100%;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      justify-content: space-between;
      div{
        padding: 0 .15rem;
      }
      .btn-color{
        background-color: #3296FA;
        color: #fff;
      }
      &-btns{
        font-size: 14px;
        display: flex;
        div{
          margin: 0 .05rem;
          padding: .02rem .12rem;
          border-radius: .2rem;
        }
      }
    }
    .today-performance, .year-performance{
        display: flex;
        justify-content: space-between;
        padding: .1rem;
        border-bottom: 1px solid #eee;
        b{
          color: #2e7cca;
        }
    }
    .today-performance:hover{
      background-color: #eee;
    }
    .year-performance:hover{
      background-color: #eee;
    }
    .my-header{
      text-align: center;
      height: .5rem;
      border-bottom: 1px solid #eee;
      line-height: .5rem;
    }
    .my-info{
      background-color: white;
      margin: .1rem .1rem 0rem .1rem;
      padding: .1rem;
      border-radius: .02rem;
      border:0.5px solid #ddd;
      &-entity{
        display: flex;
        justify-content: space-between;
        color: #999999;
        img{
          height: .65rem;
          border-radius: .05rem;
        }
      }
      &-job{
        b{
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
        &-nickname{
          font-size: 20px;
        }
        &-jobs{
          width: 100%;
          overflow: hidden;
          -o-text-overflow: ellipsis;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
          color: #999999;
        }
      }
    }
  }
</style>