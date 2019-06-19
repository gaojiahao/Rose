var objectPrototype = Object.prototype,
    toString = objectPrototype.toString,
    trimRegex = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g;

export default{
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
    trim: String.prototype.trim || function(string) {
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
    }
}