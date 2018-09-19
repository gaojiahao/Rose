<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
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
            <div class="title" @click="showDelete">
              <div>物料列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{mater_delete : matterModifyClass}" v-for="(item, index) in matterList" :key='index'>
                <div class="each_mater_wrapper" @click="delClick(index,item)">
                  <div class="mater_img">
                    <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                  </div>
                  <div class="mater_main">
                    <!-- 物料名称 -->
                    <div class="mater_name">
                      {{item.inventoryName}}
                      <span class="symbol">[{{item.processing}}]</span>
                    </div>
                    <!-- 物料基本信息 -->
                    <div class="mater_info">
                      <!-- 物料编码、规格 -->
                      <div class="withColor">
                        <!-- 物料编码 -->
                        <div class="ForInline" style="display:inline-block">
                          <div class="mater_code">
                            <span class="title">编码</span>
                            <span class="num">{{item.inventoryCode}}</span>
                          </div>
                        </div>
                        <!-- 物料规格 -->
                        <div class="ForInline" style="display:inline-block">
                          <div class="mater_spec">
                            <span class="title">规格</span>
                            <span class="num">{{item.specification || '无'}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- 物料数量和价格 -->
                    <div class='mater_others'>
                      <div class="mater_type">
                        <span>大类: {{item.inventoryType || "无" }}</span>
                        <span>子类: {{item.inventorySubclass}}</span>
                      </div>
                      <div class='mater_price'>
                        <span class='unit'>计量单位: {{item.measureUnit || "无"}}</span>
                        <span class='color'>颜色: {{item.inventoryColor || "无"}}</span>
                      </div>
                    </div>
                  </div>
                  <div class='delete_icon' v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>

                </div>
                <!-- 物料输入内容 -->
                <div class="userInp_mode">
                  <group>
                    <x-input type="number" title="估计单价" text-align='right' placeholder='请填写'
                             @on-blur="checkAmt(item)" v-model.number="item.price"></x-input>
                  </group>
                  <group>
                    <x-input type="number" title="数量" text-align='right' placeholder='请填写'
                             @on-blur="checkAmt(item)" v-model.number="item.tdQty"></x-input>
                  </group>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <!-- <div class="add_more" v-if="matterList.length && !isResubmit" @click="addMatter">新增更多物料</div> -->
          <div class="handle_part" v-if="matterList.length">
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
        <!-- 申请说明 -->
        <!--<div class="materiel_list mg_auto box_sd">
          <div class="title">备注</div>
          <textarea class='comment' v-model="formData.biComment" placeholder="请输入"></textarea>
        </div>-->
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" v-if="!matterModifyClass">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount | numberComma(3)}}
      </span>
      <!-- <span class="count_btn stop" @click="stopOrder" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span> -->
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" v-else>
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
import {Swipeout, SwipeoutItem, SwipeoutButton,TransferDom,Group,XInput} from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import {getBaseInfoData,saveAndStartWf,saveAndCommitTask,submitAndCalc} from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/PopMatterList'
// 方法引入
import {toFixed} from '@/plugins/calc'
import {accMul} from '@/home/pages/maps/decimalsAdd'

export default {
  directives: {
    TransferDom
  },
  components:{
    Swipeout, SwipeoutItem, SwipeoutButton, PopMatterList,Group,XInput
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
      taxRate: 0, // 税率
      matterParams: {
        processing: '成品,商品,服务,原料,半成品'
      }
    }
  },
  mixins: [common],
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
    //数量--
    subNum(item,i){
      if(item.tdQty === 1) return
      item.tdQty--;
      this.$set(this.matterList, i, item);
    },
    //数量++
    plusNum(item,i){
      let oldNum = item.tdQty;
      item.tdQty++;
      this.$set(this.matterList, i, item);

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
          if (!item.price) {
            warn = '单价不能为空';
            return false
          }
          if (!item.tdQty) {
            warn = '数量不能为空';
            return false
          }
          // 设置提交参数
          dataSet.push({
            tdId : item.tdId || '',
            transObjCode : item.inventoryCode, //物料编码
            assMeasureUnit : item.assMeasureUnit ||'个',    //辅助计量
            assMeasureScale :item.assMeasureScale || null,  //与主计量单位倍数
            tdProcessing :item.processing, //加工属性
            tdQty : item.tdQty,     //数量
            assistQty : item.assistQty || 0,        //辅计数量
            price : item.price, //单价
            promDeliTime : item.promDeliTime || null, //预期交货日
            comment : item.comment || '',               //申请说明
            tdAmount: accMul(item.price, item.tdQty), // 合计
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
            [this.processCode]: {businessKey: "PAPP", createdBy: ""}
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
        let {formData} = data;
        formData.order.dataSet.map(item=>{
          item = {
            ...item,
            inventoryPic : item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
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
@import './../scss/bizApply';
.pages {
  /deep/ .vux-no-group-title{
    margin-top:0;
  }
    /deep/ .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
      }
    }
}
.mater_others {
  .mater_type,
  .mater_price {
    height: .18rem;
    line-height: .18rem;
  }
  span {
    font-size: .1rem;
    color: #757575;
    margin-right: 0.04rem;
  }
}
</style>
