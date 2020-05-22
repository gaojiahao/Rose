<template>
    <div class="file-msg-container">
       <div class="singleFile">
            <div class="file-content-info">
                <p @click="openFile(file)">
                    {{file.content}}
                </p>
                <p>
                    {{file.size}}KB
                </p>
            </div>
            <img class="file-img" :src="file.content|filedTypeFilter" @error= "getFileImg()">
        </div>
    </div>
</template>

<script>
import util from '@/common/util';
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
            baseURL:window.baseURL||'',
            file:null
        }
    },
    created:function(){
        this.defaultFileImg = require('assets/file/all.png');
        try{
            var json = JSON.parse(this.msg.content);
            this.file = json;
        }catch(e){
            console.log('msg content parse error',this.msg.content);
        }
    },
     methods:{
        getFileImg(){
            let img = event.srcElement;
            img.src = this.defaultFileImg;
            img.onerror = null; //防止闪图
        },
        openFile(file){
            var fileName = file.content,
                isImg = /.jpg|.png/.test(fileName.toLowerCase());
            
            if(isImg){
                this.$router.push({name:'imgInfo',params:{id:file.id},query:{name:fileName}});
            } else {
                util.down(file);
            }
        }
     }
}
</script>
<style lang="scss">
.file-msg-container{
     min-width: 50%;
    .singleFile{
        display: flex;
        .file-content-info {
            flex:1;
            text-align: left;
        }
        .file-img{
            height:38px;
        }
    }  
}
</style>
