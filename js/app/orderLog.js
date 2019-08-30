/**
 * 退单查询日志js文件
 * Created by Yampery on 2017/7/4.
 */
$(function () {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    $(window).resize(function(){
        // $("#jqGrid").setGridWidth($(window).width()*0.8);
        // $("#jqgrid").setGridWidth(document.body.clientWidth*0.99);
        // $("#jqGrid").setGridHeight($(window).height()*0.8)
    });
    $("#jqGrid").jqGrid({
        url: '../app/order/logList',
        datatype: "json",
        viewrecords: true,
        height: '100%',
        rowNum: 15,
        rowList : [15,30,50,100],
        autowidth:true,
        altRows: true,
        altclass: 'differ',
        pager: "#jqGridPager",
        colModel: [
            { label: '添加日期', name: 'addtime', width: 50, align:'center' },
            { label: '未注册', name: 'noreg', width: 20, align:'center' },
            { label: '未呼叫', name: 'nocall', width: 20, align:'center' },
            { label: '未接听', name: 'norec', width: 20, align:'center' },
            { label: '已接听', name: 'isrec', width: 20, align:'center' },
            { label: '总数', name: 'totalcount', width: 20, align: 'center' },
            { label: '文件', name: 'destfile', width: 30, align:'center',
                formatter: function(value, options, row){
                    /*if (isNull(value))
                        return "";*/
                    var index = value.lastIndexOf("\/");
                    var flag = value.trim().substring(0, 4);
                    if ("http" != flag)
                        return value.substring(index + 1, value.length);
                    return "<a href='" + value + "'>"+ value.substring(index + 1, value.length) +"</a>";
                }
            },
            { label: '操作人', name: 'opuser', width: 50, align:'center' }
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

var vm = new Vue({
    el:'#safenumberapp',
    data:{
        q:{
            downloadUrl: "退单查询模板.csv",
            startTime: null,
            endTime: null
        },
        r:{
            noReg: null,
            noCall: null,
            noRec: null,
            isRec: null,
            total: null
        },
        showList: true,
        showResult: true,
        title:null,
        showjqGridPager:true,
    },
    methods: {
        query: function () {
            vm.q.startTime = $("#start_time").val();
            vm.q.endTime = $("#end_time").val();
            vm.reload();
        },

        // 退单查询
        queryOrder: function() {
            vm.title = "退单查询";
            vm.showList = false;
            // vm.commit();
        }, /// queryOrder end

        commit: function () {
            document.forms[0].target="blank_frame";
            var formData = new FormData($("#uploadForm")[0]);
            var value = $("#upload_file").val();
            if ("" == value) {
                alert("请选择文件！");
                return;
            }
            //return;

            $.ajax({
                url : '../app/order/query',
                type : 'POST',
                data : formData,
                processData : false,
                contentType : false,
                async: true,
                cache: false,
                beforeSend : function() {
                    $("#upload_file").val("");
                    parent.layerIndex = parent.layer.msg('正在处理，请稍后...', {
                        icon: 16
                        ,shade: 0.5
                        ,time: 1000*60*60
                    });
                },
                complete: function() {
                    parent.layer.close(parent.layerIndex);
                },
                success : function(r) {

                    if ("200" != r.status) {
                        parent.layer.close(parent.layerIndex);
                        parent.layer.alert(r.msg, {
                            icon: 2
                            ,shade: 0.5
                        });
                        return;
                    }

                    var data = r.data;
                    vm.r.total = data.total;
                    vm.r.noReg = data.noReg;
                    vm.r.noCall = data.noCall;
                    vm.r.noRec = data.noRec;
                    vm.r.isRec = data.isRec;
                    $("#result_url").attr("href", data.filepath);
                    vm.showResult = false;
                    return;

                },
                error : function(r) {
                    parent.layer.alert("请求出错！", {
                        icon: 2
                        ,shade: 0.5
                    });
                    parent.layer.close(parent.layerIndex);
                    console.log("error");
                }
            });
        }, ///commit end

        reload: function (event) {
            vm.showList = true;
            vm.showResult = true;
            var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
                postData:{
                    'startTime': vm.q.startTime ,
                    'endTime': vm.q.endTime
                },
                page:1
            }).trigger("reloadGrid");
        }
    }
});
