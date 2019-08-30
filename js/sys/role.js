/**
 * 角色管理js
 */
$(function () {
	// 初始化表格数据
    $("#jqGrid").jqGrid({
        url: '../sys/role/list',
        datatype: "json",
        colModel: [			
			{ label: '角色ID', name: 'roleId', index: "role_id", width: 45, key: true, align: 'center' },
			{ label: '角色名称', name: 'roleName', index: "role_name", width: 75, align: 'center' },
			{ label: '备注', name: 'remark', width: 100, align: 'center' },
			{ label: '创建时间', name: 'createTime', index: "create_time", width: 80, align: 'center'}
        ],
		viewrecords: true,
        height: '100%',
        rownumWidth: 25, 
        autowidth:true,
        multiselect: true,
        altRows: true,
        altclass: 'differ',
        // pager: "#jqGridPager",
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
        }
    });
});

var setting = {
	data: {
		simpleData: {
			enable: true,
			idKey: "menuId",
			pIdKey: "parentId",
			rootPId: -1
		},
		key: {
			url:"nourl"
		}
	},
	check:{
		enable:true,
		nocheckInherit:true
	}
};
var ztree;
	
var vm = new Vue({
	el:'#safenumberapp',
	data:{
		q:{
			roleName: null
		},
		showList: true,
		title:null,
		role:{}
	},
	methods: {
		query: function () {
			vm.reload();
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
			vm.role = {};
			vm.getMenuTree(null);
		},
		update: function () {
			var roleId = getSelectedRow();
			if(roleId == null){
				return ;
			}
			vm.showList = false;
            vm.title = "修改";
            vm.getMenuTree(roleId);
		},
		del: function (event) {
			var roleIds = getSelectedRows();
			if(roleIds == null){
				return ;
			}
			
			confirm('确定要删除选中的记录？', function(){
				$.ajax({
					type: "POST",
				    url: "../sys/role/delete",
				    data: JSON.stringify(roleIds),
				    success: function(r){
						if(r.status == 200){
							alert('操作成功', function(index){
								vm.reload();
							});
						}else{
							alert(r.msg);
						}
					}
				});
			});
		},
		getRole: function(roleId){
            $.get("../sys/role/info/"+roleId, function(r){
            	vm.role = r.data;
                
                //勾选角色所拥有的菜单
    			var menuIds = vm.role.menuIdList;
    			for(var i=0; i<menuIds.length; i++) {
    				var node = ztree.getNodeByParam("menuId", menuIds[i]);
    				ztree.checkNode(node, true, false);
    			}
    		});
		},
		saveOrUpdate: function (event) {
			//获取选择的菜单
			var nodes = ztree.getCheckedNodes(true);
			var menuIdList = new Array();
			for(var i=0; i<nodes.length; i++) {
				menuIdList.push(nodes[i].menuId);
			}
			vm.role.menuIdList = menuIdList;
			var noPer = false;

            console.log(JSON.stringify(vm.role));

			var url = vm.role.roleId == null ? "../sys/role/save" : "../sys/role/update";
            if (isNull(vm.role.roleName)) {
                alert('角色名不能为空');
                return;
            }

            else if (100 < getByteLen(vm.role.roleName)) {
            	alert("角色名过长");
            	return;
			}

			console.log(vm.role.remark);
			if (!isNull(vm.role.remark) && 100 < getByteLen(vm.role.remark)) {
            	alert("备注过长");
            	return;
			}
            /*else if (!vm.role.menuIdList || null == vm.role.menuIdList || 1 > vm.role.menuIdList) {
                confirm('该角色没有任何授权，是否确认？',function() {
                	noPer = true;
				});
            }
            if (noPer)	return;*/
			$.ajax({
				type: "POST",
			    url: url,
			    data: JSON.stringify(vm.role),
			    success: function(r){
			    	if(r.status === 200){
						alert('操作成功', function(index){
							vm.reload();
						});
					}else{
						alert(r.msg);
					}
				}
			});
		},

		getMenuTree: function(roleId) {
			//加载菜单树
			$.get("../sys/menu/perms", function(r){
				ztree = $.fn.zTree.init($("#menuTree"), setting, r.data);
				//展开所有节点
				ztree.expandAll(true);
				
				if(roleId != null){
					vm.getRole(roleId);
				}
			});
	    },

	    reload: function (event) {
	    	vm.showList = true;
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{ 
                postData:{'roleName': getString(vm.q.roleName)},
                page:1
            }).trigger("reloadGrid");
		}
	}
});