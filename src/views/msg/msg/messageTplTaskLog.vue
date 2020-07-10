<template>
    <div class="log-container">
       <div class="log-time">{{ content.crtTime }}</div>
       <div class="log-list">
         <span class="list-left">
           <i class="iconfont icon-icyhbynotice" ></i>
         </span>
         <div class="list-right">
           <b>日志提交提醒</b>
          <p>工作一天辛苦啦，记得提交日志哦！</p>
         </div>
       </div>
    </div>
</template>

<script>
import util from '@/common/util';
export default {
    name: "MessageTplTaskLog",
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
            content: {}
        }
    },
    created:function(){
       try{
            let json = JSON.parse(this.msg.content);
            this.content = json.content;
        }catch(e){
            console.log('msg content parse error',this.msg.content);
        }
    },
     methods:{
     }
}
</script>
<style lang="scss">
.log-container{
  .log-list{
    border: 1px solid #ddd;
    padding: .1rem;
    background-color: #fff;
    border-radius: .02rem;
    text-align: left;
    display: flex;
    align-items: center;
    .list-left{
      padding-right: .1rem;
      .icon-icyhbynotice{
        font-size: .28rem;
        color: #f90;
      }
    }
    .list-right{
      b{
        color: #333;
      }
      p{
        font-size: .12rem;
        color: #333;
      }
    }
  }
}
</style>
