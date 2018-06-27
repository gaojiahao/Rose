<template>
  <div class="pages">
    <h1 class="a_title">
      固定资产
    </h1>
    <div class="a_main">
      <div class="a_main_part" v-for="(item,index) in assetsList" :key="index">
        <group title="请选择资产类型">
          <popup-picker
            title="资产类型"
            :data="item.model"
            v-model="item.modelOn"
            disabled
          ></popup-picker>
        </group>
        <group title="请填写资产型号/规格">
          <x-input
            title='资产型号/规格'
            text-align='right'
            v-model="item.modSpec"
            disabled
          ></x-input>
        </group>
        <group title="请选择计量单位">
          <popup-picker
            title="计量单位"
            :data="item.unit"
            v-model="item.unitOn"
            disabled
          ></popup-picker>
        </group>
        <group title="请填写明细">
          <x-input
            title='单价'
            text-align='right'
            v-model="item.unitPrice"
            disabled
          ></x-input>
          <x-input
            title='数量'
            text-align='right'
            v-model="item.num"
            disabled
          ></x-input>
          <cell title="合计" :value="Number(item.unitPrice)*Number(item.num)==0?'':'￥'+Number(item.unitPrice)*Number(item.num) | numberComma"></cell>
        </group>
        <group title="请填写部门">
          <x-input
            title='申请部门'
            text-align='right'
            v-model="item.applydept"
            disabled
          ></x-input>
          <x-input
            title='使用部门'
            text-align='right'
            v-model="item.usedept"
            disabled
          ></x-input>
        </group>
        <group title="费用所属" >
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
            <x-textarea title="说明" readonly v-model="item.explain" :max="100"></x-textarea>
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
  import {Cell, Group, XInput, PopupPicker, XTextarea, numberComma, Spinner, Toast } from 'vux'
  import spreadService from "../service/spreadService";
  import createService from "../service/createService";
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
    filters:{
      numberComma 
    },
    data() {
      return {
        Load: true,
        canSubmit: this.$route.query.canSubmit,
        assetsList: [
          {
            model: [['电脑','桌子','椅子']],   //资产型号
            modelOn: [],   //选中资产型号
            modSpec: '',   //资产型号规格 
            unit: [['台','个','张','件']],    //计量单位
            unitOn: [],    //选中计量单位
            num: '',       //数量
            unitPrice: '', //单价
            applydept: '', //申请部门
            usedept: '',   //使用部门
            bulist: [],    //费用所属事业部
            buOn: [],      //费用所属事业部选中
            deptlist: [],  //费用所属部门
            deptOn: [],    //费用所属部门选中
            provlist: [],  //核算归属省份
            provOn: [],    //核算归属省份选中
            banklist: [],  //费用所属银行
            bankOn: [],    //费用所属银行选中
            explain: "",   //说明
            status: false
          }
        ]
      }
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
      if (query.transCode) {
        createService.getFormData({
          formKey: query.formKey,
          transCode: query.transCode,
        }).then( res => {
          let dataSet = res.formData.order.dataSet,
          newArr = [];
          for(let i = 0 ; i< dataSet.length ; i++ ){
            newArr.push({
              model: [['电脑','桌子','椅子']],   //资产型号
              modelOn: [dataSet[i].assetType],   //选中资产型号
              modSpec: dataSet[i].assetModel,   //资产型号规格 
              unit: [['台','个','张','件']],    //计量单位
              unitOn: [dataSet[i].meteringUnit],    //选中计量单位
              num: dataSet[i].assetNumber,       //数量
              unitPrice: dataSet[i].assetPrice, //单价
              applydept: dataSet[i].applyDepartment, //申请部门
              usedept: dataSet[i].useDepartment,   //使用部门
              bulist: [],    //费用所属事业部
              buOn: [dataSet[i].assetCostBU],      //费用所属事业部选中
              deptlist: [],  //费用所属部门
              deptOn: [dataSet[i].assetCostDepartment],    //费用所属部门选中
              provlist: [],  //核算归属省份
              provOn: [dataSet[i].assetCheckProvince],    //核算归属省份选中
              banklist: [],  //费用所属银行
              bankOn: [dataSet[i].assetCostBank],    //费用所属银行选中
              explain: dataSet[i].comment,   //说明
              status: false,
            })
          }
          that.assetsList = newArr;
          that.Load = false;
        })
      }
    },
    mounted(){
    },
    computed: {
    }
  }
</script>

<style lang='scss' scoped>
  .a_title { //标题
    width: 100%;
    height: 120px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077AA;
    position: relative;
    .a_user {
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

  .a_main {
    width: 90%;
    max-width: 600px;
    position: absolute;
    top: 90px;
    left: 50%;
    transform: translate(-50%, 0);
    border-radius: 4px;
    z-index: 100;
    padding-bottom: 56px;
    .a_main_part {
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

  .a_btm {
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 101;
    margin-top: 20px;
    box-sizing: border-box;
    display: flex;
    span:first-child{
      background: #ccc;
    }
    .count_part {
      flex: 2.5;
      background: #fff;
      color: #000;
      display: inline-block;
      text-align: center;
      font-weight: bold;
    }
    .a_button {
      flex: 1;
      color: #fff;
      background: #5077AA;
      display: inline-block;
      text-align: center;
    }
  }
  .s_btm{
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 101;
    margin-top: 20px;
    box-sizing: border-box;
    text-align: center;
    display: flex;
    color: #fff;
    span:first-child{
      background: #ccc;
      flex-grow: 1;
      -webkit-flex-grow: 1;
    }
    span:last-child{
      background: #5077AA;
      flex-grow: 1;
      -webkit-flex-grow: 1;
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
