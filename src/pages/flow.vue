<template>
    <div class="pages">
        <h1 class="f_title">
            确定工作流
        </h1>
        <div class="f_main">
            <group title="请填写对应的信息">
                <x-input 
                :title='item'
                :key="index"
                text-align='right' 
                v-for="(item, index) in level_list"
                ></x-input>
                <cell title="总裁" value='王珏'></cell>
            </group>
            <div class="f_flow">
                <group title="流程图">
                    
                </group>
                <flow orientation="vertical" style="height:300px;float:left;padding:10px 20px">
                    <flow-state state="1" title="省长" is-done></flow-state>
                    <flow-line tip="进行中" tip-direction='right'></flow-line>
                    <flow-state state="2">
                        <span slot="title">常委</span>        
                    </flow-state>
                    <flow-line></flow-line>
                    <flow-state state="3" title="副总"></flow-state>
                    <flow-line></flow-line>
                    <flow-state state="4" title="财务"></flow-state>
                    <flow-line :line-span="30"></flow-line>
                    <flow-state state="5" title="总裁——王珏"></flow-state>
                </flow>
            </div>
        </div>
        <div class="f_button">确定</div>
    </div>
</template>

<script>
import { Flow, Cell, Group, XInput, FlowState, FlowLine } from "vux";
export default {
  components: {
    Flow,
    Cell,
    Group,
    XInput,
    FlowLine,
    FlowState
  },
  data() {
    return {
      level_list:['常委','副总','财务']
    };
  }
};
</script>

<style lang='scss' scoped>
.f_title {
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
.f_main {
    width: 90%;
    max-width: 600px;
    position: absolute;
    background: #fff;
    top: 70px;
    left: 50%;
    transform: translate(-50%, 0);
    border-radius: 4px;
    z-index: 100;
    box-shadow: 0 2px 10px #e8e8e8;
    padding-bottom:56px; 

}
.f_button {
    width: 100%;
    height: 44px;
    line-height: 44px;
    text-align: center;
    background: #5077aa;
    color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 100;
}
</style>
