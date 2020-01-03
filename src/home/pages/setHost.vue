<template>
<div class="pages">
     <slot name="nav"></slot>
     <checklist :title="'选择服务器'"
      required 
      :options="hostList" :max="1" 
      v-model="radioValue"></checklist>
      <x-button style="width:90%;height:0.5rem;margin-top:1rem" type="primary" @click.native="changeHost">确定</x-button>
</div>
</template>
<script>
import {Checklist,XButton } from 'vux'
export default{
     components: {
       Checklist,XButton
     },
     data:function(){
         return {
             hostList:[
                {value:'测试服',key:'http://192.168.3.172'},
                {value:'瑞福登',key:'https://refordom.roletask.com/'}
             ],
             radioValue:[]
         }
     },
     methods:{
         changeHost(){
            var baseUrl;
            if(this.radioValue.length){
                window.baseURL = baseUrl = this.radioValue[0];
                window.localStorage.setItem('baseURL',baseUrl);
                this.$router.replace('/login');
            }
         }
     }
}
</script>