import $flyio from '../plugins/ajax';


// 保存物料
export let save = (data = {}) => {
  return $flyio.post({
    url: '/H_roleplay-si/inventory/save',
    data
  })
};

// 修改物料
export let update = (data = {}) => {
  return $flyio.post({
    url: '/H_roleplay-si/inventory/update',
    data
  })
};

// 查看物料详情
export let findData = (transCode = '') => {
  return $flyio.ajax({
    url: '/H_roleplay-si/inventory/findData',
    data: {transCode}
  })
};

// 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $flyio.upload({
    file,
    biReferenceId
  })
};

// 删除上传的图片
export let delImg = (id = '') => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/delete',
    data: {
      id,
      list: 'attachments',
    }
  })
};

// 获取仓库出库物料
export let getSumInvBalance = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSumInvBalance',
    data
  })
};
//获取费用
export let getCost = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getCostAll',
    data
  })
}

//获取费用(新)
export let getCostById = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getProjectCostByGroupId',
    data
  })
}

// 获取物料Pop列表
export let getObjInventoryByProcessing = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjInventoryByProcessing',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};
// 获取物料pop列表
export let getObjInventory = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjInventory',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};
// 获取物料Pop列表(采购订单)
export let getInventory7501 = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPurchaseOrder',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取物料Pop列表(采购入库)
export let getInventory7502 = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPurchaseWarehousing',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};
//获取物料列表
export let getMatList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getMaterialList',
    data
  })
}

// 获取物料Pop列表(盘点)
export let getKCPDList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSumInvBalance_KCPD',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

//获取采购退货出库的物料
export let getCKTHCKList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPurchaseReturn',
    data
  })
}
// 获取物料列表(需求调减/加工订单)
export let getXQTJList = (data = {}, method = 'getDemandAdjustment') => {
  return $flyio.ajax({
    url: `/H_roleplay-si/ds/${method}`,
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};
//获取采购申请物料需求计划列表
export let getPurchaseInNeeds = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPurchaseInNeeds',
    data
  })
}
// 获取加工订单Bom
export let getJGDDBom = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInProcessingOrderBom',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取加工入库Bom
export let getJGRKBom = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBomByPInvCode',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};
// 获取工单任务派工Bom
export let getTaskBom = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBomWorkOrderTask',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取工艺路线名称
export let getObjTechnics = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjTechnics',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};
// 获取工序名称
export let getUsingProcedure = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getUsingProcedure',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取物料的辅助计量
export let getObjInvMoreUnitByInvCode = (inventoryCode) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjInvMoreUnitByInvCode',
    data: {
      _dc: Date.now(),
      inventoryCode,
      page: 1,
      start: 0,
      limit: 10000,
    }
  })
};

// 获取物料列表(低值易耗品采购订单)
export let getLowValueConsumPurchaseOrder = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getLowValueConsumPurchaseOrder',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 10000,
      ...data,
    }
  })
};

// 获取物料列表(低值易耗品采购验收与支付)
export let getLowPriceConsumableInWarehouse = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getLowPriceConsumableInWarehouse',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 10000,
      ...data
    }
  })
};
// 获取产品价格的物料列表
export let getProductPriceAllInventory = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getProductPriceAllInventory',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取销售合同的物料列表
export let getSalesContract = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSalesContract',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取销售订单预测的物料列表
export let getInventoryToProcessing = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInventoryToProcessing',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取产品销售订单的物料列表
export let getSalesOrderNew = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSalesOrderNew',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取销售报价的价格区间
export let getPriceRange = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPriceRange',
    data: {
      _dc: Date.now(),
      drDealerLabel: '客户',
      ...data
    }
  })
};

// 获取物料列表(完工预入库)
export let getEtcPutInStorage = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getEtcPutInStorage',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// 获取物料bom库存
export let getInProcessingStorageSumSource = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInProcessingStorageSumSource',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

export default {}
