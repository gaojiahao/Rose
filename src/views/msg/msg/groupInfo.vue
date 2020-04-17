<!--消息页面-->
<template>
    <div class="group-info page">
         <div class="page-navigation flex">
            <div class="goback" @click="goBack()">
                <i class="iconfont icon-back1"></i>
            </div>
            <div class="body">
                聊天信息<span v-if="group.groupType == 'G'">({{group.msgCount}})</span>
            </div>
         </div>                             
         <div class="page-body-hasNav" ref="scrollerWrapper">
             <div class="scroller-body">
             <!-- <div class="weui-cells"></div> -->
             <group>
                <cell title="群聊名称" is-link link="/themesetting" :value="group.groupName" />
                <cell title="群二维码" is-link ><span slot="value"></span></cell>
                <cell title="群公号" is-link />
            </group>
            <group>
                <cell title="群成员" is-link />
                <div class="weui-cell">这个部分要放图片</div>
                <cell title="添加群成员"/>
            </group>
            <div class="weui-cells">
                <div class="weui-cell weui-cell_access">
                    <div class="vux-cell-primary">
                        查找群聊天记录
                    </div>
                    <div class="weui-cell__ft">
                        更多
                    </div>
                </div> 
                <div class="weui-cell">这里要放图标</div>
            </div>
            <group>
                <cell title="群聊天机器人" is-link value="未添加"/>    
            </group>
            <group>
                <cell title="消息免打扰"><inline-x-switch slot="value"/></cell>
                <cell title="置顶聊天"><inline-x-switch value="true" slot="value"/></cell>
                <cell title="保存到通讯录"><inline-x-switch value="true" slot="value"/></cell>
            </group>
            <group>
                <cell title="邀请群成员语音通话" is-link/>    
                <cell title="给群成员发邮件" is-link/>    
            </group>
             </div><!-- scroller-body-->
         </div>
    </div>
</template>
<script>
import { Group, Cell,InlineXSwitch} from 'vux'
export default {
    props:['group'],
    components: {
        Cell,
        Group,
        InlineXSwitch
    },
    data(){
        return {

        }
    },
    mounted() {
        var scrollWrapper = this.$refs.scrollerWrapper;

        if(!scrollWrapper)return;

        this.scroll = new this.Bscroll(scrollWrapper, {
            click: true,
            pullUpLoad: true,
            pullDownRefresh: true,
        });
        this.scroll.on('scroll', ({x, y}) => {
            if(Math.abs(y)>1000)
            this.toTopShow = true;
            else if(Math.abs(y)<1000)
            this.toTopShow = false; 
        })
        this.scrollToButtom(0);

        this.getApp().$on('resize',()=>{
            this.scroll.refresh();
        })
    },
    methods:{
        goBack(){
            this.$router.replace('/msg/group');
        }
    }
}
</script>
<style>
  .scroller-body{
      position: relative;
  }
</style>