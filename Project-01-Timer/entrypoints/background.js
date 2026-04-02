import {addCountdownTask} from "../core/taskService.js";
import {initMessaging} from "../core/messaging.js";
import {appState} from "../core/config.js";

export default defineBackground(async () => {
    console.log('Background script started', {id: browser?.runtime?.id});
    initMessaging() //初始化所有监听
    appState.reminderTasks = await appState.reminderTasksStorage.getValue() //初始化数据

    // (1) 添加一个25分钟倒计时,查看是否存储,应该是popup页面添加，现在模拟。
    await addCountdownTask('专注工作', 25 * 60)
    // (2) 添加之后需要通知background遍历并更新最近的setTimeout,接触会触发提醒，并再次遍历找下一个setTimeout就不用每秒轮询。
    // (3) 找到之后，启动setTimeout，写回调函数，触发后发送提示弹窗，然后修改数据等，//这里需要补充方法函数。
    //

    // 3. 启动任务调度系统
    scheduleNextTask();
    // 模拟：添加一个25分钟倒计时（实际应该由 popup 调用）
    await addCountdownTask('专注工作', 25 * 60);
    // 添加后自动重新调度 ↓↓↓
    scheduleNextTask();

    /**
     * 【核心】调度：找到最近要触发的任务，设置 setTimeout
     * 每次任务增删改、触发完成，都调用一次
     */
    let currentTimeoutId=null
    function scheduleNextTask() {
        // 清除上一个定时器
        if (currentTimeoutId) {
            clearTimeout(currentTimeoutId);
            currentTimeoutId = null;
        }

        // 1. 找到最近即将触发的任务
        const nearestTask = getNearestTriggerTask();
        if (!nearestTask) {
            console.log("✅ 暂无待执行任务");
            return;
        }

        // 2. 计算还有多少毫秒触发
        const nowTs = now();
        const triggerTime = getTaskTriggerTime(nearestTask);
        const delayMs = Math.max(0, triggerTime - nowTs);

        console.log(`⏱ 即将执行任务: ${nearestTask.name}`, `等待 ${(delayMs / 1000).toFixed(1)}s`);

        // 3. 设置定时器
        currentTimeoutId = setTimeout(async () => {
            // 时间到！执行任务触发逻辑
            await handleTaskTrigger(nearestTask);
            // 执行完，立刻调度下一个
            scheduleNextTask();
        }, delayMs);
    }


    function startCountdown(DELAY_SECONDS) {
        console.log(`⏱ 倒计时开始：${DELAY_SECONDS} 秒后提醒`);
        setTimeout(() => {
            console.log('✅ 时间到！弹出桌面通知');
            showNotification(DELAY_SECONDS, "shaaaa");
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
