// TODO 保留小数位
export default (val, num = 2) => {
  if (val === undefined) {
    console.error('the value can not change to number');
    return
  }
  let vArr = `${val}`.split('.');
  if (vArr.length > 1) {
    return parseFloat(Number(val).toFixed(num));
  } else {
    return parseInt(val)
  }
}
