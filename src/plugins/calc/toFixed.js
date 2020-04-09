// 保留小数位
export function accAdd(arg1, arg2) {
  var r1, r2, m, c;
  try {
    let arr1 = arg1.toString().split(".");
    r1 = arr1[1] && arr1[1].length || 0;
  }
  catch (e) {
      r1 = 0;
      console.error(e)
  }
  try {
    let arr2 = arg2.toString().split(".");
    r2 = arr2[1] && arr2[1].length || 0;
  }
  catch (e) {
      r2 = 0;
    console.error(e)
  }
  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
      var cm = Math.pow(10, c);
      if (r1 > r2) {
          arg1 = Number(arg1.toString().replace(".", ""));
          arg2 = Number(arg2.toString().replace(".", "")) * cm;
      } else {
          arg1 = Number(arg1.toString().replace(".", "")) * cm;
          arg2 = Number(arg2.toString().replace(".", ""));
      }
  } else {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", ""));
  }
  return (arg1 + arg2) / m;
}
export default (val, length = 2) => {
  if (val === undefined || !/^-?\d*\.?\d*$/.test(val)) {
    //console.error('the value can not change to number');
    return ''
  }
  // 获取整数值和小数值
  let [ num = '', dec = '' ] = `${val}`.split('.'); 
  // 将 0 补全
  if (dec.length < length) {
    dec = `${dec}${'0'.repeat(length - dec.length)}`; 
  }

  // 小数位长度多于要保留的长度
  if (dec.length !== length) {
    // 给要保留的位数后加小数点
    dec = `${dec.substr(0, length)}.${dec.substr(length)}`; 
    // 四舍五入
    dec = `${Math.round(dec)}`; 
    // 往前面补0 处理类似001这种情况
    if (dec.length < length) {
      dec = `${'0'.repeat(length - dec.length)}${dec}`; 
    }
    // 当情况为 X.995 ~ X.999 这种情况的时候 如果强制保留两位会出现 X.00 num则需要累加
    if (dec >= 100 && length === 2) {
      let [ moreNum = '' ] = dec.split('');
      num = accAdd(num, moreNum);
      dec = dec.substr(1);
    }
  }

  return parseFloat(`${num}.${dec}`)
}
