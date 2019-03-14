import $flyio from 'plugins/ajax';

// 获取list的分类
export let getVATBilling = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getVATBilling',
    data
  })
};

// 获取增值税开票实例
export let getManyVATBilling = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getManyVATBilling',
    data
  })
};
export let getVATReceipt = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getVATReceipt',
    data
  })
};
export let getManyVATReceipt = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getManyVATReceipt',
    data
  })
};

// 获取开票申请出库单列表
export let getBillingApplication = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBillingApplication',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

export default {}
