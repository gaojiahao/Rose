// 首页应用分类映射表
export default {

  // 通讯录
  '000004': 'COMPANY',                                    // *公司*
  '000001': 'USER',                                       // *用户*
  '000003': 'JOB',                                        // *职位*

  // <计划类应用>
  '4099b5aa-1468-4b81-85a5-75079e291977': 'BHDD',          // *备货订单*
  '7532f8ea-caf3-4fc4-97f6-b5aad7bcf6a0': 'WLXQTJ',        // *物料需求调减*
  '2e8e23c6-2fa4-4067-9cef-b5c92463d4c9': 'XSDDYC',        // *销售订单预测*

  // <生产类应用>
    //  < *加工* 分类>
  '2372f734-93c1-11e8-85db-005056a136d0': 'GDRW',         // *工单任务*
  'f9f1e0cb-7edf-43aa-b2f2-527e2525b96e': 'GDYS',        // *工单验收*
  'c54b3325-a5c1-4d75-a3c4-c6cf0e988aae': 'GDRWQD',      // 工单任务启动

  // < 产品类应用 >
  'b30f4d3e-b23d-11e8-96a5-005056a136d0': 'CPXQ',            // *产品需求*
  'eb8a01a3-7a74-439b-bc44-8d58cbfa6166': 'CPFB',            // *产品发布*

  // < 销售类应用 >
  '548b7e35-16c6-4748-af06-eac1d2dac5d1' : 'CPJG',         // *产品价格*
  '78949976-4689-41da-b090-fe891186ee8b': 'XSDD' ,         // *销售订单*
  '58a607ce-fe93-4d26-a42e-a374f4662f1c': 'XSBJ',          // *销售报价*
  '32a2c333-02a3-416f-a133-95c7a32da678': 'SJ',            // *商机*
  '0b2360df-499c-47b0-8d97-7c5d81c35353': 'XSHT',          // *销售合同
  '4f2debbe-fce5-44f8-8440-a3959e62f721' : 'KPSQ',          // *开票申请*

  // < 采购类应用 >
  'a4474c03-1139-4e8c-bc4e-2beb4565be33': 'CGDD',       // *采购订单*
  '43ccbc27-bbb5-4cfb-997b-6d3823f1c03e': 'CGSQ',       // *采购申请*
  '9e8de557-2e56-4ce5-8792-54829eef7c5b': 'CGXY',       // *采购协议*

  // < 库存类应用 >
  'edf7b34b-8916-410f-801f-2db7e97efbde': 'KCPD' ,       // *库存盘点*
  '4d9a7f8f-9a88-47b6-a1f4-3faed6423615': 'BDKCDB',      // *本地库存调拨*
  '6ebcad8b-449c-422a-960f-53ccf98fd4ba': 'GDBLL',       // *工单补领料*
  '00bf03eb-2794-4222-a97e-9029683734b3': 'CGRK',        // *采购入库*
  'bde3edef-ee04-4a18-b063-73ae7682e23a': 'XSCK',        // *销售出库*
  '482b7468-06eb-40c7-842a-f7ea6edb1c37': 'CGTHCK',      // *采购退货出库 *

  // < 财务类应用 >
    // < 收付款 分类 >
  'b6b97d33-5d8e-4942-b978-09103d06f188': 'SK',           // *收款*
  '1972f3a4-b29a-4a0e-90a8-85090c0e2d28': 'FK',           // *付款*
  'c930267f-66fd-4927-983b-0216ef9449b3': 'FGYSQK',       // *付供应商欠款*
  '7d172485-8726-4e42-b29d-ec2a716bf062': 'FGYSDJ',       // *付供应商定金*
    // < 发票 分类 >
  '8c68eaa6-46dd-4b3b-b885-1218600b519c' : 'ZZSKP',     // *增值税开票*
  '6df81f47-9d31-46f3-b852-614a8891cd01' : 'ZZSSP',     // *增值税收票*
    // < 承兑汇票 分类 >
  'bb9ce973-2f62-4707-a54c-7e8605dc99d6': 'CRCDHP',       // *出让承兑汇票*
  '1745ffdd-1b6a-4fe5-9c5b-6e5394bd4faf': 'SDCDHP',       // *收到承兑汇票*
  'ef8bbbc5-04c4-40eb-8d8c-338784a847e9': 'DXTXCDHP',     // *兑现贴现承兑汇票*
  '7666662a-a52a-4ca8-8f28-d3035322875e': 'DFCDHP',       // *兑付承兑汇票*
    // < 其他 分类 >
  '418bd0e9-1dce-4e01-aa5a-3d4cd80e87d4': 'JKYBYJ',       // *员工借款与备用金*
  '080147c6-05ea-4ae7-9390-49e8e0379a11': 'BXYZF',        // *费用报销与支付*

  // <低值易耗品>
  '4472a646-f2c8-4a07-bad6-4c01f0b9292f': 'DZYHPCGSQ', // 低值易耗品采购申请
  '1d52d5ce-d05e-4987-a023-3f4dba68cad9': 'DZYHPCGDD', // 低值易耗品采购订单
  '0750729a-1bea-423e-99a0-070beb953787': 'DZYHPCGYSYZF', // 低值易耗品采购验收与支付

  // <设备>
  'f928725f-5e23-4321-922c-6db0efa85f17': 'SBCGSQ',       // *设备采购申请
  'fac37727-d2d4-11e8-b8ca-0279b2c6a380': 'SBCGDD',       // *设备采购订单
  '64c5afbc-c075-11e8-85e2-b06ebfc41432': 'SBCGYS',       // *设备采购验收

  // < 项目类应用 >
  '630a9b96-f257-48b6-b0bc-fd64c455d92b': 'XMLX',       // *项目立项*
  '0281f8eb-f1d2-415c-b566-756fc749ccb3': 'XMJH',       // *项目计划*
  'ee4ff0a1-c612-419d-afd7-471913d57a2a': 'XMRW',       // *项目任务*
  'b87a513e-99ec-4608-89db-3d6e97ef1432': 'XMJX',        // *项目结项*

  // < 人力 >
  '223f9387-d2d7-11e8-b8ca-0279b2c6a380' : 'YGDA',      // *员工档案*
  '98519ac0-d2d7-11e8-b8ca-0279b2c6a380' : 'YGRZ',      // *员工入职*
  'da7f15cc-d2d7-11e8-b8ca-0279b2c6a380' : 'YGLZ',      // *员工离职*
  '3dda676a-4ce0-4c4a-a56f-8bda50a8ef1f' : 'ZPJH',      // *招聘计划*
}
