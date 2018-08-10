<template>
  <div class='input_wrapper vux-1px-b'>
    <div class='input_com'>
      <label class='name'>{{options.title}}</label>
      <input  class='input_box' :placeholder="options.placeholder" :type='options.type' :value='val' @input='getVal($event)'>
      <icon type="clear" class='clear_btn' v-if='val.length>0' @click.native="clear"></icon>   
    </div>
  </div>
  
</template>

<script>
import { Icon } from 'vux'
export default {
  props:{
    options:{
      type : Object,
      required : true,
      default() {
        return {
          name : '名称',
          type : 'text',
          placeholder :'请输入'
        }
      }
    },

  },
  data(){
    return{
      val : ''
    }
  },
  components:{
    Icon
  },
  methods:{
    getVal(e){
      this.val = e.target.value;
      this.$emit('input',this.val)
    },
    clear(){
      this.val = '';
      this.$emit('input',this.val)
    }
  }

}
</script>
<style lang="scss" scoped>
.input_wrapper{
  margin-top: 1.17647059em;
  background-color: #FFFFFF;
  line-height: 1.41176471;
  font-size: 17px;
  overflow: hidden;
  position: relative;
  .input_com{
    padding: 10px 15px;
    position: relative;
    display: flex;
    align-items: center;
    label{

    }
    .input_box{
      flex: 1;
      width: 100%;
      border: 0;
      outline: 0;
      -webkit-appearance: none;
      background-color: transparent;
      font-size: inherit;
      color: inherit;
      height: 1.41176471em;
      line-height: 1.41176471;
      text-align: right;
    }
    .clear_btn{
      text-align: right;
    }
  }
}
</style>
