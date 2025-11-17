cordova.define("onesignal-cordova-plugin.NotificationsNamespace", function(require, exports, module) { "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSNotificationPermission = void 0;
var NotificationReceivedEvent_1 = require("./NotificationReceivedEvent");
var OSNotificationPermission;
(function (OSNotificationPermission) {
    OSNotificationPermission[OSNotificationPermission["NotDetermined"] = 0] = "NotDetermined";
    OSNotificationPermission[OSNotificationPermission["Denied"] = 1] = "Denied";
    OSNotificationPermission[OSNotificationPermission["Authorized"] = 2] = "Authorized";
    OSNotificationPermission[OSNotificationPermission["Provisional"] = 3] = "Provisional";
    OSNotificationPermission[OSNotificationPermission["Ephemeral"] = 4] = "Ephemeral";
})(OSNotificationPermission = exports.OSNotificationPermission || (exports.OSNotificationPermission = {}));
var Notifications = /** @class */ (function () {
    function Notifications() {
        this._permissionObserverList = [];
        this._notificationClickedListeners = [];
        this._notificationWillDisplayListeners = [];
    }
    Notifications.prototype._processFunctionList = function (array, param) {
        for (var i = 0; i < array.length; i++) {
            array[i](param);
        }
    };
    /**
     * Sets initial permission value and adds observer for changes
     */
    Notifications.prototype._setPropertyAndObserver = function () {
        var _this = this;
        var getPermissionCallback = function (obj) {
            _this._permission = obj.value;
        };
        window.cordova.exec(getPermissionCallback, function () { }, "OneSignalPush", "getPermissionInternal");
        this.addEventListener("permissionChange", function (result) {
            _this._permission = result;
        });
    };
    Notifications.prototype.hasPermission = function () {
        return this._permission || false;
    };
    /** iOS Only.
     * Returns the enum for the native permission of the device. It will be one of:
     * OSNotificationPermissionNotDetermined,
     * OSNotificationPermissionDenied,
     * OSNotificationPermissionAuthorized,
     * OSNotificationPermissionProvisional - only available in iOS 12,
     * OSNotificationPermissionEphemeral - only available in iOS 14
     *
     * @returns {Promise<OSNotificationPermission>}
     *
     * */
    Notifications.prototype.permissionNative = function () {
        return new Promise(function (resolve, reject) {
            window.cordova.exec(resolve, reject, "OneSignalPush", "permissionNative", []);
        });
    };
    /**
     * Prompt the user for permission to receive push notifications. This will display the native system prompt to request push notification permission.
     * Use the fallbackToSettings parameter to prompt to open the settings app if a user has already declined push permissions.
     *
     *
     * @param  {boolean} fallbackToSettings
     * @returns {Promise<boolean>}
     */
    Notifications.prototype.requestPermission = function (fallbackToSettings) {
        var fallback = fallbackToSettings !== null && fallbackToSettings !== void 0 ? fallbackToSettings : false;
        return new Promise(function (resolve, reject) {
            window.cordova.exec(resolve, reject, "OneSignalPush", "requestPermission", [fallback]);
        });
    };
    ;
    /**
     * Whether attempting to request notification permission will show a prompt. Returns true if the device has not been prompted for push notification permission already.
     * @returns {Promise<boolean>}
     */
    Notifications.prototype.canRequestPermission = function () {
        return new Promise(function (resolve, reject) {
            window.cordova.exec(resolve, reject, "OneSignalPush", "canRequestPermission", []);
        });
    };
    ;
    /**
     * iOS Only
     */
    /**
     * Instead of having to prompt the user for permission to send them push notifications, your app can request provisional authorization.
     *
     * For more information: https://documentation.onesignal.com/docs/ios-customizations#provisional-push-notifications
     *
     * @param  {(response: boolean)=>void} handler
     * @returns void
     */
    Notifications.prototype.registerForProvisionalAuthorization = function (handler) {
        window.cordova.exec(handler, function () { }, "OneSignalPush", "registerForProvisionalAuthorization", []);
    };
    ;
    /**
     * Add listeners for notification events.
     * @param event
     * @param listener
     * @returns
     */
    Notifications.prototype.addEventListener = function (event, listener) {
        var _this = this;
        if (event === "click") {
            this._notificationClickedListeners.push(listener);
            var clickParsingHandler = function (json) {
                _this._processFunctionList(_this._notificationClickedListeners, json);
            };
            window.cordova.exec(clickParsingHandler, function () { }, "OneSignalPush", "addNotificationClickListener", []);
        }
        else if (event === "foregroundWillDisplay") {
            this._notificationWillDisplayListeners.push(listener);
            var foregroundParsingHandler = function (notification) {
                _this._notificationWillDisplayListeners.forEach(function (listener) {
                    listener(new NotificationReceivedEvent_1.NotificationWillDisplayEvent(notification));
                });
                window.cordova.exec(function () { }, function () { }, "OneSignalPush", "proceedWithWillDisplay", [notification.notificationId]);
            };
            window.cordova.exec(foregroundParsingHandler, function () { }, "OneSignalPush", "addForegroundLifecycleListener", []);
        }
        else if (event === "permissionChange") {
            this._permissionObserverList.push(listener);
            var permissionCallBackProcessor = function (state) {
                _this._processFunctionList(_this._permissionObserverList, state);
            };
            window.cordova.exec(permissionCallBackProcessor, function () { }, "OneSignalPush", "addPermissionObserver", []);
        }
        else {
            return;
        }
    };
    /**
     * Remove listeners for notification events.
     * @param event
     * @param listener
     * @returns
     */
    Notifications.prototype.removeEventListener = function (event, listener) {
        if (event === "click") {
            var index = this._notificationClickedListeners.indexOf(listener);
            if (index !== -1) {
                this._notificationClickedListeners.splice(index, 1);
            }
        }
        else if (event === "foregroundWillDisplay") {
            var index = this._notificationWillDisplayListeners.indexOf(listener);
            if (index !== -1) {
                this._notificationWillDisplayListeners.splice(index, 1);
            }
        }
        else if (event === "permissionChange") {
            var index = this._permissionObserverList.indexOf(listener);
            if (index !== -1) {
                this._permissionObserverList.splice(index, 1);
            }
        }
        else {
            return;
        }
    };
    /**
     * Removes all OneSignal notifications.
     * @returns void
     */
    Notifications.prototype.clearAll = function () {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "clearAllNotifications", []);
    };
    ;
    /**
     * Android Only
     */
    /**
     * Android only.
     * Cancels a single OneSignal notification based on its Android notification integer ID. Use instead of Android's [android.app.NotificationManager.cancel], otherwise the notification will be restored when your app is restarted.
     * @param  {number} id - notification id to cancel
     * @returns void
     */
    Notifications.prototype.removeNotification = function (id) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "removeNotification", [id]);
    };
    ;
    /**
     * Android only.
     * Cancels a group of OneSignal notifications with the provided group key. Grouping notifications is a OneSignal concept, there is no [android.app.NotificationManager] equivalent.
     * @param  {string} id - notification group id to cancel
     * @returns void
     */
    Notifications.prototype.removeGroupedNotifications = function (id) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "removeGroupedNotifications", [id]);
    };
    ;
    return Notifications;
}());
exports.default = Notifications;

});
