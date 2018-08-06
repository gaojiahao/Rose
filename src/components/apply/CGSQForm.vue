<template>
  <div class="pages">
    <div class="basicPart">
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <!-- 没有选择物料 -->
        <template v-if="!matterList.length">
          <div @click="showMaterielPop = !showMaterielPop">
            <div class="title">物料列表</div>
            <div class="tips">请选择物料</div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
          </div>
        </template>
        <!-- 已经选择了物料 -->
        <template v-else>
          <div class="title">物料列表</div>
          <div class="mater_list">
            <div class="each_mater vux-1px-b" v-for="(item, index) in matterList" :key='index'>
              <swipeout>
                <swipeout-item>
                  <div slot="right-menu">
                    <swipeout-button @click.native="delClick(index,item)" type="warn">删除</swipeout-button>
                  </div>
                  <div class="each_mater_wrapper" slot="content">
                    <div class="mater_img">
                      <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                    </div>
                    <div class="mater_main">
                      <!-- 物料名称 -->
                      <div class="mater_name">
                        <span class="whiNum">No.{{index + 1}}</span>
                        {{item.inventoryName || item.inventoryName_transObjCode}}
                      </div>
                      <!-- 物料基本信息 -->
                      <div class="mater_info">
                        <!-- 物料编码、规格 -->
                        <div class="withColor">
                          <!-- 物料编码 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_code">
                              <span class="title">编码</span>
                              <span class="num">{{item.inventoryCode || item.transObjCode}}</span>
                            </div>
                          </div>
                          <!-- 物料规格 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_spec">
                              <span class="title">规格</span>
                              <span class="num">{{item.specification || item.specification_transObjCode || '无'}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other'>
                        <div class='mater_price'>
                          ￥{{item.price}}
                          <span class='unit' v-if='item.measureUnit'>/{{item.measureUnit}}</span>
                        </div>
                        <div class='mater_num'>
                          <span class='handle' @click="subNum(item,index)" :class='{sub : item.tdQty<=1}'>-</span>
                          <input class='num' type='number' v-model.number='item.tdQty'/>
                          <span class='handle plus' @click='plusNum(item,index)'>+</span>
                        </div>
                          
                      </div>
                    </div>
                  </div>
                </swipeout-item>
              </swipeout>
            </div>
          </div>
        </template>
        <!-- 新增更多 按钮 -->
        <div class="add_more" v-if="matterList.length && !isResubmit" @click="showMaterielPop = !showMaterielPop">新增更多物料</div>
        <!-- 物料popup -->
        <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                         ref="matter"></pop-matter-list>
      </div>
      <!-- 申请说明 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">申请说明</div>
        <textarea class='comment' v-model="applyComment" ></textarea>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{totalAmount}}
      </span>
      <span class="count_btn stop" @click="stopOrder" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn" @click="submitOrder">提交订单</span>
    </div>
  </div>
</template>

<script>
import {Swipeout, SwipeoutItem, SwipeoutButton,TransferDom} from 'vux'
import PopMatterList from 'components/PopMatterList'
import {getBaseInfoData,saveAndStartWf,saveAndCommitTask} from 'service/commonService' 
import { getSOList} from 'service/detailService.js'
import common from 'components/mixins/applyCommon.js'
export default {
  directives: {
    TransferDom
  },
  components:{
    Swipeout, SwipeoutItem, SwipeoutButton,PopMatterList
  },
  data(){
    return{
      listId : '43ccbc27-bbb5-4cfb-997b-6d3823f1c03e',
      matterList:[],                                  // 物料列表
      showMaterielPop:false,                         // 是否显示物料的popup
      count : 0 ,   // 总价
      formData : {
        creator : '',
        modifer : '',
        biId: '',
        biComment : ''
      }, 
      applyComment : '',
      numMap: {},
    }
  },
  computed: {
      // 合计金额
      totalAmount() {
        let total = 0;
        this.matterList.forEach(item=>{
          total += item.tdQty * item.price;
        })
        return total;
      },
    },
  mixins: [common],
  methods:{
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      console.log(sels)
      sels.map(item => {
        if (this.numMap[item.inventoryCode]) {
          item.tdQty = this.numMap[item.inventoryCode].tdQty;
          item.price = this.numMap[item.inventoryCode].price;
        } else {
          item.tdQty = 1;
          item.price = 90;
        }
      })
      this.numMap = {};
      this.matterList = sels;
      // this.getMatPrice();
    },
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/mater01.jpg');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 滑动删除
    delClick(index,item){
      let arr = this.matterList;
      let total = item.tdQty*item.price;
      this.count -= total;
      arr.splice(index, 1);
    },
    //数量--
    subNum(item,i){
      let oldNum = item.tdQty;
      item.tdQty--;
      if(item.tdQty<=0){
        item.tdQty = 1;
      }
      this.$set(this.matterList, i, item);
    },
    //数量++
    plusNum(item,i){
      let oldNum = item.tdQty;
      item.tdQty++;
      this.$set(this.matterList, i, item);
      
    },
    //提价订单
    submitOrder(){
      if(this.matterList.length === 0){
        this.$vux.alert.show({
          content : '请选择物料'
        })
      }
      else{
         this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            let dataSet = [];
            this.matterList.map(item=>{
              dataSet.push({
                tdId : item.tdId || '',
                transObjCode : item.inventoryCode || item.transObjCode, //物料编码
                assMeasureUnit : item.assMeasureUnit ||'个',    //辅助计量
                assMeasureScale :item.assMeasureScale || null,  //与主计量单位倍数
                tdQty : item.tdQty,     //数量
                assistQty : item.assistQty || 0,        //辅计数量
                price : item.price, //单价
                promDeliTime : null, //预期交货日
                comment : this.applyComment               //申请说明
              })
            })
            let wfPara = {
              "PROC_1802_0004":{businessKey:"PAPP",createdBy:""}
            }
            if(this.isResubmit){
              wfPara = {
                businessKey:this.transCode,createdBy:this.formData.handler,transCode:this.transCode,result:3,taskId:this.taskId,comment:""
              }
            }
            let submitData = {
              listId: this.listId,
              biComment : this.biComment,
              formData: JSON.stringify({
                ...this.formData,
                biComment : '',
                order: {
                  dataSet
                }
              }),
              wfPara: JSON.stringify(wfPara)
            }
            //console.log(submitData);
            if(this.isResubmit){
              submitData.biReferenceId = this.biReferenceId;
              this.saveData(saveAndCommitTask,submitData);
              return
            }
            this.saveData(saveAndStartWf,submitData);
          }
         })        
      }      
    },
    // TODO 获取用户基本信息
    getBaseInfoData() {
      getBaseInfoData().then(data => {
        this.formData = {...data,...this.formData};
      })
    },
    //获取订单信息用于重新提交
    async getFormData(){
      await getSOList({
        formViewUniqueId : this.uniqueId,
        transCode : this.transCode
      }).then( (data)=>{
        this.listId = data.listId;
        this.biComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        let {formData} = data;
        formData.order.dataSet.map(item=>{
          item.inventoryPic = item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg();
          this.count += item.price*item.tdQty*100
        })
        this.count = this.count/100;
        //基本信息
        this.formData = {
          handler: formData.handler,
          handlerName : formData.handlerName,
          handlerRole : formData.handlerRole,
          handlerRoleName : formData.handlerRoleName,
          handlerUnit : formData.handlerUnit,
          handlerUnitName : formData.handlerUnitName,
          creator : formData.creator,
          modifer : formData.modifer,

        }
        this.matterList = data.formData.order.dataSet;
      })     
    }
  },
  created(){
  }
}
</script>

<style lang='scss' scoped>
@import './../scss/bizApply';
</style>
