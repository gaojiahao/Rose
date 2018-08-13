<template>
  <div class="pages">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide form">
          <h1 class="s_title">
              市场宣传
            </h1>
            <div class="s_main">
              <div class="s_main_part" v-for="(item, index) in listData" :key='index'>
                <group :title="lItem.title" v-for="(lItem, lIndex) in item" :key="lIndex">
                  <cell v-for="(val, idx) in lItem.items" :title="val.title" :value="val.value" :key="idx"
                        primary="content"></cell>
                </group>
              </div>
            </div>
        </div>
        <flow-detail class="swiper-slide" :work-flow="workFlow"></flow-detail>
      </div>
    </div>
    <task-confirm :show="showConfirm" v-model="showConfirm" :can-empty="result === 1"
     @on-confirm="confirm"></task-confirm>
    <!-- 审批按钮 -->
    <r-action :actions="actions" @on-action="showConfirmPop"></r-action>
  </div>
</template>

<script>
import {
  Cell,
  Group,
  XInput,
  PopupPicker,
  XTextarea,
  numberComma,
  Toast
} from "vux";
import spreadService from "../../service/spreadService";
import createService from "../../service/createService";
import { setTimeout } from "timers";
import FlowDetail from "./../components/FlowDetail";
import TaskConfirm from "./../components/TaskConfirm";
import detail from "./../mixins/detail";
export default {
  mixins: [detail],
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
  filters: {
    numberComma
  },
  data() {
    return {
      showConfirm: false, // 是否展示原因弹窗
      result: 0,
      transCode: this.$route.query.transCode,
      canSubmit: this.$route.query.canSubmit,
      listObj: [
        {
          title: "请填写项目名称",
          items: [
            {
              title: "项目名称",
              key: "projectName",
              value: ""
            }
          ]
        },
        {
          title: "请填写市场宣传",
          items: [
            {
              title: "市场宣传",
              key: "productMarketing",
              value: ""
            }
          ]
        },
        {
          title: "请选择您申请的类型",
          items: [
            {
              title: "宣品类型",
              key: "publicityType",
              value: ""
            }
          ]
        },
        {
          title: "请填写明细",
          items: [
            {
              title: "单价",
              key: "agoraPrice",
              value: ""
            },
            {
              title: "数量",
              key: "agoraNumber",
              value: ""
            },
            {
              title: "合计",
              key: "total",
              value: ""
            }
          ]
        },
        {
          title: "费用所属",
          items: [
            {
              title: "费用所属事业部",
              key: "agoraCostBU",
              value: ""
            },
            {
              title: "费用所属部门",
              key: "agoraCostDepartment",
              value: ""
            },
            // {
            //   title: "核算归属省份",
            //   key: "agoraCheckProvince",
            //   value: ""
            // },
            // {
            //   title: "费用所属银行",
            //   key: "agoraCostBank",
            //   value: ""
            // }
          ]
        },
        {
          title: "要说点什么吗？",
          items: [
            {
              title: "说明",
              key: "comment",
              value: ""
            }
          ]
        }
      ],
      listData: []
    };
  },
  methods: {
    //获取数据
    restoreJsonData(jsonData){
      let arrData = jsonData.transDetailUncalc;
      arrData.forEach((val,idx) => {
        let formData = {
          projectName:val.var1,      //项目名称
          productMarketing:val.var2.value, //市场宣传
          publicityType:val.var3.value,    //宣品类型
          agoraPrice: val.num1,      //单价
          agoraNumber:val.num2,      //数量
          total:val.num3,            //总价
          agoraCostBU:val.var4.value,      //费用所属事业部
          agoraCostDepartment:val.var5.value,   //费用所属部门
          comment: val.comment          //说明
        }
        this.listData.push(JSON.stringify(this.listObj));
        this.listData[idx] = JSON.parse(this.listData[idx]);
        this.listData[idx].forEach(lItem => {
            lItem.items.forEach(item => {
              item.value = formData[item.key];
            })
        });
      });
    },
    //审批弹窗
    endToast(taskId, data) {
      createService
        .examineTask(taskId, data)
        .then(res => {
          if (res.success) {
            this.$vux.toast.show({
              text: res.message,
              position: "middle",
              type: "text",
              onShow:()=> {
                setTimeout(() => {
                  this.$vux.toast.hide();
                  this.$router.go(-1);
                }, 800);
              }
            });
          }
        })
        .catch(c => {
          this.$vux.toast.show({
            text: c.message,
            position: "middle",
            type: "text",
            onShow:() => {
              setTimeout(() => {
                this.$vux.toast.hide();
              }, 800);
            }
          });
        });
    },
    //审批
    end(num) {
      this.showConfirm = true;
      //拒绝
      if (num == 0) {
        this.result = 0;
      } else if (num == 1) {
        //同意
        this.result = 1;
      }
    },
    //确定
    confirm(reason) {
      let taskId = this.$route.query.taskId,
        transCode = this.$route.query.transCode,
        data = { result: this.result, transCode: transCode, comment: reason };
      if (this.result === 0 && !reason) {
        this.$vux.toast.show({
          text: "拒绝理由不能为空",
          type: "text",
          position: "middle"
        });
        return;
      } else {
        this.endToast(taskId, data);
      }
    }
  },
  created() {

  }
};
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

.s_title {
  //标题
  width: 100%;
  height: 80px;
  line-height: 80px;
  font-size: 34px;
  text-align: center;
  color: #fff;
  font-weight: 200;
  background: #5077aa;
  position: relative;
  .s_user {
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

.s_main {
  width: 90%;
  max-width: 600px;
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translate(-50%, 0);
  border-radius: 4px;
  z-index: 100;
  padding-bottom: 56px;
  .s_main_part {
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
    .plus_delate {
      color: red;
    }
  }
}

.s_btm {
  width: 100%;
  height: 44px;
  line-height: 44px;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 101;
  margin-top: 20px;
  box-sizing: border-box;
  background: #fff;
  display: flex;
  span:first-child {
    background: #ccc;
  }
  .count_part {
    flex: 2.5;
    color: #000;
    display: inline-block;
    text-align: center;
    font-weight: bold;
  }
  .s_button {
    flex: 1;
    color: #fff;
    background: #5077aa;
    display: inline-block;
    text-align: center;
  }
}
</style>
