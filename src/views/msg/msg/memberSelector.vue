<template>
    <div class="member-selector-container page" v-show="showMemberSelector">
        <div class="header">
          <div @click="cancelSelect">取消</div>
          <p>选择联系人</p>
        </div>
        <div class="search">
          <x-input placeholder="搜索" v-model="searchValue">
            <span slot="label">
              <icon type="search"></icon>
            </span>
          </x-input>
        </div>
        <r-scroll
          class="pop-list-container"
          :options="scrollOptions"
          :has-next="hasNext"
          :no-data="!hasNext && !data.length"
          @on-pulling-up="onPullingUp"
          ref="bScroll">
          <div class="content">
            <div 
            class="list"
            @click="selectMember(list,index)" 
            v-for="(list,index) of data" 
            :key="list.userId">
              <div :class="{'list-check':!list.isOrigin,'list-checked':list.isOrigin}">
                <check-icon :value="list.check"></check-icon>
              </div>
              <div class="list-photo">
                <img :src="list.photo | appIconFilter" @error="getDefaultPhoto(list)"/>
              </div>
              <div class="list-desc">
                <p>{{list.nickname}}</p>
                <span>{{list.role}}</span>
              </div>
            </div>
          </div>
        </r-scroll>
        <div class="footer" v-show="selectMembers.length > 0">
          <div class="footer-left">
            <span 
              v-for="sel of selectMembers" 
              :key="sel.userId">
              {{ sel.nickname }}
            </span>
          </div>
          <div class="footer-right" @click="confirmSelect">
            <x-button 
              mini 
              :gradients="['#39f', '#39f']">
              确定
            </x-button>
          </div>
        </div>
    </div>
</template>
<script>
import { XInput,Icon,CheckIcon,XButton } from 'vux'
import RScroll from 'plugins/scroll/RScroll'
import { getEmployee } from '@/service/msgService'
import { initWebContext } from 'service/commonService'
export default {
    name:'MemberSelector',
    components: {
        XInput,
        Icon,
        CheckIcon,
        RScroll,
        XButton
    },
    props: {
      selectedMembers: {
        type: Array,
        default: function() {
          return []
        }
      },
      confirmCallback:{
        type: Function
      }
    },
    data(){
        return {
          searchValue: "",
          pageSize: 15,
          currentPage: 1,
          total: 0,
          hasNext: true,
          showMemberSelector: false,
          data: [],
          selectMembers: [],
          scrollOptions: {
            click: true,
            pullUpLoad: true,
            pullDownRefresh: false
          }
        }
    },
    watch: {
      showMemberSelector: function(value) {
        if(value){
          this.searchValue = "";
          this.currentPage = 1
          this.selectMembers = []
          initWebContext().then((WebContext) => {
                this.currentUser = WebContext.currentUser
                this.getAllusers()
          })
        } 
      },
      searchValue: function(text) {
        this.getAllusers()
      }
    },
    methods:{
        // 上拉加载
        onPullingUp() {
          this.currentPage++;
          this.getAllusers();
        },
       getDefaultPhoto(item) {
            let url = require("assets/ava01.png");
            if (item) {
                item.photo = url;
            }
            return url;
        },
        cancelSelect() {
          this.showMemberSelector = false
        },
        confirmSelect() {
          this.confirmCallback(this.selectMembers)
        },
        selectMember(list,index) {
          if(list.isOrigin) return
          if(this.currentUser.userId == list.userId) return;

          if(!list.check){
            this.selectMembers.push({
              nickname: list.nickname,
              userId: list.userId
            });
          }else{
            for(let sel=0;sel<this.selectMembers.length;sel++){
              if(this.selectMembers[sel].userId == list.userId) {
                this.selectMembers.splice(sel,1)
              }
            }
          }
          this.$set(list,'check',!list.check)
        },
        getAllusers() {
          let filter = [{operator:'like',property: 'nickname',value: this.searchValue}]

          getEmployee(JSON.stringify(filter),this.currentPage,this.pageSize).then(res => {
            this.total = res.dataCount;
            this.hasNext = res.dataCount > (this.currentPage - 1) * this.pageSize + res.tableContent.length;
            this.data = this.currentPage === 1 ? res.tableContent : [...this.data,...res.tableContent]
            this.setSelectedMembersStatus(this.data,this.selectedMembers)
            this.$nextTick(() => {
              this.$refs.bScroll.finishPullDown().then(() => {
                this.$refs.bScroll.finishPullUp();
              });
            })
          })
        },
        //设置已选择的成员为选中状态
        setSelectedMembersStatus(all,select) {
          all.forEach(all => {
            this.$set(all,'check', false)
            for(let sel=0;sel<select.length;sel++){
              if(select[sel].userId == all.userId){
                this.$set(all,'check', true)
                this.$set(all,'isOrigin', true)
                break
              }
            }
          })
        }
    },
    mounted() {
       
    }
}
</script>
<style lang="less" scoped>
  .member-selector-container{
    display: flex;
    flex-direction: column;
    z-index: 1000;
    .pop-list-container{
      flex:1;
      box-sizing: border-box;
      position: relative;
    }
    .header{
      background-color: #39f;
      color: #fff;
      padding: .1rem;
      text-align: center;
      display: flex;
      p{
          flex: 1;
      }
    }
    .search{
        padding: 10px;
    }
    .search /deep/ .weui-cell{
        background-color: #fff;
        border-radius: 4px;
    }
    .content{
      box-sizing: border-box;
      .list{
        display: flex;
        align-items: center;
        margin: 10px;
        background-color: #fff;
        padding: 10px;
        border-radius: 4px;
        &-photo{
          margin: 0px .1rem;
          img{
            width: 45px;
            height: 45px;
            border-radius: .02rem;
          }
        }
        &-desc{
          span{
            color: #999;
            font-size: .14rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 2.2rem;
            display: inline-block;
          }
          p{
            font-size: .17rem;
          }
        }
        .list-check /deep/ .vux-check-icon > .weui-icon-success:before, .vux-check-icon > .weui-icon-success-circle:before{
          color: #4CA3FB;
        }
        .list-checked /deep/ .vux-check-icon > .weui-icon-success:before, .vux-check-icon > .weui-icon-success-circle:before{
          color: #999;
        }
      }
    }
    .footer{
        position: fixed;
        bottom: 0;
        padding: 10px;
        background-color: #fff;
        width: 100%;
        display: flex;
        justify-content: space-between;
        border-top: .05px solid #ddd;
        &-right{
            margin-right: 20px;
        }
        &-left{
            width: 75%;
            overflow-x: auto;
            white-space: nowrap;
        }
    }
  }
</style>