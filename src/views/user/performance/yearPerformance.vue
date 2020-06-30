<template>
    <div class="year-performance">
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
          <group class="year-select">
            <datetime 
              v-model="year" 
              @on-change="onDateChange" 
              format="YYYY"
              :max-year="new Date().getFullYear()"
              :display-format="displayFromat">
              <span>
                <span style="color:#999;">{{ year }}年</span>
                <span class="iconfont icon-riqi"></span>
              </span>
            </datetime>
          </group>
          <div 
            class="after-year"
            :style="{visibility:disabledAfterYear?'hidden':'visible'}"
            @click="onAfterYearClick">
            <span>{{ afterYear }}年</span>
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
        </RScroll>
      </div>
      
    </div>
</template>

<script>

import { Datetime,Group,numberComma } from 'vux'
import { getPerformance } from "@/service/myPerformanceService";
import RScroll from "plugins/scroll/RScroll";
export default {
    name:"YearPerformance",
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
          disabledAfterYear: true,
          year: "",
          total: 0,
          yearData: []
        }
    },
    computed: {
      beforeYear: function() {
        return new Date(String(this.year)).getFullYear() - 1;
      },
      afterYear: function() {
        if(new Date(this.year).getFullYear() + 1 > new Date().getFullYear()){
          this.disabledAfterYear = true;
        }else{
          this.disabledAfterYear = false;
        }
        return new Date(String(this.year)).getFullYear() + 1;
      }
    },
    methods:{
        goBack() {
            this.$router.push({
                path: "/user/myPerformance"
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
            this.year = String(year);
        },
        onAfterYearClick() {
          if(this.disabledAfterYear) return;
            let year = new Date(this.year).getFullYear() + 1;
            this.year = String(year);
        },
        gotoDetail(item) {
          this.$router.push({
              path: "/user/monthPerformance/" + item.effectiveMonth
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

<style lang="scss" scoped>
  .year-performance{
      height: 100%;
      overflow: hidden;
  }
    .year-header{
          height: .5rem;
          line-height: .5rem;
          display: flex;
          text-align: center;
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
            background-color: #1a92ec;
            color: #fff;
            height: 1rem;
            text-align: center;
            p{
                font-size: .25rem;
                font-weight: bold;
            }
      }
      .year-table{
        height: calc(100% - 2rem);
        .table-header{
          display: flex;
          height: .5rem;
          line-height: .5rem;
          background-color: #eee;
          justify-content: space-between;
          .brfore-year{
            display: flex;
            align-items: center;
            .icon-performance-back{
                width: .18rem;
                height: .18rem;
                display: inline-block;
            }
          }
          .after-year{
            display: flex;
            align-items: center;
            .icon-goto{
                width: .15rem;
                height: .15rem;
                display: inline-block;
            }
          }
          .year-select{
            .icon-riqi{
                margin-right: .02rem;
            }
          }
          .year-select /deep/ .weui-cells{
            background-color: transparent;
            margin-top: .77em !important;
            padding: 0px;
          }
          .year-select /deep/ .weui-cell{
            padding: 0px;
          }
          .year-select /deep/ .weui-cells:after{
            border: none;
          }
          .year-select /deep/ .weui-cells:before{
            border: none;
          }
          .year-select /deep/ .weui-cell_access .weui-cell__ft:after{
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
          height: .5rem;
          line-height: .5rem;
          border-bottom: 0.5px solid #999;
              }
        .table-content{
         height: calc(100% - 1rem);
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