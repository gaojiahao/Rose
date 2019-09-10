
let objectList =  [
    {objName:'物料',defaultUrl:'dealer.png',picKey: 'inventoryPic'},
    {objName:'往来',defaultUrl:'dealer.png',picKey: 'dealerPic'},
    {objName:'费用',defaultUrl:'cost.png',picKey: 'costPic'},
    {objName:'仓库',defaultUrl:'warehouse.png',picKey: 'warehousePic'},
    {objName:'资金',defaultUrl:'fund.png',picKey: 'fundPic'},
    {objName:'工序',defaultUrl:'process.png',picKey: 'procedurePic'},
    {objName:'工艺',defaultUrl:'process.png',picKey: 'procedurePic'}
];

let getObjectByName = function(name) {
    return this.objectList.filter(val => val.objName === name)
}


export default {
    objectList,
    getObjectByName
}







