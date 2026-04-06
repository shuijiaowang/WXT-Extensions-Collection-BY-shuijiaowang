import {init} from "@/core/init.js";

export function initMessaging() {

    browser.runtime.onMessage.addListener(async (msg) => {
        if (msg.type === 'change') {
            await init()
        }
    });

// 监听来自 popup 的「打开消息」
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

    // 监听 Popup 连接（自动处理，不用改）
    browser.runtime.onConnect.addListener(port => {
        if (port.name === "popup") popupPort = port;
        port.onDisconnect.addListener(() => popupPort = null);
    });

    // setInterval(() => {
    //     // 自动判断：Popup打开就发，关闭就跳过，无报错
    //     popupPort?.postMessage({
    //         type: "BACKGROUND_TO_POPUP",
    //         data: "后台主动发送的消息"
    //     });
    // }, 1000);
}
// 存储 Popup 连接（自动管理，无需手动操作）
let popupPort = null;
export const notifyPopup = async () => {
    popupPort?.postMessage({
        type: "change",
    });
};

