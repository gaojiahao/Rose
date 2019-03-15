// 两个数字相加
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

// 数字相乘，可传入多个数字
export function accMul(...args) {
  let m = 0;
  let total = 1;
  try {
    for (let item of args) {
      // 不存在则不进行计算
      if (item === undefined || isNaN(item)) {
        continue
      }
      item = `${Number(item)}`;
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

// 两个数字相减
export function accSub(arg1, arg2) {
    var r1, r2, m, n;
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
    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(2);
}

// 两个数字相除
export function accDiv(arg1, arg2) {
    if (isNaN(arg1)) {
        arg1 = 0;
    }
    if (isNaN(arg2)) {
        arg2 = 0;
    }
    arg1 = Number(arg1);
    arg2 = Number(arg2);

    var t1 = 0, t2 = 0, r1, r2;
    try {
      let arr1 = arg1.toString().split(".");
      t1 = arr1[1] && arr1[1].length || 0;
    }
    catch (e) {
      console.error(e)
    }
    try {
      let arr2 = arg2.toString().split(".");
      t2 = arr2[1] && arr2[1].length || 0;
    }
    catch (e) {
      console.error(e)
    }
    r1 = Number(arg1.toString().replace(".", ""));
    r2 = Number(arg2.toString().replace(".", ""));
    return (r1 / r2) * Math.pow(10, t2 - t1);
}
