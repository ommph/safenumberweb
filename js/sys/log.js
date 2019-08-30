$(function () {
    $("#jqGrid").jqGrid({
        url: '../sys/log/list',
        datatype: "json",
        colModel: [			
			{ label: 'id', name: 'id', width: 30, key: true, align: 'center', hidden: true },
			{ label: '用户名', name: 'username', align: 'center', width: 40 },
			{ label: '用户操作', name: 'operation', align: 'center', width: 60 },
			{ label: '请求方法', name: 'method', align: 'center', width: 150 },
			{ label: '请求参数', name: 'params', align: 'center', width: 80 },
            { label: '操作结果', name: 'msg', align: 'center', width: 70,cellattr: addCellAttr},
			{ label: 'IP地址', name: 'ip', align: 'center', width: 70 },
			{ label: '操作时间', name: 'createDate', align: 'center', width: 90 }
        ],
		viewrecords: true,
        height: '100%',
        rowNum: 15,
		rowList : [15,30,50,100],
        autowidth:true,
        multiselect: false,
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
        },

    });
});

function addCellAttr(rowId, val, rawObject, cm, rdata) {
    if(val=="成功"){
        return "style='color:mediumseagreen'";
    }else{
        return "style='color:red'";
    }
}

var vm = new Vue({
	el:'#safenumberapp',
	data:{
		q:{
			key: null
		},
        showjqGridPager:true,
        value:''
	},

	methods: {
		query: function () {
			vm.reload();
		},
		reload: function (event) {
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{ 
				postData:{'key': vm.q.key},
                page:1
            }).trigger("reloadGrid");
		}
	}
});