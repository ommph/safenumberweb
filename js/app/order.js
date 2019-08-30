/**
 * 退单查询js文件
 * Created by Yampery on 2017/6/28.
 */
$(function () {
    $(window).resize(function(){
        // $("#jqGrid").setGridWidth($(window).width()*0.99);
        // $("#jqgrid").setGridWidth(document.body.clientWidth*0.99);
    });
    $("#jqGrid").jqGrid({
        url: '../app/order/list',
        datatype: "json",
        colModel: [
            { label: '自定义编号', name: 'uuidinpartner', width: 60, align:'center' },
            { label: '95号码', name: 'uidnumber', width: 50, align:'center' },
            { label: '真实号码', name: 'regphone', width: 30, align:'center' },
            { label: '呼叫状态', name: 'callState', width: 30, align:'center',
                formatter: function(value, options, row){
                    switch (value) {
                        case 1: return "已接听";
                        case 2: return "未接听";
                        case 3: return "未呼叫";
                        case 0: return "未注册";
                    } /// switch
                } /// function()
            },
            { label: '注册时间', name: 'regtime', width: 50, align:'center' },
            { label: '创建时间', name: 'createTime', width: 50, align:'center' },
        ],
        viewrecords: true,
        height: '100%',
        rowNum: 15,
        rowList : [15,30,50,100],
        rownumWidth: 25,
        autowidth:true,
        altRows: true,
        altclass: 'differ',
        pager: "#jqGridPager",
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

var vm = new Vue({
    el:'#safenumberapp',
    data:{
        q:{
            downloadUrl: "退单查询模板.csv",
            number: "",
            status: "",
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
    }, /// data end

    methods: {
        // 退单查询
        queryOrder: function() {
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

        query: function () {
            var state = $("#safenumberapp select").val();
            vm.q.status = state;
            vm.q.startTime = $("#start_time").val();
            vm.q.endTime = $("#end_time").val();
            vm.reload();
        }, /// query() end

        reload: function (event) {
            vm.showList = true;
            vm.showResult = true;
            var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
                // postData:{'number': vm.q.number},
                postData: {
                    'number': getString(vm.q.number),
                    'state': vm.q.status,
                    'startTime': vm.q.startTime ,
                    'endTime': vm.q.endTime
                },
                page:1
            }).trigger("reloadGrid");
        } /// reload() end
    } /// method end
}); /// vue