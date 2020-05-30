<template>
    <div class="page">
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
                width:100%;
                background-color: white;
            }
        }
      
   }

   .page-body-hasNav{
       width: 100%;
        height: 100%;
   }
</style>