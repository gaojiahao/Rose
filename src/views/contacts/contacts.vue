<!--通讯录-->
<template>
    <div class="address-book-wrapper page-hasTab">
        <div class="page-navigation flex">
             <div class="goback" v-if="routes.length">
                <i class="iconfont icon-back1" @click="goBack()" ></i>
            </div>
             {{addressName}}
        </div>
        <RScroll 
            class="page-body-hasNav" 
            :options="scrollOptions"
            :has-next="hasNext"
            :no-data="false"
        >
        <!-- <div class="page-body-hasNav" ref="scrollerWrapper">
            <div class="address-book"> -->
                <div v-for="item in address" class="address-item" :key="item.id" @click="goto(item)" v-show="item.id != 7">
                    <div class="header">
                        <img :src="item.photo"  v-if="item.type!='G'"  @error="getDefaultPhoto(item)"/>
                        <i class="address-icon iconfont" v-if="item.type=='G'">&#xe62b;</i>

                    </div>
                    <div class="body">
                        <div class="address-name-g" v-if="item.type == 'P'">
                            {{item.name}}-{{item.type}}
                        </div>
                        <div class="address-name-p" v-if="item.type == 'G'">
                            {{item.name}}-{{item.type}}
                        </div>
                    </div>
                </div>
            <!-- </div>
        </div> -->
        </RScroll>
        <router-view></router-view>
        <!-- 用户详情 -->
        <user-detail ref="userDetail" :userId="userId"></user-detail>
    </div>
</template>
<script>
import {getAddressBook} from 'service/msgService'
import RScroll from "plugins/scroll/RScroll";
import WebContext from 'service/commonService'
import UserDetail from '../msg/msg/userDetail';
export default {
    data(){
        return {
            hasNext:true,
            scrollOptions:{
                click: true,
                pullUpLoad: false,//上拉刷新
                pullDownRefresh: false //下拉刷新
            },
            addressName:'root',
            routes:[],
            address:null,
            userId: ""
        }
    },
    components:{
        RScroll,
        UserDetail
    },
    methods:{
        getDefaultPhoto(item) {
            let url = require("assets/ava01.png");
            if (item) {
                item.photo = url;
            }
            return url;
        },
        goto(item){
            var routerId = this.$route.params.id,
                routerName = this.$route.query.name;

           if(!item.leaf){
               if(item.id == routerId) return //避免产生重复路由错误    
               this.$router.push({name:'CONTACTS',params:{id:item.id},query:{name:item.name}},()=>{
                     this.routes.push({id:routerId,name:routerName});
               })
           }else{
               if(item.type==='P'){
                    this.userId = item.id;
                    this.$refs["userDetail"].showUserDetail = true;
               }
           }
        },
        goBack(){
           var item = this.routes.pop();
           this.$router.push({name:'CONTACTS',params:{id:item.id},query:{name:item.name}});
        },
        initAddress:function(router,cb){
            var params = router.params,
                query = router.query;
            this.addressName = query.name || '通讯录';
            this.address = [];
            this.hasNext = true;
            getAddressBook(params.id).then(rs=>{
                this.address = rs;
                this.hasNext = false;
                cb&&cb();
            })
        }
    },
    created(){
        this.initAddress(this.$route)
    },
    activated(){
    },
    beforeRouteUpdate(to,from,next){//向下一级或上一级变化
        this.initAddress(to,next);
    },
    mounted(){
        // var scrollWrapper = this.$refs.scrollerWrapper;
        // if(!scrollWrapper)return;
        // this.scroller = new this.Bscroll(scrollWrapper, {
        //     click: true,
        //     pullUpLoad: true,
        //     pullDownRefresh: true,
        // });
        // this.scroller.on('scroll', ({x, y}) => {
        //     if(Math.abs(y)>1000)
        //     this.toTopShow = true;
        //     else if(Math.abs(y)<1000)
        //     this.toTopShow = false; 
        // });
    }
}
</script>
<style lang="scss">
   .address-item{
       background:#fff;
       display: flex;
       padding: .05rem;
       position: relative;
       margin:0;
       height: .50rem;
       line-height: .50rem;
   }

   .address-item::after{
       content: " ";
        position: absolute;
        left: 65px;
        top: 0;
        right: 0;
        height: 1px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        color: rgba(0, 0, 0, 0.1);
        -webkit-transform-origin: 0 0;
        -ms-transform-origin: 0 0;
        transform-origin: 0 0;
        -webkit-transform: scaleY(0.5);
        -ms-transform: scaleY(0.5);
        transform: scaleY(0.5);
   }

   .address-item .header{
        width: .50rem;
        text-align: center;
        background-color: #07648f29;
        border-radius: .02rem;
       .address-icon{
        font-size: .32rem;
            @include font_color();
        }
   }
   .address-item .header img{
       width:0.5rem;
       vertical-align: top;
       height:0.5rem;
   }
   .address-item .body{
       flex: 1;
       padding-left: .1rem;
   }
   .goback i{
       font-size: 30px;
   }
   
</style>