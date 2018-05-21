<template>
  <div class="pages">
    <div id='mescroll' class="mescroll">
      <div>
          <!-- SSXQ -->
         <ssxq :detailInfo='formInfo' :status='taskStatus' v-if='code.indexOf("SSXQ")>=0'></ssxq>
         <!-- CPXQ -->
         <cpxq :detailInfo='formInfo' :status='taskStatus' v-if='code.indexOf("CPXQ")>=0'></cpxq>
       </div>
    </div>
  </div>
</template>

<script>
  import getDetailService from './../service/getDetailService.js'
  import Ssxq from "./component/SSXQForm.vue"
  import Cpxq from "./component/CPXQForm.vue"
  import Mbgl from "./component/MBGLForm.vue"
  export default {
    data() {
      return {
        formInfo : {},
        code : '',
        taskStatus : true
      }
    },
    components: {
        Ssxq,
        Cpxq,
        Mbgl
    },
    methods: {
      
    },
    created() {
        let code = this.$route.query.code,
            status = this.$route.query.status;
        this.code = code;
        if(status == 'done'){
          
          this.taskStatus = false;
        }
        let formId = '';
        if(code.indexOf('SSXQ') >= 0){
          formId = 'a43aed46-8273-478a-9161-ef940542ed71'
        }
        else if(code.indexOf('CPXQ') >= 0){
          formId = '1b282c62-fca0-4929-a581-253fe8f528bd'
        }
        getDetailService.getDetailInfo(formId,this.code).then( data=> {
          this.formInfo = data;
          console.log(data);
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
  color:#999;
  font-size:17px !important;
  line-height: 24px;
  padding:10px 15px;
  position: relative;
  &:before{
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #D9D9D9;
    color: #D9D9D9;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
  span{
    font-size:17px !important;
  }

  
   
}
.weui-cells:after{
  border-bottom: 0px solid #D9D9D9 !important;
}
.vux-cell-box:not(:first-child):before{
    left:-10px !important;
}
  
</style>
