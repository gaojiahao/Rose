<template>
    <div class="file-msg-container">
       <touch class="singleFile">
            <div class="file-content-info">
                <p class="file-content-info-name" @click="openFile(file)">
                    {{file.content}}
                </p>
                <p class="file-content-info-size">
                    {{file.size}}KB
                </p>
            </div>
            <img class="file-img" :src="file.content|filedTypeFilter" @error= "getFileImg()">
        </touch>
        <div class="loading" v-if="loading" :style="{width:percent + '%'}">
        </div>
    </div>
</template>

<script>
import util from '@/common/util';
import Touch from "plugins/touch";
export default {
    components:{
        Touch
    },
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
            loading:false,
            percent:0,
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
                if(this.loading == false){
                    this.loading = true;
                    this.percent = 0;
                    util.down(file,(isLoaded,percent)=>{
                        if(isLoaded == true){
                            this.loading = false;
                            this.percent = 100;
                        } else {
                            this.percent = percent;
                        }
                    });
                }
                
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
            &-name{
                color: #06c;
                max-width: 130px;
                text-overflow: ellipsis;
                -ms-flex: 1;
                -o-text-overflow: ellipsis;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
            }

            &-size{
                color: #999999;
            }
        }
        .file-img{
            height:38px;
        }
        
    }  
    .loading{
        background-color: #2d8cf0;
        height:2px;
    }
}
</style>
