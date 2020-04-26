<template>
    <div class="mult-msg-context" :class="[msg.isMySelf==1?'rightarrow':'leftarrow']"   >
        <template v-for="file in msg.content" v-bind="key">
            <img height="100" :src="baseURL+'/H_roleplay-si/ds/downloadById?id='+ file.id" v-if="file.imType==2"/>
            <div v-html="file.content" v-else-if="file.imType==1"></div>
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
    data(){
        return {
            baseURL:window.baseURL||''
        }
    }
}
</script>