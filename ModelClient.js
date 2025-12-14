function modelClient() {
    let storage = storages.create("AutoGLM-705237371@qq.com");

    function ModelResponse(thinking, action, raw_content) {
        this.thinking = thinking;
        this.action = action;
        this.raw_content = raw_content;
    }

    function ModelClient() {
        this.base_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
        this.api_key = storage.get("api_key");
        this.model_name = "autoglm-phone";
        this.max_tokens = 3000;
        this.temperature = 0;
        this.top_p = 0.85;
        this.frequency_penalty = 0.2;
        this.extra_body = null;
    }

    ModelClient.prototype.parseResponse = function(content) {
        if (content.includes("finish(message=")) {
            let index = content.indexOf("finish(message=");
            let thinking = content.substring(0, index).replace("</think>", "").trim();
            let action = content.substring(index);
            return [thinking, action];
        }

        if (content.includes("do(action=")) {
            let index = content.indexOf("do(action=");
            let thinking = content.substring(0, index).replace("</think>", "").trim();
            let action = content.substring(index);
            return [thinking, action];
        }

        if (content.includes("<answer>")) {
            let index = content.indexOf("<answer>");
            let thinking = content.substring(0, index)
                .replace(/<think>|<\/think>/g, "").trim();
            let action = content.substring(index + "<answer>".length)
                .replace("</answer>", "").trim();
            return [thinking, action];
        }

        return ["", content];
    }

    ModelClient.prototype.request = function(messages) {
        let res = http.post(this.base_url, {
            "messages": messages,
            "model": this.model_name,
            "max_tokens": this.max_tokens,
            "temperature": this.temperature,
            "top_p": this.top_p,
            "frequency_penalty": this.frequency_penalty,
            "extra_body": this.extra_body,
            "stream": false
        }, {
            headers: {
                "Authorization": "Bearer " + this.api_key,
            },
            contentType: "application/json"
        });
        //log(res.body.json())
        if (res.statusCode != 200) {
            console.error("Post请求失败:" + res.statusMessage + res.body.json());
            return null;
        }
        let raw_content = res.body.json().choices[0].message.content;
        let [thinking, action] = this.parseResponse(raw_content);
        return new ModelResponse(thinking, action, raw_content);
    }

    return new ModelClient();
}

module.exports = modelClient();