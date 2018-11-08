import $axios from '../plugins/ajax';
import errHandle from './errHandle'

// TODO 获取list的分类
export let getVATBilling = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getVATBilling',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 获取增值税开票实例
export let getManyVATBilling = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getManyVATBilling',
    data
  }).catch(e => {
    return errHandle(e);
  });
};
export let getVATReceipt = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getVATReceipt',
    data
  }).catch(e => {
    return errHandle(e);
  });
};
export let getManyVATReceipt = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getManyVATReceipt',
    data
  }).catch(e => {
    return errHandle(e);
  });
};



export default {
  getVATBilling
}
