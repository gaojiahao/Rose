<template>
  <div class="pages">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide form">
          <h1 class="a_title">
            固定资产
          </h1>
          <div class="a_main">
            <div class="a_main_part" v-for="(item,index) in listData" :key="index">
              <group :title="lItem.title" v-for="(lItem, lIndex) in item" :key="lIndex">
                <cell v-for="(val, idx) in lItem.items" :title="val.title" :value="val.value" :key="idx"
                      primary="content"></cell>
              </group>
            </div>
          </div>
        </div>
        <flow-detail class="swiper-slide" :trans-code="transCode"></flow-detail>
      </div>
    </div>
     <task-confirm :show="showConfirm" v-model="showConfirm" :can-empty="result === 1"
     @on-confirm="confirm"></task-confirm>
     <div class="s_btm vux-1px-t" v-if="canSubmit == '1'">
      <span class="s_button" @click="end(0)">拒绝</span>
      <span class="s_button" @click="end(1)">同意</span>
    </div>
  </div>

</template>

<script>
  import {Cell, Group, XInput, PopupPicker, XTextarea, numberComma, Toast } from 'vux'
  import createService from "../../service/createService";
  import Swiper from 'swiper'
  import FlowDetail from './../components/FlowDetail'
  import TaskConfirm from './../components/TaskConfirm'
  import detail from './../mixins/detail'
  export default {
    components: {
      Cell,
      Group,
      XInput,
      PopupPicker,
      XTextarea,
      Toast,
      FlowDetail,
      TaskConfirm
    },
    filters:{
      numberComma
    },
    data() {
      return {
        showConfirm: false, // 是否展示原因弹窗
        result: 0,
        transCode: this.$route.query.transCode,
        canSubmit: this.$route.query.canSubmit,
        pageSwiper: null,
        listObj:[
          {
            title: '请选择资产类型',
            items: [
              {
                title: '资产类型',
                key: 'assetType',
                value: '',
              }
            ]
          }, {
            title: '请填写资产型号/规格',
            items: [
              {
                title: '资产型号/规格',
                key: 'assetModel',
                value: '',
              }
            ]
          }, {
            title: '请选择计量单位',
            items: [
              {
                title: '计量单位',
                key: 'meteringUnit',
                value: '',
              },
            ]
          }, {
            title: '请填写明细',
            items: [
              {
                title: '单价',
                key: 'assetPrice',
                value: '',
              },{
                title: '数量',
                key: 'assetNumber',
                value: '',
              },{
                title: '合计',
                key: 'assetCostTotal',
                value: '',
              },
            ]
          }, {
            title: '请填写部门',
            items: [
              {
                title: '申请部门',
                key: 'applyDepartment',
                value: '',
              },{
                title: '使用部门',
                key: 'useDepartment',
                value: '',
              }
            ]
          }, {
            title: '费用所属',
            items: [
              {
                title: '费用所属事业部',
                key: 'assetCostBU',
                value: '',
              },{
                title: '费用所属部门',
                key: 'assetCostDepartment',
                value: '',
              },{
                title: '核算归属省份',
                key: 'assetCheckProvince',
                value: '',
              },{
                title: '费用所属银行',
                key: 'assetCostBank',
                value: '',
              }
            ]
          }, {
            title: '要说点什么吗？',
            items: [
              {
                title: '说明',
                key: 'comment',
                value: '',
              }
            ]
          }
        ],
        listData: [],
      }
    },
    methods: {
      //审批弹窗
      endToast(taskId,data){
        let that = this;
        createService.examineTask(taskId,data).then( res=> {
          if(res.success){
            that.$vux.toast.show({
              text: res.message,
              position: 'middle',
              type: 'text',
              onShow () {
                setTimeout(function(){
                  that.$vux.toast.hide();
                  that.$router.go(-1);
                },800)
              },
            });
          }
        }).catch( c =>{
          that.$vux.toast.show({
              text: c.message,
              position: 'middle',
              type: 'text',
              onShow () {
                setTimeout(function(){
                  that.$vux.toast.hide()
                },800)
              },
            });
        })
      },
      //审批
      end(num){
        this.showConfirm = true;
        //拒绝
        if( num == 0 ){
          this.result = 0;
        }else if( num == 1 ){
          //同意
          this.result = 1;
        }
      },
      //确定
      confirm(reason) {
        let that = this,
        taskId = that.$route.query.taskId,
        transCode = that.$route.query.transCode,
        data = {"result": this.result, "transCode": transCode, "comment": reason};
        if (this.result === 0 && !reason) {
          this.$vux.toast.show({
            text: '拒绝理由不能为空',
            type:'text',
            position: 'middle'
          });
          return
        }else{
          that.endToast(taskId,data);
        }
      },
    },
    created(){
      this.$nextTick(() => {
        this.pageSwiper = new Swiper ('.swiper-container', {});
      })
    },
    mounted(){
    },
    computed: {
      totalCost() {
        let {assetPrice = 0, assetNumber = 0} = this.formData;
        return `￥${numberComma(Number(assetPrice) * Number(assetNumber))}`;
      }
    },
    mixins: [detail],
  }
</script>

<style lang='scss' scoped>
  .pages {
    .swiper-container {
        height: 100%;
        .form {
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
  }
  .a_title { //标题
    width: 100%;
    height: 80px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077AA;
    position: relative;
    .a_user {
      line-height: initial;
      font-size: 16px;
      font-weight: normal;
      position: absolute;
      left: 50%;
      bottom: 20%;
      transform: translate(-50%);
      display: flex;
      align-items: center;
      .right_arrow {
        fill: #fff;
      }
    }
  }

  .a_main {
    width: 90%;
    max-width: 600px;
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translate(-50%, 0);
    border-radius: 4px;
    z-index: 100;
    padding-bottom: 56px;
    .a_main_part {
      background: #fff;
      margin-top: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px #e8e8e8;
    }
    .note_tx {
      width: 100%;
      margin-top: 6px;
      text-align: center;
      font-size: 12px;
      .plus_tx {
        color: #5077aa;
      }
      .plus_delate{
        color: red;
      }
    }
  }

  .a_btm {
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 101;
    margin-top: 20px;
    box-sizing: border-box;
    display: flex;
    span:first-child{
      background: #ccc;
    }
    .count_part {
      flex: 2.5;
      background: #fff;
      color: #000;
      display: inline-block;
      text-align: center;
      font-weight: bold;
    }
    .a_button {
      flex: 1;
      color: #fff;
      background: #5077AA;
      display: inline-block;
      text-align: center;
    }
  }
  .s_btm{
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 101;
    margin-top: 20px;
    box-sizing: border-box;
    text-align: center;
    display: flex;
    color: #fff;
    span:first-child{
      background: #ccc;
      flex-grow: 1;
      -webkit-flex-grow: 1;
    }
    span:last-child{
      background: #5077AA;
      flex-grow: 1;
      -webkit-flex-grow: 1;
    }
  }
</style>
