import {Group, Cell, numberComma} from 'vux'
import createService from './../../service/createService'
import common from './../mixins/common'
import Swiper from 'swiper/dist/js/swiper'
import FlowDetail from './../components/FlowDetail'
import TaskConfirm from './../components/TaskConfirm'
import RAction from './../components/RAction'

export default {
  data() {
    return {
      formData: {},
      showPage: false,
      listid: '',
      formKey: '',
      transCode: '',
      taskId: '', // 任务id
      canSubmit: false, // 是否允许操作
      pageSwiper: null, // swiper容器
      showConfirm: false, // 是否展示原因弹窗
      result: 1, // 审批类型，1为同意、0为拒绝
      currentUser: {},
      workFlow: [],
      opSuccess: false,
      actions: [], // 可操作的按钮数组
      isMyTask: false, // 是否为我提交的
    }
  },
  mixins: [common],
  components: {
    Group,
    Cell,
    FlowDetail,
    TaskConfirm,
    RAction,
  },
  methods: {
    // TODO 获取表单详情
    getFormData() {
      this.showLoading = true;
      createService.getJsonData(this.transCode).then(({tableContent = []}) => {
        this.showLoading = false;
        this.showPage = true;
        let [data = {}] = tableContent;
        let jsonData = JSON.parse(data.json_data || '{}');
        this.restoreJsonData && this.restoreJsonData(jsonData);
        this.$nextTick(() => {
          this.pageSwiper.update();
        })
      }).catch(e => {
        this.showToast(e.message);
      });
    },
    // TODO 审批
    submit(comment = '') {
      this.showLoading = true;
      createService.examineTask(this.taskId, {
        result: this.result,
        transCode: this.transCode,
        comment,
      }).then(data => {
        this.showLoading = false;
        let {message, success} = data;
        if (success) {
          this.showToast('提交成功');
          this.opSuccess = true;
          setTimeout(() => {
            this.$router.go(-1);
          }, 1000)
        } else {
          this.showToast('提交失败');
        }
      }).catch(e => {
        this.showToast(e.message);
      })
    },
    // 展示弹窗
    showConfirmPop(result = 1) {
      this.showConfirm = true;
      this.result = result;
    },
    // TODO 点击确定
    confirm(reason) {
      if (!this.result && !reason) {
        this.showToast('拒绝原因不能为空');
        return
      }
      this.submit(reason);
    },
    // TODO 获取当前用户信息
    getBaseInfo() {
      createService.getBaseInfoData().then(data => {
        this.currentUser = data || {};
      })
    },
    // TODO 获取工作流
    getFlows() {
      return createService.getWorkFlow({
        transCode: this.transCode
      }).then(({tableContent = []}) => {
        let lastNode = tableContent[tableContent.length - 1] || {};
        // this.taskId = lastNode.taskId;
        this.workFlow = tableContent;
        if (this.canSubmit) {
          // 自己提交自己审批
          if (this.isMyTask) {
            this.actions = ['agreement', 'revoke'];
          } else {
            this.actions = ['agreement', 'disagree'];
          }
        }
        if (!this.canSubmit && this.isMyTask && (lastNode.nodeName === '常委' || lastNode.nodeName === '部门主管')) {
          this.actions = ['revoke'];
        }

      }).catch(e => {
        this.showToast(e.message);
      })
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.opSuccess && to.name === 'Mylist') {
      to.meta.reload = true;
    }
    next();
  },
  created() {
    let {query} = this.$route;
    this.listid = query.list;
    this.formKey = query.formKey;
    this.transCode = query.transCode;
    this.taskId = query.taskId;
    this.canSubmit = query.canSubmit === '1';
    this.isMyTask = query.isMyTask === '1';

    this.getBaseInfo();
    this.getFlows();
    this.getFormData();
    this.$nextTick(() => {
      this.pageSwiper = new Swiper('.swiper-container', {});
    })
  }
}
