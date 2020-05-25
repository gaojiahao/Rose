<style lang="less" scoped>
  .detail-modal{
      overflow: hidden;
      .title{
          font-size: .1rem;
          height: .5rem;
          background-color: #39f;
          padding-left: .1rem;
          line-height: .5rem;
          .iconfont{
            font-size: .2rem;
            color: #fff;
          }
          span{
            color: #fff;
            font-size: .17rem;
          }
      }
      .content{
          background-color: #eee;
          padding: .1rem;
          background-color: #fff;
          &-user{
            font-size: .15rem;
            color: #8a8686;
          }
          &-text{
            color: #333;
            margin-top: .05rem;
            max-height: 1rem;
            overflow-y: auto;
            display: inline-block;
            background-color: #eee;
            padding: .05rem;
            border-radius: 2px;
          }
      }
      .read-member{
        margin-top: .1rem;
        background-color: #fff;
        height: 100%;
        .number{
          display: flex;
          justify-content: space-around;
          font-size: .2rem;
          border-bottom: 1px solid #ddd;
          .active{
            border-bottom: 2px solid #39f;
            color: #333;
          }
          &-read{
            text-align: center;
            cursor: pointer;
            padding: .1rem .2rem;
            color: #999;
            p{
              font-size: 30px;
            }
          }
          &-noread{
            text-align: center;
            color: #999;
            padding: .1rem .2rem;
            cursor: pointer;
            p{
              font-size: 30px;
            }
          }
        }
        .is-height{
          height: calc(~'100% - 3rem') !important;
        }
        .member-container{
          height: calc(~'100% - 2.5rem');
          padding-top: .15rem;
          .member{
            .list{
              padding: .05rem .1rem;
              img{
                vertical-align: middle;
                height: .4rem;
                width: .4rem;
                border-radius: 4px;
                margin-right: 5px;
              }
            }
          }
        }
      }
  }
</style>
<template>
      <div
          class="detail-modal page"
          v-if="showReadDetailModal">
          <div class="title" @click="goBack">
                <i class="iconfont icon-back1" ></i>
                <span>消息详情</span>
          </div>
          <div class="content">
            <div class="content-user">
              <span>{{ detailMessage.creatorName }}</span>
              <span class="text-crtTime">{{ detailMessage.crtTime }}</span>
            </div>
            <div class="content-text" ref="contentText"> 
                <MessageTplText :msg="detailMessage" v-if="detailMessage.imType == 1"></MessageTplText>
                <MessageTplImg :msg="detailMessage" v-else-if="detailMessage.imType == 2"></MessageTplImg>
                <MessageTplMult :msg="detailMessage" v-else-if="detailMessage.imType == 3"></MessageTplMult>
                <MessageTplFile :msg="detailMessage" v-else-if="detailMessage.imType == 4"></MessageTplFile>
            </div>
          </div>
          <div class="read-member">
            <div class="number">
              <div 
                :class="{'number-read':true,'active':isActive}" 
                @click="readClick">
                <span>{{ readMembers.length }}人已读</span>
              </div>
              <div 
                :class="{'number-noread':true,'active':!isActive}"
                @click="noreadClick">
                <span>{{ noreadMembers.length }}人未读</span>
              </div>
            </div>
            <RScroll 
              class="page-body-hasNav member-container"
              :class="{'is-height':isHeight}"
              :options="scrollOptions"
              :has-next="hasNext"
              :no-data="false"
            >
              <div class="member">
                <p class="list" v-for="(member,index) of members" :key="index">
                  <img :src="member.photo" onerror="src='https://lab.roletask.com/resource/common-icon/male.png'">
                  <span>{{ member.nickname }}</span>
                </p>
              </div>
            </RScroll>
          </div>
      </div>
</template>

<script>
import { getMsgCheckStatus } from 'service/msgService';
import MessageTplText from '@/views/msg/msg/messageTplText'
import MessageTplImg from '@/views/msg/msg/messageTplImg'
import MessageTplMult from '@/views/msg/msg/messageTplMult'
import MessageTplFile from '@/views/msg/msg/messageTplFile'
import RScroll from "plugins/scroll/RScroll";
export default {
    name:'MessageReadDetail',
    components:{
        MessageTplText,
        MessageTplImg,
        MessageTplMult,
        MessageTplFile,
        RScroll
    },
    data(){
        return {
           showReadDetailModal: false,
           isActive: true,
           hasNext:false,
           isHeight: false,
           members: [],
           noreadMembers: [],
           readMembers: [],
           scrollOptions:{
              click: false,
              pullUpLoad: false,//上拉刷新
              pullDownRefresh: false //下拉刷新
          }
        }
    },
    props:{
        detailMessage:{
            type: Object,
            default:function(){
                return {};
            }
        }
    },
    computed: {
      responseHeight: function() {
        
      }
    },
    watch: {
      showReadDetailModal(value){
        if(value){
          this.$nextTick(() => {
            if(this.$refs["contentText"] && 
              this.$refs["contentText"].clientHeight > 100){
              this.isHeight = true;
            }else{
              this.isHeight = false;
            }
          })
          this.isActive = true;
          this.getReadMembers();
          this.getNoreadMembers();
        }
      }
    },
    methods:{
      goBack(){
          this.showReadDetailModal = false;
      },
      readClick() {
        this.isActive = true;
        this.members = this.readMembers;
      },
      noreadClick() {
        this.isActive = false;
        this.members = this.noreadMembers;
      },
      getReadMembers() {
        getMsgCheckStatus(this.detailMessage.id, 1).then(res => {
          this.readMembers = res;
          this.members = this.readMembers;
        }).catch(err => {
            this.$Message.error(err.data.message);
        })
      },
      getNoreadMembers() {
        getMsgCheckStatus(this.detailMessage.id, 0).then(res => {
          this.noreadMembers = res;
        }).catch(err => {
            this.$Message.error(err.data.message);
        })
      }
    }
}
</script>