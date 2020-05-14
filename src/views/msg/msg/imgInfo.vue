<template>
    <div class="page">
        <div class="page-navigation flex">
            <div class="goback" @click="$router.go(-1)">
                <i class="iconfont icon-back1"></i>
            </div>
            <div style="margin-right:10px">{{name}}</div>
        </div>
        <div class="page-body-hasNav">
            <div class="imgPerview">
                <img :src="src"/>
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
        this.name = this.$route.query.name;
        this.src = baseURL+'/H_roleplay-si/ds/downloadById?id='+ this.$route.params.id;
    }
}
</script>
<style lang="scss">
   .imgPerview{
       img{
           width:100%
       }
   }
</style>