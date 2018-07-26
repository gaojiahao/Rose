<template>
  <div v-transfer-dom>
    <popup v-model="popupShow" position="bottom" height="100%">
      <div class='close_icon'>
        <icon type="cancel" @click.native="closePop"></icon>
      </div>
      <!-- <x-icon type="ios-close-outline" size="30" ></x-icon> -->
      <div class="flow_list">
        <div class="each_msg vux-1px-b"
            v-for="(item, index) in fullWL" 
            :key=index>
            <!-- 头像 -->
          <div class="user_avatar">
            <img :src='index % 2 ? defaulImg2: defaulImg' alt="avatar">
          </div>
          <!-- 操作信息 -->
          <div class="handle_info">
            <div class="handle_name">
              <!-- 操作动作 -->
              <span>{{item.nodeName}}</span>
              <!-- 操作状态 B(有返回状态) -->
              <span class="status"
                    :class=item.dyClass
                    v-if='index !== 0'>
                {{item.status}}
              </span>
            </div>
            <!-- 流程节点 用户名 -->
            <div class="user_name">
              {{item.userName}}
            </div>
            <!-- 备注 -->
            <div class="remark">备注: {{item.message || '无'}}</div>
          </div>
        </div>
      </div>
      <div class="btn">
        <div class="cfm_btn" @click="closePop">close</div>
      </div>
    </popup>
  </div>
</template> 
<script>
  import { TransferDom, Popup, Group,Icon,XButton } from 'vux'
  import { getWorkFlow } from 'service/detailService.js'
  export default {
    props:{
      popupShow :  {
        type : Boolean,
        require :true
      }
    },
    data(){
      return{
        fullWL : [],
        defaulImg: require('assets/avatar.png'),   // 默认图片1
        defaulImg2: require('assets/io.jpg'),       // 默认图片2
      }
    },
    directives: {
      TransferDom
    },
    components: {
      Popup,
      Group,
      Icon,
      XButton
    },
    methods:{
      closePop(){
        this.$emit('input',false)
      },
      getFlow(transCode=''){
        getWorkFlow({
          transCode
        }).then(({tableContent})=>{
          this.fullWL = tableContent;
          for(let item of tableContent){
            switch(item.status){
              case '同意':
                item.dyClass = 'agree_c';
                break;
              case '终止':
                item.dyClass = 'reject_c'
                break;
            }           
          }
        })
      }

    },
    created(){
      let { transCode } = this.$route.query;
      // 获取工作流
      this.getFlow(transCode);

    }

  }
</script>

<style lang='scss' scoped>
.vux-popup-dialog{
  background: #fff;
  .close_icon{
    height:22px;
    padding: 0.05rem;
    .weui-icon{
      float:right;     
    }
  }
  // 工作流信息
  .flow_list {
    position: relative;
    padding: .06rem .08rem .2rem;
    // 每一个明细
    .each_msg {
      display: flex;
      padding-bottom: .1rem;
      margin-bottom: .1rem;
      // 用户头像
      .user_avatar {
        width: .65rem;
        height: .65rem;
        img {
          width: 100%;
        }
      }
      // 操作信息
      .handle_info {
        color: #111;
        display: flex;
        font-size: .12rem;
        margin-left: .1rem;
        flex-direction: column;
        justify-content: center;
        // 用户名称
        .user_name {
          font-size: .14rem;
        }
        // 操作名称
        .handle_name {
          font-size: .18rem;
          font-weight: bold;
          span{
            display: inline-block;
          }
          // 默认样式
          .status {
            color: #fff;            
            font-size: .1rem;
            padding: 0 .04rem;
            margin-top: -.02rem;
            background: #5077aa;
            vertical-align: middle;
          }
          // 同意样式
          .agree_c {
            background: #53d397;
          }
          // 拒绝样式
          .reject_c {
            background: #c93d1b;
          }          
        }
        // 备注
        .remark {
          font-size: .1rem;
          color: #757575;
        }
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
      background: #F43530;
      border-radius: .4rem;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 5px #F43530;
    }
  }
  
}



</style>
