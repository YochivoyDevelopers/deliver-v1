cordova.define("onesignal-cordova-plugin.LiveActivitiesNamespace", function(require, exports, module) { "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LiveActivities = /** @class */ (function () {
    function LiveActivities() {
    }
    /**
     * Enter a live activity
     * @param  {string} activityId
     * @param  {string} token
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
    LiveActivities.prototype.enter = function (activityId, token, onSuccess, onFailure) {
        if (onSuccess == null) {
            onSuccess = function () { };
        }
        if (onFailure == null) {
            onFailure = function () { };
        }
        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "enterLiveActivity", [activityId, token]);
    };
    ;
    /**
     * Exit a live activity
     * @param  {string} activityId
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
    LiveActivities.prototype.exit = function (activityId, onSuccess, onFailure) {
        if (onSuccess == null) {
            onSuccess = function () { };
        }
        if (onFailure == null) {
            onFailure = function () { };
        }
        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "exitLiveActivity", [activityId]);
    };
    ;
    return LiveActivities;
}());
exports.default = LiveActivities;

});
