<!--通讯录-->
<template>
    <div class="address-book-wrapper page-hasTab" ref="scrollerWrapper">
        <div class="address-book">
            <div v-for="item in address" class="address-item" :key="item.id">
                <div class="header">
                    <img :src="item.photo"  @error="getDefaultPhoto(item)"/>
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
       padding:0.1rem;
       position: relative;
       margin:0;
   }
   .address-item .header{
       margin-right:0.2rem;
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