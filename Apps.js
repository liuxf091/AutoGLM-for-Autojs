function apps() {
    function Apps() {
        this.appNameMap = new Map();
        this.packageNameMap = new Map();
    }

    Apps.prototype.init = function() {
        let obj = JSON.parse(files.read("./apps.json"));

        for (let [key, value] of Object.entries(obj)) {
            this.packageNameMap.set(value, key);
            this.appNameMap.set(key, value);
        }

        return this;
    }

    Apps.prototype.getAppName = function(packageName) {
        return this.packageNameMap.get(packageName);
    }
    
    Apps.prototype.getPackageName = function(appName) {
        return this.appNameMap.get(appName);
    }

    return new Apps().init();
}

module.exports = apps();