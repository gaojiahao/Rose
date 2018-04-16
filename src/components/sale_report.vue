<template>
  <div class="pages">
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
            :value="item.value[1]"
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
          <span>或</span>
          <span class="plus_delect" @click="deleteNew">删除</span>
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
        @click.native="goCount"
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
      <router-view></router-view>
  </div>
</template>

<script>
import saleRepotService from '../service/saleRepotService'
import { Group, Cell, Selector, XInput, XButton, Confirm, PopupPicker} from 'vux'
export default {
  components:{
    Cell,
    Group,
    XInput,
    Confirm,
    XButton,
    Selector,
    PopupPicker
  },
  data () {
    return {
      show:false,
      list: [
      {
        name: '黄金999',
        value: '黄金999',
        parent: 0
      }, {
        name: '足金888',
        value: '足金888',
        parent: 0
      }, {
        name: '¥999',
        value: '¥999',
        parent: '黄金999',
      }, {
        name: '¥1000',
        value: '￥888',
        parent: '足金888',
      }],
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
      saleRepotService.saleRepotList();
    },
    end(){
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
          "transDetailUncalc": [{
            "id":this.guid(),
            "transObjCode": "0欧元足球纪念钞-伊朗",//项目类产品名称
            "containerCode": "存货类型",//类型
            "qty": 33,
            "amount": 1089,//总金额
            "fgCode": ""
          }],
          "transCode": "XHXSDD"
          };
      saleRepotService.subAmount({
        'isMobile':true,
        'conn':20000,
        'list':'trans_form_data',
        'transCode':'XHXSDD',
        jsonData:JSON.stringify(jsonData)
      })
    },
    /*
     *  进入合计页面 
     */
    goCount(){
      this.$router.push({path:'/saleReport/count'})
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
   this.end();
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
