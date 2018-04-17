<template>
  <div class="pages">
    <div v-if='$route.name=="saleReport"'>
    <div id='mescroll' class="mescroll">

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
            :value="item.value[1] | numberComma"
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
         v-model.number="Aclass"
          text-align="right" 
          placeholder="请输入金额"
          ></x-input>

          <x-input 
          title="B类产品" 
          v-model.number="Bclass" 
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
    <confirm 
        v-model="show"
        title="提示" 
        content="退出本页面之前，是否要保存提交的数据？"
        confirm-text="保存"
        cancel-text="不用"
    ></confirm>
      <alert></alert>
      </div>
      <router-view></router-view>
  </div>
</template>

<script>
import saleRepotService from '../service/saleRepotService'
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
      show:false,
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
            name:data.tableContent[i]['baseinfo.creatorName'],
            value:data.tableContent[i]['baseinfo.creatorName']+'_'+i,
            parent:'0',
          },{
            name:data.tableContent[i]['trans_detail_uncalc.price'],
            value:data.tableContent[i]['trans_detail_uncalc.price'],
            parent:data.tableContent[i]['baseinfo.creatorName']+'_'+i,
          });
        }
      })
    },
    end(){
      var that=this;
      var jsonData = {
          "listId": "4bda3e47-a088-4749-a988-ebb07cfb00e4",
          "referenceId":this.guid(),
          "baseinfoExt": {
            "id":this.guid(),
            "varchar1": "事业部",
            "varchar2": "部门",
            "varchar3": "省",
            "varchar4": "银行",
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
      saleRepotService.subAmount(querystring.stringify({
        'isMobile':true,
        'conn':20000,
        'list':'trans_form_data',
        'transCode':'XHXSDD',
        'jsonData':JSON.stringify(jsonData)
      })).then(data=>{
        if(data.success){
         this.$vux.alert.show({
            title: '成功',
            content: data.message,
            onShow () {

            },
            onHide () {
              that.$router.push({path:'/saleReport/count'})
            }
          })
        }else{
           this.$vux.alert.show({
            title: '失败',
            content: data.message,
            onShow () {

            },
            onHide () {
              
            }
          })
        }
      })
    },
    alertGo(){
     
    },
    letMeTest(){
      let path = this.$router.path;
    }
  },
  created(){
    // this.letMeTest();
  },
  mounted(){
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
      
      })	
      // this.$event.$on('show',()=>{
      //   console.log('我接收到值了')
      // })
  },
  watch: {
     $route (e) {
       console.log(e)
     }
}
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
