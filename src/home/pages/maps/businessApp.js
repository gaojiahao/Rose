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
    '4099b5aa-1468-4b81-85a5-75079e291977': 'BHDD',           // *备货订单*
    // '867e0b4f-548f-4e08-873a-1b8e54333630': 'WLXQJH',      // *物料需求计划*
    '7532f8ea-caf3-4fc4-97f6-b5aad7bcf6a0': 'WLXQTJ',         // *物料需求调减*
    'a8281547-d2d3-11e8-b8ca-0279b2c6a380': 'XSDDYC',         // *销售订单预测*
  },

  // <生产类应用>
  'fb200d08-4289-44dc-81e1-1fddec997c5e': {
    // 'c1f69d6b-910e-47b2-b9f9-4df6b8e5cf12': 'NBJGDD',      // *内部加工订单*
    '2372f734-93c1-11e8-85db-005056a136d0': 'GDRW',        // *工单任务*
    'f9f1e0cb-7edf-43aa-b2f2-527e2525b96e': 'GDYS',        // *工单验收*
    'c54b3325-a5c1-4d75-a3c4-c6cf0e988aae': 'GDRWQD',      // 工单任务启动
  },

  // < 产品类应用 >
  'a32759e8-a3ad-47a6-a030-f33daea8b433': {
    'b30f4d3e-b23d-11e8-96a5-005056a136d0': 'CPXQ',            // *产品需求*
    'eb8a01a3-7a74-439b-bc44-8d58cbfa6166': 'CPFB',            // *产品发布*
  },

  // < 销售类应用 >
  '43b07f14-4ae5-4804-a80e-ef06ce26fb0b': {
    'b1b3c988-706c-495b-ad11-0ee73591480e': 'XSDD' ,         // *销售订单*
    '58a607ce-fe93-4d26-a42e-a374f4662f1c': 'XSBJ',          // *销售报价*
    '32a2c333-02a3-416f-a133-95c7a32da678': 'SJ',            // *商机*
    '525bee48-d2d4-11e8-b8ca-0279b2c6a380': 'XSHT',          // *销售合同
    'ebd2225c-9354-4df9-bded-8631e3cac4ac' : 'KPSQ'          // *开票申请*
  },

  // < 交付类应用 >
  '406f7db3-af5a-45ae-8641-576fa33b0471': {},

  // < 采购类应用 >
  'a0a66a68-b351-4c19-b837-e168cbf48019': {
    'dd4d228d-fc01-4038-bf17-df54d8d06eb9': 'CGDD',       // *采购订单*
    '43ccbc27-bbb5-4cfb-997b-6d3823f1c03e': 'CGSQ',       // *采购申请*
    '67ff01b1-52bc-4e01-9650-214dc6e5e8f9': 'CGXY',       // *采购协议*
  },

  // < 库存类应用 >
  '9e5a7193-f2eb-4b99-9849-8fe6c6ae3713': {
    'edf7b34b-8916-410f-801f-2db7e97efbde': 'KCPD' ,       // *库存盘点*
    '4d9a7f8f-9a88-47b6-a1f4-3faed6423615': 'BDKCDB',      // *本地库存调拨*
    '6ebcad8b-449c-422a-960f-53ccf98fd4ba': 'GDBLL',       // *工单补领料*
    '1c5896d8-1500-4569-b0c5-6b596d03fb9b': 'CGRK',        // *采购入库*
    'a1e8592f-63c2-4a31-ba22-9d654484db1d': 'XSCK',        // *销售出库*
    'f5bcd76e-6b3b-4ee6-871f-5c3de4fc261f': 'NBJGLL',      // *内部加工领料*
    '5e8d89f1-49a5-4089-9c1a-44dc2ce0ae4b': 'NBJGRK',      // *内部加工入库*
    '482b7468-06eb-40c7-842a-f7ea6edb1c37': 'CGTHCK',     // *采购退货出库 *

  },

  // < 财务类应用 >
  '7218d31d-88f4-45bc-82c2-6d4a1c766821': {
    // < 收付款 分类 >
    'b81c5e6c-4f6d-4c1c-8a6d-636750127410': {
      'b6b97d33-5d8e-4942-b978-09103d06f188': 'SK',           // *收款*
      '1972f3a4-b29a-4a0e-90a8-85090c0e2d28': 'FK',           // *付款*
      'c930267f-66fd-4927-983b-0216ef9449b3': 'FGYSQK',       // *付供应商欠款*
      '7d172485-8726-4e42-b29d-ec2a716bf062': 'FGYSDJ',       // *付供应商定金*
    },
    // < 发票 分类 >
    '752bfc20-9cbf-4552-b2a4-77b2c46eb2d1': {
      '0cf1a234-04a5-4021-926b-137914878082' : 'ZZSKP',     // *增值税开票*
      '1759f423-9f1a-4a67-b68a-86773fe469c8' : 'ZZSSP',     // *增值税收票*
    },
    // < 承兑汇票 分类 >
    '9a50685e-88d5-48ac-9c49-977e23f14b98': {
      'bb9ce973-2f62-4707-a54c-7e8605dc99d6': 'CRCDHP',       // *出让承兑汇票*
      '1745ffdd-1b6a-4fe5-9c5b-6e5394bd4faf': 'SDCDHP',       // *收到承兑汇票*
      'ef8bbbc5-04c4-40eb-8d8c-338784a847e9': 'DXTXCDHP',     // *兑现贴现承兑汇票*
      '7666662a-a52a-4ca8-8f28-d3035322875e': 'DFCDHP',       // *兑付承兑汇票*
      // '6ce47b8d-e255-4610-af66-f3f985347411': 'KCCDHP',       // *开出承兑汇票*
    },
    // < 其他 分类 >
    'dac8201d-7b8f-4889-8c9d-eb34192e99ad': {
      '418bd0e9-1dce-4e01-aa5a-3d4cd80e87d4': 'JKYBYJ',       // *员工借款与备用金*
      '080147c6-05ea-4ae7-9390-49e8e0379a11': 'BXYZF',        // *费用报销与支付*
    },
    // 'b61ef324-f261-48d6-9c79-d1b475c24943': 'XMFYBX',       // *项目费用报销*
    // '18800986-a50f-11e8-96a5-005056a136d0': 'YBFYBX',       // *一般费用报销*
  },
  // <低值易耗品>
  '27d28ff5-2e04-4881-a159-2b38f10ce7e4': {
    '4472a646-f2c8-4a07-bad6-4c01f0b9292f': 'DZYHPCGSQ', // 低值易耗品采购申请
    '1d52d5ce-d05e-4987-a023-3f4dba68cad9': 'DZYHPCGDD', // 低值易耗品采购订单
    '0750729a-1bea-423e-99a0-070beb953787': 'DZYHPCGYSYZF', // 低值易耗品采购验收与支付
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
    'ee4ff0a1-c612-419d-afd7-471913d57a2a': 'XMRW',       // *项目任务*
    'b87a513e-99ec-4608-89db-3d6e97ef1432': 'XMJX'        // *项目结项*
  },
  // < 人力 >
  'c09c6397-c685-4fb8-ac9e-bd554ab6bc52' : {
    '223f9387-d2d7-11e8-b8ca-0279b2c6a380' : 'YGDA',      // *员工档案*
    '98519ac0-d2d7-11e8-b8ca-0279b2c6a380' : 'YGRZ',      // *员工入职*
    'da7f15cc-d2d7-11e8-b8ca-0279b2c6a380' : 'YGLZ',      // *员工离职*
    // '3dda676a-4ce0-4c4a-a56f-8bda50a8ef1f' : 'ZPJH',      // *招聘计划*

  }
}
