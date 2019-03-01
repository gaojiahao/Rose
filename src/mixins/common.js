import {numberPad, dateFormat} from 'vux'
import platfrom from '@/plugins/platform/index'
export default {
  data(){
    return {
      btnIsHide :false,
      clientHeight : document.documentElement.clientHeight,
    }
  },
  methods: {
    // 时间戳转日期
    changeDate(d, hasSecond = false) {
      if (!d) {
        return '';
      }
      if (typeof d === 'string') {
        d = d.replace(/-/g, '/').replace(/\..*/g, '');
      }
      let fmt = 'YYYY-MM-DD';
      if (hasSecond) {
        fmt = 'YYYY-MM-DD HH:mm:ss';
      }
      return dateFormat(d, fmt)
    },
    //输入框获取焦点时内容选中
    getFocus(e){
      event.currentTarget.select();
    }
  },
  mounted() {
    //解决android键盘收起input没有失去焦点，底部按钮遮挡输入框
    if(platfrom.isAndroid){
      window.onresize= ()=>{
        if(this.clientHeight > document.documentElement.clientHeight) {
          //底部按钮隐藏
            this.btnIsHide  = true;
        }else{
            this.btnIsHide = false;
            if(document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
              document.activeElement.blur();
            }
        }
      }
    }

  }
}
