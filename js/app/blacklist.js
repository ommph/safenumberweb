/**
 * 黑名单管理
 */
$(function () {
    
    // 获取黑名单规则
    getBlacklistRules();
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    $(window).resize(function(){
        // $("#jqGrid").setGridWidth($(window).width()*0.8);
        // $("#jqgrid").setGridWidth(document.body.clientWidth*0.99);
        // $("#jqGrid").setGridHeight($(window).height()*0.8)
    });
    $("#jqGrid").jqGrid({
        url: '../app/blacklist/list',
        datatype: "json",
        viewrecords: true,
        height: '100%',
        rowNum: 15,
        rownumbers: false,
        rownumWidth: 30,
        rowList : [15,30,50,100],
        autowidth:true,
        altRows: true,
        altclass: 'differ',
        pager: "#jqGridPager",
        colModel: [
            { label: 'id', name: 'blacklistid', index:'blacklistid', hidden:true },
            { label: '安全号', name: 'uidnumber', width: 20, align:'center' },
            { label: '手机号', name: 'regphone', width: 18, align:'center' },
            { label: '类型', name: 'optype', width: 20, align:'center' },
            { label: '操作系统', name: 'opmodule', width: 15, align:'center' },
            { label: '操作时间', name: 'optime', width: 20, align: 'center' },
            { label: '操作内容', name: 'opcontent', width: 30, align: 'center' },
            { label: '当前状态', name: 'status', width: 15, align: 'center',
                formatter: function (value, options, row) {
                    return 0 == value ? "已移除" : "已添加";
                }
            },
            { label: '操作', name: 'method', width: 20, align:'center',
                formatter: function(value, options, row) {
                    var method = value;
                    if (isNull(method))
                        return method;
                    if (-1 != value.indexOf(',')) {
                        method = method.split(',')[0];
                        return "<a  href='#' onclick='vm.removeBlacklist(this, 0)'>" + method + "</a>";
                    }

                    return "<a href='#' onclick='vm.removeBlacklist(this, 1)'>" + method + "</a>";
                }
            },
            { label: '操作人', name: 'opuser', width: 20, align:'center' }
        ],
        jsonReader : {
            root: "data.list",
            page: "data.currPage",
            total: "data.totalPage",
            records: "data.totalCount",
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
});

function getBlacklistRules() {
    // 将要传递的号码参数置空
    vm.number = "";
    $.ajax({
        url : '../app/blacklist/rules',
        dataType: 'json',
        type : 'POST',
        processData : false,
        // contentType : false,
        cache: false,
        async: false,
        success : function(r) {
            if ("200" == r.status) {
                // alert("请求成功");
                vm.frequency = r.data.call_limited_times;
                vm.duration = r.data.call_limited_duration;
                return;
            }
            else {
                parent.layer.alert(r.msg, {
                    icon: 2
                    , shade: 0.5
                });
                return;
            } /// else
        }, /// success
    }); /// ajax
}

var vm = new Vue({
    el:'#safenumberapp',
    data:{
        q:{
            startTime: null,
            endTime: null,
            number: null
        },
        showList: true,
        showResult: true,
        title:null,
        frequency: 0,
        duration: 0,
        number: "",
        showjqGridPager:true,
    },
    methods: {
        query: function () {
            vm.q.startTime = $("#start_time").val();
            vm.q.endTime = $("#end_time").val();
            vm.reload();
        },

        setRules: function () {
            layer.open({
                type: 1,
                skin: 'layer-ext-moon',
                title: "自动加入黑名单规则配置",
                area: ['500px', '200px'],
                shadeClose: false,
                content: jQuery("#setRuleLayer"),
                btn: ['确认','取消'],
                btn1: function (index) {
                    if (isNull(vm.frequency)) {
                        layer.alert("请输入数字", {
                            icon: 0
                            ,shade: 0.5
                        });
                        return;
                    }
                    $.ajax({
                        // type: "POST",
                        url: "../app/blacklist/rules/" + vm.frequency,
                        //data: data,
                        dataType: "json",
                        success: function(result){
                            if(result.status == 200){
                                layer.close(index);
                                layer.alert("更改成功", { icon:1 }, function(index){
                                    location.reload();
                                });
                            }else{
                                layer.alert(result.msg, {
                                    icon: 2
                                    ,shade: 0.5
                                });
                            }
                        }
                    });
                }
            });
        },

        /**
         * 移除黑名单
         * @param that 当前操作节点对象
         * @param auth 0 无权限；1 有权限
         */
        removeBlacklist: function (that, auth) {

            if (0 == auth) {
                alert("您无操作权限，请联系管理员");
                return;
            }
            var tds = $(that).parent().parent();
            var td = ($(tds).find("td"))[0];
            var value = getString($(td).text());
            layer.confirm("将此记录移除黑名单?", function(index) {
                layer.close(index);
                // 调用
                $.ajax({
                    // type: "POST",
                    url: "../app/blacklist/remove/" + value,
                    //data: data,
                    dataType: "json",
                    success: function(result){
                        if(result.status == 200){
                            layer.alert(result.data, { icon:1 }, function(index){
                                location.reload();
                            });
                        }
                        else  {
                            layer.alert(result.msg, {
                                icon: 2
                                ,shade: 0.5
                            });
                            return;
                        }
                    }
                });
            });
        },

        // 添加黑名单
        addBlackList: function() {
            layer.open({
                type: 1,
                skin: 'layer-ext-moon',
                title: "手动加入黑名单",
                area: ['500px', '200px'],
                shadeClose: false,
                content: jQuery("#addBlacklistLayer"),
                btn: ['确认','取消'],
                btn1: function (index) {
                    if (isNull(vm.number)) {
                        layer.alert("请输入号码!", {
                            icon: 0
                            ,shade: 0.5
                        });

                        return;
                    }

                    $.ajax({
                        // type: "POST",
                        url: "../app/blacklist/add/" + vm.number,
                        //data: data,
                        dataType: "json",
                        success: function(result){
                            vm.number = "";
                            if(result.status == 200){
                                layer.close(index);
                                layer.alert(result.data, { icon:1 }, function(index){
                                    location.reload();
                                });
                            }else{
                                layer.alert(result.msg, {
                                    icon: 2
                                    ,shade: 0.5
                                });
                            }
                        }
                    });
                }
            });
        }, /// addBlackList end~

        reload: function (event) {
            vm.showList = true;
            vm.showResult = true;
            var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
                postData:{
                    'startTime': vm.q.startTime ,
                    'endTime': vm.q.endTime,
                    'number': getString(vm.q.number)
                },
                page:1
            }).trigger("reloadGrid");
        }
    }
});
