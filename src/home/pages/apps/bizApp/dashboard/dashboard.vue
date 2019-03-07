<template>
  <div class='pages'>
    <!-- <div class='change'>
        <span @click="changeTip(index)" v-for="(item,index) in chartList" :key="index" :class="{active : index === activeIndex}">{{item}}</span>
    </div> -->
    <div id="main"></div>
  </div>
</template>

<script>
const echarts = require('echarts');
export default {
    data(){
        return{
            toggle :false,
            chartList:['饼状','线性','柱状'],
            option:{

            },
            activeIndex : 0,
            chart : null
        }

    },
    methods:{
        changeTip(index){
            this.activeIndex = index;
            if (index === 0){
                 this.option  = {
                    title : { //标题
                        // text: '某站点用户访问来源',
                        // textStyle:{
                        //     color:'#5077aa',
                        // },
                        // subtext: '哈哈',
                        itemGap : 20,
                        top:20,
                        x:'center'
                    },
                    tooltip : {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        bottom : 20,
                        left: 20,
                        selectedMode  : false,
                        data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎'],
                    },
                    series : [
                        {
                            name: '访问来源',
                            type: 'pie',
                            radius : '50%',
                            // left:'center',
                            // top:'middle',
                            center: ['40%', '50%'],
                            data:[
                                {value:335, name:'直接访问'},
                                {value:310, name:'邮件营销'},
                                {value:234, name:'联盟广告'},
                                {value:135, name:'视频广告'},
                                {value:1548, name:'搜索引擎'}
                            ],
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                }
            }
            else if (index === 1){
                 this.option = {
                    title: {
                        text: '一天用电量分布',
                        subtext: '纯属虚构',
                        top:5,
                        x:'center'
                    },
                    grid:{
                        height:'10%',

                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    // toolbox: {
                    //     show: true,
                    //     feature: {
                    //         saveAsImage: {}
                    //     }
                    // },
                    xAxis:  {
                        type: 'category',
                        boundaryGap: false,
                        data: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45']
                    },
                    yAxis: {
                        type: 'value',
                        splitNumber:10,
                        axisLabel: {
                            margin:2,
                            formatter: '{value} W'
                        },
                        axisPointer: {
                            snap: true
                        }
                    },
                    visualMap: {
                        show: false,
                        dimension: 0,
                        pieces: [{
                            lte: 6,
                            color: 'green'
                        }, {
                            gt: 6,
                            lte: 8,
                            color: 'red'
                        }, {
                            gt: 8,
                            lte: 14,
                            color: 'green'
                        }, {
                            gt: 14,
                            lte: 17,
                            color: 'red'
                        }, {
                            gt: 17,
                            color: 'green'
                        }]
                    },
                    series: [
                        {
                            name:'用电量',
                            type:'line',
                            smooth: true,
                            data: [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
                            // markArea: {
                            //     data: [ [{
                            //         name: '早高峰',
                            //         xAxis: '07:30'
                            //     }, {
                            //         xAxis: '10:00'
                            //     }], [{
                            //         name: '晚高峰',
                            //         xAxis: '17:30'
                            //     }, {
                            //         xAxis: '21:15'
                            //     }] ]
                            // }
                        }
                    ]
                };
            }
            else if (index === 2){
                this.option = {
                    title: {
                        text: '动态数据',
                        subtext: '纯属虚构'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#283b56'
                            }
                        }
                    },
                    legend: {
                        data:['最新成交价', '预购队列']
                    },
                    // toolbox: {
                    //     show: true,
                    //     feature: {
                    //         dataView: {readOnly: false},
                    //         restore: {},
                    //         saveAsImage: {}
                    //     }
                    // },
                    dataZoom: {
                        show: false,
                        start: 0,
                        end: 100
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: true,
                            data: (function (){
                                var now = new Date();
                                var res = [];
                                var len = 10;
                                while (len--) {
                                    res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                                    now = new Date(now - 2000);
                                }
                                return res;
                            })()
                        },
                        {
                            type: 'category',
                            boundaryGap: true,
                            data: (function (){
                                var res = [];
                                var len = 10;
                                while (len--) {
                                    res.push(10 - len - 1);
                                }
                                return res;
                            })()
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            scale: true,
                            name: '价格',
                            max: 30,
                            min: 0,
                            boundaryGap: [0.2, 0.2]
                        },
                        {
                            type: 'value',
                            scale: true,
                            name: '预购量',
                            max: 1200,
                            min: 0,
                            boundaryGap: [0.2, 0.2]
                        }
                    ],
                    series: [
                        {
                            name:'预购队列',
                            type:'bar',
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            data:(function (){
                                var res = [];
                                var len = 10;
                                while (len--) {
                                    res.push(Math.round(Math.random() * 1000));
                                }
                                return res;
                            })()
                        },
                        {
                            name:'最新成交价',
                            type:'line',
                            data:(function (){
                                var res = [];
                                var len = 0;
                                while (len < 10) {
                                    res.push((Math.random()*10 + 5).toFixed(1) - 0);
                                    len++;
                                }
                                return res;
                            })()
                        }
                    ]
                    };

            }
           
            this.showPie()
        },
        showPie(){
            if (this.chart){
                this.chart.clear();
            }
            this.chart = echarts.init(document.getElementById('main'));
            this.chart.setOption(this.option);

        }

    },
    mounted(){
        
        // var myChart = echarts.init(document.getElementById('main'));
        this.option  = {
            title : { //标题
                // text: '某站点用户访问来源',
                // textStyle:{
                //     color:'#5077aa',
                // },
                // subtext: '纯属虚构',
                // itemGap : 20,
                // top:20,
                // x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                // orient: 'vertical',
                left : 0,
                bottom: 0,
                selectedMode  : false,
                data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎','其他'],
            },
            series : [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius : '60%',
                    labelLine: {
                      
                    },
                    center: ['50%', '50%'],
                    data:[
                        {value:335, name:'直接访问'},
                        {value:310, name:'邮件营销'},
                        {value:234, name:'联盟广告'},
                        {value:135, name:'视频广告'},
                        {value:1548, name:'搜索引擎'},
                        {value:100, name:'其他'},
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        }
        this.showPie();
        // // 绘制图表
        // myChart.setOption(option);
    }

}
</script>

<style lang='scss' scoped>
.pages {
  // background: #f4f4f4;
}
#main{
  /* width:100%; */
  /* height: calc(100% - 26px); */
  box-sizing: border-box;
  padding: 10px;
  height: 2rem;
  overflow: hidden;
}
.change{
    padding:0 10px;
}
.change span{
    display: inline-block;
    padding: 5px 10px;
    margin-right: 10px;
    background: #ccc;
}
.change .active{
    background: #5077aa;
}

</style>
