<!--消息页面-->
<template>
    <div class="group-info msg-wrapper">
         <div class="msg-header">
            <div class="goback" @click="goBack()">
                <-
            </div>
            <div class="body">
                聊天信息<span v-if="group.groupType == 'G'">({{}})</span>
            </div>
         </div>
        
    </div>
</template>
<script>
export default {
    props:['group'],
    data(){
        return {

        }
    },
    methods:{
        goBack(){
            this.$router.replace('/msg/group');
        }
    }
}
</script>
<style>
</style>