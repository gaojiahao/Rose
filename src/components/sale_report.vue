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
// mixin引入
import saleCommon from '../mixins/saleCommon'
export default {
  name: 'sale-Report',
  mixins: [saleCommon],
  methods: {
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
        transDetailUncalc: [
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
          }
        ],
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
  @import './scss/common.scss';
</style>
