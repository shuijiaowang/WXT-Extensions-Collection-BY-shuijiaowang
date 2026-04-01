import { storage } from "#imports";

export default defineBackground(() => {
    console.log('Background script started', { id: browser?.runtime?.id});

    browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        console.log('收到消息：', msg);

        // 根据 action 做不同逻辑
        if (msg.action === 'hello') {
            // 处理业务...
            sendResponse({ ok: true, data: '后台已收到消息' });
            const DELAY_SECONDS = 5;
            startCountdown(DELAY_SECONDS);
        }
    });
    function startCountdown(DELAY_SECONDS) {
        console.log(`⏱ 倒计时开始：${DELAY_SECONDS} 秒后提醒`);
        setTimeout(() => {
            console.log('✅ 时间到！弹出桌面通知');
            showNotification(DELAY_SECONDS,"shaaaa");
        }, DELAY_SECONDS * 1000);
    }

    function showNotification(DELAY_SECONDS) {
        const notifyApi = browser?.notifications;
        if (!notifyApi) {
            console.warn("❌ notifications API 不可用");
            return;
        }
        notifyApi.create({
            type: "basic", //有用
            // type: "image", //无用
            // type: "list", //有用
            // type: "progress", //有用
            title: "WXT 提醒 · 时间到！",
            message: `后台倒计时完成（${DELAY_SECONDS} 秒）`,
            iconUrl: "https://picsum.photos/64",
            requireInteraction: true, //是否需要用户点击关闭
            silent: false, //是否静音
            priority: 0, //优先级
        });
    }

});

// 存储
const counter = storage.defineItem('local:counter', {
    fallback: 0,
});