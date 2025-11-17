cordova.define("onesignal-cordova-plugin.PushSubscriptionNamespace", function(require, exports, module) { "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PushSubscription = /** @class */ (function () {
    function PushSubscription() {
        this._subscriptionObserverList = [];
    }
    PushSubscription.prototype._processFunctionList = function (array, param) {
        for (var i = 0; i < array.length; i++) {
            array[i](param);
        }
    };
    /**
     * Sets initial Push Subscription properties and adds observer for changes
     */
    PushSubscription.prototype._setPropertiesAndObserver = function () {
        var _this = this;
        /**
         * Receive push Id
         * @param obj
         */
        var getIdCallback = function (obj) {
            _this._id = obj.value;
        };
        window.cordova.exec(getIdCallback, function () { }, "OneSignalPush", "getPushSubscriptionId");
        /**
         * Receive token
         * @param obj
         */
        var getTokenCallback = function (obj) {
            _this._token = obj.value;
        };
        window.cordova.exec(getTokenCallback, function () { }, "OneSignalPush", "getPushSubscriptionToken");
        /**
         * Receive opted-in status
         * @param obj
         */
        var getOptedInCallback = function (obj) {
            _this._optedIn = obj.value;
        };
        window.cordova.exec(getOptedInCallback, function () { }, "OneSignalPush", "getPushSubscriptionOptedIn");
        this.addEventListener("change", function (subscriptionChange) {
            _this._id = subscriptionChange.current.id;
            _this._token = subscriptionChange.current.token;
            _this._optedIn = subscriptionChange.current.optedIn;
        });
    };
    Object.defineProperty(PushSubscription.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PushSubscription.prototype, "token", {
        get: function () {
            return this._token;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PushSubscription.prototype, "optedIn", {
        /**
         * Gets a boolean value indicating whether the current user is opted in to push notifications.
         * This returns true when the app has notifications permission and optOut() is NOT called.
         * Note: Does not take into account the existence of the subscription ID and push token.
         * This boolean may return true but push notifications may still not be received by the user.
         */
        get: function () {
            return this._optedIn || false;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add a callback that fires when the OneSignal push subscription state changes.
     * @param  {(event: PushSubscriptionChangedState)=>void} listener
     * @returns void
     */
    PushSubscription.prototype.addEventListener = function (event, listener) {
        var _this = this;
        this._subscriptionObserverList.push(listener);
        var subscriptionCallBackProcessor = function (state) {
            _this._processFunctionList(_this._subscriptionObserverList, state);
        };
        window.cordova.exec(subscriptionCallBackProcessor, function () { }, "OneSignalPush", "addPushSubscriptionObserver", []);
    };
    /**
     * Remove a push subscription observer that has been previously added.
     * @param  {(event: PushSubscriptionChangedState)=>void} listener
     * @returns void
     */
    PushSubscription.prototype.removeEventListener = function (event, listener) {
        var index = this._subscriptionObserverList.indexOf(listener);
        if (index !== -1) {
            this._subscriptionObserverList.splice(index, 1);
        }
    };
    /**
     * Call this method to receive push notifications on the device or to resume receiving of push notifications after calling optOut. If needed, this method will prompt the user for push notifications permission.
     * @returns void
     */
    PushSubscription.prototype.optIn = function () {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "OptInPushSubscription");
    };
    /**
     * If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can call this method to opt out.
     * @returns void
     */
    PushSubscription.prototype.optOut = function () {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "optOutPushSubscription");
    };
    return PushSubscription;
}());
exports.default = PushSubscription;

});
