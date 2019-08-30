/**
 * 呼叫查询js
 * Created by Yampery on 2017/6/20.
 */
$(function () {
    $(window).resize(function(){
        $("#jqGrid").setGridWidth($(window).width()*0.99);
        // $("#jqgrid").setGridWidth(document.body.clientWidth*0.99);
    });
    $("#start_time").val(vm.q.startTime);
    $("#end_time").val(vm.q.endTime);
    $("#jqGrid").jqGrid({
        url: '../app/call/list',
        datatype: "json",
        colModel: [
            { label: '主叫号码', name: 'noA', width: 35, align:'center' },
            { label: '被叫号码', name: 'noX', width: 50, align:'center' },
            { label: '被叫真实号码', name: 'noB', width: 35, align:'center' },
            { label: '开始时间', name: 'startTime', width: 50, align:'center' },
            { label: '接听时间', name: 'answerTime', width: 50, align:'center' },
            { label: '结束时间', name: 'releaseTime', width: 50, align:'center' },
            { label: '话路', name: 'leg', width: 15, align:'center' },
            { label: '通话时长', name: "duration", width: 30, align:'center'
                // formatter: getCallDuration
            },
            { label: '录音文件', name: "recordingFile", width: 50, align:'center',
                formatter: function (value, options, row) {
                    if (isNull(value))  return "";
                    var index = value.lastIndexOf("\/");
                    var flag = value.trim().substr(0, 4);
                    if ("http" != flag)
                        return value.substring(index + 1, value.length)
                    else
                        return "<a href='" + value + "'>"+ value.substring(index + 1, value.length) +"</a>";
                }
            },
            { label: '呼叫状态', name: 'releaseCause', width: 30, align:'center',
                formatter: function(value, options, row){
                     return 1 == value ? "<p style=\"color: mediumseagreen\">已接听</p>" : "<p style=\"color: red\">未接听</p>";
            }}
        ],
        viewrecords: true,
        height: '100%',
        rowNum: 15,
        rowList : [15,30,50,100],
        rownumWidth: 25,
        autowidth:true,
        pager: "#jqGridPager",
        altRows: true,
        altclass: 'differ',
        jsonReader : {
            root: "data.list",
            page: "data.currPage",
            total: "data.totalPage",
            records: "data.totalCount"
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

function getCallDuration(value, option, row) {
    return getPeriodByMS(value);
}

var vm = new Vue({
    el:'#safenumberapp',
    data:{
        q:{
            number: "",
            status: "",
            startTime: pStrDateTime("", "mm", 1, "", false),
            endTime: pStrDateTime()
        },
        showList: true,
        showjqGridPager:true,
    },
    methods: {
        query: function () {
            var state = $("#safenumberapp select").val();
            vm.q.status = state;
            vm.q.startTime = $("#start_time").val();
            vm.q.endTime = $("#end_time").val();
            vm.reload();
        },

        // 导出文件
        exportGrid: function () {
            var params = {
                'number': getString(vm.q.number),
                'status': vm.q.status,
                'startTime': vm.q.startTime ,
                'endTime': vm.q.endTime,
            };
            params = JSON.stringify(params);
            $.ajax({
                url : '../app/call/export',
                dataType: 'json',
                type : 'POST',
                processData : false,
                // contentType : false,
                cache: false,
                async: true,
                // timeout: 10000,
                data: params,
                beforeSend : function() {
                    parent.layerIndex = parent.layer.msg('正在导出，请稍后...', {
                        icon: 16
                        ,shade: 0.5
                        ,time: 1000*60*60
                    });
                },
                complete: function() {
                    parent.layer.close(parent.layerIndex);
                },
                success : function(r) {
                    // console.log(data);

                    if ("200" == r.status) {
                        // alert("请求成功");
                        window.location.href = r.data;
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
                error: function (e) {
                    alert("请求出错");
                }
            }); /// ajax
        }, /// exportGrid

        reload: function (event) {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
                // postData:{'number': vm.q.number},
                postData: {
                    'number': getString(vm.q.number),
                    'release_cause': vm.q.status,
                    'startTime': vm.q.startTime ,
                    'endTime': vm.q.endTime
                },
                page:1
            }).trigger("reloadGrid");
        }
    }
});
