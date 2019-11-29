<template>
  <div class="pages">
    <div v-if='$route.name=="help"'>
      <div id='mescroll' class="mescroll">
        <div class="weui-cells__title">请选择销量实际发生地区</div>
        <group label-align='left' title="">
          <popup-picker
            class="each_part"
            title="销量所属银行"
            placeholder="请选择银行"
            :data='bankList'
            v-model="bankValue"
            :columns="1"></popup-picker>
          <popup-picker
            class="each_part"
            title="销量所属地区"
            placeholder="请选择省份"
            :data='areaList'
            v-model="areaValue"
            :columns="1"></popup-picker>
        </group>
        <group title="请选择对应的产品" v-if="!arr.length">
          <cell class="each_part" title="项目类产品" :value=" '请选择产品'" value-align="right" @click.native="clickProject"
                is-link></cell>
        </group>
        <group label-align='left' :title="index > 0?'':'请选择对应的产品'" v-for="( item ,index ) in arr" :key="index" v-else>
          <cell class="each_part" title="项目类产品" :value="item.value" value-align="right"></cell>
          <cell class="each_part" title="单价"
                :value="'￥'+item['trans_detail_uncalc.price'] | numberComma" value-align="right"
                v-if="item.value.length>0"></cell>
          <!-- 数量输入 -->
          <x-input title="数量" v-model.number="item.qty" text-align="right" placeholder="请输入数量"
                   v-if="item.value !== '无'"></x-input>

          <cell class="each_part" title="系数" :value="item.num1 || 0" value-align="right" style="display: none;"
                v-if="item.value.length>0"></cell>
          <cell class="each_part" title="含税金额" :value="item.amount || 0" value-align="right" style="display: none;"
                v-if="item.value.length>0"></cell>
        </group>

        <p class="caution_part" v-if='arr.length !== 0'>
          您还需要添加新的项目？请点击 <span class="plus_tx" @click="createNew">新增</span>
          <span v-if="arr.length>1">
            <span>或</span>
            <span class="plus_delect" @click="deleteNew">删除</span>
          </span>
        </p>

        <group class="caution_inputs">
          <x-input title="其他A类产品" v-model.number="Aclass" text-align="right" placeholder="请输入金额"></x-input>
          <cell title="其他A类产品套数" disabled :value="otherAclass" style=" display:none;"></cell>
          <cell title="A类产品合计" disabled :value="AclassTotal"></cell>
        </group>

        <group title="B类产品">
          <x-input title="B类产品(线上)" v-model.number="Bclass" text-align="right" placeholder="请输入金额"></x-input>
          <x-input title="B类产品(线下)" v-model.number="BclassDown" text-align="right" placeholder="请输入金额"></x-input>
          <cell title="B类产品合计" disabled :value="BclassTotal"></cell>
        </group>
        <group>
          <cell class="each_part" title="B类产品套数(线上)" disabled :value="BSet" value-align="right"></cell>
          <cell class="each_part" title="B类产品套数(线下)" disabled :value="BSetDown" value-align="right"></cell>
          <cell class="each_part" title="B类产品套数合计" disabled :value="BSetTotal" value-align="right"></cell>
        </group>
        

        <group title="费用明细">
          <x-input title="住宿费" v-model.number="hotelAmt" text-align="right" placeholder="请输入住宿费"
                   @on-blur="checkAmt('hotelAmt')"></x-input>
          <x-input title="市内交通费" v-model.number="trafficAmt" text-align="right" placeholder="请输入市内交通费"
                   @on-blur="checkAmt('trafficAmt')"></x-input>
          <x-input title="长途交通费" v-model.number="lTrafficAmt" text-align="right" placeholder="请输入长途交通费"
                   @on-blur="checkAmt('lTrafficAmt')"></x-input>
          <x-input title="其他" v-model.number="otherAmt" text-align="right" placeholder="请输入其他金额"
                   @on-blur="checkAmt('otherAmt')"></x-input>
          <cell class="each_part" title="合计" disabled :value="totalCost | numberComma" value-align="right"></cell>
          <cell class="each_part" title="费用销量比" disabled :value="costVolumeRatio" value-align="right"></cell>
        </group>

        <!-- <group title="每日情况汇报">
          <popup-picker class="each_part" title="今日所在省份" placeholder="请选择省份" :data='provinceList' :columns="1"
                        @on-change="provinceChange" v-model="areaToday"></popup-picker>
          <popup-picker class="each_part" title="今日所在地市" placeholder="请选择地市" :data='cityTodayList' :columns="1"
                        @on-change="cityChange" v-model="cityToday"></popup-picker>
          <popup-picker class="each_part" title="今日所在区县" placeholder="请选择区县" :data='countyTodayList' :columns="1"
                        v-model="countyToday"></popup-picker>
          <popup-picker class="each_part" title="今日所在渠道" placeholder="请选择银行" :data='bankList' :columns="1"
                        v-model="bankToday"></popup-picker>
          <x-input title="排期银行名称" v-model="baseinfoExt.varchar17" text-align="right" placeholder="请输入排期银行名称"></x-input>
          <x-input title="网点名称" v-model="baseinfoExt.varchar18" text-align="right" placeholder="请输入网点名称"></x-input>
          <x-switch title="是否有排期" :value-map="['否', '是']" v-model="baseinfoExt.varchar16"></x-switch>
        </group>
        <group>
          <popup-picker class="each_part" title="明日所在省份" placeholder="请选择省份" :data='areaList' :columns="1"
                        v-model="areaTomorrow"></popup-picker>
          <popup-picker class="each_part" title="明日所在渠道" placeholder="请选择渠道" :data='bankList' :columns="1"
                        v-model="bankTomorrow"></popup-picker>
          <popup-picker class="each_part" title="下周所在省份" placeholder="请选择省份" :data='areaNextWeekList' :columns="1"
                        v-model="areaNextWeek"></popup-picker>
          <popup-picker class="each_part" title="下周所在渠道" placeholder="请选择银行" :data='bankNextWeekList' :columns="1"
                        v-model="bankNextWeek"></popup-picker>
        </group> -->
        <group>
          <x-input title="备注" text-align="right" placeholder="非必填 如有需要请填写" v-model="comments"></x-input>
        </group>
      </div>
      <popup-project-list :show="showProjectPopup" :default-value="arr"
                          @on-sel="selProject" v-model="showProjectPopup" ref="projectPopup"></popup-project-list>
      <x-button id="count_button" :gradients="btnStatus ? ['#B99763', '#E7D0A2'] : ['#ddd','#ddd']"
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
  // 方法引入
  import {toFixed, accAdd, accMul, accDiv} from 'plugins/calc'

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
        areaToday: [],
        cityToday: [],
        countyToday: [],
        bankToday: [],
        areaTomorrow: [],
        bankTomorrow: [],
        areaNextWeek: [],
        bankNextWeek: [],
        areaNextWeekList: [],
        bankNextWeekList: [],
        provinceList: [],
        cityTodayList: [],
        countyTodayList: [],
      };
    },
    computed: {
      AclassTotal() {
        debugger
        let total = 0;
        this.arr.forEach(item => {
          if (item.qty) {
            item.amount = accMul(item.qty, item['trans_detail_uncalc.price'],item.num1)
            total = accAdd(total, item.amount);
          }
        });
        total = accAdd(total, this.Aclass);
        return total;
      },
      otherAclass() {
        return toFixed(accDiv(this.Aclass, 1996), 3)
      },
      BclassTotal() {
        return accMul(accAdd(this.Bclass, this.BclassDown),0.3)
      },
      // B类产品套数线上
      BSet() {
        return toFixed(this.Bclass / 4000)
      },
      // B类产品套数线下
      BSetDown() {
        return toFixed(this.BclassDown / 5000)
      },
      // B类产品套数合计
      BSetTotal() {
        return toFixed(accAdd(this.BSet, this.BSetDown))
      },
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
        //获取当前时间
        let date = new Date(),
          year = date.getFullYear(),
          month = date.getMonth() + 1,
          day = date.getDate();

        // 声明提示文字
        let tips = '';
        let tipArr = [
          {key: 'bankValue', msg: '所属银行'},
          {key: 'areaValue', msg: '所属地区'},
          {key: 'arr', msg: '项目产品'},
          {key: 'Aclass', msg: '其他A类产品销售金额'},
          {key: 'Bclass', msg: 'B类产品(线上)销售金额'},
          {key: 'BclassDown', msg: 'B类产品(线下)销售金额'},
          {key: 'hotelAmt', msg: '住宿金额'},
          {key: 'trafficAmt', msg: '市内交通费'},
          {key: 'lTrafficAmt', msg: '长途交通费'},
          {key: 'otherAmt', msg: '其他金额'},
        ];
        // this.baseinfoExt.varchar14 = this.areaToday[0];
        // this.baseinfoExt.varchar15 = this.bankToday[0];
        // this.baseinfoExt.varchar19 = this.areaTomorrow[0];
        // this.baseinfoExt.varchar20 = this.areaNextWeek[0];
        // this.baseinfoExt.varchar21 = this.bankNextWeek[0];
        // this.baseinfoExt.varchar22 = this.bankTomorrow[0];
        // this.baseinfoExt.varchar23 = this.cityToday[0];
        // this.baseinfoExt.varchar24 = this.countyToday[0];
        // let validateMap = [
        //   {key: 'varchar14', msg: '请选择今日所在省份'},
        //   {key: 'varchar23', msg: '请选择今日所在地市'},
        //   {key: 'varchar24', msg: '请选择今日所在区县'},
        //   {key: 'varchar15', msg: '请选择今日所在渠道'},
        //   {key: 'varchar17', msg: '请填写排期银行名称'},
        //   {key: 'varchar18', msg: '请填写网点名称'},
        //   {key: 'varchar19', msg: '请选择明日所在省份'},
        //   {key: 'varchar22', msg: '请选择明日所在渠道'},
        //   {key: 'varchar20', msg: '请选择下周所在省份'},
        //   {key: 'varchar21', msg: '请选择下周所在渠道'},
        // ];
        tipArr.every(item => {
          if (!this[item.key] && this[item.key] !== 0) {
            tips = `请填写${item.msg}`;
            return;
          }
          else if (item.key === 'areaValue' && !this[item.key].length || this[item.key][0] === '空' || item.key === 'bankValue' && !this[item.key].length) {
            tips = `请选择${item.msg}`;
            return;
          }
          else if (item.key === 'arr') {
            if (!this.arr.length) {
              tips = `请选择${item.msg}`;
              return false;
            }
            this[item.key].every(item => {
              if (item.value !== '无' && !item.qty && item.qty !== 0) {
                tips = '请填写产品数量';
                return false
              }
              return false
            });
            return !tips;
          }
          return true;
        });
        // !tips && validateMap.every(item => {
        //   if (!this.baseinfoExt[item.key]) {
        //     tips = item.msg;
        //     return false
        //   }
        //   return true
        // });
        if (tips) {
          this.$vux.alert.show({
            content: tips
          });
          return;
        }
        // 表单提交信息
        let jsonData = {
          listId: "4bda3e47-a088-4749-a988-ebb07cfb00e4",
          referenceId: this.guid(),
          baseinfoExt: {
            id: this.guid(),
            varchar1: ROSE_OPTION.dept,         // 区域 (事业部) (业务自带信息)
            // varchar2: this.monthCoverNum,       // （套）合计
            varchar3: this.areaValue[0],        // 地区(省份)
            varchar4: this.bankValue[0],        // 银行
            varchar5: ROSE_OPTION.groupName,    // 部门 (业务自带信息)
            varchar6: '否',                     // 区分是否为支援
            varchar7: governor,                 // 连长（原省长）
            varchar8: member,                   // 团长（原常委）
            varchar9: comments,                 // 备注
            varchar10: ROSE_OPTION.region,      // 省份(业务自带信息)
            varchar11: ROSE_OPTION.bank,        // 银行(业务自带信息)
            varchar12: ROSE_OPTION.userCode,    // 工号
            varchar13: this.costVolumeRatio,    // 费用销量比
            double7: this.hotelAmt, // 住宿费用
            double8: this.otherAmt, // 其他费用
            double9: this.totalCost, // 费用合计(住宿费+其他费用)
            double10: this.trafficAmt, // 市内交通费
            double11: this.lTrafficAmt, // 市内交通费
            integer1: year,     //年
            integer2: month,     //月
            integer3: day,        //日
            varchar25: ROSE_OPTION.subSector,
            ...this.baseinfoExt,
            // double12: this.AclassTotal, // A类产品合计
            // double13: this.BclassTotal, // B类产品合计
          },
          transDetailUncalc: [{
            id: this.guid(),
            transObjCode: "其他A类产品", //项目类产品名称
            containerCode: "其他A类", //类型
            qty: "",
            amount: Number(this.Aclass), //总金额
            fgCode: "",
            num1: this.otherAclass
          }, {
            id: this.guid(),
            transObjCode: "A类产品", //项目类产品名称
            containerCode: "A", //类型
            qty: "",
            amount: Number(this.AclassTotal), //总金额
            fgCode: ""
          }, {
            id: this.guid(),
            transObjCode: "B类产品(线上)", //项目类产品名称
            containerCode: "B1", //类型
            qty: "",
            amount: Number(this.Bclass), //总金额
            fgCode: "",
            num1: this.BSet,
          }, {
            id: this.guid(),
            transObjCode: "B类产品(线下)", //项目类产品名称
            containerCode: "B2", //类型
            qty: "",
            amount: Number(this.BclassDown), //总金额
            fgCode: "",
            num1: this.BSetDown,
          }, {
            id: this.guid(),
            transObjCode: "B类产品", //项目类产品名称
            containerCode: "B", //类型
            qty: "",
            amount: Number(this.BclassTotal), //总金额
            fgCode: "",
          },
          ],
          transCode: "XHXSDD"
        };
        let newVar2 = jsonData.baseinfoExt.varchar2;
        newVar2 = accAdd(newVar2, this.BSet);
        newVar2 = accAdd(newVar2, this.BSetDown);
        // 项目类产品
        for (let item of this.arr) {
          // 动态增加 月销量“套”合计
          newVar2 = toFixed(accAdd(newVar2, Number(item.num1)));
          // 项目类产品
          jsonData.transDetailUncalc.push({
            id: this.guid(),
            transObjCode: item.value, //项目类产品名称
            containerCode: "项目类产品", //类型
            qty: item.qty,
            taxAmount: item.taxAmount,
            amount: item.amount, //总金额
            fgCode: "",
            num1: item.num1, // 套数
            price: item['trans_detail_uncalc.price'],//单价
          });
        }
        jsonData.baseinfoExt.varchar2 = newVar2;
        this.totalInfo = {
          isMobile: true,
          conn: 20000,
          list: "trans_form_data",
          transCode: "XHXSDD",
          jsonData: JSON.stringify(jsonData)
        };
        // 提交表单内容 缓存
        localStorage.setItem(
          "saleReportInfo",
          JSON.stringify({
            saleReportRemark: this.totalInfo,
            time: new Date().getTime()
          })
        );
        // 缓存 表单用户填写信息
        this.recordForm();
        // 缓存 支援地区模块
        this.recordBasic();
        this.$router.push({path: "/count"});
      },
      // 缓存所属的地区
      recordBasic() {
        // 缓存 支援地区模块
        localStorage.setItem(
          [BASIC_INFO_KEY],
          JSON.stringify({
            bank: this.bankValue[0],
            areaValue: this.areaValue[0],
          })
        );
      },
      // 缓存表单信息
      recordForm() {
        localStorage.setItem(
          [FORM_INFO_KEY],
          JSON.stringify({
            Aclass: this.Aclass,
            Bclass: this.Bclass,
            BclassDown: this.BclassDown,
            saleReportArr: this.arr,
            comments: this.comments,
            hotelAmt: this.hotelAmt,
            trafficAmt: this.trafficAmt,
            lTrafficAmt: this.lTrafficAmt,
            otherAmt: this.otherAmt,
            time: new Date().getTime(),
            baseinfoExt: this.baseinfoExt,
          })
        );
      }
    },
    created() {
      let {monthCoverNum = ''} = this.$route.query;
      this.baseinfoExt.varchar2 = Number(monthCoverNum);
      // 缓存
      const basicInfo = JSON.parse(localStorage.getItem(BASIC_INFO_KEY)) || '';
      const formInfo = JSON.parse(localStorage.getItem(FORM_INFO_KEY)) || '';
      // 用户填写表单内容
      this.echoStorage(basicInfo, formInfo);
      // 获取连长、团长
      this.getSuperior((JSON.parse(localStorage.getItem("ROSE_OPTION"))).userId);
      // 支援地区
      this.getArea();
      // 支援银行
      this.getBank();
      (async () => {
        await this.getProvince();
        if (formInfo) {
          await this.getCity();
          this.getCounty();
        }
      })()
    },
    beforeRouteLeave(to, from, next) {
      if (!this.arr.length || to.name == "Count") next();
      else {
        this.$vux.confirm.show({
          title: "温馨提示",
          content: "要保存数据吗？",
          confirmText: "确认",
          cancelText: "取消",
          onCancel: () => {
            localStorage.removeItem(BASIC_INFO_KEY);
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
  
  .weui-cells__title {
    margin-top: 0.77em;
    margin-bottom: -1.1em;
    padding-left: 15px;
    padding-right: 15px;
    font-size: 14px;
    color: #3296FA;
    font-weight: bold;
  }
</style>
