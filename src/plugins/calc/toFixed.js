// TODO 保留小数位
export default (val, num = 2) => {
  let vArr = `${val}`.split('.');
  if (vArr.length > 1) {
    return parseFloat(val.toFixed(num));
  } else {
    return parseInt(val)
  }
}
