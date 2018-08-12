<template>
  <div class="pages">
    <div v-if='$route.name=="saleReport"'>
      <div id='mescroll' class="mescroll">
          <group label-align='left' title="请填写所属信息">
            <x-input 
              title="所属队长"
              text-align="right"
              v-model.trim="helpCaptain"
              @on-change="captainSelect"
              @on-focus='captainFocus'
              placeholder="请输入队长"
              ref="captainChooise"
              class="helpCaptain"></x-input>
            <x-input 
              title="所属省长"
              text-align="right"
              v-model.trim="governor"
              @on-change="provalUserByAgent('省长',$event)"
              @on-focus='provinceReset'
              placeholder="请输入省长"
              ref="provinceChooise"
              class="helpCaptain"></x-input>
            <x-input 
              title="所属常委"
              text-align="right"
              v-model.trim="member"
              @on-change="memberUser('常委',$event)"
              @on-focus='memberUserReset'
              placeholder="请输入常委"
              ref="memberChooise"
              class="helpCaptain"></x-input>
          </group>
          <!-- 队长选择框 -->
          <ul class="captain-container" v-if="captainShow">
            <li class='vux-1px-b' v-for="(item, index) in peopleList" :key="index" 
              @click="getNickname(item.nickname)">{{item.nickname}}</li>
          </ul>
          <!-- 省长选择框 -->
          <ul class="governor-container" v-if="governorShow">
            <li class='vux-1px-b' v-for="(item, index) in peopleList" :key="index" 
              @click="getProvalUser(item.nickname)">{{item.nickname}}</li>
          </ul>
          <!-- 常委选择框 -->
          <ul class="commit-container" v-if="committeeShow">
            <li class='vux-1px-b' v-for="(item, index) in peopleList" :key="index" 
              @click="getMemberUser(item.nickname)">{{item.nickname}}</li>
          </ul>
          
          <group label-align='left' :title="index>0?'':'请选择对应的产品'" 
            v-for="( item ,index ) in arr" :key="index">
            <popup-picker 
              class="each_part"
              title="项目类产品" 
              placeholder="请选择产品"
              :data="list"
              v-model="item.value"
              :columns="1"
              show-name></popup-picker>
            <!-- 单价 -->
            <cell 
              class="each_part"
              title="单价"
              :value="item.value[0]=='无'?'￥'+0:'￥'+item.value[0].split('_')[3] | numberComma"
              value-align="right" 
              v-if="item.value.length>0"></cell>
            <!-- 数量输入 -->
            <div class="weui-cell each_part" v-if="item.value[0]!=='无'">
              <div class="weui-cell__hd">数量</div>
              <div class="weui-cell__bd weui-cell__primary" >
                <input 
                  class="weui-input"
                  title="数量" 
                  type="number" 
                  style="text-align: right;"
                  placeholder="请输入数量"
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
          
          <!-- A类、B类输入 -->
          <group>
            <x-input 
            title="A类产品"
            :value='Aclass'
            v-model.number='Aclass'
            ref='input1'
            text-align="right" 
            placeholder="请输入金额"
            ></x-input>
            <x-input 
            title="B类产品"
            v-model.number="Bclass" 
            ref='input2'
            text-align="right" 
            placeholder="请输入金额"
            ></x-input>
          </group>
          <!-- 备注输入 -->
          <group>
            <x-input 
            title="备注"
            text-align="right" 
            placeholder="非必填 如有需要请填写"
            ref='tips'
            v-model="comments"></x-input>
          </group>
      </div>
      <x-button id="count_button" 
        :gradients="btnStatus==true?['#B99763', '#E7D0A2']:['#ddd','#ddd']"
        @click.native="goCount">进入合计</x-button>
      <confirm></confirm>
      <alert></alert>
    </div>
      <router-view></router-view>
  </div>
</template>

<script>
// 请求 引入
import optionService from "../service/optionService";
import saleRepotService from "../service/saleRepotService";
// 插件引入
import { Cell, Alert, Group, XInput, XButton,
  Confirm, Selector, PopupPicker, numberComma} from "vux";
export default {
  components: { 
    Cell, Alert, Group, XInput,
    Confirm, XButton, Selector, PopupPicker },
  data() {
    return {
      mescroll: null,
      btnStatus: true,                  // 时间超过20:00不允许提交
      captainShow: false,               // 是否弹出 队长选择框 
      governorShow: false,              // 是否弹出 省长选择框 
      committeeShow: false,             // 是否弹出 常委选择框 
      arr: [{ value: [], qty: "" }],    // 选中的 项目类产品
      list: [{ name: "无", value: "无", parent: "0" }],     // 项目类产品
      Aclass: "",                       // A类产品 输入金额
      Bclass: "",                       // B类产品 输入金额
      member: "",                       // 常委
      governor: "",                     // 省长
      comments: "",                     // 备注
      totalInfo: "",
      helpCaptain: "",                  // 所属队长
      peopleList: []                    // 人员选择栏
    };
  },
  filters: { numberComma },
  methods: {
    // 点击队长输入框 其他选项消失
    captainFocus() {
      this.captainShow = true;
      this.governorShow = false;
      this.committeeShow = false;
    },
    // 点击省长输入框
    provinceReset(e) {
      this.governorShow = true;
      this.captainShow = false;
      this.committeeShow = false;
    },
    // 点击常委输入框
    memberUserReset(e) {
      this.committeeShow = true;
      this.governorShow = false;
      this.captainShow = false;
    },
    // 当用户一次性输入完名字 隐藏选择栏
    completeInput(name, reqArr, Type){
      if(reqArr.length && name === reqArr[0].nickname){
        if(Type === 'cp'){
          this.captainShow = false;
        }
        else if(Type === 'go'){
          this.governorShow = false;
        }
        else {
          this.committeeShow = false;
        }
        this.peopleList = [];
      }
    },
    // 实时请求 队长数据
    captainSelect(e) {
      //当输入内容清空时
      if (!this.helpCaptain) { this.peopleList = []; return; }
      //获取队长信息
      optionService.getCaptain({ value: e }).then(({ tableContent }) => {
        // 下拉选择栏 默认开启
        this.captainShow = true;
        this.peopleList = tableContent;
        // 用户自己输入了完整的姓名 如果请求匹配到数据 不用再显示
        this.completeInput(e, tableContent, 'cp')
      });
    },
    // 实时请求 省长数据
    provalUserByAgent(type, e) {
      if (!this.governor) { this.peopleList = []; return; }
      // 筛选条件
      let data = {
        entityId: 20000,
        filter: JSON.stringify([
          { operator: "like", value: type, property: "role" },
          { operator: "like", value: e, property: "nickname" }
        ])
      };
      saleRepotService.getApprovalUserByAgent(data).then(({ tableContent })  => {
        // 下拉选择栏 默认开启
        this.governorShow = true;
        this.peopleList = tableContent;
        // 用户自己输入了完整的姓名 如果请求匹配到数据 不用再显示
        this.completeInput(e, tableContent, 'go')
      });    
    },
    // 实时请求 常委数据
    memberUser(type, e) {
      if (!this.member) { this.peopleList = []; return; }
      let data = {
        entityId: 20000,
        filter: JSON.stringify([
          { operator: "like", value: type, property: "role" },
          { operator: "like", value: e, property: "nickname" }
        ])
      };
      saleRepotService.getApprovalUserByAgent(data).then(({ tableContent }) => {
        // 下拉选择栏 默认开启
        this.committeeShow = true;
        this.peopleList = tableContent;
        // 用户自己输入了完整的姓名 如果请求匹配到数据 不用再显示
        this.completeInput(e, tableContent, 'committee')
      });
    },
    // 选择队长
    getNickname(val) {
      this.captainShow = false;
      this.peopleList = [];
      this.helpCaptain = val;
    },
    // 选择省长
    getProvalUser(val) {
      this.governorShow = false;
      this.peopleList = [];
      this.governor = val;
    },
    // 选择常委
    getMemberUser(val) {
      this.member = val;
      this.peopleList = [];
      this.committeeShow = false;
    },    
    // 添加新数据
    createNew() {
      this.arr.push({ value: [], qty: "" });
    },
    // 删除新数据
    deleteNew() {
      if (this.arr.length === 1) {
        this.arr = [{ value: [], qty: "" }];
      } else {
        this.arr.splice(this.arr.length - 1, 1);
      }
    },
    // 随机ID
    guid() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return ( S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4() );
    },
    // 判断时间是否有超过20:00
    isTwoZero(){
      saleRepotService.getModelData().then(res => {
        if (res.submitAllow === 1) {
          this.btnStatus = true;
        } else if (res.submitAllow === 0) {
          this.btnStatus = false;
          this.$vux.alert.show({
            title: "提示",
            content: "每日提交截止时间为20:00"
          });
        }
      });
    },
    // 获取 项目类产品
    listData() {
      saleRepotService.saleRepotList().then(({ tableContent }) => {
        for(let [key, val] of Object.entries(tableContent)){
          this.list.push({
            name: val["trans_detail_uncalc.transObjCode"],
            value: `${val["trans_detail_uncalc.transObjCode"]}_${key}_${val["trans_detail_uncalc.qty"]}_${val["trans_detail_uncalc.price"]}`,
            parent: '0'
          })
        }
      });
    },
    // 前往合计
    goCount() {
      // 缓存
      const ROSE_OPTION = JSON.parse(localStorage.getItem("ROSE_OPTION")) || '';
      // 超过20:00 不允许提交
      if (!this.btnStatus) return;
      // 声明变量
      let { dept, region, bank, groupName, userCode } = ROSE_OPTION
      // 队长，省长，常委，备注
      let captain = this.helpCaptain, governor = this.governor,
          member = this.member, comments = this.comments;
      // 声明提示文字
      let tips = '';
      let tipArr = [
          { key: 'helpCaptain', msg: '队长信息'},
          { key: 'governor', msg: '省长信息'},
          { key: 'member', msg: '常委信息'},
          { key: 'Aclass', msg: 'A类产品销售金额'},
          { key: 'Bclass', msg: 'B类产品销售金额'},
          { key: 'arr', msg: '项目类产品'}
        ];
      tipArr.every( item => {
          if(!this[item.key]){
            tips = `请填写${item.msg}`
            return;
          }  
          else if(item.key === 'arr' && this[item.key].length){
            for(let inx in this[item.key]){
              if(!this[item.key][inx].value.length){
                tips = `请选择${item.msg}`;
              }
              else if(this[item.key][inx].value[0] !== '无' && !this[item.key][inx].qty){
                console.log(this[item.key][inx].value);
                tips = '请填写产品数量';
              }
            }
            return;
          }  
        return true;
      })
      if(tips){
        this.$vux.alert.show({
          content: tips
        })
        return;
      }
      // 提交表单内容
      let jsonData = {
        listId: "4bda3e47-a088-4749-a988-ebb07cfb00e4",
        referenceId: this.guid(),
        baseinfoExt: {
          id: this.guid(),
          varchar1: dept,
          varchar2: captain,
          varchar3: region,
          varchar4: bank,
          varchar5: groupName,
          varchar6: "否",
          varchar7: governor,
          varchar8: member,
          varchar9: comments,
          varchar12:userCode, //工号
        },
        transDetailUncalc: [],
        transCode: "XHXSDD"
      };

      // 项目类产品
      for (let i = 0; i < this.arr.length; i++) {
        jsonData.transDetailUncalc.push({
          id: this.guid(),
          transObjCode: this.arr[i].value[0] === "无" ? "无" : this.arr[i].value[0].split("_")[0], //项目类产品名称
          containerCode: "项目类产品", //类型
          qty: this.arr[i].value[0] === "无" ? "" : this.arr[i].qty,
          taxAmount: this.arr[i].value[0] === "无" ? "" : Number(this.arr[i].value[0].split("_")[2]),
          amount: this.arr[i].qty * this.arr[i].value[0].split('_')[3], //总金额
          fgCode: ""
        },
        { id: this.guid(),
          transObjCode: "A类产品", //项目类产品名称
          containerCode: "A", //类型
          qty: "",
          amount: Number(this.Aclass), //总金额
          fgCode: ""
        },
        { id: this.guid(),
          transObjCode: "B类产品", //项目类产品名称
          containerCode: "B", //类型
          qty: "",
          amount: Number(this.Bclass), //总金额
          fgCode: ""
        });        
      }

      let totalInfo = {
        isMobile: true,
        conn: 20000,
        list: "trans_form_data",
        transCode: "XHXSDD",
        jsonData: JSON.stringify(jsonData)
      };
      this.totalInfo = totalInfo;
      // 提交表单内容 缓存
      localStorage.setItem(
        "saleReportInfo",
        JSON.stringify({
          saleReportRemark: totalInfo,
          time: new Date().getTime()
        })
      );
      // 用户 所属信息 缓存
      localStorage.setItem(
        "SALE_BASIC_INFO",
        JSON.stringify({
          member: member,
          governor: governor,
          captain: this.helpCaptain,
          time: new Date().getTime()
        })
      );
      // 用户 表单详情 缓存
      localStorage.setItem(
        "SALE_FORM_INFO",
        JSON.stringify({
          member: member,
          governor: governor,
          Aclass: this.Aclass,
          Bclass: this.Bclass,
          saleReportArr: this.arr,
          captain: this.helpCaptain,
          time: new Date().getTime()
        })
      );

      this.$router.push({ path: "/count" });
    }
  },
  created(){
    // 所属信息 缓存
    const SALE_BASIC_INFO = JSON.parse(localStorage.getItem("SALE_BASIC_INFO")) || '';
    if(SALE_BASIC_INFO){
      this.member = SALE_BASIC_INFO.member;
      this.governor = SALE_BASIC_INFO.governor;
      this.helpCaptain = SALE_BASIC_INFO.captain;
    }
  },
  mounted() {
    // 表单内容缓存
    const SALE_FORM_INFO = JSON.parse(localStorage.getItem("SALE_FORM_INFO")) || '';       
    //默认缓存
    if (SALE_FORM_INFO) {
      this.Aclass = SALE_FORM_INFO.Aclass;
      this.Bclass = SALE_FORM_INFO.Bclass;
      this.member = SALE_FORM_INFO.member;
      this.governor = SALE_FORM_INFO.governor;
      this.arr = SALE_FORM_INFO.saleReportArr;
      this.helpCaptain = SALE_FORM_INFO.captain;
    }  
    // 获取项目类产品
    this.listData();
    // //提交时间是否超过20点
    // this.isTwoZero();
  },
  beforeRouteLeave(to, from, next) {
    if (!this.arr[0].value.length || to.name === "Count") {
      next();
    }
    else {
      this.$vux.confirm.show({
        title: "温馨提示",
        content: "要保存数据吗？",
        confirmText: "确认",
        cancelText: "取消",
        onCancel: () => {
          localStorage.removeItem("SALE_BASIC_INFO");
          next();
        },
        onConfirm: () => {
          localStorage.setItem(
            "SALE_FORM_INFO",
            JSON.stringify({
              member: this.member,  
              Aclass: this.Aclass,
              Bclass: this.Bclass,
              governor: this.governor,
              saleReportArr: this.arr,
              captain: this.helpCaptain,
              time: new Date().getTime()
            })
          );
          next();
        }
      });
    }
  }
};
</script>

<style lang='scss' scoped>
.mescroll {
  width: 100%;
  padding-bottom: 50px;
}
.vux-popup-header {
  width: 100%;
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
.weui-cells {
  margin-top: 0;
  background: #f0f2f5;
}
.captain-container {
  top: 80px;
  z-index: 8;
  width: 100%;
  list-style: none;
  max-height: 140px;
  position: absolute;
  overflow-y: scroll;
  padding-left: 15px;
  background: #f0f2f5;
  box-sizing: border-box;
  li {
    color: #3a3a3a;
    font-size: 18px;
    padding: 10px 15px;  
    box-sizing: border-box;
  }

}
.governor-container {
  @extend .captain-container;
  top: 125px;
}
.commit-container {
  @extend .captain-container;
  top: 165px;
}
</style>
