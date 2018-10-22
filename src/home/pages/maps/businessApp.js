// 首页应用分类映射表
export default {
  // 通讯录
  '6b6a6f40-ea86-4e72-a451-69a9a3b2e28c': {
    '000004': 'COMPANY',                                    // *公司*
    '000001': 'USER',                                       // *用户*
    '000003': 'JOB',                                        // *职位*
  },
  // 基础对象
  'a7f59e02-86fc-4c85-ae78-0f567b8078ad': {},
  // <计划类应用>
  '7dab9bd1-f51d-4b09-afc0-3d5c732ca219': {
    '4099b5aa-1468-4b81-85a5-75079e291977': 'BHDD',          // *备货订单*
    // '867e0b4f-548f-4e08-873a-1b8e54333630': 'WLXQJH',     // *物料需求计划*
    '7532f8ea-caf3-4fc4-97f6-b5aad7bcf6a0': 'WLXQTJ',         // *物料需求调减*
    '43ccbc27-bbb5-4cfb-997b-6d3823f1c03e': 'CGSQ',       // *采购申请*

  },

  // <生产类应用>
  'fb200d08-4289-44dc-81e1-1fddec997c5e': {
    '65ceb5a6-a120-11e8-862a-005056a136d0': 'NBJGDD',      // *内部加工订单*
    // '2372f734-93c1-11e8-85db-005056a136d0': 'GDRW',           // *工单任务*
    // 'f9f1e0cb-7edf-43aa-b2f2-527e2525b96e': 'GDYS',           // *工单领料*
    // '6ebcad8b-449c-422a-960f-53ccf98fd4ba': 'GDBLL'           // *工单补领料*  
  },

  // < 产品类应用 >
  'a32759e8-a3ad-47a6-a030-f33daea8b433': {
    'b30f4d3e-b23d-11e8-96a5-005056a136d0': 'CPXQ'            // *产品需求*
  },

  // < 销售类应用 >
  '43b07f14-4ae5-4804-a80e-ef06ce26fb0b': {
    'a4897429-f4f2-44a4-ade7-2fe8dc67c3cf': 'XSDD' ,         // *销售订单*
    '58a607ce-fe93-4d26-a42e-a374f4662f1c': 'XSBJ',          // *销售报价*
    '32a2c333-02a3-416f-a133-95c7a32da678': 'SJ'             // *商机*
  },

  // < 交付类应用 >
  '406f7db3-af5a-45ae-8641-576fa33b0471': {},

  // < 采购类应用 >
  'a0a66a68-b351-4c19-b837-e168cbf48019': {
    'dd4d228d-fc01-4038-bf17-df54d8d06eb9': 'CGDD',       // *采购订单*
  },

  // < 库存类应用 >
  '9e5a7193-f2eb-4b99-9849-8fe6c6ae3713': {
    '1c5896d8-1500-4569-b0c5-6b596d03fb9b': 'CGRK',        // *采购入库*
    'edf7b34b-8916-410f-801f-2db7e97efbde': 'KCPD' ,       // *库存盘点*
    '4d9a7f8f-9a88-47b6-a1f4-3faed6423615': 'BDKCDB',      // *本地库存调拨*
    '5e8d89f1-49a5-4089-9c1a-44dc2ce0ae4b': 'NBJGRK',      // *内部加工入库*  
    '762b8df4-2555-4325-884a-355f34355832': 'NBJGLL',      // *内部加工领料*
    'a1e8592f-63c2-4a31-ba22-9d654484db1d': 'XSCK',        // *销售出库*
    '482b7468-06eb-40c7-842a-f7ea6edb1c37': 'CGTHCK'       // *采购退货出库 *

  },

  // < 财务类应用 >
  '7218d31d-88f4-45bc-82c2-6d4a1c766821': {
    'b61ef324-f261-48d6-9c79-d1b475c24943': 'FYBX',       // *费用报销*
  },
  // <财务会计类科目>
  'f3d819ee-8f77-47d0-81f1-e986841e51eb': {
    '1000': 'HBZJ',
    '1400': 'CH',
    '9000': 'WLYE',
    '000100': 'HGCW'
  },
  // < 项目类应用 >
  '26d75e08-2c82-4e1a-ad51-b788b026428a': {
    '630a9b96-f257-48b6-b0bc-fd64c455d92b': 'XMLX',       // *项目立项*
    '0281f8eb-f1d2-415c-b566-756fc749ccb3': 'XMJH',       // *项目计划*
    'ee4ff0a1-c612-419d-afd7-471913d57a2a': 'XMRW'        // *项目任务*
  },
  // < 发票类 >
  '752bfc20-9cbf-4552-b2a4-77b2c46eb2d1' : {
    '1aba0d26-a479-47f7-b755-03f5036dee98' : 'ZZSKP',     // *增值税开票*
    '72b6a187-b61a-4532-9945-21957b24fd09' : 'ZZSSP',     // *增值税收票*
  }
}
