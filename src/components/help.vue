<template>
  <div class="pages">
    <div v-if='$route.name=="help"'>
    <div id='mescroll' class="mescroll">
        <group label-align='left' title="请选择支援的地区">
          <popup-picker 
            class="each_part"
            title="所在地区" 
            placeholder="请选择省份"
            :data='areaList'
            v-model="areaValue"
            :columns="1"
            @on-change="getPickerArea">
          </popup-picker>
        </group>

        <group label-align='left' title="请选择支援的银行">
          <popup-picker 
            class="each_part"
            title="所属银行" 
            placeholder="请选择银行"
            :data='bankList'
            v-model="bankValue"
            :columns="1">
          </popup-picker>
        </group>

        <group label-align='left' title="请选择支援队长">
          <popup-picker 
            class="each_part"
            title="支援队长" 
            placeholder="请选择队长"
            :data='teamLeaderList'
            v-model="teamLeaderValue"
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
            @on-change="getPickerValue"
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
            v-if="item.value.length>0"
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


    </div>
    <x-button 
        class="count_button" 
        :gradients="['#B99763', '#E7D0A2']"
        @click.native="end"
        >
          进入合计
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
import { Alert, Group, Cell, Selector, XInput, XButton, Confirm, PopupPicker,querystring,numberComma} from 'vux'
export default {
  components:{
    Cell,
    Group,
    XInput,
    Confirm,
    XButton,
    Selector,
    PopupPicker,
    Alert
  },
  data () {
    return {
      alertEnd:false,
      list: [],
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
      areaList:[],
      areaValue:[],
      bankList:[],
      bankValue:[],
      teamLeaderList:[],
      teamLeaderValue:[],
    }
  },
  filters:{
    numberComma
  },
  methods:{
    //监听选择栏
    getPickerValue(val){
      
    },
    onChange(val){
    },
    createNew(){
      this.arr.push({
        value: [],
        qty:''
      }); //添加新数据
    },
    deleteNew(){
      if(this.arr.length==1){
        this.arr=[
          {
            value: [],
            qty:''
          }
        ]
      }else{
        this.arr.splice(this.arr.length-1,1); //删除新数据
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
      saleRepotService.saleRepotList().then(data=>{
        for(let i = 0 ; i<data.tableContent.length ; i++){
          this.list.push({
            name:data.tableContent[i]['trans_detail_uncalc.transObjCode'],
            value:data.tableContent[i]['trans_detail_uncalc.transObjCode']+'_'+i,
            parent:'0',
          },{
            name:data.tableContent[i]['trans_detail_uncalc.price'],
            value:data.tableContent[i]['trans_detail_uncalc.price'],
            parent:data.tableContent[i]['trans_detail_uncalc.transObjCode']+'_'+i,
          });
        }
      })
    },
    end(){
      var that=this;
    //缓存支援地区
    if(this.areaValue.length==0){
        this.$vux.alert.show({
            title: '失败',
            content: '请选支援地区',
            onShow () {

            },
            onHide () {
            
            }
        })
        return;
    }else if(this.bankValue.length==0){
         this.$vux.alert.show({
            title: '失败',
            content: '请选支援银行',
            onShow () {

            },
            onHide () {
            
            }
        })
        return;
    }else if(this.teamLeaderValue.length==0){
         this.$vux.alert.show({
            title: '失败',
            content: '请选支援队长',
            onShow () {

            },
            onHide () {
            
            }
        })
        return;
    }
    let dept =JSON.parse(localStorage.getItem('ROSE_OPTION')).dept;
    localStorage.setItem('ROSE_OPTION',JSON.stringify({bank:this.bankValue[0],captain:this.teamLeaderValue[0],dept:dept,region:this.areaValue[0]}))
      
      
      var jsonData = {
          "listId": "4bda3e47-a088-4749-a988-ebb07cfb00e4",
          "referenceId":this.guid(),
          "baseinfoExt": {
            "id":this.guid(),
            "varchar1": JSON.parse(localStorage.getItem('ROSE_OPTION')).dept,
            "varchar2": JSON.parse(localStorage.getItem('ROSE_OPTION')).captain,
            "varchar3": JSON.parse(localStorage.getItem('ROSE_OPTION')).region,
            "varchar4": JSON.parse(localStorage.getItem('ROSE_OPTION')).bank,
            },
          "transDetailUncalc": [],
          "transCode": "XHXSDD"
          };
         
          if(this.arr[0].value.length==0){
              this.$vux.alert.show({
                  title: '失败',
                  content: '请选择项目产品',
                  onShow () {

                  },
                  onHide () {
                    
                  }
                })
                return;
            }
          for(let i =0 ;i<this.arr.length ; i++){
            if(this.arr[i].qty==''){
                this.$vux.alert.show({
                  title: '失败',
                  content: '请填写数量',
                  onShow () {

                  },
                  onHide () {
                    
                  }
                })
                return;
              }else{
                jsonData.transDetailUncalc.push({
                  "id":this.guid(),
                  "transObjCode": this.arr[i].value[0].split('_')[0],//项目类产品名称
                  "containerCode": "",//类型
                  "qty": this.arr[i].qty,
                  "amount": this.arr[i].qty*this.arr[i].value[1],//总金额
                  "fgCode": ""
                })
              } 
            }
            if(this.Aclass==''){
              this.$vux.alert.show({
                  title: '失败',
                  content: '请填A类产品',
                  onShow () {

                  },
                  onHide () {
                    
                  }
                })
                return;
            }else if(this.Bclass==''){
              this.$vux.alert.show({
                  title: '失败',
                  content: '请填B类产品',
                  onShow () {

                  },
                  onHide () {
                    
                  }
                })
                return;
            }else{
              jsonData.transDetailUncalc.push({
                "id":this.guid(),
                "transObjCode": "A类产品",//项目类产品名称
                "containerCode": "A",//类型
                "qty": '',
                "amount": this.Aclass,//总金额
                "fgCode": ""
              },{
                "id":this.guid(),
                "transObjCode": "B类产品",//项目类产品名称
                "containerCode": "B",//类型
                "qty": '',
                "amount": this.Bclass,//总金额
                "fgCode": ""
              })
          }
         let totalInfo={
            'isMobile':true,
            'conn':20000,
            'list':'trans_form_data',
            'transCode':'XHXSDD',
            'jsonData':JSON.stringify(jsonData)
          }
          this.totalInfo=totalInfo;
          localStorage.setItem('saleReportInfo',JSON.stringify({saleReportRemark:totalInfo,time:new Date().getTime()}))
          localStorage.setItem('saleReport',JSON.stringify({saleReportArr:this.arr,Aclass:this.Aclass,Bclass:this.Bclass,time:new Date().getTime()}))
          that.$router.push({path:'/count'});
    },
    Ainput(e){
      this.Aclass=e.split(',').join('');
    },
    Binput(e){
       this.Bclass=e.split(',').join('');
    },
    letMeTest(){
      let path = this.$router.path;
    },
    //获取区域
    getArea(){
        optionService.getRegion().then(data=>{
            for(let i = 0 ;i<data.length; i++){
                this.areaList.push({
                    name:data[i].name,
                    value:data[i].name,
                })
            }
        })
    },
    //获取部门
    getBank(){
        optionService.getBank().then(data=>{
            for(let i = 0 ; i<data.tableContent.length ;i++){
                data.tableContent[i].name=data.tableContent[i].groupName;
                data.tableContent[i].value=data.tableContent[i].groupName;
            }
            this.bankList=data.tableContent;
        })
    },
    //获取队长
    teamLeader(){
         optionService.getCaptain().then(data=>{
             for(let i = 0 ; i<data.tableContent.length ;i++){
                data.tableContent[i].name=data.tableContent[i].nickname;
                data.tableContent[i].value=data.tableContent[i].nickname;
            }
            this.teamLeaderList=data.tableContent;
         })
    },
    getPickerArea(e){
        
    },
  },
  created(){
    // this.letMeTest();
  },
  mounted(){
   this.getArea();
   this.getBank();
   this.teamLeader();
    if(localStorage.getItem('saleReport')){
      this.arr=JSON.parse(localStorage.getItem('saleReport')).saleReportArr;
      this.Aclass=JSON.parse(localStorage.getItem('saleReport')).Aclass;
      this.Bclass=JSON.parse(localStorage.getItem('saleReport')).Bclass;
    }
    if(localStorage.getItem('ROSE_OPTION')){
        this.areaValue=[JSON.parse(localStorage.getItem('ROSE_OPTION')).region];
        this.bankValue=[JSON.parse(localStorage.getItem('ROSE_OPTION')).bank];
        this.teamLeaderValue=[JSON.parse(localStorage.getItem('ROSE_OPTION')).captain];
    }
   this.listData();
   this.mescroll = new MeScroll("mescroll",{
        up:{
          isBounce:false,
          use:false,
          auto:false
        },
        down:{
          use:false,
          auto:false,
          isLock:false
			  }
      
      }
    )	
      // this.$event.$on('show',()=>{
      //   console.log('我接收到值了')
      // })
  },
  beforeRouteLeave(to,from,next){
    var that=this;
    if(that.arr[0].value.length==0||to.name=='Count'){
       next()
    }else{
      this.$vux.confirm.show({
        title: '温馨提示',
        content: '要保存数据吗？',
        confirmText:"确认",
        cancelText:"取消",
        onShow () {
        },
        onHide () {
          
        },
        onCancel () {
          localStorage.removeItem('saleReport');
          next()
        },
        onConfirm () {
            localStorage.setItem('saleReport',JSON.stringify({saleReportArr:that.arr,Aclass:that.Aclass,Bclass:that.Bclass,time:new Date().getTime()}))
          next()
        }
    })
    }
      
  },
  computed:{

  },
}
</script>

<style scoped>
.mescroll {
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
.count_button {
  position: fixed;
  bottom: 0;
  left: 0;
  border-radius: 0;
  z-index: 99;
}
.plus_delect{
  color: red;
}
</style>
