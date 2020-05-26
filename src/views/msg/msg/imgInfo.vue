<template>
    <div class="page">
        <!-- <div class="page-navigation flex">
            <div class="goback" @click="$router.go(-1)">
                <i class="iconfont icon-back1"></i>
            </div>
            <div style="margin-right:10px">{{name}}</div>
        </div> -->
        <div class="page-body-hasNav" @click="$router.go(-1)">
            <div class="imgPerview">
                <span>
                     <img :src="src"/>
                </span>
               
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return {
            name:'',
            src:''
        }
    },
    created(){
        var  baseURL = window.baseURL||'';
        this.getApp().hasTab = false;
        this.name = this.$route.query.name;
        this.src = baseURL + '/H_roleplay-si/ds/downloadById?id='+ this.$route.params.id;
    }
}
</script>
<style lang="scss">
   .imgPerview{
       text-align: center;
        width: 100%;
        height: 100%;
        display: table;
        span{
            display: table-cell; 
            vertical-align: middle; 
            background: black;
            img{
                width:100%
            }
        }
      
   }

   .page-body-hasNav{
       width: 100%;
        height: 100%;
   }
</style>