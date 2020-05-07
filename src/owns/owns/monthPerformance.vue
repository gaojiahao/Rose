<template>
    <div class="month-performance">
      <div class="month-header">
          <div class="back" @click="goBack">
              <span class="icon icon-performance-back"></span>
              <span>我</span>
          </div>
          <div class="title">月累计绩效明细</div>
      </div>
      <div class="month-num">
          <span>累计绩效</span>
          <p>{{ total }}</p>
      </div>
      <div class="month-table">
        <div class="table-header">
          <div class="brfore-month" @click="onBeforeMonthClick">
              <span class="icon icon-performance-back"></span>
              <span>{{ beforeMonth }}月</span>
          </div>
          <div class="month-select">
              <datetime 
                v-model="month" 
                @on-change="onDateChange" 
                format="YYYY-MM"
                :display-format="displayFromat">
              </datetime>
          </div>
          <div class="after-month" @click="onAfterMonthClick">
            <span>{{ afterMonth }}月</span>
            <span class="icon icon-goto"></span>
          </div>
        </div>
        <div class="table-sum">
          <span>合计</span>
          <b>{{ total }}</b>
        </div>
        <div class="table-content">
          <div class="table-list" v-for="(item,index) of monthData" :key="index">
              <div class="list-left">
                  <div class="left-time">{{new Date(item.effectiveDate).getDate()}}日</div>
                  <div class="left-amount">{{ item.total }}</div>
              </div>
              <div class="list-right"  @click="gotoDetail(item)">
                <span>明细</span>
                <span class="icon icon-goto"></span>
              </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { Datetime,numberComma,dateFormat } from 'vux'
import { getPerformance } from "@/service/myPerformanceService";
export default {
    name:"MonthPerformance",
    components:{
       Datetime
    },
    data(){
        return {
           month: "",
           total: 0,
           monthData: []
        }
    },
    computed: {
      beforeMonth: function() {
        let date = new Date(this.month);
        date.setMonth(date.getMonth() - 1);
        return date.getMonth() + 1;
      },
      afterMonth: function() {
        let date = new Date(this.month);
        date.setMonth(date.getMonth() + 1);
        return date.getMonth() + 1;
      },
    },
    methods:{
        goBack() {
            this.$router.push({
                path: "/performance/myPerformance"
            })
        },
        displayFromat(value) {
          let date = new Date(value);
          return `${date.getFullYear()}年${date.getMonth() + 1}月`;
        },
        onDateChange(value) {
            this.getMonthPerformance(value);
        },
        onBeforeMonthClick() {
            let month = this.createDate(-1);
            this.month = month;
            this.getMonthPerformance(month);
        },
        onAfterMonthClick() {
            let month = this.createDate(1);
            this.month = month;
            this.getMonthPerformance(month);
        },
        createDate(num) {
            let date = new Date(this.month);
            date.setMonth(date.getMonth() + num);
            let month = date.getMonth(),
                year = date.getFullYear();
            month = month > 9 ? (month + 1) : "0" + (month + 1);

            return `${year}-${month}`;
        },
        gotoDetail(item) {
          let day = dateFormat(new Date(item.effectiveDate), 'YYYY-MM-DD');
          this.$router.push({
              path: "/performance/dayPerformance/" + day
          })
        },
        getMonthPerformance(value) {
            let month = value || this.month;
            this.$loading.show();
            getPerformance('month',month).then(res => {
                let total = 0;
                res.tableContent.forEach(log => {
                    total += log.total;
                    log.total = numberComma(log.total.toFixed(2));
                })
                this.total = numberComma(total.toFixed(2));
                this.monthData = res.tableContent;
                this.$loading.hide();
            })
        }
    },
    created() {
      this.month = this.$route.params.month;
      this.getMonthPerformance();
    }
}
</script>

<style lang="less" scoped>
  .month-performance{
      height: 100%;
      .month-header{
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
      .month-num{
            background-color: #2e7cca;
            color: #fff;
            padding: .2rem;
            text-align: center;
            p{
                font-size: .25rem;
                font-weight: bold;
            }
      }
      .month-table{
        margin: .1rem;
        height: 70%;
        .table-header{
          display: flex;
          text-align: center;
          padding: .1rem;
          background-color: #eee;
          .month-select{
            flex: 1;
          }
          .brfore-month{
            display: flex;
            align-items: center;
            .icon-performance-back{
                width: .18rem;
                height: .18rem;
                display: inline-block;
            }
          }
          .after-month{
            display: flex;
            align-items: center;
            .icon-goto{
                width: .15rem;
                height: .15rem;
                display: inline-block;
            }
          }
        }
        .table-sum{
          display: flex;
          justify-content: space-between;
          padding: .1rem;
          border-bottom: 1px solid #999;
        }
        .table-content{
          overflow-y: scroll;
          height: 82%;
          .table-list{
            display: flex;
            justify-content: space-between;
            padding: .1rem;
            .list-right{
              display: flex;
              align-items: center;
              color: #999;
              .icon-goto{
                  width: .15rem;
                  height: .15rem;
                  display: inline-block;
              }
            }
            .list-left{
              display: flex;
              .left-amount{
                margin-left: .5rem;
                font-weight: bold;
              }
            }
          }
        }
      }
  }
</style>