<template>
    <div class="page at-member-list">
        <div class="page-navigation flex">
            <div class="goback" @click="$parent.showAtMemberList=false">
                <i class="iconfont icon-back1"></i>
            </div>
            <div style="margin-right:10px">选择提醒人</div>
            <div class="body history-input-wrapper">
                <input class="weui-input history-input" placeholder="搜索" @keyup="inputChange" v-model="searchKey"/>
            </div>
         </div>
         <div class="page-body-hasNav" ref="scrollerWrapper">
             <div v-if="memberList.length==0 && showLoading == false">
                 无搜索结果
             </div>
                <r-scroll
                 :options="scrollOptions"
                 :has-next="false"
                 :no-data="false"
                 :hideToast="true"
                 v-if="memberList.length" class="member-container"
                >
                <div v-for="(member,index) in memberList" :key="index" class="member-item" @click="memberClick(member)">
                    <div class="list-photo">
                        <img :src="getDefaultPhoto(member)" />
                    </div>
                    <div class="list-desc">
                        <p>{{member.nickname}}</p>
                        <span>{{member.role}}</span>
                    </div>
                </div>
                </r-scroll>
            <div class="weui-loadmore" v-show="showLoading">
                <i class="weui-loading"></i>
                <span class="weui-loadmore__tips">正在加载</span>
            </div>
         </div>
    </div>
</template>
<script>
import util from '@/common/util';
import RScroll from "plugins/scroll/RScroll";
import {getMembers} from 'service/msgService';
export default {
    data(){
        return {
            memberList:[],
            searchKey:'',
            pageParam:{
                page:1,
                limit:30
            },
            scrollOptions:{
                
            },
            showLoading:false
        }
    },
    components:{
        RScroll
    },
    created(){
        this.currentUser = this.$parent.$parent.currentUser;
        this.getMembers();
    },
    methods:{
        getDefaultPhoto(member) {
            let url = require("assets/ava01.png"),
                baseUrl = window.baseURL || '';
            if (member.photo) {
                url = member.photo;
                if(url.indexOf('http') == -1){
                    url = baseUrl + url;
                }
            }
            return url;
        },
        inputChange(){
            var key = this.searchKey;
            this.memberList = this.allMemers.filter((member)=>{
                 return member.nickname.indexOf(key) != -1;
            })
        },
        getMembers(){
            var groupId = this.$parent.group.groupId,
                index,
                name = this.currentUser && this.currentUser.name;

            this.showLoading = true;
            if(groupId != null){
                getMembers(groupId).then(res => {
                    this.showLoading = false;
                    if(name){
                        res.forEach((member,i) => {
                            if(member.nickname == name)index = i;
                        });
                        if (index != null)res.splice(index,1);
                    }
                    this.memberList = this.allMemers = res;
                })
            }
        },
        memberClick(member){
            this.$emit('select',member.nickname); 
        }
    }
}
</script>
<style lang="less" scoped>
.at-member-list{
    display: flex;
    flex-direction: column;
}
.member-container{
    height:100%;
    background: #fff;
}
.member-item{
    padding:10px;
    display: flex;
    border-bottom: 1px solid #e1e1e1;
    .list-photo img{
        height:.45rem;
        width:.45rem;
    }
    .list-desc{
        flex:1;
        margin-left:.1rem;
    }
}
</style>