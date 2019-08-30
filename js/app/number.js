/**
 * 安全号js文件
 * 处理安全号批量绑定、单绑以及查询等业务操作
 * Created by Yampery on 2017/6/16.
 */

// 模板文件下载基础路径
var baseUrl = $("#download_base_url").val();

$(function () {
    $(window).resize(function(){
        //$("#jqGrid").setGridWidth($(window).width()*0.5);
        // $("#jqgrid").setGridWidth(document.body.clientWidth*0.80);
        // $("#jqGrid").setGridHeight($(window).height()*0.8)
    });
    $("#start_time").val(vm.q.startTime);
    $("#end_time").val(vm.q.endTime);

    count();
    createGrid();
});

/**
 * 统计各状态
 */
function count() {
    $.ajax({
        url : '../number/count/0',
        dataType: 'json',
        type : 'POST',
        processData : false,
        // contentType : false,
        cache: false,
        async: false,
        success : function(r) {
            //var $span = $(".sta-pannel").find("span");
            // console.log(data);
            if ("200" == r.status) {
                // alert("请求成功");
                var data = r.data;
                vm.count_using=data.count_using;
                vm.count_reserve=data.count_reserve;
                vm.count_available=data.count_available;
                vm.count_total=data.count_total
                // $($span[0]).html(data.count_using);
                // $($span[1]).html(data.count_reserve);
                // $($span[2]).html(data.count_available);
                // $($span[3]).html(data.count_total);

                return;
            }
            else {
                parent.layer.alert("请求出错", {
                    icon: 2
                    , shade: 0.5
                });
                return;
            } /// else
        }, /// success
    }); /// ajax
}

/**
 * 创建表格
 */
function createGrid() {
    $("#jqGrid").jqGrid({
        url: '../number/list',
        datatype: "json",
        colModel: colModel,
        altRows: true,
        altclass: 'differ',
        viewrecords: true,
        /*width:'50%',*/

        height: '100%',
        rowNum: 10,
        rowList : [10,30,50,100],
        rownumbers: false,
        autowidth:true,
        pager: "#jqGridPager",
        pginput:true,
        jsonReader : {
            root: "data.list",
            page: "data.currPage",
            total: "data.totalPage",
            records: "data.totalCount"
        },
        postData:{
            'number': getString(vm.q.number),
            'status': vm.q.status,
            'startTime': vm.q.startTime,
            'endTime': vm.q.endTime,
            'uidtype': 0
        },
        prmNames : {  page:"page", rows:"limit", order: "order" },
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
            number: null,
            startTime: pStrDateTime("", "mm", 1, "", false),
            endTime: pStrDateTime(),
            status: 1, // 默认使用中
            downloadUrl: "安全号批量绑定导入模板.csv",
            msgtype: "batch_bind",
            uidtype: 0
        },
        r:{
            success: null,
            failure: null,
            total: null
        },
        numberArray: [],
        showList: true,
        showUpload: true,
        showResult: true,
        showInput: true,
        showInputResult:true,
        title:null,
        count_using: 0,
        count_reserve: 0,
        count_available: 0,
        count_total: 0,
        showjqGridPager:true,
    },
    methods: {
        query: function () {
            var state = $("#safenumberapp select").val();
            switch (state) {
                case "0":
                case "1":
                    $("#file_export").show();
                    $("#start_time").removeAttr("disabled");
                    $("#end_time").removeAttr("disabled");
                    break;
                case "2":
                    $("#file_export").hide();
                    $("#start_time").removeAttr("disabled");
                    $("#end_time").removeAttr("disabled");
                    break;
                case "3":
                    $("#file_export").hide();
                    $("#start_time").attr("disabled", "true");
                    $("#end_time").attr("disabled", "true");
                    break;
            }
            vm.q.status = state;
            vm.q.startTime = $("#start_time").val();
            vm.q.endTime = $("#end_time").val();
            switch (state) {
                case "1":
                default:
                    colModel = [
                        { label: '安全号', name: 'uidnumber', width: 40, align:'center' },
                        { label: '绑定真实号码', name: 'regphone', width: 30, align:'center' },
                        { label: '关联号码', name: 'relatePhone', width: 30, align:'center',
                            formatter: function(valule, options, row) {
                                if(valule =='' || isNull(valule)){
                                    return "-";
                                }else {
                                    return valule;
                                }
                            }
                        },
                        { label: '自定义编号', name: 'uuidinpartner', width: 40, align:'center',
                            formatter: function(valule, options, row) {
                                if(valule =='' || isNull(valule)){
                                    return "-";
                                }else {
                                    return valule;
                                }
                            }
                        },
                        { label: '绑定时间', name: 'regtime', width: 30, align:'center' },
                        { label: '有效期', name: 'expiretime', width: 30, align:'center' },
                        { label: '状态', name: 'status', width: 30, align:'center', formatter: function() { return "<p style=\"color: #00c0ef\">使用中</p>"; } }
                    ];
                    break;

                case "0":
                    colModel = [
                        { label: '安全号', name: 'uidnumber', width: 50, align:'center' },
                        { label: '绑定真实号码', name: 'regphone', width: 30, align:'center' },
                        { label: '自定义编号', name: 'uuidinpartner', width: 60, align:'center' },
                        { label: '绑定时间', name: 'regtime', width: 30, align:'center' },
                        { label: '操作时间', name: 'addtime', width: 30, align:'center' },
                        { label: '操作', name: 'opuidtype', width: 30, align:'center',
                            formatter: function(valule, options, row) {
                                switch (valule) {
                                    case "c":   return "绑定";
                                    case "d":   return "解绑";
                                    case "e":   return "延期";
                                    case "r":   return "撤单";
                                    case "u":   return "解冻";
                                }
                            }
                        }
                    ];
                    break;

                case "2":
                    colModel = [
                        { label: '安全号', name: 'uidnumber', width: 50, align:'center' },
                        { label: '操作时间', name: 'addtime', width: 30, align:'center' },
                        { label: '状态', name: 'status', width: 30, align:'center', formatter: function() { return "保号期"; } }
                    ];
                    break;

                case "3":
                    colModel = [
                        { label: '安全号', name: 'uidnumber', width: 50, align:'center' },
                        { label: '状态', name: 'status', width: 30, align:'center', formatter: function() { return "可使用"; } }
                    ];
                    break;
            }
            // $("#jqGrid").colModel = colModel;
            vm.recreate();
        },

        // 输入绑定
        bindInput: function() {
            // alert("输入绑定");
            vm.title = "手工绑定";
            // 清除上次的信息
            var $inputGroup = $(".input-bind").find("input");
            for (var i = 0; i < $inputGroup.length; i++) {
                $($inputGroup[i]).val("");
            }
            vm.showList = false;
            vm.showInput = false;
        },
        // 批量绑定
        bindBatch: function() {
            vm.title = "批量绑定";
            vm.q.msgtype = "batch_bind";
            var downloadUrl = baseUrl + "安全号批量绑定导入模板.csv";
            $(".downloadtip").attr("href", downloadUrl);
            vm.showList = false;
            vm.showUpload = false;
            $("#radio_div").show();
        },
        // 批量解绑
        unbindBatch: function() {
            vm.title = "批量解绑";
            vm.q.msgtype = "batch_unbind";
            var downloadUrl = baseUrl + "安全号批量解绑导入模板.csv";
            $(".downloadtip").attr("href", downloadUrl);
            vm.showList = false;
            vm.showUpload = false;
            $("#radio_div").hide();
        },
        // 批量延期
        bindExtend: function () {
            vm.title = "批量延期";
            vm.q.msgtype = "batch_extend";
            var downloadUrl = baseUrl + "安全号延期绑定导入模板.csv";
            $(".downloadtip").attr("href", downloadUrl);
            vm.showList = false;
            vm.showUpload = false;
            $("#radio_div").hide();
        },
        // 批量撤单
        revokeBatch: function () {
            vm.title = "批量撤单";
            vm.q.msgtype = "batch_cancel";
            var downloadUrl = baseUrl + "安全号批量撤单导入模板.csv";
            $(".downloadtip").attr("href", downloadUrl);
            vm.showList = false;
            vm.showUpload = false;
            $("#radio_div").hide();
        },

        // 导出文件
        exportGrid: function () {
            var params = {
                'number': getString(vm.q.number),
                'status': vm.q.status,
                'startTime': vm.q.startTime ,
                'endTime': vm.q.endTime,
                'uidtype': vm.q.uidtype
            };
            params = JSON.stringify(params);
            $.ajax({
                url : '../number/export',
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
                    if ($input.length) {
                        $input.empty();
                    }
                    alert("请求出错");
                }
            }); /// ajax
        }, /// exportGrid

        commit: function () {
            document.forms[0].target="blank_frame";
            var formData = new FormData($("#uploadForm")[0]);
            formData.append("uidtype", 0);
            formData.append("msgtype", vm.q.msgtype);
            // 用于批帮，是否检查订单编号重复
            if ($("#check_radio").is(":checked"))
                formData.append("checkUUID", 1);
            else
                formData.append("checkUUID", 0);
            var value = $("#upload_file").val();
            if ("" == value) {
                alert("请选择文件！");
                return;
            }
            $.ajax({
                url : '../number/batchwork/operate',
                type : 'POST',
                data : formData,
                processData : false,
                contentType : false,
                async: true,
                cache: false,
                timeout: 5*60*1000, // 5分钟超时
                beforeSend : function() {
                    $("#upload_file").val("");
                    $("#check_radio").attr("checked", false);
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
                        // 如果文件中的自定义编号重复
                        if ("duplicate_file" == r.msg) {
                            var data = r.data;
                            console.log(data);
                            var $tbody = $("#duplicate_file tbody");
                            $tbody.html("");
                            for (var p in data) {
                                var td1 = "<td>" + p + "</td>";
                                var td2 = "<td>" + data[p].join(', ') + "</td>";
                                $tbody.append("<tr>" + td1 + td2 + "</tr>");
                            }
                            layer.open({
                                    type: 1,
                                    skin: 'layer-ext-moon',
                                    title: "文件中重复自定义编号信息",
                                    area: ['500px', '300px'],
                                    shadeClose: false,
                                    content: jQuery("#duplicate_file"),
                                    btn: ['确认']
                                }
                            );
                        }
                        // 重复自定义编号绑定
                        else if ("duplicate_bind" == r.msg) {
                            var data = r.data;
                            console.log(data);
                            var $tbody = $("#duplicate_bind tbody");
                            $tbody.html("");
                            var length = data.length;
                            for (var i = 0; i < length; i++) {
                                var td1 = "<td>" + data[i].id + "</td>";
                                var td4 = "<td>" + data[i].uidnumber + "</td>";
                                var td3 = "<td>" + data[i].uuidinpartner + "</td>";
                                var td2 = "<td>" + data[i].regphone + "</td>";
                                $tbody.append("<tr>" + td1 + td2 + td3 + td4 + "</tr>");
                            }
                            layer.open({
                                    type: 1,
                                    skin: 'layer-ext-moon',
                                    title: "自定义编号重复绑定信息",
                                    area: ['600px', '300px'],
                                    shadeClose: false,
                                    content: jQuery("#duplicate_bind"),
                                    btn: ['确认']
                                }
                            );
                        }
                        else {
                            parent.layer.alert(r.msg, {
                                icon: 2
                                , shade: 0.5
                            });
                        }
                        return;
                    }

                    var data = r.data;
                    console.log(data);
                    vm.r.total = data.totalcount;
                    vm.r.success = data.successcount;
                    vm.r.failure = data.failcount;
                    $("#result_url").attr("href", data.destfile);
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
        },
        // 提交输入绑定信息
        bindInputC: function () {

            var params = [];
            $formGroup = $(".input-bind").find("form");
            for (var i = 0; i < $formGroup.length; i++) {
                var $inputGroup = $($formGroup[i]).find("input")
                var regphone = $($inputGroup[0]).val();
                var uuidinpartner = $($inputGroup[1]).val();
                if (isNull(regphone) && isNull(uuidinpartner))
                    continue;
                var expired = $($inputGroup[2]).val();
                params.push({
                    regphone: regphone.trim()
                    , uuidinpartner: uuidinpartner.trim()
                    , expiretime: expired
                    , uidtype: 0
                });
            }

            if (null == params || 1 > params.length) {
                parent.layer.alert("请输入要绑定的号码！", {
                    icon: 2
                    ,shade: 0.5
                });
                return;
            }

            console.log(params);

            $.ajax({
                url : '../number/bind',
                type : 'POST',
                data : JSON.stringify(params),
                success : function(r) {
                    if ("200" != r.status) {
                        parent.layer.alert(r.msg, {
                            icon: 2
                            ,shade: 0.5
                        });
                        return;
                    }
                    var data = r.data;
                    // 将结果填入表格
                    var $tbody = $("#bindInput_result");
                    $($tbody).html("");
                    for (var i = 0; i < data.length; i++) {
                        var jData = JSON.parse(data[i]);
                        console.log(jData);
                        var td1 = "<td>" + params[i].regphone + "</td>";
                        var td2 = "<td>" + params[i].uuidinpartner + "</td>";
                        var result = jData.binding_Relation_response;
                        var status = "成功";
                        var uidnumber = "";
                        var validitytime = "";
                        if (result == undefined) {
                            result = jData.error_response;
                            status = result.sub_msg;
                        } else {
                            uidnumber = result.smbms;
                            validitytime = result.validitytime;
                        }
                        var td3 = "<td>" + uidnumber + "</td>"
                        var td4 = "<td>" + validitytime + "</td>"
                        var td5 = "<td>" + status + "</td>";
                        $tbody.append("<tr>" + td1 + td2 + td3 + td4 + td5 + "</tr>");
                    } /// for end
                    vm.showInput = true;
                    vm.showInputResult = false;
                    return;
                },

                error: function (r) {
                    parent.layer.alert("请求出错！", {
                        icon: 2
                        ,shade: 0.5
                    });
                    console.log("error");
                } /// error()
            });

        },

        recreate: function (event) {
            // 卸载数据
            $.jgrid.gridUnload("#jqGrid");
            createGrid();
        },

        // 重新加载表格，因div切换后使用卸载表格会导致宽度不能自适应，因此使用重载
        reload: function (event) {
            vm.showList = true;
            vm.showUpload = true;
            vm.showResult = true;
            vm.showInput = true;
            vm.showInputResult = true;
            $("#check_radio").attr("checked", false);
            var page = $("#jqGrid").jqGrid('getGridParam','page');

            $("#jqGrid").jqGrid('setGridParam',{
                postData:{
                    'number': getString(vm.q.number),
                    'status': vm.q.status,
                    'startTime': vm.q.startTime ,
                    'endTime': vm.q.endTime,
                    'uidtype': vm.q.uidtype
                },
                page:1,
                colModel: colModel
            }).trigger("reloadGrid");
        }
    }
});


/**
 * 全局变量，表格列
 * @type {[*]}
 */
var colModel = [
    { label: '安全号', name: 'uidnumber', width: 30, align:'center' },
    { label: '绑定真实号码', name: 'regphone', width: 25, align:'center' },
    { label: '关联号码', name: 'relatePhone', width: 25, align:'center' ,
        formatter: function(valule, options, row) {
            if(valule =='' || isNull(valule)){
                return "-";
            }else {
                return valule;
            }
        }
    },
    { label: '自定义编号', name: 'uuidinpartner', width: 30, align:'center' ,
        formatter: function(valule, options, row) {
            if(valule =='' || isNull(valule)){
                return "-";
            }else {
                return valule;
            }
        }
    },
    { label: '绑定时间', name: 'regtime', width: 25, align:'center' },
    { label: '有效期', name: 'expiretime', width: 25, align:'center' },
    { label: '状态', name: 'status', width: 20, align:'center', formatter: function() { return "<p style=\"color: #00c0ef\">使用中</p>"; } }
];