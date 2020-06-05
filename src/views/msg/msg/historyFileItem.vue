<template>
    <div>
        [{{fileName}}]
    </div>
</template>
<script>
export default {
    props:['content'],
    created(){
        var obj = {};
        try{
            obj = JSON.parse(this.content);
        } catch(e){
            console.log(e);
        }
        this.fileName = obj.content;
    },
    data(){
        return {
            fileName:''
        }
    }
}
</script>