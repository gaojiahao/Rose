import {
  isMyflow,
  getListId,
  getSOList,
  listTaskLogByTransCode,
  getWorkFlowByListId,
  getFromStatus,
  getAppExampleDetails
} from "service/detailService";
import { 
  commitTask, 
  transferTask, 
  WebContext, 
  undoDataByTransCodes, 
  archiveDataByTransCodes, 
  switchToEffectiveByTransCodes,
  getFormViews,
} from 'service/commonService'
import { TransferDom, Popup, Flexbox, FlexboxItem} from 'vux'

export default {
    data() {
      return {
        // workflowLogs:[],
        // formStatus: [],
        showUserList: false, // 是否展示用户列表
        selectedUser: {}, // 选中的转办用户
        showConfirm: false,
        transferInfo: {
          comment: '', // 备注
        },
        showCommentWarn: false,
        actions: [],
        listInfo: {},
        appAction: {},//应用权限
        showFlow: false,
        showOperate: false,
        isDiscuss: false,
        isTaskLog: false,
        hasComment: true, // 是否展示底部评论栏
        isConcernisConcern : 0, // 是否关注，0 未关注，1已关注
        isConcern:0,
      }

    },
    components:{
      TransferDom,Popup,Flexbox,
      FlexboxItem,
    },
    methods: {
      //工作流日志信息
      getWorkFlowLogs() {
          listTaskLogByTransCode({
          _dc: Date.now(),
          transCode: this.transCode
          }).then(data => {
          this.workflowLogs = data.tableContent || [];
          });
      },
      getFromStatus() {
          var data = {
            _dc: Date.now(),
            transCode: this.transCode
          };
          return getFromStatus(data).then(({ tableContent = [] }) => {
            this.formStatus = tableContent;
          });
      },
      //加载应用权限
      getListInfo() {
        return getListById({ uniqueId: this.$parent.listId }).then(data => {
          this.listInfo = data[0];
          this.appAction = this.listInfo.action;
        })
      },
      pushActions(action) {
        this.actions.push(action);
      },
      deleteActions(action) {
        if(this.actions.length === 0) return;
        if(this.actions.indexOf(action) > -1){
          this.actions.splice(this.actions.indexOf(action),1);
        }
      },
      //处理按钮的判断
      async dealActionInfo() {
        await this.getListInfo();
        let me = this,
            taskInfo = me.taskInfo || {},
            {isMyTask = 0, actions = '', taskId, viewId} = taskInfo,
            logs = me.workFlowLogs || [],
            lastLog = logs[logs.length - 1] || {},
            statusText = (me.formStatus[0] && me.formStatus[0].status) || '',
            model = me.model,
            listInfo = me.listInfo,
            action = me.appAction;  //新增模式按钮

        actions = actions.split(',');

        me.taskId = taskId;
        me.isMyTask = isMyTask === 1;

        if(me.code == '') {
          me.actions =  ['submitNew'];
          if(model ==='revise')return;
          me.pushActions('draft');
        }

        if ((action.add && model != 'marking' && statusText =='已生效') || (model == 'view'&&  statusText =='已生效') || !this.isMyTask) {
          me.pushActions('newFile');
          me.pushActions('copyNew');
        }
        if(model === 'revise') {
          me.deleteActions('newFile');
        }
        if (statusText === '草稿' && model != 'edit') {
          me.pushActions('edit')  
        }
        if (statusText === '已生效' && model != 'revise' && action.update) {
          me.pushActions('revise')
        }
        if (statusText === '已生效') {
          me.pushActions('revokeDraft');
          if(action.archive && listInfo.whetherArchive == 1) {
            me.pushActions('file');  
          }
        }
        if (statusText === '已归档') {
          me.pushActions('reduction');        
        }
        if (actions.includes('updateDataCommitTask')) {
          me.form.taskType = 1;
          me.pushActions('resubmit');  
        }
        if (actions.includes('resubmit')) {
          me.pushActions('resubmit');
          me.form.taskType = 3;
          me.pushActions('storage');
        }
        if(actions.includes('temporary') && !((me.actions).includes('storage'))) {
          me.pushActions('storage');
        }
        if (actions.includes('agreement')) {
          me.pushActions('agreement');
        }
        if (actions.includes('disagree')) {
          me.pushActions('disagree');
        }
        if (actions.includes('stop')) {
          me.pushActions('stop');
        }
        if(isMyTask) {
          me.pushActions('transfer');
        }
        if(lastLog.isFirstNode === 1 && lastLog.startUserId == this.userId &&  lastLog.endTime == null) {
          me.taskId = lastLog.taskId;
          me.pushActions('revoke'); 
        } 
        if(taskInfo.actions && taskInfo.actions.indexOf('recall') > -1 && taskInfo.allowRecall){
          me.pushActions('revoke'); 
        }
      }, 
      resubmit() {
        this.$HandleLoad.show();
        this.form.saveAndCommitTask();
      },
      //撤销为草稿
      revokeDraft() {
        let data = {
            transCodes: this.code,
        };
        this.$vux.confirm.prompt('',{
          title:'撤销原因',
          onConfirm: (value) => {
            this.undoDataByTransCodes({
              data:data,
              successMsg: '撤销成功',
              value,
            });
          }
        });
      },
      undoDataByTransCodes({data,successMsg,value}) {
        this.$HandleLoad.show();
        return undoDataByTransCodes(data).then(data => {
          this.$HandleLoad.hide();
          let {success = false, message = ''} = data;
          this.$vux.alert.show({
            content: message,
            onHide: () => {
              if (success) {
                this.$router.go(0);
              }
            }
          });
        }).catch(e => {
          this.$HandleLoad.hide();
        });
      },
      //归档
      file() {
        let data = {
            transCodes: this.code,
        };
        this.$vux.confirm.show({
          title:'确认归档?',
          onConfirm: (value) => {
            this.$HandleLoad.show();
            archiveDataByTransCodes(data).then(data => {
              this.$HandleLoad.hide();
              let {success = false, message = ''} = data;
              this.$vux.alert.show({
                content: message,
                onHide: () => {
                  if (success) {
                    this.$router.go(0);
                  }
                }
              });
            }).catch(e => {
              this.$HandleLoad.hide();
            });    
          }
        });
      },
      //还原
      reduction() {
        let data = {
            transCodes: this.code,
        };
        this.$vux.confirm.show({
          title:'确认还原?',
          onConfirm: (value) => {
            this.switchToEffectiveByTransCodes({
              data:data,
              successMsg: '还原成功',
              value,
            });
          }
        });  
      },
      switchToEffectiveByTransCodes({data,successMsg,value}) {
        this.$HandleLoad.show();
        return switchToEffectiveByTransCodes(data).then(data => {
          this.$HandleLoad.hide();
          let {success = false, message = ''} = data;
          this.$vux.alert.show({
            content: message,
            onHide: () => {
              if (success) {
                this.$router.go(0);
              }
            }
          });
        }).catch(e => {
          this.$HandleLoad.hide();
        });   
      },
      //终止
      stop() {
        this.$vux.confirm.prompt('', {
          title: '审批意见',
          onConfirm: (value) => {
            this.commitTask({
              result: -1,
              successMsg: '终止成功',
              value: value,
              callback: () => {
                this.showViewModel('view');
              }
            });
          }
        });  
      },
      // 拒绝
      disagree() {
        this.$vux.confirm.prompt('', {
          title: '审批意见',
          onConfirm: (value) => {
            this.commitTask({
              result: 0,
              successMsg: '拒绝成功',
              value: value,
              callback: () => {
                // 当某个节点审批为自己 如果用户点击了拒绝 则需要判断情况 决定是否回到重新提交页面
                let {  listId} = this.$route.params,
                    { name,folder, fileName, transCode } = this.$route.query;
                isMyflow({transCode: this.code}).then(({tableContent}) => {
                  let path = '';
                  if (tableContent.length > 0) {
                    let {isMyTask, nodeName} = tableContent[0];
                    if (isMyTask === 1 && nodeName === '重新提交') {
                      path = `/fillform/${listId}/0`;
                    } else {
                      this.$router.go(0);
                    }
                  } else {
                    this.$router.go(0);
                  }
                  this.$router.replace({
                    path, query: {name, folder,fileName,transCode}
                  })
                })
              }
            });
          }
        });
      },
      // 同意
      agreement() {
        if(this.model == 'marking') {
          this.form.taskType = 1;
          this.$vux.confirm.prompt('', {
            title: '审批意见',
            onConfirm: (value) => {
              this.$HandleLoad.show();
              this.form.saveAndCommitTask(value);
            }
          });
        } else {
          this.$vux.confirm.prompt('', {
            title: '审批意见',
            onConfirm: (value) => {
              this.commitTask({
                result: 1,
                successMsg: '同意成功',
                value
              });
            }
          });
        }
        // this.$vux.confirm.prompt('', {
        //   title: '审批意见',
        //   onConfirm: (value) => {
        //     this.commitTask({
        //       result: 1,
        //       successMsg: '同意成功',
        //       value
        //     });
        //   }
        // });
      },
      // 撤回
      revoke() {
        this.$vux.confirm.prompt('', {
          title: '撤回原因',
          onConfirm: (value) => {
            this.commitTask({
              result: 2,
              successMsg: '撤回成功',
              value,
              callback: () => {
                let { listId} = this.$route.params,
                    { folder, fileName, transCode ,name} = this.$route.query;
                this.$router.replace({
                  path: `/fillform/${listId}/0`,
                  query: {
                    fileName,folder,
                    name: name,
                    transCode: this.code,
                  },
                });
              }
            });
          }
        });
      },
      // 审批
      commitTask({result, value, successMsg, callback}) {
        this.$HandleLoad.show();
        let submitData = {
          taskId: this.taskId,
          taskData: JSON.stringify({
            result,
            transCode: this.code,
            comment: value
          })
        };
        return commitTask(submitData).then(data => {
          this.$HandleLoad.hide();
          let {success = false, message = '提交失败'} = data;
          let actionMap = {0: 'reject', 1: 'agree', 2: 'revoke'};
          if (success) {
            message = successMsg;
            this.$emit('on-submit-success', JSON.stringify({
              type: actionMap[result]
            }));
          }
          this.$vux.alert.show({
            content: message,
            onHide: () => {
              if (success) {
                if (callback) {
                  callback();
                } else {
                  this.$router.go(0);
                }
              }
            }
          });
        }).catch(e => {
          this.$HandleLoad.hide();
        });
      },
      showViewModel(model) {//new||view||edit||revise
        let me = this,
            { folder, fileName,name} = this.$route.query,
            { listId } = this.$route.params;
      
        getFormViews(listId).then(data=>{
            var viewIdMap = {},
                wrapper = model == 'view' ? 'detail':'fillform',
                viewType,
                query,
                viewId;

            data.map(function(v){
                viewIdMap[v.viewType] = v.uniqueId;
            });
            if(model == 'edit'){
              viewId = viewIdMap['revise'] || viewIdMap['submit'];
            } else {
              viewType  = model == 'new' ? 'submit' : model;
              viewId = viewIdMap[viewType];
            }
            if(viewId){
                me.$router.replace({
                  path: '/' + wrapper +'/' + listId + '/' + viewId ,
                  query: {
                    name,
                    model,
                    folder: folder, fileName:fileName,
                    transCode: model == 'new' ? undefined : me.code
                  },
                });
            } else {

            }
        });
      },
      // 转办
      transfer() {
        this.selectedUser = {};
        this.showUserList = true;
      },
      // 选中转办账号
      selUser(val) {
        this.selectedUser = {...val};
        this.showConfirm = true;
      },
      // 点击confirm确定
      onConfirm() {
        let warn = '';
        let submitData = {
          userId: this.selectedUser.userId,
          taskId: this.taskId,
          ...this.transferInfo,
        };
        this.showCommentWarn = !this.transferInfo.comment;
        if (this.showCommentWarn) {
          return
        }

        this.showConfirm = false;
        this.$HandleLoad.show();
        transferTask(submitData).then(data => {
          this.$HandleLoad.hide();
          let {success = false, message = '提交失败'} = data;
          if (success) {
            message = '转办成功';
            this.$emit('on-submit-success', JSON.stringify({
              type: 'transfer'
            }));
            location.reload();
          }
          this.$vux.alert.show({
            content: message,
            onHide: () => {
              this.showViewModel('view');
            }
          });
        }).catch(e => {
          this.$HandleLoad.hide();
        });
      },
      log(str){
        console.log(str)
      },
      goFlow(){
        this.showFlow = true;
      },
      goOperate(){
        this.showOperate = true;
      },
      // 关注或取关
      goConcern() {
        let operation = subscribeApp,
            data = {
              type: 'instance',
              relationKey: this.transCode
            };
        if (this.isConcern === 1) {
          operation = unsubscribeApp;
          delete data.type;
        }
        operation(data).then(({success = true, message = ''}) => {
          if (success) {
            this.isConcern = message === '订阅成功！' ? 1 : 0;
            let tips = message === '订阅成功！' ? '关注成功' : '取消关注成功';
            this.$vux.toast.show({
              type: 'text',
              time: 1000,
              position: 'top',
              text: tips
            })
          }
        })
      },
    },
    created(){
      // this.getWorkFlowLogs(); //工作流日志
      // this.getFromStatus();
    
      // this.dealActionInfo();  
    },
    mounted(){
      // var form = this.$refs.detailComponent.form;
  
      // this.form = form;
      // this.code = form.transCode || '';
      // this.taskInfo = form.taskInfo;
      // this.userId = WebContext.currentUser.userId || '';
      // this.model = form.viewInfo.viewType || '';
      //我的流程，工作流为空（表单失效），执行一次
    }
}