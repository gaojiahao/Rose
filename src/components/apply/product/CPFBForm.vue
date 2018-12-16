<template>
  <div class='pages cpfb-apply-container'>
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo"
                         :defaultContact="contactInfo"></pop-dealer-list>
        <div class="materiel_list">
          <div class="mater_list">
            <div class="each_mater">
              <div class="userInp_mode">
                <div class="title">发布信息</div>
                <group class="CP_group" @group-title-margin-top="0">
                  <x-input title="标题" text-align='right' v-model="formData.launchTitle"
                           placeholder='请填写'>
                    <template slot="label">
                      <span class='required'>标题
                      </span>
                    </template>
                  </x-input>
                  <!-- <r-picker title="类型:" mode='2' :data="launchTypeList" :value="formData.launchType"
                            v-model="formData.launchType" required></r-picker> -->
                  <popup-picker title="类型" :data="launchTypeList" v-model="selectedType"
                                placeholder="请选择" @on-change='isSelectType'>
                    <template slot="title">
                      <span class="required">类型</span>
                    </template>
                  </popup-picker>
                  <x-textarea title="描述" v-model="formData.launchDescribe" :max="200"></x-textarea>
                  <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
                </group>
              </div>
            </div>
          </div>
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
  import { Group, XInput, Popup, XTextarea, PopupPicker } from 'vux'
  import RPicker from 'components/RPicker';
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopDealerList from 'components/Popup/PopDealerList'
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
        selectedType: [],
        authorizedList: [],
        versionList: [],
        formViewUniqueId: 'b018ef18-f0d1-41a8-985e-29de19e6b705',
        formData: {
          biId: '', 
          biComment: '', // 备注
          launchType: '', // 类型
          launchTitle: '', // 标题
          launchDescribe: '', // 描述
          biProcessStatus: '', // 流程状态
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
        dealerInfo: {},
        contactInfo: {}
      }
    },
    mixins: [ApplyCommon],
    // directives: {TransferDom},
    components: {
      Group, Popup, XInput, XTextarea, 
      RPicker, DSearch, RScroll, PopupPicker,
      PopBaseinfo, PopDealerList
    },
    methods: {
      // 选择联系人
      selContact(val) {
        this.contactInfo = {...val};
      },    
      // 选择客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.formData.launchDealerCode = this.dealerInfo.dealerCode;
      },
      // 选择类型
      isSelectType(val) {
        this.formData.launchType = val[0];
      }, 
      // 提交/修改物料
      save() {
        let requiredMap = {
          launchDealerCode: '客户',
          launchTitle: '标题',
          launchType: '类型',
          launchDescribe: '描述',
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
            let formData = this.formData,
                dealerInfo = {
                  launchDealerCode: this.dealerInfo.dealerCode,  // 往来编码
                  address_launchDealerCode: this.dealerInfo.address, // 往来地址
                  launchDealerLabel: this.dealerInfo.dealerLabelName,  // 往来关系标签
                  dealerName_launchDealerCode: this.dealerInfo.dealerName, // 往来名称
                },
                contactInfo = {
                  dealerDebitContactPersonName: this.contactInfo.dealerName, // 往来联系人 名称
                  dealerDebitContactInformation: this.contactInfo.dealerMobilePhone // 往来联系人 信息 (不敢相信PC这里存的是电话)
                },
                operation = this.processCode.length ? saveAndStartWf : submitAndCalc;
            
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify({
                handlerEntity: this.entity.dealerName,
                ...formData,
                ...dealerInfo,
                ...contactInfo
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
      // 重新提交时 读取数据
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
      // 请求产品类型
      getProductType() {
        return getDictByType('productRelease').then(({tableContent = []}) => {
          let TypeList = [];
          for(let item of tableContent) {
            TypeList.push(item.name);
          }
          this.launchTypeList.push(TypeList);   
        })
      },
      // 是否保存草稿
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
      this.getProductType();
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
