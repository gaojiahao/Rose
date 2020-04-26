<template>
    <div class="text-msg-content" 
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