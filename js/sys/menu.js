$(function () {
    $("#jqGrid").jqGrid({
        url: '../sys/menu/list',
        datatype: "json",
        colModel: [
            {label: '菜单ID', name: 'menuId', index: "menu_id", width: 40, key: true, align: 'center'},
            {label: '菜单名称', name: 'name', width: 60, align: 'center'},
            {label: '上级菜单', name: 'parentName', sortable: false, width: 60, align: 'center'},
            {
                label: '菜单图标',
                name: 'icon',
                sortable: false,
                width: 50,
                align: 'center',
                formatter: function (value, options, row) {
                    return value == null ? '' : '<i class="' + value + ' fa-lg"></i>';
                }
            },
            {label: '菜单URL', name: 'url', width: 100, align: 'center'},
            {label: '授权标识', name: 'perms', width: 100, align: 'center'},
            {
                label: '类型', name: 'type', width: 50, align: 'center', formatter: function (value, options, row) {
                if (value === 0) {
                    return '<span class="label label-primary">目录</span>';
                }
                if (value === 1) {
                    return '<span class="label label-success">菜单</span>';
                }
                if (value === 2) {
                    return '<span class="label label-warning">按钮</span>';
                }
            }
            },
            {label: '排序号', name: 'orderNum', index: "order_num", width: 50, align: 'center'}
        ],
        viewrecords: true,
        height: '100%',
        rowNum: 15,
        rowList: [15, 30, 50, 100],
        autowidth: true,
        multiselect: true,
        altRows: true,
        altclass: 'differ',
        pager: "#jqGridPager",
        jsonReader: {
            root: "data.list",
            page: "data.currPage",
            total: "data.totalPage",
            records: "data.totalCount"
        },
        prmNames: {
            page: "page",
            rows: "limit",
            order: "order"
        },
        gridComplete: function () {
            //隐藏grid底部滚动条
            $("#jqGrid").closest(".ui-jqgrid-bdiv").css({"overflow-x": "hidden"});
        },
        loadComplete: function () {
            var re_records = $("#jqGrid").getGridParam("records");
            if (isNull(re_records) || re_records <= 0) {
                vm.showjqGridPager = false;
            } else {
                vm.showjqGridPager = true;
            }
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
            url: "nourl"
        }
    }
};
var ztree;

var vm = new Vue({
    el: '#safenumberapp',
    data: {
        showList: true,
        title: null,
        q: {name: ""},
        menu: {
            parentName: null,
            parentId: 0,
            type: 1,
            orderNum: 0
        },
        showjqGridPager: true,
    },
    methods: {
        query: function () {
            vm.reload();
        },
        getMenu: function (menuId) {
            //加载菜单树
            $.get("../sys/menu/select", function (r) {
                ztree = $.fn.zTree.init($("#menuTree"), setting, r.data);
                var node = ztree.getNodeByParam("menuId", vm.menu.parentId);
                ztree.selectNode(node);

                vm.menu.parentName = node.name;
            })
        },
        add: function () {
            vm.showList = false;
            vm.title = "新增";
            vm.menu = {parentName: null, parentId: 0, type: 1, orderNum: 0};
            vm.getMenu();
        },
        update: function (event) {
            var menuId = getSelectedRow();
            if (menuId == null) {
                return;
            }

            $.get("../sys/menu/info/" + menuId, function (r) {
                vm.showList = false;
                vm.title = "修改";
                vm.menu = r.data;

                vm.getMenu();
            });
        },
        del: function (event) {
            var menuIds = getSelectedRows();
            if (menuIds == null) {
                return;
            }

            confirm('确定要删除选中的记录？', function () {
                $.ajax({
                    type: "POST",
                    url: "../sys/menu/delete",
                    data: JSON.stringify(menuIds),
                    success: function (r) {
                        if (r.status === 200) {
                            alert('操作成功', function (index) {
                                vm.reload();
                            });
                        } else {
                            alert(r.msg);
                        }
                    }
                });
            });
        },
        saveOrUpdate: function (event) {
            var url = vm.menu.menuId == null ? "../sys/menu/save" : "../sys/menu/update";
            $.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(vm.menu),
                success: function (r) {
                    if (r.status === 200) {
                        alert('操作成功', function (index) {
                            vm.reload();
                        });
                    } else {
                        alert(r.msg);
                    }
                }
            });
        },
        menuTree: function () {
            layer.open({
                type: 1,
                offset: '50px',
                skin: 'layui-layer-molv',
                title: "选择菜单",
                area: ['300px', '450px'],
                shade: 0,
                shadeClose: false,
                content: jQuery("#menuLayer"),
                btn: ['确定', '取消'],
                btn1: function (index) {
                    var node = ztree.getSelectedNodes();
                    //选择上级菜单
                    vm.menu.parentId = node[0].menuId;
                    vm.menu.parentName = node[0].name;

                    layer.close(index);
                }
            });
        },
        reload: function (event) {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam', 'page');
            $("#jqGrid").jqGrid('setGridParam', {
                postData: {'name': vm.q.name},
                page: 1
            }).trigger("reloadGrid");

        }
    }
});