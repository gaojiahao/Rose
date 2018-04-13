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
            :data="list0"
            v-model="value4"
            :columns="2"
            @on-change="getPickerValue"
            show-name
          >
          </popup-picker>

          <cell 
            class="each_part"
            title="单价"
            :value="value4[1]"
            value-align="right" 
            v-if="value4.length>0"
          ></cell>

          <x-input 
            title="数量" 
            type="number" 
            text-align="right" 
            placeholder="请输入数量"
            v-if="value4.length>0"
            v-model="pro_num"
          ></x-input>
        </group>

        <p class="caution_part" v-if='value4.length>0'>
          您还需要添加新的项目？请点击 <span class="plus_tx" @click="createNew">新增</span>
        </p>
        
        <group>
          <x-input 
          title="A类产品" 
          type="number" 
          text-align="right" 
          placeholder="请输入金额"
          ></x-input>

          <x-input 
          title="B类产品" 
          type="number" 
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
      arr:['1'],//通过数据修改来增加节点
      value4:[],
      show:false,
      list0: [
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
        parent: '黄金999'
      }, {
        name: '¥1000',
        value: '足金888',
        parent: '足金888'
      }],      
      showNumber:false,
      showNewDiv:false,
      mescroll: null,
      pro_num:'',
      status:[1,2,3,4,5]
    }
  },
  methods:{
    //监听选择栏
    getPickerValue(val){
      console.log(this.value4[1]);
      // console.log($refs.picker3);
    },
    onChange(val){
      this.pro_num = '' //修改样式之后 数量输入框为空
    },
    createNew(){
      this.arr.push(1); //添加新数据
    },
    deleteNew(){
      this.arr.splice(0,1); //删除新数据
    },

    /*
     *  进入合计页面 
     */
    goCount(){
      console.log('我要进入合计页面了')
      this.$router.push({path:'/saleReport/count'})
    },
    letMeTest(){
      let path = this.$router.path;
      console.log(path);
    }
  },
  created(){
    // this.letMeTest();
    console.log('当前页面是销售预报模块')
  },
  mounted(){
      
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
</style>
