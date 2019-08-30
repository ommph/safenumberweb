/**
 * js公共函数
 * @author Yampery
 */

/********************************************** jqgrid表格相关 *******************************************/
//jqGrid的配置信息
$.jgrid.defaults.width = 1000;
$.jgrid.defaults.responsive = true;
$.jgrid.defaults.styleUI = 'Bootstrap';

/**
 * 选择表格一条记录
 * @returns {*}
 */
function getSelectedRow() {
    var grid = $("#jqGrid");
    var rowKey = grid.getGridParam("selrow");
    if(!rowKey){
        alert("请选择一条记录");
        return ;
    }

    var selectedIDs = grid.getGridParam("selarrrow");
    if(selectedIDs.length > 1){
        alert("只能选择一条记录");
        return ;
    }

    return selectedIDs[0];
}

/**
 * 根据行id获取行数据
 * @param rowId
 * @returns {jQuery}
 */
function getSelectedRowData(rowId) {

    var rowData = $("#jqGrid").jqGrid('getRowData',rowId);
    // console.log(rowData);
    return rowData;
}

//选择多条记录
function getSelectedRows() {
    var grid = $("#jqGrid");
    var rowKey = grid.getGridParam("selrow");
    if(!rowKey){
        alert("请选择一条记录");
        return ;
    }

    return grid.getGridParam("selarrrow");
}

//

/********************************************** window工具 *******************************************/
//工具集合Tools
window.T = {};

// 获取请求参数
// 使用示例
// location.href = http://localhost:8080/index.html?id=123
// T.p('id') --> 123;
var url = function(name) {
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r!=null)return  unescape(r[2]); return null;
};
T.p = url;

//全局配置
$.ajaxSetup({
	dataType: "json",
	contentType: "application/json",
	cache: false
});

//重写alert
window.alert = function(msg, callback){
	parent.layer.alert(msg, function(index){
		parent.layer.close(index);
		if(typeof(callback) === "function"){
			callback("ok");
		}
	});
}

//重写confirm式样框
window.confirm = function(msg, callback){
	parent.layer.confirm(msg, {btn: ['确定','取消']},
	function(){//确定事件
		if(typeof(callback) === "function"){
			callback("ok");
		}
	});
}

/**
 * 获取输入字符长度，每个汉字按2字符算
 * @param val
 * @returns {Number}
 */
function getByteLen(val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        var a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null) {
            len += 2;
        }
        else {
            len += 1;
        }
    }
    return len;
}

/**
 * 判断是参数否为""/空格/undefined/null
 * @param arg1
 * @returns
 */
function isNull(str){
    var isNull = false;
    if (null == str || !str)
        isNull = true;
    else if("" == str || 1 > str.length) {
        isNull = true;
    }
    else if(null == JSON.stringify(str))
        isNull = true;
	/*else if ("" == str.trim() || 1 > str.trim().length) {
	 isNull = true;
	 }*/

    return isNull;
}

function getString(str) {
    return isNull(str) ? "" : str.trim();
}

function getimg() //另存为存放在服务器上图片到本地的方法
{
    event.returnValue=false;
    show.window.location.href=imgSrc.src;
    timer=setInterval(checkload,100)
}

function checkload()
{
    if(show.readyState!="complete")
    {
        //调用document.execCommand方法，'Saveas'表示打开文件另存为对话框命令
        show.document.execCommand('SaveAs');
        clearInterval(timer)
    }
}

/********************************************** 时间相关 *******************************************/

/**
 * 判断对象是否符合日期规范
 * @param date
 * @returns {boolean}
 */
function isDate(date) {
    var sDate = JSON.stringify(date);
    console.log(date + "类型：" + typeof(date));
    console.log("转化之后：" + sDate);
    var DATE_FORMAT =
		/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    if (DATE_FORMAT.test(date))
        return true;
    else
        return false;
}

/**
 * 验证开始和结束时间
 * @param startTime
 * @param endTime
 * @returns {boolean}
 */
function checkDateSE(startTime,endTime){
    if (!isDate(startTime))
        return "开始时间格式不正确";
    if (!isDate(endTime))
        return "结束时间格式不正确";
    if(startTime.length>0 && endTime.length>0){
        var startTmp = startTime.split("-");
        var endTmp = endTime.split("-");
        var sd = new Date(startTmp[0],startTmp[1],startTmp[2]);
        var ed = new Date(endTmp[0],endTmp[1],endTmp[2]);
        if(sd.getTime()>ed.getTime()){
            return "开始时间不能大于结束时间";
        }
    }
    return "";
}

function now() {

}

/**
 * 将时间差转换为'时分秒'格式返回
 * @param startDate
 * @param endDate
 * @returns {String}
 */
function getPeriodBySE(startDate,endDate) {

    if (isNull(startDate) || isNull(endDate))
        return "-";

    var diff = endDate.getTime() - startDate.getTime();//时间差的毫秒数

    if (0 >= diff)
        return "0秒";

    //计算出相差天数
    var days=Math.floor(diff/(24*3600*1000));

    //计算出小时数
    var leave1=diff%(24*3600*1000);    //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600*1000));
    //计算相差分钟数
    var leave2=leave1%(3600*1000);        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000));

    //计算相差秒数
    var leave3=leave2%(60*1000);      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000);

    var returnStr = seconds + "秒";
    if(minutes>0) {
        returnStr = minutes + "分" + returnStr;
    }
    if(hours>0) {
        returnStr = hours + "小时" + returnStr;
    }
    if(days>0) {
        returnStr = days + "天" + returnStr;
    }
    return returnStr;
}

/**
 * 将秒转化成天时分秒
 * @param time
 * @returns
 */
function getPeriodByMS (diff) {

    if (isNull(diff))
        return "-";

    if (0 >= diff)
        return "0秒"

    //计算出相差天数
    var days=Math.floor(diff/(24*3600));

    //计算出小时数
    var leave1=diff%(24*3600);    //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600));
    //计算相差分钟数
    var leave2=leave1%(3600);        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60));

    //计算相差秒数
    var leave3=leave2%(60);      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3);

    var returnStr = seconds + "秒";
    if(minutes>0) {
        returnStr = minutes + "分" + returnStr;
    }
    if(hours>0) {
        returnStr = hours + "小时" + returnStr;
    }
    if(days>0) {
        returnStr = days + "天" + returnStr;
    }
    return returnStr;
}

/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * new Date().format("yyyy-MM-dd hh:mm:ss")
 * new Date().format("MM/yyyy mm/hh")
 */
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 处理时间函数
 * @param dateTime 2017-7-12 14:00:28
 * @returns {string}
 * @private
 */
function _callbackNormTime(dateTime) {
    var dt = "", dtSpl, daySpl, tmSpl, d, m;
    dateTime.indexOf("/") == -1 && (dateTime = dateTime.replace(/-/g, "/"));
    dtSpl = dateTime.split("/");
    if (!dtSpl[0]) return "";
    daySpl = dtSpl[dtSpl.length - 1].split(" ");
    for (var i = 0, len = dtSpl.length; i < len; i++) {
        if (i == len - 1) {
            tmSpl = daySpl[1].split(":");
            daySpl[0].length == 1 ? d = "0" + daySpl[0] : d = daySpl[0];
            dt += d + " ";
            for (var j = 0, lens = tmSpl.length; j < lens; j++) {
                tmSpl[j].length == 1 ? m = "0" + tmSpl[j] : m = tmSpl[j];
                dt += m + ":";
            }
            break;
        }
        dtSpl[i].length == 1 && (dtSpl[i] = "0" + dtSpl[i]);
        dt += dtSpl[i] + "-";
    }
    dt = dt.substring(0, dt.length - 1);
    return dt;
}

/**
 * 根据某一时间节点获取指定时间差时间（年月日时分秒）
 * @param op 操作：add-表示在指定时间上加；其余情况为减
 * @param lev 指定操作目标：yy-年；mm-月；dd-天；hh-时；ii-分；ss-秒
 * @param val 根据指定时间递增或递减的值
 * @param date 指定时间，默认为当前
 * @param isFormat 是否格式化，false-以'-'分隔时间；true-以'/'分隔时间
 * @returns {string|*} 返回时间字符串
 */
function pStrDateTime(op, lev, val, date, isFormat) {
    var dt, sTime, str;
    date ? dt = new Date(date) : dt = new Date();
    // 当操作目标和值均存仔仔才处理时间
    if (lev && val) {
        switch (lev) {
            case "yy":
                op == "add" ? dt.setFullYear(dt.getFullYear() + val) : dt.setFullYear(dt.getFullYear() - val);
                break;
            case "mm":
                op == "add" ? dt.setMonth(dt.getMonth() + val) : dt.setMonth(dt.getMonth() - val);
                break;
            case "dd":
                op == "add" ? dt.setDate(dt.getDate() + val) : dt.setDate(dt.getDate() - val);
                break;
            case "hh":
                op == "add" ? dt.setHours(dt.getHours() + val) : dt.setHours(dt.getHours() - val);
                break;
            case "ii":
                op == "add" ? dt.setMinutes(dt.getMinutes() + val) : dt.setMinutes(dt.getMinutes() - val);
                break;
            case "ss":
                op == "add" ? dt.setSeconds(dt.getSeconds() + val) : dt.setSeconds(dt.getSeconds() - val);
                break;
        }
    }
    !isFormat ? str = "-" : str = "/";
    sTime = dt.getFullYear() + str + (dt.getMonth() + 1) + str + dt.getDate();
    sTime += " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    sTime = _callbackNormTime(sTime);
    return sTime;
}

/*****************************************************验证**************************************************/
/**
 * 验证邮箱
 * @param str 邮箱字符串
 */
function isEmail(str){
    return /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(str);
}

/**
 * 验证电话号码
 * @param str
 * @returns {boolean}
 */
function isPhone(str) {
    return  /^((0\d{2,3}-\d{7,8})|(1[35784]\d{9}))$/.test(str);

}