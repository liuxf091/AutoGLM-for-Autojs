try {
    importClass(android.content.BroadcastReceiver);
} catch (e) {}
importClass(android.animation.ObjectAnimator)
importClass(android.animation.AnimatorSet)
importClass(android.view.animation.BounceInterpolator)
importClass(android.content.ContextWrapper);
importClass(android.content.IntentFilter);

function menuOnClick(view) {
    switch (view._name.text()) {
        case "取消当前任务":
            console.log("用户取消当前任务");
            phoneAgent.toastFloaty.show("用户取消当前任务");
            phoneAgent.stopStep();
            break;
        case "开始":
            启动脚本()
            break;
        case "设置":
            设置()
            break;
    }
    animation_menu(); //悬浮窗动画
}

function 启动脚本() {
    threads.start(function() {
        main();
    })
}

setInterval(() => {}, 1000);

function 设置() {
    let arr = ["打开无障碍服务", "当前应用包名:", "当前活动:", "修改api_key", "退出程序"]
    if (auto.service != null) {
        Pack = currentPackage();
        Acti = currentActivity();
        arr[1] += Pack;
        arr[2] += Acti;
    }
    dialogs.build({
        title: "设置",
        btntonRippleColor: "#000000",
        itemsSelectMode: "single",
        items: arr,
    }).on("single_choice", (index) => {
        switch (index) {
            case 0:
                app.startActivity({
                    action: "android.settings.ACCESSIBILITY_SETTINGS"
                });
                break;
            case 1:
                auto.service != null ? (setClip(Pack), toast("已复制到剪切板")) : toast("无障碍服务未启动")
                break;
            case 2:
                auto.service != null ? (setClip(Acti), toast("已复制到剪切板")) : toast("无障碍服务未启动")
                break;
            case 3:
                let dialog = dialogs
                    .build({
                        title: "请输入您的api_key",
                        content: "申请网址:https://bigmodel.cn/usercenter/proj-mgmt/apikeys",
                        inputHint: "智谱官网免费申请",
                        cancelable: false,
                        neutral: "复制申请网址"
                    })
                    .on("input", (input) => {
                        storage.put("api_key", input);
                        toast("已更新api_key，请重新打开应用")
                        exit();
                    })
                    .on("neutral", () => {
                        setClip("https://bigmodel.cn/usercenter/proj-mgmt/apikeys");
                        toast("申请网址已复制");
                    })
                    .show();
                break;
            case 4:
                exit();
                break;
        }
    }).show()
}

auto.waitFor();
//安卓版本高于Android 9
if (device.sdkInt > 28) {
    //等待截屏权限申请并同意
    threads.start(function() {
        packageName("com.android.systemui").text("立即开始").waitFor();
        text("立即开始").click();
    });
}
//申请截屏权限
if (!requestScreenCapture()) {
    toast("请求截图失败");
    exit();
}
sleep(200);

let storage = storages.create("AutoGLM-705237371@qq.com");
if (storage.get("api_key") == undefined) {
    let dialog = dialogs
        .build({
            title: "请输入您的api_key",
            content: "申请网址:https://bigmodel.cn/usercenter/proj-mgmt/apikeys",
            inputHint: "智谱官网免费申请",
            cancelable: false,
            neutral: "复制申请网址"
        })
        .on("input", (input) => {
            storage.put("api_key", input);
        })
        .on("neutral", () => {
            setClip("https://bigmodel.cn/usercenter/proj-mgmt/apikeys");
            toast("申请网址已复制");
            exit();
        })
        .show();
}

while (storage.get("api_key") == undefined) {};

let PhoneAgent = require("./PhoneAgent.js");
let confirmation_callback = function(message) {
    console.info("Confirmation callback called...")
    return (dialogs.confirm("敏感操作确认", message));
}

let takeover = false;
let takeover_callback = function(message) {
    console.info("Takeover callback called...")
    takeover = true;
    dialogs.alert("请求人工介入", "人工介入完成后请再次点击悬浮按钮确认");
    while (takeover) {
        sleep(100);
    }
    return true;
}

let phoneAgent = new PhoneAgent(confirmation_callback, takeover_callback);

function main() {
    let command = dialogs.rawInput("用自然语言描述你的指令:");
    if (command == "") return;
    sleep(500);
    phoneAgent.run(command);
}

/*下面的内容感觉不需要看
 
                 ▒▒▒▒▒▒▒▒▒▒▒▒
                 ▒▒▒▒▓▒▒▓▒▒▒▒
                 ▒▒▒▒▓▒▒▓▒▒▒▒
                 ▒▒▒▒▒▒▒▒▒▒▒▒
                 ▒▓▒▒▒▒▒▒▒▒▓▒
                 ▒▒▓▓▓▓▓▓▓▓▒▒
                 ▒▒▒▒▒▒▒▒▒▒▒▒
                

*/
const resources = context.getResources();
const statusBarHeight = resources.getDimensionPixelSize(resources.getIdentifier('status_bar_height', 'dimen', 'android'));
/**************可修改参数 */
//按钮大小
const btn_win_h = 42;
//按钮圆角
const btn_win_r = Math.round(btn_win_h / 2);
//图标大小
const btn_icon_w = 30;
//按钮停靠时X值 增量 感觉按钮停靠两边太靠外面则减小该值 
const port_x = 3;
//菜单布局总长和宽
const menu_d = Math.floor(device.width * 0.18)
//菜单展开动画播放时间 可自行修改
const animation_time = 150
//按钮停靠动画播放时间 可自行修改
const animation_time_1 = 300

const btn_data = {
    'logo': {
        name: "logo", //悬浮窗图案
        src: "@drawable/ic_android_black_48dp",
    },
    'menu_1': {
        name: "取消当前任务",
        src: "@drawable/ic_close_black_48dp",
        bg: "#ee534f"
    },
    'menu_2': {
        name: "开始",
        src: "@drawable/ic_play_arrow_black_48dp",
        bg: "#40a5f3"
    },
    'menu_3': {
        name: "设置",
        src: "@drawable/ic_settings_black_48dp",
        bg: "#bfc1c0"
    }
}

/**************以下为系统函数 */

//菜单展开状态记录值
var menu_expand = false;
//按钮左右方向记录值 false:左 true:右
var btn_orientation = false;
//屏幕方向记录值 false:竖 true:横
var screen_rotation = false;
//动画播放开关记录值 防止动画播放冲突
var animation_state = false;
//菜单按钮视图信息
var menu_view = [];
//menu展开坐标
var menu_X = [];
var menu_Y = [];
//旋转修正后的屏幕宽高
var scrWidth = 0;
var scrHeight = 0;
//主按钮Y值所在屏幕百分比,屏幕旋转时调整控件位置
var Y_percent = 0.5

//自定义控件 按钮
var btnLogoLayout = (function() {
    util.extend(btnLogoLayout, ui.Widget);

    function btnLogoLayout() {
        ui.Widget.call(this);
        this.defineAttr("name", (view, attr, value, defineSetter) => {
            view._name.setText(value)
        })
        this.defineAttr("src", (view, attr, value, defineSetter) => {
            view._img.attr("src", value)
        })
        this.defineAttr("bg", (view, attr, value, defineSetter) => {
            view._bg.attr("cardBackgroundColor", value)
            view._img.attr("tint", "#ffffff")
            menu_view[menu_view.length] = view;
        })
    };
    btnLogoLayout.prototype.render = function() {
        return (
            <card id="_bg" w="{{btn_win_h}}" h="{{btn_win_h}}" cardCornerRadius="{{btn_win_r}}" cardBackgroundColor="#99ffffff" cardElevation="0" foreground="?selectableItemBackground" gravity="center" >
                            <img id="_img" w="{{btn_icon_w}}" src="#ffffff" gravity="center" layout_gravity="center" />
                            <text id="_name" text="0" visibility="gone" textSize="1" />
                        </card>
        );
    };
    btnLogoLayout.prototype.onViewCreated = function(view) {
        view.on("click", () => {
            if (view._name.text() != "logo") {
                menuOnClick(view)
            }
            //没看出用途，注释掉
            //eval(this._onClick);
        });
    };
    ui.registerWidget("btnLogo-layout", btnLogoLayout);
    return btnLogoLayout;
})();

//获取dp转px值
var scale = context.getResources().getDisplayMetrics().density;
var btn_win_r_px = Math.floor(btn_win_h * scale + 0.5) / 2
//DP转PX
var dp2px = function(dp) {
    return Math.floor(dp * scale + 0.5);
}
//PX转DP
var px2dp = function(px) {
    return Math.floor(px / scale + 0.5);
}

/**
 * 悬浮窗
 * menu菜单悬浮窗
 * 可在此处添加按钮
 * 参数一个都不能少
 */
var w_menu = floaty.rawWindow(
    <frame id="menu" w="{{menu_d}}" h="{{menu_d}}" visibility="gone">
        <btnLogo-layout name="{{btn_data.menu_1.name}}" src="{{btn_data.menu_1.src}}" bg="{{btn_data.menu_1.bg}}" layout_gravity="center" />
        <btnLogo-layout name="{{btn_data.menu_2.name}}" src="{{btn_data.menu_2.src}}" bg="{{btn_data.menu_2.bg}}" layout_gravity="center" />
        <btnLogo-layout name="{{btn_data.menu_3.name}}" src="{{btn_data.menu_3.src}}" bg="{{btn_data.menu_3.bg}}" layout_gravity="center" />
    </frame>
)
//主按钮悬浮窗  无需更改
//不能设置bg参数
var w_logo = floaty.rawWindow(
    <btnLogo-layout id="_btn" name="{{btn_data.logo.name}}" src="{{btn_data.logo.src}}" scaleType="fitXY" circle="true" alpha="0.4" visibility="invisible" />
)

//主按钮动画悬浮窗  无需更改
//不能设置bg参数
var w_logo_a = floaty.rawWindow(
    <btnLogo-layout id="_btn" name="{{btn_data.logo.name}}" src="{{btn_data.logo.src}}" alpha="0" />
)
w_logo_a.setSize(1, 1);

//按钮停靠时隐藏到屏幕的X值
var btn_logo_hide_px = 0
//初始化数据
var data__ = false
var id_time_0 = setInterval(() => {
    if (w_logo._btn.getWidth() && !data__) {
        data__ == true;
        btn_logo_hide_px = dp2px(parseInt((px2dp(w_logo._btn.getWidth()) - btn_icon_w) / 2 + port_x));
        getScreenDirection();
        setTimeout(() => {
            ui.run(() => {
                w_logo._btn.attr("visibility", "visible")
            });
        }, 50)
        clearInterval(id_time_0);
    }
}, 100);

//计算menu菜单在圆上的X,Y值
//计算每个菜单的角度
var deg = 360 / (menu_view.length * 2 - 2);
var degree = 0;
for (let i = 0; i < 2; i++) {
    degree = 0;
    menu_X[i] = [];
    menu_Y[i] = [];
    for (let j = 0; j < menu_view.length; j++) {
        menu_X[i][j] = parseInt(dp2px(Math.cos(Math.PI * 2 / 360 * (degree - 90)) * (menu_d / 5)));
        menu_Y[i][j] = parseInt(dp2px(Math.sin(Math.PI * 2 / 360 * (degree - 90)) * (menu_d / 4)));
        i ? degree -= deg : degree += deg;
    }
}

//注册监听屏幕旋转广播
var intent_CHANGED
filter = new IntentFilter();
filter.addAction("android.intent.action.CONFIGURATION_CHANGED");
new ContextWrapper(context).registerReceiver(intent_CHANGED = new BroadcastReceiver({
    onReceive: function(context, intent) {
        log("屏幕方向发生变化\n" + intent_CHANGED)
        getScreenDirection()
    }
}), filter)

//记录按键被按下时的触摸坐标
var x = 0,
    y = 0;
//记录按键被按下时的悬浮窗位置
var windowX, windowY;
//记录按键被按下的时间以便判断长按等动作
var downTime;
var move = false;

w_logo._btn.setOnTouchListener(function(view, event) {
    //如果动画正在播放中 则退出该事件
    if (animation_state) {
        return true
    }
    switch (event.getAction()) {
        //手指按下
        case event.ACTION_DOWN:
            x = event.getRawX();
            y = event.getRawY();
            windowX = w_logo.getX();
            windowY = w_logo.getY();
            downTime = new Date().getTime();
            return true
            //手指移动
        case event.ACTION_MOVE:
            //如果展开为真 则退出,展开时禁止触发移动事件
            if (menu_expand) {
                return true
            }
            if (!move) {
                //如果移动的距离大于30值 则判断为移动 move为真
                if (Math.abs(event.getRawY() - y) > 30 || Math.abs(event.getRawX() - x) > 30) {
                    view.setAlpha(1);
                    move = true
                }
            } else {
                //移动手指时调整主按钮logo悬浮窗位置
                w_logo.setPosition(windowX + (event.getRawX() - x), windowY + (event.getRawY() - y));
            }
            return true
            //手指弹起
        case event.ACTION_UP:
            //如果在动画正在播放中则退出事件 无操作           
            if (animation_state) {
                return
            }
            //如果控件移动小于 30 则判断为点击 否则为移动
            if (Math.abs(event.getRawY() - y) < 30 && Math.abs(event.getRawX() - x) < 30) {
                w_menu.setSize(dp2px(menu_d), dp2px(menu_d))
                setTimeout(() => {
                    //点击动作 执行菜单 展开 关闭 动作
                    if (takeover) {
                        dialogs.confirm("人工介入确认", "是否确认已完成介入").then((confirm) => {
                            if (confirm) {
                                takeover = false;
                            }
                        });
                    } else {
                        animation_menu(event)
                    }
                }, 1)
                //否则如果展开为真 则退出,展开时禁止触发停靠动画事件
            } else if (!menu_expand) {
                //移动弹起  判断要停靠的方向
                windowX + (event.getRawX() - x) + dp2px(btn_win_h / 2) < scrWidth / 2 ? btn_orientation = false : btn_orientation = true;
                w_logo_a.setSize(scrWidth, dp2px(btn_win_h));
                setTimeout(() => {
                    w_logo_a.setPosition(0, windowY + (event.getRawY() - y));
                }, 1)
                setTimeout(() => {
                    animation_port(event);
                }, 3)
            }
            move = false
            return true
    }
    return true
});

/**
 * 动画 logo停靠动画
 */
function animation_port(event) {
    animation_state = true;
    let X = [];
    let PX = 0;
    //如果btn_orientation值为真 则停靠在右边 否则停靠在左边
    btn_orientation ? (PX = scrWidth - dp2px(btn_win_h) + btn_logo_hide_px, X = [windowX + (event.getRawX() - x), PX]) : (PX = 0 - btn_logo_hide_px, X = [windowX + (event.getRawX() - x), PX])
    //动画信息
    ui.run(() => {
        w_logo_a._btn.attr("visibility", "visible")
    })
    let animator = ObjectAnimator.ofFloat(w_logo_a._btn, "translationX", X);
    let animatorA = ObjectAnimator.ofFloat(w_logo._btn, "alpha", 0, 0);
    let animatorA1 = ObjectAnimator.ofFloat(w_logo_a._btn, "alpha", 0.4, 0.4);
    let mTimeInterpolator = new BounceInterpolator();
    animator.setInterpolator(mTimeInterpolator);
    set = new AnimatorSet();
    set.playTogether(
        animator, animatorA, animatorA1
    )
    set.setDuration(animation_time_1);
    set.start();
    setTimeout(function() {
        w_logo.setPosition(PX, windowY + (event.getRawY() - y))
    }, animation_time_1 / 2);
    setTimeout(function() {
        ui.run(() => {
            w_logo_a._btn.setAlpha(0)
            w_logo_a._btn.attr("visibility", "invisible")
            w_logo_a.setSize(1, 1);
            setTimeout(function() {
                w_logo._btn.setAlpha(0.4)
            }, 10);
        })
        //记录Y值所在百分比
        Y_percent = (Math.round(w_logo.getY() / scrHeight * 100) / 100);
        animation_state = false;
    }, animation_time_1 + 10);
}

//菜单展开收起动画
function animation_menu(event, E) {
    //如果展开状态为假  则重新定位菜单menu位置 
    if (!menu_expand && E == undefined) {
        //Y值定位
        let X = 0,
            Y = (windowY + (event.getRawY() - y)) - dp2px(menu_d / 2) + btn_win_r_px
        //X值定位
        btn_orientation ? X = scrWidth + btn_logo_hide_px - dp2px(btn_win_h + menu_d / 2) : X = -btn_logo_hide_px + dp2px(btn_win_h - menu_d / 2);
        //定位悬浮窗
        w_menu.setPosition(X, Y);
        w_logo._btn.setAlpha(1);
    } else {
        w_logo._btn.setAlpha(0.4)
    }
    setTimeout(function() {
        let animationX = [],
            animationY = [],
            slX = [],
            slY = [];
        animation_state = true;
        E != undefined ? w_menu.menu.setAlpha(0) : w_menu.menu.attr("visibility", "visible")
        btn_orientation ? e = 1 : e = 0;
        if (menu_expand) {
            // log("关闭动画")
            for (let i = 0; i < menu_view.length; i++) {
                animationX[i] = ObjectAnimator.ofFloat(menu_view[i]._bg, "translationX", menu_X[e][i], 0);
                animationY[i] = ObjectAnimator.ofFloat(menu_view[i]._bg, "translationY", menu_Y[e][i], 0);
                slX[i] = ObjectAnimator.ofFloat(menu_view[i]._bg, "scaleX", 1, 0)
                slY[i] = ObjectAnimator.ofFloat(menu_view[i]._bg, "scaleY", 1, 0)
            }
        } else {
            for (let i = 0; i < menu_view.length; i++) {
                animationX[i] = ObjectAnimator.ofFloat(menu_view[i]._bg, "translationX", 0, menu_X[e][i]);
                animationY[i] = ObjectAnimator.ofFloat(menu_view[i]._bg, "translationY", 0, menu_Y[e][i]);
                slX[i] = ObjectAnimator.ofFloat(menu_view[i]._bg, "scaleX", 0, 1)
                slY[i] = ObjectAnimator.ofFloat(menu_view[i]._bg, "scaleY", 0, 1)
            }
        }
        //集合所有动画数据到animation数组里面
        let animation = []
        for (let i = 0; i < animationX.length; i++) {
            animation[animation.length] = animationX[i];
            animation[animation.length] = animationY[i];
            animation[animation.length] = slX[i];
            animation[animation.length] = slY[i];
        }
        set = new AnimatorSet();
        //动画集合
        set.playTogether(animation);
        //动画执行时间
        set.setDuration(animation_time);
        set.start();
        //创建一个定时器 在动画执行完毕后 解除动画的占用
        setTimeout(function() {
            animation_state = false;
            menu_expand ? (menu_expand = false, w_menu.menu.attr("visibility", "gone"), w_menu.menu.setAlpha(1), w_menu.setSize(1, 1)) : menu_expand = true
        }, animation_time);
    }, 50);
}

//屏幕旋转处理
function getScreenDirection() {
    //屏幕宽高
    let _scrWidth = device.width;
    let _scrHeight = device.height - statusBarHeight;
    let X = 0;
    if (context.getResources().getConfiguration().orientation == 1) {
        screen_rotation = false
        device.width < device.height ? (scrWidth = _scrWidth, scrHeight = _scrHeight) : (scrWidth = _scrHeight, scrHeight = _scrWidth)
    } else {
        screen_rotation = true
        device.width > device.height ? (scrWidth = _scrWidth, scrHeight = _scrHeight) : (scrWidth = _scrHeight, scrHeight = _scrWidth)
    }
    btn_orientation ? X = scrWidth - dp2px(btn_win_h) + btn_logo_hide_px : X = 0 - btn_logo_hide_px
    setTimeout(function() {
        ui.run(() => {
            w_logo.setPosition(X, scrHeight * Y_percent)
            if (menu_expand) {
                animation_menu(w_menu.menu, true)
            }
        })
    }, 50);
}

//退出事件    关闭屏幕旋转监听广播
events.on('exit', function() {
    if (intent_CHANGED != null) {
        new ContextWrapper(context).unregisterReceiver(intent_CHANGED);
    }
});