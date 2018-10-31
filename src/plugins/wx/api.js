// TODO 扫一扫
export const scanQRCode = (params = {}) => {
  return new Promise((resolve, reject) => {
    wx.scanQRCode({
      desc: 'scanQRCode desc',
      needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: function ({err_Info = 'false', resultStr = ''}) {
        // needResult为1时，返回值为{err_Info: 'success', resultStr: '链接地址', errMsg: 'scanQrCode: ok'}
        let message = '扫描结果异常';
        if (err_Info === 'success') {
          message = '扫描成功';
          resolve({
            message,
            result: resultStr,
          });
        } else {
          this.$vux.alert.show({
            content: message
          });
          reject({
            message
          })
        }
      },
      error: function (res) {
        let message = '扫描异常';
        if (res.errMsg.indexOf('function_not_exist') > 0) {
          message = '版本过低请升级';
        }
        this.$vux.alert.show({
          content: message
        });
        reject({
          message,
        });
      },
      ...params,
    });
  })
};

export default {}
