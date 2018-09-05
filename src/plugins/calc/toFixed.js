// TODO 保留小数位
export default (val, num = 2) => {
  if (val === undefined) {
    console.error('the value can not change to number');
    return
  }
  return Number(val).toFixed(num);
}
