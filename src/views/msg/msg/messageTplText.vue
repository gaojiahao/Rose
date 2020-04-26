<template>
    <div class="text-msg-content" 
        :class="[msg.isMySelf==1?'rightarrow':'leftarrow']"  
        v-html="msg.content">
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
    }
}
</script>