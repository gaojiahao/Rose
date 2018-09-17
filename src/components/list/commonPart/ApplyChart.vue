<template>
  <div class='chart'>
    <div class='filter_time vux-1px-b'>
      <div class='current_time vux-1px-r'>{{currentDate}}</div>
      <div class='time_pop' @click="dateShow = !dateShow">
        <span class="tips">时间筛选</span>
        <x-icon type="ios-arrow-down" size="14"></x-icon>
      </div>
      <div class='date vux-1px-b' v-show='dateShow'>
        <div class='choose_date'>
          <div class='start_date'>
            <span class='date_title'>起始日期</span>
            <span class='date_value vux-1px' @click="getStart">
              {{startDate}}
            </span>
          </div>
          <div class='end_date'>
            <span class='date_title'>截止日期</span>
            <span class='date_value vux-1px-t' @click="getEnd">
              {{EndDate}}
            </span>
          </div>
        </div>
        <div class='time_sel_btn' @click="confirm">
          <span class="reset">重置</span>
          <span class="confirm">确认</span>
        </div>
        
      </div>
    </div>
    <div class='business_amount vux-1px-b'>
      <p>销售额</p>
      <p class='amount'>
        ￥<countup :end-val=businessAmount :duration="1" :decimals="2"></countup>
      </p>
    </div>
    <!-- 销售额排名饼状图-->
    <div class='customer_rank'>
      <div id='pie'></div>
    </div>
    <!--业务量排名-->
    <div class='list_rank vux-1px-t'>
      <div class='list_title'>
        业务员业绩排行榜（前三）
      </div>
      <div class='each_staff vux-1px-b' v-for="(item, index) in staffRank" :key='index'>
        <div class="staff_name">
          <span class="rank_num">No.{{index + 1}}</span>
          <span>{{item.handlerName}} {{item.handlerRoleName}} {{item.handlerUnitName}}</span>
        </div>
        <div>￥{{item.total | toFixed}}</div>
      </div>
    </div>
    <!--产品销量排名柱状图-->
    <!-- <div class='product_rank'>
      <div id="bar"></div>
    </div> -->
  </div>
  
</template>

<script>
// 引入 ECharts 主模块
let echarts = require('echarts/lib/echarts');
// 引入饼状图，柱状图
require('echarts/lib/chart/pie');
require('echarts/lib/chart/bar');
// 引入提示框和标题组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
require('echarts/lib/component/legend');
//处理图标上字符串过长换行
let handle = (params,symbol,num)=>{
  let newParamsName = "";// 最终拼接成的字符串 
  var paramsNameNumber = params.length;// 实际标签的个数 
  var provideNumber = num;// 每行能显示的字的个数 
  var rowNumber = Math.ceil(paramsNameNumber / provideNumber);// 换行的话，需要显示几行，向上取整 
  /** 
  * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签 
  */ 
  if (paramsNameNumber > provideNumber) { 
    /** 循环每一行,p表示行 */ 
    for (var p = 0; p < rowNumber; p++) { 
      var tempStr = "";// 表示每一次截取的字符串 
      var start = p * provideNumber;// 开始截取的位置 
      var end = start + provideNumber;// 结束截取的位置 
      // 此处特殊处理最后一行的索引值 
      if (p == rowNumber - 1) { 
        tempStr = params.substring(start, paramsNameNumber); 
      } else { 
        // 每一次拼接字符串并换行 
        tempStr = params.substring(start, end) + symbol; 
      } 
      newParamsName += tempStr;// 最终拼成的字符串 
    } 
  } else { 
    // 将旧标签的值赋给新标签 
    newParamsName = params; 
  } 
  //将最终的字符串返回 
  return newParamsName  
}
// vux组件引入
import { dateFormat,Countup } from 'vux'
// 请求 引入
import { getDashboard } from 'service/listService'
// 插件引入
import {toFixed} from '@/plugins/calc'
export default {
  data(){
    return{
      pieOption: {                      // 饼图表参数
        title:{                         // 标题
          text : '客户交易往来分析',
          x : 'center',
          top:5,
        },
        legend: {                       // 图例组件
          orient: 'vertical',           // 水平方向 或者 垂直方向
          left:'6%',
          top:'65%',
          itemGap: 10,                   // 图例之间的间距
          data: [],
        },
        tooltip : {                     // 饼图的弹窗提示文字

          confine: true,                // 将提示文字限制在屏幕内 
          textStyle: {                  // 文字样式
            fontSize: 12
          },
          formatter:(params)=>{
            // let tip =  handle(params.data.name, '<br/>', 0);
            return `${params.data.name}<br/>销售额：￥${params.value} (${params.percent}%)`
          },
        },
        color: ['#07689f','#a2d5f2','#ff7e67','#abedd8','#283c63','#bad7df'],
        series : [                      // 饼图数据
          {
            name: '公司名称',
            type: 'pie',
            radius : '40%',             // 饼图半径
            center: ['50%', '38%'],     // 饼图位置
            data:[],
            label:{
              // show: false,              
              fontSize: 12,
              
              formatter :(params) => {
               let name = handle(params.data.name, '\n', 6);
                return name  
              },             
            },
            labelLine: {
              // smooth: true,
            }
          }
        ]
      },
      barOption: {                      // 柱状图参数
        title: {
            text: '产品销售排名',
            x:'center'
        },
        tooltip: {},
        xAxis: {
            axisLabel:{
              formatter:(value,index)=>{
                let name = handle(value,'\n',3);
                return name
              }
            },
            data: ['2018年俄罗斯FIFA世界杯普通金属纪念币-第三系列','草莓奶油冰淇淋蛋糕','五国金砖纪念套装','抹茶蛋糕卷','电脑'],
            axisTick: {
              show : false
            },
            
        },
        itemStyle:{ 
          color:'#5077aa',           
        },
        yAxis: {
          
        },
        grid:{
          height:'60%',
          left:'15%',
        },
        series: [{
            name: '销量',
            type: 'bar',
            data: [115, 95, 80, 64, 50],
            barWidth : 30,
            label:{
              show: true,
              position:'top',
              
            }
        }]
      },
      currentDate: '',                  // 当前时间
      staffRank: [],                    // 业务员销售排名(前三)
      startDate: '请选择',               // 默认文字
      EndDate: '请选择',                 // 默认文字
      dateShow: false,                  // 是否显示时间筛选栏
      businessAmount: 0,                // 金额合计

    }
  },
  filters: {
    toFixed
  },
  components:{
    Countup
  },
  methods:{
    getStart(){
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        onConfirm:(val)=>{
          console.log(val);
          this.startDate = val;
        },
      })
    },
    getEnd(){
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        onConfirm:(val)=>{
          this.EndDate = val;
        },
      })
    },
    confirm(){
      if(this.startDate !== '请选择' && this.EndDate !== '请选择'){
        this.currentDate = `${this.startDate} ~ ${this.EndDate}`;
      } 
      this.dateShow = false;
      let timeFilter = {
        startData: this.startDate,
        endData: this.EndDate
      }
      this.dashboardData(timeFilter);
    },
    dashboardData(data = {}){
      this.$loading.show();
      return getDashboard(data).then((
        { total = 0, dealerPie, productSalesRanking: pdRank , salesmanRanking: staffRank }) => {
          // 初始化
          let PieChart = echarts.init(document.getElementById('pie')),
                dealerRank = [];
                
          // 业务员业绩排名
          this.staffRank = staffRank;
          // 修改数据
          for(let item of dealerPie){
            let obj = {
              value: item.total,
              name: item.dealerName
            }
            dealerRank.push(obj);
          }
          // 销量额
          this.businessAmount = toFixed(total);
          // 饼图数据
          this.$set(this.pieOption.series[0], 'data', dealerRank);
          this.$set(this.pieOption.legend, 'data', dealerRank);
          PieChart.setOption(this.pieOption);
          this.$loading.hide();
      })
    }
  },
  created(){
    // let PieChart = echarts.init(document.getElementById('pie'));
    // let BarCahrt = echarts.init(document.getElementById('bar'));

    this.currentDate = dateFormat(new Date(),'YYYY-MM-DD');
    // getDashboard();
    this.dashboardData();
  },
  mounted(){
    // BarCahrt.setOption(this.barOption);

  }

}
</script>

<style lang="scss" scoped>
.vux-1px-b:after,
.vux-1px-r:after,
.vux-1px-t:before,
.vux-1px:before {
  border-color: #E8E8E8;
}
.chart{
  width:100%;
  //标题
  .chart_title {
    font-size:0.18rem;
    text-align: center;
    padding: 0.1rem 0;
    font-weight: bold;
  }
  .filter_time {
    display: flex;
    align-items: center;
    height:0.4rem;
    .current_time {
      flex:1;
      text-align: center;
    }
    .time_pop {
      // width: 1rem;
      padding: 0 .1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      .tips {
        font-weight: bold;
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
        // padding: .04rem 0 0;
        display: flex;
        text-align: center;
        
        // justify-content: space-around;
        .start_date,
        .end_date{
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-top: .05rem;
          .date_title {
            // padding: .1rem 0;
            font-weight: bold;
            // margin-bottom: .05rem;
          }
          .date_value {
            padding: .1rem;
            // display: block;
            border-radius: .12rem;
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
          padding: .1rem 0;
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
    padding: .1rem 0;
    font-size: .18rem;
    font-weight: bold;
    text-align: center;
    .amount {
      font-size: .3rem;
      color: #c93d1b;
      font-weight: 200;
    }
  }
  //饼状图
  #pie {
    width:100%;
    height:4rem;
  }
  //业绩排行榜
  .list_rank {
    padding :0.1rem;
    .list_title {
      text-align: center;
      font-size:0.18rem;
      font-weight: bold;
    }
    .each_staff {
      padding: .1rem 0 .02rem;
      line-height: 0.3rem;
      display: flex;
      justify-content: space-between;
      .staff_name {
        font-size: .16rem;
        // font-weight: bold;
      }
      .rank_num {
        color: #FFF;
        font-size: .12rem;
        border-radius: .3rem;
        background: #3f72af;
        padding: .02rem .04rem;
        margin-right: .04rem;
      }
    }
  }
  //产品排行榜柱状图
  .product_rank{
    .product_sml{
      padding: 0 0.1rem;
      li{
        list-style: none;
        margin-bottom: 0.1rem;
        display: flex;
        .sml{
          padding:0.01rem 0.08rem;
          color:#fff;
        }
        .large{
          margin-left:0.05rem;
        }
      }
    }
  }
  #bar{
    width:100%;
    height:3rem;
  }
}

</style>

