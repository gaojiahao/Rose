function DataMode(data){
    this.data = data;
    this.changeMap = {};
}
DataMode.prototype.get = function(key){
    return this.data[key];
}
DataMode.prototype.set = function(key,value){
    this.data[key] = value;
    this.changeMap[key] = true;
}
DataMode.prototype.commit = function(){
    this.changeMap = {};
}
DataMode.prototype.getChanges = function(){
    return this.changeMap;
}
export default DataMode;