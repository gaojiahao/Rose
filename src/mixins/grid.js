import util from '@/common/util';
import Record from '@/common/record';
import {
    getValuesByExp,
    convertDataType
} from "service/commonService";

export default {
    data() {
        return {
            isEdit: false,
            selection: []
        };
    },
    methods: {
        addRecord: function(){
            var me = this,
                rows,
                index;
            
            if(me.hasDs){
                me.showGridPicker();
            } else {
                me.addRecords([{}]);
                rows = me.getValue();
                index = rows.length - 1;
                me.onShowDetail(rows[index],index);
            }
        },
        addRecords: function (selection) {
            var value = this.getValue() || [],
                record,
                row, i = 0, l = selection.length;

            for (i; i < l; i++) {
                row = selection[i];
                record = this.createRecord(row);
                value.push(record.data);
            }
            this.setValue(value);
        },
        createRecord: function (row) {
            var me = this,
                data = {},
                record = new Record(data, me),
                editorFieldCode,
                dataSourceBind = this.dataSourceBind;

            this.setDefaultValue(record);
            if (dataSourceBind) {
                editorFieldCode = dataSourceBind.k;
                data[editorFieldCode] = row[dataSourceBind.v];
                this.setValueBindValue(record, editorFieldCode, row);
            } else if (me.cfg.dataIndexMap) {
                //适配AccountGrid
                me.handlerValueBindByIndexMap(record, row, me.cfg.dataIndexMap);
            }
            me.executeExpression(record, editorFieldCode);
            return record;
        },
        
        
        checkAll() {
            // 如果已全部选中 则清除所有选中状态
            if (this.selection.length === this.values.length) {
                this.selection = [];
            } else {
                this.selection = this.values.map((item, index) => index);
            }

        },
        doDelete: function () {
            this.$vux.confirm.show({
                content: '确认删除?',
                // 确定回调
                onConfirm: () => {
                    var selection = this.selection,
                        rowIndex,
                        newValues = [];

                    this.values.forEach((row, rowIndex) => {
                        if (selection.indexOf(rowIndex) == -1) {
                            newValues.push(row);
                        }
                    })
                    this.setValue(newValues);
                    this.isEdit = false;
                }
            });
        },
        doDetailEdit(data) {
            var value = util.clone(data);
            this.$set(this.values, this.detailRowNumer, data);
        },
        delClick(rowIndex) {
            var selection = this.selection,
                index;

            if (selection.length) {
                index = selection.indexOf(rowIndex);
                if (index != -1) {
                    selection.splice(index, 1);
                } else {
                    selection.push(rowIndex);
                }
            } else {
                selection.push(rowIndex);
            }
        },
        executeExpression(record, editorFieldCode) {
            var me = this,
                expressionCfg = me.expressionCfg,
                i, l,
                num,
                cfg,
                dataIndex,
                changeFieldCodes = record.getChanges(),
                getNumber = function (fieldCode) {
                    var form = me.form;
                    return Number(form.getValues()[fieldCode]);
                },
                loanDay = function (qty, date) {
                    return util.dateAdd((new Date(date)), util.DAY, 0 - Number(qty));
                };


            if (expressionCfg) for (i = 0, l = expressionCfg.length; i < l; i++) {
                cfg = expressionCfg[i];
                dataIndex = cfg.col.fieldCode;
                if (editorFieldCode == dataIndex || dataIndex in changeFieldCodes) continue; //当前编辑字段，不重新计算。
                if (cfg.type == 'calc') {
                    cfg = CalcToCmd(cfg);    
                }
                if (cfg.type == 'cmd') {
                    try {
                        num = util.round(util.correctFloat(eval(cfg.cmd)), cfg.col.decimalPrecision);
                        num = (Number.isNaN(num) || (num === Infinity)) ? 0 : num;
                        record.set(dataIndex, convertDataType(cfg.col.editorType, num));
                    } catch (ex) {
                        console.warn(ex);
                    }
                } else if (cfg.type == 'fn') {
                    try{
                        var arr = [],
                            flag;
                        arr.push(record.data);
                        flag = me.valiGridData(arr, me.cfg.columns);
                        if(!flag) {
                            break;
                        } else {
                            num = cfg.fn.call(me, record, editorFieldCode);
                            if (num != null && !isNaN(num) && cfg.col.decimalPrecision != null) num = util.round(num, cfg.col.decimalPrecision);
                            if (num != null) record.set(dataIndex, convertDataType(cfg.col.editorType, num));
                        }
                    } catch (ex) {
                        console.warn(ex);
                    }
                } else if (cfg.type == 'calc') {
                    try{
                        var exp = record.get(cfg.v1) + cfg.symbol + record.get(cfg.v2);
                        num = util.round(util.correctFloat(eval(exp)), cfg.col.decimalPrecision);
                        num = (Number.isNaN(num) || (num === Infinity)) ? 0 : num;
                        record.set(dataIndex, convertDataType(cfg.col.editorType, num));
                    } catch (ex) {
                        console.warn(ex);
                    }
                }
            }

            function CalcToCmd(cfg) {
                var changeItems = record.getChanges(),
                    v1,
                    v2;

                if (cfg.v1 in changeItems || cfg.v2 in changeItems) {
                    v1 = record.get(cfg.v1);
                    v2 = record.get(cfg.v2);
                    v1 = v1 == +v1 ? v1 : 0;
                    v2 = v2 == +v2 ? v2 : 0;
                    //设置计算结果
                    if (v2 != 0 || cfg.symbol != '/') {
                        return {
                            type: 'cmd',
                            cmd: v1 + cfg.symbol + v2,
                            col: cfg.col
                        };
                    }
                }
                return cfg;
            }
        },
        formatByType(value,type){
            if(value == null) return '-';
            if(~['r2Numberfield','r2Permilfield'].indexOf(type)){
              return util.permilFormat(value);
            } else if(type == 'r2Percentfield'){
                return util.permilFormat(value*100);  
            } else {
              return value
            }
        },
        getSubmitData: function () {
            var values = this.getValue(),
                data = { dataSet: [] },
                columns = this.cfg.columns,
                submitFieldCodes = columns.filter(function (c) {
                    return c.submitValue;
                }).map(function (c) { return c.fieldCode }),
                newValue = data.dataSet,
                key,
                value,
                newRow;

            values.map(function (row) {
                newRow = {};
                util.each(submitFieldCodes, function (key) {
                    value = row[key];
                    if (typeof value == 'undefined') {
                        newRow[key] = null;
                    } else if (typeof value != 'object') {
                        newRow[key] = row[key];
                    }
                });
                newValue.push(newRow);
            })

            return data;
        },
        getComponentByCfg: function (cfg) {
            if (cfg.contrl) {
                return this.form.fieldMap[cfg.contrl];
            }
        },
        getValueByConfig(cfg) {
            var value,
                cmp;

            if (cfg.type == 'formData') {
                cmp = this.getComponentByCfg(cfg.data);
                if (cmp) value = cmp.getExtraFieldValue(cfg.data.valueField);
            } else if (cfg.type == 'contextData') {
                value = getValuesByExp(cfg.data);
            } else if (cfg.type == 'staticData') {
                value = cfg.data[0];
            }
            return value;
        },
        /**
         * 处理重复项参数关联，当一个记录中的参数字段变化时，
         * 清空数据源用到该字段做参数的字段。
         * @author xinghua.shi
         */
        handleParamChange: function (record) {
            var me = this,
                paramColumns = me.paramColumns,
                valuebind = me.valueBindCfg,
                editorDataIndexs,
                editorDataIndex,
                changeDataIndex,
                l,
                i,
                changes;

            if (!paramColumns && valuebind == null) return;
            changes = record.getChanges();
            for (changeDataIndex in changes) {
                loopfn(changeDataIndex);
            }
            function loopfn(changeDataIndex) {
                var cfgArr;

                if (paramColumns && changeDataIndex in paramColumns) {
                    editorDataIndexs = paramColumns[changeDataIndex];//用该列做参数的编辑器列的"dataIndex数组"
                    for (i = 0, l = editorDataIndexs.length; i < l; i++) {
                        editorDataIndex = editorDataIndexs[i];
                        if (editorDataIndex in changes) continue;//如果编辑器所在列的值已经发生变化，则不再做清空操作。
                        if (record.get(editorDataIndex) != null) {
                            record.set(editorDataIndex, undefined);
                            loopfn(editorDataIndex);
                        }
                    }
                }
                //同时清空“值绑定”到该编辑器的列
                if (record.get(changeDataIndex) == null && valuebind && changeDataIndex in valuebind) {
                    cfgArr = valuebind[changeDataIndex];
                    util.each(cfgArr, function (cfg) {
                        if (record.get(cfg.fieldCode) != null) {
                            record.set(cfg.fieldCode, undefined);
                            loopfn(cfg.fieldCode);
                        }

                    })
                }
            }
        },
        handleOutParamChange: function (bindCmp, column) {
            var me = this,
                values = me.getValue(),
                record,
                dataIndex = column.fieldCode;

            if (bindCmp.changeEventSource == 'setVal') return;
            if (values) values.forEach(function (data) {
                record = new Record(data, me);
                record.set(dataIndex, undefined);
                me.handleParamChange(record);
            });
        },
        //默认值来自单一项的值时，处理单一项值发生改变的情况
        handleDefaultValueChange(fieldCode, value) {
            var me = this,
                record,
                values = me.getValue();

            if (values) values.forEach(function (data) {
                record = new Record(data, me);
                record.set(fieldCode, value);
                //处理数据变化
                me.handleParamChange(record);
            });
        },
        handlerValueBind: function (record, selection, editorFieldCode, cfgArr,gridDetail) {
            var extra = {},
                isEdit = !!gridDetail;

            extra[editorFieldCode + '.extraData'] = util.clone(selection);
            cfgArr.forEach(function (cfg) {
                var valueField = cfg.valueField,
                    targetFieldCode = cfg.fieldCode,
                    value;

                try {
                    value = util.isArray(valueField) ? util.getValueByNs(extra, valueField) : eval('extra' + valueField);
                    value = convertDataType(cfg.editorType, value);
                    record.set(targetFieldCode, value);
                    if(gridDetail){
                        setTimeout(function(){
                            //放到下一个执行队列的原因是，保障值清空先进行，重新加载数据后执行，可以再设置一个默认值。
                            gridDetail.$emit('field-change-'+targetFieldCode,gridDetail,value);
                        },0)
                        
                    }
                } catch (ex) {
                    console.warn(ex);
                }
            });
            if(isEdit){
                this.handleParamChange(record);
            }
        },
        handlerValueBindByIndexMap: function (record, selection, map) {
            var extra = util.clone(selection);
            for (let k in map) {
                record.set(k, extra[map[k]]);
            }
        },
        
        isChecked(rowIndex) {
            return this.selection.indexOf(rowIndex) != -1;
        },
        isCheckAll() {
            return this.values && this.values.length == this.selection.length;
        },
        isValid: function () {
            var me = this,
                value = me.getValue();

            if(!me.$parent.hidden) { 
                if (value == null || value.length == 0) {
                    me.$vux.alert.show({
                        content: '请选择' + (me.listTitle || '物料')
                    });
                    return false;
                }
                return me.validateData(value, me.cfg.columns);
            } else {
                return true;
            }
        },
        initNumberVerSel() {
            return true;
        },
        initDefaultValueCfg: function () {
            var me = this,
                cfg = me.cfg,
                form = me.form,
                gridId = cfg.id,
                cfgArr = [],
                columns = cfg.columns;
            //如果grid里面的控件引用的表单里面其他的控件，当表单里面其他的控件发生变化时，需要更新grid里面的值
            columns.forEach(function (c) {
                var cfg,
                    cmp,
                    cmpId;

                if (c.defaultValue) {
                    try {
                        cfg = util.isString(c.defaultValue) ? JSON.parse(c.defaultValue) : c.defaultValue;
                    } catch (e) {
                        return;
                    }

                    if (cfg && cfg.type == 'formData') {
                        cmp = me.getComponentByCfg(cfg.data);
                        cmpId = cmp && cmp.cfg.id;

                        if (cmp && cmpId != gridId) {
                            form.$on('value-change-' + cmpId, function (cmp, e) {
                                var value = '';
                                if (cmp == null || cmp.changeEventSource == 'setVal') return;
                                value = cmp.getExtraFieldValue(cfg.data.valueField);
                                me.handleDefaultValueChange(c.fieldCode, value);
                            });
                            cfgArr.push(c);
                        }
                    } else {
                        cfgArr.push(c);
                    }

                }

            });
            me.defaultValueCfgArr = cfgArr;
        },
        initEditorParamsCfg: function () {
            var me = this,
                cfg = me.cfg,
                paramColumns = {},
                editorTypes = ['r2Combo', 'r2Selector', 'r2SelectorPlus'],
                columns = cfg.columns;

            if (cfg.readOnly) return;
            columns.forEach(function (column) {
                var paramKey,
                    paramCfgMap,
                    paramCfg,
                    dataIndex,
                    contrl,
                    ds = column.dataSource;

                if (column.editorType && ~editorTypes.indexOf(column.editorType) && ds && ds.data) {
                    paramCfgMap = ds.data.params;
                    for (paramKey in paramCfgMap) {
                        paramCfg = paramCfgMap[paramKey];
                        if (paramCfg.type == 'contrl') {
                            contrl = me.getComponentByCfg(paramCfg.value);
                            if (contrl == me) {
                                //当参数改变时，清空当前列的值。
                                dataIndex = paramCfg.value.dataIndex;
                                if (dataIndex) {
                                    if (paramColumns[dataIndex]) {
                                        paramColumns[dataIndex].push(column.fieldCode);
                                    } else {
                                        paramColumns[dataIndex] = [column.fieldCode];
                                    }
                                }
                            } else if (contrl != null) {
                                me.form.$on("value-change-" + contrl.cfg.id,
                                (function(contrl, column) {
                                    return function() {
                                      var arg = Array.prototype.slice.call(arguments);
                                      arg.unshift(contrl, column);
                                      me.handleOutParamChange.apply(me, arg);
                                    };
                                })(contrl, column));
                            }
                        }
                    }
                }
            });
             /*
            *参数关联时，如果参数列（字段）的数据映射（dataindex)记录整体下来，
            *当参数列的值变化时，清空当前记录（record）中使用到该字段值做为参数的字段映射对应的值。
            */
            if (!util.isObjectEmpty(paramColumns)) {
                me.paramColumns = paramColumns;
            }
        },
        initValueBindAndExpressionCfg: function () {
            var me = this,
                cfg = me.cfg,
                reg = /\[([\u4e00-\u9fa5]|[\w|#.])*\]|(getNumber\('\w*'\)|loanDay|max|min|,|\/|\*|\+|-|\?|>|<|:|\d|\(|\))/gi,
                regForCalc = /^\[(\w+)\]([+-/*])\[(\w+)\]$/,
                valueBindCfg = {},
                expressionCfg = [],
                columns = cfg.columns;

            //xing 提交时也可以只读
            if ((cfg.readOnly || cfg.allowEdit == false) && cfg.xtype != 'r2AutoLoadGrid') return;
            columns.forEach(function (column) {
                var ds = column.valueBind || column.defaultValue || column.dataSource, //除了valueBind，其他的都是在做向前兼容,
                    expression = util.trim(column.expression),
                    fieldCode = column.fieldCode,
                    cfg,
                    dsDataIndex,
                    dsArr;

                if (!util.isEmpty(ds)) {
                    dsArr = util.isArray(ds) ? ds : [ds];
                    dsArr.forEach(function (ds) {
                        if ((ds.type === 'formData' && ds.data.contrl === me.cfg.id)) {
                            dsDataIndex = ds.data.dataIndex;
                            cfg = {
                                valueField: ds.data.valueField,
                                editorType: column.editorType,
                                fieldCode: fieldCode
                            };
                            //TODO：AccountGrid是利用字段进行映射的，不是通过Column进行bind的
                            if (dsDataIndex) {
                                if (valueBindCfg[dsDataIndex]) {
                                    valueBindCfg[dsDataIndex].push(cfg);
                                } else {
                                    valueBindCfg[dsDataIndex] = [cfg];
                                }
                            } else {
                                console.log(column.text + '数据源设置中缺少dataIndex');
                            }

                        }
                    })
                }
                if (!util.isEmpty(expression)) {
                    expression = parseExpression(expression, column);
                    if (expression) {
                        expressionCfg.push(expression);
                    }
                }
            });

            if (!util.isObjectEmpty(valueBindCfg)) {
                me.valueBindCfg = valueBindCfg;
            }
            if (expressionCfg.length) {
                me.expressionCfg = expressionCfg;
            }

            function parseExpression(expression, col) {
                var cmd,
                    fn,
                    _t,
                    matchRs,
                    isCalcDate;

                if (expression.indexOf('logic@') > -1) {
                    cmd = 'record.' + expression.replace('logic@', '');
                    return {
                        type: 'cmd',
                        cmd: cmd,
                        col: col
                    }
                } else if (expression.indexOf('function') == 0) {
                    try {
                        fn = eval('(' + expression + ')');
                    } catch (e) {
                        console.log(col.text + '计算公式', e);
                    }
                    if (fn && util.isFunction(fn)) {
                        if (window.isDebug) console.log(col.text + '公式', fn);
                        return {
                            type: 'fn',
                            fn: fn,
                            col: col
                        }
                    }
                } else if (regForCalc.test(expression)) {
                    matchRs = regForCalc.exec(expression);
                    if (window.isDebug) console.log(col.text, expression);
                    if (matchRs[0] == expression) {
                        return {
                            type: 'calc',
                            col: col,
                            symbol: matchRs[2],
                            v1: matchRs[1],
                            v2: matchRs[3]
                        };
                    }
                } else {
                    isCalcDate = expression.indexOf('calcDate@') > -1,
                        /**
                         * isCalcDate 判断是否是日期计算 加前缀 'calcDate@'
                         */
                        isCalcDate && (expression = expression.replace('calcDate@', ''));
                    _t = expression.match(reg);
                    if (_t) {
                        cmd = _t.map(function (o) {
                            if (o.indexOf('[') > -1) {
                                var start = isCalcDate ? 'new Date(' : '',
                                    end = isCalcDate ? ')' : '';
                                o = start + 'record.data["' + o.substring(1);
                                o = o.replace(']', '"]') + end;
                                return o;
                            } else {
                                return o;
                            }
                        }).join('');
                        isCalcDate && (cmd = '(' + cmd + ') / 86400000');
                        return {
                            type: 'cmd',
                            cmd: cmd,
                            col: col
                        }
                    }
                }
            }
        },
      
        setValueBindValue(record, editorFieldCode, selection) {
            var me = this,
                //疑惑
                valuebind = me.valueBindCfg,
                cfgArr;

            //疑惑
            if (valuebind && editorFieldCode in valuebind) {
                cfgArr = valuebind[editorFieldCode];
                me.handlerValueBind(record, selection, editorFieldCode, cfgArr);
            } 
        },
        setDefaultValue(record) {
            var me = this,
                cols = me.defaultValueCfgArr,
                cfg,
                value;

            cols.forEach(function (c) {
                cfg = util.isString(c.defaultValue) ? JSON.parse(c.defaultValue) : c.defaultValue;
                value = me.getValueByConfig(cfg);
                record.set(c.fieldCode, convertDataType(c.editorType, value));
            });
        },
        toggleEditStatus() {
            if(this.cfg.readOnly == false){
                this.isEdit = !this.isEdit;
                this.selection = [];
            }
            
        },
        validateData: function (value, columns) {
            var me = this,
                columnHash = {},
                disallowBlankCols = [],
                numberVerifyCols = [],
                fnValiCols = [],
                fnError,
                errorMsgArr = [],
                eqHash = {
                    '>': '大于',
                    '<': '小于',
                    '==': '等于',
                    '!=': '不等于'
                },
                conditionMap = {
                    eq: ['!='],
                    lt: ['>', '=='],
                    gt: ['<', '=='],
                    lteq: ['>'],
                    gteq: ['<']
                },
                eqErrorKey,
                releColumn,
                nowColmn = '',
                numVerReleColmn = '',
                nowData = '',
                numData = '',
                validResult = true,
                validateFn,
                getData = function (col, record) {
                    if (col.editorType != "r2Datefield") {
                        return record.data[col.fieldCode];
                    } else {
                        return Date((record.data[col.fieldCode]).replace(/-/g, '/')).getTime();
                    }
                };

            (function (columns) {
                var i,
                    l = columns.length,
                    column,
                    dataIndex;

                for (i = 0; i < l; i++) {
                    column = columns[i];
                    dataIndex = column.fieldCode;
                    if (dataIndex) {
                        columnHash[dataIndex] = column;
                    }
                    if (column.allowBlank == false) {
                        disallowBlankCols.push(column);
                    }
                    if (column.numberVerify) {
                        numberVerifyCols.push(column);
                    }
                    if (column.validateFn) {
                        fnValiCols.push(column);
                    }
                }
            })(columns);

            util.each(value, function (row, index) {
                var record = new Record(row, me);

                util.each(disallowBlankCols, function (col) {
                    if (util.isEmpty(row[col.fieldCode])) {
                        errorMsgArr.push('重复项第【' + (index + 1) + '】项的【' + col.text + '】未填写!');
                        validResult = false;
                        return false;
                    }
                });
                if (validResult) {
                    util.each(fnValiCols, function (col) {
                        validateFn = col.validateFn;
                        if ((fnError = validateFn.call(me, record, record.get(col.fieldCode)))) {
                            validResult = false;
                            errorMsgArr.push('重复项中第【' + (index + 1) + '】行【' + col.text + '】' + fnError);
                            return false;
                        }
                    });
                } else {
                    return false;
                }

                if (validResult) {
                    util.each(numberVerifyCols, function (col) {
                        var i, l, conditions,
                            key,
                            numberVerify = col.numberVerify;

                        nowColmn = col.text;
                        if (col.numVerReleCol && columnHash[col.numVerReleCol]) {
                            eqErrorKey = null;
                            nowData = getData(col, record);
                            releColumn = columnHash[col.numVerReleCol];
                            numVerReleColmn = releColumn.text;
                            numData = getData(releColumn, record);

                            conditions = conditionMap[numberVerify];
                            for (i = 0, l = conditions.length; i < l; i++) {
                                key = conditions[i];
                                if (eval('nowData ' + key + ' numData')) {
                                    validResult = false;
                                    errorMsgArr.push('重复项中第【' + (index + 1) + '】行【' + nowColmn + '】输入值' + eqHash[key] + '【' + numVerReleColmn + '】');
                                    return false;
                                }
                            }

                        } else {
                            errorMsgArr.push('【' + nowColmn + '】未配置校验关联列');
                            validResult = false;
                            return false;
                        }
                    });
                } else {
                    return false;
                }
            });
            if (errorMsgArr.length) me.$vux.alert.show({
                content: errorMsgArr.join('</br>')
            });
            return validResult;
        },
        valiGridData: function (value, columns) {
            var me = this,
                columnHash = {},
                disallowBlankCols = [],
                numberVerifyCols = [],
                fnValiCols = [],
                fnError,
                errorMsgArr = [],
                eqHash = {
                    '>': '大于',
                    '<': '小于',
                    '==': '等于',
                    '!=': '不等于'
                },
                conditionMap = {
                    eq: ['!='],
                    lt: ['>', '=='],
                    gt: ['<', '=='],
                    lteq: ['>'],
                    gteq: ['<']
                },
                eqErrorKey,
                releColumn,
                nowColmn = '',
                numVerReleColmn = '',
                nowData = '',
                numData = '',
                validResult = true,
                validateFn,
                getData = function (col, record) {
                    if (col.editorType != "r2Datefield") {
                        return record.data[col.fieldCode];
                    } else {
                        return Date((record.data[col.fieldCode]).replace(/-/g, '/')).getTime();
                    }
                };

            (function (columns) {
                var i,
                    l = columns.length,
                    column,
                    dataIndex;

                for (i = 0; i < l; i++) {
                    column = columns[i];
                    dataIndex = column.fieldCode;
                    if (dataIndex) {
                        columnHash[dataIndex] = column;
                    }
                    if (column.allowBlank == false) {
                        disallowBlankCols.push(column);
                    }
                    if (column.numberVerify) {
                        numberVerifyCols.push(column);
                    }
                    if (column.validateFn) {
                        fnValiCols.push(column);
                    }
                }
            })(columns);

            util.each(value, function (row, index) {
                var record = new Record(row, me);

                if (validResult) {
                    util.each(numberVerifyCols, function (col) {
                        var i, l, conditions,
                            key,
                            numberVerify = col.numberVerify;

                        nowColmn = col.text;
                        if (col.numVerReleCol && columnHash[col.numVerReleCol]) {
                            eqErrorKey = null;
                            nowData = getData(col, record);
                            releColumn = columnHash[col.numVerReleCol];
                            numVerReleColmn = releColumn.text;
                            numData = getData(releColumn, record);

                            conditions = conditionMap[numberVerify];
                            for (i = 0, l = conditions.length; i < l; i++) {
                                key = conditions[i];
                                if (eval('nowData ' + key + ' numData')) {
                                    validResult = false;
                                    errorMsgArr.push('重复项中第【' + (index + 1) + '】行【' + nowColmn + '】输入值' + eqHash[key] + '【' + numVerReleColmn + '】');
                                    return false;
                                }
                            }

                        } else {
                            errorMsgArr.push('【' + nowColmn + '】未配置校验关联列');
                            validResult = false;
                            return false;
                        }
                    });
                } else {
                    return false;
                }
            });
            if (errorMsgArr.length) me.$vux.alert.show({
                content: errorMsgArr.join('</br>')
            });
            return validResult;
        },
        getExtraFieldValue:function(valueField){
            return this.getValue();
        },
    }
}