import {showToast} from "../utils/ui/showToast.js";
import {init} from "./init.js";

export function initMessaging(){
    // 监听来自 Popup 的消息，触发会启动插件或是更新配置参数
    browser.runtime.onMessage.addListener(async (message) => {
        showToast("配置更新")
        //监听插件是否启用
        if (message.type === 'PLUGIN_TOGGLE') {
            await init()
        }
    });

    // ==============================================
// 监听来自 popup 的「打开消息」
// ==============================================
    browser.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
        if (msg.type === "POPUP_OPENED") {
            const currentWindow = await browser.windows.getCurrent();
            // const width = Math.max(currentWindow.width - 400, 300);
            // const height = Math.max(currentWindow.height - 300, 200);
            const width = Math.max(currentWindow.width - 400, 300);
            const height = Math.max(currentWindow.height - 300, 200);
            const left = Math.round((currentWindow.width - width) / 2);
            const top = Math.round((currentWindow.height - height) / 2);
            // 打开居中窗口
            await browser.windows.create({
                url: "/popup_true.html", // 你的 popup 页面 //这里需要是实际的popup.html，而不是/popup/index.html,不然会找不到
                type: "popup", // 无边栏窗口
                // type: "normal", // 无边栏窗口
                width,
                height,
                left,
                top,
            });
        }
    });
}

