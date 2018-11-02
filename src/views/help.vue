<template>
  <div class="pages">
    <div v-if='$route.name=="help"'>
      <div id='mescroll' class="mescroll">
        <group label-align='left' title="请选择所属的地区">
          <popup-picker
            class="each_part"
            title="所属地区"
            placeholder="请选择省份"
            :data='areaList'
            v-model="areaValue"
            :columns="1"></popup-picker>
          <popup-picker
            class="each_part"
            title="所属银行"
            placeholder="请选择银行"
            :data='bankList'
            v-model="bankValue"
            :columns="1"></popup-picker>
          <!--排长、团长、司令-->
          <!--<x-input
            title="所属队长"
            text-align="right"
            v-model.trim="helpCaptain"
            @on-change="captainSelect"
            @on-focus="captainFocus"
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
            class="helpCaptain"></x-input>-->
        </group>
        <!-- 队长选择框 -->
        <!--<ul class="captain-container" v-if="captainShow">
          <li class='vux-1px-b' v-for="(item, index) in peopleList" :key="index"
              @click="getNickname(item.nickname)">{{item.nickname}}
          </li>
        </ul>-->
        <!-- 省长选择框 -->
        <!--<ul class="governor-container" v-if="governorShow">
          <li class='vux-1px-b' v-for="(item, index) in peopleList" :key="index"
              @click="getProvalUser(item.nickname)">{{item.nickname}}
          </li>
        </ul>-->
        <!-- 常委选择框 -->
        <!--<ul class="commit-container" v-if="committeeShow">
          <li class='vux-1px-b' v-for="(item, index) in peopleList" :key="index"
              @click="getMemberUser(item.nickname)">{{item.nickname}}
          </li>
        </ul>-->

        <group label-align='left' :title="index>0?'':'请选择对应的产品'" v-for="( item ,index ) in arr" :key="index">
          <popup-picker class="each_part" title="项目类产品" placeholder="请选择产品" :data="list" :value="item.value"
                        @on-change="projectChange(item, index)" v-model="item.value" :columns="1"
                        show-name></popup-picker>
          <cell class="each_part" title="单价"
                :value="'￥'+item.amount | numberComma" value-align="right"
                v-if="item.value.length>0"></cell>
          <!-- 数量输入 -->
          <x-input title="数量" v-model.number="item.qty" text-align="right" placeholder="请输入数量"
                   v-if="item.value[0]!=='无'"></x-input>
          <cell class="each_part" title="套数" :value="item.num1" value-align="right"
                v-if="item.value.length>0"></cell>
        </group>

        <p class="caution_part" v-if='arr[0].value.length!=0'>
          您还需要添加新的项目？请点击 <span class="plus_tx" @click="createNew">新增</span>
          <span v-if="arr.length>1">
            <span>或</span>
            <span class="plus_delect" @click="deleteNew">删除</span>
          </span>
        </p>

        <group class="caution_inputs">
          <x-input title="A类产品" v-model.number="Aclass" text-align="right" placeholder="请输入金额"></x-input>
          <x-input title="B类产品" v-model.number="Bclass" text-align="right" placeholder="请输入金额"></x-input>
        </group>

        <group title="费用明细">
          <x-input title="住宿费" v-model.number="hotelAmt" text-align="right" placeholder="请输入住宿费"
                   @on-blur="checkAmt('hotelAmt')"></x-input>
          <x-input title="交通费" v-model.number="trafficAmt" text-align="right" placeholder="请输入住宿费"
                   @on-blur="checkAmt('trafficAmt')"></x-input>
          <x-input title="其他" v-model.number="otherAmt" text-align="right" placeholder="请输入其他金额"
                   @on-blur="checkAmt('otherAmt')"></x-input>
          <cell class="each_part" title="合计" :value="totalCost | numberComma" value-align="right"></cell>
          <cell class="each_part" title="费用销量比" :value="costVolumeRatio" value-align="right"></cell>
        </group>

        <group>
          <x-input title="备注" text-align="right" placeholder="非必填 如有需要请填写" v-model="comments"></x-input>
        </group>
      </div>
      <x-button id="count_button" :gradients="btnStatus==true?['#B99763', '#E7D0A2']:['#ddd','#ddd']"
                @click.native="goCount">
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
  import saleCommon from 'mixins/saleCommon'

  const BASIC_INFO_KEY = 'HELP_BASIC_INFO';
  const FORM_INFO_KEY = 'HELP_FORM_INFO';
  export default {
    name: 'help-Report',
    mixins: [saleCommon],
    data() {
      return {
        areaList: [],
        bankList: [],
        areaValue: [],
        bankValue: [],
      };
    },
    methods: {
      //提交
      goCount() {
        if (!this.btnStatus) return;
        const ROSE_OPTION = JSON.parse(localStorage.getItem("ROSE_OPTION"));  //业务员原有的个人信息
        //获取缓存信息
        let governor = this.governor,
          member = this.member,
          comments = this.comments;
        // 声明提示文字
        let tips = '';
        let tipArr = [
          {key: 'areaValue', msg: '所属地区'},
          {key: 'bankValue', msg: '所属银行'},
          // {key: 'helpCaptain', msg: '所属队长'},
          // {key: 'governor', msg: '省长信息'},
          // {key: 'member', msg: '常委信息'},
          {key: 'Aclass', msg: 'A类产品销售金额'},
          {key: 'Bclass', msg: 'B类产品销售金额'},
          {key: 'hotelAmt', msg: '住宿金额'},
          {key: 'trafficAmt', msg: '交通费'},
          {key: 'otherAmt', msg: '其他金额'},
          {key: 'arr', msg: '项目产品'},
        ];
        tipArr.every(item => {
          if (!this[item.key] && this[item.key] !== 0) {
            tips = `请填写${item.msg}`
            return;
          }
          else if (item.key === 'areaValue' && !this[item.key].length || this[item.key][0] === '空' || item.key === 'bankValue' && !this[item.key].length) {
            tips = `请选择${item.msg}`;
            return;
          }
          else if (item.key === 'arr') {
            for (let inx in this[item.key]) {
              if (!this[item.key][inx].value.length) {
                tips = `请选择${item.msg}`;
              }
              else if (this[item.key][inx].value[0] !== '无' && !this[item.key][inx].qty && this[item.key][inx].qty !== 0) {
                tips = '请填写产品数量';
              }
            }
            return;
          }
          return true;
        })
        if (tips) {
          this.$vux.alert.show({
            content: tips
          })
          return;
        }
        // 表单提交信息
        let jsonData = {
          listId: "4bda3e47-a088-4749-a988-ebb07cfb00e4",
          referenceId: this.guid(),
          baseinfoExt: {
            id: this.guid(),
            varchar1: ROSE_OPTION.dept,         // 区域(事业部) (业务自带信息)
            varchar2: this.helpCaptain,             // 支援队长
            varchar3: this.areaValue[0],        // 支援地区(省份)
            varchar4: this.bankValue[0],        // 支援银行
            varchar5: ROSE_OPTION.groupName,    // 部门(业务自带信息)
            varchar6: '否',                     // 区分是否为支援
            varchar7: governor,                 // 省长
            varchar8: member,                   // 常委
            varchar9: comments,                 // 备注
            varchar10: ROSE_OPTION.region,      // 省份(业务自带信息)
            varchar11: ROSE_OPTION.bank,        // 银行(业务自带信息)
            varchar12: ROSE_OPTION.userCode,     // 工号
            varchar13: this.costVolumeRatio,   // 费用销量比
            double7: this.hotelAmt, // 住宿费用
            double8: this.otherAmt, // 其他费用
            double9: this.totalCost, // 费用合计(住宿费+其他费用)
            double10: this.trafficAmt, // 交通费
          },
          transDetailUncalc: [{
            id: this.guid(),
            transObjCode: "A类产品", //项目类产品名称
            containerCode: "A", //类型
            qty: "",
            amount: Number(this.Aclass), //总金额
            fgCode: ""
          }, {
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
          let item = this.arr[i];
          jsonData.transDetailUncalc.push({
            id: this.guid(),
            transObjCode: item.value[0] === "无" ? "无" : item.value[0], //项目类产品名称
            containerCode: "项目类产品", //类型
            qty: item.value[0] === "无" ? "" : item.qty,
            taxAmount: item.value[0] === "无" ? "" : Number(item.taxAmount),
            amount: item.qty * item.amount, //总金额
            fgCode: "",
            num1: item.value[0] === "无" ? "" : Number(item.num1), // 套数
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
        // 缓存 表单用户填写信息
        this.recordForm();
        // 缓存 支援地区模块
        this.recordBasic();

        this.$router.push({path: "/count"});
      },
      // TODO 缓存所属的地区
      recordBasic() {
        // 缓存 支援地区模块
        localStorage.setItem(
          [BASIC_INFO_KEY],
          JSON.stringify({
            // member: this.member,
            // governor: this.governor,
            // captain: this.helpCaptain,
            bank: this.bankValue[0],
            areaValue: this.areaValue[0],
          })
        );
      },
      // TODO 缓存表单信息
      recordForm() {
        localStorage.setItem(
          [FORM_INFO_KEY],
          JSON.stringify({
            Aclass: this.Aclass,
            Bclass: this.Bclass,
            saleReportArr: this.arr,
            comments: this.comments,
            hotelAmt: this.hotelAmt,
            trafficAmt: this.trafficAmt,
            otherAmt: this.otherAmt,
            time: new Date().getTime()
          })
        );
      }
    },
    created() {
      // 缓存
      const basicInfo = JSON.parse(localStorage.getItem(BASIC_INFO_KEY)) || '';
      const formInfo = JSON.parse(localStorage.getItem(FORM_INFO_KEY)) || '';
      // 用户填写表单内容
      this.echoStorage(basicInfo, formInfo);
      // 支援地区
      this.getArea();
      // 支援银行
      this.getBank();
    },
    beforeRouteLeave(to, from, next) {
      if (!this.arr[0].value.length || to.name == "Count") next();
      else {
        this.$vux.confirm.show({
          title: "温馨提示",
          content: "要保存数据吗？",
          confirmText: "确认",
          cancelText: "取消",
          onCancel: () => {
            localStorage.removeItem(FORM_INFO_KEY);
            next();
          },
          onConfirm: () => {
            this.recordForm();
            //缓存支援地区模块
            this.recordBasic();
            next();
          }
        });
      }
    }
  };
</script>

<style lang='scss' scoped>
  @import '~@/components/scss/common.scss';

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
