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
            ></x-input>
        </group>
        <group title="请填写市场宣传">
            <x-input
            title='市场宣传'
            text-align='right'
            v-model="item.conduct"
            ></x-input>
        </group>
        <group title="请选择您申请的类型">
          <popup-picker
            title="宣品类型"
            :data="item.type"
            v-model="item.s_type"
            @on-change="changeType(index)"
          ></popup-picker>
        </group>
        <group title="请填写明细" v-if="item.status">
          <x-input
            title='单价'
            text-align='right'
            v-model.number="item.unitprice"
          ></x-input>
          <x-input
            title='数量'
            text-align='right'
            v-model.number="item.num"
          ></x-input>
        </group>
        <group title="金额" v-if="item.status">
          <cell title='合计'>{{item.unitprice*item.num==0?'':'￥'+item.unitprice*item.num | numberComma}}</cell>
        </group>
        <group title="费用所属" v-if="item.status">
            <popup-picker
                title="费用所属事业部"
                :data="item.bulist"
                v-model="item.buOn"
                @on-hide="getSelect(item.deptlist,'N2',item.buOn[0],111,111,1,index,$event)"
            ></popup-picker>
            <popup-picker
                title="费用所属部门"
                :data="item.deptlist"
                v-model="item.deptOn"
                :disabled="item.buOn.length==0?true:false"
                @on-hide="getSelect(item.provlist,'N3',item.buOn[0],item.deptOn[0],111,2,index,$event)"
            ></popup-picker>
            <popup-picker
                title="核算归属省份"
                :data="item.provlist"
                v-model="item.provOn"
                :disabled="item.deptOn.length==0?true:false"
                @on-hide="getSelect(item.banklist,'N4',item.buOn[0],item.deptOn[0],item.provOn[0],3,index,$event)"
            ></popup-picker>
            <popup-picker
                title="费用所属银行"
                :data="item.banklist"
                v-model="item.bankOn"
                :disabled="item.provOn.length==0?true:false"
            ></popup-picker>
        </group>
        <group title="要说点什么吗？" v-if="item.status">
            <x-textarea title="说明" :max="100" v-model="item.explain"></x-textarea>
        </group>
      </div>
      <p class="note_tx" v-if="xp_list.length > 0 ">添加另一个 <span class="plus_tx" @click="plusType">类型</span> ? <span class="plus_delate" v-if="xp_list.length>1" @click="delateOne">删除</span></p>
    </div>
    <div class="s_btm vux-1px-t">
      <span class="count_part">合计:￥{{total | numberComma}}</span>
      <span class="s_button" @click="goflow">确定</span>
    </div>
  </div>
</template>

<script>
import { Cell, Group, XInput, PopupPicker, XTextarea, numberComma } from "vux";
import spreadService from "../../service/spreadService";
import createService from "../../service/createService";
export default {
  components: {
    Cell,
    Group,
    XInput,
    PopupPicker,
    XTextarea
  },
  filters: {
    numberComma
  },
  data() {
    return {
      baseInfo:'',
      formData:'',
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
          status: false
        }
      ], // 宣品 填写内容
      searchInfo:false
    };
  },
  methods: {
    //获取所属事业部 | 部门 | 省份 | 银行
    getSelect(data, N, name1, name2, name3,num,index,e) {
      if(e === true){
        if( num=='1'){
         this.xp_list[index].deptOn = [];
         this.xp_list[index].provOn = [];
         this.xp_list[index].bankOn = [];
        }else if(num=='2'){
          this.xp_list[index].provOn = [];
          this.xp_list[index].bankOn = [];
        }else if(num=='3'){
          this.xp_list[index].bankOn = [];
        }
      }else {
        return;
      }
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
      }).catch( c =>{
        console.log(c)
      });
    },
    changeType(idx) {
      this.xp_list[idx].status = true;
    },
    plusType() {
      //添加新的选择
      this.xp_list.push({
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
        status: false
      });
      this.getSelect(this.xp_list[this.xp_list.length-1].bulist,'N1',111,111,111,0,this.xp_list.length-1,true);
    },
    //删除一项
    delateOne(){
      this.xp_list.pop();
    },
    goflow() {
      
      let jsonData={
            "handlerName": this.baseInfo.nickname, //经办人
            "handlerAreaName": this.baseInfo.area,  //所属区域
            "handlerUnitName": this.baseInfo.groupName, //经办部门
            "handlerRoleName": this.baseInfo.position, //经办角色
            "creatorName": this.baseInfo.nickname, //创建者
            "crtTime": Date.parse(new Date()), //创建时间
            "modifer": "", //修改者
            "modTime": "", //修改时间
            "handerId": this.baseInfo.userId, //经办人id
            "transType": "市场宣传", //交易类型
            "handlerUnitId": this.baseInfo.groupNameID, //经办部门id
            "handlerRoleId": this.baseInfo.roleID, //经办角色id
            "cjz": this.baseInfo.userId, //创建者id
            "xgz": "", //修改者id
            "handlerArea": this.baseInfo.areaID,//所属区域id
            "order" :{
                "dataSet": []
            }
      };
      if (this.formData!=''){
        jsonData.biId = this.formData.biId;
        jsonData.biReferenceId = this.formData.biReferenceId;
        jsonData.transType = this.formData.transType;
        jsonData.modTime = this.formData.modTime;
        jsonData.modifer = this.formData.modifer;
        jsonData.xgz = this.formData.xgz;
      }
      for (let i = 0; i < this.xp_list.length; i++) {
        let item = this.xp_list[i];
        if (item.name == "") {
          this.layer("请填写项目名称", "cancel");
          return;
        } else if (item.conduct == "") {
          this.layer("请填写市场宣传", "cancel");
          return;
        } else if (item.s_type.length == 0) {
          this.layer("请选择宣品类型", "cancel");
          return;
        } else if (item.unitprice == "") {
          this.layer("请填写单价", "cancel");
          return;
        } else if (item.num == "") {
          this.layer("请填写数量", "cancel");
          return;
        } else if (item.buOn.length == 0) {
          this.layer("请选择事业部", "cancel");
          return;
        } else if (item.deptOn.length == 0) {
          this.layer("请选择部门", "cancel");
          return;
        } else if (item.provOn.length == 0) {
          this.layer("请选择省份", "cancel");
          return;
        } else if (item.bankOn.length == 0) {
          this.layer("请选择银行", "cancel");
          return;
        }
        jsonData.order.dataSet.push({
            "projectName": item.name, //项目名称
            "productMarketing": item.conduct, //市场宣传
            "publicityType": item.s_type[0],//宣品类型
            "agoraNumber": item.num, //数量
            "agoraPrice": item.unitprice, //单价
            "total": Number(item.num)*Number(item.unitprice), //总计
            "agoraCostBU": item.buOn[0],//费用所属事业部
            "agoraCostDepartment": item.deptOn[0],//费用所属部门
            "agoraCheckProvince": item.provOn[0],//核算归属省份
            "agoraCostBank": item.bankOn[0],//费用所属银行
            "comment": item.explain, //说明
            "fgCode": "fgwmiw", //组合字段组编码，固定值为fgwmiw
        })
        if(this.formData !=''){
          if(this.formData.order.dataSet[i]){
            jsonData.order.dataSet[i].uncalcID = this.formData.order.dataSet[i].uncalcID
          }else{
             jsonData.order.dataSet[i].uncalcID = "";
          }
        }
      }
      sessionStorage.setItem(this.$route.query.list+'-FORMDATA',JSON.stringify(jsonData));
      let queryData = {};
      if (this.$route.query.taskId){
        queryData = {list: this.$route.query.list,taskId: this.$route.query.taskId}
      }else{
        queryData = {list:this.$route.query.list}
      }
      this.$router.push({ path: "/flow" ,query:queryData});
    },
    layer(info, type) {
      this.$vux.toast.show({
        text: info,
        type: type,
        position: "middle",
        time: "900"
      });
    },
    cacheData(dataSet){
      let that = this,
      sessionArr=[];
      for(let i = 0 ; i<dataSet.length ; i++ ){
        sessionArr.push({
          name: dataSet[i].projectName, //项目名称
          conduct: dataSet[i].productMarketing, //市场宣传
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
          unitprice: dataSet[i].agoraPrice, //单价
          num: dataSet[i].agoraNumber, //数量
          bulist: [], //费用所属事业部
          buOn: [dataSet[i].agoraCostBU], //费用所属事业部选中
          deptlist: [], //费用所属部门
          deptOn: [dataSet[i].agoraCostDepartment], //费用所属部门选中
          provlist: [], //核算归属省份
          provOn: [dataSet[i].agoraCheckProvince], //核算归属省份选中
          banklist: [], //费用所属银行
          bankOn: [dataSet[i].agoraCostBank], //费用所属银行选中
          explain: dataSet[i].comment, //说明
          status: true
        })
      }
      that.xp_list = sessionArr;
    },
    listDefault(){
      let that = this;
      for(let j = 0 ; j<that.xp_list.length ;j++){
          let xp_item = that.xp_list[j];
          that.getSelect(xp_item.bulist,'N1',111,111,111,0,j,true);
          if(xp_item.deptOn.length != 0){
            that.getSelect(xp_item.deptlist,'N2',xp_item.buOn[0],111,111,0,j,true);
          }
          if(xp_item.provOn.length != 0){
            that.getSelect(xp_item.provlist,'N3',xp_item.buOn[0],xp_item.deptOn[0],111,0,j,true);
          }
          if(xp_item.bankOn.length != 0){
            that.getSelect(xp_item.banklist,'N4',xp_item.buOn[0],xp_item.deptOn[0],xp_item.provOn[0],0,j,true);
          }
        }
    }
  },
  created(){

  },
  mounted(){
    let that = this;
    //基本信息
    spreadService.getBaseInfo().then( res=> {
        that.baseInfo = res;
    }).catch( c =>{
      console.log(c)
    });
    //回显
    if(that.$route.query.formKey&&that.$route.query.transCode){
      createService.getFormData({
          formKey: that.$route.query.formKey,
          transCode: that.$route.query.transCode,
        }).then(res =>{
           that.formData = res.formData;
           that.cacheData(res.formData.order.dataSet);
           that.listDefault();
        }).catch(c =>{
          console.log(c)
        })
    }else if(sessionStorage.getItem(that.$route.query.list+'-FORMDATA')){
      let dataSet = JSON.parse(sessionStorage.getItem(that.$route.query.list+'-FORMDATA')).order.dataSet;
      that.cacheData(dataSet);
      that.listDefault();
    }else{
      that.listDefault();
    }

  },
  computed: {
    //总价
    total() {
      let total = 0;
      for (let i = 0; i < this.xp_list.length; i++) {
        total +=
          Number(this.xp_list[i].unitprice) * Number(this.xp_list[i].num);
      }
      return total;
    }
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
  height: 80px;
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
  top: 50px;
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
</style>
