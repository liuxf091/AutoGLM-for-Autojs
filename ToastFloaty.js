function toastFloaty() {
    function ToastFloaty() {
        this.win = null;
        this.showing = false;
        this.timer = null;
        this.aDuration = 300;
    }

    ToastFloaty.prototype.init = function() {
        this.win = floaty.rawWindow(
            <frame id="root" w="{{device.width}}px">
                    <card w="auto" layout_gravity="center" cardCornerRadius="6" cardBackgroundColor="#BB000000" cardElevation="0dp">
                        <horizontal w="auto"  gravity="center">
                            <text id="message" text="" textSize="16sp" textColor="#FFFFFF" gravity="center" padding="10 2"/>
                        </horizontal>
                    </card>
                </frame>
        );
        this.win.root.setAlpha(0);
        this.win.setPosition(0, Math.floor(device.height / 4 * 3));
        this.win.setTouchable(false);
        return this;
    }

    ToastFloaty.prototype.show = function(message, duration) {
        duration = duration || 2000;

        ui.run(() => {
            if (this.showing) {
                this.win.root.setAlpha(0);
                clearTimeout(this.timer);
            }

            this.showing = true;
            this.setText(message);
            this.fadeIn();

            // 延时关闭窗口
            this.timer = setTimeout(() => {
                this.showing = false;
                this.fadeOut();
            }, duration);
        })
    }

    ToastFloaty.prototype.setText = function(text) {
        this.win.message.setText(text);
    }

    ToastFloaty.prototype.fadeIn = function() {
        let animation = new android.view.animation.AlphaAnimation(0, 1);
        animation.setDuration(this.aDuration);
        this.win.root.startAnimation(animation);
        this.win.root.setAlpha(1);
    }

    ToastFloaty.prototype.fadeOut = function() {
        let animation = new android.view.animation.AlphaAnimation(1, 0);
        animation.setDuration(this.aDuration);
        this.win.root.startAnimation(animation);
        setTimeout(() => {
            this.win.root.setAlpha(0);
        }, this.aDuration - 10);
    }

    return new ToastFloaty().init();
}

module.exports = toastFloaty();