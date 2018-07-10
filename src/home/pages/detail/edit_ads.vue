<template>
  <div class="pages">
    <div class="edit_mode">
      <group v-for="(item, index) in title_arr" :title="item" :key='index'>
        <x-input></x-input>
      </group>
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

<style lang='scss' scoped>
.edit_mode {
  height: 100%;
  position: relative;
  .cfm_btn {
    left: 50%;
    bottom: 5%;
    width: 2.8rem;
    color: #fff;
    height: .44rem;
    line-height: .44rem;
    position: absolute;
    text-align: center;
    background: #5077aa;
    border-radius: .4rem;
    transform: translate(-50%,0);
    box-shadow: 0 2px 12px #5077aa;
  }
}

</style>
