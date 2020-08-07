<template> 
    <div class="img-msg-content ">
        <img  preview="1" :src="baseURL+'/H_roleplay-si/ds/downloadById?id='+ content.id" height="100" />
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
    created(){
        try{
            var json = JSON.parse(this.msg.content);
            this.content = json;
        }catch(e){
            console.log('msg content parse error',this.msg.content);
        }
    },
    data(){
        return {
            baseURL:window.baseURL||'',
            content:null
        }
    },
    methods:{
    },
     mounted() {
      //图片游览按返回键退出游览
      this.$preview.on('imageLoadComplete', (e, item) =>{
          let _preview = this.$preview.self;
          let lookUrl = window.location.href + '&look';
          window.history.pushState(null, null, lookUrl);
          _preview.listen('close',
          function() {
              if (window.location.href.indexOf('&look') !== -1) {
                  window.history.back();
              }
          });
          window.onhashchange = function() {
              if (_preview !== null && _preview !== undefined) {
                  _preview.close();
                  _preview = null;
              }
          };
      });
    }
}
</script>
<style lang="less">
.img-msg-content{
   img{
    height:100px;
    max-width: 100%;
   }
}
</style>