function DataMode(data){
    this.data = data;
}

DataMode.prototype.get = (key)=>{
    return this.data[key];
}
DataMode.prototype.set = (key,value) =>{
    this.data[key] = value;
}
export default DataMode;