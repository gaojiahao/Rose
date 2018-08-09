<template>
  <div class="pages">
    <div v-if='$route.name=="help"'>
    <div id='mescroll' class="mescroll">
      <group label-align='left' title="请选择支援的地区">
        <popup-picker 
          class="each_part"
          title="支援地区" 
          placeholder="请选择省份"
          :data='areaList'
          v-model="areaValue"
          :columns="1"></popup-picker>
        <popup-picker 
          class="each_part"
          title="支援银行" 
          placeholder="请选择银行"
          :data='bankList'
          v-model="bankValue"
          :columns="1"></popup-picker>
        <x-input 
          title="支援队长"
          text-align="right"
          v-model.trim="helpCaptain"
          @on-change="captainSelect"
          @on-focus="captainFocus" 
          placeholder="请输入队长"
          ref="captainChooise"
          class="helpCaptain"></x-input>
        <x-input 
          title="支援省长"
          text-align="right"
          v-model.trim="governor"
          @on-change="provalUserByAgent('省长',$event)"
          @on-focus='provinceReset'
          placeholder="请输入省长"
          ref="provinceChooise"
          class="helpCaptain"></x-input>
          <x-input 
          title="支援常委"
          text-align="right"
          v-model.trim="member"
          @on-change="memberUser('常委',$event)"
          @on-focus='memberUserReset'
          placeholder="请输入常委"
          ref="memberChooise"
          class="helpCaptain"></x-input>
        </group>
        <group class="captain-container" :class="captainShow==false?'captainHide':''">
          <cell 
          :title="item.nickname" 
          v-for="(item, index) in teamLeaderList" 
          :key="index" 
          @click.native="getNickname(item.nickname)"></cell>
        </group>

        <group class="captain-container">
          <cell 
          :title="item.nickname" 
          v-for="(item, index) in provalUserByList" 
          :key="index" 
          @click.native="getProvalUser(item.nickname)"></cell>
        </group>

        <group class="captain-container">
          <cell 
          :title="item.nickname" 
          v-for="(item, index) in MemberUserList" 
          :key="index" 
          @click.native="getMemberUser(item.nickname)"></cell>
        </group>

        <group 
          label-align='left' 
          :title="index>0?'':'请选择对应的产品'" 
          v-for="( item ,index ) in arr"
          :key="index">
          <popup-picker 
            class="each_part"
            title="项目类产品" 
            placeholder="请选择产品"
            :data="list"
            v-model="item.value"
            :columns="1"
            show-name></popup-picker>
          <cell 
            class="each_part"
            title="单价"
           :value="item.value[0]=='无'?'￥'+0:'￥'+item.value[0].split('_')[3] | numberComma"
            value-align="right" 
            v-if="item.value.length>0"></cell>
            <!-- 数量输入 -->
            <div class="weui-cell each_part">
              <div class="weui-cell__hd">数量</div>
              <div class="weui-cell__bd weui-cell__primary" >
                <input 
                  class="weui-input"
                  title="数量" 
                  type="number" 
                  style="text-align: right;"
                  placeholder="请输入数量"
                  v-if="item.value[0]!=='无'"
                  v-model.number="item.qty"></input>
              </div>
            </div>
        </group>

        <p class="caution_part" v-if='arr[0].value.length!=0'>
          您还需要添加新的项目？请点击 <span class="plus_tx" @click="createNew">新增</span>
          <span v-if="arr.length>1">
            <span>或</span>
            <span class="plus_delect" @click="deleteNew">删除</span>
          </span>
        </p>
        
        <group class="caution_inputs">
          <x-input 
          title="A类产品"
          :value='Aclass | numberComma(3)' 
          @input="Ainput" 
          ref='input1'
          text-align="right" 
          placeholder="请输入金额"></x-input>
          <x-input 
          title="B类产品"
          :value='Bclass | numberComma(3)'  
          @input="Binput" 
          ref='input2'
          text-align="right" 
          placeholder="请输入金额"></x-input>
        </group>

        <group>
          <x-input 
          title="备注"
          text-align="right" 
          placeholder="非必填 如有需要请填写"
          v-model="comments"></x-input>
        </group>

    </div>
    <x-button 
        id="count_button" 
        :gradients="btnStatus==true?['#B99763', '#E7D0A2']:['#ddd','#ddd']"
        @click.native="end">
        进入合计
    </x-button>
    <confirm></confirm>
      <alert></alert>
      </div>
      <router-view></router-view>
  </div>
</template>

<script>
import saleRepotService from "../service/saleRepotService";
import optionService from "../service/optionService";
import {
  Cell,
  Alert,
  Group,
  XInput,
  XButton,
  Confirm,
  Selector,
  PopupPicker,
  numberComma
} from "vux";

export default {
  components: {
    Cell,
    Group,
    Alert,
    XInput,
    Confirm,
    XButton,
    Selector,
    PopupPicker
  },
  data() {
    return {
      alertEnd: false,
      btnStatus: true,
      list: [
        {name: "无",value: "无",parent: "0"},
        {name: 0,value: "无",parent: "无"}
      ],
      arr: [{ value: [], qty: "" }],
      Aclass: "",
      Bclass: "",
      showNumber: false,
      showNewDiv: false,
      mescroll: null,
      totalInfo: "",
      areaList: [],
      areaValue: [],
      bankList: [],
      bankValue: [],
      teamLeaderList: [],
      teamLeaderValue: [],
      helpCaptain: "",
      captainShow: false,
      governor: "",
      governorStatus: true,
      member: "",
      memberStatus: true,
      provalUserByList: [],
      MemberUserList: [],
      comments: ""
    };
  },
  filters: {
    numberComma
  },
  methods: {
    //添加新数据
    createNew() {
      this.arr.push({ value: [], qty: "" });
    },
    deleteNew() {
      if (this.arr.length == 1) {
        this.arr = [{ value: [], qty: "" }];
      } else {
        this.arr.splice(this.arr.length - 1, 1); //删除新数据
      }
    },
    //随机ID
    guid() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return ( S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4() );
    },
    listData() {
      saleRepotService.saleRepotList().then(data => {
        for (let i = 0; i < data.tableContent.length; i++) {
          this.list.push(
            {
              name: data.tableContent[i]["trans_detail_uncalc.transObjCode"],
              value: data.tableContent[i]["trans_detail_uncalc.transObjCode"] + "_" + i + "_" + data.tableContent[i]["trans_detail_uncalc.qty"]+'_'+data.tableContent[i]["trans_detail_uncalc.price"],
              parent: "0"
            }
          );
        }
      });
    },
    end() {
      if (this.btnStatus == false)return;

      // let that = this;
      if (this.areaValue.length == 0 || this.areaValue.indexOf('空') === 0) {
        this.$vux.alert.show({
          title: "提示",
          content: "请选支援地区"
        });
        return;
      } else if (this.bankValue.length == 0) {
        this.$vux.alert.show({
          title: "提示",
          content: "请选支援银行"
        });
        return;
      } else if (this.helpCaptain == "") {
        this.$vux.alert.show({
          title: "提示",
          content: "请填写支援队长"
        });
        return;
      } else if (this.arr[0].value.length == 0) {
        this.$vux.alert.show({
          title: "提示",
          content: "请选择项目产品"
        });
        return;
      } else if (!this.governor) {
        this.$vux.alert.show({
          title: "提示",
          content: "请填写省长信息"
        });
        return;
      } else if (!this.member) {
        this.$vux.alert.show({
          title: "提示",
          content: "请填写常委信息"
        });
        return;
      }

      localStorage.setItem(
        "HELP_ZONE_INFO",
        JSON.stringify({
          bank: this.bankValue[0],
          areaValue: this.areaValue[0],
          captain: this.helpCaptain
        })
      );

      let governor = this.governor,
          member = this.member,
          comments = this.comments,
          HELP_ZONE_INFO = JSON.parse(localStorage.getItem("HELP_ZONE_INFO")),
          ROSE_OPTION = JSON.parse(localStorage.getItem("ROSE_OPTION"));  //业务员原有的个人信息

      // 表单提交信息
      let jsonData = {
        listId: "4bda3e47-a088-4749-a988-ebb07cfb00e4",
        referenceId: this.guid(),
        baseinfoExt: {
          id: this.guid(),
          varchar1: ROSE_OPTION.dept,         //区域(事业部) (业务自带信息)
          varchar2: HELP_ZONE_INFO.captain,   //支援队长
          varchar3: HELP_ZONE_INFO.areaValue, //支援地区(省份)
          varchar4: HELP_ZONE_INFO.bank,      //支援银行
          varchar5: ROSE_OPTION.groupName,    //部门(业务自带信息)
          varchar6: "是",                     //区分是否为支援
          varchar7: governor,                 //省长
          varchar8: member,                   //常委
          varchar9: comments,                 //备注
          varchar10: ROSE_OPTION.region,     //省份(业务自带信息)
          varchar11: ROSE_OPTION.bank,        //银行(业务自带信息)
          varchar12: ROSE_OPTION.userCode     //工号

        },
        transDetailUncalc: [],
        transCode: "XHXSDD"
      };
      // 项目类产品
      for (let i = 0; i < this.arr.length; i++) {
        if (this.arr[i].value[0] != "无" && this.arr[i].qty === "") {
          this.$vux.alert.show({
            title: "提示",
            content: "请填写项目类产品数量"
          });
          return;
        } else {
          jsonData.transDetailUncalc.push({
            id: this.guid(),
            transObjCode:this.arr[i].value[0] === "无" ? "无" : this.arr[i].value[0].split("_")[0], //项目类产品名称
            containerCode: "项目类产品", //类型
            qty: this.arr[i].value[0] === "无" ? "" : this.arr[i].qty,
            taxAmount: this.arr[i].value[0] === "无" ? "" : Number(this.arr[i].value[0].split("_")[2]),
            amount: this.arr[i].qty * this.arr[i].value[0].split('_')[3], //总金额
            fgCode: ""
          });
        }
      }
      if (!this.Aclass) {
        this.$vux.alert.show({
          title: "提示",
          content: "请填A类产品"
        });
        return;
      } else if (!this.Bclass) {
        this.$vux.alert.show({
          title: "提示",
          content: "请填B类产品"
        });
        return;
      } else {
        jsonData.transDetailUncalc.push(
          {
            id: this.guid(),
            transObjCode: "A类产品", //项目类产品名称
            containerCode: "A", //类型
            qty: "",
            amount: Number(this.Aclass), //总金额
            fgCode: ""
          },
          {
            id: this.guid(),
            transObjCode: "B类产品", //项目类产品名称
            containerCode: "B", //类型
            qty: "",
            amount: Number(this.Bclass), //总金额
            fgCode: ""
          }
        );
      }
      let totalInfo = {
        isMobile: true,
        conn: 20000,
        list: "trans_form_data",
        transCode: "XHXSDD",
        jsonData: JSON.stringify(jsonData)
      };
      this.totalInfo = totalInfo;

      localStorage.setItem(
        "saleReportInfo",
        JSON.stringify({
          saleReportRemark: totalInfo,
          time: new Date().getTime()
        })
      );
      localStorage.setItem(
        "help_saleReport",
        JSON.stringify({
          saleReportArr: this.arr,
          Aclass: this.Aclass,
          Bclass: this.Bclass,
          time: new Date().getTime()
        })
      );

      localStorage.setItem(
        "HELP_INFO_LIST",
        JSON.stringify({
          captain: this.helpCaptain,
          governor: this.governor,
          member: this.member
        })
      );
      this.$router.push({ path: "/count" });
    },
    Ainput(e) {
      this.Aclass = e.split(",").join("");
    },
    Binput(e) {
      this.Bclass = e.split(",").join("");
    },
    letMeTest() {
      let path = this.$router.path;
    },
    //获取区域
    getArea() {
      optionService.getRegion().then(data => {
        for (let i = 0; i < data.length; i++) {
          this.areaList.push({
            name: data[i].name,
            value: data[i].name
          });
        }
      });
    },
    //获取银行
    getBank() {
      optionService.getBank().then(data => {
        for (let i = 0; i < data.length; i++) {
          data[i].value = data[i].name;
        }
        this.bankList = data;
      });
    },
    //获取队长
    teamLeader() {
      optionService.getCaptain().then(data => {
        for (let i = 0; i < data.tableContent.length; i++) {
          data.tableContent[i].name = data.tableContent[i].nickname;
          data.tableContent[i].value = data.tableContent[i].nickname;
        }
        this.teamLeaderList = data.tableContent;
      });
    },
    //匹配队长
    captainSelect(e) {
      if (this.captainShow == false || this.helpCaptain == "") {
        return;
      }
      optionService.getCaptain({ value: e }).then(data => {
        this.teamLeaderList = data.tableContent;
      });
    },
    captainFocus() {
      this.captainShow = true;
    },
    //选择队长
    getNickname(e) {
      this.helpCaptain = e;
      this.captainShow = false;
      this.teamLeaderList = [];
    },
    //省长
    provalUserByAgent(type, e) {
      if (this.governorStatus == false || this.governor == "") {
        this.provalUserByList = [];
        return;
      }
      let data = {
        entityId: 20000,
        filter: JSON.stringify([
          { operator: "like", value: type, property: "role" },
          { operator: "like", value: e, property: "nickname" }
        ])
      };
      saleRepotService.getApprovalUserByAgent(data).then(res => {
        this.provalUserByList = res.tableContent;
      });
    },
    provinceReset(e) {
      this.governorStatus = true;
    },
    //选择省长
    getProvalUser(val) {
      this.governorStatus = false;
      this.provalUserByList = [];
      this.governor = val;
    },
    //常委
    memberUser(type, e) {
      if (this.memberStatus == false || this.member == "") {
        this.MemberUserList = [];
        return;
      }
      let data = {
        entityId: 20000,
        filter: JSON.stringify([
          { operator: "like", value: type, property: "role" },
          { operator: "like", value: e, property: "nickname" }
        ])
      };
      saleRepotService.getApprovalUserByAgent(data).then(res => {
        this.MemberUserList = res.tableContent;
      });
    },
    memberUserReset(e) {
      this.memberStatus = true;
    },
    //选择常委
    getMemberUser(val) {
      this.memberStatus = false;
      this.MemberUserList = [];
      this.member = val;
    }
  },
  mounted() {
    //提交时间是否超过20点
    // saleRepotService.getModelData().then(res => {
    //   if (res.submitAllow === 1) {
    //     this.btnStatus = true;
    //   } else if (res.submitAllow === 0) {
    //     this.btnStatus = false;
    //     this.$vux.alert.show({
    //       title: "提示",
    //       content: "每日提交截止时间为20:00"
    //     });
    //   }
    // });
    this.getArea();
    this.getBank();
    if (localStorage.getItem("help_saleReport")) {
      this.arr = JSON.parse(
        localStorage.getItem("help_saleReport")
      ).saleReportArr;
      this.Aclass = JSON.parse(localStorage.getItem("help_saleReport")).Aclass;
      this.Bclass = JSON.parse(localStorage.getItem("help_saleReport")).Bclass;
    }
    if (localStorage.getItem("HELP_ZONE_INFO")) {
      this.areaValue = [
        JSON.parse(localStorage.getItem("HELP_ZONE_INFO")).areaValue
      ];
      this.bankValue = [
        JSON.parse(localStorage.getItem("HELP_ZONE_INFO")).bank
      ];
    }
    if (localStorage.getItem("HELP_INFO_LIST")) {
      this.helpCaptain = JSON.parse(
        localStorage.getItem("HELP_INFO_LIST")
      ).captain;
      this.governor = JSON.parse(
        localStorage.getItem("HELP_INFO_LIST")
      ).governor;
      this.governorStatus = false;
      this.member = JSON.parse(localStorage.getItem("HELP_INFO_LIST")).member;
      this.memberStatus = false;
    }
    this.listData();
  },
  beforeRouteLeave(to, from, next) {
    let that = this;
    if (that.arr[0].value.length == 0 || to.name == "Count") {
      next();
    } else {
      that.$vux.confirm.show({
        title: "温馨提示",
        content: "要保存数据吗？",
        confirmText: "确认",
        cancelText: "取消",
        onCancel() {
          localStorage.removeItem("help_saleReport");
          localStorage.removeItem("HELP_INFO_LIST");
          next();
        },
        onConfirm() {
          //缓存填写信息
          localStorage.setItem(
            "help_saleReport",
            JSON.stringify({
              saleReportArr: that.arr,
              Aclass: that.Aclass,
              Bclass: that.Bclass,
              captain: that.helpCaptain,
              time: new Date().getTime()
            })
          );
          //缓存地区信息
          localStorage.setItem(
            "HELP_ZONE_INFO",
            JSON.stringify({
              bank: that.bankValue[0],
              areaValue: that.areaValue[0],
              captain: that.helpCaptain
            })
          );
          //省长常委
          localStorage.setItem(
            "HELP_INFO_LIST",
            JSON.stringify({
              captain: that.helpCaptain,
              governor: that.governor,
              member: that.member
            })
          );
          next();
        }
      });
    }
  }
};
</script>

<style>
.mescroll {
  padding-bottom: 50px;
  position: relative;
}
/* 底部提示文字 */
.caution_part {
  width: 100%;
  text-align: center;
  color: #ccc;
  font-size: 12px;
  margin-top: 4px;
}
.plus_tx {
  color: dodgerblue;
}
.reduce_tx {
  color: #ff2719;
}
/* 删除按钮 */
.delete_button {
  position: absolute;
  top: 0;
}
/* 合计按钮  */
#count_button {
  position: fixed;
  bottom: 0;
  left: 0;
  border-radius: 0;
  z-index: 99;
}
.plus_delect {
  color: red;
}
.helpCaptain {
  position: relative;
}
.captain-container {
  width: 100%;
  max-height: 132px;
  position: absolute;
  overflow-y: scroll;
  background: #fff;
  z-index: 8;
}
.captain-container > .weui-cells {
  margin-top: 0;
  background: #f0f2f5;
}
.caution_inputs > .weui-cells {
  overflow: inherit;
}
.captainHide {
  display: none;
}
</style>
