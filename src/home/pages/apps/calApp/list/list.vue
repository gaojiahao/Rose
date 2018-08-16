<template>
  <div class="inPage">
    <component
      :is='currentComponent'
      v-model='showLoadding'
      ref='list'>
    </component>
    <loading-form :show='showLoadding'></loading-form>
  </div>

</template>

<script>
import Loadding from 'components/Loading'
import businessMap from '../../../maps/businessText.js'
export default {
  data(){
    return {
      currentComponent : '',
      showLoadding : true,
      code :''
    }
  },
  components:{
    'loading-form' : Loadding
  },
  created(){
    this.currentComponent = require(`components/km/CHForm.vue`).default;
    // let code = this.$route.params.code;
    // if(code){
    //   this.currentComponent = require(`components/list/${code}Form.vue`).default;
    // }
    // setTimeout(()=>{
    //   this.showLoadding = false
    // },1000)
  },
  // beforeRouteEnter (to, from, next) {
  //   let code  = businessMap[to.params.code];
  //   to.meta.title = code.slice(-4) + '列表';
  //   next();
  // }
}
</script>

<style lang='scss'></style>
