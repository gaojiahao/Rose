<template>
    <div class="year-performance">
      <div class="year-header">
          <div class="back" @click="goBack">
              <span class="icon icon-performance-back"></span>
              <span>我</span>
          </div>
          <div class="title">年度累计绩效明细</div>
      </div>
      <div class="year-num">
          <span>累计绩效</span>
          <p>{{ total }}</p>
      </div>
      <div class="year-table">
        <div class="table-header">
          <div class="brfore-year" @click="onBeforeYearClick">
              <span class="icon icon-performance-back"></span>
              <span>{{ beforeYear }}年</span>
          </div>
          <div class="year-select">
              <datetime 
                v-model="year" 
                @on-change="onDateChange" 
                format="YYYY"
                :display-format="displayFromat">
              </datetime>
          </div>
        </div>
        <div class="table-sum">
          <span>合计</span>
          <b>{{ total }}</b>
        </div>
        <div class="table-content">
          <div class="table-list" v-for="(item,index) of yearData" :key="index">
              <div class="list-left">
                  <div class="left-time">{{new Date(item.effectiveMonth).getMonth()+1}}月</div>
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
import { Datetime,numberComma } from 'vux'
import { getPerformance } from "@/service/myPerformanceService";
export default {
    name:"YearPerformance",
    components:{
       Datetime
    },
    data(){
        return {
           year: "",
           total: 0,
           yearData: []
        }
    },
    computed: {
      beforeYear: function() {
        return new Date(String(this.year)).getFullYear() - 1;
      }
    },
    methods:{
        goBack() {
            this.$router.push({
                path: "/performance/myPerformance"
            })
        },
        displayFromat(value) {
          return `${value}年`;
        },
        onDateChange(value) {
            this.getYearPerformance(value);
        },
        onBeforeYearClick() {
            let year = new Date(this.year).getFullYear() - 1;
            this.year = year;
            this.getYearPerformance(year);
        },
        gotoDetail(item) {
          this.$router.push({
              path: "/performance/monthPerformance/" + item.effectiveMonth
          })
        },
        getYearPerformance(value) {
            let year = value || this.year;
            this.$loading.show();
            getPerformance('year',year).then(res => {
                let total = 0;
                res.tableContent.forEach(log => {
                    total += log.total;
                    log.total = numberComma(log.total.toFixed(2));
                })
                this.total = numberComma(total.toFixed(2));
                this.yearData = res.tableContent;
                this.$loading.hide();
            })
        }
    },
    created() {
      this.year = this.$route.params.year;
      this.getYearPerformance();
    }
}
</script>

<style lang="less" scoped>
  .year-performance{
      height: 100%;
      .year-header{
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
      .year-num{
            background-color: #2e7cca;
            color: #fff;
            padding: .2rem;
            text-align: center;
            p{
                font-size: .25rem;
                font-weight: bold;
            }
      }
      .year-table{
        margin: .1rem;
        border: 1px solid #999;
        height: 70%;
        .table-header{
          display: flex;
          text-align: center;
          padding: .1rem;
          background-color: #eee;
          border-bottom: 1px solid #999;
          .year-select{
            flex: 1;
          }
          .brfore-year{
            display: flex;
            align-items: center;
            .icon-performance-back{
                width: .18rem;
                height: .18rem;
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