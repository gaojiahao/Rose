import {mediaUpload} from 'service/commonService';

// 扫一扫
export const scanQRCode = (options = {}) => {
  return new Promise((resolve, reject) => {
    wx.scanQRCode({
      desc: 'scanQRCode desc',
      needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: function ({err_Info = 'false', resultStr = ''}) {
        // needResult为1时，返回值为{err_Info: 'success', resultStr: '链接地址', errMsg: 'scanQrCode: ok'}
        alert(`扫码成功${resultStr}`);
        let message = '扫描结果异常';
        if (err_Info === 'success') {
          alert(`扫码成功${resultStr}`);
          message = '扫描成功';
          resolve({
            message,
            result: resultStr,
          });
        } else {
          alert(`扫码失败${message}`);
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
      ...options,
    });
  })
};
// 分享
export const shareContent = (shareInfo = {}) => {
  // alert('哈哈')
  console.log(shareInfo);
  return wx.onMenuShareAppMessage({
    title: shareInfo.title, // 分享标题
    desc: shareInfo.desc, // 分享描述
    imgUrl: shareInfo.imgUrl, // 分享图标
    success: function () {
      alert('分享成功！');
    },
    cancel: function () {
      alert('分享失败！');
    },
  });
};

// 选择图片
export const chooseImage = ({options = {}}) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      defaultCameraMode: 'normal', //表示进入拍照界面的默认模式，目前有normal与batch两种选择，normal表示普通单拍模式，batch表示连拍模式，不传该参数则为normal模式。（注: 用户进入拍照界面仍然可自由切换两种模式）
      success: (res) => {
        // localIds返回选定照片的本地ID列表，
        // andriod中localId可以作为img标签的src属性显示图片；
        // 而在IOS中需通过上面的接口getLocalImgData获取图片base64数据，从而用于img标签的显示
        let {localIds = []} = res;
        resolve(localIds);
      },
      fail: () => {
        reject({
          success: false,
          message: '选择失败'
        });
      },
      ...options,
    });
  })
};

// 上传图片
export const uploadImage = ({options = {}, localId = '', biReferenceId = ''}) => {
  return new Promise((resolve, reject) => {
    wx.uploadImage({
      localId, // 需要上传的图片的本地ID，由chooseImage接口获得
      isShowProgressTips: 0, // 默认为1，显示进度提示
      success: (res) => {
        let {serverId = ''} = res; // 返回图片的服务器端ID
        let params = {
          mediaId: serverId,
        };
        if (biReferenceId) {
          params.biReferenceId = biReferenceId;
        }
        mediaUpload(params).then(res => {
          let {success = false, message = '上传失败', data} = res;
          resolve(data);
        }).catch(e => {
          reject();
        })
      },
      fail: () => {
        reject({
          success: false,
          message: '上传失败'
        });
      },
      ...options,
    });
  })
};

export default {}
