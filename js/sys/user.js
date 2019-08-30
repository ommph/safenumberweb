$(function () {
    $("#jqGrid").jqGrid({
        url: '../sys/user/list',
        datatype: "json",
        colModel: [
			{ label: '用户ID', name: 'userId', index: "user_id", width: 45, key: true, hidden: true, align: 'center' },
            { label: '用户名', name: 'username', width: 75, align: 'center' },
			{ label: '昵称', name: 'name', width: 75, align: 'center' },
			{ label: '邮箱', name: 'email', width: 90, align: 'center' },
			{ label: '手机号', name: 'mobile', width: 100, align: 'center' },
			{ label: '状态', name: 'isActive', width: 80, align: 'center', formatter: function(value, options, row){
				return value === 0 ? 
					'<span class="label label-danger">禁用</span>' : 
					'<span class="label label-success">正常</span>';
			}},
			{ label: '创建时间', name: 'createTime', index: "create_time", width: 80, align: 'center'}
        ],
		viewrecords: true,
        height: '100%',
        autowidth:true,
        multiselect: true,
        altRows: true,
        altclass: 'differ',
		rowNum: "data.totalCount",
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
        },

    });
});

var vm = new Vue({
	el:'#safenumberapp',
	data:{
		q:{
			username: null
		},
		showList: true,
		title:null,
		roleList:{},
		user:{
			isActive:1,
			roleIdList:[]
		},

	},
	methods: {
		query: function () {
			vm.reload();
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
			vm.roleList = {};
			vm.user = {isActive:1,roleIdList:[]};
			
			//获取角色信息
			this.getRoleList();
		},
		update: function () {
			var userId = getSelectedRow();
			if(userId == null){
				return ;
			}
			
			vm.showList = false;
            vm.title = "修改";
			
			vm.getUser(userId);
			//获取角色信息
			this.getRoleList();
		},
		del: function () {
			var userIds = getSelectedRows();
			if(userIds == null){
				return ;
			}
			
			confirm('确定要删除选中的记录？', function(){
				$.ajax({
					type: "POST",
				    url: "../sys/user/delete",
				    data: JSON.stringify(userIds),
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
		saveOrUpdate: function (event) {
			var url = vm.user.userId == null ? "../sys/user/save" : "../sys/user/update";
            var noPer = false;
			if (isNull(vm.user.username)) {
                alert('用户名不能为空');
                return;
			}
			else if ("../sys/user/save" == url && isNull(vm.user.password)) {
                alert('密码不能为空');
                return;
            }
            else if (64 < getByteLen(vm.user.username)) {
				alert("用户名过长");
				return;
			}

			/*if (!isNull(vm.user.email) && !isEmail(vm.user.email)) {
				alert("邮箱格式有误，请检查");
				return
			}
			 */
			if (!isNull(vm.user.mobile) && !isPhone(vm.user.mobile)) {
				alert("手机号格式有误，请检查");
				return;
			}

			if (!isNull(vm.user.name) && 64 < getByteLen(vm.user.name)) {
				alert("昵称过长");
				return;
			}

			if (!isNull(vm.user.email) && 32 < getByteLen(vm.user.email)) {
				alert("邮箱过长");
				return;
			}
            /*else if (!vm.user.roleIdList || null == vm.user.roleIdList || 1 > vm.user.roleIdList.length) {
               confirm('该用户未分配角色，是否确认？', function() {
					noPer = true;
               });
            }

            if (noPer)	return;*/

			$.ajax({
				type: "POST",
			    url: url,
			    data: JSON.stringify(vm.user),
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
		getUser: function(userId){
			$.get("../sys/user/info/"+userId, function(r){
				vm.user = r.data;
			});
		},
		getRoleList: function(){
			$.get("../sys/role/select", function(r){
				vm.roleList = r.data;
			});
		},
		reload: function (event) {
			vm.showList = true;
			// var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{ 
                postData:{'username': getString(vm.q.username)},
                // page:1
            }).trigger("reloadGrid");
		}
	}
});