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
    // 获取区域
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
    echoStorage(basicSrg = {} , formSrc = {}){
      let { member, governor, captain } = basicSrg;
      let { Aclass, Bclass, comments, saleReportArr } = formSrc;
      if(basicSrg){
        this.member = member;
        this.governor = governor;
        this.helpCaptain = captain;
        this.areaValue = [basicSrg.areaValue] || [];
        this.bankValue = [basicSrg.bank] || [];  
      }
      if(formSrc){
        this.Aclass = Aclass;
        this.Bclass = Bclass;
        this.arr = saleReportArr;
        this.comments = comments;      
      }
    }
  },
  mounted() {
    // 获取项目类产品
    this.listData();
    //提交时间是否超过20点
    this.isTwoZero();
  }
}
