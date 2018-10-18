<template>
  <div class="pages">
    <!-- <tab :line-width=2 active-color='#B99763'>
        <tab-item 
            class="vux-center" 
            :selected="demo2 === item" 
            v-for="(item, index) in listTab" 
            @click.native="mylist(index)" 
            :key="index"
            >
            {{item}}
        </tab-item>
    </tab> -->
    <div class='rank_classfiy'>
      <span :class="{'active' : index === activeIndex}" v-for='(item,index) in rankList' :key='index' @click="activeIndex = index">{{item}}</span>
    </div>
    <div class='filter_time vux-1px-b'>
      <div class='current_time vux-1px-r'>{{defaultTips}}</div>
      <div class='time_pop' @click="dateShow = !dateShow">
        <span class="tips">日期筛选</span>
        <x-icon :class="{'arrow-up': dateShow}" type="ios-arrow-down" size="14"></x-icon>    
      </div>
      <div class='time_pop vux-1px-l' @click="dateShow = !dateShow">
        <span class="tips">部门筛选</span>
        <x-icon :class="{'arrow-up': dateShow}" type="ios-arrow-down" size="14"></x-icon>    
      </div>
      <div class='date vux-1px-b' v-show='dateShow'>
        <div class='choose_date'>
          <div class='start_date'>
            <span class='date_title'>起始日期</span>
            <span class='date_value vux-1px' @click="getStart">
              {{timeFilter.startDate}}
              </span>
          </div>
          <div class='end_date'>
            <span class='date_title'>截止日期</span>
            <span class='date_value vux-1px-t' @click="getEnd">
              {{timeFilter.EndDate}}
            </span>
          </div>
        </div>
        <div class='time_sel_btn'>
          <span class="reset" @click="resetData">重置</span>
          <span class="confirm" @click="confirm">确认</span>
        </div>
      </div>
    </div>
    <div class='business_amount vux-1px-b'>
      <p>销售额</p>
      <p class='amount'>
        ￥<countup :end-val=businessAmount :duration="1" :decimals="2"></countup>
      </p>
    </div>
    
    <!--销售排名-->
    <div class='sale_rank' v-show="activeIndex === 0">
      <!-- <div class='title'>销售业绩排行</div> -->
      <div v-for="(item,index) in allSaleReport" class='each_saleman vux-1px-b'>
        <span class='sort'>{{index+1}}</span>
        <span class='saleman_name'>{{item.saleOwnerN || item.saleOwner}} {{item.HANDLER_UNIT_NAME}}</span>
        <span class='saleman_amount'>￥{{item.personAmount}}</span>
      </div>
    </div>
    <div class='sale_rank' v-show="activeIndex === 1">
      <!-- <div class='title'>销售业绩排行</div> -->
      <div v-for="(item,index) in allProductReport" class='each_saleman vux-1px-b'>
        <span class='sort'>{{index+1}}</span>
        <span class='saleman_name'>{{item.INVENTORY_NAME}}</span>
        <span class='saleman_amount'>￥{{item.totalAMOUNT}}</span>
      </div>
    </div>
    <div class="my_info_part">
      <!-- <div v-for="(item,index) in allProductReport" :key='index'>
        <divider>{{item.INVENTORY_NAME}}</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="'￥'+item.totalAMOUNT | numberComma" 
            :body-items="list1">
        </form-preview>

      </div> -->
        <!-- <divider>项目类产品</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="'￥'+list1Total | numberComma" 
            :body-items="list1">
        </form-preview>

        <divider>A类产品</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="'￥'+list2Total | numberComma" 
            :body-items="list2">
        </form-preview>
        <divider>B类产品</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="'￥'+list3Total | numberComma" 
            :body-items="list3">
        </form-preview> -->

    </div>
    <!-- <loading :show='spinner'></loading> -->
   </div>
</template>

<script>
import {
  Tab,
  TabItem,
  Divider,
  SwiperItem,
  FormPreview,
  numberComma,
  CellFormPreview,
  Countup, dateFormat
} from "vux";
import myReportService from "../service/myReportService";
import {accAdd} from './maps/decimalsAdd.js'
import loading from "./loading";
const list = () => ["本日", "本周", "本月", "本年"];
export default {
  components: {
    Tab,
    TabItem,
    Divider,
    loading,
    SwiperItem,
    FormPreview,
    CellFormPreview,
    Countup
  },
  data() {
    return {
      listTab: list(),
      demo2: "本日",
      list1: [],
      list2: [],
      list3: [],
      list1Total: 0,
      list2Total: 0,
      list3Total: 0,
      remark: "",
      spinner: false,
      timeFilter: {
        startDate: '请选择',             // 起始日期
        EndDate: '请选择',               // 截止日期
      },      
      staffRank: [],                    // 业务员销售排名(前三)
      defaultTips: '',                  // 默认提示文字
      isReset: false,                   // 是否重置
      dateShow: false,                  // 是否显示时间筛选栏
      businessAmount: 1245121.12,                // 金额合计
      allSaleReport:[],
      allProductReport:[],
      activeIndex:0,
      rankList:['按业务员','按产品']
    };
  },
  filters: {
    numberComma
  },
  methods: {
    mylist(tab) {
      if (tab == 0) {
        this.listpanl(this.remark.days);
      } else if (tab == 1) {
        this.listpanl(this.remark.weeks);
      } else if (tab == 2) {
        this.listpanl(this.remark.months);
      } else if (tab == 3) {
        this.listpanl(this.remark.years);
      }
    },
    listData() {
      let ROSE_OPTION = JSON.parse(localStorage.getItem("ROSE_OPTION"));
      let jsonData = {
        shengName: ROSE_OPTION.region,
        bankName: ROSE_OPTION.bank,
        sybName: ROSE_OPTION.dept,
        bmName: ROSE_OPTION.captain
      };
      myReportService
        .myRepotList(jsonData)
        .then(data => {
          if (data) {
            this.spinner = false;
          }
          this.remark = data;
          this.mylist(0);
        })
        .catch(data => {
          this.spinner = true;
        });
    },
    listpanl(m) {
      this.list1Total = 0;
      this.list2Total = 0;
      this.list3Total = 0;
      this.list1.length = 0;

      for (let i = 0; i < m.length; i++) {
        if (m[i].objType == "项目类产品" && m[i].objName) {
          this.list1Total += Number(m[i].amount);
          this.list1.push({
            label: m[i].objName,
            value: "￥" + numberComma(m[i].amount, 3) + " " + "(" + m[i].qty + "件/套" + ")"
          });
        } else if (m[i].objType == "A") {
          this.list2Total = m[i].amount;
        } else if (m[i].objType == "B") {
          this.list3Total = m[i].amount;
        }
      }
      this.list1Total = this.list1Total.toFixed(2);
    },
    // 起始日期
    getStart(){
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: this.timeFilter.startDate,
        endDate: this.preDate,
        onConfirm: (val) => {
          this.timeFilter.startDate = val;
        },
      })
    },
    // 截止日期
    getEnd(){
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: this.timeFilter.EndDate,
        endDate: this.toDay,
        onConfirm:(val)=>{
          this.timeFilter.EndDate = val;
        },
      })
    },
    // 重置时间筛选
    resetData(){
      this.timeFilter = { startDate: '请选择', EndDate: '请选择', };
    },
    // 时间筛选确定
    confirm(){
      // 两个时间都选择了
      if(this.timeFilter.startDate !== '请选择' && this.timeFilter.EndDate !== '请选择'){
        this.defaultTips = `${this.timeFilter.startDate} ~ ${this.timeFilter.EndDate}`;
      }
      // 只选择了截止时间
      else if(this.timeFilter.EndDate !== '请选择'){
        this.defaultTips = `截止至 ${this.timeFilter.EndDate}`;
      }
      // 只选择了起始日期
      else if(this.timeFilter.startDate !== '请选择'){
        this.defaultTips = `${this.timeFilter.startDate} ~ ${this.toDay} [今日]`;
      } 
      // 都没选择
      else {
        this.defaultTips = `截止至 ${this.toDay}`
      }
      // 关闭时间筛选
      this.dateShow = false;
      // 添加时间筛选条件
      let timeFilter = {
        startData: this.timeFilter.startDate === '请选择' ? '' : this.timeFilter.startDate,
        endData: this.timeFilter.EndDate === '请选择' ? '' : this.timeFilter.EndDate
      }
      this.dashboardData(timeFilter);
    },
    getReport(){
      myReportService.allSaleReport({page:1,limit:10}).then(data=>{
        let {salesman} = data;
        salesman.forEach(item=>{
          item.personAmount = 0;
          item.performance.forEach(item1=>{
            item.personAmount = accAdd(item.personAmount,item1['价税总计'])
          })
        })
        
        this.allSaleReport = salesman;
      })
    },
    getProduct(){
      myReportService.allProductReport({page:1,limit:10}).then(data=>{
        let {product} = data;
        product.forEach(item=>{
          this.businessAmount = accAdd(this.businessAmount,item.totalAMOUNT)
        })
        this.allProductReport = product;
      })
    }
  },
  created() {
    this.spinner = true;
    this.toDay = dateFormat(new Date(),'YYYY-MM-DD');
    this.preDate = dateFormat(new Date(new Date().getTime() - 24*60*60*1000), 'YYYY-MM-DD');
    this.defaultTips = `截止至 ${this.toDay}`;    
    this.getReport();
    this.getProduct();
    this.listData();
  }
};
</script>

<style lang="less" scoped>
@import "~vux/src/styles/1px.less";
@import "~vux/src/styles/center.less";
.tab-swiper {
  background-color: #fff;
  height: 100%;
}
.spinner_task {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  z-index: 99;
}
.filter_time {
    background: #fff;
    display: flex;
    height: 40px;
    font-size: 14px;
    font-weight: bold;
    align-items: center;
    .current_time {
      flex:1;
      text-align: center;
    }
    .time_pop {
      width: 50%;
      display: flex;
      padding: 0 10px;
      align-items: center;
      justify-content: center;
      .tips {
        margin-right: 4px;
      }
      /* 倒三角 */
      .vux-x-icon-ios-arrow-down {
        transition: transform 200ms linear;
        &.arrow-up {
          transform: rotate(-180deg);
        }
      }    
    }
    //选择时间弹出框
    .date{
      background: #fff;
      width:100%;
      box-sizing: border-box;
      position: absolute;
      top:0.4rem;
      z-index:50;
      box-shadow: 0 2px 10px #e8e8e8;
      .choose_date{
        display: flex;
        text-align: center;
        
        .end_date,
        .start_date {
          flex: 1;
          display: flex;
          flex-direction: column;
          .date_title {
            padding: 10px 0;
            font-weight: bold;
          }
          .date_value {
            padding: 10px;
            color: #757575;
          }
        }
      }
      // 时间选择 确认栏
      .time_sel_btn {
        color: #FFF;
        display: flex;
        text-align: center;
        span {
          flex: 1;
          padding: 10px 0;
        }
        .reset {
          color: #757575;
          background: #F1F1F1;
        }
        .confirm {
          background: #3f72af;
        }
      }
    }
  }
  .business_amount {
    background: #fff;
    padding: 10px 0;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    .amount {
      font-size: 30px;
      color: #c93d1b;
      font-weight: 200;
    }
  }
  .rank_classfiy{
    width:90%;
    margin: 0.1rem auto;
    display: flex;
    span{
      flex: 1;
      // width:50%;
      padding: 0.05rem 0;
      font-size: 0.16rem;
      text-align: center;
      background: #fff;
      &.active{
        background:#3f72af;
        color: #fff;
      }
      &:first-child{
        border-radius: 0.2rem 0 0 0.2rem;
      }
      &:last-child{
        border-radius: 0 0.2rem 0.2rem 0;
      }
      

    }
  }
  .sale_rank{
    background:#fff;
    padding: 0 0.1rem;
    .title{
      text-align: center;
      font-size: 0.18rem;
      font-weight: bold;
      padding: 0.03rem 0;
    }
    span{
      font-size: 0.16rem;
      text-align: left;
    }
    .each_saleman{
      line-height: 0.3rem;
      display: flex;
      padding : 0.07rem;
      .sort{
        width: 0.3rem;
      }
      .saleman_name{
        flex: 1.5;
      }
      .saleman_amount{
        flex: 1.5;
        text-align: right;

      }
    }
  }
</style>
