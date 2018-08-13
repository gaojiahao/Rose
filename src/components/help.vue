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
          v-model.number="Aclass"
          ref='input1'
          text-align="right" 
          placeholder="请输入金额"></x-input>
          <x-input 
          title="B类产品"
          v-model.number="Bclass"
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
// mixin引入
import saleCommon from '../mixins/saleCommon'
export default {
  name: 'help-Report',
  mixins : [saleCommon],
  data() {
    return {
      areaList: [],
      areaValue: [],
      bankList: [],
      bankValue: []
    };
  },
  methods: {
    //提交
    end() {
      if (!this.btnStatus) return;
      // 声明提示文字
      let tips = '';
      let tipArr = [
        { key:'areaValue', msg:'请选支援地区' },
        { key:'bankValue', msg:'请选支援银行' },
        { key:'helpCaptain', msg:'请填写支援队长' },
        { key:'governor', msg:'请填写省长信息' },
        { key:'member', msg:'请填写常委信息' },
        { key:'Aclass', msg:'请填A类产品销售金额' },
        { key:'Bclass', msg:'请填B类产品销售金额' },
        { key:'arr', msg:'请选择项目产品' },
      ];
      tipArr.every( item => {
          if(!this[item.key]){
            tips = `请填写${item.msg}`
            return;
          }else if(item.key === 'areaValue' && this[item.key].length === 0 || item.key === 'areaValue' && this[item.key].indexOf('空') === 0 ){
            tips = `请选择${item.msg}`;
            return;
          }else if(item.key === 'bankValue' && this[item.key].length === 0){
            tips = `请选择${item.msg}`;
            return;
          }else if(item.key === 'arr' && this[item.key].length){
            for(let inx in this[item.key]){
              if(!this[item.key][inx].value.length){
                tips = `请选择${item.msg}`;
              }
              else if(this[item.key][inx].value[0] !== '无' && !this[item.key][inx].qty){
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
      //缓存支援地区模块
      localStorage.setItem(
        "HELP_ZONE_INFO",
        JSON.stringify({
          bank: this.bankValue[0],
          areaValue: this.areaValue[0],
          captain: this.helpCaptain
        })
      );
      //获取缓存信息
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
        transDetailUncalc: [
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
        ],
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
      let totalInfo = {
        isMobile: true,
        conn: 20000,
        list: "trans_form_data",
        transCode: "XHXSDD",
        jsonData: JSON.stringify(jsonData)
      };
      this.totalInfo = totalInfo;
      // 提交表单内容缓存
      localStorage.setItem(
        "saleReportInfo",
        JSON.stringify({
          saleReportRemark: totalInfo,
          time: new Date().getTime()
        })
      );
      // 表单缓存
      localStorage.setItem(
        "help_saleReport",
        JSON.stringify({
          saleReportArr: this.arr,
          Aclass: this.Aclass,
          Bclass: this.Bclass,
          time: new Date().getTime()
        })
      );
      // 用户所属信息缓存
      localStorage.setItem(
        "HELP_INFO_LIST",
        JSON.stringify({
          captain: this.helpCaptain,
          governor: this.governor,
          member: this.member
        })
      );
      this.$router.push({ path: "/count" });
    }
  },
  created(){
    this.getArea();
    this.getBank();
    let HELP_INFO_LIST = localStorage.getItem("HELP_INFO_LIST") || '';
    let help_saleReport = localStorage.getItem("help_saleReport") || '';
    let HELP_ZONE_INFO = localStorage.getItem("HELP_ZONE_INFO") || '';
    // 默认信息缓存
    if (HELP_INFO_LIST) {
      this.helpCaptain = JSON.parse(HELP_INFO_LIST).captain;
      this.governor = JSON.parse( HELP_INFO_LIST).governor;
      this.member = JSON.parse(HELP_INFO_LIST).member;
    }
    if (help_saleReport) {
      this.arr = JSON.parse(help_saleReport).saleReportArr;
      this.Aclass = JSON.parse(help_saleReport).Aclass;
      this.Bclass = JSON.parse(help_saleReport).Bclass;
    }
    if (HELP_ZONE_INFO) {
      this.areaValue = [JSON.parse(HELP_ZONE_INFO).areaValue];
      this.bankValue = [JSON.parse(HELP_ZONE_INFO).bank];
    }
  
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

<style lang='scss' scoped>
  @import './scss/common.scss';
  .captain-container {
    top: 170px;
  }
  .governor-container {
    top: 213px;
  }
  .commit-container {
    top: 257px;
  }
</style>
