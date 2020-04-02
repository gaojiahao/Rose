<template>
    <div class="msgList-wrapper">
        <div class="msgList-header">
            <div class="goback" @click="goBack()">
                <-
            </div>
            <div class="groupName">
                {{group.groupName}}({{group.group}})
            </div>
            <div class="toGroupAdmin">
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return {
            group:{}
        }
    },
    methods:{
        goBack(){
            this.$router.push('/msg');
        }
    },
    created:function(){
        var parent = this.$parent,
            groups = parent.groups,
            l = groups.length,
            groupId = this.$route.params.groupId;

        for(var i =0;i<l;i++){
            if(groups[i].groupId == groupId){
                this.group = groups[i];
                break;
            }
        }
    }
}
</script>
<style>
.msgList-wrapper{
   position:absolute;
   width:100%;
   height:100%;
   background: #fff;
   top:0;
   left:0;
}
.msgList-header{
    display: flex;
}
</style>