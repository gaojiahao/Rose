<template>
    <div class="page">
        <div class="list_wrapper" ref='list'>
            <div class='list_content'>
                <div class="each_duty" v-for="(item, index) in listData" :key="index" @click='goDetail(item.code)'>
                    <div class="duty_top">
                        <p class="duty_name">
                            <span class="duty_status">
                            <span class="duty_status_name">{{item.statusName}}</span><span class="duty_status_info"
                                                                                            :class="item.statusClass">{{item.status}}</span>
                            </span>
                            {{item.requireName}}
                        </p>
                    </div>
                    <div class="duty_btm">
                        <p class="duty_code">
                            {{item.code}}
                            <span class="duty_crt_man">{{item.crtName}}</span>
                        </p>
                        <p class="duty_time">{{item.time | filterTime}}</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import { getList } from '../../../service/listService.js'
import BScroll from 'better-scroll'
const PULL_DOWN_REFRESH_HEIGHT = 30;
export default {
    data(){
        return{
            listBscrol:null,
            page : 1,
            limit :20,
            hasNext :true,
            pullDownTop: -PULL_DOWN_REFRESH_HEIGHT,

        }
    },
    methods:{
        getOrderList(){

        },
        initScroll(){
            this.$nextTick(()=>{
                this.listBscrol = new BScroll(this.$refs.list_wrapper,{
                    click: true,
                    pullDownRefresh: {
                        threshold: 50,
                        stop: 20
                    },
                    pullUpLoad:{
                        threshold :20
                    }
                })
                //上拉加载
                this.listBscrol.on('pullingUp',()=>{
                    if(!this.hasNext){
                        return
                    }
                    this.page++;
                    this.getOrderList()

                });
                //下拉刷新
                this.listBscrol.on('pullingDown',()=>{
                    this.page = 1;
                    this.getOrderList()

                })
                //滚动过程中文字提示
                this.listBscrol.on('scroll',({x,y})=>{
                    if(y>0){
                        if(y>PULL_DOWN_REFRESH_HEIGHT){
                            this.pullDownTop = 0
                        }
                    }

                })

            })
        }

    },
    created(){

    }

}
</script>

<style lang='scss' scoped>
.list_wrapper{
    width:100%;
    height: 100%;
    overflow: hidden;
    .each_duty{
        margin: .4rem auto;
        padding: .2rem .2rem;
        position: relative;
        width: 85%;
        box-shadow: 0 0.04rem 0.2rem #e8e8e8;
        .duty_name { //任务名称
            width: 100%;
            font-size: .32rem; // 1rem=100px 手机像素2：1 这里原字体大小为16px
            font-weight: bold;
            max-height: 1rem;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            .duty_status { //任务状态
            font-size: .24rem; // 这里原字体大小为14px
            color: #fff;
            margin-right: .1rem;
            display: inline-block;
            vertical-align: middle;
            margin-top: -2px;
            .duty_status_name,
            .duty_status_info {
                padding: 1px 4px;
            }
            .duty_status_name {
                background: #000;
                border-top-left-radius: .24rem;
                border-bottom-left-radius: .24rem;
            }
            .duty_status_info { //进行中
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

            .duty_code { //任务编码
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
            .duty_crt_man:before { //左尖角
                position: absolute;
                content: "";
                width: 0;
                height: 0;
                top: 0;
                left: -.06rem;
                border-right: .08rem solid #333;
                border-bottom: .08rem solid transparent;
            }
            }
            .duty_time { //任务创建时间
            float: right;
            font-size: .3rem;
            color: #7D7D7D;
            font-weight: 200;
            }
        }
    }
}

</style>
