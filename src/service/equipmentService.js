import $axios from '../plugins/ajax';

// TODO 获取设施列表(设备采购申请)
export let getObjFacilityByType = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getObjFacilityByType',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// TODO 获取设施列表(设备采购订单)
export let getEquipmentPurchaseOrder = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getEquipmentPurchaseOrder',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// TODO 获取设施列表(设备采购验收)
export let getObjFacilityByDealerCode = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getObjFacilityByDealerCode',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

export default {}
