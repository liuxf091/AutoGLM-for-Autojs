function messageBuilder() {
    function MessageBuilder() {}

    MessageBuilder.prototype.createSystemMessage = function(content) {
        return {
            role: "system",
            content: content
        }
    }

    MessageBuilder.prototype.createUserMessage = function(text, imageBase64) {
        let content = [];

        if (imageBase64) {
            content.push({
                type: "image_url",
                image_url: {
                    url: `data:image/png;base64,${imageBase64}`
                }
            })
        }

        content.push({
            type: "text",
            text: text
        });

        return {
            role: "user",
            content: content
        };
    }

    MessageBuilder.prototype.createAssistantMessage = function(content) {
        return {
            role: "assistant",
            content: content
        }
    }

    MessageBuilder.prototype.removeImagesFromMessage = function(message) {
        if (Array.isArray(message.content)) {
            for (item of message.content) {
                if (item.type == "text") {
                    message.content = [{
                        type: "text",
                        text: item.text
                    }];
                    break;
                }
            }
        }
        return message;
    }

    MessageBuilder.prototype.buildScreenInfo = function(currentApp) {
        let info = {
            current_app: currentApp
        };

        for (let i = 1; i < arguments.length; i++) {
            let extra = arguments[i];

            if (extra && typeof extra === 'object') {
                for (let key in extra) {
                    if (extra.hasOwnProperty(key)) {
                        info[key] = extra[key];
                    }
                }
            }
        }

        return JSON.stringify(info);
    }

    return new MessageBuilder();
}

module.exports = messageBuilder();