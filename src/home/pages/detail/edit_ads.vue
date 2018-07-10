<template>
  <div class="pages">
    <div class="edit_mode">
      <group class="no_mg" v-for="(item, index) in title_arr" :title="item" :key='index'>
        <x-input></x-input>
      </group>
    </div>
    <div class="btn">
      <div class="cfm_btn">确定</div>
    </div>  
  </div>
</template>

<script>
import { Group, XInput } from 'vux'
export default {
  components: {
    Group, XInput
  },
  data(){
    return{
      title_arr:['客户名称','联系地址','联系人','手机','结算方式','物流条款']
    }
  }
}
</script>

<style lang='scss'>
.edit_mode {
  .no_mg {
    .weui-cells__title {
      margin-top: 0;
      padding-top: .77em;
    }
  }
}
// 确定
.btn {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 10%;
  position: fixed;
  background: #fff;
  .cfm_btn {
    top: 50%;
    left: 50%;
    width: 2.8rem;
    color: #fff;
    height: .44rem;
    line-height: .44rem;
    position: absolute;
    text-align: center;
    background: #5077aa;
    border-radius: .4rem;
    transform: translate(-50%, -50%);
    box-shadow: 0 2px 12px #5077aa;
  }
}


</style>
