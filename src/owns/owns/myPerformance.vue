<template>
    <div class="my-performance">
      <div class="my-header">
        <span>我</span>
      </div>
      <div class="my-info">
        <div class="info-left">
          <p class="info-left-company">{{ currentUser.entityName}}</p>
          <div class="info-left-name">
            <p>{{ currentUser.name }}</p>
            <span>{{ roles.join(',') }}</span>
          </div>
        </div>
        <div class="info-right">
          <img :src="getDefaultImg()" />
        </div>
      </div>
      <div class="log-btn" @click="onTimeChange">
        <x-button 
          mini 
          id="week"
          :class="{'btn-color':isCurrentBtn==='week'}">
          本周
        </x-button>
        <x-button 
          mini 
          id="month"
          :class="{'btn-color':isCurrentBtn==='month'}">
          本月
        </x-button>
        <x-button 
          mini 
          id="year"
          :class="{'btn-color':isCurrentBtn==='year'}">
          本季度
        </x-button>
      </div>
      <div class="log-lours" id="logHours"></div>
      <div class="today-performance" @click="onDayPerformanceClick">
        <span>今日绩效</span>
        <b>{{ todayPerformance }}</b>
      </div>
      <div class="year-performance" @click="onYearPerformanceClick">
        <span>今年累计绩效</span>
        <b>{{ yearPerformance }}</b>
      </div>
    </div>
</template>

<script>
import { XButton,numberComma,dateFormat } from 'vux'
import { getMyJobLogCountInfo,
         getTodayPerformance,
         getYearPerformance } 
from "@/service/myPerformanceService";
import WebContext from 'service/commonService'
import { initWebContext } from 'service/commonService'
const echarts = require('echarts');
export default {
    name:"MyPerformance",
    components:{
       XButton
    },
    data(){
        return {
           isCurrentBtn: "week",
           time: "本周",
           todayPerformance: 0,
           yearPerformance: 0,
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
            path: "/performance/dayPerformance/" + today
          })
        },
        onYearPerformanceClick() {

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
            this.todayPerformance = numberComma(res.tableContent[0].amount.toFixed(2));
          })
        },
        getYearPerformances() {
          getYearPerformance().then(res => {
            this.yearPerformance = numberComma(res.tableContent[0].amount.toFixed(2));
          })
        }
    },
    mounted(){
        this.getMyLog()
    },
    created() {
      this.getDayPerformances()
      this.getYearPerformances()
      initWebContext().then(() => {
          this.currentUser = WebContext.WebContext.currentUser
          this.currentUser.isSysRoleList.forEach(item => {
            this.roles.push(item.name)
          })
      })
    }
}
</script>

<style lang="less" scoped>
  .my-performance {
    height: 100%;
    width: 100%;
    position: relative;
    .log-lours {
        height: 40%;
        width: 100%;
    }
    .log-btn{
      text-align: right;
      margin-right: .1rem;
      .btn-color{
        background-color: #2e7cca;
        color: #fff;
      }
    }
    .today-performance, .year-performance{
        display: flex;
        justify-content: space-between;
        padding: .1rem;
        border-bottom: 1px solid #eee;
        b{
          color: #2e7cca;
          font-size: .2rem;
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
      padding: .1rem;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
      .info-right{
        img{
          width: 1rem;
          height: 1rem;
        }
      }
      .info-left{
        &-company{
          font-size: .17rem;
        }
        &-name{
          margin-top: .1rem;
          p{
            font-size: .2rem;
          }
          span{
            color: #999;
          }
        }
      }
    }
  }
</style>