<template>
    <div class="member-selector" v-transfer-dom>
        <popup v-model="showMemberSelector" height="100%">
          <div class="container">
            <div class="header">
              <div @click="cancelSelect">取消</div>
              <p>选择联系人</p>
            </div>
            <div class="search">
              <x-input placeholder="搜索">
                <span slot="label">
                  <icon type="search"></icon>
                </span>
              </x-input>
            </div>
            <div class="content">
              <div 
              class="list"
              @click="selectMember(list)" 
              v-for="list of data" 
              :key="list.userId">
                <div class="list-check">
                  <check-icon :value="list.checked"></check-icon>
                </div>
                <div class="list-photo">
                  <img :src="getDefaultPhoto()"/>
                </div>
                <div class="list-desc">
                  <p>{{list.nickname}}</p>
                  <span>{{list.role}}</span>
                </div>
              </div>
            </div>
          </div>
        </popup>
    </div>
</template>
<script>
import { Popup,XInput,Icon,CheckIcon } from 'vux'
import { getEmployee } from '@/service/msgService'
export default {
    name:'MemberSelector',
    components: {
        Popup,
        XInput,
        Icon,
        CheckIcon
    },
    props: {
      selectedMembers: {
        type: Array
      }
    },
    data(){
        return {
          showMemberSelector: false,
          data: []
        }
    },
    watch: {
      showMemberSelector: function(value) {
        if(value) {
          this.getAllusers()
        }
      }
    },
    methods:{
        getDefaultPhoto() {
            let url = require("assets/ava01.png")
            return url
        },
        cancelSelect() {
          this.showMemberSelector = false
        },
        selectMember(list) {
          this.$set(list,'check',!list.check)
        },
        getAllusers() {
          getEmployee().then(res => {
            this.data = res.tableContent
            this.setSelectedMembersStatus(this.data,this.selectedMembers)
          })
        },
        //设置已选择的成员为选中状态
        setSelectedMembersStatus(all,select) {
          all.forEach(all => {
            all.checked = false
            for(let sel=0;sel<select.length;sel++){
              if(select[sel].userId == all.userId){
                all.checked = true
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
  .member-selector{
    .container{
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
              width: 50px;
              height: 50px;
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
        }
      }
    }
  }
</style>