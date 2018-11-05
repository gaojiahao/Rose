// 请求 引入
import optionService from "service/optionService";
import saleRepotService from "service/saleRepotService";
// 插件引入
import {
  Cell, Alert, Group, XInput, XButton,
  Confirm, Selector, PopupPicker, numberComma
} from "vux";
import PopupProjectList from 'components/popup/PopupProjectList'

// 方法引入
import {toFixed, accAdd, accMul} from 'plugins/calc'

export default {
  components: {
    Cell, Alert, Group, XInput,
    Confirm, XButton, Selector, PopupPicker,
    PopupProjectList,
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
      Bclass: "",                       // B类产品 输入金额
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
    };
  },
  computed: {
    // 费用销量比
    costVolumeRatio() {
      if (Number(this.Aclass) === 0) {
        return '∞'
      }
      let total = this.totalCost / Number(this.Aclass);
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
          item.num1 = accMul(item.qty, item.num5);
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
        } else if (res.submitAllow === 0) {
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
      optionService.getRegion().then(({ tableContent }) => {
        for(let val of tableContent){
          val.name = val['trans_detail_uncalc.var1']
          this.areaList.push({
            name: val.name,
            value: val.name
          })
        }
      });
    },
    // 获取银行
    getBank() {
      optionService.getBank().then(data => {
        for (let i = 0; i < data.length; i++) {
          data[i].value = data[i].name;
        }
        this.bankList = data;
      });
    },
    // 回显表单内容
    echoStorage(basicSrg = {}, formSrc = {}) {
      let {member, governor, captain} = basicSrg;
      let {Aclass, Bclass, comments, saleReportArr, hotelAmt, otherAmt, trafficAmt, lTrafficAmt} = formSrc;
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
        this.arr = saleReportArr;
        this.comments = comments;
        this.hotelAmt = hotelAmt;
        this.otherAmt = otherAmt;
        this.trafficAmt = trafficAmt;
        this.lTrafficAmt = lTrafficAmt;
      }
    },
    // TODO 项目类产品切换
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
    // TODO 校验金额
    checkAmt(key = '') {
      this[key] = toFixed(Math.abs(Number(this[key])));
    },
    // TODO 选中项目类产品
    selProject(sels) {
      this.arr = sels;
    },
    // TODO 点击项目名称
    clickProject() {
      this.showProjectPopup = true;
    },
    // TODO 获取连长、团长
    getSuperior() {
      return saleRepotService.getSuperior().then(({tableContent = []}) => {
        let [companyCommander = {}, group = {}] = tableContent;
        this.governor = companyCommander.nickname || ''; // 连长
        this.member = group.nickname || ''; // 团长
      })
    }
  },
  mounted() {
    //提交时间是否超过20点
    this.isTwoZero();
  }
}
