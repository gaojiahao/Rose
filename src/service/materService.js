import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};

// TODO 保存物料
export let save = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/inventory/save',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 修改物料
export let update = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/inventory/update',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 查看物料详情
export let findData = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/inventory/findData',
    data: {transCode}
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $axios.upload({
    file,
    biReferenceId
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 删除上传的图片
export let delImg = (id = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/delete',
    data: {
      id,
      list: 'attachments',
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

export default {
  save,
  update,
  findData,
  upload,
  delImg,
}
