<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 物料列表 -->
        <div class="materiel_list">
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
            <div class="title" @click="showDelete">
              <div>物料列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}"
                  v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                            @click.native="delClick(index,item)">
                  <template slot="info" slot-scope="{item}">
                    <!-- 物料属性和单位 -->
                    <div class="mater_more">
                        <span class="processing">属性：{{item.processing}}</span>
                        <span class='unit'>单位：{{item.measureUnit}}</span>
                        <span class='mater_color'>颜色：{{item.inventoryColor || '无'}}</span>
                    </div>
                    <!-- 物料数量和价格 -->
                    <div class='mater_other' v-if="item.tdQty">                      
                      <div class='current_num'>
                        数量：{{item.tdQty}}
                      </div>                  
                    </div>
                  </template>
                  <template slot="edit" slot-scope="{item}">
                    <div class='mater_other' @click="modifyMatter(item,index)" v-if="!item.tdQty && !matterModifyClass">
                      <div class="edit-tips" >点击进行填写</div>
                    </div>
                  </template>
                </matter-item>
                <div class='delete_icon' @click="delClick(index,item)" v-if='matterModifyClass'>
                  <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                  <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                </div>          
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                          :default-value="matterList" :params="matterParams"
                          ref="matter"></pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' 
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input title="数量" type="number"  v-model.number='modifyMatter.tdQty' text-align="right" 
              @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入">
            </x-input> 
          </template>
        </pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="biComment" placeholder="备注"></x-textarea>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn-no-amt vux-1px-t' :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <div class="btn-item" @click="submitOrder">提交</div>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : btnIsHide}" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline' v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='delete_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
// vux插件引入
import {Group,XInput,XTextarea} from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import {getBaseInfoData,saveAndStartWf,saveAndCommitTask,submitAndCalc} from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/PopMatterList'
import PopMatter from 'components/apply/commonPart/MatterPop'
// 方法引入
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'
export default {
  components:{
   PopMatterList,XTextarea,Group,XInput,PopMatter
  },
  data(){
    return{
      listId : '4099b5aa-1468-4b81-85a5-75079e291977',
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
      taxRate: 0, // 税率
      matterParams: {
        processing: '半成品,成品,商品,服务'
      }
    }
  },
  mixins: [common],
  computed: {
    totalNum() {
      let total = 0;
      this.matterList.forEach(item => {
        total = accAdd(total, item.tdQty);
      });
      return Number(total);
    }
  },
  watch:{
    matterList(val){
      let data = {
        CGSQ_DATA:{
          matter : this.matterList,
        }
      }
      this.$emit('sel-data',data)
    }
  },
  methods:{
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      sels.map(item => {
        if (this.numMap[item.inventoryCode]) {
          item.tdQty = this.numMap[item.inventoryCode].tdQty;
          item.price = this.numMap[item.inventoryCode].price;
        } else {
          item.tdQty = '';
          item.price = '';
        }
      })
      this.numMap = {};
      this.matterList = sels;
      // this.getMatPrice();
    },
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 滑动删除
    delClick(index, sItem) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // TODO 判断是否展示选中图标
    showSelIcon(sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
    },
    //全选
    checkAll(){
      if(this.selItems.length === this.matterList.length){
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    //删除选中的
    deleteCheckd(){
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          this.selItems.forEach(item=>{
            let index = this.matterList.findIndex(item2=>item2.inventoryCode === item.inventoryCode);
            if(index >= 0){
              this.matterList.splice(index,1);
            }
          })
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })

    },
    // TODO 新增更多物料
    addMatter() {
      for (let item of this.matterList) {
        // 存储已输入的价格
        this.numMap[item.inventoryCode] = {
          tdQty: item.tdQty,
          price: item.price
        };
      }
      this.showMaterielPop = !this.showMaterielPop;
    },
    //提价订单
    submitOrder(){
      let warn = '';
      let dataSet = [];
      if (this.matterList.length === 0) {
        warn = '请选择物料';
      }
      if (!warn) {
        // 校验
        this.matterList.every(item => {
          // if (!item.price) {
          //   warn = '单价不能为空';
          //   return false
          // }
          // if (!item.tdQty) {
          //   warn = '数量不能为空';
          //   return false
          // }
          // 设置提交参数
          dataSet.push({
            tdId : item.tdId || '',
            inventoryName_transObjCode : item.inventoryName, //物料名称
            transObjCode : item.inventoryCode, //物料编码
            tdProcessing :item.processing, //加工属性
            assMeasureUnit : item.assMeasureUnit || null,    //辅助计量
            assMeasureScale :item.assMeasureScale || null,  //与主计量单位倍数
            assistQty : item.assistQty || 0,        //辅计数量
            tdQty : item.tdQty,     //数量
            comment : item.comment || '',//申请说明
          });
          return true
        })
      }
      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return
      }
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let operation = saveAndStartWf;
          let wfPara = {
            [this.processCode]: {businessKey: "BKSO", createdBy: ""}
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
              handlerEntity: this.entity.dealerName,
              order: {
                dataSet
              }
            }),
            wfPara: JSON.stringify(wfPara)
          }
          //console.log(submitData);
          //重新提交
          if(this.isResubmit){
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
          }
          //无工作流
          if(!this.processCode.length){
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          this.saveData(operation,submitData);
        }
      })
    },
    //获取订单信息用于重新提交
    async getFormData(){
      await getSOList({
        formViewUniqueId : this.uniqueId,
        transCode : this.transCode
      }).then( (data)=>{
        this.listId = data.listId;
        this.applyComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        this.biComment = data.biComment;
        let {formData} = data;
        formData.order.dataSet.map(item=>{
          item = {
            ...item,
            inventoryPic : item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
            inventoryType: item.inventoryType_transObjCode,
            inventorySubclass: item.inventorySubclass_transObjCode,
          }
          this.matterList.push(item);
        })
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
          biId: formData.biId,
          biComment: formData.biComment,
        }
        this.$loading.hide();
      })
    }
  },
  created(){
    let data = sessionStorage.getItem('CGSQ_DATA');
    if(data){
      this.matterList = JSON.parse(data).matter;
    }
  },
}
</script>

<style lang='scss' scoped>
@import './../../scss/bizApply';
  .mater_other {
    .current_num{
      color: #111;
      font-size: .14rem;
      font-weight: bold;
      span{
        color: #757575;
        font-size: .1rem;
      }
    }
  }
</style>
