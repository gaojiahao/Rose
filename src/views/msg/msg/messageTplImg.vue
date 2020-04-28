<template> 
    <div class="img-msg-content ">
        <img :src="baseURL+'/H_roleplay-si/ds/downloadById?id='+ content.id" height="100" />
    </div>
</template>

<script>
export default {
    props:{
        msg:{
            type:Object,
            default(){
                return {}
            }
        }
    },
    created(){
        try{
            var json = JSON.parse(this.msg.content);
            this.content = json;
        }catch(e){
            console.log('msg content parse error',this.msg.content);
        }
    },
    data(){
        return {
            baseURL:window.baseURL||'',
            content:null
        }
    }
}
</script>
<style lang="less">
.img-msg-content{
   overflow: hidden;
   img{
    height:100px;
   }
}
</style>