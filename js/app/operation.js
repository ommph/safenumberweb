/**
 * 安全号操作记录查询
 * Created by Yampery on 2017/6/19.
 */

$(function () {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
        $(window).resize(function(){
            // $("#jqGrid").setGridWidth($(window).width()*0.8);　　
            // $("#jqgrid").setGridWidth(document.body.clientWidth*0.99);
            // $("#jqGrid").setGridHeight($(window).height()*0.8)
        });
    createGrid();

});

function createGrid() {
    $("#jqGrid").jqGrid({
        url: '../number/batchwork/list',
        datatype: "json",
        viewrecords: true,
        height: '100%',
        rowNum: 15,
        altRows: true,
        altclass: 'differ',
        rowList : [15,30,50,100],
        rownumWidth: 25,
        autowidth:true,
        pager: "#jqGridPager",
        colModel: colModel,
        jsonReader : {
            root: "data.list",
            page: "data.currPage",
            total: "data.totalPage",
            records: "data.totalCount",
        },
        postData: {
            method: getString(vm.q.method),
            startTime: vm.q.startTime ,
            endTime: vm.q.endTime,
        },
        prmNames : {
            page:"page",
            rows:"limit",
            order: "order"
        },
        gridComplete:function(){
            //隐藏grid底部滚动条
            $("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" });
        },
        loadComplete: function(){
            var re_records = $("#jqGrid").getGridParam("records");
            if(isNull(re_records) || re_records<=0){
                vm.showjqGridPager=false;
            }else{
                vm.showjqGridPager=true;
            }
        }
    });
}

var vm = new Vue({
    el:'#safenumberapp',
    data:{
        q:{
            method: "batch_bind",
            startTime: null,
            endTime: null
        },
        showList: true,
        showjqGridPager:true,
    },
    methods: {
        query: function () {
            var method = $("#safenumberapp select").val();
            var url = '../number/batchwork/list';
            vm.q.startTime = $("#start_time").val();
            vm.q.endTime = $("#end_time").val();
            vm.q.method = method;
            if ("1001" == method) {
                colModel = single_colModel;
            }
            else {
                colModel = batch_colModel;
            }
            vm.recreate();
        },

        recreate: function () {
            // 卸载数据
            $.jgrid.gridUnload("#jqGrid");
            createGrid();
        },

        reload: function (event) {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
                postData:{
                    'method': vm.q.method,
                    'startTime': vm.q.startTime ,
                    'endTime': vm.q.endTime
                },
                page:1
            }).trigger("reloadGrid");
        }
    }
});

// 批量任务
var batch_colModel = [
    { label: '操作日期', name: 'addtime', width: 50, align:'center' },
    { label: '成功', name: 'successcount', width: 20, align:'center' },
    { label: '失败', name: 'failcount', width: 20, align:'center' },
    { label: '总数', name: 'totalcount', width: 20, align:'center' },
    { label: '操作类型', name: "method", width: 50, align:'center',
        formatter: function (value, options, row) {         // @TODO 考虑将这些参数放在常量配置js文件
            if ("batch_bind" == value)    return "批量绑定";
            else if ("batch_unbind" == value) return "批量解绑";
            else if ("batch_extend" == value)    return "延期绑定";
            else return "批量撤单";
        }
    },
    { label: '文件', name: 'destfile', width: 50, align:'center',
        formatter: function(value, options, row){
            var index = value.lastIndexOf("\/");
            var flag = value.trim().substr(0, 4);
            if ("http" != flag)
                return value.substring(index + 1, value.length)
            else
                return "<a href='" + value + "'>"+ value.substring(index + 1, value.length) +"</a>";
        }},
    { label: '操作人', name: 'opuser', width: 50, align:'center' },
];

// 单绑
var single_colModel = [
    { label: '操作日期', name: 'starttime', width: 50, align:'center' },
    { label: '真实号码', name: 'regphone', width: 40, align:'center' },
    { label: '自定义编号', name: 'uuidinpartner', width: 50, align:'center' },
    { label: '95号码', name: 'uidnumber', width: 50, align:'center' },
    { label: '操作结果', name: 'errormsg', width: 50, align:'center',
        formatter: function (value, option, row) {
            return isNull(value) ? "成功" : value;
        }
    },
    { label: '操作类型', name: "method", width: 30, align:'center',
        formatter: function (value, options, row) {
            return "手工绑定";
        }
    },
    { label: '操作人', name: 'opuser', width: 30, align:'center' }
];

var colModel = batch_colModel;