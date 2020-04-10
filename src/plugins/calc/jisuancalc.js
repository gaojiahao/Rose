let Rxports = {
    // 两个数字相加
    accAdd(arg1, arg2) {
        var r1, r2, m, c;
        try {
        let arr1 = arg1.toString().split(".");
        r1 = arr1[1] && arr1[1].length || 0;
        }
        catch (e) {
            r1 = 0;
            console.error(e)
        }
        try {
        let arr2 = arg2.toString().split(".");
        r2 = arr2[1] && arr2[1].length || 0;
        }
        catch (e) {
            r2 = 0;
        console.error(e)
        }
        c = Math.abs(r1 - r2);
        m = Math.pow(10, Math.max(r1, r2));
        if (c > 0) {
            var cm = Math.pow(10, c);
            if (r1 > r2) {
                arg1 = Number(arg1.toString().replace(".", ""));
                arg2 = Number(arg2.toString().replace(".", "")) * cm;
            } else {
                arg1 = Number(arg1.toString().replace(".", "")) * cm;
                arg2 = Number(arg2.toString().replace(".", ""));
            }
        } else {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", ""));
        }
        return (arg1 + arg2) / m;
    },

    // 数字相乘，可传入多个数字
    accMul(...args) {
        let m = 0;
        let total = 1;
        try {
            for (let item of args) {
            // 不存在则不进行计算
            if (item === undefined || isNaN(item)) {
                continue
            }
            item = `${Number(item)}`;
            let iArr = item.split('.');
            if (iArr.length > 1) {
                m += item.split('.')[1].length;
            }
            total *= Number(item.replace('.', ''));
            }
        } catch (e) {

        }
        return total / Math.pow(10, m);
    },

    // 两个数字相减
    accSub(arg1, arg2) {
        var r1, r2, m, n;
        try {
        let arr1 = arg1.toString().split(".");
        r1 = arr1[1] && arr1[1].length || 0;
        }
        catch (e) {
            r1 = 0;
        console.error(e)
        }
        try {
        let arr2 = arg2.toString().split(".");
        r2 = arr2[1] && arr2[1].length || 0;
        }
        catch (e) {
            r2 = 0;
        console.error(e)
        }
        m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
        n = (r1 >= r2) ? r1 : r2;
        return ((arg1 * m - arg2 * m) / m).toFixed(2);
    },

    // 两个数字相除
    accDiv(arg1, arg2) {
        if (isNaN(arg1)) {
            arg1 = 0;
        }
        if (isNaN(arg2)) {
            arg2 = 0;
        }
        arg1 = Number(arg1);
        arg2 = Number(arg2);

        var t1 = 0, t2 = 0, r1, r2;
        try {
        let arr1 = arg1.toString().split(".");
        t1 = arr1[1] && arr1[1].length || 0;
        }
        catch (e) {
        console.error(e)
        }
        try {
        let arr2 = arg2.toString().split(".");
        t2 = arr2[1] && arr2[1].length || 0;
        }
        catch (e) {
        console.error(e)
        }
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 / r2) * Math.pow(10, t2 - t1);
    },
    
    tofixed(val, length = 2) {
        if (val === undefined || !/^-?\d*\.?\d*$/.test(val)) {
            //console.error('the value can not change to number');
            return ''
        }
        // 获取整数值和小数值
        let [ num = '', dec = '' ] = `${val}`.split('.'); 
        // 将 0 补全
        if (dec.length < length) {
            dec = `${dec}${'0'.repeat(length - dec.length)}`; 
        }
        
        // 小数位长度多于要保留的长度
        if (dec.length !== length) {
            // 给要保留的位数后加小数点
            dec = `${dec.substr(0, length)}.${dec.substr(length)}`; 
            // 四舍五入
            dec = `${Math.round(dec)}`; 
            // 往前面补0 处理类似001这种情况
            if (dec.length < length) {
            dec = `${'0'.repeat(length - dec.length)}${dec}`; 
            }
            // 当情况为 X.995 ~ X.999 这种情况的时候 如果强制保留两位会出现 X.00 num则需要累加
            if (dec >= 100 && length === 2) {
            let [ moreNum = '' ] = dec.split('');
            num = accAdd(num, moreNum);
            dec = dec.substr(1);
            }
        }
        return parseFloat(`${num}.${dec}`)
    }   

}
export default Rxports;
