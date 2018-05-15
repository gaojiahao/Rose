
<template>
  <div class="pages">
      <div id='mescroll' class="mescroll done_container">
            <div>
                <div class="each_duty" v-for="(item,key,index) in Content" :key="index">
                    <div class="duty_top">
                        <p class="duty_name">
                            <span class="duty_status">
                                <span class="duty_status_name">{{item.processName}}</span>
                            </span>
                            <span class="duty_name_text">{{item.requireName}}</span>
                        </p>
                    </div>
                        
                    <div class="duty_btm">
                        <p class="duty_code">
                            {{item.businessKey}}
                            <span class="duty_crt_man">{{item.crtName}}</span>
                        </p>
                        <p class="duty_time">{{item.crtTime}}</p>
                    </div>
                    
                </div>
            </div>
      </div>
  </div>
</template>

<script>
import { Icon, Search } from 'vux'
import getDoneService from '../service/getDoneService'
import business from './maps/business'
import { setTimeout } from 'timers';
export default {
    data(){
      return{
          Content:[],
          pageNo:0,
          upScroll: null,
          hasNext:true,
      }
    },
    methods:{

        //获取所有代办列表
        list(num){
            let jsonPage={
                page:num,
                start:0,
                limit:10
            }
            getDoneService.getDoneList(jsonPage).then(res=>{
                for(let i = 0 ; i < res.tableContent.length ; i++){
                    //数据映射替换
                    res.tableContent[i].processName=business[res.tableContent[i].businessKey.split('_')[0]];
                }
                this.Content=this.Content.concat(res.tableContent);
                this.upScroll.endSuccess(res.tableContent.length,this.hasNext);
            })
        },

        //上拉加载
        upCallback(){
            this.list (++this.pageNo);
        },
    },
    components:{
        Icon,
        Search
    },
    mounted(){
      let that=this;
      let Mescroll = that.Mescroll;
      that.upScroll = new Mescroll("mescroll",{
            up:{
                use:true,
                isBounce: false,
                htmlNodata: '<p class="upwarp-nodata">-- END --</p>', 
                callback:that.upCallback,
                page: {
                    num: that.pageNo, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                    size: 10, //每页数据条数
                    time: 300 //加载第一页数据服务器返回的时间; 防止用户翻页时,后台新增了数据从而导致下一页数据重复;
                },
                empty: {
                    warpId:'mescroll', 
                    tip: "暂无相关数据~",
                    supportTap: false
                },
            },
            down:{
                use:false
            }
        })
    },
    updated(){
      
    }
}
</script>

<style lang='scss' scoped>
    .pages{
        .done_container{
            height: 100vh;
        }
    }
    .mescroll {
        position: fixed;
				top: 0;
				bottom: 0;
        height: auto;        
        .top_caution {
            width: 100%;
            height: 0.7rem;
            line-height: 0.7rem;
            color: #D7803D;
            background: #FDFBDF;
            box-sizing: border-box;
            font-size: 0.28rem;
            padding: 0 0.4rem;
            position: relative;
            .f_r {
                position: absolute;
                top: 0.13rem;
                right: 0.4rem;
            }

        }
        .each_duty {        //任务栏
            margin: .4rem auto;
            padding: .2rem .2rem;
            position: relative;
            width:85%;
            box-shadow: 0 .04rem .2rem #e8e8e8;

            .duty_name {    //任务名称
                width: 100%;
                font-size: .32rem;          // 1rem=100px 手机像素2：1 这里原字体大小为16px        
                max-height: 1rem;
                overflow : hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                .duty_status {  //任务状态
                    font-size:.24rem;       // 这里原字体大小为14px
                    color: #fff;
                    // margin-right: .1rem;
                    .duty_status_name {
                        background: #26AB28;
                        display: inline-block;
                        padding: 0 .1rem;
                        border-radius: .24rem;
                    }
                    .duty_status_info {  //进行中
                        padding: 0 .1rem;
                        display: inline-block;
                        border-top-right-radius: .24rem;
                        border-bottom-right-radius: .24rem;
                    }
                    .duty_process_c {
                        background: #26AB28;
                    }
                    .duty_wait_c {
                        background: #FADB51;
                        color: #000;
                    }
                    .duty_urgent_c {
                        background: #E34E43;
                    }
                }
            }
            .duty_btm {
                height: .48rem;
                line-height: .48rem;

                .duty_code {    //任务编码
                    float: left;
                    font-size: .3rem;
                    color: #7D7D7D;
                    font-weight: 200;

                    .duty_crt_man { // 任务创建者
                        position: relative;
                        background: #333;
                        font-size: 0.24rem;
                        color: #FDF6A4;
                        padding: .04rem;
                        
                    }
                    .duty_crt_man:before{   //左尖角
                        position: absolute;
                        content: "";
                        width: 0;
                        height: 0;
                        top: 0;
                        left: -.08rem;
                        border-right: .08rem solid #333;
                        border-bottom: .08rem solid transparent;                    
                    }
                }
                .duty_time {    //任务创建时间
                    float: right;
                    font-size: .3rem;
                    color: #7D7D7D;
                    font-weight: 200;
                }
            }
            .red_caution {  //红点
                width: 0.12rem;
                height: 0.12rem;
                background: red;
                border-radius: 50%;
                position: absolute;
                left: .01rem;
                top: .4rem;
            }
        }
    }
</style>
