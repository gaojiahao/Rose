import util from '@/common/util';
function DataMode(data,owner){
    this.data = data;
    this.owner = owner;
    this.changeMap = {};
}
DataMode.prototype.get = function(key){
    return this.data[key];
}
DataMode.prototype.set = function(key,newValue,options){
    var single = util.isString(key),
        owner = this.owner,
        opt = (single ? options : newValue),
        commit = opt && opt.commit,
        name,
        value,
        oldValue,
        values;

    if (single) {
        values = {};
        values[key] = newValue;
    } else {
        values = key;
    }
    
    for (name in values) {
        value = values[name];
        oldValue = this.data[name];
        owner.$set(this.data,name,value);
        if(typeof commit!=='undefined') {
            if(value !== oldValue && (typeof(oldValue)!=='undefined' || !commit)){
                this.changeMap[key] = true;
            }    
        } else {
            if(value !== oldValue && typeof(oldValue)!=='undefined' && !commit){
                this.changeMap[key] = true;
            }    
        }
    }    
}
DataMode.prototype.commit = function(){
    this.changeMap = {};
}
DataMode.prototype.getChanges = function(){
    return this.changeMap;
}
export default DataMode;