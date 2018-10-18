
export function accAdd(arg1, arg2) {
  var r1, r2, m, c;
  try {
      r1 = arg1.toString().split(".")[1].length;
  }
  catch (e) {
      r1 = 0;
  }
  try {
      r2 = arg2.toString().split(".")[1].length;
  }
  catch (e) {
      r2 = 0;
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

// TODO 数字相乘，可传入多个数字
export function accMul(...args) {
let m = 0;
let total = 1;
try {
  for (let item of args) {
    item = `${item}`;
    let iArr = item.split('.');
    if (iArr.length > 1) {
      m += item.split('.')[1].length;
    }
    total *= Number(item.replace('.', ''));
  }
} catch (e) {

}
return total / Math.pow(10, m);
}
//两个数字相减
export function accSub(arg1, arg2) {
  var r1, r2, m, n;
  try {
      r1 = arg1.toString().split(".")[1].length;
  }
  catch (e) {
      r1 = 0;
  }
  try {
      r2 = arg2.toString().split(".")[1].length;
  }
  catch (e) {
      r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
  n = (r1 >= r2) ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(2);
}
