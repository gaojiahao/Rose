<template>
  <div class="pages">
    <h1 class="s_title">
      市场宣传
    </h1>
    <div class="s_main">
      <div class="s_main_part" v-for="(item, index) in xp_list" :key='index'>
        <group title="请填写项目名称">
            <x-input
            title='项目名称'
            text-align='right'
            v-model="item.name"
            disabled
            ></x-input>
        </group>
        <group title="请填写市场宣传">
            <x-input
            title='市场宣传'
            text-align='right'
            v-model="item.conduct"
            disabled
            ></x-input>
        </group>
        <group title="请选择您申请的类型">
          <popup-picker
            title="宣品类型"
            :data="item.type"
            v-model="item.s_type"
            disabled
          ></popup-picker>
        </group>
        <group title="请填写明细">
          <x-input
            title='单价'
            text-align='right'
            v-model="item.unitprice"
            disabled
          ></x-input>
          <x-input
            title='数量'
            text-align='right'
            v-model="item.num"
            disabled
          ></x-input>
        </group>
        <group title="金额">
          <cell title='合计'>{{item.unitprice*item.num==0?'':'￥'+item.unitprice*item.num | numberComma}}</cell>
        </group>
        <group title="费用所属">
            <popup-picker
                title="费用所属事业部"
                :data="item.bulist"
                v-model="item.buOn"
                disabled
            ></popup-picker>
            <popup-picker
                title="费用所属部门"
                :data="item.deptlist"
                v-model="item.deptOn"
                disabled
            ></popup-picker>
            <popup-picker
                title="核算归属省份"
                :data="item.provlist"
                v-model="item.provOn"
                disabled
            ></popup-picker>
            <popup-picker
                title="费用所属银行"
                :data="item.banklist"
                v-model="item.bankOn"
                disabled
            ></popup-picker>
        </group>
        <group title="要说点什么吗？">
            <x-textarea title="说明" readonly :max="100" v-model="item.explain"></x-textarea>
        </group>
      </div>
    </div>
     <div class="spinner" v-if="Load">
        <spinner type="android" size="40px"></spinner>
     </div>
     <div class="s_btm vux-1px-t" v-if="canSubmit == '1'">
      <span class="s_button" @click="end(0)">拒绝</span>
      <span class="s_button" @click="end(1)">同意</span>
    </div>
  </div>
</template>

<script>
import { Cell, Group, XInput, PopupPicker, XTextarea, numberComma, Spinner ,Toast } from "vux";
import spreadService from "../service/spreadService";
import createService from "../service/createService";
import { setTimeout } from 'timers';
export default {
  components: {
    Cell,
    Group,
    XInput,
    PopupPicker,
    XTextarea,
    Spinner,
    Toast
  },
  filters: {
    numberComma
  },
  data() {
    return {
      Load:true,
      listId:'',
      canSubmit: this.$route.query.canSubmit,
      xp_list: [
        {
          name: "", //项目名称
          conduct: "", //市场宣传
          type: [
            [
              "单页",
              "三折页",
              "X展架",
              "易拉宝",
              "三角牌",
              "海报",
              "吊旗",
              "地贴",
              "道具"
            ]
          ], //宣品类型
          s_type: [], //选择类型
          unitprice: "", //单价
          num: "", //数量
          bulist: [], //费用所属事业部
          buOn: [], //费用所属事业部选中
          deptlist: [], //费用所属部门
          deptOn: [], //费用所属部门选中
          provlist: [], //核算归属省份
          provOn: [], //核算归属省份选中
          banklist: [], //费用所属银行
          bankOn: [], //费用所属银行选中
          explain: "", //说明
          status: false,
        }
      ] // 宣品 填写内容
    };
  },
  methods: {
    //审批弹窗
    endToast(taskId,data){
      let that = this;
      createService.examineTask(taskId,data).then( res=> {
        if(res.success){
          that.$vux.toast.show({
            text: res.message,
            position: 'middle',
            type: 'text',
            onShow () {
              setTimeout(function(){
                that.$vux.toast.hide();
                that.$router.go(-1);
              },800)
            },
          });
        }
      }).catch( c =>{
        that.$vux.toast.show({
            text: c.message,
            position: 'middle',
            type: 'text',
            onShow () {
              setTimeout(function(){
                that.$vux.toast.hide()
              },800)
            },
          });
      })
    },
    //审批
    end(num){
      let that = this,
      taskId = that.$route.query.taskId,
      transCode = that.$route.query.transCode,
      data = {};
      //拒绝
      if( num == 0 ){
        data = {"result": 0, "transCode": transCode, "comment": "审批意见"};
        that.endToast(taskId,data);
      }else if( num == 1 ){
        //同意
        data = {"result": 1, "transCode": transCode, "comment": "审批意见"};
        that.endToast(taskId,data);
      }
    }
  },
  created(){
    let that = this;
    let {query} = this.$route;
    //that.canSubmit = that.$route.query.canSubmit;
    if (query.transCode) {
      createService.getFormData({
        formKey: query.formKey,
        transCode: query.transCode,
      }).then( res => {
        that.listId = res.listId;
        let dataSet = res.formData.order.dataSet,
        newArr = [];
        for(let i = 0 ; i< dataSet.length ; i++ ){
          newArr.push({
          name: dataSet[i].projectName, //项目名称
          conduct:dataSet[i].productMarketing, //市场宣传
          type: [
            [
              "单页",
              "三折页",
              "X展架",
              "易拉宝",
              "三角牌",
              "海报",
              "吊旗",
              "地贴",
              "道具"
            ]
          ], //宣品类型
          s_type: [dataSet[i].publicityType], //选择类型
          unitprice: Number(dataSet[i].agoraPrice), //单价
          num: Number(dataSet[i].agoraNumber), //数量
          bulist: [], //费用所属事业部
          buOn: [dataSet[i].agoraCostBU], //费用所属事业部选中
          deptlist: [], //费用所属部门
          deptOn: [dataSet[i].agoraCostDepartment], //费用所属部门选中
          provlist: [], //核算归属省份
          provOn: [dataSet[i].agoraCheckProvince], //核算归属省份选中
          banklist: [], //费用所属银行
          bankOn: [dataSet[i].agoraCostBank], //费用所属银行选中
          explain: dataSet[i].comment, //说明
          status: false
          })
        }
        that.xp_list = newArr;
        that.Load = false;
      })
    }
  },
  mounted(){
  },
  computed: {

  }
};
</script>

<style lang='scss' scoped>
.pages {
  overflow: auto;
  -webkit-overflow-scrolling: auto;
}

.s_title {
  //标题
  width: 100%;
  height: 120px;
  line-height: 80px;
  font-size: 34px;
  text-align: center;
  color: #fff;
  font-weight: 200;
  background: #5077aa;
  position: relative;
  .s_user {
    line-height: initial;
    font-size: 16px;
    font-weight: normal;
    position: absolute;
    left: 50%;
    bottom: 20%;
    transform: translate(-50%);
    display: flex;
    align-items: center;
    .right_arrow {
      fill: #fff;
    }
  }
}

.s_main {
  width: 90%;
  max-width: 600px;
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translate(-50%, 0);
  border-radius: 4px;
  z-index: 100;
  padding-bottom: 56px;
  .s_main_part {
    background: #fff;
    margin-top: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px #e8e8e8;
  }
  .note_tx {
    width: 100%;
    margin-top: 6px;
    text-align: center;
    font-size: 12px;
    .plus_tx {
      color: #5077aa;
    }
    .plus_delate{
      color: red;
    }
  }
}

.s_btm {
  width: 100%;
  height: 44px;
  line-height: 44px;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 101;
  margin-top: 20px;
  box-sizing: border-box;
  background: #fff;
  display: flex;
  span:first-child{
    background: #ccc;
  }
  .count_part {
    flex: 2.5;
    color: #000;
    display: inline-block;
    text-align: center;
    font-weight: bold;
  }
  .s_button {
    flex: 1;
    color: #fff;
    background: #5077aa;
    display: inline-block;
    text-align: center;
  }
}
.spinner{
  position: fixed;
  width: 100%;
  text-align: center;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 111;
  .vux-spinner-android{
    stroke:#5077aa;
  }
}
</style>
