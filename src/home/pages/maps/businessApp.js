/* BusKey 映射表 */
export default {
  产品:{},// 此处只能为空
  销售: {
    销售订单: 'XSDD',
    销售出库: 'XSCK',
    销售报价: 'XSBJ',
    商机: 'SJ'
  },
  采购: {
    采购申请: 'CGSQ',
    采购订单: 'CGDD',
    采购入库: 'CGRK',
  },
  库存: {
    本地库存调拨: 'BDKCDB',
    库存盘点: 'KCPD'
  },
  财务: {
    费用报销: 'FYBX'
  },
  项目: {
    项目立项: 'XMLX',
    项目计划: 'XMJH',
    项目任务: 'XMRW'
  }
}
