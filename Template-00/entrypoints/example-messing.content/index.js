import {sendMessage,onMessage} from "webext-bridge/content-script";

export default defineContentScript({
    matches: ['*://*.example.com/*'],
    async main() {

        setTimeout(async () => {
            console.log("【messing】[content]发送单向消息message1")
            await sendMessage('message1', {data: '来自content的消息'});
        },10000)
        try {
            // 发送消息，等待同步/异步回复
            const response = await sendMessage('ADD_NUMBERS', { a: 5, b: 3 }); //默认是发送给background
            console.log('[Content] 收到 Background 同步回复:', response);
        } catch (err) {
            console.error('[Content] 发送消息失败:', err);
        }
        onMessage('ADD_NUMBERS2', (data) => {
            console.log('【messing】[Content] 收到 Background 加法任务ADD_NUMBERS2:', data);
            const { a, b } = data;

            // 同步返回响应（也可以异步返回 Promise，按需选择）
            return {
                ok: true,
                result: a + b,
                message: 'Content 同步计算完成'
            };
        });
    },
});