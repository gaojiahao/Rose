<template>
  <div class='pages cpfb-apply-container'>
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <div class="materiel_list">
          <div class="mater_list">
            <div class="each_mater">
              <div class="userInp_mode">
                <div class="title">发布信息</div>
                <group class="CP_group" @group-title-margin-top="0">
                  <!-- 商机标题 -->
                  <x-input title="商机标题" text-align='right' v-model="formData.launchTitle"
                           placeholder='请填写'>
                    <template slot="label">
                      <span class='required'>商机标题
                      </span>
                    </template>
                  </x-input>
                  <!-- 预期销售额 -->
                  <x-input title="预期销售额" type="number" text-align='right' placeholder='请填写'
                           @on-blur="checkAmt" v-model.number="formData.tdAmount">
                    <template slot="label">
                      <span class='required'>预期销售额
                      </span>
                    </template>
                  </x-input>
                  <!-- <r-picker title="类型:" mode='2' :data="launchTypeList" :value="formData.launchType"
                            v-model="formData.launchType" required></r-picker> -->
                  <!-- <popup-picker title="类型" :data="launchTypeList" v-model="formData.launchType"
                                placeholder="请选择" ></popup-picker> -->
                  <x-textarea title="描述" v-model="formData.launchDescribe" :max="200"></x-textarea>
                  <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
                </group>
              </div>
            </div>
          </div>
        </div>
        
        
        
        
        
        
        
        <!-- <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">标题:</label>
            <input type='text' v-model.trim="formData.launchTitle" class='property_val'/>
            <div></div>
          </div>
        </div>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">描述:</label>
            <input type='text' v-model.trim="formData.launchDescribe" class='property_val'/>
          </div>
        </div>
        <r-picker title="类型:" :data="launchTypeList" :value="formData.launchType"
                  v-model="formData.launchType" required></r-picker>
        <upload-file :default-value="attachment" @on-upload="onUploadFile"></upload-file>
         -->
        <!-- <div v-transfer-dom>
          <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
            <div class="trade_pop">
              <div class="title">
                <d-search @search='searchList' @turn-off="onHide" :isFill='true'></d-search>
              </div>
              <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                        :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
                <div class="pop-mater-list-item box_sd" v-for="(item, index) in listData" :key='index'
                     @click.stop="selThis(item,index)">
                  <div class="pop-list-main ">
                    <div class="pop-list-info">
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
                    </div>
                  </div>
                  <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
                </div>
              </r-scroll>
            </div>
          </popup>
        </div> -->
      </div>
    </div>
    <div class='btn vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  // vux 引入
  import { Group, XInput, Popup, XTextarea, PopupPicker } from 'vux'
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
  } from 'service/commonService'
  import {getSOList} from 'service/detailService'
  import {listUsers, getGroupByUserId, getRoleByUserId} from 'service/commonService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'

  const DRAFT_KEY = 'CPFB_DATA';
  export default {
    name: 'ApplyCPFBForm',
    data() {
      return {
        listId: 'eb8a01a3-7a74-439b-bc44-8d58cbfa6166',
        typeList: [],
        subList: [],
        statusList: [],
        launchTypeList: [],
        authorizedList: [],
        versionList: [],
        formViewUniqueId: 'b018ef18-f0d1-41a8-985e-29de19e6b705',
        formData: {
          launchTitle: '', // 标题
          launchDescribe: '', // 描述
          biProcessStatus: '', // 流程状态
          launchType: '', // 类型
          biComment: '', // 备注
        },
        hasDefault: false,
        biReferenceId: '',
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
    // directives: {TransferDom},
    components: {
      Group, Popup, XInput, XTextarea, DSearch,
      RPicker, PopBaseinfo, RScroll, PopupPicker
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
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = sItem;
        this.formData.handler = sItem.userId;
        this.formData.handlerName = sItem.nickname;
        this.getGroupByUserId();
        this.getRoleByUserId();
      },
      // TODO 请求部门
      getGroupByUserId() {
        return getGroupByUserId(this.formData.handler).then(({tableContent = []}) => {
          this.groupList = []
          tableContent.forEach(item => {
            this.groupList.push({
              ...item,
              name: item.userGroupName,
              value: item.userGroupName,
            })
          })
          if (tableContent.length) {
            this.formData.handlerUnitName = tableContent[0].groupName;
            this.formData.handlerUnit = tableContent[0].userGroupId;
          }
        })
      },
      // TODO 请求职位
      getRoleByUserId() {
        this.roleList = [];
        return getRoleByUserId(this.formData.handler).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            this.roleList.push({
              ...item,
              name: item.userGroupName,
              value: item.userGroupName,
            })
          })
          if (tableContent.length) {
            this.formData.handlerRoleName = tableContent[0].userGroupName;
            this.formData.handlerRole = tableContent[0].userGroupId;
          }
        })

      },
      // TODO 获取用户列表
      getlistUsers() {
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
            this.$refs.bScroll && this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 选择组织
      groupChange(val) {
        this.groupList && this.groupList.forEach(item => {
          if (item.name === val) {
            this.formData.handlerUnit = item.userGroupId;
            return false;
          }
        })
      },
      // 选择职位
      roleChange(val) {
        this.roleList && this.roleList.forEach(item => {
          if (item.name === val) {
            this.formData.handlerRole = item.userGroupId;
            return false;
          }
        })
      },
      // TODO 提交/修改物料
      save() {
        let requiredMap = {
          launchTitle: '标题',
          launchDescribe: '描述',
          launchType: '类型',
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
            let formData = this.formData;
            let operation = this.processCode.length ? saveAndStartWf : submitAndCalc;
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify({
                handlerEntity: this.entity.dealerName,
                ...formData
              }),
              wfPara: JSON.stringify({
                [this.processCode]: {
                  businessKey: 'RELS',
                  createdBy: formData.creator,
                }
              }),
            };

            if (this.transCode) {
              operation = this.processCode.length ? saveAndCommitTask : updateAndCalc;
              submitData.biReferenceId = this.biReferenceId;
              submitData.wfPara = JSON.stringify({
                businessKey: this.transCode,
                createdBy: formData.creator,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ''
              });
            }
            // 无工作流
            if (!this.processCode.length) {
              delete submitData.wfPara;
              delete submitData.biReferenceId;
            }
            if (this.biReferenceId) {
              submitData.biReferenceId = this.biReferenceId
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 设置规划时间
      getDate() {
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
      getFormData() {
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
          this.attachment = data.attachment;
          this.hasDefault = true;
          this.biReferenceId = biReferenceId;
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };          
          this.formData = {
            ...this.formData,
            ...formData,
            ...this.handlerDefault
          };

          this.$loading.hide();
        })
      },
      // 请求
      getDictByType(type = 'bigType', key = 'typeList') {
        return getDictByType(type).then(({tableContent = []}) => {
          console.log('tableContent:', tableContent);
          tableContent.forEach(item => {
            item.value = item.name;
          });
          this[key] = tableContent;
        })
      },
      // TODO 请求picker数据
      initRequest() {
        let promises = [];
        promises.push(this.getDictByType('productRelease', 'launchTypeList'));
        return Promise.all(promises);
      },
      // TODO 是否保存草稿
      hasDraftData() {
        let draftList = ['biProcessStatus', 'launchTitle', 'launchDescribe', 'launchType'];
        let formData = this.formData;
        let isRecord = false;
        draftList.every((item) => {
          if (formData[item]) {
            isRecord = true;
            return false
          }
          return true
        }, true);
        if (isRecord) {
          return {
            [DRAFT_KEY]: {
              formData: this.formData,
            }
          };
        }

      },
    },
    created() {
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
  @import './../../scss/bizApply.scss';
  .cpfb-apply-container {
    .CP_group {

      /deep/ > .vux-label {
        color: #5077aa;
        font-weight: bold;
      }
      /deep/ > .vux-no-group-title {
        margin-top: 0.08rem;
      }
      /deep/> .weui-cells {
        font-size: .16rem;
        .vux-tap-active {
          .vux-label {
            color: #5077aa;
            font-weight: bold;
          }
        }
        &:after {
          border-bottom: none;
        }
      }
      .vux-cell-box {
        &:before{
          left: 0;
        }
        /deep/ >.weui-cell {
          padding: 10px 0;
        }
      }
    }
    .weui-cell {
      padding: 10px 0;

      &:before {
        left: 0;
      }
    }

  }
  // .cpfb-apply-container {
  //   height: 100%;
  //   .upload-file-container {
  //     width: 100%;
  //     padding: .05rem .08rem;
  //     margin: 0 auto;
  //   }
  // }

  // .vux-1px-b:after, .vux-1px-l:before {
  //   border-color: #e8e8e8;
  //   color: #e8e8e8;
  // }

  // .content {
  //   height: 90%;
  //   overflow: hidden;
  //   .mater_baseinfo {
  //     display: flex;
  //     align-items: flex-end;
  //     .mater_property {
  //       flex: 1;
  //     }
  //   }
  //   .each_property {
  //     padding: 0.05rem 0.08rem;
  //     label {
  //       color: #6d6d6d;
  //       font-size: 0.12rem;
  //       display: block;
  //       line-height: 0.2rem;
  //     }
  //     .required {
  //       color: #5077aa;
  //       font-weight: bold;
  //     }
  //     .property_val {
  //       display: block;
  //       width: 100%;
  //       min-height: .24rem;
  //       line-height: 0.24rem;
  //       border: none;
  //       outline: none;
  //       font-size: 0.16rem;
  //       &.handler {
  //         line-height: 0.38rem;
  //         .icon-gengduo {
  //           font-size: 0.24rem;
  //           float: right;
  //         }
  //       }
  //     }
  //     .readonly {
  //       color: #999;
  //     }
  //   }
  // }

  // // 确定
  // .btn {
  //   left: 0;
  //   bottom: 0;
  //   width: 100%;
  //   height: 10%;
  //   position: fixed;
  //   background: #fff;
  //   .cfm_btn {
  //     top: 50%;
  //     left: 50%;
  //     width: 2.8rem;
  //     color: #fff;
  //     height: .44rem;
  //     line-height: .44rem;
  //     position: absolute;
  //     text-align: center;
  //     background: #5077aa;
  //     border-radius: .4rem;
  //     transform: translate(-50%, -50%);
  //     box-shadow: 0 2px 5px #5077aa;
  //   }
  //   &.btn_hide {
  //     display: none;
  //   }
  // }

  // // 弹出层
  // .trade_pop_part {
  //   background: #fff;
  //   .trade_pop {
  //     padding: 0 .08rem;
  //     height: 100%;
  //     overflow: hidden;
  //     // 顶部
  //     .title {
  //       position: relative;
  //       margin: .08rem 0;
  //       font-size: .2rem;
  //     }
  //     .each_mode {
  //       margin-right: .1rem;
  //       display: inline-block;
  //       padding: .04rem .2rem;
  //     }
  //     // 列表容器
  //     .pop-list-container {
  //       width: 100%;
  //       overflow: hidden;
  //       box-sizing: border-box;
  //       height: calc(100% - .46rem);
  //       /deep/ .scroll-wrapper {
  //         padding: .04rem .04rem 0 .3rem;
  //       }
  //       // 列表项
  //       .pop-mater-list-item {
  //         position: relative;
  //         display: flex;
  //         padding: 0.08rem;
  //         margin-bottom: .2rem;
  //         box-sizing: border-box;
  //         // 阴影
  //         &.box_sd {
  //           box-sizing: border-box;
  //           box-shadow: 0 0 8px #e8e8e8;
  //         }
  //         // 列表主体
  //         .pop-list-main {
  //           flex: 1;
  //           padding-left: .1rem;
  //           box-sizing: border-box;
  //           display: inline-block;
  //           // 物料信息
  //           .pop-list-info {
  //             color: #757575;
  //             font-size: .14rem;
  //             // 有颜色包裹的
  //             .withColor {
  //               margin-top: .04rem;
  //               .name {
  //                 color: #5077aa;
  //                 font-size: .14rem;
  //                 font-weight: bold;
  //               }
  //               .creator {
  //                 color: #111;
  //                 font-weight: bold;
  //               }
  //             }
  //           }
  //         }
  //         // 选择icon
  //         .selIcon,
  //         .isSelIcon {
  //           top: 50%;
  //           left: -.3rem;
  //           position: absolute;
  //           transform: translate(0, -50%);
  //         }
  //         .isSelIcon {
  //           fill: #5077aa;
  //         }
  //       }
  //     }

  //   }
  // }
</style>
