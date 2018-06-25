<template>
  <div class="pages">
    <h1 class="a_title">
      固定资产
      <span class="a_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward" size="16"></x-icon></span>
    </h1>
    <div class="a_main">
      <div class="a_main_part" v-for="(item,index) in assetsList" :key="index">
        <group title="请选择资产类型">
          <popup-picker
            title="资产类型"
            :data="item.model"
            v-model="item.modelOn"
            @on-change="changeType"
          ></popup-picker>
        </group>
        <group title="请填写资产型号/规格">
          <x-input
            title='资产型号/规格'
            text-align='right'
            v-model="item.modSpec"
          ></x-input>
        </group>
        <group title="请选择计量单位">
          <popup-picker
            title="计量单位"
            :data="item.unit"
            v-model="item.unitOn"
            @on-change="changeType"
          ></popup-picker>
        </group>
        <group title="请填写明细">
          <x-input
            title='单价'
            text-align='right'
            v-model="item.unitPrice"
          ></x-input>
          <x-input
            title='数量'
            text-align='right'
            v-model="item.num"
          ></x-input>
          <cell title="合计" :value="Number(item.unitPrice)*Number(item.num)==0?'':'￥'+Number(item.unitPrice)*Number(item.num)"></cell>
        </group>
        <group title="请填写部门">
          <x-input
            title='申请部门'
            text-align='right'
            v-model="item.applydept"
          ></x-input>
          <x-input
            title='使用部门'
            text-align='right'
            v-model="item.usedept"
          ></x-input>
        </group>
        <group title="费用所属">
            <popup-picker
                title="费用所属事业部"
                :data="item.bulist"
                v-model="item.buOn"
                @on-show="getSelect(item.bulist,'N1',111,111,111)"
            ></popup-picker>
            <popup-picker
                title="费用所属部门"
                :data="item.deptlist"
                v-model="item.deptOn"
                :disabled="item.buOn.length==0?true:false"
                @on-show="getSelect(item.deptlist,'N2',item.buOn[0],111,111)"
            ></popup-picker>
            <popup-picker
                title="核算归属省份"
                :data="item.provlist"
                v-model="item.provOn"
                :disabled="item.deptOn.length==0?true:false"
                @on-show="getSelect(item.provlist,'N3',item.buOn[0],item.deptOn[0],111)"
            ></popup-picker>
            <popup-picker
                title="费用所属银行"
                :data="item.banklist"
                v-model="item.bankOn"
                :disabled="item.provOn.length==0?true:false"
                @on-show="getSelect(item.banklist,'N4',item.buOn[0],item.deptOn[0],item.bankOn)"
            ></popup-picker>
        </group>
        <group title="要说点什么吗？">
            <x-textarea title="说明" :max="100"></x-textarea>
        </group>
      </div>
      <p class="note_tx" v-if="assetsList.length > 0" @click="plusType">添加另一个 <span class="plus_tx">类型</span> ?</p>
    </div>
    <div class="a_btm vux-1px-t">
      <span class="count_part">合计:￥{{total | numberComma}}</span>
      <span class="a_button" @click="goflow">确定</span>
    </div>
  </div>

</template>

<script>
  import {Cell, Group, XInput, PopupPicker, XTextarea, numberComma } from 'vux'
  import spreadService from "../service/spreadService";
  import createService from "../service/createService";
  export default {
    components: {
      Cell,
      Group,
      XInput,
      PopupPicker,
      XTextarea, 
    },
    filters:{
      numberComma 
    },
    data() {
      return {
        baseInfo:'',
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
      //获取所属事业部 | 部门 | 省份 | 银行
      getSelect(data, N, name1, name2, name3) {
        data.length = 0;
        let jsonData = {
            _dc: Date.parse(new Date()),
            key: N,
            parentId: "60d2cb55-8066-4c85-b8ea-60bde9be641b",
            name1: name1,
            name2: name2,
            name3: name3,
            page: 1,
            start: 0,
            limit: 10000
          },
          that = this,
          arr = [];
        spreadService.getAccounting(jsonData).then(res => {
          for (let i = 0; i < res.tableContent.length; i++) {
            arr.push(res.tableContent[i].unitName);
          }
          data.push(arr);
        });
      },
      plusType() {
      //添加新的选择
      this.assetsList.push({
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
      });
    },
      goMylist() { //我的提交
        this.$router.push({
          path: '/myList',
          query: {
            listId: this.$route.query.list
          }
        })
      },
      // goflow() {
      //   let jsonData={
      //       listId:this.$route.query.list, 
      //       biComment:'备注', 
      //       formData:{
      //           "handlerName": this.baseInfo.nickname, //经办人
      //           "handlerAreaName": this.baseInfo.area,  //所属区域
      //           "handlerUnitName": this.baseInfo.groupName, //经办部门
      //           "handlerRoleName": this.baseInfo.position, //经办角色
      //           "creatorName": this.baseInfo.nickname, //创建者
      //           "crtTime": Date.parse(new Date()), //创建时间
      //           "modifer": "", //修改者
      //           "modTime": "", //修改时间
      //           "handerId": this.baseInfo.userId, //经办人id
      //           "transType": "市场宣传", //交易类型
      //           "handlerUnitId": this.baseInfo.groupNameID, //经办部门id
      //           "handlerRoleId": this.baseInfo.roleID, //经办角色id
      //           "cjz": this.baseInfo.userId, //创建者id
      //           "xgz": "", //修改者id
      //           "handlerArea": this.baseInfo.areaID,//所属区域id
      //           "order" :{
      //               "dataSet": []
      //           }
      //       },
      // }
      // for (let i = 0; i < this.assetsList.length; i++) {
      //   let item = this.assetsList[i];
      //   if (item.modelOn.length == 0) {
      //     this.layer("请选择资产型号", "cancel");
      //     return;
      //   } else if (item.modSpec == "") {
      //     this.layer("请填写市场宣传", "cancel");
      //     return;
      //   } else if (item.s_type.length == 0) {
      //     this.layer("请选择宣品类型", "cancel");
      //     return;
      //   } else if (item.unitprice == "") {
      //     this.layer("请填写单价", "cancel");
      //     return;
      //   } else if (item.num == "") {
      //     this.layer("请填写数量", "cancel");
      //     return;
      //   } else if (item.buOn.length == 0) {
      //     this.layer("请选择事业部", "cancel");
      //     return;
      //   } else if (item.deptOn.length == 0) {
      //     this.layer("请选择部门", "cancel");
      //     return;
      //   } else if (item.provOn.length == 0) {
      //     this.layer("请选择省份", "cancel");
      //     return;
      //   } else if (item.bankOn.length == 0) {
      //     this.layer("请选择银行", "cancel");
      //     return;
      //   }
      //   jsonData.formData.order.dataSet.push({
      //       "projectName": item.name, //项目名称
      //       "productMarketing": item.conduct, //市场宣传
      //       "publicityType": item.s_type[0],//宣品类型
      //       "agoraNumber": item.num, //数量
      //       "agoraPrice": item.unitprice, //单价
      //       "total": Number(item.num)*Number(item.unitprice), //总计
      //       "agoraCostBU": item.buOn[0],//费用所属事业部
      //       "agoraCostDepartment": item.deptOn[0],//费用所属部门
      //       "agoraCheckProvince": item.provOn[0],//核算归属省份
      //       "agoraCostBank": item.bankOn[0],//费用所属银行
      //       "comment": item.explain, //说明
      //       "fgCode": "fgwmiw" //组合字段组编码，固定值为fgwmiw
      //   })
      // }
      // localStorage.setItem(this.$route.query.list+'-FORMDATA',JSON.stringify(jsonData))
      //   this.$router.push({path: '/flow'})
      // },
      changeType() {

      }
    },
    mounted(){
      let that = this;
      //基本信息
      spreadService.getBaseInfo().then( res=> {
          that.baseInfo = res;
      })
    },
    computed: {
    //总价
    total() {
      let total = 0;
      for (let i = 0; i < this.assetsList.length; i++) {
        total += Number(this.assetsList[i].unitPrice) * Number(this.assetsList[i].num);
      }
      return total;
    }
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

</style>
