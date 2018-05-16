<template>
  <div class="pages">
    <div id='mescroll' class="mescroll">
      <div>
          <!-- SSXQ -->
         <ssxq :detailInfo='formInfo' v-if='code.indexOf("SSXQ")>=0'></ssxq>
       </div>
    </div>
  </div>
</template>

<script>
  import getDetailService from './../service/getDetailService.js'
  import Ssxq from "./component/SSXQForm.vue"
  export default {
    data() {
      return {
        formInfo:{},
        code:''
      }
    },
    components: {
        Ssxq
    },
    methods: {
      
    },
    created() {
        console.log(this.$route.query.code);
        this.code = this.$route.query.code;
        getDetailService.getDetailInfo(this.code).then(data=>{
          console.log(data);
          this.formInfo = data;
        })

    },
    mounted() {
      //上下滑动
        let Mescroll = this.Mescroll,
            mescroll = new Mescroll("mescroll",{
                up:{
                    use:false,
                    isBounce: true
                },
                down:{
                    use:false
                }
            })
    }
  }
</script>

<style lang='scss' >
.vux-no-group-title,.vux-no-group-title{
	margin-top:0 !important;
}
.weui-cell:before{
	left:0 !important;
}
.vux-cell-primary {
text-align: left !important;
}
.vux-cell-box{
	color:#999;
}
.htmlfiel{
  box-sizing: border-box;
  width:100%;
  padding:10px;
}
// .vux-cell-box{
//   color:#999;
//   font-size:16px;
//   line-height: 24px;
// }
// .vux-cell-box:not(:first-child):before{
//     left:-10px !important;
// }
  
</style>
