<!--通讯录-->
<template>
    <div class="address-book-wrapper page-hasTab" ref="scrollerWrapper">
        <div class="address-book">
            <div v-for="item in address" class="address-item" :key="item.id" @click="toContactItem(item)">
                <div class="header">
                    <!-- <img :src="item.photo"  @error="getDefaultPhoto(item)"/> -->
                    <i class="address-icon iconfont" >&#xe62b;</i>
                </div>
                <div class="body">
                    <div class="address-name-g" v-if="item.type == 'P'">
                        {{item.name}}
                    </div>
                    <div class="address-name-p" v-if="item.type == 'G'">
                        {{item.name}}
                    </div>
                </div>
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>
<script>
import {getAddressBook} from 'service/msgService'
export default {
    data(){
        return {
            address:null
        }
    },
    methods:{
        getDefaultPhoto(item) {
            let url = require("assets/ava01.png");
            if (item) {
                item.photo = url;
            }
            return url;
        },
        toContactItem(item){

                //第一种写法
                // this.$router.push( { path: `/contacts/contactItem/${item.id}`});

                //第二种写法
                this.$router.push(
                    {
                        name:'contactItem',
                        params:{
                            groupId:item.id
                        }
                    }
                );
        }
    },
    filters:{
        photo(val){
           return val || '';
        }
    },
    created(){
        getAddressBook().then(rs=>{
            this.address = rs;
        })
    },
    mounted(){
        var scrollWrapper = this.$refs.scrollerWrapper;
        if(!scrollWrapper)return;
        this.scroller = new this.Bscroll(scrollWrapper, {
            click: true,
            pullUpLoad: true,
            pullDownRefresh: true,
        });
        this.scroller.on('scroll', ({x, y}) => {
            if(Math.abs(y)>1000)
            this.toTopShow = true;
            else if(Math.abs(y)<1000)
            this.toTopShow = false; 
        });
    }
}
</script>
<style lang="scss">
     @import '~@/scss/color.scss';
    .page-hasTab{
       height:calc(100% - 0.49rem);
       background:$weui-BG-0;
       overflow:hidden;
    }
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
        left: 80px;
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
        margin-right: 0.2rem;
        width: .58rem;
        text-align: center;
        background-color: #07648f29;
        border-radius: .01rem;
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
   }
   
</style>