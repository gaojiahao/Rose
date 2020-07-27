<template>
    <div class="month-performance">
        <slot name="nav" ></slot>
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
          <group class="month-select">
            <datetime 
              v-model="month" 
              @on-change="onDateChange" 
              format="YYYY-MM"
              :display-format="displayFromat">
              <span>
                  <span style="color:#999;">{{ displayMonth }}</span>
                  <span class="iconfont icon-riqi"></span>
              </span>
            </datetime>
          </group>
          <div class="after-month" @click="onAfterMonthClick">
            <span>{{ afterMonth }}月</span>
            <span class="icon icon-goto"></span>
          </div>
        </div>
        <div class="table-sum">
          <span>合计</span>
          <b>{{ total }}</b>
        </div>
          <RScroll 
          class="page-body-hasNav table-content" 
          :options="scrollOptions"
          :has-next="hasNext"
          :no-data="false"
          >
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
          </RScroll>
        </div>
      </div>
</template>

<script>
import { Datetime,numberComma,Group,dateFormat } from 'vux'
import { getPerformance } from "@/service/myPerformanceService";
import RScroll from "plugins/scroll/RScroll";
export default {
    name:"MonthPerformance",
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
      displayMonth: function() {
        let date = new Date(this.month);
        return `${date.getFullYear()}年${date.getMonth() + 1}月`;
      }
    },
    methods:{
        goBack() {
            this.$router.push({
                path: "/user/myPerformance"
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
        },
        onAfterMonthClick() {
            let month = this.createDate(1);
            this.month = month;
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
              path: "/user/dayPerformance/" + day
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

<style lang="scss" scoped>
  .month-performance{
      height: 100%;
      overflow: hidden;
  }
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
            background-color: #1a92ec;
            color: #fff;
            height: 1rem;
            text-align: center;
            p{
                font-size: .25rem;
                font-weight: bold;
            }
      }
      .month-table{
        // height: calc(100% - 2rem);
        height:100%;
        background-color: white;
        .table-header{
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          padding: 0 .1rem;
          background-color: #eee;
          height: .5rem;
          line-height: .5rem;
          justify-content: space-between;
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
          .month-select{
            .icon-riqi{
                margin-right: .02rem;
            }
          }
          .month-select /deep/ .weui-cells{
            background-color: transparent;
            margin-top: .77em !important;
          }
          .month-select /deep/ .weui-cell{
            padding: 0px;
          }
          .month-select /deep/ .weui-cells:after{
            border: none;
          }
          .month-select /deep/ .weui-cells:before{
            border: none;
          }
          .month-select /deep/ .weui-cell_access .weui-cell__ft:after{
            display: none;
          }
        }
        .table-sum{
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-pack: justify;
          -ms-flex-pack: justify;
          justify-content: space-between;
          padding: 0 .1rem;
          border-bottom: 0.5px solid #999;
          height: .5rem;
          line-height: .5rem;
        }
        .table-content{
          height: calc(100% - 2rem);
           .table-list{
            display: flex;
            justify-content: space-between;
            padding: .1rem;
            .list-right{
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-align: center;
              -ms-flex-align: center;
              align-items: center;
              color: #999;
              flex: 1;
              justify-content: flex-end;
              font-size: 14px;
              .icon-goto{
                  width: .14rem;
                  height: .14rem;
                  display: inline-block;
              }
            }
            .list-left{
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              flex: 1;
              .left-time{
                flex: 1;
              }
              .left-amount{
                flex: 1;
                font-size: 16px;
                text-align: right;
              }
            }
          }
        }
      }
</style>