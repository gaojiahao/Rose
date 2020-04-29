<template>
    <div class="day-performance">
      <div class="day-header">
          <div class="back" @click="goBack">
              <span class="icon icon-performance-back"></span>
              <span>我</span>
          </div>
          <div class="title">今日绩效明细</div>
      </div>
      <div class="day-time">
          <div class="brfore-day" @click="onBeforeDayClick">
              <span class="icon icon-performance-back"></span>
              <span>前一天</span>
          </div>
          <div class="day-select">
              <datetime v-model="day" @on-change="onDateChange"></datetime>
          </div>
          <div class="after-day" @click="onAfterDayClick">
              <span>后一天</span>
              <span class="icon icon-goto"></span>
          </div>
      </div>
      <div class="day-num">
          <span>当日绩效</span>
          <p>56321.23</p>
      </div>
      <div :class="{'day-list':true,'day-empty':dayData.length === 0}">
          <div class="list-content" v-for="(log,index) of dayData" :key="index">
              <div class="content-left">
                  <img :src="defaultImg()" />
              </div>
              <div class="content-center">
                  <div class="app-name">日志任务</div>
                  <div class="log-desc">
                      <span>{{ log.effectiveDate }}</span>
                      <span style="margin-left:.05rem;">{{ log.performanceType }}</span>
                  </div>
                  <div class="log-title">{{ log.comment }}</div>
              </div>
              <div class="content-right">{{ log.amount }}</div>
          </div>
          <div class="list-empty" v-if="dayData.length === 0">暂无绩效</div>
      </div>
    </div>
</template>

<script>
import { Datetime,numberComma } from 'vux'
import { getPerformance } from "@/service/myPerformanceService";
export default {
    name:"DayPerformance",
    components:{
       Datetime
    },
    data(){
        return {
           day: "",
           dayData: []
        }
    },
    methods:{
        goBack() {
            this.$router.push({
                path: "/performance/myPerformance"
            })
        },
        defaultImg() {
            let url = require('assets/contact_default02.png');
            return url;
        },
        onDateChange(value) {
            this.getDayPerformance(value);
        },
        onBeforeDayClick() {
            let day = this.createDate(-1);
            this.day = day;
            this.getDayPerformance(day);
        },
        onAfterDayClick() {
            let day = this.createDate(1);
            this.day = day;
            this.getDayPerformance(day);
        },
        createDate(num) {
            let date = new Date(this.day);
            date.setDate(date.getDate() + num);
            let day = date.getDate(),
                month = date.getMonth(),
                year = date.getFullYear();
            month = month > 9 ? (month + 1) : "0" + (month + 1);
            day = day > 9 ? day : "0" + day;

            return `${year}-${month}-${day}`;
        },
        getDayPerformance(value) {
            let day = value || this.day;
            getPerformance('day',day).then(res => {
                res.tableContent.forEach(log => {
                    log.amount = numberComma(log.amount.toFixed(2));
                })
                this.dayData = res.tableContent;
            })
        }
    },
    created() {
      this.day = this.$route.params.day;
      this.getDayPerformance();
    }
}
</script>

<style lang="less" scoped>
  .day-performance{
      .day-header{
          height: .5rem;
          line-height: .5rem;
          display: flex;
          text-align: center;
          border-bottom: 1px solid #eee;
          .back{
              display: flex;
              align-items: center;
              .icon-performance-back{
                  width: .18rem;
                  height: .18rem;
                  display: inline-block;
              }
          }
          .title{
              flex: 1;
          }
      }
      .day-time{
          height: .5rem;
          line-height: .5rem;
          display: flex;
          justify-content: space-between;
          .brfore-day{
              display: flex;
              align-items: center;
              .icon-performance-back{
                  width: .18rem;
                  height: .18rem;
                  display: inline-block;
              }
          }
          .after-day{
              display: flex;
              align-items: center;
              .icon-goto{
                  width: .15rem;
                  height: .15rem;
                  display: inline-block;
              }
          }
      }
      .day-num{
            background-color: #2e7cca;
            color: #fff;
            padding: .2rem;
            text-align: center;
            p{
                font-size: .25rem;
                font-weight: bold;
            }
      }
      .day-empty{
        text-align: center;
        .list-empty{
            margin-top: 1rem;
            color: #999;
            font-weight: bold;
            font-size: .2rem;
        }
      }
      .list-content{
          padding: .05rem;
          display: flex;
          align-items: center;
          .content-left{
              img{
                  width: .7rem;
                  height: .7rem;
              }
          }
          .content-center{
                margin-left: .05rem;
                width: 62%;
                .log-title{
                    width: 2.5rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .log-desc{
                    width: 2.3rem;
                }
          }
          .content-right{
              font-weight: bold;
              word-break: break-all;
          }
      }
  }
</style>