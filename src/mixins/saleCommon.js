// 请求 引入
import optionService from "service/optionService";
import saleRepotService from "service/saleRepotService";
// 插件引入
import {
  Cell, Alert, Group, XInput, XButton,
  Confirm, Selector, PopupPicker, numberComma,
  XSwitch,
} from "vux";
import PopupProjectList from 'components/popup/PopupProjectList'

// 方法引入
import {toFixed, accAdd, accMul} from 'plugins/calc'

export default {
  components: {
    Cell, Alert, Group, XInput,
    Confirm, XButton, Selector, PopupPicker,
    PopupProjectList, XSwitch,
  },
  data() {
    return {
      mescroll: null,
      btnStatus: true,                  // 时间超过20:00不允许提交
      captainShow: false,               // 是否弹出 队长选择框 
      governorShow: false,              // 是否弹出 省长选择框 
      committeeShow: false,             // 是否弹出 常委选择框 
      arr: [],    // 选中的 项目类产品
      list: [{name: "无", value: "无", parent: "0", amount: 0, num5: 0}],     // 项目类产品
      Aclass: "",                       // A类产品 输入金额
      Bclass: "",                       // B类产品 输入金额 线上
      BclassDown: '',                  // B类产品线下
      member: "",                       // 常委
      governor: "",                     // 省长
      comments: "",                     // 备注
      totalInfo: "",
      helpCaptain: "",                  // 所属队长
      peopleList: [],                    // 人员选择栏
      hotelAmt: '', // 住宿费
      trafficAmt: '', // 市内交通费
      lTrafficAmt: '', // 长途交通费
      otherAmt: '', // 其他费用
      showProjectPopup: false, // 是否展示项目类产品的选项
      monthCoverNum: '',
      baseinfoExt: {
        varchar2: 0,       // （套）合计
        varchar14: '', // 今日所在省份
        varchar15: '', // 渠道
        varchar16: '是', // 是否有排期
        varchar17: '', // 排期银行名称
        varchar18: '', // 网点名称
        varchar19: '', // 明日所在省份
        varchar20: '', // 下周所在省份
        varchar21: '', // 下周银行渠道
        varchar22: '', // 明日所在渠道
      },
      // SpecificClassA:'',
      // SpecificClassB:'',
      SpecificClassASet:'',
      SpecificClassBSet:'',
    };
  },
  computed: {
    // 费用销量比
    costVolumeRatio() {
      if (Number(this.AclassTotal) === 0) {
        return '∞'
      }
      let total = this.totalCost / Number(this.AclassTotal);
      total = toFixed(accMul(total, 100));
      return `${total}%`
    },
    // 费用合计
    totalCost() {
      let first = accAdd(Number(this.hotelAmt), Number(this.otherAmt));
      let second = accAdd(this.trafficAmt, this.lTrafficAmt);
      return accAdd(first, second);
    },
  },
  watch: {
    arr: {
      handler() {
        // 监听并计算套数
        this.arr.forEach(item => {
          item.num1 = item.num5;
        })
      },
      deep: true,
    }
  },
  filters: {numberComma},
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
    completeInput(name, reqArr, Type) {
      if (reqArr.length && name === reqArr[0].nickname) {
        if (Type === 'cp') {
          this.captainShow = false;
        }
        else if (Type === 'go') {
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
      if (!this.helpCaptain) {
        this.peopleList = [];
        return;
      }
      //获取队长信息
      optionService.getCaptain({value: e}).then(({tableContent}) => {
        // 下拉选择栏 默认开启
        this.captainShow = true;
        this.peopleList = tableContent;
        // 用户自己输入了完整的姓名 如果请求匹配到数据 不用再显示
        this.completeInput(e, tableContent, 'cp')
      });
    },
    // 实时请求 省长数据
    provalUserByAgent(type, e) {
      if (!this.governor) {
        this.peopleList = [];
        return;
      }
      // 筛选条件
      let data = {
        entityId: 20000,
        filter: JSON.stringify([
          {operator: "like", value: type, property: "role"},
          {operator: "like", value: e, property: "nickname"}
        ])
      };
      saleRepotService.getApprovalUserByAgent(data).then(({tableContent}) => {
        // 下拉选择栏 默认开启
        this.governorShow = true;
        this.peopleList = tableContent;
        // 用户自己输入了完整的姓名 如果请求匹配到数据 不用再显示
        this.completeInput(e, tableContent, 'go')
      });
    },
    // 实时请求 常委数据
    memberUser(type, e) {
      if (!this.member) {
        this.peopleList = [];
        return;
      }
      let data = {
        entityId: 20000,
        filter: JSON.stringify([
          {operator: "like", value: type, property: "role"},
          {operator: "like", value: e, property: "nickname"}
        ])
      };
      saleRepotService.getApprovalUserByAgent(data).then(({tableContent}) => {
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
      this.showProjectPopup = true;
    },
    // 删除新数据
    deleteNew() {
      if (this.arr.length === 1) {
        this.arr = [{value: [], qty: '', num5: 0}];
      } else {
        let deleteItem = this.arr.pop();
        this.$refs.projectPopup.delSelItem(deleteItem);
      }
    },
    // 随机ID
    guid() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }

      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    // 判断时间是否有超过20:00
    isTwoZero() {
      saleRepotService.getModelData().then(res => {
        if (res.submitAllow === 1) {
          this.btnStatus = true;
        } 
        else {
          this.btnStatus = false;
          this.$vux.alert.show({
            title: "提示",
            content: "每日提交截止时间为20:00"
          });
        }
      });
    },
    // 获取区域
    getArea() {
      return optionService.getRegion().then(({tableContent}) => {
        let tmp = [];
        for (let val of tableContent) {
          tmp.push(val['trans_detail_uncalc.var1'])
        }
        this.areaList = tmp;
        this.areaNextWeekList = ['未知', ...tmp];
      });
    },
    // 获取银行
    getBank() {
      return optionService.getBank().then(data => {
        let tmp = [];
        for (let val of data) {
          tmp.push(val['name']);
        }
        this.bankList = tmp;
        this.bankNextWeekList = ['未知', ...tmp];
      });
    },
    // 回显表单内容
    echoStorage(basicSrg = {}, formSrc = {}) {
      let {member, governor, captain} = basicSrg;
      let {Aclass, Bclass, BclassDown, comments, saleReportArr, hotelAmt, otherAmt, trafficAmt, lTrafficAmt, baseinfoExt,SpecificClassASet,SpecificClassBSet} = formSrc;
      if (basicSrg) {
        this.member = member;
        this.governor = governor;
        this.helpCaptain = captain;
        this.areaValue = [basicSrg.areaValue] || [];
        this.bankValue = [basicSrg.bank] || [];
      }
      if (formSrc) {
        this.Aclass = Aclass;
        this.Bclass = Bclass;
        this.BclassDown = BclassDown;
        this.SpecificClassASet = SpecificClassASet,
        this.SpecificClassBSet = SpecificClassBSet,
        this.arr = saleReportArr;
        this.comments = comments;
        this.hotelAmt = hotelAmt;
        this.otherAmt = otherAmt;
        this.trafficAmt = trafficAmt;
        this.lTrafficAmt = lTrafficAmt;
        this.baseinfoExt = baseinfoExt;
        this.areaToday = [baseinfoExt.varchar14];
        this.bankToday = [baseinfoExt.varchar15];
        this.areaTomorrow = [baseinfoExt.varchar19];
        this.areaNextWeek = [baseinfoExt.varchar20];
        this.bankNextWeek = [baseinfoExt.varchar21];
        this.bankTomorrow = [baseinfoExt.varchar22];
        this.cityToday = [baseinfoExt.varchar23];
        this.countyToday = [baseinfoExt.varchar24];
      }
    },
    // 项目类产品切换
    projectChange(item, index) {
      let matched = this.list.find(lItem => lItem.value === item.value[0]);
      console.log(matched);
      this.$set(this.arr, index, {
        ...item,
        num5: matched.num5,
        amount: matched.amount,
        num1: accMul(matched.num5, item.qty),
        taxAmount: matched.taxAmount,
      });
    },
    // 校验金额
    checkAmt(key = '') {
      this[key] = toFixed(Math.abs(Number(this[key])));
    },
    // 选中项目类产品
    selProject(sels) {
      this.arr = sels;
    },
    // 点击项目名称
    clickProject() {
      this.showProjectPopup = true;
    },
    // 获取连长、团长
    getSuperior(data) {
      return saleRepotService.getSuperior(data).then(({tableContent = []}) => {
        //let [companyCommander = {}, group = {}] = tableContent;
        this.governor = tableContent[0].govName || ''; // 连长
        this.member = tableContent[0].comName || ''; // 团长
      })
    },
    // 获取地区级联数据
    getCascadeRegion(data = {}) {
      return optionService.getCascadeRegion(data).then(data => {
        data.forEach(item => {
          item.originValue = item.value;
          item.value = item.name;
        });
        return data
      });
    },
    // 获取省份
    getProvince() {
      return this.getCascadeRegion().then(data => {
        this.provinceList = data;
      })
    },
    // 获取城市
    getCity() {
      let [value = ''] = this.areaToday;
      let matched = this.provinceList.find(item => item.value === value);
      return this.getCascadeRegion({
        parentId: matched.id,
      }).then(data => {
        this.cityTodayList = data;
      })
    },
    // 获取地区
    getCounty() {
      let [value = ''] = this.cityToday;
      let matched = this.cityTodayList.find(item => item.value === value);
      return this.getCascadeRegion({
        parentId: matched.id,
      }).then(data => {
        this.countyTodayList = data;
      })
    },
    // 省份切换
    provinceChange(val) {
      this.cityToday = [];
      this.countyToday = [];
      this.getCity();
    },
    // 城市切换
    cityChange(val) {
      this.countyToday = [];
      this.getCounty();
    },
  },
  mounted() {
    //提交时间是否超过20点
    this.isTwoZero();
  }
}
