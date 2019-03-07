<template>
  <div class='childPage'>
    <div class="content">
      <div class="each_property vux-1px-b" @click="getDate">
        <label>期间(月份):</label>
        <div class="property_val" :class="{tip : submitData.date === ''}">{{submitData.date || '请选择'}}</div>
      </div>
      <div class="each_property vux-1px-b">
        <label>效率与成本改进成果:</label>
        <textarea class="property_val" v-model="submitData.achievement" placeholder="请输入"></textarea>
      </div>
      <div class="each_property vux-1px-b">
        <label>效率与成本改进机会:</label>
        <textarea class="property_val" v-model="submitData.chance" placeholder="请输入"></textarea>
      </div>
    </div>
    <div class="btn vux-1px-t" :class="{'btn_hide' : btnIsHide}">
      <span class="cfm_btn" @click="submit">提交</span>
    </div>
  </div> 
</template>

<script>
// vux插件引入
import { Popup, Group,dateFormat} from 'vux'
//请求 引入
import {saveAssessment} from 'service/app-basic/appSettingService'
import platfrom from '@/plugins/platform/index'
export default {
  data(){
    return {
      submitData: {
        achievement: '',       //改进结果
        chance : '',  //改进机会
        date: ''      //期间
      },
      listId: '',
      btnIsHide: false,
      clientHeight : document.documentElement.clientHeight,
    }
  },
  components: {
    Popup,
    Group,
   
  },
  methods:{
    //获取时间
    getDate(){
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        format: 'YYYY-MM',
        onConfirm: (val)=> {
          console.log(val);
          this.submitData.date = val;
        },
      })
    },
    //提交评论
    submit(){
      let warn = '';
      let validateMap = [
        {
          key: 'date',
          message: '【期间（月份）】',
        },
        {
          key: 'achievement',
          message: '【效率与成本改进成果】',
        }, {
          key: 'chance',
          message: '【效率与成本改进机会】',
        }, 
      ];
      validateMap.every(item => {
        if (this.submitData[item.key] === '') {
          warn = `${item.message}不能为空`;
          return false
        }
        return true
      });
      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return
      }
      let submitData = {
        achievement: this.submitData.achievement,
        chance: this.submitData.chance,
        date: `${this.submitData.date}-1`,
        listId: this.listId,
      }
      saveAssessment(submitData).then((data)=>{
        if (data.success){
          this.submitSuccess = true;
          this.$vux.alert.show({
            content: '提交成功',
            onHide: () => {
              this.$router.go(-1);
            }
          })
        }
      })
    },

  },
  created(){
    let { listId } = this.$route.params;
    if (listId) {
      this.listId = listId;
    }
  },
  mounted(){
    //解决android键盘收起input没有失去焦点，底部按钮遮挡输入框
    if (platfrom.isAndroid){
      window.onresize= ()=>{
        if (this.clientHeight > document.documentElement.clientHeight) {
          //底部按钮隐藏
            this.btnIsHide  = true;
        }else {
            this.btnIsHide = false;
        }
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    let {path} = to;
    // 新建评论，修改列表页的meta值
    if (this.submitSuccess && to.name === 'APPDETAIL') {
      to.meta.reload = true;
    }
    next();
  },

}
</script>

<style lang='scss' scoped>
  .vux-1px-b:after,.vux-1px-t:before{
    border-color: #e8e8e8;
  }
  .content{
    height: 90%;
    .each_property{
      min-height: .5rem;
      padding: 0.05rem 0.08rem;
      position: relative;
      input,textarea{
        border: none;
        outline: none;
      }
      textarea{
        resize: none; 
      }
      label{
        color: #6d6d6d;
        font-size: 0.14rem;
        display: block;
        // padding-bottom: 0.06rem;
        height: 0.2rem;
        line-height: 0.2rem;
      }
      .property_val{
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
        width: 100%;
        &.tip{
          color: #6d6d6d;
        }
        
      }
      textarea {
        height: 1.2rem;
      }
      .picker{
        display: flex;
        justify-content: space-between;
        align-items: center;
        .log_title{
          font-size: 0.16rem;
          line-height: 0.2rem;
        }
        .iconfont{
          font-size: 0.24rem;
        }
      }
    }
  }
  // 提价
  .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: fixed;
    background: #fff;
    &.btn_hide{
      display: none;
    }
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
      box-shadow: 0 2px 5px #5077aa;;
    }
  }
  
  //更新返回的pop
  .trade_pop_part {
    .trade_pop {
      background: #fff;
      height: calc(100% - .44rem);
      overflow: hidden;
      .dealer_list {
        width: 100%;
        height: 100%;
        .scope_type {
          display: flex;
          align-items: center;
          color: #757575;
          padding: 0  0.2rem;
          height: 0.4rem;
          line-height: 0.4rem;
          justify-content: space-between;
          .checked{
            height: 0.25rem;
            padding-bottom: 0.03rem;
            .vux-x-icon{
              fill: #5077aa;
            }
          }
        }
      }
    }
    // 底部栏
    .count_mode {
      left: 0;
      bottom: 0;
      width: 100%;
      display: flex;
      height: .44rem;
      position: fixed;
      line-height: .44rem;
      background: #fff;
      .count_num {
        flex: 2.5;
        color: #5077aa;
        font-size: .24rem;
        padding-left: .1rem;
      }
      .count_btn {
        flex: 1.5;
        color: #fff;
        text-align: center;
        background: #5077aa;
      }
    }
  }
  

</style>
