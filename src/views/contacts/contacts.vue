<!--通讯录-->
<template>
    <div class="address-book-wrapper page-hasTab">
        <div class="page-navigation flex" v-if="hasNav">
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
        <div v-for="item in address" class="address-item" :key="item.id" @click="goto(item)" v-show="item.id != 7">
            <div class="header">
                <img :src="item.photo"  v-if="item.type=='P'"  @error="getDefaultPhoto(item)"/>
                <i class="address-icon iconfont icon-wenjian " v-if="item.type!='P' && !item.leaf"></i>
                <i class="address-icon iconfont icon-file-f" v-if="item.type!='P' && item.leaf"></i>
            </div>
            <div class="body">
                <div class="address-name-g">
                    {{item.name}}
                </div>
            </div>
        </div>
        </RScroll>
        <router-view></router-view>
    </div>
</template>
<script>
import {getAddressBook} from 'service/msgService'
import RScroll from "plugins/scroll/RScroll";
import WebContext from 'service/commonService'
export default {
    data(){
        return {
            hasNav:false,
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
        RScroll
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
           }else if(item.type==='P'){
               this.$router.push({name:'userInfo',params:{uId:item.id}})
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
        this.bus.$on('refresh',()=>{ //登录后刷新
            var item = this.routes.length && this.routes[0];
            if(item)this.goto(item)//所有人的通讯录都一样，但是还是要刷新下。
        })
        this.hasNav = this.getApp().hasNav;
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
        width: .45rem;
        height: .45rem;
        text-align: center;
        background-color: #48acd929;
        border-radius: .02rem;
       .address-icon{
        font-size: .32rem;
            @include font_color();
        }
   }
   .address-item .header img{
       width:.45rem;
       vertical-align: top;
       height:.45rem;
       border-radius: .02rem;
   }
   .address-item .body{
       flex: 1;
       padding-left: .1rem;
   }
   .goback i{
       font-size: 30px;
   }
   
</style>
