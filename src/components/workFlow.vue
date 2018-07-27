<template>
  <div v-transfer-dom>
    <popup v-model="popupShow" position="bottom" height="100%">
      <div class='flow_top'>
        <span class="title">查看工作流</span>
        <span class="close" @click="closePop" v-if="fullWL.length >= 6">关闭</span>
        <!-- <icon type="cancel" @click.native="closePop"></icon> -->
      </div>
      <div class="flow_list">
        <div class="each_msg"
            :class="isMyTask && index === fullWL.length - 1 || userName === item.userName ? 'whenisMine' : ''"
            v-for="(item, index) in fullWL" 
            :key=index>
            <!-- 接收时间 -->
          <div class="recive_time" v-if="item.startTime">
            <span class="num">{{item.startTime}}</span>
          </div>
            <!-- 头像 -->
          <div class="user_avatar">
            <img :src='item.userName === userName ? defaulImg: defaulImg2' alt="avatar">
            <div class="name">{{item.userName}}</div>
          </div>
          <!-- 操作信息 -->
          <div class="info_part">
            <div class="handle_info">
              <div class="triangle"></div>
              <div class="handle_name">
                <!-- 操作动作 -->
                <span>{{item.nodeName}}</span>
                <!-- 操作状态 B(有返回状态) -->
                <span class="status"
                      :class=item.dyClass
                      v-if='index > 0'>
                  {{item.status || noStatus}}
                </span>
              </div>
              <!-- 流程节点 用户名 -->
              <!-- <div class="user_name">
                {{item.userName}}
              </div> -->
              <!-- 备注 -->
              <div class="remark">备注: {{item.message || '无'}}</div>
              <div class="handle" v-if="item.endTime">处理时间: {{item.endTime || '暂无'}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="btn" :class="fullWL.length < 6? 'when_less': ''">
        <span class="cfm_btn" @click="closePop">关闭工作流</span>
      </div>
    </popup>
  </div>
</template> 
<script>
  import { TransferDom, Popup, Group,Icon,XButton } from 'vux'
  import { isMyflow, getWorkFlow, currentUser } from 'service/detailService.js'
  export default {
    props:{
      popupShow :  {
        type : Boolean,
        require : true
      },
      noStatus : {
        type : String,
        require : true
      }
    },
    data(){
      return{
        fullWL : [],
        userName:'',    // 用户名称
        isMyTask: '',   // 是否与我有关
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
      //随机ID
      randomID() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return ( S4() + S4() + S4() );
      },      
      //获取工作流
      getFlow(transCode=''){
        getWorkFlow({
          transCode
        }).then(({tableContent})=>{
          for(let item of tableContent){
            // 去除名字中的空格
            item.userName = item.userName.replace(/\s*/g,"");
            switch(item.status){
              case '同意':
                item.dyClass = 'agree_c';
                break;
              case '终止':
                item.dyClass = 'reject_c'
                break;
            }           
          }
          this.fullWL = tableContent;
        })
      },
      // 判断节点是否与<我>有关
      isMyflow(transCode = ''){
        isMyflow({
          _dc: this.randomID(),
          transCode
        }).then(({ tableContent }) => {
          if(tableContent.length > 0 && tableContent[0].isMyTask === 1){
            let { isMyTask = 0 } = tableContent[0];
            this.isMyTask = isMyTask;
          }
        })      
      },
      // 获取当前用户
      currentUser(){
        currentUser({
          _dc: this.randomID()
        }).then(({ nickname, userCode}) => {
          this.userName = `${nickname}-${userCode}`;
          console.log(this.userName);
        })
      }
    },
    created(){
      let { transCode } = this.$route.query;
      this.getFlow(transCode);
      this.isMyflow(transCode);
      this.currentUser();
    }

  }
</script>

<style lang='scss' scoped>
.vux-popup-dialog{
  background: #fff;
  .flow_top{
    display: flex;
    align-items: center;
    padding: .05rem .1rem;
    justify-content: space-between;
    // 标题
    .title {
      color: #111;
      font-weight: bold;
      font-size: .24rem;
    }
    // 关闭按钮 
    .close {
      display: block;
      color: #fff;
      padding: 0 .1rem;
      font-size: .18rem;
      background: #dd0a35;
      border-radius: .24rem;
    }
  }
  // 工作流信息
  .flow_list {
    position: relative;
    padding: .06rem .08rem 0;
    // 每一个明细
    .each_msg {
      display: flex;
      padding: .02rem 0 .1rem;
      margin-bottom: .2rem;
      position: relative;
      // 用户头像
      .user_avatar {
        width: .5rem;
        // height: .5rem;
        display: flex;
        font-size: .1rem;         
        flex-direction: column;
        // 图片
        img {
          width: 100%;
          border-radius: .24rem;
        }
        // 名字
        .name {
          text-align: center;
        }
      }
      // 接收时间
      .recive_time {
        width: 100%;
        top: -.2rem;
        font-size: .12rem;
        color: #757575;
        position: absolute;
        text-align: center;
        box-sizing: border-box;
      }
      // 内容部分
      .info_part {
        position: relative;
      }
      // 操作信息
      .handle_info {
        color: #111;
        // display: flex;
        font-size: .12rem;
        margin-left: .2rem;
        // flex-direction: column;
        // justify-content: center;
        position: relative;
        background: #eee;
        padding: .04rem .1rem .1rem;
        box-sizing: border-box;
        border-radius: .04rem;
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
          font-size: .14rem;
          color: #757575;
        }
        // 三角
        .triangle {
          content: ""; 
          width: 0;
          height: 0;
          top: .1rem;
          left: -.1rem;          
          position: absolute;
          border-top: .1rem solid transparent;
          border-right: .1rem solid #eee;
          border-bottom: .1rem solid transparent;
        }
      }
    }
    // 当工作流为最后一个 并且节点与我有关时
    .whenisMine{
      flex-direction: row-reverse;
      .handle_info {
        margin-left: 0;
        margin-right: .2rem;
        .triangle {
          content: ""; 
          width: 0;
          height: 0;
          top: .1rem;
          left: inherit;
          right: -.1rem;          
          position: absolute;
          border-top: .1rem solid transparent;
          border-left: .1rem solid #eee;
          border-right: none;
          border-bottom: .1rem solid transparent;
        }
      }
    }
  }
  // 确定
  .btn {
    width: 100%;
    background: #fff;
    text-align: center;
    margin-bottom: .1rem;
    .cfm_btn {
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      text-align: center;
      background: #5077aa;
      display: inline-block;
      border-radius: .4rem;
      box-shadow: 0 2px 5px #5077aa;
    }
  }
  // 工作流数据少的时候 按钮固定在底部
  .when_less {
    left: 0;
    bottom: 0;
    position: fixed;
  }
  
}



</style>
