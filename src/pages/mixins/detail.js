import {Group, Cell, numberComma} from 'vux'
import createService from './../../service/createService'
import common from './../mixins/common'
import Swiper from 'swiper/dist/js/swiper'
import FlowDetail from './../components/FlowDetail'
import TaskConfirm from './../components/TaskConfirm'

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
    }
  },
  mixins: [common],
  components: {
    Group,
    Cell,
    FlowDetail,
    TaskConfirm,
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
        /*let {formData = {}, success = true, message = ''} = data;
        // 请求失败提示
        if (!success) {
          this.showToast(message);
          return;
        }

        formData.begin = this.changeDate(formData.begin);
        formData.end = this.changeDate(formData.end);
        formData.crtTime = this.changeDate(formData.crtTime);
        formData.modTime = this.changeDate(formData.modTime);

        this.formData = formData;
        if(formData.order){
          //如果formData.order存在则声明
          let dataSet = formData.order.dataSet || {} ;
          //市场费用 固定资产
          if(formData.transType === '市场宣传' || formData.transType === '固定资产'){
            for(let key in dataSet){
              //深拷贝(解决每次引用都是同一个地址)
              let arr = JSON.parse(JSON.stringify(this.listObj));
              for(let item of arr){
                for(let val of item.items){
                  val.value = dataSet[key][val.key];
                }
              }
              this.listData.push(arr);
            }
          }
        }
        else{
          this.listData.forEach(lItem => {
            lItem.items.forEach(item => {
              item.value = formData[item.key]
            })
          });
        }*/
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
  },
  created() {
    let {query} = this.$route;
    this.listid = query.list;
    this.formKey = query.formKey;
    this.transCode = query.transCode;
    this.taskId = query.taskId;
    this.canSubmit = query.canSubmit === '1';
    this.getBaseInfo();
    this.getFormData();
    this.$nextTick(() => {
      this.pageSwiper = new Swiper('.swiper-container', {});
    })
  }
}
