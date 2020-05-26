import util from '@/common/util';
/**
 * @author snack.huang
 * @param time 文件名称
 * @description 格式化
 */
const timeChangeFilter  = (time) => {
    var diffTime = (new Date().getTime() - new Date(time))/1000,
    str = '';

    if(diffTime < 60){
        str = '刚刚'
    } else if(diffTime < 60*60){
        str = Math.floor(diffTime/60) + '分钟前';
    }else if (diffTime < 60 * 60 * 24)
    {
        str = Math.floor(diffTime/(60*60))+'小时前 ';
    }
    else if (diffTime < 60 * 60 * 24 * 2)
    {
        str = Math.floor(diffTime/(60*60*24)) == 1 ? '昨天 ' : '前天 ';
    }
    else
    {
        str = util.formatDateTime(time);
    }
    return str;
}

export default timeChangeFilter