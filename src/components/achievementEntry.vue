<template>    
    <div class="pages">
      <div class='select_part'>
        <x-button
          class="each_select"
          :gradients="['#B99763', '#E7D0A2']"
          @click.native="goPerson"
        >个人业绩查看
        </x-button>

        <x-button
          class="each_select"
          :gradients="['#B99763', '#E7D0A2']"
          @click.native="goAll"
        >销售业绩汇总
        </x-button>
      </div>
      </div>
    </div>
  
</template>

<script>
import {XButton, Confirm, querystring} from 'vux'
export default {
  data(){
    return{

    }
  },
  components: {
    XButton,
    Confirm,
  },
  methods:{
    goPerson(){
      this.$router.push('/saleRecordPerson')
    },
    goAll(){
      this.$router.push('/saleRecord')
    }
  }
  

}
</script>

<style>
.select_part{
    width: 90%;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

</style>
