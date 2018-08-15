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
        <group title="请选择您申请的类型">
          <popup-picker
            title="市场宣传"
            :data="item.conduct"
            v-model="item.s_conduct"
            @on-hide="changeConduct(index,item.s_conduct,$event)"
          ></popup-picker>
        </group>
        <group title="请填写明细" v-if="item.status">
          <popup-picker
            title="宣品类型"
            :data="item.type"
            v-model="item.s_type"
          ></popup-picker>
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
            ></popup-picker>
        </group>
        <group title="要说点什么吗？" v-if="item.status">
            <x-textarea title="说明" :max="100" v-model="item.explain"></x-textarea>
        </group>
      </div>
      <p class="note_tx" v-if="xp_list.length > 0 && formData">添加另一个 <span class="plus_tx" @click="plusType">类型</span> ? <span class="plus_delate" v-if="xp_list.length>1" @click="delateOne">删除</span></p>
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
      baseInfo: "",
      formData: true,
      formDataNew:'',
      xp_list: [
        {
          name: "", //项目名称
          conduct: [], //市场宣传
          s_conduct:[], //选择产品
          type: [], //宣品类型
          s_type: [], //选择类型
          unitprice: "", //单价
          num: "", //数量
          bulist: [], //费用所属事业部
          buOn: [], //费用所属事业部选中
          deptlist: [], //费用所属部门
          deptOn: [], //费用所属部门选中
          explain: "", //说明
          status: false
        }
      ], // 宣品 填写内容
      searchInfo: false
    };
  },
  methods: {
    //获取当前时间
    getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                + " " + date.getHours() + seperator2 + date.getMinutes()
                + seperator2 + date.getSeconds();
        return currentdate;
    },
    // TODO 生成随机串
    guid() {
      let S4 = () => {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };

      return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    },
    //获取所属事业部 | 部门 | 省份 | 银行
    getSelect(data, N, name1, name2, name3, num, index, e) {
      if (e === true) {
        if(num == 1){
          this.xp_list[index].deptOn = [];
        }
      } else {
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
        arr = [];
      spreadService.getAccounting(jsonData).then(res => {
        for (let i = 0; i < res.tableContent.length; i++) {
          arr.push(res.tableContent[i].unitName);
        }
        data.push(arr);
      })
    },
    //选择市场宣传类型
    changeConduct(index,val,e){
      if(e){
        this.xp_list[index].status = true;
      }
      spreadService.getMarketInfo(2,val[0]).then(data=>{
        let arr = [];
        data.tableContent && data.tableContent.forEach(item=>{
          if(item.marketInformation){
            arr.push(item.marketInformation)
          }
        })
        if(e){
           this.xp_list[index].s_type.length = 0;
        }
        this.xp_list[index].type.length = 0;
        this.xp_list[index].type.push(arr);
      })

    },
    plusType() {
      //添加新的选择
      this.xp_list.push({
        name: "", //项目名称
        conduct:this.xp_list[0].conduct, //市场宣传
        s_conduct:[],
        type: [], //宣品类型
        s_type: [], //选择类型
        unitprice: "", //单价
        num: "", //数量
        bulist: [], //费用所属事业部
        buOn: [], //费用所属事业部选中
        deptlist: [], //费用所属部门
        deptOn: [], //费用所属部门选中
        explain: "", //说明
        status: false
      });
      this.getSelect(
        this.xp_list[this.xp_list.length - 1].bulist,
        "N1",
        111,
        111,
        111,
        0,
        this.xp_list.length - 1,
        true
      );
    },
    //删除一项
    delateOne() {
      this.xp_list.pop();
    },
    goflow() {
      let formDataNew = {
          "listId": "cefa61bb-8a2c-48f5-819b-011e0cf4fb6c",
          "referenceId": this.guid(),
          "baseinfo": {
            "transType2": "市场宣传费用预申请",
            "zhuti": "国富黄金",
            "effectiveTime": "",
            "transCode": "KFSCPCGRK",
            "statusText": "",
            "creatorName": this.baseInfo.nickname,
            "crtTime": this.getNowFormatDate(),
            "modifer": "",
            "modTime": this.getNowFormatDate(),
            "handler": this.baseInfo.userId,
            "transType": "tspcchin",
            "handlerUnit":this.baseInfo.groupNameID,
            "handlerRole": this.baseInfo.roleID,
            "id":this.guid(),
            "creator": "",
            "handlerArea":this.baseInfo.areaID,
            "status": "",
            "comment": "", //备注
            "fj": []
          },
          "transDetailUncalc": [],
          "$comment": {
            "baseinfo.comment": "" //备注
          },
          "baseinfo.fj": [],
          "transCode": "KFSCPCGRK"
        };
      for (let i = 0; i < this.xp_list.length; i++) {
        let item = this.xp_list[i];
        if (item.name == "") {
          this.layer("请填写项目名称", "cancel");
          return;
        } else if (item.s_conduct.length == 0) {
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
        } 
        formDataNew.transDetailUncalc.push({
          "id": this.formDataNew && this.formDataNew!=''?this.formDataNew.transDetailUncalc[i].id:this.guid(),
          "var1": item.name,
          "var2": {
            "text": item.s_conduct[0],
            "selection": {
              "data": {
                "marketInformation": item.s_conduct[0],
                "id": "extModel190-2"
              }
            },
            "value": item.s_conduct[0]
          },
          "var3": {
            "text":item.s_type[0],
            "selection": {
              "data": {
                "marketInformation":item.s_type[0],
                "id": "extModel200-2"
              }
            },
            "value":item.s_type[0]
          },
          "fgCode": "fgwmiw",
          "transType": "tsgdpsod",
          "entityId": "20000",
          "num1": item.num,
          "num2": item.unitprice,
          "num3": Number(item.num) * Number(item.unitprice),
          "var4": {
            "text":item.buOn[0],
            "selection": {
              "data": {
                "unitName":item.buOn[0],
                "id": "extModel213-2"
              }
            },
            "value":item.buOn[0]
          },
          "var5": {
            "text": item.deptOn[0],
            "selection": {
              "data": {
                "unitName": item.deptOn[0],
                "id": "extModel226-2"
              }
            },
            "value": item.deptOn[0]
          },
          "comment": item.explain
        })
      }
      if(this.formDataNew && this.formDataNew!=''){
        for(let k in formDataNew){
          if(k!='transDetailUncalc'){
            formDataNew[k] = this.formDataNew[k]
          }
        }
        formDataNew.$review = this.formDataNew.review;
        formDataNew.$review2 = this.formDataNew.review2;
        delete(formDataNew.review);
        delete(formDataNew.review2);
      }
      sessionStorage.setItem(
        this.$route.query.list + "-FORMDATA",
        JSON.stringify(formDataNew)
      );
      let queryData = {};
      if (this.$route.query.taskId) {
        queryData = {
          list: this.$route.query.list,
          taskId: this.$route.query.taskId
        };
      } else {
        queryData = { list: this.$route.query.list };
      }
      this.$router.push({ path: "/flow", query: queryData });
    },
    layer(info, type) {
      this.$vux.toast.show({
        text: info,
        type: type,
        position: "middle",
        time: "900"
      });
    },
    cacheData(dataSet) {
      let sessionArr = [];
      for (let i = 0; i < dataSet.length; i++) {
        sessionArr.push({
          name: dataSet[i].var1, //项目名称
          conduct: this.xp_list[0].conduct, //市场宣传
          s_conduct: [dataSet[i].var2.value], //市场宣传
          type: [], //宣品类型
          s_type: [dataSet[i].var3.value], //选择类型
          unitprice: dataSet[i].num1, //单价
          num: dataSet[i].num2, //数量
          bulist: [], //费用所属事业部
          buOn: [dataSet[i].var4.value], //费用所属事业部选中
          deptlist: [], //费用所属部门
          deptOn: [dataSet[i].var5.value], //费用所属部门选中
          explain: dataSet[i].comment, //说明
          status:true
        });
        this.$nextTick(()=>{
          this.changeConduct(i,[dataSet[i].var2.value])
        })
      }
      this.xp_list = sessionArr;
    },
    listDefault() {
      for (let j = 0; j < this.xp_list.length; j++) {
        let xp_item = this.xp_list[j];
        this.getSelect(xp_item.bulist, "N1", 111, 111, 111, 0, j, true);
        if (xp_item.deptOn.length != 0) {
          this.getSelect(
            xp_item.deptlist,
            "N2",
            xp_item.buOn[0],
            111,
            111,
            0,
            j,
            true
          );
        }
      }
    }
  },
  created() {
    spreadService.getMarketInfo(1,1).then(data=>{
      let arr = [];
      data.tableContent && data.tableContent.forEach(item=>{
        if(item.marketInformation){
          arr.push(item.marketInformation)
        }
        
      })
      this.xp_list[0].conduct.push(arr);
    })
    
  },
  mounted() {
    //基本信息
    spreadService
      .getBaseInfo()
      .then(res => {
        this.baseInfo = res;
      })
      .catch(c => {
        console.log(c);
      });
    //回显
    if (this.$route.query.formKey && this.$route.query.transCode) {
      createService.getJsonData(this.$route.query.transCode).then(res => {
          let json_data = JSON.parse(res.tableContent[0].json_data);
          this.formDataNew = json_data;
          this.cacheData(this.formDataNew.transDetailUncalc);
          this.listDefault();
          this.formData = false;
        })
        .catch(c => {
          console.log(c);
        });
    } else if (sessionStorage.getItem(this.$route.query.list + "-FORMDATA")) {
      let dataSet = JSON.parse(
        sessionStorage.getItem(this.$route.query.list + "-FORMDATA")
      ).transDetailUncalc;
      this.cacheData(dataSet);
      this.listDefault();
    } else {
      this.listDefault();
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
    .plus_delate {
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
