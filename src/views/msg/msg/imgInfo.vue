<template>
    <div class="page">
        <div class="page-body">
            <div class="imgPerview">
                <span>
                     <img  :src="src" preview="1" ref="img"/>
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
    methods:{
        onPerviewClose(){
           this.$router.go(-1);
        }
    },
    mounted(){
        this.$refs.img.click();
    },
    created(){
        var  baseURL = window.baseURL||'';
        this.getApp().hasTab = false;
        this.name = this.$route.query.name;
        this.src = baseURL + '/H_roleplay-si/ds/downloadById?id='+ this.$route.params.id;
        this.$event.$on('previewClose',this.onPerviewClose);
    },
    destroyed(){
        this.$event.$off('previewClose',this.onPerviewClose);
    }
}
</script>

<style lang="scss" scoped>
    .page-body{
        height: 100%;
    }
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
</style>