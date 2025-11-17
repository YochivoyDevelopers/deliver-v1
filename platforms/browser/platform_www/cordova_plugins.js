cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
        "id": "cordova-plugin-statusbar.statusbar",
        "pluginId": "cordova-plugin-statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "file": "plugins/cordova-plugin-statusbar/src/browser/StatusBarProxy.js",
        "id": "cordova-plugin-statusbar.StatusBarProxy",
        "pluginId": "cordova-plugin-statusbar",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-device/www/device.js",
        "id": "cordova-plugin-device.device",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/cordova-plugin-device/src/browser/DeviceProxy.js",
        "id": "cordova-plugin-device.DeviceProxy",
        "pluginId": "cordova-plugin-device",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "pluginId": "cordova-plugin-splashscreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/cordova-plugin-splashscreen/src/browser/SplashScreenProxy.js",
        "id": "cordova-plugin-splashscreen.SplashScreenProxy",
        "pluginId": "cordova-plugin-splashscreen",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-ionic-webview/src/www/util.js",
        "id": "cordova-plugin-ionic-webview.IonicWebView",
        "pluginId": "cordova-plugin-ionic-webview",
        "clobbers": [
            "Ionic.WebView"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
        "id": "cordova-plugin-camera.Camera",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "Camera"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/CameraPopoverOptions.js",
        "id": "cordova-plugin-camera.CameraPopoverOptions",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "CameraPopoverOptions"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/Camera.js",
        "id": "cordova-plugin-camera.camera",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "navigator.camera"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/src/browser/CameraProxy.js",
        "id": "cordova-plugin-camera.CameraProxy",
        "pluginId": "cordova-plugin-camera",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-nativeaudio/www/nativeaudio-browser.js",
        "id": "cordova-plugin-nativeaudio.NativeAudioBrowser",
        "pluginId": "cordova-plugin-nativeaudio",
        "clobbers": [
            "cordova.plugins.NativeAudio",
            "plugins.NativeAudio"
        ]
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/index.js",
        "id": "onesignal-cordova-plugin.OneSignalPlugin",
        "pluginId": "onesignal-cordova-plugin",
        "clobbers": [
            "OneSignal"
        ]
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/NotificationReceivedEvent.js",
        "id": "onesignal-cordova-plugin.NotificationReceivedEvent",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/OSNotification.js",
        "id": "onesignal-cordova-plugin.OSNotification",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/UserNamespace.js",
        "id": "onesignal-cordova-plugin.UserNamespace",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/PushSubscriptionNamespace.js",
        "id": "onesignal-cordova-plugin.PushSubscriptionNamespace",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/DebugNamespace.js",
        "id": "onesignal-cordova-plugin.DebugNamespace",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/InAppMessagesNamespace.js",
        "id": "onesignal-cordova-plugin.InAppMessagesNamespace",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/SessionNamespace.js",
        "id": "onesignal-cordova-plugin.SessionNamespace",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/LocationNamespace.js",
        "id": "onesignal-cordova-plugin.LocationNamespace",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/NotificationsNamespace.js",
        "id": "onesignal-cordova-plugin.NotificationsNamespace",
        "pluginId": "onesignal-cordova-plugin"
    },
    {
        "file": "plugins/onesignal-cordova-plugin/dist/LiveActivitiesNamespace.js",
        "id": "onesignal-cordova-plugin.LiveActivitiesNamespace",
        "pluginId": "onesignal-cordova-plugin"
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-statusbar": "2.4.2",
    "cordova-plugin-device": "2.0.2",
    "cordova-plugin-splashscreen": "5.0.2",
    "cordova-plugin-ionic-webview": "4.2.1",
    "cordova-plugin-ionic-keyboard": "2.2.0",
    "cordova-plugin-geolocation": "4.0.2",
    "cordova-plugin-camera": "4.1.0",
    "cordova-plugin-nativeaudio": "3.0.9",
    "onesignal-cordova-plugin": "5.0.0",
    "cordova-plugin-androidx-adapter": "1.1.3"
}
// BOTTOM OF METADATA
});