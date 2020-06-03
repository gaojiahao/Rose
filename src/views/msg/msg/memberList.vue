<template>
    <div class="member-list page" v-show="showMemberList">
          <div class="list-header">
            <span @click="goBack">
              <i class="iconfont icon-back1"></i>
              <span>返回</span>
            </span>
            <span>群成员{{`(${memberData.length})`}}</span>
            <span @click="addMember">添加</span>
          </div>
          <div class="list-search">
            <x-input placeholder="搜索" v-model="searchValue"></x-input>
          </div>
          <RScroll 
              class="page-body-hasNav search-container" 
              :options="scrollOptions"
              :has-next="hasNext"
              :no-data="false"
          >
            <ul class="content">
              <li 
                v-for="(item,index) of memberData"
                :key="item.userId"
                @click="openUserDetail(item)"
                :class="{move:candelete.userId==item.userId,list:true}"
                @touchstart="touchStart(item)"
                @touchend="touchEnd(item)">
                <div class="list-left">
                  <div class="list-photo">
                    <img :src="getDefaultPhoto(item)" />
                  </div>
                  <div class="list-desc">
                      <p>{{item.nickname}}</p>
                      <span>{{item.role}}</span>
                  </div>
                </div>
                <div class="list-owner" v-if="item.isOwner">
                  群主
                </div>
                <div class="delete" @click.stop="deleteMember(item,index)">移除</div>
              </li>
            </ul>
          </RScroll>
    </div> 
</template>  
<script>
import {XInput } from 'vux'
import { removeMember } from '@/service/msgService'
import RScroll from "plugins/scroll/RScroll";
export default{  
    name: "MemberList",
    components: {
        XInput,
        RScroll
    },
    props: {
      selectedMembers: {
        type: Array
      },
      group: {
        type: Object
      },
      currentUser: {
        type: Object
      }
    },
    data() {
        return {
            clientNum: {}, // 记录开始滑动（x1）,结束滑动（x2）的鼠标指针的位置
            candelete: {}, // 滑动的item
            showMemberList:false,
            userId: "",
            searchValue: "",
            memberData: [],
            hasNext:false,
            scrollOptions:{
                click: false,
                pullUpLoad: false,//上拉刷新
                pullDownRefresh: false //下拉刷新
            }
        }
    },
    watch: {
      selectedMembers: function(value) {
        if(value.length > 0){
          this.memberData = value;
          this.copyData = JSON.stringify(value);
          this.searchMethod();
          value.forEach(item => {
              if(item.isOwner) this.groupOwner = item.userId;
          })
        }
      },
      searchValue: function() {
        this.searchMethod()
      },
      showMemberList: function(value) {
        if(value) {
          this.searchValue = "";
        }
      }
    },
    methods: {
        getDefaultPhoto(item) {
            let url = require("assets/ava01.png");
            if (item) {
                item.photo = url;
            }
            return url;
        },
        goBack() {
          this.showMemberList = false
        },
        addMember() {
          this.$emit("addMembers")
        },
        searchMethod() {
          if(this.searchValue){
            this.memberData = [];
            JSON.parse(this.copyData).forEach(item => {
              if(item.nickname.indexOf(this.searchValue) > -1){
                this.memberData.push(item);
              }
            })
          }else{
            this.memberData = JSON.parse(this.copyData);
          }
        },
        deleteMember(item,index){
          let data = {
            groupId: this.group.groupId
          };
          if(item.userId){
            data.userId = item.userId
            removeMember(data).then(res => {
              if(res.success){
                    this.$vux.toast.show({text: res.message})
                    this.memberData.splice(index,1)
                    this.$emit('deleteMember')
                }
            })
          }
        },
        openUserDetail(item) {
          this.$router.push({name:'userInfo',params:{uId:item.userId}})
        },
        touchStart(item) {
            if(this.currentUser.userId != this.groupOwner) return
            if(!!item.isOwner) return

            let touchs = event.changedTouches[0];
            // 记录开始滑动的鼠标位置
            this.clientNum.x1 = touchs.pageX;
            this.candelete = {};
        },
        touchEnd(item) {
          if(this.currentUser.userId != this.groupOwner) return
          if(!!item.isOwner) return

            let touchs = event.changedTouches[0];
            // 记录结束滑动的鼠标位置
            this.clientNum.x2 = touchs.pageX;
            this.candelete = {};
            // 判断滑动距离大于50，判定为滑动成功，否则失败
            if (
              this.clientNum.x2 < this.clientNum.x1 &&
              Math.abs(this.clientNum.x1) - Math.abs(this.clientNum.x2) > 50
            ) {
              event.preventDefault();
              this.candelete = item;
            } else if (
              this.clientNum.x2 > this.clientNum.x1 &&
              Math.abs(this.clientNum.x2) - Math.abs(this.clientNum.x1) > 10
            ) {
              event.preventDefault();
              this.candelete = {};
            }
        }
    }
}  
</script>  
<style lang="less" scoped>
.member-list{
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .list-header{
    padding: .1rem;
    background-color: #39f;
    color: #fff;
    display: flex;
    justify-content: space-between;
  }
  .search-container{
    height: calc(~"100% - 1rem");
    margin-top: .1rem;
  }
  .list-search{
    background-color: #fff;
    margin: .1rem;
  }
  .content{
    overflow: hidden;
    .list{
      background: #fdfdfd;
      border-bottom: 1px solid #e1e1e1;
      height: .5rem;
      position: relative;
      transform: translateX(0);
      transition: all .3s; 
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &-left{
        display: flex;
        align-items: center;
      }
      &-photo{
        img{
          width: .45rem;
          height: .45rem;
        }
      }
      &-owner{
        color: #999;
      }
      &-desc{
        margin-left: .1rem;
        span{
          color: #999;
          font-size: .14rem;
          width: 2.5rem;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .delete {
      position: absolute;
      top: 0;
      right: -1px;
      z-index: 3;
      width: 60px;
      height: 100%;
      text-align: center;
      color: #fff;
      background-color: #ff5b45;
      transform: translateX(60px); //默认x轴位移60px，使其隐藏
      line-height: .6rem;
    }
  }
  li.move {
    transform: translateX(-60px) !important; //滑动后x轴位移-60px,使其可见
  }
}
</style>