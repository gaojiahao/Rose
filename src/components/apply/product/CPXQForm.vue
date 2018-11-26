<template>
  <div class='childPage'>
    <div class="content" ref="fill">
      <div class="wrapper">
        <!-- <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo> -->
        <!-- <r-picker title="经办人:" :data="listData" :value="formData.handlerName"
                  @on-change="handlerChange" v-model="formData.handlerName" required></r-picker> -->
        <div class='mater_property'>
          <div class='each_property vux-1px-b' @click="showPop = true">
            <label class="required">经办人:</label>
            <!-- <input type='text' v-model="formData.handlerName" class='property_val'/> -->
            <div class="property_val handler">
              <span>{{formData.handlerName}}</span>
              <span class="iconfont icon-gengduo"></span>
            </div>
          </div>
        </div>
        <r-picker title="经办组织:" :data="groupList" :value="formData.handlerUnitName"
                  @on-change="groupChange" v-model="formData.handlerUnitName" required></r-picker>
        <r-picker title="经办职位:" :data="roleList" :value="formData.handlerRoleName"
                  @on-change="roleChange" v-model="formData.handlerRoleName" ></r-picker>
        <r-picker title="流程状态:" :data="statusList" :value="formData.processStatus"
                  v-model="formData.processStatus" ></r-picker>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">标题:</label>
            <input type='text' v-model.trim="formData.demandTitle" class='property_val'/>
            <div></div>
          </div>
        </div>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">描述:</label>
            <input type='text' v-model.trim="formData.demandDescribe" class='property_val'/>
          </div>
        </div>
        <r-picker title="大类:" :data="typeList" :value="formData.demandType"
                  @on-change="typeChange" v-model="formData.demandType" required></r-picker>
        <r-picker title="子类:" :data="subList" :value="formData.demandSubclass"
                  v-model="formData.demandSubclass" required></r-picker>
        <div class='mater_property' @click="getDate">
          <div class='each_property vux-1px-b'>
            <label class="required">规划:</label>
            <div class='property_val'>{{formData.demandPlan}}</div>
          </div>
        </div>
        <r-picker title="按期信心指数:" :data="confidenceList" :value="formData.timeConfidenceIndex"
                  v-model="formData.timeConfidenceIndex" required></r-picker>
        <r-picker title="被授权团队:" :data="authorizedList" :value="formData.authorizedTeam"
                  v-model="formData.authorizedTeam"></r-picker>
        <r-picker title="版本:" :data="versionList" :value="formData.demandVersion"
                  v-model="formData.demandVersion"></r-picker>
        <upload-file :default-value="attachment" @on-upload="onUploadFile" :contain-style="uploadStyle"></upload-file>
        <div v-transfer-dom>
          <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
            <div class="trade_pop">
              <div class="title">
                <!-- 搜索栏 -->
                <d-search @search='searchList' @turn-off="onHide" :isFill='true'></d-search>
              </div>
              <!-- 经理列表 -->
              <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                        :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
                <div class="pop-mater-list-item box_sd" v-for="(item, index) in listData" :key='index'
                    @click.stop="selThis(item,index)">
                  <div class="pop-list-main ">
                    <div class="pop-list-info">
                      <!--联系人电话 -->
                      <div class="withColor">
                        <div class="ForInline name" style="display:inline-block">
                          <span>{{item.nickname}}</span>
                        </div>
                      </div>
                      <div class="withColor" v-if="item.dealerMobilePhone">
                        <div class="ForInline " style="display:inline-block">
                          <span class='creator'>{{item.dealerMobilePhone}}</span>
                        </div>
                      </div>
                      <!-- 地址 -->
                      <!-- <div class="withoutColor">
                        <span>{{item.province}}{{item.city}}{{item.county}}{{item.address}}</span>
                      </div> -->
                    </div>
                  </div>
                  <!-- icon -->
                  <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
                </div>
              </r-scroll>
            </div>
          </popup>
        </div>
      </div>
    </div>
    <div class='btn vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  // vux 引入
  import { Popup, TransferDom } from 'vux'
  import RPicker from 'components/RPicker';
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RScroll from 'components/RScroll'
  import DSearch from 'components/search'
  // 请求 引入
  import {
    submitAndCalc,
    updateAndCalc,
    saveAndStartWf,
    saveAndCommitTask,
    getDictByType,
    getDictByValue
  } from 'service/commonService'
  import { getAuthorizedList } from 'service/listService'
  import { getSOList } from 'service/detailService'
  import { listUsers, getGroupByUserId, getRoleByUserId } from 'service/commonService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  const DRAFT_KEY = 'CPXQ_DATA';
  export default {
    name: 'ApplyCPXQForm',
    data() {
      return {
        listId: 'b30f4d3e-b23d-11e8-96a5-005056a136d0',
        typeList: [],
        subList: [],
        statusList: [],
        confidenceList: [],
        authorizedList: [],
        versionList: [],
        formViewUniqueId: 'b018ef18-f0d1-41a8-985e-29de19e6b705',
        formData: {
          biId: '',
          demandTitle: '', // 标题
          demandDescribe: '', // 描述
          demandType: '', // 大类
          demandSubclass: '', // 子类
          demandPlan: '', // 规划
          processStatus: '', // 流程状态
          timeConfidenceIndex: '', // 按期信息指数
          authorizedTeam: '', // 被授权团队
          demandVersion: '', // 版本
          biComment: '', // 备注
        },
        hasDefault: false,
        biReferenceId: '',
        uploadStyle : {
          width : '100%',
          padding : '0.05rem 0.08rem',
          margin : '0 auto'
        },
        limit: 50,
        page: 1,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: {}, // 哪些被选中了
        listData: [], // 经办人列表
        groupList: [], // 组织列表
        roleList: [], // 职位列表
      }
    },
    mixins: [ApplyCommon],
    directives: {TransferDom},
    components: {
      RPicker, PopBaseinfo, Popup, RScroll, DSearch
    },
    methods: {
      // TODO 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            this.$refs.bScroll.refresh();
          }
        })
      },
      // TODO 弹窗隐藏时调用
      onHide() {
        this.showPop = false;
      },
      // TODO 搜索仓库
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getlistUsers();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getlistUsers();
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.userId === sItem.userId;
      },
      // TODO 选择物料
      selThis (sItem, sIndex) {
        this.showPop = false;
        this.selItems = sItem;
        this.formData.handler = sItem.userId;
        this.formData.handlerName = sItem.nickname;
        this.getGroupByUserId();
        this.getRoleByUserId();
      },
      // TODO 请求部门
      getGroupByUserId(){
        return getGroupByUserId(this.formData.handler).then(({tableContent = []}) => {
          this.groupList = []
          tableContent.forEach(item=>{
            this.groupList.push({
              ...item,
              name: item.userGroupName,
              value: item.userGroupName,
            })
          })
          if(tableContent.length){
            this.formData.handlerUnitName = tableContent[0].groupName;
            this.formData.handlerUnit = tableContent[0].userGroupId;
          }
        })
      },
      // TODO 请求职位
      getRoleByUserId() {
        return getRoleByUserId(this.formData.handler).then(({tableContent = []}) => {
          this.roleList = [];
          tableContent.forEach(item=>{
            this.roleList.push({
              ...item,
              name: item.userGroupName,
              value: item.userGroupName,
            })

          })
          if(tableContent.length){
            this.formData.handlerRoleName = tableContent[0].userGroupName;
            this.formData.handlerRole = tableContent[0].userGroupId;
          }
        })

      },
      // TODO 获取仓库列表
      getlistUsers() {
        // console.log()
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'nickname',
            }];
        }
        return listUsers({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 选择组织
      groupChange(val) {
        console.log(val);
        this.groupList && this.groupList.forEach( item => {
          if (item.name === val) {
            this.formData.handlerUnit = item.userGroupId;
            return false;
          }
        })

      },
      // 选择职位
      roleChange(val) {
        console.log(val);
        this.roleList && this.roleList.forEach( item => {
          if (item.name === val) {
            this.formData.handlerRole = item.userGroupId;
            return false;
          }
        })
      },
      // TODO 提交/修改物料
      save () {
        let requiredMap = {
          demandTitle: '标题',
          demandDescribe: '描述',
          demandType: '大类',
          demandSubclass: '子类',
          demandPlan: '规划',
          processStatus: '流程状态',
          timeConfidenceIndex: '按期信息指数',
        };
        for (let key in this.formData) {
          if (typeof(this.formData[key]) === 'string' && this.formData[key].indexOf(' ') >= 0) {
            this.formData[key] = this.formData[key].replace(/\s/g, '');
          }
        }

        let warn = '';
        !warn && Object.entries(requiredMap).every(([key, msg]) => {
          if (!this.formData[key]) {
            warn = `${msg}不能为空`;
            return false;
          }
          return true;
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }

        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = submitAndCalc;
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify({
                handlerEntity: this.entity.dealerName,
                ...this.formData
              }),
            };

            if (this.transCode) {
              operation = updateAndCalc;
              submitData.biReferenceId = this.biReferenceId;
            }
            if (this.biReferenceId) {
              submitData.biReferenceId = this.biReferenceId
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 设置规划时间
      getDate () {
        this.$vux.datetime.show({
          confirmText: '确定',
          cancelText: '取消',
          value: this.formData.demandPlan,
          onConfirm: (value) => {
            this.formData.demandPlan = value;
          }
        })
      },
      // TODO 获取用户数据
      getFormData () {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then(data => {
          let {success = true, formData = {}, biReferenceId = ''} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          this.attachment = data.attachment
          this.hasDefault = true;
          this.biReferenceId = biReferenceId;
          this.formData = {
            ...this.formData,
            ...formData
          };

          this.$loading.hide();
        })
      },
      // TODO 请求大类、流程状态、信心指数列表数据
      getDictByType (type = 'bigType', key = 'typeList') {
        return getDictByType(type).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.value = item.name;
          });
          this[key] = tableContent;
        })
      },
      // TODO 获取子类列表
      getSubList () {
        let matched = this.typeList.find(item => item.value === this.formData.demandType);
        return getDictByValue(matched.type).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.value = item.name;
          });
          this.subList = tableContent;

          // 回写时不设置默认值
          if (this.hasDefault) {
            this.hasDefault = false;
            return
          }
          let [first = {}] = tableContent;
          this.formData.demandSubclass = first.value;
        }).catch(e => {
          this.hasDefault = false;
        })
      },
      // TODO 获取授权团队列表
      getAuthorizedList () {
        return getAuthorizedList().then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.name = item.groupName;
            item.value = item.groupName;
          });
          this.authorizedList = tableContent;
        })
      },
      // TODO 大类切换
      typeChange () {
        this.subList = [];
        this.getSubList()
      },
      // TODO 请求picker数据
      initRequest () {
        let promises = [];
        promises.push(this.getDictByType('bigType', 'typeList'));
        promises.push(this.getDictByType('processStatus', 'statusList'));
        promises.push(this.getDictByType('timeConfidenceIndex', 'confidenceList'));
        promises.push(this.getDictByType('demandVersion', 'versionList'));
        promises.push(this.getAuthorizedList());
        return Promise.all(promises);
      },
      // TODO 是否保存草稿
      hasDraftData () {
        let formData = this.formData;
        if (formData.demandTitle || formData.demandDescribe || formData.demandType || formData.processStatus || formData.timeConfidenceIndex) {
          return {
            [DRAFT_KEY]: {
              formData: this.formData,
            }
          };
        }

      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        this.formData = JSON.parse(data).formData;
        sessionStorage.removeItem(DRAFT_KEY);
      }
      this.getlistUsers();
      this.getGroupByUserId();
      this.getRoleByUserId();
    },
  }
</script>

<style lang="scss" scoped>
  .pages {
    background: #fff;
    z-index: 10;
  }

  .childPage {
    height: 100%;
  }

  .vux-1px-b:after, .vux-1px-l:before {
    border-color: #e8e8e8;
    color: #e8e8e8;
  }

  .content {
    height: 90%;
    overflow: hidden;
    .mater_baseinfo {
      display: flex;
      align-items: flex-end;
      .mater_property {
        flex: 1;
      }
    }
    .each_property {
      padding: 0.05rem 0.08rem;
      label {
        color: #6d6d6d;
        font-size: 0.12rem;
        display: block;
        line-height: 0.2rem;
      }
      .required {
        color: #5077aa;
        font-weight: bold;
      }
      .property_val {
        display: block;
        width: 100%;
        min-height: .24rem;
        line-height: 0.24rem;
        border: none;
        outline: none;
        font-size: 0.16rem;
        &.handler{
          line-height: 0.38rem;
          .icon-gengduo{
            font-size: 0.24rem;
            float: right;
          }
        }
      }
      .readonly {
        color: #999;
      }
    }
  }

  // 确定
  .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: fixed;
    background: #fff;
    .cfm_btn {
      top: 50%;
      left: 50%;
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      border-radius: .4rem;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 5px #5077aa;
    }
    &.btn_hide {
      display: none;
    }
  }
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      height: 100%;
      overflow: hidden;
      // 顶部
      .title {
        position: relative;
        margin: .08rem 0;
        font-size: .2rem;
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      // 列表容器
      .pop-list-container {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /deep/ .scroll-wrapper {
          padding: .04rem .04rem 0 .3rem;
        }
        // 列表项
        .pop-mater-list-item {
          position: relative;
          display: flex;
          padding: 0.08rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          // 列表主体
          .pop-list-main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 物料信息
            .pop-list-info {
              color: #757575;
              font-size: .14rem;
              // 有颜色包裹的
              .withColor {
                margin-top: .04rem;
                .name {
                  color: #5077aa;
                  font-size: .14rem;
                  font-weight: bold;
                }
                .creator {
                  color: #111;
                  font-weight: bold;
                }
              }
            }
          }
          // 选择icon
          .selIcon,
          .isSelIcon {
            top: 50%;
            left: -.3rem;
            position: absolute;
            transform: translate(0, -50%);
          }
          .isSelIcon {
            fill: #5077aa;
          }
        }
      }

    }
  }
</style>
