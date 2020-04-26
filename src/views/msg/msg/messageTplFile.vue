<template>
    <div class="file-msg-container"  :class="[msg.isMySelf==1?'rightarrow':'leftarrow']"  >
        <template v-for="file in msg.content" v-bind="key">
            <div v-if="file.imType == 4" class="singleFile">
                <div class="file-content-info">
                    <p>
                        <a  :href="'/H_roleplay-si/ds/downloadById?id='+file.id">{{file.content}}</a>
                    </p>
                    <p>
                        {{file.size}}KB
                    </p>
                </div>
                <img class="flie-img" width="38" :src="file.content|filedTypeFilter" @error= "getFileImg()">
            </div>
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
    },
    created:function(){
        this.defaultFileImg = require('assets/file/all.png');
    },
     methods:{
        getFileImg(){
            let img = event.srcElement;
            img.src = this.defaultFileImg;
            img.onerror = null; //防止闪图
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
    }  
}
</style>
