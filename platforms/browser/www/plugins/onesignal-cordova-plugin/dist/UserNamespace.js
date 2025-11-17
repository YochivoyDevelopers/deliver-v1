cordova.define("onesignal-cordova-plugin.UserNamespace", function(require, exports, module) { "use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var PushSubscriptionNamespace_1 = __importDefault(require("./PushSubscriptionNamespace"));
var User = /** @class */ (function () {
    function User() {
        // The push subscription associated to the current user.
        this.pushSubscription = new PushSubscriptionNamespace_1.default();
    }
    /**
     * Explicitly set a 2-character language code for the user.
     * @param  {string} language
     * @returns void
     */
    User.prototype.setLanguage = function (language) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "setLanguage", [language]);
    };
    ;
    /**
     * Aliases
     */
    /**
     * Set an alias for the current user. If this alias label already exists on this user, it will be overwritten with the new alias id.
     * @param  {string} label
     * @param  {string} id
     * @returns void
     */
    User.prototype.addAlias = function (label, id) {
        var _a;
        var jsonKeyValue = (_a = {}, _a[label] = id, _a);
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "addAliases", [jsonKeyValue]);
    };
    ;
    /**
     * Set aliases for the current user. If any alias already exists, it will be overwritten to the new values.
     * @param {object} aliases
     * @returns void
     */
    User.prototype.addAliases = function (aliases) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "addAliases", [aliases]);
    };
    ;
    /**
     * Remove an alias from the current user.
     * @param  {string} label
     * @returns void
     */
    User.prototype.removeAlias = function (label) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "removeAliases", [label]);
    };
    ;
    /**
     * Remove aliases from the current user.
     * @param  {string[]} labels
     * @returns void
     */
    User.prototype.removeAliases = function (labels) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "removeAliases", labels);
    };
    ;
    /**
     * Email
     */
    /**
     * Add a new email subscription to the current user.
     * @param  {string} email
     * @returns void
     */
    User.prototype.addEmail = function (email) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "addEmail", [email]);
    };
    ;
    /**
     * Remove an email subscription from the current user. Returns false if the specified email does not exist on the user within the SDK, and no request will be made.
     * @param {string} email
     * @returns void
     */
    User.prototype.removeEmail = function (email) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "removeEmail", [email]);
    };
    ;
    /**
     * SMS
     */
    /**
     * Add a new SMS subscription to the current user.
     * @param  {string} smsNumber
     * @returns void
     */
    User.prototype.addSms = function (smsNumber) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "addSms", [smsNumber]);
    };
    ;
    /**
     * Remove an SMS subscription from the current user. Returns false if the specified SMS number does not exist on the user within the SDK, and no request will be made.
     * @param {string} smsNumber
     * @returns void
     */
    User.prototype.removeSms = function (smsNumber) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "removeSms", [smsNumber]);
    };
    ;
    /**
     * Tags
     */
    /**
     * Add a tag for the current user. Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here.
     * @param  {string} key
     * @param  {string} value
     * @returns void
     */
    User.prototype.addTag = function (key, value) {
        var _a;
        var jsonKeyValue = (_a = {}, _a[key] = value, _a);
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "addTags", [jsonKeyValue]);
    };
    ;
    /**
     * Add multiple tags for the current user. Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here.
     * @param  {object} tags
     * @returns void
     */
    User.prototype.addTags = function (tags) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "addTags", [tags]);
    };
    ;
    /**
     * Remove the data tag with the provided key from the current user.
     * @param  {string} key
     * @returns void
     */
    User.prototype.removeTag = function (key) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "removeTags", [key]);
    };
    ;
    /**
     * Remove multiple tags with the provided keys from the current user.
     * @param  {string[]} keys
     * @returns void
     */
    User.prototype.removeTags = function (keys) {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "removeTags", keys);
    };
    ;
    return User;
}());
exports.default = User;

});
