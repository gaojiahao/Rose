<template>
    <div class="mult-msg-context">
        <template v-for="file in content" v-bind="key">
           
            <!-- <br /> -->
            <div v-if="file.imType==2" @click="imgClick(file.content)">
                 <img height="100" :src="baseURL+'/H_roleplay-si/ds/downloadById?id='+ file.content.id" />
            </div>
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
    methods:{
        imgClick(content){
            this.$router.push({
                name:'imgInfo',
                params:{id:content.id},
                query:{name:content.conent}
            })
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