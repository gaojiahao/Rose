
let objectList =  [
    {objName:'物料',objCode:'inventory',defaultUrl:'wl_default03.png',picKey: 'inventoryPic'},
    {objName:'往来',objCode:'dealer',defaultUrl:'dealer.png',picKey: 'dealerPic'},
    {objName:'费用',objCode:'cost',defaultUrl:'cost.png',picKey: 'costPic'},
    {objName:'仓库',objCode:'warehouse',defaultUrl:'warehouse.png',picKey: 'warehousePic'},
    {objName:'资金',objCode:'funds',defaultUrl:'fund.png',picKey: 'fundPic'},
    {objName:'工序',objCode:'procedure',defaultUrl:'process.png',picKey: 'procedurePic'},
    {objName:'工艺',objCode:'technics',defaultUrl:'process.png',picKey: 'procedurePic'},
    {objName:'设施',objCode:'facility',defaultUrl:'facility.png',picKey: 'facilityPic'}
];

let getObjectByName = function(code) {
    return this.objectList.filter(val => val.objCode === code);
}


export default {
    objectList,
    getObjectByName
}







