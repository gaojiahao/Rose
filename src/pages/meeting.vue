<template>
  <div class="pages">
    <h1 class="m_title">
      会议立项
      <span class="m_user" @click="goMylist">
        我的提交
        <x-icon class="right_arrow" type="ios-arrow-forward" size="16"></x-icon>
      </span>
    </h1>
    <div class="m_main">
      <div class="m_main_part">
        <!--<group title="请填写会议安排明细">
          <datetime v-model="minuteListValue" format="YYYY-MM-DD" :minute-list="['00', '15', '30', '45']"
                    title="时间段"></datetime>
          <x-input
            :title='item'
            :key="index"
            text-align='right'
            v-for="(item, index) in meetList"
          ></x-input>
        </group>
        <group title="费用合计">
          <cell title="金额合计" value='￥1,000'></cell>
        </group>-->
        <group v-for="(item, index) in config" :title="item.title" :key="index"
               v-show="item.xtype !== 'r2Fileupload' && !item.hiddenInRun">
          <dynamic-form :config="item.items" :user-info="userInfo" :current-user="currentUser"
                        @addlistener="addListener"
                        ref="dynamicForm"></dynamic-form>
        </group>
      </div>
    </div>
    <div class="m_btm vux-1px-t">
      <span class="count_part">合计:￥1,000</span>
      <span class="m_button" @click="goflow">确定</span>
    </div>
    <!-- 提示 -->
    <toast v-model="showToast" type="text" :text='toastText' is-show-mask position="middle" width='auto'></toast>
  </div>

</template>

<script>
  import {Cell, Group, XInput, Datetime, Toast} from 'vux'
  import createService from './../service/createService'
  import DynamicForm from './components/DynamicForm'

  export default {
    components: {
      DynamicForm,
      Cell,
      Group,
      XInput,
      Datetime,
      Toast
    },
    data() {
      return {
        uniqueId: '',
        listid: '',
        minuteListValue: '',
        meetList: ['省份', '城市', '酒店名称', '住宿均价', '房间数量', '总人数', '场地费用合计', '路费合计', '餐饮合计'],
        showToast: false, // 是否展示toast
        toastText: '', // 警告提示
        config: [],
        userInfo: {}, // 当前用户信息
        currentUser: {}, // 当前用户信息
      }
    },
    methods: {
      // TODO 生成随机串
      guid() {
        let S4 = () => {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
      },
      goMylist() { //我的提交
        this.$router.push({path: '/myList'})
      },
      goflow() {
        let warn = '';
        let jsonData = {
          listId: this.listid,
          referenceId: this.guid(),
          transCode: '',
        };
        let dynamicForm = this.$refs.dynamicForm;
        dynamicForm.every(item => {
          item.checkData();
        });
        if (warn) {
          this.showToastText(warn);
          return
        }
        dynamicForm.forEach(item => {
          let saveData = item.getSaveData();
          console.log(saveData);
          Object.entries(saveData).forEach(([key, value]) => {
            // 若已有该键值，则合并
            if (jsonData[key]) {
              Object.assign(jsonData[key], value);
            } else {
              jsonData[key] = value;
            }
          });
        });
        console.log('-------------')
        console.log(jsonData)
        /*createService.saveData({
          entityId: this.userInfo.entityId,
          transCode: '',
          jsonData: JSON.stringify(jsonData),
          wfPara: JSON.stringify({
            [this.procCode]: {
              businessKey: this.submitTransCode,
            }
          })
        }).then(data => {
          this.showLoading = false;
          // 从返回数据获取表单编码
          let matchCode = data.message.match(/【(.)+】/gi);
          this.transCode = matchCode ? matchCode[0].replace(/[【】]/g, '') : '';
          // 提交编码为null则说明提交失败
          if (this.transCode.indexOf('null') === -1) {
            this.showToastText('提交成功');
          } else {
            this.showToastText('提交失败');
          }
        }).catch(e => {
          this.showToastText(e.message);
        })*/

        // this.$router.push({path: '/flow'})
      },
      // TODO 显示错误提示
      showToastText(test = '') {
        this.showToast = true;
        this.toastText = test;
      },
      // TODO 获取节点
      getProcess() {
        createService.getProcess({
          listId: this.listid
        }).then(data => {
          this.procCode = data[0] && data[0].procCode || '';
        }).catch(e => {
          this.showToastText(e.message);
        });
      },
      // TODO 获取配置数据
      getConfig() {
        createService.getConfig({
          uniqueId: this.uniqueId
        }).then(data => {
          this.showLoading = false;
          let config = data[0] && JSON.parse(data[0].config || "{}") || {};
          console.log(config);
          this.config = config.items;
        }).catch(e => {
          this.showToastText(e.message);
        })
      },
      // TODO 添加监听
      addListener(params) {
        let {type, lIndex, index, userEvent} = params;
        // console.log('addlistener')
        let item = this.config[lIndex].items[index];
        if (!item.listeners) {
          item.listeners = {};
        }
        item.listeners[type] = userEvent;
      },
    },
    created() {
      let query = this.$route.query;
      this.uniqueId = query.view;
      this.listid = query.list;
      (async () => {
        // this.getProcess();
        await createService.getUser().then(data => {
          this.userInfo = data;
        });
        await createService.getCurrentUser(this.userInfo.nickname).then(data => {
          this.currentUser = data.tableContent[0] || {};
        });
        this.getConfig();
      })()
    }
  }
</script>

<style lang='scss' scoped>
  .m_title { //标题
    width: 100%;
    height: 120px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077AA;
    position: relative;
    .m_user {
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

  .m_main {
    width: 90%;
    max-width: 600px;
    position: absolute;
    top: 90px;
    left: 50%;
    transform: translate(-50%, 0);
    border-radius: 4px;
    z-index: 100;
    padding-bottom: 56px;
    .m_main_part {
      background: #fff;
      margin-top: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px #e8e8e8;
    }
  }

  .m_btm {
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
    .count_part {
      flex: 2.5;
      background: #fff;
      color: #000;
      display: inline-block;
      text-align: center;
      font-weight: bold;
    }
    .m_button {
      flex: 1;
      color: #fff;
      background: #5077AA;
      display: inline-block;
      text-align: center;
    }
  }

</style>
