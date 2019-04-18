import $flyio from 'plugins/ajax';

//获取费用
export let getCost = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getCostAll',
    data
  })
}

//获取项目费用名称列表
export let getProjectCostByGroupId = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getProjectCostByGroupId',
    data
  })
}

//获取一般费用名称列表
export let getCostByGroupId = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getCostByGroupId',
    data
  })
}

// 获取付款资金账户列表
export let getObjFunds = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjFunds',
    data
  })
}
// 获取付款资金账户列表2
export let getUniversalPayment = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getUniversalPayment',
    data
  })
}
// 获取【员工借款与备用金】往来用户的余额
export let getEmployeeBal = (data) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getEmployeeBal',
    data: {
      limit: 1,
      filter: data,
      refresh: true
    }
  })
}


// 获取资金列表(付供应商欠款)
export let getEmployeeReserveFunds = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getEmployeeReserveFunds',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取采购信息(付供应商欠款)
export let getPaySupplierArrearsDataSet = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPaySupplierArrearsDataSet',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取资金列表(付供应商定金)
export let getSupplierToPayDeposit = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSupplierToPayDeposit',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取定金列表(付供应商定金)
export let getPurchaseAgreementDeposit = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPurchaseAgreementDeposit',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取汇票列表(出让承兑汇票)
export let getInputDraft = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInputDraft',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取汇票列表(出兑现贴现承兑汇票)
export let getCashDiscount = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getCashDiscount',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取资金账户列表(出兑现贴现承兑汇票)
export let getFundCashDiscount = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getFundCashDiscount',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取汇票列表(兑付承兑汇票)
export let getDraftBalance = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getDraftBalance',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取资金账户列表(兑付承兑汇票)
export let getObjFundBalByType = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjFundBalByType',
    data: {
      _dc: Date.now(),
      fundType: '其他资金,银行存款',
      ...data,
    }
  })
};

// 获取资金账户列表(兑付承兑汇票)
export let getComplexExpenseReimbursement = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getComplexExpenseReimbursement',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

export default {

}
