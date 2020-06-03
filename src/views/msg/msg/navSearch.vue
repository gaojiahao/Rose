<template>
    <div class="search-list" v-show="showSearchList" v-transfer-dom>
       <popup 
       v-model="showSearchList" 
       position="right" 
       width="100%" 
       :show-mask="false"
       :popup-style="{zIndex:0}">
          <div class="list-header">
            <span @click="cancel">
              <span>取消</span>
            </span>
          </div>
          <div class="list-search">
            <x-input ref="searchInput" placeholder="搜索" v-model="searchValue"></x-input>
          </div>
          <RScroll 
              class="page-body-hasNav search-container" 
              :options="scrollOptions"
              :has-next="hasNext"
              :no-data="false"
          >
            <div class="search-content">
              <div 
                class="list-top" 
                v-for="(item,index) of data" 
                :key="index">
                <p style="padding-left:.1rem;color:#999;margin-bottom:.1rem">{{item.title}}</p>
                <ul class="list-top-content">
                  <touch v-for="(child,ci) of item.children"
                      :key="ci"
                      @click="toMsg(child)">
                    <li 
                      class="list">
                      <div class="list-left">
                        <touch>
                          <div class="list-photo" @click.stop="openUserDetail(child)">
                            
                            <img :src="child.groupIcon|appIconFilter"  @error="getDefaultPhoto(child)" />
                          </div>
                        </touch>
                        <div class="list-desc">
                            <p>{{child.nickname || child.groupName}}</p>
                            <span v-if="child.type==='群聊'">包括：{{child.users}}</span>
                            <span v-else>{{child.role}}</span>
                        </div>
                      </div>
                    </li>
                  </touch>
                </ul>
              </div>
            </div>
          </RScroll>
        </popup>
    </div> 
</template>  
<script>
import { Popup,XInput } from 'vux'
import { getGroupByUserId,getGroupsByName } from '@/service/msgService'
import RScroll from "plugins/scroll/RScroll";
import Touch from "plugins/touch";
export default{  
    name: "NavSearch",
    components: {
        Popup,
        XInput,
        RScroll,
        Touch
    },
    data() {
        return {
            showSearchList: false,
            searchValue: "",
            data: [],
            userId: "",
            hasNext:false,
            scrollOptions:{
                click: false,
                pullUpLoad: false,//上拉刷新
                pullDownRefresh: false //下拉刷新
            }
        }
    },
    watch: {
      showSearchList: function(value) {
        if(value){
          this.data = [];
          this.searchValue = "";
          setTimeout(() => {
            this.$refs["searchInput"].focus();
          },100)
        }
      },
      searchValue: function() {
        this.getSearchName()
      }
    },
    methods: {
        getDefaultPhoto(item) {
            let url = require("assets/ava01.png");
            if (item.groupIcon) {
                url = item.groupIcon;
            }
            return url;
        },
        cancel() {
          this.showSearchList = false
        },
        getSearchName() {
          if(this.searchValue){
            this.data = [
              {
                  title: '联系人',
                  children: []
              },
              {
                  title: '群聊',
                  children: []
              }
            ]
            getGroupsByName(this.searchValue).then(res => {
              if(res.length > 0){
                res.forEach(item => {
                  if(item.type === "群聊"){
                    this.data[1] && this.data[1].children.push(item)
                  }else{
                    item.groupName  = item.nickname;
                    this.data[0] && this.data[0].children.push(item)
                  }
                })
              }else{
                this.data = [];
              }
            })
          }else{
            this.data = []
          }
        },
        openUserDetail(item) {
          if(item.type==='群聊') return;
          this.$router.push({name:'userInfo',params:{uId:item.userId}})
        },
        toMsg(item) {
          if(item.groupId){
            this.$emit('searchToMsg',item)
            this.showSearchList = false
          }else{
            getGroupByUserId(item.userId).then(res => {
              this.$emit('searchToMsg',res)
              this.showSearchList = false
            })
          }
        }
    }
}  
</script>  
<style lang="less" scoped>
.search-list{
  padding: 10px;
  height: 100%;
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
    margin-top: .1rem;
  }
  .search-content{
    overflow-x: hidden;
    margin-top: .1rem;
    .list-top{
      padding: .1rem 0rem;
      background-color: #fff;
      margin-bottom: .1rem;
      &-content{
        .list{
          background: #fdfdfd;
          border-top: 1px solid #eee;
          height: .5rem;
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
              border-radius: .02rem;
            }
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
      }
    }
  }
}
</style>