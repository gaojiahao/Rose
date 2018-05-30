<template>
    <div class="pages">
        <div class='home_scroll' ref='bescroll'>
            <div class='scroll_container' ref='content'>          
                <div class="p_mod">
                    <div class="wea_mod">{{this.week}}</div>
                    <div class="p_info">
                        <img class="p_head" :src="userinfo.avatar" alt="aspect">
                        <p class="p_name">{{userinfo.name}}</p>
                        <p class="p_dep">{{userinfo.department}}</p>
                    </div>
                    <div class="p_tips" v-if="listData.length > 0 &&listData.length<=6" @click='goTODO'>您最近收到 <span class="tips_nums">{{listData.length}}</span> 个新消息</div>
                    <div class="p_tips" v-else-if="listData.length > 6" @click='goTODO'>您最近收到 <span class="tips_nums">6</span> 个新消息</div>
                    <div class="p_tips" v-else-if="listData.length === 0">
                        <i class="iconfont icon-dengguang"></i> 
                        没有待办一身轻松
                    </div>
                </div>
                <div class="msg_mod">
                    <div class="wait_mod">
                        <div class="wait_title_mod">
                            <p class="btm_text">PENDING</p>
                            <div class="xx_title">您的新待办
                                <span class="check_all" @click='goTODO'>
                                    查看全部
                                    <x-icon class="right_arrow" type="ios-arrow-forward" size="12" ></x-icon>
                                </span>
                            </div>
                        </div>
                        <div class="wait_list_mod swiper-container">
                                <div class="wait_list swiper-wrapper" >
                                    <template v-if="listData.length > 0">
                                        <div 
                                            class="each_duty swiper-slide"
                                            v-for='(item,index) in listData'
                                            :key='index'
                                            v-if='index<6'>
                                            <div class="duty_top">
                                                <p class="duty_name">
                                                    <span class="duty_status">
                                                        <span class="duty_status_name">{{item.statusName}}</span><span class="duty_status_info duty_wait_c">待处理</span>
                                                    </span>
                                                    <span class="duty_name_text">{{item.requireName}}</span>
                                                </p>
                                            </div>
                                            <div class="duty_btm">
                                                <p class="duty_code">
                                                    {{item.code}}
                                                    <span class="duty_crt_man">{{item.crtName}}</span>
                                                </p>
                                                <p class="duty_time">{{item.time | filterTime}}</p>
                                            </div>
                                            <span class="red_caution"></span>
                                        </div>
                                    </template>
                                    <div class="when_null" v-else-if="listData.length === 0">
                                        <i class="iconfont icon-xiaolian"></i>
                                        <span>Perfection is achieved<br>not when there is nothing more to add<br>but when there is nothing left to take away</span>
                                    </div>
                                </div>
                        </div>
                    </div>
                    <div class="ar_mod">
                        <div class="ar_title_mod">
                            <p class="btm_text">PROCESSED</p>
                            <div class="xx_title">您的已办
                                <span class="check_all" @click='goDONE'>
                                    查看全部
                                    <x-icon class="right_arrow" type="ios-arrow-forward" size="12" ></x-icon>
                                </span>
                            </div>
                        </div>
                        <div class="ar_list_mod" >
                                <div class="ar_list_top">
                                    <tab active-color='#3A3A3A'>
                                        <tab-item selected @on-item-click="onItemClick">实施</tab-item>
                                        <tab-item @on-item-click="onItemClick">产品</tab-item>
                                        <tab-item @on-item-click="onItemClick">BUG</tab-item>
                                    </tab>
                                </div>
                                <p v-if='showTaskList.length === 0' class='when_null_ar'>最近没有已处理的任务</p>
                                <div class="ar_list_main" v-else>
                                    <div class="each_duty"
                                        v-for='(item1,index1) in showTaskList'
                                        :index='index1'
                                        v-if='index1<6'
                                        @click='goDoneDetail(item1.businessKey)'>
                                        <div class="duty_top">
                                            <p class="duty_name">
                                                <span class="duty_status">
                                                    <span class="duty_status_name">{{item1.processName}}</span>
                                                </span>
                                                <span class="duty_name_text">{{item1.requireName}}</span>
                                            </p>
                                        </div>
                                            
                                        <div class="duty_btm">
                                            <p class="duty_code">
                                            {{item1.businessKey}}
                                                <span class="duty_crt_man">{{item1.crtName}}</span>
                                            </p>
                                            <p class="duty_time">{{item1.crtTime | filterTime}}</p>
                                        </div>
                                        
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>                        
            </div>
        </div>        
        <div class='loadding' v-if='showNews'>
            <spinner type='dots' size='50px'></spinner>
        </div>
    </div>
</template>

<script>
import { Tab, TabItem, numberPad, Spinner  } from 'vux'
import tokenService from '../service/tokenService'
import todoService from './../service/todoService'
import getDoneService from '../service/getDoneService'
import businessMap from './maps/business'
import BScroll from 'better-scroll'
let mySwiper
let bScroll
export default{
    data(){
        return {
            userinfo : {}, //用户信息
            week:'',       //星期几
            page: 1,       //数据默认查询的页数
            listData : [], //代办任务列表
            ssList : [],   //实施需求 列表
            cpList : [],   //产品需求列表
            bugList : [],  //bug列表
            showTaskList : [], //已办任务
            showNews : true,    //加载动画,
            scrollPosition:0    //滚动的位置
        }
    },
    components:{
        Tab, 
        TabItem,
        Spinner 
    },
    methods:{
        goTODO(){
            this.$router.push({ path:'/to_do' })
        },
        goDONE(){
            this.$router.push({ path:'/done' })
        },
        goDoDetail(code){
             this.$router.push({
                path : "/detail",
                query : {
                    transCode : code,
                    status : 'do'
                }
            })
        },
        goDoneDetail(code){
            this.$router.push({
                path : "/detail",
                query : {
                    transCode : code,
                    status : 'done'
                }
            })
        },
        onItemClick(i){
            if(i == 0){
                this.showTaskList = this.ssList;
            }
            else if(i == 1){
                this.showTaskList = this.cpList;
            }
            else if(i == 2){
                this.showTaskList = this.bugList;
            }

        },
        //获取当天时间
        getDate(){
            let date = new Date(),
                myday = date.getDay(),
                xingqi = '';
            switch(myday) 
            { 
                case 0 : xingqi = "星期日"; break; 
                case 1 : xingqi = "星期一"; break; 
                case 2 : xingqi = "星期二"; break; 
                case 3 : xingqi = "星期三"; break; 
                case 4 : xingqi = "星期四"; break; 
                case 5 : xingqi = "星期五"; break; 
                case 6 : xingqi = "星期六"; break; 
                default : xingqi = "系统错误！" 
            } 
            this.week = xingqi;
        },
        // TODO 获取状态名字
        getStatusName(item) {
            let business = item.businessKey.split('_');
            return businessMap[business[0]] || '未知项';
        },
        // TODO 获取代办列表
        getTodoList() {
            return new Promise((resolve, reject) => {
                todoService.getList({
                    page: this.page
                }).then( data => {
                    let tmpList = [];
                    data.tableContent.map( item => {
                        let date = new Date().getTime(),
                            oldDate = new Date(item.startTime).getTime(),
                            days = date-oldDate,
                            time  = parseInt(days / (1000 * 60 * 60 * 24));
                        if(item.status === '进行中' && !item.endTime){
                            let obj = Object.assign({}, {
                                statusName: this.getStatusName(item),
                                requireName: item.requireName || '见详情',
                                code: item.businessKey || '',
                                crtName: item.crtName,
                                time: item.crtTime,
                            });
                            tmpList.push(obj);
                        }
                       
                    });
                    
                    this.listData = tmpList;                    
                    resolve();
                })
            })
        },
        //获取所有已办列表
        getDoneList(){
            return new Promise((resolve, reject) => {
                let jsonPage = {
                    page: 1,
                    start: 0,
                    limit: 10,
                    noCount: 1
                }
                getDoneService.getDoneList(jsonPage).then(res => {
                        res.tableContent.map(item => {
                        item.processName = this.getStatusName(item);
                        if (item.businessKey.indexOf('SSXQ') >= 0) {
                            this.ssList.push(item);
                            this.showTaskList.push(item);
                        }
                        else if (item.businessKey.indexOf('CPXQ') >= 0) {
                            this.cpList.push(item)
                        }
                        else if (item.businessKey.indexOf('CSBUG') >= 0) {
                            this.bugList.push(item)
                        }
                        
                    })
                    resolve()
                    this.showNews = false;
                })
            })
        },
    },
    filters: {
      // TODO 过滤日期
      filterTime(val) {
        let date = new Date(val.replace(/-/g, '/'));
        return `${date.getFullYear()}-${numberPad(date.getMonth() + 1)}-${numberPad(date.getDate())}`;
      }
    },
    mounted(){
        // 左右滑动
        let Swiper = this.Swiper;
            mySwiper = new Swiper ('.swiper-container', {
                preventClicks : false,
                direction: 'horizontal',
                slidesPerView: 'auto',
                observer:true, //修改swiper自己或子元素时，自动初始化swiper
                observeParents:true,//修改swiper的父元素时，自动初始化swiper
                on:{
                    click: ()=>{
                        var index = mySwiper.activeIndex;
                        this.$router.push({
                            path : "/detail",
                            query : {
                                transCode : this.listData[index].code,
                                status : 'do'
                            }
                        })
                    },
                },
            })      
    },
    updated(){ 
        mySwiper.update();
    },
    created(){
        (async() => {
            this.getDate();
            await tokenService.getToken();
            let info = localStorage.getItem('ROSE_LOGIN_TOKEN');
            info = JSON.parse(info);
            this.userinfo = {
                name : info.name,
                avatar : info.avatar,
                department : info.department
            }
            let position = localStorage.getItem('SAVE_POSITION');  
            Promise.all([this.getTodoList(),this.getDoneList()]).then(() => {
                this.$nextTick(() => {
                    bScroll = new BScroll(this.$refs.bescroll,{
                        click:true,
                        startY:Number(position),
                        bounce: {
                            top: false,
                            bottom: false
                        }
                    })
                    bScroll.on('scrollEnd',res=>{
                        this.scrollPosition = res.y;
                    })
                })
            })
            
        })()
    },
    beforeRouteEnter: (to, from, next) => {
        if(from.path === '/'){
            localStorage.setItem('SAVE_POSITION',0)
        }
        next()
    },
    beforeRouteLeave(to, from, next){
        localStorage.setItem('SAVE_POSITION',this.scrollPosition);       
        next()
    }
}
</script>
<style lang='scss' scoped>
    .home_scroll{
        position: fixed;
		top: 0;
		bottom: 0;
        width:100%;
        overflow: hidden; 
    }
    .when_null {
        width: 100%;
        font-size: .28rem;
        text-align: center;
        position: absolute;
        top: 50%;
        transform: translate(0,-50%);
        color: #A3A3A3;
    }
    .when_null_ar {
        width: 100%;
        font-size: .28rem;
        text-align: center;
        color: #A3A3A3;
        margin-top: 0.2rem;
    }
    .xx_mod_title { //每个模块顶部的title样式
        width: 100%;
        height: .8rem;
        line-height: .8rem;
        text-align: center;
        position: relative;
        .btm_text {
            width: 100%;
            font-size: .38rem;
            color: #F9F9F9;
            position: absolute;
            top: .15rem;
            z-index: 0;
        }
        .xx_title {
            width: 100%;
            font-size: .34rem;
            font-weight: bold;
            position: relative;
            z-index: 99;
            color: #3A3A3A;
            .check_all {
                font-size: .24rem;
                color: #A3A3A3;
                position: absolute;
                top: 0;
                right: 0;
                display: flex;
                align-items: center;                    
            }
            .right_arrow{
                fill:#D2D2D2;
            }
        }
    }
    .scroll_container {    
        .p_mod {
            width: 90%;
            height: 4rem;
            position: relative;
            margin: 0.2rem auto;
            box-shadow: 0 .04rem .2rem #e8e8e8;

            .wea_mod {   //天气
                width: 100%;
                height: .6rem;
                line-height: .6rem;
                font-size: 0.28rem;
                padding: 0 .1rem;
                color: #8E8E8E;
                font-weight: bold;
                text-align: right;
                box-sizing: border-box;
            }
            .p_info{
                text-align: center;
                .p_head {    //头像
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 50%;
                }
                .p_name,
                .p_dep {
                    font-size: 0.28rem;
                    font-weight: 200;
                }
            }
            .p_tips {
                width: 100%;
                text-align: center;
                font-weight: 200;
                position: absolute;
                left: 0;
                bottom: 0;
                .tips_nums {
                    font-weight: bold;
                }
            }
        }
        .msg_mod {
            width: 90%;
            margin: 0 auto;
            position: relative;
            .wait_mod {
                margin-top: .6rem;
                .wait_title_mod {
                    @extend .xx_mod_title            
                }
                .wait_list_mod {
                    width: 100%;
                    height: 2rem;
                    margin-top:.1rem;
                    .wait_list {
                        height: 1.4rem;
                        .each_duty {        //任务栏
                            width: 80%;
                            margin: .05rem;
                            padding: .2rem .2rem;
                            position: relative;
                            box-shadow: 0 0 .1rem #e8e8e8;
                            .duty_top {
                                // max-width: 6rem;
                                .duty_name {    //任务名称
                                    width: 100%;
                                    font-size: .3rem;          // 1rem=100px 手机像素2：1 这里原字体大小为16px         
                                    max-height: 1rem;
                                    overflow : hidden;
                                    text-overflow: ellipsis;
                                    display: -webkit-box;
                                    -webkit-line-clamp: 2;
                                    -webkit-box-orient: vertical;
                                    .duty_status {  //任务状态
                                        font-size:.24rem;       // 这里原字体大小为14px
                                        color: #fff;
                                        margin-right: .1rem;
                                        .duty_status_name {
                                            height: .3rem;
                                            line-height: .3rem;
                                            background: #000;
                                            display: inline-block;
                                            padding: 0 .1rem;
                                            border-top-left-radius: .24rem;
                                            border-bottom-left-radius: .24rem;
                                        }
                                        .duty_status_info {  //进行中
                                            height: .3rem;
                                            line-height: .3rem;
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
                                    .duty_name_text {   
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
                                        left: -.05rem;
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
                }
            }
            .ar_mod {
                position: relative;
                margin-top: .6rem;
                .ar_title_mod {
                    @extend .xx_mod_title
                }
                .ar_list_mod {
                    box-sizing: border-box;
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                    .no_task{
                        line-height: 0.8rem;
                        text-align: center;
                    }
                    .ar_list_main {
                        padding: 0.2rem;
                        .each_duty {        //任务栏
                            margin: .4rem auto;
                            padding: .2rem .2rem;
                            position: relative;
                            // width:85%;
                            box-shadow: 0 0 .1rem #e8e8e8;

                            .duty_name {    //任务名称
                                width: 100%;
                                font-size: .3rem;          // 1rem=100px 手机像素2：1 这里原字体大小为16px        
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
                                        height: .3rem;
                                        line-height: .3rem;
                                        background: #26AB28;
                                        display: inline-block;
                                        padding: 0 .1rem;
                                        border-radius: .24rem;
                                    }
                                    .duty_status_info {  //进行中
                                        height: .3rem;
                                        line-height: .3rem;
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
                                        left: -.05rem;
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
                }
            }
        }
        
    }
    .loadding{
        position: relative;
        width:100%;
        height:100%;
        background: #fff;
        .vux-spinner{
            position: absolute;
            left:50%;
            top:50%;
            margin-top:-25px;
            margin-left:-25px;
        }
    }
</style>
