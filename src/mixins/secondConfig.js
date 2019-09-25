  import { getBasicInfo} from 'service/commonService'
  export default {
    methods: {
        //请求baseinfo配置
    getBasicInfo() {
        return getBasicInfo().then(data => {
          this.baseinfoConfig = data;
        }); 
    },
      //二次配置覆盖
      getNewFormConfig(oldConfig,NewConfig) {
        NewConfig = JSON.parse(NewConfig);
        let containerCfg =  NewConfig && NewConfig.container,
            fieldsCfg = NewConfig && NewConfig.fields;
        
        if(NewConfig){
            if(NewConfig.form) {
                Object.assign(oldConfig,NewConfig.form);
            }; 
            oldConfig.items.forEach(function (fset) {
                //加载二次配置
                var name = fset.name,
                    isList = fset.isMultiple,
                    fields = fset.items,
                    grid;

                if (isList) {
                    if (fields) {
                        grid = Array.isArray(fields) ? fields[0] : fields;
                        fields = grid.columns;//r2Grid;
                    } else {
                        fields = fset.columns;//bom
                    }
                }
                //覆盖fieldSet配置
                if (name && containerCfg[name]) {
                    if (containerCfg[name].grid) {
                        Object.assign(grid, containerCfg[name].grid);//覆盖grid配置
                        delete containerCfg[name].grid;
                    }
                    Object.assign(fset, containerCfg[name]);
                }
                //覆盖字段配置
                if (fieldsCfg && fields) fields.forEach(function (f) {
                    var key = isList ? [name, f.fieldCode].join('.') : f.fieldCode;
                    fieldsCfg[key] && Object.assign(f, fieldsCfg[key]);
                });
            });
        }
      }
    }
  }
  