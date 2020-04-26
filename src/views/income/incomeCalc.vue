<template>    
    <div class="pages2">
        <div class="avatar-part"></div>
        <!-- 目标详情 -->
        <div class="dashboard-container-part">
          <div class="place-holder"></div>
          <div class="top-part">
            <div>
              <div class="date-part">
                <span>欢迎您，{{username}}加入</span> 
                <span>{{prjectInfo.VARCHAR1}}</span>
              </div>
            </div>
          </div>
          <div class="dashboard-part">
            <div class="each-dashboard least-num">
              <div class="dashboard_title">销售目标</div>
              <div class="dashboard_count">{{prjectInfo.VARCHAR3}}<span>/套</span></div>
            </div>
            <div class="each-dashboard when-today">
              <div class="dashboard_title">月收入目标</div>
              <!-- <div class="dashboard_count"><span>￥</span>{{this.monthSaleGobal}}</div> -->
              <div class="dashboard_count">
                <div class="left">￥</div>
                <div class="right"><input class="input" :value="this.monthSaleGobal" @blur="onInput" /></div
              ></div>
            </div>
          </div>
          <div class="place-holder"></div>
        </div>
        <div class="main-container-part">
            <div class="main-container-part-bg">
                <div v-for="(item,index) in list" :key="index" class="detail">
                  <div class='title' @click="toggleClass(index,item)">
                      <span class="">{{item.timeText}}</span>
                      <span :class="item.showContent ? 'icon-down':'icon-up'" ></span>
                  </div>
                  <div class="content" :class="{'open':item.showContent}">
                      <div class="button">
                          <div class="left"><x-button mini type="primary" @click.native="clickProject(index)">新增</x-button></div>
                          <!-- <div class="left"><x-button mini type="warn">管理</x-button></div> -->
                      </div>
                      <template v-if="item.detail.length">
                        <div class="list" v-for="(dItem,dIndex) in item.detail" :key="dIndex"> 
                            <div style="width: 100%;position: relative;">
                              <div style="width:70%">
                                <span style="">{{dItem.name}}</span>
                                <!-- <span style="display:none">{{dItem.value}}</span>
                                <span style="">{{dItem.nums}}<span>{{dItem.measureUnit}}</span></span>
                                <span style="">---提成¥<span>{{dItem.ticheng}}</span></span> -->
                              </div>
                              <div style="width: 30%;position: absolute;top: 0;right: -.18rem;">
                                <span><span class="icon-edit" @click="edid(index,dIndex)"></span><span class="icon-del" @click="del(index,dIndex)"></span></span>
                              </div>
                            </div>
                            <div>
                              <span style="display:none">{{dItem.value}}</span>
                                <span style="">{{dItem.nums}}<span>{{dItem.measureUnit}}</span></span>
                                <span style=" float:right">提成¥<span>{{dItem.ticheng}}</span></span> 
                            </div>   
                        </div>
                      </template>
                      <div  v-else>
                        <div>{{item.timeText}}未填报！</div>
                      </div>
                  </div>
                </div>
            </div>   
        </div>
        <popup-income-calc :show="showPopupIncomeCalc" v-model="showPopupIncomeCalc" :products="products" ref="PopupIncomeCalc" @on-sel="selProject" :defaultValue='defaultValue'></popup-income-calc>
        <loading :show="showLoading"></loading>
    </div>
</template>

<script>
import {XButton, Confirm, querystring,dateFormat} from 'vux'
import PopupIncomeCalc from 'components/popup/PopupIncomeCalc'
import tokenService from 'service/tokenService'
import Loading from 'components/common/loading'
import incomeService from "service/incomeService";
const ROSE_OPTION_KEY = 'ROSE_OPTION'
const ROSE_LOGIN_CODE = 'ROSE_CODE'
export default {
  data(){
    return{
        list:[],
        showDetail:0,
        showPopupIncomeCalc:false,
        username:'',
        prjectInfo:[],
        showLoading: false,
        invList:[],
        products:[],
        listId:'d45606e4-c905-4d6c-9555-b379e4aa683f',
        userId:'',
        baseinfo:{},
        defaultValue:{},
        monthSaleGobal:0,
    }
  },
  components: {
    XButton,
    Confirm,
    PopupIncomeCalc,
    Loading
  },
  watch:{
    invList:{
      handler(val){
        this.products = [];
        for(var i =0 ; i<this.invList.length; i++){
          if(!this.judgeInvList(this.invList[i])){
            var arr = {
              name:this.invList[i]['invName'],
              value:this.invList[i]['transObjId'],
              code:this.invList[i]['invCode'],
              measureUnit:this.invList[i]['measureUnit'],
            }
            this.products.push(arr);
          }  
        }
      }
    }
  },
  methods:{
    //切换折叠
    toggleClass(index,item){
        this.list[index]['showContent'] =  this.list[index]['showContent'] ? false : true;
    },
    //新建收入pop
    clickProject(index) {
      this.showPopupIncomeCalc = true;
      this.xindex = index;
    },
    getToday(){
      let now = new Date();
      let date = now.getDate();
      let whichDay = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      let Today = `${(now.getMonth()+1)}月${now.getDate()}号 ${whichDay[now.getDay()]}`;
      // 获取月天数
      now.setMonth(now.getMonth()+1);
      now.setDate(0);
      this.DaysInMonth = now.getDate() - date;
      this.Today = Today;
    },
    //产品项目去重
    judgeInvList(temp){
      for(var i=0;i<this.products.length;i++){
        if(temp['transObjId']==this.products[i]['value']){
          return true;
        }
      }
    },
    getWeek(a, b, c){
      var today = new Date(); //获取当前时间 
      var y = today.getFullYear();
      var m = today.getMonth() + 1;
      var d = today.getDate();

      function getMonthWeek(a, b, c){
        var date = new Date(a, parseInt(b) - 1, c),
            w = date.getDay(),
            d = date.getDate();
        return Math.ceil((d + 6 - w) / 7);
      }
      var count =  getMonthWeek(y, m, d);
      var arr = [];
      for(var i = 1; i<= count ; i++){
        var a = {
          time : m,
          timeText: m+'月第'+i+'周',
          showContent: i==count ? true : false,
          detail: [],
        }
        arr.push(a);
      }
      this.list = arr;
      //console.log("今天是"+ m + "月的第 " + getMonthWeek(y, m, d) + " 周");
    },
    //计算提成
    calcRoyalty(item){
      var royalty = 0,
          temp = item;
      for(var i=0;i<this.invList.length;i++){
        if(item.value==this.invList[i].transObjId){
          if(temp.nums >= this.invList[i].qty){
            temp = {
              ...this.invList[i],
              nums:temp.nums,
            }
          }
        }
      }
      if(temp.qty){
        //提成 = （金额*数量*提成比例）+ 奖金
        console.log(temp.amount+'*'+temp.qty+'*'+(temp.ticheng/100))
        royalty = Number(temp.amount*temp.qty*(temp.ticheng/100)) + temp.price
      }
      return royalty;
    },
    //选中项目开始计算
    selProject(item){
      var ticheng = this.calcRoyalty(item);
      var arr = {
        ...item,
        ticheng: ticheng, //需要计算
      }
      for(var i = 0 ; i < this.list[this.xindex]['detail'].length; i++){
        if(this.list[this.xindex]['detail'][i]['value'] == item.value){
          this.list[this.xindex]['detail'][i] = arr; 
          this.submit();
          return ; 
        }
      }
      this.list[this.xindex]['detail'].push(arr);
      this.submit();
    },
    guid() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    //提交
    submit(){
      if(this.view=='new'){
        var json = {
          isMobile: true,
          conn: 20000,
          list: 'trans_form_data',
          transCode: 'SRMN',
          //jsonData: JSON.stringify({
          jsonData: {
            listId: "d45606e4-c905-4d6c-9555-b379e4aa683f",
            referenceId: this.guid(),
            baseinfoExt: {
              varchar2:this.prjectInfo.VARCHAR1,
              varchar4: this.monthSaleGobal,  //用户自己填收入目标
              id: this.prjectInfo.REFERENCE_ID,
              varchar3: this.prjectInfo.REFERENCE_ID
            },
            transDetailUncalc: [],
            transCode: "SRMN",
          }
        }
        for(var i = 0; i < this.list.length; i++){
          if(this.list.length){
            for(var j = 0; j < this.list[i]['detail'].length; j++){
              var jitem = {
                id: this.guid(),
                var1 : this.list[i].timeText,   //日期周
                objName: this.list[i]['detail'][j].name,  //产品名称
                transObjCode: this.list[i]['detail'][j].code,
                transObjId: this.list[i]['detail'][j].value,
                qty: this.list[i]['detail'][j].nums,     //数量
                amount: this.list[i]['detail'][j].ticheng,   //提成金额
                fgCode: "",
                measureUnit: this.list[i]['detail'][j].measureUnit, 
              }
              json.jsonData['transDetailUncalc'].push(jitem);
            }
          }
        }
        console.log('提交数据：'+JSON.stringify(json.jsonData))
        json.jsonData = JSON.stringify(json.jsonData);
        console.log('提交数据：'+json)
        incomeService.saveData(querystring.stringify(json)).then(data => {
          console.log(data)
        });
      } else {
        console.log('开始修改');
        console.log('baseinfo',this.baseinfo)
        var json = {
          isMobile: true,
          conn: 20000,
          list: 'trans_form_data',
          transCode: this.TRANS_CODE,
          //jsonData: JSON.stringify({
          jsonData: {
            listId: "d45606e4-c905-4d6c-9555-b379e4aa683f",
            referenceId: this.referenceId ? this.referenceId : this.guid(),
            // baseinfo:{
            //   ...this.baseinfo,
            //   modTime: dateFormat(Date.now(), 'YYYY-MM-DD HH:mm:ss')
            // },
            baseinfoExt: {
              varchar2:this.prjectInfo.VARCHAR1,
              varchar4: this.monthSaleGobal,
              id: this.prjectInfo.REFERENCE_ID,
              varchar3: this.prjectInfo.REFERENCE_ID
            },
            transDetailUncalc: [],
            transCode: this.TRANS_CODE,
          }
        }
        for(var i = 0; i < this.list.length; i++){
          if(this.list.length){
            for(var j = 0; j < this.list[i]['detail'].length; j++){
              var jitem = {
                id: this.list[i]['detail'][j].id ? this.list[i]['detail'][j].id:this.guid(),
                var1 : this.list[i].timeText,   //日期周
                objName: this.list[i]['detail'][j].name,  //产品名称
                transObjCode: this.list[i]['detail'][j].code,
                transObjId: this.list[i]['detail'][j].value,
                qty: this.list[i]['detail'][j].nums,     //数量
                amount: this.list[i]['detail'][j].ticheng,   //提成金额
                fgCode: "",
                measureUnit: this.list[i]['detail'][j].measureUnit, 
              }
              json.jsonData['transDetailUncalc'].push(jitem);
            }
          }
        }
        console.log('提交数据：'+JSON.stringify(json.jsonData))
        json.jsonData = JSON.stringify(json.jsonData);
        console.log('提交数据：'+json)
        console.log('baseinfo',json)
        //return;
        incomeService.saveData(querystring.stringify(json)).then(data => {
          console.log(data)
        });

      }
    },
    //删除
    del(index,dIndex){
      this.list[index]['detail'].splice(dIndex,1);
      this.submit();
    },
    //修改
    edid(index,dIndex){
      this.defaultValue = this.list[index]['detail'][dIndex];
      this.clickProject(index);
    },
    //新增月收入目标
    onInput(e){
      var value = e.target.value;
      this.monthSaleGobal = value;
      this.submit();
    }
  },
  beforeCreate() {
    let query = querystring.parse(location.search.slice(1));
    let code = sessionStorage.getItem(ROSE_LOGIN_CODE);
    if (query.code) { // 获取到登录的code存储到session
      sessionStorage.setItem(ROSE_LOGIN_CODE, query.code);
    }
    if (process.env.NODE_ENV !== 'development' && !code && !query.code) { // 若不为开发环境，且链接没有code，sessionStorage也没有存储，则认为当前环境为非企业微信环境
      window.location.replace('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5311bd8608c14d98&redirect_uri=https%3a%2f%2fwww.gofuit.com%2fGfSrmn&response_type=code&scope=SCOPE&agentid=1000004&state=1#wechat_redirect')
    }
  },
  created() {
    (async () => {
      this.showLoading = true;
      await tokenService.getToken().catch(err => {
        this.$vux.alert.show({
          content: err.message
        })
      });
      await tokenService.isPresident().then(data => {
        this.username = data.nickname; //拿到当前用户
        if (`${data.statu}` === '1') { // statu为1则为总裁
          this.showLookReport = true
        }
      })
      await tokenService.getUser().then(userInfo => {
        // 获取当前时间
        this.getToday();
        let {completeData = {}, userCode = ''} = userInfo;
        let allowList = ['0414', '1204', '1207', '1129', 'rfd9527', 'rfd125', '2025'];
        this.showLookSales = allowList.includes(userCode);
        this.userInfo = {
          bank: completeData[0].homeBank || '',         //银行
          region: completeData[0].homeProvince || '',   //省份地区
          dept: completeData[0].area || '',             //事业部
        };
        localStorage.setItem(ROSE_OPTION_KEY, JSON.stringify({
          bank: completeData[0].homeBank || '',         //银行
          region: completeData[0].homeProvince || '',   //省份地区
          dept: completeData[0].area || '',             //事业部
          groupName: completeData[0].dept || '',    //部门
          captain: completeData[0].bmName || '',        //队长（暂无）
          userCode: completeData[0].userCode || '',      //工号
          subSector: completeData[0].subSector || '',      //三级部门
          userId: completeData[0].userId || ''
        }))
        this.userId = completeData[0].userId;
      })
      //获取产品激励信息
      await incomeService.getIncomeInfo().then(data => {
        this.prjectInfo = data.tableContent[0]
        this.prjectReferenceId = data.tableContent[0].REFERENCE_ID;
      })
      //获取产品激励产品列表
      await incomeService.getXmcpjlInv(this.prjectInfo.REFERENCE_ID).then(data => {
        this.invList = data.tableContent;
      })
      //获取本项目提交过没有
      await incomeService.getIsHasSrmnInfo({listId:this.listId,userId:this.userId}).then(data => {
        if(data.dataCount){
          ///this.view = 'updata';
          this.view = 'updata'
          this.referenceId = data.tableContent[0].REFERENCE_ID;
          this.TRANS_CODE = data.tableContent[0].TRANS_CODE;
          console.log('已经提交过收入模拟，RefenceId:'+this.REFERENCE_ID);
          incomeService.getJsonDataByReferenceId(this.TRANS_CODE).then(data=>{
            var formdata = JSON.parse(data.tableContent[0].json_data);
            console.log(JSON.parse(JSON.stringify(data.tableContent[0].json_data)));
            var transDetailUncalc = formdata.transDetailUncalc;
            this.baseinfo = formdata.baseinfo;
            this.monthSaleGobal = formdata.baseinfoExt.varchar4;
            for(var i = 0; i< transDetailUncalc.length;i++){
              for(var j = 0 ; j< this.list.length;j++){
                if(transDetailUncalc[i]['var1']==this.list[j]['timeText']){
                  var arr = {
                    code: transDetailUncalc[i].transObjCode,
                    measureUnit: transDetailUncalc[i].measureUnit,
                    name: transDetailUncalc[i].objName,
                    nums: transDetailUncalc[i].qty,
                    ticheng: transDetailUncalc[i].amount,
                    value: transDetailUncalc[i].transObjId,
                    id: transDetailUncalc[i].id,
                  }  
                  this.list[j]['detail'].push(arr);
                }
              }
            }
          })
        } else {
          this.view = 'new'
        }
      })
      
      this.getWeek();
      this.showLoading = false;
    })()
  }

}
</script>

<style lang="scss" scoped>
.pages2 {
    left: 0;
    width: 100%;
    background: #f5f5f5;
    height: 100%;
    .header {
        width: 100%;
        height: .4rem;
        background-color: #8e2416;
        color: #fff;
        .header-container {
            width: 100%;
            display: flex;
            height: .4rem;
            position: relative;
            line-height: .4rem;
            box-sizing: border-box;
            .center {
                text-align: center;
                width: 33.33%;
                margin-left: 33.33%;
            }
        }
    }
    .avatar-part{
        top: 0;
        width: 100%;
        height: 2rem;
        position: absolute;
        background: #111 url(/static/img/bg01.281c29d.jpeg) top/cover no-repeat;
    }
    .dashboard-container-part {
        width: 100%;
        position: relative;
        background: #FFF;
        box-sizing: border-box;
        padding: 0 .1rem .04rem;
        top:2rem;
        .place-holder {
            left: 0;
            top: -10px;
            z-index: 10;
            width: 100%;
            height: .12rem;
            position: absolute;
            background: #FFF;
            border-top-left-radius: .1rem;
            border-top-right-radius: .1rem;
        }
        .user-info-container {
            top: -40px;
            left: 20px;
            z-index: 20;
            color: #FFF;
            display: flex;
            font-size: .14rem;
            position: absolute;
            align-items: center;
            .user-avatar {
                width: .6rem;
                height: .6rem;
                img {
                width: 100%;
                border-radius: 50%;
                }
            }
            .user-info {
                margin-left: .1rem;
                .user-name {
                    font-size: .16rem;
                    font-weight: bold;
                    margin-bottom: .06rem;
                }
                .user-from {
                    font-size: .12rem;
                    .each-form-msg {
                        border-radius: .12rem;
                        background: #5077aa;
                        padding: .01rem .04rem;
                        box-shadow: 0 2px 2px #5077aa;
                    }
                    .each-form-msg + .each-form-msg {
                        margin-left: .04rem;
                    }
                }
            }

        }
        .top-part {
            display: flex;
            align-items: center;
            margin-bottom: .1rem;
            justify-content: space-between;
            .tips-title {
                color: #111;
                font-size: .26rem;
                font-weight: bold;
                line-height: .32rem;
                .when_finished {
                    color: #D2AD6B;
                }      
            }
        }
        .date-part {
            color: #8A8A8E;
            font-size: .14rem;
            font-weight: bold;
        }
        .dashboard-part {
            display: flex;
            .each-dashboard {
                flex: 1;
                color: #FFF;
                font-weight: bold;
                line-height: .22rem;
                border-radius: .08rem;
                padding: .06rem .04rem;
                .dashboard_title {
                font-size: .12rem;
                }
                .dashboard_count {
                  font-size: .22rem;
                  width: 100%;
                  position: relative;
                  height: .22rem;
                  .left{
                    width: 10%;
                    float: left;
                  }
                  .right{
                    width: 90%;
                    height: .22rem;
                    .input{
                      width: 80%;
                      font-size: .22rem;
                      border: 0px;
                      outline: none;
                      cursor: pointer;
                    }
                  }
                }
                &.when-today {
                // $bgColor: #2366FF;
                $bgColor: #111;
                color: $bgColor;
                // background: $bgColor;
                // box-shadow: 0 2px 5px $bgColor;
                }
                &.when-month {
                // $bgColor: #00C5C3;
                $bgColor: #111;
                color: $bgColor;
                // background: $bgColor;
                // box-shadow: 0 2px 5px $bgColor;
                }
                &.least-num {
                // margin-right: unset;
                $bgColor: #D2AD6B;
                color: $bgColor;
                // background: $bgColor;
                // box-shadow: 0 2px 5px $bgColor;
                }
            }
            .each-dashboard  + .each-dashboard  {
                margin-left: .1rem;
            }
        }
    }
    .main-container-part {
        width: 100%;
        //background: #FFF;
        box-sizing: border-box;
        position: relative;
        top: 2rem;
        height: 100%;
        background-color: #f5f5f5;
        .main-container-part-bg{
            padding: 0rem .1rem .1rem .1rem;
            background-color: #f5f5f5;
            .detail{
                width: 100%;
                border-radius: 5px;
                background: white;
                margin-top: .1rem;
                .title{
                    padding: .05rem;
                    font-size: .14rem;
                    line-height: .26rem;
                    .icon-up{
                        width: .26rem;
                        height: .26rem;
                        position: absolute;
                        right: .15rem;
                    }
                    .icon-down{
                        width: .26rem;
                        height: .26rem;
                        position: absolute;
                        right: .15rem;
                    }
                }
                .content{
                    // max-height: 0;
                    // transition: max-height .3s;
                    display: none;
                    .button{
                        width: 100%;
                        height: .3rem;
                        .left{
                            float: right;
                            margin: 0 .05rem;
                            .weui-btn_mini {
                                display: inline-block;
                                padding: 0 1.32em;
                                line-height: 18px;
                                font-size: 10px;
                            }
                        }
                    }
                    .list{
                        .icon-edit{
                            width: .25rem;
                            height: .25rem;
                            position: absolute;
                            right: .45rem;    
                        }
                        .icon-del{
                            width: .26rem;
                            height: .26rem;
                            position: absolute;
                            right: .15rem;    
                        }
                    }
                }
                .open {
                    // max-height: 600px;
                    // transition: max-height .5s;
                    display: block;
                    
                }
            }
            .list{
              padding: 0 .05rem;
              margin-bottom: .1rem;
            }     
        }
    }
}
</style>
