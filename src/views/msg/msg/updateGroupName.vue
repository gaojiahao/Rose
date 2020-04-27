<template>
    <div class="group-name" v-transfer-dom>
       <popup 
          v-model="showUpdateName"
          height="100%" 
          :show-mask="false">
          <div class="name-header">
            <span @click="goBack">
              <i class="iconfont icon-back1"></i>
              <span>返回</span>
            </span>
            <span 
              :style="{color:isDisabled?'#e0dada':'#fff'}"
              @click="editGroupName">
              确定
            </span>
          </div>
          <div class="name-input">
            <x-input ref="nameInput" v-model="groupName" show-clear></x-input>
          </div>
        </popup>
    </div> 
</template>  
<script>
import { XInput,Popup } from 'vux'
import { setGroupName } from '@/service/msgService'
import Bus from '@/common/eventBus.js';
export default{  
    name: "UpdateGroupName",
    components: {
        XInput,
        Popup
    },
    props: {
      group: {
        type: Object
      }
    },
    data() {
        return {
           showUpdateName: false,
           isDisabled: false,
           groupName: ""
        }
    },
    watch: {
      groupName: function(value) {
          !value ? this.isDisabled = true : this.isDisabled = false;
      },
      showUpdateName: function(value) {
        if(value) {
          this.groupName = this.group.groupName;
            setTimeout(() => {
              this.$refs["nameInput"] && this.$refs["nameInput"].focus();
            },100)
        }
      }
    },
    methods: {
        goBack() {
          this.showUpdateName = false;
        },
        editGroupName() {
          if(!this.groupName) return;

          let params = {
            groupId: this.group.groupId,
            name: this.groupName
          }
          setGroupName(params).then(res => {
                if(res.success){
                    this.$vux.toast.show({text: res.message});
                    this.showUpdateName = false;
                }
            })
        }
    }
}  
</script>  
<style lang="less" scoped>
  .group-name{
    .name-input{
      margin-top: .1rem;
      background-color: #fff;
    }
    .name-header{
      padding: .1rem;
      background-color: #39f;
      color: #fff;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
    }
  }
</style>