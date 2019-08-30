/**
 * 安全号主页js文件
 * Created by Yampery on 2017/6/8.
 */

//生成菜单
var menuItem = Vue.extend({
    name: 'menu-item',
    props:{item:{}},
    template:[
        '<li>',
        '<a v-if="item.type === 0" href="javascript:;">',
        '<i v-if="item.icon != null" :class="item.icon"></i>',
        '<span>{{item.name}}</span>',
        '<i class="fa fa-angle-left pull-right"></i>',
        '</a>',
        '<ul v-if="item.type === 0" class="treeview-menu">',
        '<menu-item :item="item" v-for="item in item.list"></menu-item>',
        '</ul>',
        '<a v-if="item.type === 1" :href="\'#\'+item.url"><i v-if="item.icon != null" :class="item.icon"></i><i v-else class="fa fa-circle-o"></i> {{item.name}}</a>',
        '</li>'
    ].join('')
});

//iframe自适应
$(window).on('resize', function() {
    var $content = $('.content');
    $content.height($(this).height() - 120);
    $content.find('iframe').each(function() {
        $(this).height($content.height());
    });
}).resize();

//注册菜单组件
Vue.component('menuItem',menuItem);

var vm = new Vue({
    el:'#safenumberapp',
    data:{
        user:{},
        menuList:{},
        main:"app/number/number.html",
        password:'',
        newPassword:'',
        navTitle:""
    },
    methods: {
        getMenuList: function (event) {
            $.getJSON("sys/menu/user?_"+$.now(), function(r){
                vm.menuList = r.data;
                // console.log(JSON.stringify(r.data[0]));
                vm.main = r.data[0].url;
                vm.navTitle = r.data[0].name;
                console.log("首頁：" + vm.main)
            });
        },
        getUser: function(){
            $.getJSON("sys/user/info?_"+$.now(), function(r){
                vm.user = r.data;
            });
        },
        updatePassword: function(){
            layer.open({
                type: 1,
                skin: 'layui-layer-molv',
                title: "修改密码",
                area: ['550px', '270px'],
                shadeClose: false,
                content: jQuery("#passwordLayer"),
                btn: ['修改','取消'],
                btn1: function (index) {
                    if (1 > vm.password.length || 1 > vm.newPassword.length) {
                        layer.alert("密码不能为空!", {
                            icon: 2
                            ,shade: 0.5
                        });

                        return;
                    }

                    var data = "password="+vm.password+"&newPassword="+vm.newPassword;
                    $.ajax({
                        type: "POST",
                        url: "sys/user/password",
                        data: data,
                        dataType: "json",
                        success: function(result){
                            if(result.status == 200){
                                layer.close(index);
                                layer.alert('修改成功', function(index){
                                    location.reload();
                                });
                            }else{
                                layer.alert(result.msg);
                            }
                        }
                    });
                }
            });
        }
    },
    created: function(){
        this.getMenuList();
        this.getUser();
    },
    updated: function(){
        //路由
        var router = new Router();
        routerList(router, vm.menuList);
        router.start();
    }
});



function routerList(router, menuList){
    for(var key in menuList){
        var menu = menuList[key];
        if(menu.type == 0){
            routerList(router, menu.list);

        }else if(menu.type == 1){
            router.add('#'+menu.url, function() {
                var url = window.location.hash;

                //替换iframe的url
                vm.main = url.replace('#', '');

                //导航菜单展开
                $(".treeview-menu li").removeClass("active");
                $("a[href='"+url+"']").parents("li").addClass("active");

                vm.navTitle = $("a[href='"+url+"']").text();
            });
        }
    }
}
