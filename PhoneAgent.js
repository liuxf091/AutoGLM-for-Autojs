function phoneAgent() {
    let MessageBuilder = require("./MessageBuilder.js");
    let ActionHandler = require("./ActionHandler.js");

    function AgentConfig() {
        this.max_steps = 100;
        this.system_prompt = null;
        this.verbose = true;
    }

    AgentConfig.prototype.init = function() {
        if (this.system_prompt == null) {
            this.system_prompt = this.getSystemPrompt();
        }
        return this;
    }

    AgentConfig.prototype.getSystemPrompt = function() {
        return require("./SystemPrompt.js").getSystemPrompt();
    }

    function StepResult(success, finished, action, thinking, message) {
        this.success = success;
        this.finished = finished;
        this.action = action;
        this.thinking = thinking;
        this.message = message;
    }

    function PhoneAgent(confirmation_callback, takeover_callback) {
        if (!confirmation_callback || !takeover_callback) {
            console.error("PhoneAgent constructor requires callbacks!");
            exit();
        }
        this.model_client = require("./ModelClient.js");
        this.agent_config = new AgentConfig().init();
        this.context = [];
        this.step_count = 0;
        this.actionHandler = new ActionHandler(confirmation_callback, takeover_callback);
    }

    PhoneAgent.prototype.run = function(command) {
        this.context = [];
        this.step_count = 0;

        let result = this.executeStep(command, true);

        if (result.finished) {
            return result.message || "Task completed";
        }

        while (this.step_count < this.agent_config.max_steps) {
            result = this.executeStep(null, false);
            if (result.finished) {
                return result.message || "Task completed";
            }
        }

        return "Max steps reached";
    }

    PhoneAgent.prototype.reset = function() {
        this.context = [];
        this.step_count = 0;
    }

    PhoneAgent.prototype.executeStep = function(command, is_first) {
        this.step_count++;

        let screenshot = captureScreen();
        let current_app = app.getAppName(currentPackage());
        let screen_info = MessageBuilder.buildScreenInfo(current_app);
        let text_content = "";
        if (is_first) {
            this.context.push(MessageBuilder.createSystemMessage(this.agent_config.system_prompt));
            text_content = `${command}\n\n${screen_info}`;
        } else {
            text_content = `** Screen Info **\n\n${screen_info}`;
        }
        this.context.push(MessageBuilder.createUserMessage(text_content, images.toBase64(screenshot)));

        let response;
        try {
            response = this.model_client.request(this.context);
        } catch (e) {
            return new StepResult(false, true, null, "", "Model request error: " + e);
        }

        let action;
        try {
            action = this.actionHandler.parseAction(response.action);
        } catch (e) {
            action = this.actionHandler.finish(response.action);
        }

        if (this.agent_config.verbose) {
            console.log(`
==============================
💭 思考过程
------------------------------
${response.thinking}
------------------------------
🎯 执行动作
${JSON.stringify(action)}
==============================
            `)
            toast(JSON.stringify(action));
        }

        this.context[this.context.length - 1] = MessageBuilder.removeImagesFromMessage(this.context[this.context.length - 1]);

        let result;
        try {
            result = this.actionHandler.execute.bind(this.actionHandler)(action, screenshot.getWidth(), screenshot.getHeight());
            sleep(1000);
        } catch (e) {
            console.error("ActionHandler execute failed: " + e);
            result = this.actionHandler.execute(this.actionHandler.finish(e.toString()), screenshot.getWidth(), screenshot.getHeight());
        }

        this.context.push(MessageBuilder.createAssistantMessage(`<think>${response.thinking}</think><answer>${response.action}</answer>`));

        let finished = action.metadata == "finish" || result.should_finish;

        if (finished && this.agent_config.verbose) {
            console.log(`
🎉============================
任务完成:${result.message||(action.message||"完成")}
==============================
            `)
            toast("任务完成");
        }

        return new StepResult(
            result.success,
            finished,
            action,
            response.thinking,
            result.message || action.message
        )
    }

    return PhoneAgent;
}

module.exports = phoneAgent();