/**
 * 录音设置
 * Created by Yampery on 2017/6/20.
 */

$(function () {
    // 初始化表格数据
    $("#jqGrid").jqGrid({
        url: '../app/record/list',
        datatype: "json",
        colModel: [
            { label: '电话号码', name: 'regphone', index: "regphone", width: 30},
            { label: '安全号', name: 'uidnumber', index: "uidnumber", width: 50 },
            { label: '自定义编号', name: 'uuidinpartner', width: 60 },
        ],
        viewrecords: true,
        height: 385,
        rowNum: 15,
        rowList : [15,30,50,100],
        autowidth:true,
        multiselect: true,
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
        setVoid: function (event) {
            var roleIds = getSelectedRows();
            if(roleIds == null){
                return ;
            }
            confirm('确定要修改选中的记录？', function(){
                $.ajax({
                    type: "POST",
                    url: "../app/record/set",
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

        saveOrUpdate: function (event) {
            //获取选择的菜单
            var nodes = ztree.getCheckedNodes(true);
            var menuIdList = new Array();
            for(var i=0; i<nodes.length; i++) {
                menuIdList.push(nodes[i].menuId);
            }
            vm.role.menuIdList = menuIdList;

            console.log(JSON.stringify(vm.role));

            var url = vm.role.roleId == null ? "../sys/role/save" : "../sys/role/update";

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
