<template>
    <div class="pages">
        <div class='content mescroll' id='mescroll'  ref='mescroll'>
            <div class="h_top">
                <div class="h_title">您最近使用的</div>
                <img class="h_avatar" :src="avatar" @click='goNews'/>
            </div>
            <div class="h_main">
                <!-- 最近使用的应用 -->
                <div class="re_use swiper-container">
                    <div class="re_use_list swiper-wrapper">
                        <router-link :to="{path:'/detail',query:{code:'XSDD'}}" class="each_list swiper-slide vux-1px-t" >
                            <div class="app_type">业务类应用</div>
                            <div class="app_name">销售订单</div>
                            <div class="app_info">填写自己的财富</div>
                            <div class="app_show" style="background:url('/static/assets/so01.jpeg') ;background-size:cover"></div>
                        </router-link>
                        <router-link to="/materApp" class="each_list swiper-slide vux-1px-t">
                            <div class="app_type">业务类应用</div>
                            <div class="app_name">物料</div>
                            <div class="app_info">我们随需而变</div>
                            <div class="app_show" style="background:url('/static/assets/cg02.jpg') -4px -4px;background-size:cover"></div>
                        </router-link>
                        <router-link to='' class="each_list swiper-slide vux-1px-t" @click='goNews'>
                            <div class="app_type">通知类</div>
                            <div class="app_name">消息</div>
                            <div class="app_info">Anytime Anywhere</div>
                            <div class="app_show" style="background:url('/static/assets/message.jpg');background-size:cover"></div>
                        </router-link>
                    </div>
                </div>
                <!-- 开发类应用 -->
                <div class="obj_app swiper-container">
                    <div class="obj_title vux-1px-t">开发类</div>
                    <div class="obj_main swiper-wrapper">
                        <div class="obj_app_list swiper-slide" v-for='(item,index) in kfList' :key='index'>
                            <div class="each_app" v-for='(tab,i) in item' :key='i' @click="getTask(tab)">
                                <div class="app_bg">
                                    <img :src='`/dist/${tab.icon}`'/>
                                    <badge :text="tab.taskTotal" class="red_caution" v-if='tab.taskTotal'></badge>
                                </div>
                                <div class="app_info" :class="{'vux-1px-b':i<2}">
                                    <div class="app_name">{{tab.text}}</div>
                                    <div class="app_tx">{{tab.instruction}}</div>
                                </div>
                            </div>
                        </div>
                    </div>    
                </div>
                <!-- 业务类应用 -->
                <div class="obj_app swiper-container">
                    <div class="obj_title vux-1px-t">运营与测试</div>
                    <div class="obj_main swiper-wrapper">
                        <div class="obj_app_list swiper-slide" v-for='(item,index) in csList' :key='index'>
                            <div class="each_app" v-for='(tab,i) in item' :key='i' @click="getTask(tab)">
                                <div class="app_bg">
                                    <img :src='`/dist/${tab.icon}`'/>
                                    <badge :text="tab.taskTotal" class="red_caution" v-if='tab.taskTotal'></badge>
                                </div>
                                
                                <div class="app_info" :class="{'vux-1px-b':i<2}">
                                    <div class="app_name">{{tab.text}}</div>
                                    <div class="app_tx">{{tab.instruction}}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 综合 -->
                <div class="mix_app  swiper-container">
                    <div class="mix_app_top vux-1px-t">综合<span class="check_all" @click="getAll">查看全部</span></div>
                    <div class="mix_app_list swiper-wrapper">
                        <div class="each_list swiper-slide ">
                            <div class="app_info_tx">这里可以提交和审批相应的费用</div>
                            <div class="app_show" style="background:url('/static/assets/kf_app/bx.jpeg') 0 -2px;background-size:cover"></div>
                            <div class="app_info_part vux-1px-b" >
                                <div class="app_bg" style="background:url('/static/assets/kf_app/fybx.png');background-size:cover">
                                    <badge :text="bxBadge" class="red_caution" v-if='bxBadge != ""'></badge>
                                </div>
                                <div class="app_info">
                                    <div class="app_name">费用报销</div>
                                    <div class="app_type">业务应用</div>
                                </div>
                            </div>
                        </div>
                        <div class="each_list swiper-slide ">
                            <div class="app_info_tx">提交你的请假申请</div>
                            <div class="app_show" style="background:url('/static/assets/kf_app/qj.jpeg') 0 -2px;background-size:cover">
                            </div>
                            <div class="app_info_part vux-1px-b" >
                                <div class="app_bg" style="background:url('/static/assets/kf_app/qj.png');background-size:cover">
                                    <badge :text="qjBadge" class="red_caution" v-if='qjBadge != ""'></badge>
                                </div>
                                <div class="app_info">
                                    <div class="app_name">请假</div>
                                    <div class="app_type">业务应用</div>
                                </div>
                            </div>
                        </div>
                        <div class="each_list swiper-slide">
                            <div class="app_info_tx">这里可以提交代码发布申请</div>
                            <div class="app_show" style="background:url('/static/assets/kf_app/dm.jpg') 0 -2px;background-size:cover"></div>
                            <div class="app_info_part vux-1px-b"  >
                                <div class="app_bg" style="background:url('/static/assets/kf_app/dmfb.png');background-size:cover">
                                    <badge :text="dmBadge" class="red_caution" v-if='dmBadge !="" '></badge>
                                </div>
                                <div class="app_info">
                                    <div class="app_name">代码发布申请</div>
                                    <div class="app_type">业务应用</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class='loadding' v-if='loadStatus'>
            <spinner type='dots' size='50px'></spinner>
        </div>
        
    </div>

</template>

<script>
import { Badge ,Spinner,AlertModule} from 'vux';
import homeService from '../service/homeservice.js'
export default {
    data(){
        return {
            kfList:[],             //开发类任务
            csList:[],             //测试运营任务
            zhList:[],             //综合任务
            avatar:'/static/assets/avatar.png',             //头像
            loadStatus:true,       
            dmBadge:'',            //代码发布申请任务数量
            qjBadge:'',            //请假任务数量
            bxBadge:'',             //报销任务数量
            Homescroll : null
        }

    },
    components:{
        Badge,
        Spinner
    },
    methods:{
        // 消息页面
        goNews(){
            this.$router.push('/news/home')
        },
        // 综合页面
        getAll(){
             this.$router.push({
                 path:'/allapply',
                 query:{
                     list:JSON.stringify(this.zhList)
                 }

             })
        },
        // 用户的数据列表
        getTask(item){
            this.$router.push({
                path : '/list',
                query : {
                    title : item.text,
                    listId : item.listId
                }
            })
        },
        // 销售订单
        goSO(){
            this.$router.push({ path: '/soDetail'})
        }
    },
    created(){
        (async()=>{
            let taskNumList = [];
            //获取我的任务
            await homeService.getMyTask().then(data =>{
                taskNumList = data.tableContent;
            }).catch(e => {
                AlertModule.show({
                    content: e.message,
                })
            });
            //获取应用菜单列表
            await homeService.getMeau().then( data=>{
                data.map( item=>{
                    if(item.text === '业务应用'){ 
                        let arr = [] ;                 
                        item.children && item.children.map( item1=>{
                            item1.children.map( res=>{
                                let index = res.url.indexOf('/')+1,
                                    id = res.url.slice(index);
                                res.listId = id;
                                taskNumList.map( num=>{
                                    if(res.listId === num.listId){
                                        res.taskTotal = JSON.stringify(num.total);
                                    }
                                })
                            })
                            if(item1.text === '开发'){
                                while(item1.children.length > 0){
                                    let list = item1.children.splice(0,3);
                                    this.kfList.push(list);
                                }   
                            }
                            else if(item1.text === '运营' || item1.text === '测试'){
                                arr = arr.concat(item1.children);                            
                            }
                            else if(item1.text === '综合'){
                                this.zhList = item1.children;
                                item1.children.map(res=>{
                                    if(res.text === '代码发布申请'){
                                        if(res.taskTotal){
                                            this.dmBadge = res.taskTotal;
                                        }
                                        

                                    }
                                    else if (res.text === '请假'){
                                        if(res.taskTotal){
                                            this.qjBadge = res.taskTotal;
                                        }
                                        
                                    }
                                    else if(res.text === '费用报销'){
                                         if(res.taskTotal){
                                            this.bxBadge = res.taskTotal;
                                        }
                                        
                                    }
                                })
                            }
                        })
                        while(arr.length>0){
                            let list = arr.splice(0,3);
                            this.csList.push(list);

                        }
                        
                    }   
                })
                this.loadStatus = false;
            }).catch(e => {
                AlertModule.show({
                    content: e.message,
                })
            });
            
            let info = localStorage.getItem('ROSE_LOGIN_TOKEN');
            info = JSON.parse(info);
            this.avatar  =  info.avatar;
        })()

    },
    mounted(){
        let Swiper = this.Swiper;
        // 左右滑动
        new Swiper('.re_use', {
            direction: 'horizontal',
            centeredSlides: true,
            slidesPerView: 'auto',
            observer: true, //修改swiper自己或子元素时，自动初始化swiper
            observeParents: true,//修改swiper的父元素时，自动初始化swiper
        })
        new Swiper('.obj_app', {
            direction: 'horizontal',
            centeredSlides: true,
            slidesPerView: 'auto',
            pagination: {
                el: '.swiper-pagination',
            },
            observer: true, //修改swiper自己或子元素时，自动初始化swiper
            observeParents: true,//修改swiper的父元素时，自动初始化swiper
        })
        new Swiper('.mix_app', {
            direction: 'horizontal',
            centeredSlides: true,
            slidesPerView: 'auto',
            observer: true, //修改swiper自己或子元素时，自动初始化swiper
            observeParents: true,//修改swiper的父元素时，自动初始化swiper
        })
        //上下滑动
        let Mescroll = this.Mescroll;
        this.Homescroll = new Mescroll("mescroll", {
            up: {
                use: false,
                isBounce: false
            },
            down: {
                use: false,
                auto: false
            }
        })
        
    },
    updated(){
        // Swiper.updated();
        let position = localStorage.getItem('SAVE_HOME_POSITION');
        if (position) {
            this.$nextTick(function () {
                this.Homescroll.scrollTo(position, 0);
            });
        }
    },
    beforeRouteEnter: (to, from, next) => {
      if (from.path === '/') {
        localStorage.setItem('SAVE_HOME_POSITION', 0)
      }
      next()
    },
    beforeRouteLeave(to, from, next) {
      let scrollTop = this.$refs.mescroll.scrollTop;
      localStorage.setItem('SAVE_HOME_POSITION', scrollTop);
      next()
    }
}
</script>

<style lang='scss'>
.loadding { //加载动画
    position: absolute;
    left:0;
    top:0;
    bottom:0;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index:100;
    .vux-spinner {
        position: absolute;
        left: 50%;
        top: 50%;
        margin-top: -25px;
        margin-left: -25px;
    }
}
.content{
    width:100%;
    position: absolute;
    left:0;
    top:0;
    bottom:0;
}
.cm_width {
    width: 90%;
    margin: 0 auto;
}
.h_top {
    @extend .cm_width;
    box-sizing: border-box;
    // padding: 0 .1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .h_title {
        font-size: .34rem;
        display: inline-block;
    }
    .h_avatar {
        width: .35rem;
        height: .35rem;
        border-radius: 50%;
    }
}
.h_main {
    .re_use {
        width: 100%;
        margin-bottom: .2rem;
        .re_use_list {
            width: 100%;
            .each_list {
                width: 90%;
                margin: 0 5px;
                .app_type {     //应用类型
                    font-size: .14rem;
                    padding-top: .1rem;
                    color: #4F90F9;
                    font-weight: 500;
                }
                .app_name,
                .app_info {
                    font-size: .28rem;
                    line-height: .35rem;
                }
                .app_name {     //应用名称
                    color: #333;
                }
                .app_info {     //应用介绍
                    color: #99999D;
                    font-weight: 200;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .app_show {     //应用配图
                    height: 2rem;
                    margin-top: .1rem;
                    background: url('../assets/jg01.jpg');
                    background-size: cover;
                    border-radius: .06rem;
                }
            }
        }
    }
    .obj_app {
        width: 100%;
        .obj_title {
            @extend .cm_width;
            padding-top: .08rem;
            font-size: .26rem;
        }
        .obj_main {
            width: 100%;
            .obj_app_list {
                width: 90%;
                margin: 0 .05rem .2rem;
                .each_app {
                    display: flex;
                    align-items: center;
                    margin:10px 0;
                    .app_bg {
                        flex: 1;
                        position: relative;
                        img{
                            width:.7rem;
                            height: .7rem;
                            border-radius: .14rem;
                        }
                        .red_caution {
                            position: absolute;
                            right: -.06rem;
                            top: -.04rem;
                        }
                    }
                    .app_info {
                        flex: 3.5;
                        margin-left: .2rem;
                        padding: .2rem 0;
                        .app_name {
                            font-size: .18rem;
                            font-weight: 500;
                            color: #333;
                        }
                        .app_tx {
                            color: #99999D;
                            font-weight: 200;
                            max-width: 2.4rem;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }
                }
               
            }
        }
    }
    .mix_app {
        width: 100%;
        margin-bottom: .2rem;
        .mix_app_top {
            @extend .cm_width;
            padding-top: .08rem;
            font-size: .26rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .check_all {
                font-size: .2rem;
                color: #4F90F9;
            }
        }
        .mix_app_list {
            width: 100%;
            .each_list {
                width: 90%;
                margin: 0 5px;
                .app_name {     //应用名称
                    color: #333;
                    font-size: .2rem;
                    line-height: .3rem;
                }
                .app_info_tx {     //应用介绍
                    color: #99999D;
                    font-weight: 200;
                    font-size: .2rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .app_show {     //应用配图
                    height: 2rem;
                    margin-top: .1rem;
                    background: url('../assets/jg01.jpg');
                    background-size: cover;
                    border-radius: .06rem;
                }
                .app_info_part {    //应用
                    display: flex;
                    align-items: center;
                    padding: .1rem 0;
                    .app_bg {
                        flex: 1;
                        width: .7rem;
                        height: .7rem;
                        border-radius: .14rem;
                        position: relative;
                        .red_caution {
                            position: absolute;
                            right: -.06rem;
                            top: -.04rem;
                        }
                    }
                    .app_info {
                        flex: 3.5;
                        margin-left: .2rem;
                        padding: .2rem 0;
                        .app_name {
                            font-size: .18rem;
                            font-weight: 500;
                            color: #333;
                        }
                        .app_tx {
                            color: #99999D;
                            font-weight: 200;
                            max-width: 2.4rem;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }
                    .app_type {     //应用类型
                        font-size: .14rem;
                        color: #4F90F9;
                        font-weight: 500;
                    }
                }
            }
        }
    }
}
</style>
