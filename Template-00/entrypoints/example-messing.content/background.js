import {onMessage, sendMessage} from "webext-bridge/background";

export async function ExampleMessingBackground() {

    console.log("exampleMessingBackground初始化成功")
    onMessage('message1', async (data) => {
        console.log('【messaging】[Background] 收到单向消息message1:', data.data); // 输出：{ data: '来自content的消息' }
        console.log('【messaging】[Background] 消息发送方信息message1:', data.sender); // 包含 tab、id 等信息，替代原生的 sender 参数 //这个值为空
        try {
            // 1. 获取目标标签页
            const [tab] = await browser.tabs.query({url:"https://www.example.com/"});
            if (!tab.id) return;
            console.log("tab",tab)

            console.log('【messaging】[Background]主动 向 Content 发送任务ADD_NUMBERS2...');
            // 步骤 2：用 sendMessage 发送消息，指定 tabId，await 等待回复（核心简化）
            const response = await sendMessage(
                'ADD_NUMBERS2', // 动作标识（和 Content 监听的一致）
                {
                    a: Math.floor(Math.random() * 100),
                    b: Math.floor(Math.random() * 100)

                }, // 消息数据（对应原生的 payload）
                {
                    tabId: tab.id,
                    context: "content-script" //background|devtools|popup|options|content-script|window
                } // 关键：指定发送给该 tab 的 Content 脚本（替代原生的 tabs.sendMessage）
            );
            // 3. 成功收到回复
            console.log('【messaging】[Background] 收到 Content 回复:', response);
        } catch (err) {
            // 4. 捕获所有错误（获取 tab 失败、发送消息失败、Content 没回复等）
            console.error('【messaging】[Background] 发送消息失败:', err);
        }
    });
    onMessage('ADD_NUMBERS', async (data, sender) => {
        console.log('【messaging】[Background] 收到双向消息:', data); // 输出：{ a: 5, b: 3 }
        const {a, b} = data.data;
        const sum = a + b;

        // 同步返回响应数据（直接 return，无需 resolve，无需 return true）
        return {
            ok: true,
            result: sum,
            message: '加法计算完成（同步返回）'
        };
    });
}

export default ExampleMessingBackground;