<template>
    <div class="day-performance">
            <div class="day-num">
                <span>当日绩效</span>
                <p>{{ total }}</p>
            </div>
        <div class="day-time">
          <div class="brfore-day" @click="onBeforeDayClick">
              <span class="icon icon-performance-back"></span>
              <span>前一天</span>
          </div>
          <group class="day-select">
              <datetime 
                v-model="day" 
                @on-change="onDateChange"
                :display-format="displayFromat">
                <span>
                    <span style="color:#999;">{{ displayDay }}</span>
                    <span class="iconfont icon-riqi"></span>
                </span>
              </datetime>
          </group>
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
                         <div class="list-content-container-detail-total">{{log.total}}</div>
                    </div>
                </div>
          </div>
          <div class="list-empty" v-if="dayData.length === 0">暂无绩效</div>
      </RScroll>
    </div>
</template>

<script>
import { Datetime,Group,numberComma } from 'vux'
import { getPerformance } from "@/service/myPerformanceService";
import RScroll from "plugins/scroll/RScroll";
export default {
    name:"DayPerformance",
    components:{
       Datetime,
       RScroll,
       Group
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
    computed: {
      displayDay: function() {
        let date = new Date(this.day);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
        gotoForm(item) {
            let path = `/detail/${item.listId}/0`;
            this.$router.push({
                path,
                query: { 
                transCode:item.transCode
                }
            })
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
        },
        onAfterDayClick() {
            let day = this.createDate(1);
            this.day = day;
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

<style lang="scss" scoped>
  .day-performance{
        height: 100%;
        overflow: hidden;
  }
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
        height: 0.5rem;
        line-height: 0.5rem;
        display: flex;
        justify-content: space-between;
        background-color: #eee;
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
        .day-select{
        .icon-riqi{
            margin-right: .02rem;
        }
        }
        .day-select /deep/ .weui-cells{
        background-color: transparent;
        margin-top: .77em !important;
        }
        .day-select /deep/ .weui-cell{
        padding: 0px;
        }
        .day-select /deep/ .weui-cells:after{
        border: none;
        }
        .day-select /deep/ .weui-cells:before{
        border: none;
        }
        .day-select /deep/ .weui-cell_access .weui-cell__ft:after{
        display: none;
        }
    }
    .day-num{
        background-color: #1a92ec;
        color: #fff;
        text-align: center;
        height: 0.9rem;
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
        height: calc(100% - 1.49rem);
        background-color: white;
        overflow: hidden;
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

                &-total{
                    color: black;
                    font-size: 14px;
                    font-weight: 600;
                }
            }
        }
        
    }
    }
</style>