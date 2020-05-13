<template>
    <div class="day-performance">
     <div class="page-navigation">
        <div class="goback" @click="goBack()">
            <i class="iconfont icon-back1" ></i>
        </div>
        <div class="groupName body">
            今日绩效明细
        </div>
    </div>
    
      <div class="day-num">
          <span>当日绩效</span>
          <p>{{ total }}</p>
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
       <RScroll 
          :class="{'day-list':true,'day-empty':dayData.length === 0}"
          class="page-body-hasNav" 
          :options="scrollOptions"
          :has-next="hasNext"
          :no-data="false"
      >
          <div 
            class="list-content" 
            v-for="(log,index) of dayData" 
            :key="index"
            @click="gotoForm(log)">
                <img  :src="defaultImg(log)"  />
                <div class="list-content-container">
                    <div class="list-content-container-title">{{ log.title }}</div>
                    <div class="list-content-container-detail">
                        <div>{{ log.effectiveDate|time}}</div>
                         <div>{{ log.performanceType }}</div>
                         <div>{{log.total}}</div>
                    </div>
                </div>
          </div>
          <div 
            class="list-content" 
            v-for="(log,index) of dayData" 
            :key="index"
            @click="gotoForm(log)">
                <img  :src="defaultImg(log)"  />
                <div class="list-content-container">
                    <div class="list-content-container-title">{{ log.title }}</div>
                    <div class="list-content-container-detail">
                        <div>{{ log.effectiveDate|time}}</div>
                         <div>{{ log.performanceType }}</div>
                         <div>{{log.total}}</div>
                    </div>
                </div>
          </div>
          <div class="list-empty" v-if="dayData.length === 0">暂无绩效</div>
      </RScroll>
    </div>
</template>

<script>
import { Datetime,numberComma } from 'vux'
import { getPerformance } from "@/service/myPerformanceService";
import RScroll from "plugins/scroll/RScroll";
export default {
    name:"DayPerformance",
    components:{
       Datetime,
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
           day: "",
           total: 0,
           dayData: []
        }
    },
    filters:{
        time(date){
            date = new Date(date);
            var hour = date.getHours();//获取系统时间
            var minute = date.getMinutes(); //分
            var second = date.getSeconds();//秒

            return `${hour}:${minute}:${second}`
        }
    },
    methods:{
        goBack() {
            this.$router.push({
                path: "/user/myPerformance"
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
      height: 100%;
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
          border-bottom: 0.5px solid #ddd;
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
            background-color: #1a92ec;
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
      .day-list{
          padding: .08rem;
          height: calc(100% - 2rem);
          .list-content{
            padding: .05rem;
            display: flex;
            align-items: center;
            img{
                height: 30px;
                border-radius: .03rem;
            }
            &-container{
                width: 100%;
                padding: 0 .08rem;
                &-title{
                    font-size: 14px;
                }

                &-detail{
                    font-size: 12px;
                    display: flex;
                    width: 100%;
                    justify-content: space-between;
                    color: #999999;
                }
            }
            
        }
      }
  }
</style>