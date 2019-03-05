import { accAdd } from './decimalsAdd';
// 保留小数位
export default (val, length = 2) => {
  if (val === undefined || !/^-?\d*\.?\d*$/.test(val)) {
    console.error('the value can not change to number');
    return ''
  }
  let [num = '', dec = ''] = `${val}`.split('.'); // 获取整数值和小数值
  if (dec.length < length) {
    dec = `${dec}${'0'.repeat(length - dec.length)}`; // 将0 补全
  }
  // 小数位长度多于要保留的长度
  if (dec.length !== length) {
    dec = `${dec.substr(0, length)}.${dec.substr(length)}`; // 给要保留的位数后加小数点
    dec = `${Math.round(dec)}`; // 四舍五入
    if (dec.length < length) {
      dec = `${'0'.repeat(length - dec.length)}${dec}`; // 往前面补0，处理类似001这种情况
    }
    // 当情况为 X.995 ~ X.999 这种情况的时候 如果强制保留两位 num则需要累加
    if(dec >= 100) {
      let [ moreNum = '' ] = dec.split('');
      num = accAdd(num, moreNum);
      dec = dec.substr(1);
    }
  }
  return parseFloat(`${num}.${dec}`)
}
