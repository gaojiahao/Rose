<template>
  <div class="pages">
      <h1 class="cp_title">{{value1[0]?value1[0]+'地区':'报表'}}</h1>

      <div class="select_part">
          <group class="each_group"  >
            <popup-picker
                v-for="( item, index ) in arr1"
                class="each_picker"
                :title=item.title 
                :placeholder=item.ph
                :data=item.list
                v-model=item.value
                @on-change="getPickerValue( index , item.value)"
            >
            </popup-picker>
          </group>
            <p class="caution_part" v-if='showMore'>
                您还需要添加新的筛选条件？请点击 <span class="plus_tx" @click="createNew">新增</span>
            </p>
      </div>
        <x-button 
            class="count_button" 
            :gradients="['#B99763', '#E7D0A2']"
            @click.native="goRp"
            v-if='value1[0]'
            >
            确定
        </x-button>
  </div>
</template>

<script>
import { Group, XButton, PopupPicker } from 'vux'
export default {
    components:{
        Group, 
        XButton, 
        PopupPicker
    },
    data(){
        return{
            value1:[],
            whichIndex:'',
            showMore:false,
            arr1:[
                {
                    title:'所在地区',
                    ph:'请选择地区',
                    value:[],
                    list:[['','海南', '广东', '广西', '山西', '福建', '北京', '加州旅馆']]
                }
            ],
            list1: [['','海南', '广东', '广西', '山西', '福建', '北京', '加州旅馆']],
        }
    },
    methods:{
        getPickerValue( index, value ){
            this.showMore = true;
            this.whichIndex = index
            if(index === 0){
                this.value1 = value;
            }
            else if(index===2){
                this.showMore = false;
            }
        },
        createNew(){
            // 新增
            let index = this.whichIndex;
            let newOp1 = {title:'所在部门',ph:'请选择部门',value:[],list:[['','事业部1', '事业部2', '事业部3']]}
            let newOp2 = {title:'所在银行',ph:'请选择地区',value:[],list:[['','中国银行', '中国工商银行', '招商银行', '中国民生银行']]}
            if(index === 0){
                this.arr1.push(newOp1);
                this.showMore = false;
            }
            else if(index===1){
                this.arr1.push(newOp2)
                this.showMore = false;
            }

        },
        goRp(){
            this.$router.push({path:'/Rose/rp'})
        }
    }
}
</script>

<style>
.cp_title {
  width: 100%;
  height: 150px;
  line-height: 150px;
  text-align: center;
  font-size: 50px;
  font-weight: 200;
  color: #CFCFCF;
}
/* 选项框 */
.select_part {
  width: 90%;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.each_group .weui-cells{
  background: -webkit-linear-gradient(left top,rgba(176,140,88,1),rgba(228,201,152,1)); 
}
.each_group .weui-cells .weui-label {
    color: #fff;
    font-weight: 300;    
}
.each_group .weui-cells .vux-popup-picker-placeholder {
    color: #fff;
    font-weight: 300;    
}
.each_group .weui-cells .vux-cell-value {
    color: #fff;
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
    color: #2CC4F8;
}
/* button样式  */
.count_button {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    border-radius: 0;
}
</style>
