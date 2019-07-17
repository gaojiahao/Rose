var objectPrototype = Object.prototype,
    toString = objectPrototype.toString,
    trimRegex = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g;

export default{
    emptyFn:function(){},
    isDefined: function(value) {
        return typeof value !== 'undefined';
    },
    isPrimitive: function(value) {
        var type = typeof value;

        return type === 'string' || type === 'number' || type === 'boolean';
    },
    isBoolean: function(value) {
        return typeof value === 'boolean';
    },
    isNumber: function(value) {
        return typeof value === 'number' && isFinite(value);
    },
    isNumeric: function(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    isString: function(value) {
        return typeof value === 'string';
    },
    isArray: ('isArray' in Array) ? Array.isArray : function(value) {
        return toString.call(value) === '[object Array]';
    },
    isDate: function(value) {
        return toString.call(value) === '[object Date]';
    },
    isObject: (toString.call(null) === '[object Object]') ?
    function(value) {
        // check ownerDocument here as well to exclude DOM nodes 
        return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
    } :
    function(value) {
        return toString.call(value) === '[object Object]';
    },
    isFunction:
    // Safari 3.x and 4.x returns 'function' for typeof <NodeList>, hence we need to fall back to using 
    // Object.prototype.toString (slower) 
    (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value) {
        return !!value && toString.call(value) === '[object Function]';
    } : function(value) {
        return !!value && typeof value === 'function';
    },
    isSimpleObject: function(value) {
        return value instanceof Object && value.constructor === Object;
    },
    isEmpty: function(value, allowEmptyString) {
        return (value == null) || (!allowEmptyString ? value === '' : false) || (this.isArray(value) && value.length === 0)||(this.isObject(value) && this.isObjectEmpty(value));
    },
    trim: function(string) {
        if (string) {
            string = string.replace(trimRegex, "");
        }
        return string || '';
    },
    isObjectEmpty: function(object){
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;    
    },
    clone:function(a){
        return JSON.parse(JSON.stringify(a));
    },
    correctFloat:function(n) {
        return parseFloat(n.toPrecision(14));
    },
    getValueByNs: function (obj, ns) {
        var nsArr = this.isArray(ns) ? ns : ns.split('.'),
            l = nsArr.length,
            v = obj,
            i = 0;
        for (i = 0; i < l; i++) {
            v = v[nsArr[i]];
            if (v === undefined) break;
        }
        return v;
    },
    dateAdd:function(date, interval, value) {
        var utilDate = this,
            d = utilDate.clone(date),
            base = 0,
            day, decimalValue;
 
        if (!interval || value === 0) {
            return d;
        }
 
        decimalValue = value - parseInt(value, 10);
        value = parseInt(value, 10);
 
        if (value) {
            switch(interval.toLowerCase()) {
                case utilDate.MILLI:
                    d.setTime(d.getTime() + value);
                    break;
                case utilDate.SECOND:
                    d.setTime(d.getTime() + value * 1000);
                    break;
                case utilDate.MINUTE:
                    d.setTime(d.getTime() + value * 60 * 1000);
                    break;
                case utilDate.HOUR:
                    d.setTime(d.getTime() + value * 60 * 60 * 1000);
                    break;
                case utilDate.DAY:
                    d.setTime(d.getTime() + value * 24 * 60 * 60 * 1000);
                    break;
                case utilDate.MONTH:
                    day = date.getDate();
                    if (day > 28) {
                        day = Math.min(day, utilDate.getLastDateOfMonth(utilDate.add(utilDate.getFirstDateOfMonth(date), utilDate.MONTH, value)).getDate());
                    }
                    d.setDate(day);
                    d.setMonth(date.getMonth() + value);
                    break;
                case utilDate.YEAR:
                    day = date.getDate();
                    if (day > 28) {
                        day = Math.min(day, utilDate.getLastDateOfMonth(utilDate.add(utilDate.getFirstDateOfMonth(date), utilDate.YEAR, value)).getDate());
                    }
                    d.setDate(day);
                    d.setFullYear(date.getFullYear() + value);
                    break;
            }
        }
 
        if (decimalValue) {
            switch (interval.toLowerCase()) {
                case utilDate.MILLI:    base = 1;               break;
                case utilDate.SECOND:   base = 1000;            break;
                case utilDate.MINUTE:   base = 1000*60;         break;
                case utilDate.HOUR:     base = 1000*60*60;      break;
                case utilDate.DAY:      base = 1000*60*60*24;   break;
 
                case utilDate.MONTH:
                    day = utilDate.getDaysInMonth(d);
                    base = 1000*60*60*24*day;
                    break;
 
                case utilDate.YEAR:
                    day = (utilDate.isLeapYear(d) ? 366 : 365);
                    base = 1000*60*60*24*day;
                    break;
            }
            if (base) {
                d.setTime(d.getTime() + base * decimalValue); 
            }
        }
 
        return d;
    },
    correctFloat:function(n) {
        return parseFloat(n.toPrecision(14));
    },
    round:function(value, precision) {
        var result = Number(value);
        if (typeof precision === 'number') {
            precision = Math.pow(10, precision);
            result = Math.round(value * precision) / precision;
        } else if (precision === undefined) {
            result = Math.round(result);
        }
        return result;
    },
    setFormulas(vm,computed){
        var watchers = vm._computedWatchers || (vm._computedWatchers = Object.create(null)),
            Watcher = vm.$parent._watcher.constructor,
            Dep = vm.$data.__ob__.dep.constructor,
            getter,
            noop = this.emptyFn,
            computedWatcherOptions = {lazy:true};

        for (var key in computed) {
            getter = computed[key];
            
            watchers[key] = new Watcher(
                vm,
                getter || noop,
                noop,
                computedWatcherOptions
            );
        }

        if (!(key in vm)) {
           Object.defineProperty(vm, key, {get:createComputedGetter(key),set:this.emptyFn});
        } else {
            console.log('公式' + key + '已经定义过了')
        }
        function createComputedGetter (key) {
            return function computedGetter () {
                var watcher = this._computedWatchers && this._computedWatchers[key];
                if (watcher) {
                    if (watcher.dirty) {
                        watcher.evaluate();
                    }
                    if (Dep.target) {
                        watcher.depend();
                    }
                    return watcher.value
                }
            }
        }
    },
    DAY : "d",
    MONTH : "mo",
    YEAR : "y",
    each:function(items,fn){
        var i = 0,l = items.length,
            rs;

        for(;i<l;i++){
            rs = fn(items[i],i,items);
            if(rs == false)break;
        }
    }
}