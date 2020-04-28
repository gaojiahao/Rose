<template>
    <div class="mult-msg-context">
        <template v-for="file in content" v-bind="key">
            <img height="100" :src="baseURL+'/H_roleplay-si/ds/downloadById?id='+ file.id" v-if="file.imType==2"/>
            <div v-html="formatToEmotion(file.content)" v-else-if="file.imType==1"></div>
        </template>
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
            content:[]
        }
    }
}
</script>