function actionHandler() {
    let Apps = require("./Apps.js");

    function ActionResult(success, should_finish, message) {
        this.success = success;
        this.should_finish = should_finish;
        this.message = message;
        this.requires_confirmation = false;
    }

    function ActionHandler(confirmation_callback, takeover_callback) {
        this.confirmation_callback = confirmation_callback;
        this.takeover_callback = takeover_callback;
    }

    ActionHandler.prototype.parseAction = function(command) {
        try {
            command = command.trim();

            // 初始化结果对象
            let action = {};

            if (command.startsWith('do(') && command.endsWith(')')) {
                action.metadata = 'do';

                // 提取括号内的内容
                let content = command.slice(3, -1).trim();

                // 使用正则匹配所有参数键值对，支持字符串和数组格式
                let paramRegex = /([a-z_]+)=(\[.*?\]|"[^"]*"|[^,]+)(?=\s*,|\s*$)/gi;
                let match;
                while ((match = paramRegex.exec(content)) !== null) {
                    let key = match[1].trim();
                    let value = match[2].trim();

                    if (value.startsWith('"') && value.endsWith('"')) {
                        // 字符串值，去除引号
                        value = value.slice(1, -1);
                    } else if (value.startsWith('[') && value.endsWith(']')) {
                        // 数组值，如 [x,y]，转换为数字数组
                        value = value.slice(1, -1).split(',').map(coord => parseInt(coord.trim()));
                    }

                    // 添加到结果对象
                    action[key] = value;
                }
            } else if (command.startsWith('finish(') && command.endsWith(')')) {
                action.metadata = 'finish';

                // 提取括号内的内容
                let content = command.slice(7, -1).trim();

                // 假设格式为 message="xxx"
                let match = content.match(/message="([^"]*)"/);
                if (match) {
                    action.message = match[1];
                }
            }

            return action;
        } catch (e) {
            throw ("ParseAction failed: " + e);
        }
    }

    ActionHandler.prototype.execute = function(action, screen_width, screen_height) {
        let action_type = action.metadata;

        if (action_type == "finish") {
            return new ActionResult(true, true, action.message);
        }

        if (action_type != "do") {
            return new ActionResult(false, true, "Unknown action type: " + action_type);
        }

        let action_name = action.action;

        let handler_method = this.getHandler(action_name);

        if (handler_method == null) {
            return new ActionResult(false, false, "Unknown action: " + action_name);
        }

        try {
            return handler_method(action, screen_width, screen_height);
        } catch (e) {
            return new ActionResult(false, false, "Action failed: " + e);
        }
    }

    ActionHandler.prototype.getHandler = function(action_name) {
        switch (action_name) {
            case "Launch":
                return this.handleLaunch;
            case "Tap":
                return this.handleTap.bind(this);
            case "Type":
                return this.handleType;
            case "Type_Name":
                return this.handleType;
            case "Swipe":
                return this.handleSwipe.bind(this);
            case "Back":
                return this.handleBack;
            case "Home":
                return this.handleHome;
            case "Double Tap":
                return this.handleDoubleTap.bind(this);
            case "Long Press":
                return this.handleLongPress.bind(this);
            case "Wait":
                return this.handleWait;
            case "Take_over":
                return this.handleTakeover.bind(this);
            case "Note":
                return this.handleNote.bind(this);
            case "Call_API":
                return this.handleCallApi.bind(this);
            case "Interact":
                return this.handleInteract.bind(this);
            default:
                return null;
        }
    }

    ActionHandler.prototype.relative2Absolute = function(element, screen_width, screen_height) {
        //console.log(`原始坐标是${element}`)
        let x = Math.floor(element[0] / 1000 * screen_width);
        let y = Math.floor(element[1] / 1000 * screen_height);
        //console.log(`转换后坐标是[${x},${y}]`)
        return [x, y];
    }

    ActionHandler.prototype.handleLaunch = function(action, width, height) {
        let app_name = action.app;

        if (!app_name) {
            return new ActionResult(false, false, "No app name specified");
        }

        if (app.launchApp(app_name)) {
            return new ActionResult(true, false);
        }

        let packageName = Apps.getPackageName(app_name);
        if (packageName && app.launch(packageName)) {
            return new ActionResult(true, false);
        }

        return new ActionResult(false, false, "App not found: " + app_name);
    }

    ActionHandler.prototype.handleTap = function(action, width, height) {
        let element = action.element;
        //console.log("1:", element[0], element[1])
        if (!element) {
            return new ActionResult(false, false, "No element coordinates");
        }
        let [x, y] = this.relative2Absolute(element, width, height);

        if (action.message) {
            if (!this.confirmation_callback(action.message)) {
                return new ActionResult(false, true, "User cancelled sensitive operation");
            }
        }

        click(x, y);
        sleep(100);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleDoubleTap = function(action, width, height) {
        let element = action.element;

        if (!element) {
            return new ActionResult(false, false, "No element coordinates");
        }

        let [x, y] = this.relative2Absolute(element, width, height);

        if (action.message) {
            if (!this.confirmation_callback(action.message)) {
                return new ActionResult(false, true, "User cancelled sensitive operation");
            }
        }

        click(x, y);
        sleep(100);
        click(x, y);
        sleep(100);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleType = function(action, width, height) {
        let text = action.text || "";
        setClip(text);
        setText(text);
        sleep(100);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleSwipe = function(action, width, height) {
        let start = action.start;
        let end = action.end;

        if (!start || !end) {
            return new ActionResult(false, false, "Missing swipe coordinates");
        }

        let [start_x, start_y] = this.relative2Absolute(start, width, height);
        let [end_x, end_y] = this.relative2Absolute(end, width, height);

        swipe(start_x, start_y, end_x, end_y, 300);
        sleep(100);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleBack = function() {
        back();
        sleep(100);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleHome = function() {
        home();
        sleep(100);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleLongPress = function(action, width, height) {
        let element = action.element;

        if (!element) {
            return new ActionResult(false, false, "No element coordinates");
        }

        let [x, y] = this.relative2Absolute(element, width, height);

        if (action.message) {
            if (!this.confirmation_callback(action.message)) {
                return new ActionResult(false, true, "User cancelled sensitive operation");
            }
        }

        longClick(x, y);
        sleep(100);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleWait = function(action, width, height) {
        let duration_str = action.duration;
        let duration;
        try {
            duration = Math.floor(parseFloat(duration_str.replace("seconds", "").trim()) * 1000);
        } catch (e) {
            console.error("ParseDuration error");
            duration = 1000;
        }
        sleep(duration);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleTakeover = function(action, width, height) {
        let message = action.message || "User intervention required";
        this.takeover_callback(message);
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleNote = function() {
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleCallApi = function() {
        return new ActionResult(true, false);
    }

    ActionHandler.prototype.handleInteract = function() {
        return new ActionResult(true, false, "User interaction required");
    }

    ActionHandler.prototype.finish = function(message) {
        return {
            metadata: "finish",
            message: message
        }
    }

    return ActionHandler;
}

module.exports = actionHandler();