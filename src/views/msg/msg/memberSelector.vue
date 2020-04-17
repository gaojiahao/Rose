<template>
    <div class="member-selector" v-transfer-dom>
        <popup v-model="showMemberSelector" height="100%">
          <div class="container">
            <div class="search">
              <x-input placeholder="搜索">
                <span slot="label">
                  <icon type="search"></icon>
                </span>
              </x-input>
            </div>
            <div class="content"></div>
          </div>
        </popup>
    </div>
</template>
<script>
import { Popup,XInput,Icon } from 'vux'
export default {
    name:'MemberSelector',
    components: {
        Popup,
        XInput,
        Icon
    },
    data(){
        return {
          showMemberSelector: false
        }
    },
    mounted() {
        
    },
    methods:{
        
    }
}
</script>
<style lang="less" scoped>
  .member-selector{
    .container{
      .search{
          padding: 10px;
      }
      .search /deep/ .weui-cell{
          background-color: #fff;
      }
    }
  }
</style>