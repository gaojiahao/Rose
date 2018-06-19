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
            class="helpCaptain"
            ></x-input>
            <x-input 
            title="所属省长"
            text-align="right"
            v-model.trim="governor"
            @on-change="provalUserByAgent('省长',$event)"
            @on-focus='provinceReset'
            placeholder="请输入省长"
            ref="provinceChooise"
            class="helpCaptain"
            ></x-input>
            <x-input 
            title="所属常委"
            text-align="right"
            v-model.trim="member"
            @on-change="memberUser('常委',$event)"
            @on-focus='memberUserReset'
            placeholder="请输入常委"
            ref="memberChooise"
            class="helpCaptain"
            ></x-input>
          </group>
          <group class="captain-container" :class="captainShow==false?'captainHide':''">
            <cell :title="item.nickname" v-for="(item, index) in teamLeaderList" :key="index" @click.native="getNickname(item.nickname)"></cell>
          </group>

          <group class="captain-container">
            <cell :title="item.nickname" v-for="(item, index) in provalUserByList" :key="index" @click.native="getProvalUser(item.nickname)"></cell>
          </group>

           <group class="captain-container">
            <cell :title="item.nickname" v-for="(item, index) in MemberUserList" :key="index" @click.native="getMemberUser(item.nickname)"></cell>
          </group>

          <group label-align='left' title="请选择相应的地区" v-if="man==true">
            <popup-picker 
              class="each_part"
              title="所在地区" 
              placeholder="请选择省份"
              :data='areaList'
              v-model="areaValue"
              :columns="1">
            </popup-picker>

            <popup-picker 
              class="each_part"
              title="所属银行" 
              placeholder="请选择银行"
              :data='bankList'
              v-model="bankValue"
              :columns="1">
            </popup-picker>
          </group>

          <group 
            label-align='left' 
            :title="index>0?'':'请选择对应的产品'" 
            v-for="( item ,index ) in arr"
            :key="index"
            >
            <popup-picker 
              class="each_part"
              title="项目类产品" 
              placeholder="请选择产品"
              :data="list"
              v-model="item.value"
              :columns="2"
              show-name
            >
            </popup-picker>

            <cell 
              class="each_part"
              title="单价"
              :value="'￥'+item.value[1] | numberComma"
              value-align="right" 
              v-if="item.value.length>0"
            ></cell>

            <x-input 
              title="数量" 
              type="number" 
              text-align="right" 
              placeholder="请输入数量"
              v-if="item.value[0]!='无'"
              v-model.number="item.qty"
            ></x-input>
          </group>

          <p class="caution_part" v-if='arr[0].value.length!=0'>
            您还需要添加新的项目？请点击 <span class="plus_tx" @click="createNew">新增</span>
            <span v-if="arr.length>1">
              <span>或</span>
              <span class="plus_delect" @click="deleteNew">删除</span>
            </span>
          </p>
          
          <group>
            <x-input 
            title="A类产品"
            :value='Aclass | numberComma(3)' 
            @input="Ainput" 
            ref='input1'
            text-align="right" 
            placeholder="请输入金额"
            ></x-input>

            <x-input 
            title="B类产品"
            :value='Bclass | numberComma(3)'  
            @input="Binput" 
            ref='input2'
            text-align="right" 
            placeholder="请输入金额"
            ></x-input>
          </group>

          <group>
            <x-input 
            title="备注"
            text-align="right" 
            placeholder="非必填 如有需要请填写"
            v-model="comments"
            ></x-input>
          </group>

      </div>
      <x-button 
          id="count_button" 
          :gradients="btnStatus==true?['#B99763', '#E7D0A2']:['#ddd','#ddd']"
          @click.native="end"
      >进入合计
      </x-button>
      <confirm></confirm>
      <alert></alert>
    </div>
      <router-view></router-view>
  </div>
</template>

<script>
import saleRepotService from '../service/saleRepotService'
import optionService from '../service/optionService'
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
  } from 'vux'
export default {
  components:{
    Cell,
    Alert,
    Group,
    XInput,
    Confirm,
    XButton,
    Selector,
    PopupPicker
  },
  data () {
    return {
      alertEnd:false,
      btnStatus:true,
      list: [
        {
          name:'无',
          value:'无',
          parent:'0'
        },
        {
          name:0,
          value:0,
          parent:'无'
        }
      ],
      arr:[
        {
          value:[],
          qty:''
        }
      ],
      Aclass:'',
      Bclass:'',    
      showNumber:false,
      showNewDiv:false,
      mescroll: null,
      totalInfo:'',
      teamLeaderList:[],
      helpCaptain:'',
      captainShow:false,
      areaList:[],
      areaValue:[],
      bankList:[],
      bankValue:[],
      man:false,
      governor:'',
      governorStatus:true,
      member:'',
      memberStatus:true,
      provalUserByList:[],
      MemberUserList:[],
      comments:''
    }
  },
  filters:{
    numberComma
  },
  methods:{
    //获取队长
    teamLeader(){
      optionService.getCaptain().then( data => {
        for(let i = 0; i<data.tableContent.length; i++){
          data.tableContent[i].name = data.tableContent[i].nickname;
          data.tableContent[i].value = data.tableContent[i].nickname;
        }
          this.teamLeaderList = data.tableContent;
        })
    },
    //匹配队长
    captainSelect(e){
      //当输入内容清空时
      if(this.captainShow == false || this.helpCaptain == ''){
        this.teamLeaderList.length=0;
        return;
      }
      //获取队长信息
      optionService.getCaptain({ value:e }).then( data => {
        this.teamLeaderList = data.tableContent;
      })
    },
    //用户点击时
    captainFocus(){
      this.captainShow = true;
    },
    //选择队长
    getNickname(e){
      this.helpCaptain = e;
      this.captainShow = false;
      this.teamLeaderList = [];
    },
    //获取区域
    getArea(){
        optionService.getRegion().then( data => {
            for(let i = 0; i<data.length; i++){
                this.areaList.push({
                    name:data[i].name,
                    value:data[i].name,
                })
            }
        })
    },
    //获取银行
    getBank(){
        optionService.getBank().then(data=>{
            for(let i = 0 ; i<data.length ;i++){
                data[i].value=data[i].name;
            }
            this.bankList=data;
        })
    },
    //添加新数据
    createNew(){
      this.arr.push({ value: [], qty:'' }); 
    },
    //删除新数据
    deleteNew(){
      if(this.arr.length === 1){
        this.arr=[{ value: [], qty:'' }]
      }else{
        this.arr.splice(this.arr.length-1, 1); 
      }
    },
    //随机ID
    guid() {
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },
    listData(){
      saleRepotService.saleRepotList().then( data => {
        for(let i = 0; i<data.tableContent.length; i++){
          this.list.push(
          {
            name:data.tableContent[i]['trans_detail_uncalc.transObjCode'],
            value:data.tableContent[i]['trans_detail_uncalc.transObjCode']+'_'+i+'_'+data.tableContent[i]['trans_detail_uncalc.qty'],
            parent:'0',
          },
          {
            name:data.tableContent[i]['trans_detail_uncalc.price'],
            value:data.tableContent[i]['trans_detail_uncalc.price'],
            parent:data.tableContent[i]['trans_detail_uncalc.transObjCode']+'_'+i+'_'+data.tableContent[i]['trans_detail_uncalc.qty'],
          });
        }
      })
    },
    end(){
      if(!this.btnStatus){
        return;
      }
      let captain = this.helpCaptain,
          governor=this.governor,
          member=this.member,
          comments=this.comments,
          dept = JSON.parse(localStorage.getItem('ROSE_OPTION')).dept,
          region = JSON.parse(localStorage.getItem('ROSE_OPTION')).region,
          bank = JSON.parse(localStorage.getItem('ROSE_OPTION')).bank,
          groupName = JSON.parse(localStorage.getItem('ROSE_OPTION')).groupName;

      if(!this.helpCaptain){
        this.$vux.alert.show({
          title: '提示',
          content: '请填写队长信息'
        })
        return;
      }else if(!this.governor){
         this.$vux.alert.show({
          title: '提示',
          content: '请填写省长信息'
        })
        return;
      }else if(!this.member){
         this.$vux.alert.show({
          title: '提示',
          content: '请填写常委信息'
        })
        return;
      }
      localStorage.setItem('ROSE_OPTION',JSON.stringify({
        bank:bank,
        captain:captain,
        dept:dept,
        region:region,
        groupName:groupName,
      }))
      let jsonData = {
          "listId": "4bda3e47-a088-4749-a988-ebb07cfb00e4",
          "referenceId":this.guid(),
          "baseinfoExt": {
            "id":this.guid(),
            "varchar1":dept,
            "varchar2":captain,
            "varchar3":region,
            "varchar4":bank,
            "varchar5":groupName,
            "varchar6": "否",
            "varchar7":governor,
            "varchar8":member,
            "varchar9":comments,
          },
          "transDetailUncalc": [],
          "transCode": "XHXSDD"
          };
          if(this.arr[0].value.length == 0){
              this.$vux.alert.show({
                  title: '提示',
                  content: '请选择项目产品'
                })
              return;
            }
          for(let i = 0; i<this.arr.length; i++){
            if(this.arr[0].value[0] != '无' && this.arr[i].qty === ''){
                this.$vux.alert.show({
                  title: '提示',
                  content: '请填写项目类产品数量'
                })
                return;
            }else{
                jsonData.transDetailUncalc.push({
                  "id":this.guid(),
                  "transObjCode": this.arr[i].value[0] === '无'? '无' : this.arr[i].value[0].split('_')[0],//项目类产品名称
                  "containerCode": "项目类产品",//类型
                  "qty": this.arr[i].value[0] === '无'?'':this.arr[i].qty,
                  "taxAmount": this.arr[i].value[0] === '无'? '' : Number(this.arr[i].value[0].split('_')[2]),
                  "amount": this.arr[i].qty*this.arr[i].value[1],//总金额
                  "fgCode": ""
                })
              } 
            }
            if(!this.Aclass){
              this.$vux.alert.show({
                title: '提示',
                content: '请输入A类产品销售金额'
              })
              return;
            }
            else if(!this.Bclass){
              this.$vux.alert.show({
                title: '提示',
                content: '请输入B类产品销售金额'
              })
              return;
            }
            else{
              jsonData.transDetailUncalc.push(
                {
                  "id":this.guid(),
                  "transObjCode": "A类产品",//项目类产品名称
                  "containerCode": "A",//类型
                  "qty": '',
                  "amount": Number(this.Aclass),//总金额
                  "fgCode": ""
                },
                {
                  "id":this.guid(),
                  "transObjCode": "B类产品",//项目类产品名称
                  "containerCode": "B",//类型
                  "qty": '',
                  "amount": Number(this.Bclass),//总金额
                  "fgCode": ""
                })
                
            }
            let totalInfo = {
                'isMobile':true,
                'conn':20000,
                'list':'trans_form_data',
                'transCode':'XHXSDD',
                'jsonData':JSON.stringify(jsonData)
              }
              this.totalInfo = totalInfo;
              // 提交表单内容 缓存
              localStorage.setItem(
                'saleReportInfo',
                JSON.stringify({
                    saleReportRemark:totalInfo,
                    time:new Date().getTime()
                })
              )
              // 用户编辑内容 缓存
              localStorage.setItem(
                'saleReport',
                JSON.stringify({
                  saleReportArr:this.arr,
                  Aclass:this.Aclass,
                  Bclass:this.Bclass,
                  time:new Date().getTime()
                  })
              )
              //缓存队长省长常委
              localStorage.setItem('SALE_INFO_LIST',JSON.stringify({
                captain:this.helpCaptain,
                governor:governor,
                member:member
              }));
              this.$router.push({path:'/count'})
          
    },
    Ainput(e){
      this.Aclass = e.split(',').join('');
    },
    Binput(e){
       this.Bclass = e.split(',').join('');
    },
    timestampToTime(timestamp) {
        let date = new Date(timestamp),//时间戳为10位需*1000，时间戳为13位的话不需乘1000
            Y = date.getFullYear() + '-',
            M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-',
            D = date.getDate() + ' ';
        return Y+M+D;
    },
    DateDifference(Date1,Date2) {  
        let sDate, 
            newDate1, 
            newDate2, 
            Days;

        var aDate = Date1.split("-");
            newDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]); //转换为07-10-2017格式
              
        var aDate = Date2.split("-");
            newDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
            Days = parseInt(Math.abs(newDate1 - newDate2) / 1000 / 60 / 60 / 24); //把差的毫秒数转换为天数  
        return Days;
    },
    //省长
    provalUserByAgent(type,e){
      if(this.governorStatus==false||this.governor==''){
        this.provalUserByList.length=0;
        return;
      }
      let data={
                "entityId":20000,
                "filter":JSON.stringify([{"operator":"like","value":type,"property":"role"},{"operator":"like","value":e,"property":"nickname"}])
            };
      saleRepotService.getApprovalUserByAgent(data).then(res=>{
          this.provalUserByList=res.tableContent;
      });
    },
    provinceReset(e){
      this.governorStatus=true;
    },
    //选择省长
    getProvalUser(val){
      this.governorStatus=false;
      this.provalUserByList.length=0;
      this.governor=val;
    },
     //常委
    memberUser(type,e){
      if(this.memberStatus==false||this.member==''){
        this.MemberUserList.length=0;
        return;
      }
      let data={
                "entityId":20000,
                "filter":JSON.stringify([{"operator":"like","value":type,"property":"role"},{"operator":"like","value":e,"property":"nickname"}])
            };
      saleRepotService.getApprovalUserByAgent(data).then(res=>{
          this.MemberUserList=res.tableContent;
      });
    },
    memberUserReset(e){
      this.memberStatus=true;
    },
    //选择常委
    getMemberUser(val){
      this.memberStatus=false;
      this.MemberUserList.length=0;
      this.member=val;
    }
  },
  mounted(){
    
    //获取地区
    this.getArea();
    //获取银行
    this.getBank();
    //提交时间是否超过20点
    saleRepotService.getModelData().then( res => {
      if(res.submitAllow === 1){
        this.btnStatus=true;
      }
      else if(res.submitAllow === 0){
        this.btnStatus=false;
        this.$vux.alert.show({
            title: '提示',
            content: '每日提交截止时间为20:00'
        })
      }
    })
    //默认缓存
    if(localStorage.getItem('saleReport')){
      this.arr = JSON.parse(localStorage.getItem('saleReport')).saleReportArr;
      this.Aclass = JSON.parse(localStorage.getItem('saleReport')).Aclass;
      this.Bclass = JSON.parse(localStorage.getItem('saleReport')).Bclass;
    }
    if(localStorage.getItem('SALE_INFO_LIST')){
      this.helpCaptain = JSON.parse(localStorage.getItem('SALE_INFO_LIST')).captain;
      this.governor = JSON.parse(localStorage.getItem('SALE_INFO_LIST')).governor;
      this.member = JSON.parse(localStorage.getItem('SALE_INFO_LIST')).member;
      this.governorStatus=false;
      this.memberStatus=false;
    }
   this.listData();
  },
  beforeRouteLeave(to,from,next){
    let that=this;
    if(that.arr[0].value.length==0 || to.name=='Count'){ next() }
    else{
      this.$vux.confirm.show({
        title: '温馨提示',
        content: '要保存数据吗？',
        confirmText:"确认",
        cancelText:"取消",
        onCancel () {
          localStorage.removeItem('saleReport');
          localStorage.removeItem('SALE_INFO_LIST');
          next()
        },
        onConfirm () {
          localStorage.setItem('saleReport',JSON.stringify({
              saleReportArr:that.arr,
              Aclass:that.Aclass,
              Bclass:that.Bclass,
              time:new Date().getTime()
            })
          );
          localStorage.setItem('SALE_INFO_LIST',JSON.stringify({
            captain:that.helpCaptain,
            governor:that.governor,
            member:that.member
          }));
          next()
        }
      })
    }
      
  }
}
</script>

<style >
.mescroll {
  width: 100%;
  padding-bottom: 50px;
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
  color: #FF2719;
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
.plus_delect{
  color: red;
}
.captain-container{
  width: 100%;
  max-height: 132px;  
  position: absolute;
  overflow-y: scroll;
  background: #fff;
  z-index: 8;
}
.captain-container>.weui-cells{
  margin-top: 0;
  background: #f0f2f5;
}
.caution_inputs>.weui-cells{
  overflow: inherit;
}
.captainHide{
  display: none;
}
.vux-popup-header {
  width: 100%;
}
</style>
