<template>
  <div class='childPage'>
    <div class="content">
      <div class="each_property vux-1px-b" @click="EditLogPop">
        <label>更新范围:</label>
        <div class="picker" :class="{tip : !submitData.scope}">
          <span class="log_title">{{submitData.scope || "请选择"}}</span>
          <span class="iconfont icon-gengduo"></span>
        </div>
      </div>
      <div class="each_property vux-1px-b">
        <label>耗时(单位/时):</label>
        <input type="number" class="property_val" v-model="submitData.spendTime" @focus="getFocus($event)" @blur="checkVal(submitData)">
      </div>
      <div class="each_property vux-1px-b">
        <label>更新内容:</label>
        <textarea class="property_val" v-model="submitData.content" placeholder="请输入"></textarea>
      </div>
    </div>
    <div class="btn vux-1px-t" :class="{'btn_hide' :btnIsHide}">
      <span class="cfm_btn" @click="submitLog">提交</span>
    </div>
    <!--更新范围-->
    <div v-transfer-dom>
      <popup v-model="pickerStatus" position="bottom" height="50%" class="trade_pop_part"  @on-show="onShow">
        <div class="trade_pop">
          <r-scroll class='scope_list' :options="scrollOptions" ref="bScroll">
            <div v-for='(item, index) in scopeList' :key='index' class='scope_type vux-1px-b' @click="selectType(item)">
              <div class='scope_name'>{{item.name}}</div>
              <div class='checked' v-show='showSelIcon(item)'>
                <x-icon type="ios-checkmark-empty" size="25"></x-icon>
              </div>

            </div>
          </r-scroll>
        </div>
        <!-- 底部栏 -->
        <div class="count_mode vux-1px-t">
          <span class="count_num"> {{scopeType.length ? `已选 ${scopeType.length} 个` : '请选择'}} </span>
          <span class="count_btn" @click="cfmMater">确定</span>
        </div>
      </popup>
    </div>
  </div>
  
</template>

<script>
// vux插件引入
import {TransferDom, Popup, Group, Icon, XButton,dateFormat} from 'vux'
import RScroll from 'components/RScroll'
//请求 引入
import {saveLog} from 'service/app-basic/appSettingService'
//方法引入
import platfrom from '@/plugins/platform/index'
import {toFixed} from '@/plugins/calc'
export default {
  data(){
    return {
      scrollOptions:{
        click: true,
      },
      logShow: false,
      pickerStatus: false,
      scopeList: [
        {name: '表单', selected: false},
        {name: '科目关系', selected: false},
        {name: '报表', selected: false},
        {name: '工作流', selected: false},
        {name: '权限', selected: false},
      ],
      submitData: {
        scope: '',       //更新范围
        spendTime : 1,  //耗时
        content: ''      //更新内容
      },
      scopeType: [],
      listId: '',
      btnIsHide: false,
      clientHeight : document.documentElement.clientHeight,
    }
  },
  directives: {
    TransferDom
  },
  components: {
    Popup,
    Group,
    Icon,
    XButton,
    RScroll,
  },
  methods:{
    onShow() {
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          // 弹窗展示时刷新滚动，防止无法拖动问题
          this.$refs.bScroll.refresh();
        }
      })
    },
    //显示往来类型pop
    EditLogPop(){
      this.pickerStatus = true;
      this.scopeType = [];
      if (this.submitData.scope){
        let arr = this.submitData.scope.split(',');
        arr.forEach(item=>{
          let obj = {
            name :item
          }
          this.scopeType.push(obj);
        })
      }
      
    },
    // 判断是否展示选中图标
    showSelIcon(sItem) {
        return this.scopeType.findIndex(item => item.name === sItem.name) !== -1;
      },
    //选择往来类型
    selectType(sItem){
      sItem.selected = ! sItem.selected;
      let arr = this.scopeType;
      let delIndex = arr.findIndex(item => item.name === sItem.name);
      // 若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    //确认选择往来类型
    cfmMater(){
      this.pickerStatus = false;
      this.submitData.scope = '';
      this.scopeType.forEach(item=>{
        if (this.submitData.scope.length){
          this.submitData.scope += ','+item.name;
          return
        }
        this.submitData.scope += item.name
      })
    },
    //处理数据保留2位小数，取绝对值
    checkVal(item){
      let {spendTime} = item;
      // 金额
      if (spendTime) {
        item.spendTime = Math.abs(toFixed(spendTime));
      }
    },
    //提交日志
    submitLog(){
      let warn = '';
      let validateMap = [
        {
          key: 'scope',
          message: '【更新范围】',
        }, {
          key: 'spendTime',
          message: '【耗用时间】',
        }, {
          key: 'content',
          message: '【更新内容】',
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
      saveLog({...this.submitData,listId : this.listId}).then((data)=>{
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
    getFocus(e){
      event.currentTarget.select();
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
        if (this.clientHeight>document.documentElement.clientHeight) {
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
    // 新增日志，修改列表页的meta值
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
        font-size: 0.12rem;
        display: block;
        height: 0.2rem;
        line-height: 0.2rem;
      }
      .property_val{
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
        width: 100%;
        
      }
      textarea {
        height: 1.2rem;
      }
      .picker{
        display: flex;
        justify-content: space-between;
        align-items: center;
        &.tip{
          color: #6d6d6d;
        }
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
      .scope_list {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        
        .scroll-wrapper{
          padding-bottom: 0.1rem;
        }
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
