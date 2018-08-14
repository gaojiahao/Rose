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
            @on-change="changeType(index)"
          ></popup-picker>
        </group>
        <group title="请填写明细" v-if="item.status">
          <x-input
            title='单价'
            text-align='right'
            v-model.number="item.unitPrice"
          ></x-input>
          <x-input
            title='数量'
            text-align='right'
            v-model.number="item.num"
          ></x-input>
          <cell title="合计" :value="Number(item.unitPrice)*Number(item.num)==0?'':'￥'+Number(item.unitPrice)*Number(item.num) | numberComma"></cell>
        </group>
        <group title="请填写部门" v-if="item.status">
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
        <group title="费用所属"  v-if="item.status">
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
            <!-- <popup-picker
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
            ></popup-picker> -->
        </group>
        <group title="要说点什么吗？" v-if="item.status">
            <x-textarea title="说明" v-model="item.explain" :max="100"></x-textarea>
        </group>
      </div>
      <p class="note_tx" v-if="assetsList.length > 0 && formData">添加另一个 <span class="plus_tx" @click="plusType">类型</span> ? <span class="plus_delate" v-if="assetsList.length>1" @click="delateOne">删除</span></p>
    </div>
    <div class="a_btm vux-1px-t">
      <span class="count_part">合计:￥{{total | numberComma}}</span>
      <span class="a_button" @click="goflow">确定</span>
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
      assetsList: [
        {
          model: [["电脑", "桌子", "椅子"]], //资产型号
          modelOn: [], //选中资产型号
          modSpec: "", //资产型号规格
          unit: [["台", "个", "张", "件"]], //计量单位
          unitOn: [], //选中计量单位
          num: "", //数量
          unitPrice: "", //单价
          applydept: "", //申请部门
          usedept: "", //使用部门
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
      ]
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
        if (num == "1") {
          this.assetsList[index].deptOn = [];
          // this.assetsList[index].provOn = [];
          // this.assetsList[index].bankOn = [];
        } 
        // else if (num == "2") {
        //   this.assetsList[index].provOn = [];
        //   this.assetsList[index].bankOn = [];
        // } else if (num == "3") {
        //   this.assetsList[index].bankOn = [];
        // }
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
      spreadService
        .getAccounting(jsonData)
        .then(res => {
          for (let i = 0; i < res.tableContent.length; i++) {
            arr.push(res.tableContent[i].unitName);
          }
          data.push(arr);
        })
        .catch(c => {
          console.log(c);
        });
    },
    plusType() {
      //添加新的选择
      this.assetsList.push({
        model: [["电脑", "桌子", "椅子"]], //资产型号
        modelOn: [], //选中资产型号
        modSpec: "", //资产型号规格
        unit: [["台", "个", "张", "件"]], //计量单位
        unitOn: [], //选中计量单位
        unitPrice: "", //单价
        num: "", //数量
        applydept: "", //申请部门
        usedept: "", //使用部门
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
      this.getSelect(
        this.assetsList[this.assetsList.length - 1].bulist,
        "N1",
        111,
        111,
        111,
        0,
        this.assetsList.length - 1,
        true
      );
    },
    //删除一项
    delateOne() {
      this.assetsList.pop();
    },
    goflow() {
      // let jsonData = {
      //   handlerName: this.baseInfo.nickname, //经办人
      //   handlerAreaName: this.baseInfo.area, //所属区域
      //   handlerUnitName: this.baseInfo.groupName, //经办部门
      //   handlerRoleName: this.baseInfo.position, //经办角色
      //   creatorName: this.baseInfo.nickname, //创建者
      //   crtTime: Date.parse(new Date()), //创建时间
      //   modifer: "", //修改者
      //   modTime: "", //修改时间
      //   handerId: this.baseInfo.userId, //经办人id
      //   transType: "固定资产", //交易类型
      //   handlerUnitId: this.baseInfo.groupNameID, //经办部门id
      //   handlerRoleId: this.baseInfo.roleID, //经办角色id
      //   cjz: this.baseInfo.userId, //创建者id
      //   xgz: "", //修改者id
      //   handlerArea: this.baseInfo.areaID, //所属区域id
      //   order: {
      //     dataSet: []
      //   }
      // };
      let formDataNew = {
          "listId": "e3937a5c-98d2-4799-a74c-759222fb4a6d",
          "referenceId": this.guid(),
          "baseinfo": {
            "transType2": "固定资产费用预申请",
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
      // if (this.formData != "") {
      //   jsonData.biId = this.formData.biId;
      //   jsonData.biReferenceId = this.formData.biReferenceId;
      //   jsonData.transType = this.formData.transType;
      //   jsonData.modTime = this.formData.modTime;
      //   jsonData.modifer = this.formData.modifer;
      //   jsonData.xgz = this.formData.xgz;
      // }
      for (let i = 0; i < this.assetsList.length; i++) {
        let item = this.assetsList[i];
        if (item.modelOn.length == 0) {
          this.layer("请选择资产型号", "cancel");
          return;
        } else if (item.modSpec == "") {
          this.layer("请填写型号规格", "cancel");
          return;
        } else if (item.unitOn.length == 0) {
          this.layer("请选择计量单位", "cancel");
          return;
        } else if (item.unitPrice == "") {
          this.layer("请填写单价", "cancel");
          return;
        } else if (item.num == "") {
          this.layer("请填写数量", "cancel");
          return;
        } else if (item.applydept == "") {
          this.layer("请填写申请部门", "cancel");
          return;
        } else if (item.usedept == "") {
          this.layer("请填写使用部门", "cancel");
          return;
        } else if (item.buOn.length == 0) {
          this.layer("请选择事业部", "cancel");
          return;
        } else if (item.deptOn.length == 0) {
          this.layer("请选择部门", "cancel");
          return;
        } 
        // else if (item.provOn.length == 0) {
        //   this.layer("请选择省份", "cancel");
        //   return;
        // } else if (item.bankOn.length == 0) {
        //   this.layer("请选择银行", "cancel");
        //   return;
        // }
        // jsonData.order.dataSet.push({
        //   assetType: item.modelOn[0], //资产类型
        //   assetModel: item.modSpec, //资产型号/规格
        //   meteringUnit: item.unitOn[0], //计量单位
        //   assetNumber: item.num, //数量（固定资产）
        //   assetPrice: item.unitPrice, //单价
        //   applyDepartment: item.applydept, //申请部门
        //   useDepartment: item.usedept, //使用部门
        //   assetCostTotal: Number(item.num) * Number(item.unitPrice), //费用合计
        //   assetCostBU: item.buOn[0], //费用所属事业部
        //   assetCostDepartment: item.deptOn[0], //费用所属部门
        //   assetCheckProvince: item.provOn[0], //核算归属省份
        //   assetCostBank: item.bankOn[0], //费用所属银行
        //   comment: item.explain, //说明
        //   fgCode: "fgwmiw" //组合字段组编码，固定值为fgwmiw
        // });
        formDataNew.transDetailUncalc.push(
          {
            "id": this.guid(),
            "inventoryType": {
              "text": item.modelOn[0],
              "selection": {
                "data": {
                  "text": item.modelOn[0],
                  "id": "extModel210-2"
                }
              },
              "value": item.modelOn[0]
            },
            "var7": item.modSpec,
            "batchNo": {
              "text": item.unitOn[0],
              "selection": {
                "data": {
                  "text": item.unitOn[0],
                  "id": "extModel222-1"
                }
              },
              "value": item.unitOn[0]
            },
            "num2": item.num,
            "var1": item.applydept,
            "var2": item.usedept,
            "num1": item.unitPrice,
            "num3": Number(item.num) * Number(item.unitPrice),
            "var3": {
              "text": item.buOn[0],
              "selection": {
                "data": {
                  "dep": item.buOn[0],
                  "id": "990607"
                }
              },
              "value": item.buOn[0]
            },
            "var4": {
              "text": item.deptOn[0],
              "selection": {
                "data": {
                  "dep": item.deptOn[0],
                  "id": "990608"
                }
              },
              "value": item.deptOn[0]
            },
            "fgCode": "fgwmiw",
            "transType": "tsgdpsod",
            "entityId": "20000",
            "comment": item.explain
          }
        )
        // if (this.formData != "") {
        //   if (this.formData.order.dataSet[i]) {
        //     jsonData.order.dataSet[i].uncalcID = this.formData.order.dataSet[
        //       i
        //     ].uncalcID;
        //   } else {
        //     jsonData.order.dataSet[i].uncalcID = "";
        //   }
        // }
      }
      if(this.formDataNew && this.formDataNew!=''){
        formDataNew.$review = this.formDataNew.review;
        formDataNew.$review2 = this.formDataNew.review2;
        formDataNew.baseinfo = this.formDataNew.baseinfo;
        delete(formDataNew.review);
        delete(formDataNew.review2);
      }
      console.log(formDataNew)
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
    changeType(idx) {
      this.assetsList[idx].status = true;
    },
    cacheData(dataSet) {
      console.log(dataSet)
      let sessionArr = [];
      for (let i = 0; i < dataSet.length; i++) {
        sessionArr.push({
          model: [["电脑", "桌子", "椅子"]], //资产型号
          modelOn: [dataSet[i].inventoryType.value], //选中资产型号
          modSpec: dataSet[i].var7, //资产型号规格
          unit: [["台", "个", "张", "件"]], //计量单位
          unitOn: [dataSet[i].batchNo.value], //选中计量单位
          unitPrice: dataSet[i].num1, //单价
          num: dataSet[i].num2, //数量
          applydept: dataSet[i].var1, //申请部门
          usedept: dataSet[i].var2, //使用部门
          bulist: [], //费用所属事业部
          buOn: [dataSet[i].var3.value], //费用所属事业部选中
          deptlist: [], //费用所属部门
          deptOn: [dataSet[i].var4.value], //费用所属部门选中
          // provlist: [], //核算归属省份
          // provOn: [dataSet[i].assetCheckProvince], //核算归属省份选中
          // banklist: [], //费用所属银行
          // bankOn: [dataSet[i].assetCostBank], //费用所属银行选中
          explain: dataSet[i].comment, //说明
          status: true
        });
      }
      this.assetsList = sessionArr;
    },
    listDefault() {
      for (let j = 0; j < this.assetsList.length; j++) {
        let xp_item = this.assetsList[j];
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
        // if (xp_item.provOn.length != 0) {
        //   this.getSelect(
        //     xp_item.provlist,
        //     "N3",
        //     xp_item.buOn[0],
        //     xp_item.deptOn[0],
        //     111,
        //     0,
        //     j,
        //     true
        //   );
        // }
        // if (xp_item.bankOn.length != 0) {
        //   this.getSelect(
        //     xp_item.banklist,
        //     "N4",
        //     xp_item.buOn[0],
        //     xp_item.deptOn[0],
        //     xp_item.provOn[0],
        //     0,
        //     j,
        //     true
        //   );
        // }
      }
    }
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
          // this.formData = res.formData;
          // this.cacheData(res.formData.order.dataSet);
          // this.listDefault();
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
      for (let i = 0; i < this.assetsList.length; i++) {
        total +=
          Number(this.assetsList[i].unitPrice) * Number(this.assetsList[i].num);
      }
      return total;
    }
  }
};
</script>

<style lang='scss' scoped>
.a_title {
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
  top: 50px;
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
    .plus_delate {
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
    background: #5077aa;
    display: inline-block;
    text-align: center;
  }
}
</style>
