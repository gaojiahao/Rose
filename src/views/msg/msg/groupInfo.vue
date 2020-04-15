<!--消息页面-->
<template>
    <div class="group-info page">
         <div class="page-navigation flex">
            <div class="goback" @click="goBack()">
                <-
            </div>
            <div class="body">
                聊天信息<span v-if="group.groupType == 'G'">({{group.msgCount}})</span>
            </div>
         </div>
         <div class="page-body-hasNav">
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