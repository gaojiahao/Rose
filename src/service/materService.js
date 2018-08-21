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

// TODO 获取仓库出库物料
export let getSumInvBalance = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSumInvBalance',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};
//获取费用
export let getCost = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getCostAll',
    data
  }).catch(e => {
    return errorHandler(e);
  });

}

// TODO 获取物料Pop列表
export let getObjInventoryByProcessing = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getObjInventoryByProcessing',
    data: {
      _dc: Date.now(),
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取物料Pop列表(采购订单)
export let getInventory7501 = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getInventory7501',
    data: {
      _dc: Date.now(),
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取物料Pop列表(采购入库)
export let getInventory7502 = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getInventory7502',
    data: {
      _dc: Date.now(),
      ...data
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
