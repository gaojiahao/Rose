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
              <datetime 
                v-model="day" 
                @on-change="onDateChange"
                :display-format="displayFromat">
              </datetime>
          </div>
          <div class="after-day" @click="onAfterDayClick">
              <span>后一天</span>
              <span class="icon icon-goto"></span>
          </div>
      </div>
      <div class="day-num">
          <span>当日绩效</span>
          <p>{{ total }}</p>
      </div>
      <div :class="{'day-list':true,'day-empty':dayData.length === 0}">
          <div 
            class="list-content" 
            v-for="(log,index) of dayData" 
            :key="index"
            @click="gotoForm(log)">
            <div class="content-left">
                <img :src="defaultImg(log)" />
            </div>
            <div class="content-center">
                <div class="app-name">{{ log.title }}</div>
                <div class="log-desc">
                    <span>{{ log.effectiveDate }}</span>
                    <span style="margin-left:.05rem;">{{ log.performanceType }}</span>
                </div>
                <div class="log-title">{{ log.comment }}</div>
            </div>
            <div class="content-right">{{ log.total }}</div>
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
           total: 0,
           dayData: []
        }
    },
    methods:{
        goBack() {
            this.$router.push({
                path: "/performance/myPerformance"
            })
        },
        gotoForm(log) {
            window.location.href = `/Hermes/detail/2750a13d-295d-4776-9673-290c51bfc568/0?name=日志任务&folder=project&fileName=RWRZ&transCode=${log.transCode}`;
        },
        defaultImg(log) {
            let url = require('assets/contact_default02.png');
            if(log.icon){
                url = log.icon;
            }
            return url;
        },
        displayFromat(value) {
          let date = new Date(value);
          return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
            this.$loading.show();
            getPerformance('day',day).then(res => {
                let total = 0;
                res.tableContent.forEach(log => {
                    total += log.total;
                    log.total = numberComma(log.total.toFixed(2));
                })
                this.total = numberComma(total.toFixed(2));
                this.dayData = res.tableContent;
                this.$loading.hide();
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